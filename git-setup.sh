#!/bin/bash

# StabilityScore - Git Setup Script
# This script helps you commit and push your app to GitHub

echo "🚀 StabilityScore - Git Setup"
echo "================================"
echo ""

# Check if git is initialized
if [ -d .git ]; then
    echo "✅ Git already initialized"
else
    echo "📦 Initializing Git..."
    git init
    echo "✅ Git initialized"
fi

echo ""
echo "📝 Current Status:"
git status --short

echo ""
echo "================================"
echo "NEXT STEPS:"
echo "================================"
echo ""
echo "1️⃣  Create a GitHub repository:"
echo "   Go to: https://github.com/new"
echo "   Repository name: stability-score (or any name)"
echo "   Keep it PUBLIC or PRIVATE"
echo "   Do NOT initialize with README"
echo ""
echo "2️⃣  After creating repo, run these commands:"
echo ""
echo "   # Add all files"
echo "   git add ."
echo ""
echo "   # Commit"
echo "   git commit -m \"StabilityScore v2.0: Complete Financial Risk Scanner\""
echo ""
echo "   # Add your repository (replace with YOUR URL)"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo ""
echo "   # Push to GitHub"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "================================"
echo ""
echo "📚 Need detailed help? Check: /app/GIT_SETUP_GUIDE.md"
echo ""
