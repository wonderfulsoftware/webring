# webring pr-validator

- Validates pull requests for new sites added to the webring
- Creates a comment with web validation result including screenshot, backlink check, and site description
- Run through GitHub Actions workflow `.github/workflows/pr-reviewer.yml` or manually
- Uses the local [site-fetcher](../site-fetcher) Docker container in GitHub Actions
- Uses the `SITE_FETCHER_INSTANCE_BASE` environment variable (defaults to http://localhost:3000) to override the site-fetcher endpoint

## Manual usage

```
node automation/pr-validator <URL> <PR_NUMBER>
```
