require("make-promises-safe")
require("dotenv").config()
const fs = require("fs")
const { getSites } = require("../common/getSites")
const feedReader = require("feed-reader")

;(async () => {
  const feedDb = JSON.parse(
    fs.readFileSync("tmp/webring-site-data/feed.json", "utf8")
  )
  const sites = getSites()

  const toKeep = new Set()
  const toReplace = new Set()
  const newItems = []
  for (const site of sites) {
    try {
      if (site.feed) {
        toKeep.add(site.id)
        const feed = await feedReader.read(site.feed)
        const unknownHostnames = new Set()
        const entries = feed.entries
          .filter((entry) => Date.parse(entry.published) < Date.now())
          .filter((entry) => {
            const url = new URL(entry.link, site.url)
            const siteUrl = new URL(site.url)
            const fixHostnames = [
              // chrisza.me
              "gatsby-starter-blog-demo.netlify.app",
              // wp.curve.in.th
              "chameleontk.github.io",
            ]
            if (fixHostnames.includes(url.hostname)) {
              url.hostname = siteUrl.hostname
            }
            if (url.hostname.includes(siteUrl.hostname.replace(/^www\./, ""))) {
              return true
            } else {
              unknownHostnames.add(url.hostname)
              return false
            }
          })
        if (unknownHostnames.size > 0) {
          console.warn(
            `[${site.id}] Feed points to unknown hostnames: ${Array.from(
              unknownHostnames
            ).join(", ")}`
          )
        }
        if (entries.length > 0) {
          const title = entries[0].title.replace(/\s+/g, " ").trim()
          if (title) {
            const item = {
              site: site.id,
              title,
              url: entries[0].link,
              published: new Date(entries[0].published).toISOString(),
            }
            newItems.push(item)
            toReplace.add(site.id)
            console.log(
              `[${site.id}] Latest: ${item.published.slice(0, 10)} ${title}`
            )
          } else {
            console.warn(`[${site.id}] Feed’s latest entry has no title`)
          }
        } else {
          console.warn(`[${site.id}] Feed has no entries`)
        }
      } else {
        console.warn(`[${site.id}] Has no feed`)
      }
    } catch (e) {
      console.error(`[${site.id}] Unable to process feed`, e)
    }
  }
  const nextFeedDb = [
    ...feedDb.filter(
      (item) => toKeep.has(item.site) && !toReplace.has(item.site)
    ),
    ...newItems,
  ].sort((a, b) => b.published.localeCompare(a.published))
  fs.writeFileSync(
    "tmp/webring-site-data/feed.json",
    JSON.stringify(nextFeedDb, null, 2)
  )

  // Add (or update) the commit message
  try {
    fs.writeFileSync("tmp/webring-site-data-commit-message", "Update feed", {
      flag: "wx",
    })
  } catch (error) {
    const original = fs.readFileSync(
      "tmp/webring-site-data-commit-message",
      "utf8"
    )
    if (!original.includes("Update feed")) {
      fs.writeFileSync(
        "tmp/webring-site-data-commit-message",
        `${original}, Update feed`
      )
    }
  }
})()
