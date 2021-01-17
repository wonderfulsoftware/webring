require("make-promises-safe")

const execa = require("execa")
const axios = require("axios")
const fs = require("fs")
const cheerio = require("cheerio")

;(async () => {
  const $ = cheerio.load(fs.readFileSync("index.html", "utf8"))
  const sites = []
  for (const site of Array.from($("#ring li[id]"))) {
    sites.push({
      id: $(site).attr("id"),
      url: $(site).find("a").attr("href"),
    })
  }
  console.log(sites)
})()
