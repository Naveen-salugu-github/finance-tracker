# Git Setup & Deployment Guide for StabilityScore

## 📦 Quick Start: Push to Your Git Repository

### Option 1: Push to GitHub (Recommended)

```bash
# Navigate to project root
cd /app

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: StabilityScore Financial Risk Scanner with What-If Analysis"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME and YOUR_REPO with your actual GitHub details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 2: Push to GitLab

```bash
cd /app
git init
git add .
git commit -m "Initial commit: StabilityScore app"
git remote add origin https://gitlab.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Option 3: Push to Bitbucket

```bash
cd /app
git init
git add .
git commit -m "Initial commit: StabilityScore app"
git remote add origin https://bitbucket.org/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🔐 Authentication Methods

### Method 1: HTTPS with Personal Access Token (Easiest)

1. **Create a Personal Access Token:**
   - **GitHub**: Settings → Developer settings → Personal access tokens → Generate new token
   - **GitLab**: Settings → Access Tokens → Add new token
   - **Bitbucket**: Settings → Personal settings → App passwords

2. **Use token as password when pushing:**
   ```bash
   git push -u origin main
   # Username: your-username
   # Password: paste-your-token-here
   ```

### Method 2: SSH Keys (More Secure)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add this key to your Git provider:
# GitHub: Settings → SSH and GPG keys
# GitLab: Settings → SSH Keys
# Bitbucket: Settings → SSH keys

# Use SSH remote URL
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 📂 What Gets Committed

### ✅ Files that WILL be committed:
```
/app/frontend/          # Your mobile app code
/app/backend/           # FastAPI backend
/app/README_STABILITYSCORE.md
/app/GIT_SETUP_GUIDE.md
/app/entrypoint.sh
/app/config.json
```

### ❌ Files that WON'T be committed (.gitignore):
```
node_modules/          # Dependencies
.expo/                 # Expo cache
.env                   # Environment variables (keep secret!)
*.log                  # Log files
__pycache__/          # Python cache
*.pyc                 # Python compiled files
.DS_Store             # Mac files
```

---

## 🔄 Making Changes & Pushing Updates

### Daily Workflow:

```bash
# Check current changes
git status

# Add specific files
git add frontend/app/components/NewComponent.tsx

# Or add all changes
git add .

# Commit with descriptive message
git commit -m "Add premium subscription feature"

# Push to remote
git push origin main
```

### Creating Feature Branches:

```bash
# Create and switch to new branch
git checkout -b feature/ai-advisor

# Make your changes...
git add .
git commit -m "Add AI financial advisor feature"

# Push branch
git push origin feature/ai-advisor

# On GitHub/GitLab: Create Pull Request to merge into main
```

---

## 🚀 Clone & Continue Development

### On Another Machine:

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
cd frontend
yarn install

# Start development
cd ..
./entrypoint.sh
```

---

## 📱 PWA Deployment (FREE Option)

### Deploy to Netlify (100% Free):

1. **Push code to GitHub** (see above)

2. **Deploy on Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository
   - Build settings:
     ```
     Base directory: frontend
     Build command: yarn build
     Publish directory: frontend/dist
     ```
   - Click "Deploy site"

3. **Result**: You get a free URL like `https://your-app.netlify.app`

### Deploy to Vercel (100% Free):

1. Push to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Deploy automatically!

---

## 📦 Building Native Apps (Android APK)

### FREE Android APK (Direct Distribution):

```bash
cd /app/frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download APK and share via:
# - Your website
# - Google Drive
# - WhatsApp/Telegram
# - Direct download link
```

---

## 💡 Advanced Git Commands

### Undo Last Commit (Keep Changes):
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes):
```bash
git reset --hard HEAD~1
```

### View Commit History:
```bash
git log --oneline
```

### Create Tag/Release:
```bash
git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
```

### Pull Latest Changes:
```bash
git pull origin main
```

---

## 🆘 Common Issues & Solutions

### Issue: "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin YOUR_NEW_URL
```

### Issue: "Permission denied (publickey)"
- You need to set up SSH keys (see Method 2 above)
- Or use HTTPS with personal access token

### Issue: Merge Conflicts
```bash
# Pull latest changes first
git pull origin main

# Fix conflicts in files (look for <<<<<<< markers)
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Issue: Large Files Not Uploading
```bash
# Add to .gitignore before committing
echo "large-file.zip" >> .gitignore
git rm --cached large-file.zip
git commit -m "Remove large file"
```

---

## 📚 Useful Resources

- **GitHub Docs**: https://docs.github.com
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/

---

## 🎯 Next Steps After Pushing to Git

1. **Set up CI/CD** (automatic testing/deployment)
2. **Add collaborators** to your repository
3. **Create README.md** with app screenshots
4. **Set up GitHub Actions** for automated builds
5. **Create releases** for version management

---

## 💬 Questions?

- Git: https://git-scm.com/doc
- GitHub Community: https://github.community
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

---

**Ready to push? Run this now:**

```bash
cd /app
git init
git add .
git commit -m "Initial commit: StabilityScore with What-If Analysis"
# Then add your remote and push!
```
