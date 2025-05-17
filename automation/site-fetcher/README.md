# webring site-fetcher

- Capture screenshot of the websites in the webring using [Playwright](https://playwright.dev).
- Optimize the screenshot image using [`imagemin-pngquant`](https://www.npmjs.com/package/imagemin-pngquant).
- Generates a [Blurhash](https://blurha.sh) string representing the image for placeholder image.
- Scrapes the description of the webpage from meta tags.
- Finds and validates the backlink to the webring.
- Can be run locally via Docker or in GitHub Actions workflows.

## How to debug the screenshot

This part of the stack is Dockerized so that everyone can run it locally and know that it will produce consistent screenshots as the webring's.

1. Run the server:

   ```
   docker-compose up
   ```

2. Go to `http://localhost:3000/?url=<url>` and see the screenshot captured:

   ```
   http://localhost:3000/?url=https://dt.in.th/
   ```

## Debugging

### Getting JSON data

For debugging purposes, you can also get the site data in JSON format:

```
http://localhost:3000/?url=https://dt.in.th/&as=json
```

This returns a JSON object containing:

- `blurhash`: The blurhash string for the image
- `content`: Base64-encoded PNG image
- `description`: Site description (if available)
- `backlink`: Information about the webring backlink

### Getting trace file

You can also debug in more details with the help of [Playwright’s tracing](https://playwright.dev/docs/trace-viewer) features:

```
http://localhost:3000/?url=https://dt.in.th/&as=trace
```

This will return a zip file containing the trace data. You can open this file in the [Playwright Trace Viewer](https://trace.playwright.dev/) to see what happened during the screenshot capture process.
