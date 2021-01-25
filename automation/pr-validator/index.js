require("make-promises-safe")
require("dotenv").config()

const encrypted = require("@dtinth/encrypted")()
const { Octokit } = require("@octokit/rest")
const { default: axios } = require("axios")
const { escape } = require("lodash")

// See `../site-fetcher`
const siteFetcherInstanceBase = encrypted(`
  hPICn0kIZz95DnrFYyUrih8KGX560QbX.cTRujVSHIJAs7EklBTU65we8I2z46k/YV8KUvis
  D0f9cP54jlpVYWitiX0FKXr2Z67dhFj6RqGZsmqVpC6pfKfFl0UoR2+SDlmU=
`)

// This is a private endpoint for me to upload images to Azure Blob.
const captureEndpointUrl = encrypted(`
  /rM4qtw8Fn5fTL2EUD2YPuslgLPpoPp4.U+Nf++VIhFJJVPy5+IrTSXHI4hhQ+n1d43rhazp
  LLfkdI2Xxvl7XiYBKo+raSf2pYKPHMoODGwdFa8RqjP/2x1dZvGKBM6LaPaEu7luEf4eDReD
  YLa6T76eO5/tdjHS9v7EcmeOpmOvyFYebsIELbg/tVDMErsJIqKL+i/lz
`)

;(async () => {
  const url = process.argv[2]
  console.log("Loading site info...")
  const fetchResult = await fetchSiteInfo(url)
  const ephemeralScreenshotUrl = generateEphemeralUrl(url)
  console.log("Persisting screenshot...")
  const persistentScreenshotUrl = await persistScreenshot(
    ephemeralScreenshotUrl
  )
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
 * @param {string} url
 */
function generateEphemeralUrl(url) {
  return (
    siteFetcherInstanceBase +
    "?" +
    new URLSearchParams({
      url: url,
      key: process.env.SITE_FETCHER_API_KEY,
    })
  )
}

/**
 * @param {string} ephemeralScreenshotUrl
 */
async function persistScreenshot(ephemeralScreenshotUrl) {
  const destKey = [
    "wonderfulsoftware/webring/pr-validator",
    ...new Date().toJSON().split("T")[0].split("-"),
    require("crypto")
      .createHash("md5")
      .update(ephemeralScreenshotUrl)
      .digest("hex") + ".png",
  ].join("/")

  // Make screenshot persistent
  await axios.post(captureEndpointUrl, {
    src: ephemeralScreenshotUrl,
    dest: destKey,
  })

  const persistentScreenshotUrl =
    "https://webshots.blob.core.windows.net/webshots/" + destKey
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
      `- ⚠ Found backlink, however, please change \`${before}\` to just \`#${after}\` for correct linking.`
    )
  } else if (fetchResult.backlink.href.match(/YOUR\.DOMAIN/i)) {
    lines.push(
      `- ⚠ Found backlink, however, please change \`YOUR.DOMAIN\` to your actual domain for correct linking.`
    )
  } else {
    lines.push(`- ✅ Found backlink to ${fetchResult.backlink.href}.`)
  }
  lines.push("", "**Site description:**")
  if (!fetchResult.description) {
    lines.push(
      '- ℹ No site description found. Consider adding `<meta property="og:description">` or `<meta name="description">` to your website to site description show up on the webring page.'
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
