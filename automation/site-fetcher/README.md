# webring site-fetcher

- Capture screenshot of the websites in the webring using [Puppeteer](https://pptr.dev).
- Optimize the screenshot image using [`imagemin-pngquant`](https://www.npmjs.com/package/imagemin-pngquant).
- Generates a [Blurhash](https://blurha.sh) string representing the image for placeholder image.
- Scrapes the description of the webpage from meta tags.
- Finds and validates the backlink to the webring.
- Deployed to [Google Cloud Run](https://cloud.google.com/run) with [Firebase Hosting Cache](https://firebase.google.com/docs/hosting/manage-cache).

## How to debug the screenshot

This part of the stack is Dockerized so that everyone can run it locally and know that it will produces consistent screenshots as the webring’s.

1. Run the server:

   ```
   docker-compose up
   ```

2. Go to `http://localhost:3000/?url=<url>` and see the screenshot captured:

   ```
   http://localhost:3000/?url=https://dt.in.th/
   ```
