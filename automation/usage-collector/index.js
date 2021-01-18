const axios = require("axios")
/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handleHttp = async (req, res) => {
  try {
    let type = ""
    const props = {}
    props.hostname = String(req.query.hostname)
    switch (req.query.action) {
      case "inbound":
        type = "inbound"
        props.site = String(req.query.site)
        break
      case "outbound":
        type = "outbound"
        props.site = String(req.query.site)
        props.referer = String(req.query.referer || "")
        break
    }
    if (!type) {
      return res.status(400).send("nope")
    }
    const response = await axios.post("https://api.amplitude.com/2/httpapi", {
      api_key: process.env.AMPLITUDE_API_KEY,
      events: [
        {
          user_id: "anonymous_user",
          event_type: type,
          event_properties: props,
        },
      ],
    })
    console.log(response)
    res.status(200).send("ok")
  } catch (e) {
    console.error(e)
    res.status(500).send(":(")
  }
}
