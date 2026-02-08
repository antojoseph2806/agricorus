# Quick Git Commands Reference

## 🚀 First Time Setup (Do Once)

```bash
# 1. Clean tracked files that should be ignored
CLEAN_GIT_REPO.bat

# 2. Check status
git status

# 3. Add all changes
git add .

# 4. Commit
git commit -m "chore: update .gitignore and remove sensitive files"

# 5. Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/agricorus.git

# 6. Push to GitHub
git push -u origin main
```

## 📤 Regular Updates (Daily Use)

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "your commit message here"

# 4. Push to remote
git push
```

## 🔍 Useful Commands

### Check Status
```bash
git status                    # See what changed
git diff                      # See detailed changes
git log --oneline            # See commit history
```

### Add Files
```bash
git add .                     # Add all files
git add filename.js          # Add specific file
git add folder/              # Add entire folder
```

### Commit
```bash
git commit -m "message"      # Commit with message
git commit -am "message"     # Add and commit in one step
```

### Push/Pull
```bash
git push                     # Push to remote
git pull                     # Pull from remote
git fetch                    # Fetch changes without merging
```

### Branches
```bash
git branch                   # List branches
git branch feature-name      # Create new branch
git checkout feature-name    # Switch to branch
git checkout -b feature-name # Create and switch
git merge feature-name       # Merge branch into current
```

### Undo Changes
```bash
git restore filename.js      # Discard changes in file
git restore .                # Discard all changes
git reset HEAD~1             # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)
```

## 📝 Commit Message Conventions

```bash
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Examples:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login error"
git commit -m "docs: update README with setup instructions"
git commit -m "chore: update dependencies"
```

## 🔒 If You Committed Sensitive Data

```bash
# 1. Remove from tracking
git rm --cached .env

# 2. Add to .gitignore
echo ".env" >> .gitignore

# 3. Commit the removal
git commit -m "chore: remove .env from tracking"

# 4. Push
git push

# 5. IMPORTANT: Change all secrets in the .env file!
```

## 🌿 Working with Branches

### Feature Branch Workflow
```bash
# 1. Create feature branch
git checkout -b feature/user-profile

# 2. Make changes and commit
git add .
git commit -m "feat: add user profile page"

# 3. Push feature branch
git push -u origin feature/user-profile

# 4. Switch back to main
git checkout main

# 5. Merge feature (after review)
git merge feature/user-profile

# 6. Push main
git push

# 7. Delete feature branch (optional)
git branch -d feature/user-profile
```

## 🔄 Syncing with Team

```bash
# Before starting work
git pull                     # Get latest changes

# After finishing work
git add .
git commit -m "your message"
git pull                     # Get any new changes
git push                     # Push your changes
```

## 🆘 Common Issues

### "Permission denied"
```bash
# Check remote URL
git remote -v

# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/agricorus.git
```

### "Merge conflict"
```bash
# 1. Open conflicted files
# 2. Resolve conflicts (remove <<<, ===, >>> markers)
# 3. Add resolved files
git add .
# 4. Commit
git commit -m "fix: resolve merge conflicts"
```

### "Large files"
```bash
# Check .gitignore is correct
cat .gitignore

# Remove large files from tracking
git rm -r --cached node_modules
git commit -m "chore: remove node_modules"
```

## 📊 Check Repository Size

```bash
# See repository size
git count-objects -vH

# See largest files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort --numeric-sort --key=2 | tail -n 10
```

## 🎯 Quick Checklist Before Push

- [ ] `git status` - Check what's being committed
- [ ] No .env files listed
- [ ] No node_modules listed
- [ ] No service-account.json listed
- [ ] Commit message is clear
- [ ] Code is tested
- [ ] Ready to push!

```bash
git push
```
