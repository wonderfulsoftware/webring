const fs = require("fs")
const stats = JSON.parse(fs.readFileSync("tmp/amplitude.json", "utf8")).data
const data = {}
const output = []

for (const [targetIndex, targetDate] of stats.xValues.entries()) {
  if (targetDate < "2021-01-24") continue
  const stat = {}
  const summary = { total: 0, ring: 0, external: 0 }
  for (const [i, meta] of stats.seriesMeta.entries()) {
    const [to, from] = meta.eventGroupBys
    const count = stats.series[i][targetIndex].value
    if (count > 0 && from !== "(none)") {
      if (!stat[from]) {
        stat[from] = {}
      }
      stat[from][to] = count
    }
    summary.total += count
    summary[from === "(none)" ? "external" : "ring"] += count
  }
  data[targetDate] = summary
}

const tabularStringify = (obj) => {
  return (
    "{ " +
    Object.entries(obj)
      .map(
        ([key, value]) =>
          `${JSON.stringify(key)}: ${JSON.stringify(value).padStart(5)}`
      )
      .join(",    ") +
    " }"
  )
}

for (const [i, key] of Object.keys(data).sort().entries()) {
  output.push(
    [
      i === 0 ? "{" : ",",
      " ",
      JSON.stringify(key),
      ": ",
      tabularStringify(data[key]),
    ].join("")
  )
}

output.push(output.length ? "}" : "{}")
fs.writeFileSync("tmp/webring-usage-stats/traffic.json", output.join("\n"))
fs.writeFileSync(
  "tmp/webring-usage-stats-commit-message",
  "Update usage statistics as of " + new Date().toJSON()
)
