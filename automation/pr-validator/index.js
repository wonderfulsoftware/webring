// @ts-check

require("make-promises-safe")
require("dotenv").config()

const { Octokit } = require("@octokit/rest")
const { default: axios } = require("axios")
const { escape } = require("lodash")
const Minio = require("minio")
const crypto = require("crypto")

// Use environment variable with default to localhost
const siteFetcherInstanceBase =
  process.env.SITE_FETCHER_INSTANCE_BASE || "http://localhost:3000"

;(async () => {
  const url = process.argv[2]
  console.log("Loading site info...")
  const fetchResult = await fetchSiteInfo(url)
  console.log("Persisting screenshot...")
  
  // Convert base64 content to buffer
  if (!fetchResult.content) {
    throw new Error('Screenshot content not found in fetch result')
  }
  
  // Remove potential data URL prefix and decode base64
  const base64Data = fetchResult.content.replace(/^data:image\/png;base64,/, '')
  const imageBuffer = Buffer.from(base64Data, 'base64')
  
  const persistentScreenshotUrl = await persistScreenshot(imageBuffer)
  const text = generateCommentText(fetchResult, persistentScreenshotUrl)
  console.log("Posting comment...")
  const commentResult = await createOrUpdateGitHubComment(text)
  console.log(commentResult.data.html_url)
})()

/**
 * @param {string} url
 */
async function fetchSiteInfo(url) {
  const siteFetchingResponse = await axios.get(siteFetcherInstanceBase, {
    params: {
      url: url,
      key: process.env.SITE_FETCHER_API_KEY,
      as: "json",
    },
  })
  const fetchResult = siteFetchingResponse.data
  return fetchResult
}

/**
 * @param {Buffer} imageBuffer
 */
async function persistScreenshot(imageBuffer) {
  // Create an MD5 hash of the buffer content for the file name
  const md5Hash = crypto
    .createHash("md5")
    .update(imageBuffer)
    .digest("hex")
    
  const objectKey = `pr-reviews/${md5Hash}.png`
  
  // Initialize Minio client
  const minioClient = new Minio.Client({
    endPoint: 's3.inspace.cloud',
    port: 443,
    useSSL: true,
    accessKey: 'PGR3DU5RPHDF8L8GGIH6',
    secretKey: process.env.SK_PGR3DU5RPHDF8L8GGIH6
  })
  
  // Upload to S3 with public-read permission
  const metaData = {
    'Content-Type': 'image/png',
    'x-amz-acl': 'public-read'
  }
  
  await minioClient.putObject('webring', objectKey, imageBuffer, metaData)
  
  const persistentScreenshotUrl = `https://s3.inspace.cloud/webring/${objectKey}`
  return persistentScreenshotUrl
}

/**
 * @param {{ backlink: { href: string; }; description: string; }} fetchResult
 * @param {string} persistentScreenshotUrl
 */
function generateCommentText(fetchResult, persistentScreenshotUrl) {
  const lines = []
  lines.push("## PR validation result", "", "**Backlink:**")

  if (!fetchResult.backlink) {
    lines.push("- ❌ No backlink found.")
  } else if (fetchResult.backlink.href.includes("#/")) {
    const domain = fetchResult.backlink.href.split("#")[1]
    const before = `#${domain}`
    const after = `#${domain.slice(1)}`
    lines.push(
      `- ⚠ Found backlink, however, please change \`${before}\` to just \`#${after}\` for correct linking.`,
    )
  } else if (fetchResult.backlink.href.match(/YOUR\.DOMAIN/i)) {
    lines.push(
      `- ⚠ Found backlink, however, please change \`YOUR.DOMAIN\` to your actual domain for correct linking.`,
    )
  } else {
    lines.push(`- ✅ Found backlink to ${fetchResult.backlink.href}.`)
  }
  lines.push("", "**Site description:**")
  if (!fetchResult.description) {
    lines.push(
      '- ℹ No site description found. Consider adding `<meta property="og:description">` or `<meta name="description">` to your website to site description show up on the webring page.',
    )
  } else {
    lines.push(`- ✅ ${escape(fetchResult.description)}`)
  }
  lines.push("", "**Screenshot:**", "- ![](" + persistentScreenshotUrl + ")")
  const text = lines.join("\n")
  return text
}

/**
 * @param {string} text
 */
async function createOrUpdateGitHubComment(text) {
  const gh = new Octokit({
    auth: process.env.BOT_GH_TOKEN,
  })
  const issue = {
    owner: "wonderfulsoftware",
    repo: "webring",
    issue_number: +process.argv[3],
  }
  const { data: comments } = await gh.issues.listComments({ ...issue })
  const found = comments.find((c) => c.user.login === "dtinth-bot")
  let commentResult
  if (found) {
    commentResult = await gh.issues.updateComment({
      ...issue,
      comment_id: found.id,
      body: text,
    })
  } else {
    commentResult = await gh.issues.createComment({
      ...issue,
      body: text,
    })
  }
  return commentResult
}
