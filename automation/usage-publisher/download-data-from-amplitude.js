const encrypted = require("@dtinth/encrypted")()
const execa = require("execa")

const amplitudeUser = encrypted(`
RWLl/lqjftXId/Q87+4JuxHs+YHrDCRS.b+TUAUUu2An5E9s/Q/3YvGvUjwDYUANMGUR1uOv
uQmDwHUuncDpPjtKfPkvSJ8PmBI2XIkQettRBJjahFJ747GV/He/nm5CHXHJP3j60+5KaVO0
=
`)

execa(
  `mkdir -p tmp && curl -u '${amplitudeUser}' 'https://amplitude.com/api/3/chart/9bk8bge/query' > tmp/amplitude.json`,
  { shell: true, stdio: "inherit" }
)
