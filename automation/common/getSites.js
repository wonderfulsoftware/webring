const fs = require("fs")
const cheerio = require("cheerio")

function getSites() {
  const $ = cheerio.load(fs.readFileSync("index.html", "utf8"))
  /** @type {{id: string, url: string, number: number}[]}*/
  const sites = []
  let nextNumber = 0
  for (const site of Array.from($("#ring li[id]"))) {
    sites.push({
      id: $(site).attr("id"),
      url: $(site).find("a").attr("href"),
      number: nextNumber++,
    })
  }
  return sites
}

exports.getSites = getSites
