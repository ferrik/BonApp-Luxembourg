# copy-placeholder-images.ps1
# Run once to copy AI-generated placeholder images to public/images/
# Usage: .\copy-placeholder-images.ps1

$srcDir = "C:\Users\Acer\.gemini\antigravity\brain\3ef73fc0-de4c-4c69-b5b5-78b2b750d44e"
$destDir = "D:\Antigravity_pinterest\BonApp_Luxembourg_OS\frontend\public\images"

New-Item -ItemType Directory -Force $destDir | Out-Null

$files = @{
  "placeholder-dinner.jpg"     = "placeholder_dinner_1778043082634.png"
  "placeholder-coffee.jpg"     = "placeholder_coffee_1778043157076.png"
  "placeholder-drinks.jpg"     = "placeholder_drinks_1778043310029.png"
  "placeholder-quick.jpg"      = "placeholder_quick_1778043322757.png"
  "placeholder-restaurant.jpg" = "placeholder_restaurant_1778043345436.png"
}

foreach ($dest in $files.Keys) {
  $src = Join-Path $srcDir $files[$dest]
  $dst = Join-Path $destDir $dest
  if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "✓ Copied $dest"
  } else {
    Write-Host "✗ Source not found: $src"
  }
}

Write-Host "`nDone. Images are in: $destDir"
