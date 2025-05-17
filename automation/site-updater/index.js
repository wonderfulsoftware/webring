require("make-promises-safe")
require("dotenv").config()
const axios = require("axios").default
const fs = require("fs")
const jimp = require("jimp")
const { getSites } = require("../common/getSites")

const siteFetcherInstanceBase =
  process.env.SITE_FETCHER_INSTANCE_BASE || "http://localhost:3000"

;(async () => {
  const db = JSON.parse(
    fs.readFileSync("tmp/webring-site-data/data.json", "utf8")
  )
  const sites = getSites()
  const screenshotUpdates = []
  const sitesWithNumber = new Set()
  for (const site of sites) {
    const data = db[site.id] || {}
    console.log(`::group::${site.id}`)
    const oldData = JSON.parse(JSON.stringify(data))
    let updateStatus = "unknown"
    try {
      if (data.url !== site.url) {
        data.url = site.url
      }
      if (
        !data.lastUpdated ||
        data.lastUpdated < new Date(Date.now() - 3600e3 * 20).toJSON() ||
        !!process.env.FORCE_UPDATE
      ) {
        const start = Date.now()
        const siteFetchingResponse = await axios
          .get(siteFetcherInstanceBase, {
            params: {
              url: site.url,
              as: "json",
            },
          })
          .catch((error) => {
            updateStatus = `${error}`
            throw error
          })
        const fetchResult = siteFetchingResponse.data
        const imageBasename = `${site.id}_375w@2x.png`
        const imagePath = `tmp/webring-site-screenshots/${imageBasename}`
        const existingImage =
          fs.existsSync(imagePath) && (await jimp.read(imagePath))
        const newImageBuffer = Buffer.from(fetchResult.content, "base64")
        const newImage = await jimp.read(newImageBuffer)
        if (!existingImage || areImagesDifferent(existingImage, newImage)) {
          fs.writeFileSync(imagePath, newImageBuffer)
          console.log("Written", imagePath)
          data.mobileImageUrlV2 = `https://wonderfulsoftware.github.io/webring-site-screenshots/${imageBasename}`
          data.blurhash = fetchResult.blurhash
          data.screenshotUpdatedAt = new Date().toJSON()
          screenshotUpdates.push(site.id)
        }
        data.description = fetchResult.description
        data.backlink = fetchResult.backlink
        data.lastUpdated = new Date().toJSON()
        console.log(data)
        const end = Date.now()
        updateStatus = `took ${end - start}ms`
      } else {
        updateStatus = "cached"
      }
      sitesWithNumber.add(site.id)
      if (data.number !== site.number) {
        data.number = site.number
      }
      if (data.owner !== site.owner) {
        data.owner = site.owner
      }
    } catch (e) {
      console.error(site.id, e)
    }
    db[site.id] = data
    console.log(`::endgroup::`)
    const changedKeys = Array.from(
      new Set([...Object.keys(oldData), ...Object.keys(data)])
    )
      .sort()
      .filter((key) => {
        return JSON.stringify(oldData[key]) !== JSON.stringify(data[key])
      })
    if (changedKeys.length) {
      console.log(` ↳ Updated: ${changedKeys.join(", ")} (${updateStatus})`)
    } else {
      console.log(` ↳ No changes (${updateStatus})`)
    }
  }

  // Remove numbers from sites that are not in the list
  for (const siteId in db) {
    if (!sitesWithNumber.has(siteId)) {
      const data = db[siteId]
      if (data.number) {
        console.log(`Removing number from ${siteId}`)
        delete data.number
      }
    }
  }

  fs.writeFileSync(
    "tmp/webring-site-screenshots-commit-message",
    "Update screenshots of " + screenshotUpdates.join(", ")
  )
  fs.writeFileSync("tmp/webring-site-data-commit-message", "Update site data")
  fs.writeFileSync(
    "tmp/webring-site-data/data.json",
    JSON.stringify(db, null, 2)
  )
})()

/**
 * @param {import('jimp')} a
 * @param {import('jimp')} b
 */
function areImagesDifferent(a, b) {
  if (a.bitmap.width !== b.bitmap.width) return true
  if (a.bitmap.height !== b.bitmap.height) return true
  const diff = jimp.diff(a, b)
  const threshold = 0.001
  return diff.percent > threshold
}
