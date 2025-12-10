# Bundle Distribution Setup (For Maintainers)

**Audience:** XIAOMA maintainers setting up bundle auto-publishing

---

## One-Time Setup

Run these commands once to enable auto-publishing:

```bash
# 1. Create xiaoma-bundles repo
gh repo create xiaoma-code-org/xiaoma-bundles --public --description "XIAOMA Web Bundles"

# 2. Ensure `main` exists (GitHub Pages API requires a source branch)
git clone git@github.com:xiaoma-code-org/xiaoma-bundles.git
cd xiaoma-bundles
printf '# xiaoma-bundles\n\nStatic bundles published from XIAOMA-CLI.\n' > README.md
git add README.md
git commit -m "Initial commit"
git push origin main
cd -

# 3. Enable GitHub Pages (API replacement for removed --enable-pages flag)
gh api repos/xiaoma-code-org/xiaoma-bundles/pages --method POST -f source[branch]=main -f source[path]=/
# (Optional) confirm status
gh api repos/xiaoma-code-org/xiaoma-bundles/pages --jq '{status,source}'

# 4. Create GitHub PAT and add as secret
# Go to: https://github.com/settings/tokens/new
# Scopes: repo (full control)
# Name: xiaoma-bundles-ci
# Then add as secret:
gh secret set BUNDLES_PAT --repo xiaoma-code-org/XIAOMA-CLI
# (paste PAT when prompted)
```

If the Pages POST returns `409`, the site already exists. If it returns `422` about `main` missing, redo step 2 to push the initial commit.

**Done.** Bundles auto-publish on every main merge.

---

## How It Works

**On main merge:**

- `.github/workflows/bundle-latest.yaml` runs
- Publishes to: `https://xiaoma-code-org.github.io/xiaoma-bundles/`

**On release:**

- `npm run release:patch` runs `.github/workflows/manual-release.yaml`
- Attaches bundles to: `https://github.com/xiaoma-code-org/XIAOMA-CLI/releases/latest`

---

## Testing

```bash
# Test latest channel
git push origin main
# Wait 2 min, then: curl https://xiaoma-code-org.github.io/xiaoma-bundles/

# Test stable channel
npm run release:patch
# Check: gh release view
```

---

## Troubleshooting

**"Permission denied" or auth errors**

```bash
# Verify PAT secret exists
gh secret list --repo xiaoma-code-org/XIAOMA-CLI | grep BUNDLES_PAT

# If missing, recreate PAT and add secret:
gh secret set BUNDLES_PAT --repo xiaoma-code-org/XIAOMA-CLI
```

**GitHub Pages not updating / need to re-check config**

```bash
gh api repos/xiaoma-code-org/xiaoma-bundles/pages --jq '{status,source,html_url}'
```

---

## Distribution URLs

**Stable:** `https://github.com/xiaoma-code-org/XIAOMA-CLI/releases/latest`
**Latest:** `https://xiaoma-code-org.github.io/xiaoma-bundles/`
