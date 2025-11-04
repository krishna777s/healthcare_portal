# Git Commands to Push Changes

Run these commands in your terminal (PowerShell or Command Prompt):

## Step 1: Navigate to the project directory
```powershell
cd "d:\Cerevyn Solutions\cerevyn-ai-health"
```

## Step 2: Update the remote repository URL
```powershell
git remote set-url origin https://github.com/Sravyatammana-ab/enity-management-hospitals.git
```

## Step 3: Verify the remote URL
```powershell
git remote -v
```

## Step 4: Add all changes
```powershell
git add .
```

## Step 5: Commit all changes
```powershell
git commit -m "Initial commit: Hospital Management Portal with authentication and dashboard"
```

## Step 6: Push to the repository
```powershell
git push -u origin main
```

## Alternative: If you get an error about unrelated histories
If you see an error about unrelated histories, use:
```powershell
git push -u origin main --force
```

**Note:** Only use `--force` if you're sure you want to overwrite the remote repository.

