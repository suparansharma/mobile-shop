$srcDir = "d:\office\akash vai\gadget&parrk\frontend\src"

# Get all .tsx, .ts, .css files
$files = Get-ChildItem -Path $srcDir -Recurse -Include *.tsx,*.ts,*.css | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content

    # ===== INDIGO to ORANGE mapping =====
    # indigo-50 -> orange-950 (very subtle bg)
    $content = $content -replace 'indigo-50', 'orange-950'
    # indigo-100 -> orange-900
    $content = $content -replace 'indigo-100', 'orange-900'
    # indigo-200 -> orange-800
    $content = $content -replace 'indigo-200', 'orange-800'
    # indigo-300 -> orange-700
    $content = $content -replace 'indigo-300', 'orange-700'
    # indigo-400 -> orange-500
    $content = $content -replace 'indigo-400', 'orange-500'
    # indigo-500 -> orange-500
    $content = $content -replace 'indigo-500', 'orange-500'
    # indigo-600 -> orange-500
    $content = $content -replace 'indigo-600', 'orange-500'
    # indigo-700 -> orange-600
    $content = $content -replace 'indigo-700', 'orange-600'
    # indigo-800 -> orange-700
    $content = $content -replace 'indigo-800', 'orange-700'
    # indigo-900 -> orange-800
    $content = $content -replace 'indigo-900', 'orange-800'

    # ===== BLUE to ORANGE mapping =====
    $content = $content -replace 'blue-50', 'orange-950'
    $content = $content -replace 'blue-100', 'orange-900'
    $content = $content -replace 'blue-200', 'orange-800'
    $content = $content -replace 'blue-300', 'orange-700'
    $content = $content -replace 'blue-400', 'orange-500'
    $content = $content -replace 'blue-500', 'orange-500'
    $content = $content -replace 'blue-600', 'orange-500'
    $content = $content -replace 'blue-700', 'orange-600'
    $content = $content -replace 'blue-800', 'orange-700'
    $content = $content -replace 'blue-900', 'orange-800'

    # ===== PURPLE to ORANGE mapping =====
    $content = $content -replace 'purple-50', 'orange-950'
    $content = $content -replace 'purple-100', 'orange-900'
    $content = $content -replace 'purple-500', 'orange-600'
    $content = $content -replace 'purple-600', 'orange-600'
    $content = $content -replace 'purple-700', 'orange-700'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nColor replacement complete!"
