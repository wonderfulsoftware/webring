const stats = require("../../tmp/amplitude.json").data
// const targetDate = "2021-01-18"
// const targetIndex = stats.xValues.indexOf(targetDate)
// if (targetIndex === -1) {
//   throw new Error(`Data for ${targetDate} not found.`)
// }

for (const [targetIndex, targetDate] of stats.xValues.entries()) {
  if (targetDate < "2021-01-24") continue
  const stat = {}
  const summary = { total: 0, network: 0, external: 0 }
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
    summary[from === "(none)" ? "external" : "network"] += count
  }
  console.log(targetDate, summary)
}
