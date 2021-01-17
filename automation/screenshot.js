require("dotenv").config()
const encrypted = require("@dtinth/encrypted")()
const jwt = require("jsonwebtoken")

const privateKey = encrypted(`
aQXOMN6ZTsk2O0vW5VEsL8yvKNdHvItC.ML80Y5RPFrclnc+Kp9LG0hwgxjMXGIE+Uo0WtUm
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
R5vZ7tkF3mqXrAgR30xmUacqQN9g=
`)

function ss(url, w, h, options) {
  const token = jwt.sign(
    { url, width: w, height: h, waitUntil: "networkidle0", ...options },
    privateKey,
    {
      algorithm: "RS256",
      noTimestamp: true,
      issuer: "webring.wonderful.software",
    }
  )
  return `https://capture.the.spacet.me/${token}.png`
}

function screenshotData(url) {
  return {
    desktopImageUrl: ss(url, 1280, 960),
    mobileImageUrl: ss(url, 360, 640, { deviceScaleFactor: 2 }),
  }
}

console.log(JSON.stringify(screenshotData(process.argv[2]), null, 2))
