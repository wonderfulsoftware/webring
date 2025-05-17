import { encode as blurhashEncode } from "blurhash"
import consola from "consola"
import imagemin from "imagemin"
import imageminPngquant from "imagemin-pngquant"
import jimp from "jimp"
import { type RequestHandler, send } from "micro"
import { readFileSync, unlinkSync } from "node:fs"
import { type Browser, chromium, type Page } from "playwright"

let browser: Browser | undefined
declare let document: any

const handler: RequestHandler = async (req, res) => {
  const requestStartTime = Date.now()
  const url = new URL(req.url || "", "https://service")
  const captureUrl = url.searchParams.get("url")
  if (!captureUrl) {
    consola.warn(`Request rejected: No URL provided`)
    return send(res, 400, "No url")
  }
  consola.info(`Processing request for URL: ${captureUrl}`)

  const key = url.searchParams.get("key")
  if (!process.env.API_KEY && key) {
    consola.error(`Authentication error: API_KEY not configured`)
    return send(res, 500, "API_KEY not configured")
  }
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    consola.warn(`Authentication failed: Wrong API key provided`)
    return send(res, 401, "Wrong key")
  }

  if (!browser) {
    consola.info(`Initializing browser instance`)
    browser = await chromium.launch()
  }

  const context = await browser.newContext({
    userAgent: "webring.wonderful.software",
  })
  const sessionId = crypto.randomUUID()
  const tracePath = `/tmp/trace-${sessionId}.zip`
  await context.tracing.start({ screenshots: true, snapshots: true })
  const page = await context.newPage()
  consola.info(`Browser context and page created for ${captureUrl}`)

  try {
    await page.setViewportSize({ width: 375, height: 640 })
    consola.info(`Navigating to ${captureUrl}`)
    await page
      .goto(captureUrl, { waitUntil: "networkidle", timeout: 10000 })
      .catch((e) => {
        consola.warn(`Unable to navigate to ${captureUrl}`, e)
      })
    consola.info(`Capturing screenshot for ${captureUrl}`)
    const image = await capture(page)
    consola.info(`Getting page metadata for ${captureUrl}`)
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
    consola.info(`Checking for webring backlink on ${captureUrl}`)
    const backlink = await page.evaluate(() => {
      const element = document.querySelector(
        'a[href^="https://webring.wonderful.software"]',
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
    await context.tracing.stop({ path: tracePath })
    if (url.searchParams.get("as") === "json") {
      consola.info(`Returning JSON response for ${captureUrl}`)
      res.setHeader("Content-Type", "application/json")
      return send(res, 200, {
        blurhash: image.blurhash,
        content: image.buffer.toString("base64"),
        description,
        backlink,
      })
    } else if (url.searchParams.get("as") === "trace") {
      consola.info(`Returning trace response for ${captureUrl}`)
      const buffer = readFileSync(tracePath)
      res.setHeader("Content-Type", "application/zip")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=trace-${sessionId}.zip`,
      )
      res.setHeader("Content-Length", buffer.length)
      return send(res, 200, buffer)
    } else {
      consola.info(`Returning PNG image for ${captureUrl}`)
      res.setHeader("Content-Type", "image/png")
      return send(res, 200, image.buffer)
    }
  } catch (error: any) {
    consola.error(`Error processing ${captureUrl}:`, error)
    return send(res, 500, `Error processing request: ${error.message}`)
  } finally {
    await page.close()
    await context.close()
    consola.info(
      `Request for ${captureUrl} completed in ${Date.now() - requestStartTime}ms`,
    )
    unlinkSync(tracePath)
  }
}

export default handler

async function capture(
  page: Page,
): Promise<{ buffer: Buffer; blurhash: string }> {
  consola.debug(`Starting screenshot capture process`)
  const getScreenshot = async () => {
    return Buffer.from(await page.screenshot({ type: "png" }))
  }

  let screenshot = await getScreenshot()
  consola.debug(`Initial screenshot captured: ${screenshot.length} bytes`)
  let previousScreenshotImage = await jimp.read(screenshot)

  // Wait for up to 5 seconds for the screenshot to stabilize.
  let start = Date.now()
  let iterations = 0
  consola.debug(`Waiting for page animations to stabilize`)
  for (;;) {
    await new Promise((r) => setTimeout(r, 100))
    iterations++
    screenshot = await getScreenshot()
    const screenshotImage = await jimp.read(screenshot)
    if (!areImagesDifferent(previousScreenshotImage, screenshotImage)) {
      consola.debug(
        `Screenshot stabilized after ${iterations} iterations (${Date.now() - start}ms)`,
      )
      break
    }
    previousScreenshotImage = screenshotImage
    if (Date.now() >= start + 5000) {
      consola.warn(
        `Gave up waiting for animations to finish after ${iterations} iterations (5000ms)`,
      )
      break
    }
  }

  const { data, width, height } = previousScreenshotImage.bitmap
  consola.debug(`Generating blurhash for image ${width}x${height}`)
  const blurhash = blurhashEncode(
    new Uint8ClampedArray(data),
    width,
    height,
    4,
    7,
  )
  consola.debug(`Optimizing screenshot image`)
  screenshot = await optimize(screenshot)
  consola.debug(`Final screenshot size: ${screenshot.length} bytes`)
  return { buffer: screenshot, blurhash }
}

function areImagesDifferent(a: jimp, b: jimp): boolean {
  if (a.bitmap.width !== b.bitmap.width) return true
  if (a.bitmap.height !== b.bitmap.height) return true
  const diff = jimp.diff(a, b)
  const threshold = 0.001
  consola.debug(`Image diff percent: ${diff.percent}, threshold: ${threshold}`)
  return diff.percent > threshold
}

async function optimize(buffer: Buffer): Promise<Buffer> {
  const originalSize = buffer.length
  try {
    consola.debug(`Optimizing image of size ${originalSize} bytes`)
    buffer = Buffer.from(
      await imagemin.buffer(buffer, {
        plugins: [(imageminPngquant as any)({ quality: [0.6, 0.8] })],
      }),
    )
    const newSize = buffer.length
    const savingsPercent = (
      ((originalSize - newSize) / originalSize) *
      100
    ).toFixed(1)
    consola.debug(
      `Image optimized: ${originalSize} -> ${newSize} bytes (${savingsPercent}% savings)`,
    )
  } catch (error) {
    consola.error("Cannot optimize image", error)
  }
  return buffer
}
