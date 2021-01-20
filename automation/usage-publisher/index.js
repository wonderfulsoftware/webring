const stats = require("../../tmp/amplitude.json").data
const targetDate = "2021-01-18"
const targetIndex = stats.xValues.indexOf(targetDate)
if (targetIndex === -1) {
  throw new Error(`Data for ${targetDate} not found.`)
}
const stat = {}
for (const [i, meta] of stats.seriesMeta.entries()) {
  const [to, from] = meta.eventGroupBys
  const count = stats.series[i][targetIndex].value
  if (count > 0 && from !== "(none)") {
    if (!stat[from]) {
      stat[from] = {}
    }
    stat[from][to] = count
  }
}
console.log(stat)
