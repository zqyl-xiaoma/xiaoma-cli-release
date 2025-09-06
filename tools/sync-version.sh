#!/bin/bash

# Sync local version with published npm version
# Run this after a release if the version bump commit didn't sync automatically

echo "🔄 Syncing local version with npm..."

# Get the latest published version
VERSION=$(npm view xiaoma-cli@latest version)
echo "📦 Latest published version: $VERSION"

# Update package.json
npm version $VERSION --no-git-tag-version

# Update installer package.json
sed -i '' 's/"version": ".*"/"version": "'$VERSION'"/' tools/installer/package.json

# Commit and push
git add package.json tools/installer/package.json
git commit -m "sync: update to published version $VERSION"
git push

echo "✅ Synced to version $VERSION"