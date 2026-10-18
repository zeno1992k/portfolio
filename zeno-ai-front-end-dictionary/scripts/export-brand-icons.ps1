$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$brandSourcePath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public\brand\symbol.png'))
$brandOutputDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\public\icons'))
New-Item -ItemType Directory -Path $brandOutputDirectory -Force | Out-Null

# Export the supplied artwork at installation sizes. Keep the source unchanged.
# The maskable export uses more space around the artwork for platform cropping.
$brandIconExports = @(
    @{Name='commute-favicon-32.png'; Size=32; Scale=0.92},
    @{Name='commute-apple-touch.png'; Size=180; Scale=0.84},
    @{Name='commute-192.png'; Size=192; Scale=0.84},
    @{Name='commute-512.png'; Size=512; Scale=0.84},
    @{Name='commute-maskable-512.png'; Size=512; Scale=0.64},
    @{Name='commute-1024.png'; Size=1024; Scale=0.84}
)

$brandSourceImage = [System.Drawing.Image]::FromFile($brandSourcePath)
try {
    foreach ($brandIconExport in $brandIconExports) {
        $brandCanvas = [System.Drawing.Bitmap]::new($brandIconExport.Size, $brandIconExport.Size, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $brandGraphics = [System.Drawing.Graphics]::FromImage($brandCanvas)
        $brandImageAttributes = [System.Drawing.Imaging.ImageAttributes]::new()
        try {
            $brandGraphics.Clear([System.Drawing.Color]::White)
            $brandGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $brandGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $brandGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $brandImageAttributes.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

            $brandFitScale = $brandIconExport.Size * $brandIconExport.Scale / [Math]::Max($brandSourceImage.Width, $brandSourceImage.Height)
            $brandDrawWidth = [int][Math]::Round($brandSourceImage.Width * $brandFitScale)
            $brandDrawHeight = [int][Math]::Round($brandSourceImage.Height * $brandFitScale)
            $brandRectangle = [System.Drawing.Rectangle]::new(
                [int][Math]::Floor(($brandIconExport.Size - $brandDrawWidth) / 2),
                [int][Math]::Floor(($brandIconExport.Size - $brandDrawHeight) / 2),
                $brandDrawWidth,
                $brandDrawHeight
            )
            $brandGraphics.DrawImage($brandSourceImage, $brandRectangle, 0, 0, $brandSourceImage.Width, $brandSourceImage.Height, [System.Drawing.GraphicsUnit]::Pixel, $brandImageAttributes)
            $brandOutputPath = Join-Path $brandOutputDirectory $brandIconExport.Name
            $brandCanvas.Save($brandOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Output "$($brandIconExport.Name): $($brandIconExport.Size) x $($brandIconExport.Size)"
        } finally {
            $brandImageAttributes.Dispose()
            $brandGraphics.Dispose()
            $brandCanvas.Dispose()
        }
    }
} finally {
    $brandSourceImage.Dispose()
}
