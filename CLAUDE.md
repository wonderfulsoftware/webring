# CLAUDE.md - Agent Guide for webring

## Commands
- **Install**: `yarn` (uses yarn@1.22.19)
- **Run tests**: `npx playwright test` (in automation/e2e directory)
- **Run single test**: `npx playwright test tests/file.spec.ts`
- **Run specific test**: `npx playwright test -g "test name pattern"`

## Pull Request Review Playbook

### Initial PR Review Checklist
1. **Add review label** when starting review: `gh pr edit <PR_NUMBER> --add-label "review"`
   - IMPORTANT: After adding the label, immediately provide the website URL to the user for manual verification
   - Then yield back to the user to wait for checks to complete
   - Ask the user to notify you when checks are ready to proceed
2. **Check PR validation results** from the automated comment by github-actions bot
3. **Validate HTML element structure**:
   - Verify the PR adds a single `<li>` element at the end of the list
   - Check that `data-lang` attribute is either "en" or "th"
   - Confirm `id` attribute matches the domain name (without subdomain if present)
   - Verify `data-owner` attribute matches the PR author's GitHub username
   - Ensure link text matches the `id` attribute
4. **Verify webring link exists** on the site (backlink check should be ✅ in validation results)
5. **Check site requirements** against README criteria:
   - IMPORTANT: Provide the site URL to the user for manual verification
   - Wait for user confirmation before proceeding to approval
   - Personal, non-profit website (portfolio, blog, digital garden)
   - Has actual content (no "coming soon" pages)
   - Uses own domain (not github.io, netlify.app, etc.)
   - Icon is visible on both desktop and mobile

#### PR Actions by Situation

**IMPORTANT: Always use heredoc for properly formatted comments**

For all PR comments, use this format to preserve proper formatting:
```bash
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Your comment text here with proper formatting.

This preserves line breaks and markdown formatting properly.

> Even blockquotes work correctly.

EOF
)"
```

##### 1. If HTML element is invalid

```bash
# Comment about invalid HTML element
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Thanks for your interest in joining the webring. I noticed some issues with your HTML element:
- [specific issue with data-lang/id/data-owner]

Please update your PR to fix these issues according to the guidelines.
EOF
)"
```

##### 2. If site meets all requirements

```bash
# Approve and merge PR
gh pr review <PR_NUMBER> --approve --body "@<USERNAME> Thanks, and welcome to the webring!"
gh pr merge <PR_NUMBER> --squash
```

IMPORTANT: Always use the `--squash` option when merging PRs.

##### 3. If site is missing content

```bash
# Comment requesting more content
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Thanks for your interest in joining the webring! I noticed your website currently appears to mainly link to other platforms without having much original content directly on the site itself.

According to our requirements in the [README](https://github.com/wonderfulsoftware/webring?tab=readme-ov-file#%E0%B8%A3%E0%B9%88%E0%B8%A7%E0%B8%A1%E0%B8%A7%E0%B8%87), websites in the webring should:

> มีการเผยแพร่ผลงานบนเว็บไซต์ (ไม่รับเว็บที่เป็นหน้า Coming soon, Under construction หรือมีแค่ลิงค์ไปยังโซเชียลเน็ตเวิร์ค)

This means we're looking for sites that publish content directly on the website itself, rather than just linking to content on other platforms.

Would you be able to add some original content to your site? Once you've added some content, please let me know so we can take another look. Thanks!
EOF
)"
```

##### 4. If using public domain (not allowed)

```bash
# Comment about domain requirement
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Thanks for your interest in joining the webring. However, for this webring you need your own domain as specified in the rules:

> อยู่บนโดเมนของตัวเอง (ไม่รับเว็บที่ใช้โดเมนสาธารณะ เช่น .github.io, .netlify.app, .firebaseapp.com หรือ .web.app)

Can you use another domain that you own?
EOF
)"
```

##### 5. If webring icon not visible

```bash
# Comment about icon visibility
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Thanks for your submission. The webring icon is not visible in light/dark mode. Please ensure it's visible in all color schemes.
EOF
)"
```

##### 6. If backlink format is incorrect

```bash
# Comment with correct format
gh pr comment <PR_NUMBER> --body "$(cat <<'EOF'
@<USERNAME> Your backlink format needs adjustment. Please change it to: `https://webring.wonderful.software#yourdomain.com` without https:// in the fragment identifier.
EOF
)"
```

### PR Review Process
1. **Initial Processing**:
   - Add the "review" label: `gh pr edit <PR_NUMBER> --add-label "review"`
   - Extract and provide the website URL to the user immediately for manual verification
   - Yield back to the user waiting for validation checks to complete
   - Wait for user confirmation to proceed with the review
   - Check if automated validation has run: `gh pr view --comments <PR_NUMBER>`
   - Run batch checks to review PR details: `gh pr view <PR_NUMBER>`, `gh pr checks <PR_NUMBER>`, `gh pr diff <PR_NUMBER>`, etc.

2. **Validation**:
   - Verify HTML element structure according to guidelines
   - If invalid, comment with specific issues to fix
   - If valid, provide site URL to the user for manual verification
   - Never proceed to approval without user confirmation
   
3. **Manual Review**:
   - User checks website manually against requirements
   - User reports findings and provides confirmation
   - Only after user confirmation, proceed with appropriate action (approve/request changes)
   
4. **Approval and Merge**:
   - If site meets all requirements and user confirms, approve the PR
   - Use `gh pr review <PR_NUMBER> --approve` with appropriate message
   - Merge the PR using `gh pr merge <PR_NUMBER> --squash`

### Notes on PR Workflow
- PRs are typically self-closed by creators if requirements can't be met
- Allow a few days for the submitter to make requested changes before following up
- The github-actions bot adds validation results automatically
- Be helpful and friendly in all comments
- View PR comments: `gh pr view --comments <PR_NUMBER>` (empty result means no comments)
- To check the PR, run `gh pr view <num>`, `gh pr checks <num>`, `gh pr diff <num>` and `gh pr view --comments <num>` in parallel

## Code Style Guidelines
- **Formatting**: No semicolons (Prettier with `semi: false`)
- **Types**: JSDoc comments for type annotations in JS files
- **Imports**: CommonJS with `require()`, not ES Modules
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Try/catch blocks with console.error logging
- **Architecture**: 
  - Vue 3 Composition API for components
  - Functional programming with Array methods
  - Modular organization in automation directories
  - Clear separation of concerns

## Project Structure
Main project is a webring site with automation tools for validation, updating site data, and collecting usage statistics. Look at READMEs in subdirectories for specific functionality.