require("make-promises-safe")
require("dotenv").config()
const encrypted = require("@dtinth/encrypted")()
const axios = require("axios").default
const fs = require("fs")
const jimp = require("jimp")
const { getSites } = require("../common/getSites")

const siteFetcherInstanceBase = encrypted(`
  hPICn0kIZz95DnrFYyUrih8KGX560QbX.cTRujVSHIJAs7EklBTU65we8I2z46k/YV8KUvis
  D0f9cP54jlpVYWitiX0FKXr2Z67dhFj6RqGZsmqVpC6pfKfFl0UoR2+SDlmU=
`)

;(async () => {
  const db = JSON.parse(
    fs.readFileSync("tmp/webring-site-data/data.json", "utf8")
  )
  const sites = getSites()

  Object.values(db).forEach((data) => {
    delete data.number
  })

  const screenshotUpdates = []
  for (const site of sites) {
    const data = db[site.id] || {}
    console.log(site.id)
    try {
      if (data.url !== site.url) {
        data.url = site.url
      }
      if (
        !data.lastUpdated ||
        data.lastUpdated < new Date(Date.now() - 3600e3 * 20).toJSON()
      ) {
        const siteFetchingResponse = await axios.get(siteFetcherInstanceBase, {
          params: {
            url: site.url,
            key: process.env.SITE_FETCHER_API_KEY,
            as: "json",
          },
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
      }
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
