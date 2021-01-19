# webring site-updater

- An automation script [ran by GitHub Actions](https://github.com/wonderfulsoftware/webring/blob/main/.github/workflows/site-updater.yml).
- Invokes [site-fetcher](../site-fetcher) for each site in the webring to fetch latest site data.
- Updates the screenshots in the [webring-site-screenshots](https://github.com/wonderfulsoftware/webring-site-screenshots) repo.
- Updates the data file in the [webring-site-data](https://github.com/wonderfulsoftware/webring-site-data) repo which is used on the web.
