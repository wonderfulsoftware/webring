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

  // Fetch site info
  const siteFetchingResponse = await axios.get(siteFetcherInstanceBase, {
    params: {
      url: url,
      key: process.env.SITE_FETCHER_API_KEY,
      as: "json",
    },
  })
  const fetchResult = siteFetchingResponse.data

  // Generate ephemeral screenshot URL
  const ssurl =
    siteFetcherInstanceBase +
    "?" +
    new URLSearchParams({
      url: url,
      key: process.env.SITE_FETCHER_API_KEY,
    })

  // Generate persistent screenshot URL
  const destKey = [
    "wonderfulsoftware/webring/pr-validator",
    ...new Date().toJSON().split("T")[0].split("-"),
    require("crypto").createHash("md5").update(ssurl).digest("hex") + ".png",
  ].join("/")

  // Make screenshot persistent
  await axios.post(captureEndpointUrl, {
    src: ssurl,
    dest: destKey,
  })

  const text = []
  text.push("## PR validation result", "", "**Backlink:**")

  if (!fetchResult.backlink) {
    text.push("- ❌ No backlink found.")
  } else if (fetchResult.backlink.href.includes("#/")) {
    const domain = fetchResult.backlink.href.split("#")[1]
    const before = `#${domain}`
    const after = `#${domain.slice(1)}`
    text.push(
      `- ⚠ Found backlink, however, please change \`${before}\` to just \`#${after}\` for correct linking.`
    )
  } else {
    text.push(`- ✅ Found backlink to ${fetchResult.backlink.href}.`)
  }
  text.push("", "**Site description:**")
  if (!fetchResult.description) {
    text.push(
      '- ℹ No site description found. Consider adding `<meta property="og:description">` or `<meta name="description">` to your website to site description show up on the webring page.'
    )
  } else {
    text.push(`- ✅ ${escape(fetchResult.description)}`)
  }
  text.push(
    "",
    "**Screenshot:**",
    "- ![](https://webshots.blob.core.windows.net/webshots/" + destKey
  )

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
      body: text.join("\n"),
    })
  } else {
    commentResult = await gh.issues.createComment({
      ...issue,
      body: text.join("\n"),
    })
  }
  console.log(commentResult.data.html_url)
})()
