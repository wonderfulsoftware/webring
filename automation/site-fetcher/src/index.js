const puppeteer = require("puppeteer")
const { send } = require("micro")
const jimp = require("jimp")
const imagemin = require("imagemin")
const imageminPngquant = require("imagemin-pngquant")
const Blurhash = require("blurhash")

/** @type {import('puppeteer').Browser} */
let browser

/** @type {import('micro').RequestHandler} */
module.exports = async (req, res) => {
  const url = new URL(req.url, "https://service")
  const captureUrl = url.searchParams.get("url")
  if (!captureUrl) {
    return send(res, 400, "No url")
  }

  const key = url.searchParams.get("key")
  if (!process.env.API_KEY && key) {
    return send(res, 500, "API_KEY not configured")
  }
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    return send(res, 401, "Wrong key")
  }

  if (!browser) {
    browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    })
  }

  const page = await browser.newPage()
  page.setUserAgent("webring.wonderful.software")
  try {
    await page.setViewport({ width: 375, height: 640, deviceScaleFactor: 2 })
    await page
      .goto(captureUrl, { waitUntil: "networkidle0", timeout: 10000 })
      .catch(console.error)
    const image = await capture(page)
    const description = await page.evaluate(() => {
      const contentOf = (selector) => {
        const element = document.querySelector(selector)
        const value = element && element.getAttribute("content")
        return value ? String(value).slice(0, 300) : null
      }
      return (
        contentOf('meta[property="og:description"]') ||
        contentOf('meta[name="twitter:description"]') ||
        contentOf('meta[name="description"]') ||
        contentOf('meta[itemprop="description"]') ||
        null
      )
    })
    const backlink = await page.evaluate(() => {
      const element = document.querySelector(
        'a[href^="https://webring.wonderful.software"]'
      )
      const rect = element && element.getBoundingClientRect()
      return element
        ? {
            rect:
              rect && rect.width + rect.height > 0
                ? [rect.width, rect.height, rect.left, rect.top].join(":")
                : null,
            href: element.getAttribute("href") || null,
          }
        : null
    })
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600")
    console.log(image.blurhash)
    if (url.searchParams.get("as") === "json") {
      res.setHeader("Content-Type", "application/json")
      return send(res, 200, {
        blurhash: image.blurhash,
        content: image.buffer.toString("base64"),
        description,
        backlink,
      })
    } else {
      res.setHeader("Content-Type", "image/png")
      return send(res, 200, image.buffer)
    }
  } finally {
    await page.close()
  }
}

/**
 * @param {import('puppeteer').Page} page
 */
async function capture(page) {
  const getScreenshot = () =>
    page.screenshot({ encoding: "binary", type: "png" })

  let screenshot = await getScreenshot()
  let previousScreenshotImage = await jimp.read(screenshot)

  // Wait for up to 5 seconds for the screenshot to stabilize.
  let start = Date.now()
  for (;;) {
    await new Promise((r) => setTimeout(r, 100))
    screenshot = await getScreenshot()
    const screenshotImage = await jimp.read(screenshot)
    if (!areImagesDifferent(previousScreenshotImage, screenshotImage)) {
      break
    }
    previousScreenshotImage = screenshotImage
    if (Date.now() >= start + 5e3) {
      console.warn("Give up waiting for animations to finish")
      break
    }
  }

  const { data, width, height } = previousScreenshotImage.bitmap
  const blurhash = Blurhash.encode(
    /** @type {any} */ (data),
    width,
    height,
    4,
    7
  )
  screenshot = await optimize(screenshot)
  return { buffer: screenshot, blurhash }
}

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

/**
 * @param {Buffer} buffer
 */
async function optimize(buffer) {
  try {
    buffer = await imagemin.buffer(buffer, {
      plugins: [imageminPngquant.default({ quality: [0.6, 0.8] })],
    })
  } catch (error) {
    console.log("Cannot optimize image", error)
  }
  return buffer
}
