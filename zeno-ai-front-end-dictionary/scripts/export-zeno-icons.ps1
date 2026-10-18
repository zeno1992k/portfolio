param(
  [Parameter(Mandatory = $true)][string]$SourceDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$brandDirectory = Join-Path $projectDirectory 'public/brand/zeno'
$iconDirectory = Join-Path $projectDirectory 'public/icons'
$null = New-Item -ItemType Directory -Path $brandDirectory -Force
$null = New-Item -ItemType Directory -Path $iconDirectory -Force

# These are source copies, not resized or recolored exports.
$sourceNames = @(
  'favicon.ico', 'icon.png', 'icon-dark.png',
  'og-image.png', 'og-image-dark.png',
  'apple-icon.png', 'apple-icon-dark.png',
  'favicon.png', 'favicon-dark.png'
)
foreach ($name in $sourceNames) {
  $source = Join-Path $SourceDirectory $name
  $destination = Join-Path $brandDirectory $name
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
    throw "Missing source asset: $source"
  }
  Copy-Item -LiteralPath $source -Destination $destination -Force
  $sourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
  $copiedHash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
  if ($sourceHash -ne $copiedHash) { throw "Source copy differs: $name" }
  Write-Output "SHA256 verified: $name $copiedHash"
}

function Export-ZenoInstallIcon {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$Size,
    [double]$Scale,
    [string]$Background
  )
  $sourceBitmap = [System.Drawing.Bitmap]::new($Source)
  $canvas = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $imageAttributes = [System.Drawing.Imaging.ImageAttributes]::new()
  try {
    if ($sourceBitmap.Width -ne 512 -or $sourceBitmap.Height -ne 512) {
      throw 'The installation export expects the original 512x512 logo.'
    }
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($Background))
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $imageAttributes.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $symbolSize = [int][Math]::Round($Size * $Scale)
    $offset = [single](($Size - $symbolSize) / 2)
    $rectangle = [System.Drawing.Rectangle]::new([int]$offset, [int]$offset, $symbolSize, $symbolSize)
    $graphics.DrawImage($sourceBitmap, $rectangle, 0, 0, 512, 512, [System.Drawing.GraphicsUnit]::Pixel, $imageAttributes)
    $canvas.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Exported: $([System.IO.Path]::GetFileName($Destination)) ${Size}x${Size}, symbol $symbolSize, background $Background"
  } finally {
    $imageAttributes.Dispose()
    $graphics.Dispose()
    $canvas.Dispose()
    $sourceBitmap.Dispose()
  }
}

foreach ($theme in @('light', 'dark')) {
  $dark = $theme -eq 'dark'
  $sourceName = if ($dark) { 'icon-dark.png' } else { 'icon.png' }
  $suffix = if ($dark) { '-dark' } else { '' }
  $background = if ($dark) { '#1B1C1E' } else { '#FFFFFF' }
  foreach ($size in @(192, 512)) {
    Export-ZenoInstallIcon -Source (Join-Path $brandDirectory $sourceName) `
      -Destination (Join-Path $iconDirectory "zeno${suffix}-${size}.png") `
      -Size $size -Scale 0.78 -Background $background
  }
  # A square of width 56% fits entirely in the central 80%-diameter safe circle.
  Export-ZenoInstallIcon -Source (Join-Path $brandDirectory $sourceName) `
    -Destination (Join-Path $iconDirectory "zeno${suffix}-maskable-512.png") `
    -Size 512 -Scale 0.56 -Background $background
}
