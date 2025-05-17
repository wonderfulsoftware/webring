# webring site-updater

- An automation script [ran by GitHub Actions](https://github.com/wonderfulsoftware/webring/blob/main/.github/workflows/site-updater.yml).
- Connects to a local [site-fetcher](../site-fetcher) Docker container (built and run within the GitHub Actions workflow) to fetch latest site data for each site in the webring.
- Uses the `SITE_FETCHER_INSTANCE_BASE` environment variable (defaults to http://localhost:3000) to override the site-fetcher endpoint.
- Updates the screenshots in the [webring-site-screenshots](https://github.com/wonderfulsoftware/webring-site-screenshots) repo.
- Updates the data file in the [webring-site-data](https://github.com/wonderfulsoftware/webring-site-data) repo which is used on the web.
