import { encode as blurhashEncode } from "blurhash"
import consola from "consola"
import imagemin from "imagemin"
import imageminPngquant from "imagemin-pngquant"
import jimp from "jimp"
import { type RequestHandler, send } from "micro"
import { type Browser, chromium, type Page } from "playwright"

let browser: Browser | undefined

const handler: RequestHandler = async (req, res) => {
  const url = new URL(req.url || "", "https://service")
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
    browser = await chromium.launch()
  }

  const context = await browser.newContext({
    userAgent: "webring.wonderful.software",
  })
  const page = await context.newPage()
  try {
    await page.setViewportSize({ width: 375, height: 640 })
    await page.goto(captureUrl, { waitUntil: "networkidle", timeout: 10000 }).catch(e => {
      consola.warn(`Unable to navigate to ${captureUrl}`, e)
    })
    const image = await capture(page)
    const description = await page.evaluate(() => {
      const contentOf = (selector: string) => {
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
    await context.close()
  }
}

export default handler

async function capture(
  page: Page
): Promise<{ buffer: Buffer; blurhash: string }> {
  const getScreenshot = async () => {
    return Buffer.from(await page.screenshot({ type: "png" }))
  }

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
    if (Date.now() >= start + 5000) {
      console.warn("Give up waiting for animations to finish")
      break
    }
  }

  const { data, width, height } = previousScreenshotImage.bitmap
  const blurhash = blurhashEncode(
    new Uint8ClampedArray(data),
    width,
    height,
    4,
    7
  )
  screenshot = await optimize(screenshot)
  return { buffer: screenshot, blurhash }
}

function areImagesDifferent(a: jimp, b: jimp): boolean {
  if (a.bitmap.width !== b.bitmap.width) return true
  if (a.bitmap.height !== b.bitmap.height) return true
  const diff = jimp.diff(a, b)
  const threshold = 0.001
  return diff.percent > threshold
}

async function optimize(buffer: Buffer): Promise<Buffer> {
  try {
    buffer = await imagemin.buffer(buffer, {
      plugins: [imageminPngquant({ quality: [0.6, 0.8] })],
    })
  } catch (error) {
    console.log("Cannot optimize image", error)
  }
  return buffer
}
