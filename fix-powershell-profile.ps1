# PowerShell Profile Fix Script
# This script diagnoses and fixes the PowerShell profile path issue

Write-Host "=== PowerShell Profile Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if profile paths are valid
Write-Host "Checking profile paths..." -ForegroundColor Yellow
try {
    $allProfiles = @(
        $PROFILE.AllUsersAllHosts,
        $PROFILE.AllUsersCurrentHost,
        $PROFILE.CurrentUserAllHosts,
        $PROFILE.CurrentUserCurrentHost
    )
    
    foreach ($profilePath in $allProfiles) {
        if ($profilePath) {
            Write-Host "Profile: $profilePath" -ForegroundColor White
            try {
                $isValid = [System.IO.Path]::GetFullPath($profilePath) -ne $null
                $exists = Test-Path $profilePath
                Write-Host "  - Valid: $isValid, Exists: $exists" -ForegroundColor Green
            } catch {
                Write-Host "  - ERROR: Invalid path format!" -ForegroundColor Red
                Write-Host "  - Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "ERROR: Could not access profile paths" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Fixing Profile Path ===" -ForegroundColor Cyan

# The fix: Reset the profile path by clearing environment variables that might cause issues
try {
    # Get the correct profile path
    $documentsPath = [Environment]::GetFolderPath('MyDocuments')
    $correctProfilePath = Join-Path $documentsPath "PowerShell\Microsoft.PowerShell_profile.ps1"
    
    Write-Host "Correct profile path should be: $correctProfilePath" -ForegroundColor Green
    
    # Create the directory if it doesn't exist
    $profileDir = Split-Path $correctProfilePath -Parent
    if (-not (Test-Path $profileDir)) {
        Write-Host "Creating profile directory: $profileDir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    
    # Create a minimal profile if it doesn't exist
    if (-not (Test-Path $correctProfilePath)) {
        Write-Host "Creating minimal profile file..." -ForegroundColor Yellow
        Set-Content -Path $correctProfilePath -Value "# PowerShell Profile`n# Created by fix script`n"
    }
    
    Write-Host ""
    Write-Host "=== Solution Steps ===" -ForegroundColor Cyan
    Write-Host "1. Close and reopen VS Code" -ForegroundColor White
    Write-Host "2. If the issue persists, try:" -ForegroundColor White
    Write-Host "   - Open VS Code Settings (Ctrl+,)" -ForegroundColor White
    Write-Host "   - Search for 'powershell.profile'" -ForegroundColor White
    Write-Host "   - Clear or set the profile path to: $correctProfilePath" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Alternative: Disable PowerShell profile loading" -ForegroundColor White
    Write-Host "   - Add to VS Code settings.json:" -ForegroundColor White
    Write-Host '   "powershell.enableProfileLoading": false' -ForegroundColor Gray
    
} catch {
    Write-Host "Error during fix: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Environment Variables Check ===" -ForegroundColor Cyan
$envVars = @('PSModulePath', 'HOME', 'USERPROFILE')
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "$var = $value" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Green

