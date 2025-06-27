
🟢 1. Git Setup (One-Time)
bash
Copy
Edit
git --version                   # Check if Git is installed
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --list               # View your global settings
📁 2. Starting a New Project
bash
Copy
Edit
git init                        # Initialize a Git repo
git status                      # Check repo status
git add .                       # Stage all files
git commit -m "Initial commit"  # Commit changes
🔗 3. Connect to Remote Repository
bash
Copy
Edit
git remote add origin https://github.com/your-user/your-repo.git
git push -u origin main         # Push code to remote (1st time)
🌀 4. Cloning a Repository
bash
Copy
Edit
git clone https://github.com/your-user/your-repo.git
🔁 5. Branching
bash
Copy
Edit
git branch                      # List branches
git branch new-feature          # Create a branch
git checkout new-feature        # Switch to branch
git checkout -b hotfix/login    # Create and switch
git merge new-feature           # Merge into current branch
📤 6. Pushing and Pulling
bash
Copy
Edit
git push                        # Push to remote (current branch)
git push origin new-feature     # Push specific branch
git pull                        # Pull latest changes
git pull origin main            # Pull from a specific branch
✏️ 7. Editing Commits
bash
Copy
Edit
git commit --amend              # Edit last commit
🧹 8. Undo and Reset
bash
Copy
Edit
git restore file.txt            # Undo changes to file (unstaged)
git reset HEAD file.txt         # Unstage file
git reset --hard                # Discard all changes
📜 9. Viewing History
bash
Copy
Edit
git log                         # Full history
git log --oneline               # Short summary
git show <commit-hash>         # View specific commit
git diff                        # View unstaged changes
git diff --staged              # View staged changes
🔍 10. Working with Tags
bash
Copy
Edit
git tag v1.0                    # Create a tag
git tag                         # List tags
git push origin v1.0            # Push specific tag
git push origin --tags          # Push all tags
🧪 11. Stashing Work (Temporary Save)
bash
Copy
Edit
git stash                       # Save current changes
git stash list                  # View saved stashes
git stash apply                 # Apply last stash
git stash drop                  # Delete last stash
🗑️ 12. Deleting Things
bash
Copy
Edit
git branch -d old-branch        # Delete local branch
git push origin --delete branch-name  # Delete remote branch
🧠 13. Advanced (Safe Rewrites, Cherry-Pick, Rebase)
bash
Copy
Edit
git rebase main                 # Reapply commits onto main
git cherry-pick <commit>        # Apply specific commit
git reflog                      # See history of HEAD (great for recovery)
🧰 14. Helpful Flags
bash
Copy
Edit
git status -s                  # Short format
git log --graph --oneline      # ASCII tree view
git diff HEAD~1 HEAD           # Compare last two commits
🚨 15. Fixing Common Errors
bash
Copy
Edit
git remote set-url origin <new-url>    # Change repo URL
git pull --rebase                      # Avoid unnecessary merge commits
git fetch --prune                      # Clean up deleted remote branches
🧪 16. Useful Aliases (Optional)
bash
Copy
Edit
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.cm 'commit -m'
