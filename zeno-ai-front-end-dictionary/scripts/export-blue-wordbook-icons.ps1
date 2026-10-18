param(
  [Parameter(Mandatory = $true)][string]$SourceSvg
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$brandDirectory = Join-Path $projectDirectory 'public/brand/blue-wordbook'
$iconDirectory = Join-Path $projectDirectory 'public/icons'
$null = New-Item -ItemType Directory -Path $brandDirectory -Force
$null = New-Item -ItemType Directory -Path $iconDirectory -Force
$copiedSvg = Join-Path $brandDirectory 'logo.svg'
Copy-Item -LiteralPath $SourceSvg -Destination $copiedSvg -Force
$originalHash = (Get-FileHash -LiteralPath $SourceSvg -Algorithm SHA256).Hash
$copiedHash = (Get-FileHash -LiteralPath $copiedSvg -Algorithm SHA256).Hash
if ($originalHash -ne $copiedHash) { throw 'The copied SVG differs from the source.' }
Write-Output "SVG SHA256 verified: $copiedHash"

$svgDocument = [System.Xml.XmlDocument]::new()
$svgDocument.XmlResolver = $null
$svgDocument.Load($copiedSvg)
$svgRoot = $svgDocument.DocumentElement
if ($svgRoot.LocalName -ne 'svg' -or $svgRoot.GetAttribute('viewBox') -ne '0 0 51 43') {
  throw 'This renderer expects the supplied 51x43 SVG viewBox.'
}
$pathData = [System.Collections.Generic.List[string]]::new()
$fills = [System.Collections.Generic.List[string]]::new()
foreach ($node in $svgRoot.ChildNodes) {
  if ($node.NodeType -ne [System.Xml.XmlNodeType]::Element) { continue }
  if ($node.LocalName -ne 'path') { throw "Unsupported SVG element: $($node.LocalName)" }
  foreach ($attribute in $node.Attributes) {
    if ($attribute.Name -notin @('d', 'fill')) { throw "Unsupported path attribute: $($attribute.Name)" }
  }
  $fill = $node.GetAttribute('fill')
  if ($fill -notmatch '^#[0-9A-Fa-f]{6}$') { throw "Unsupported fill: $fill" }
  $pathData.Add($node.GetAttribute('d'))
  $fills.Add($fill)
}
if ($pathData.Count -ne 6) { throw 'The supplied logo must contain its six original paths.' }

$rasterCode = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.Text.RegularExpressions;

public static class BlueWordbookRaster {
  private const string Token = @"[MLVZ]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?";
  private static float Number(MatchCollection tokens, ref int index) {
    if(index >= tokens.Count || Regex.IsMatch(tokens[index].Value, @"^[MLVZ]$"))
      throw new ArgumentException("Missing coordinate in SVG path.");
    return float.Parse(tokens[index++].Value, NumberStyles.Float, CultureInfo.InvariantCulture);
  }
  public static GraphicsPath Parse(string data) {
    if(Regex.Replace(data, Token, "").Trim().Trim(',').Trim().Length > 0)
      throw new ArgumentException("Only absolute M, L, V, Z path commands are supported.");
    var tokens=Regex.Matches(data, Token);
    var path=new GraphicsPath(FillMode.Winding);
    int index=0; char command='\0'; bool started=false, closed=false;
    var current=new PointF(); var start=new PointF();
    try {
      while(index<tokens.Count) {
        var token=tokens[index].Value;
        if(Regex.IsMatch(token,@"^[MLVZ]$")) {
          command=token[0]; index++;
          if(command=='Z') {
            if(!started)throw new ArgumentException("A path must start with M.");
            path.CloseFigure(); current=start; closed=true; command='\0'; continue;
          }
        }
        if(command=='M') {
          var point=new PointF(Number(tokens,ref index),Number(tokens,ref index));
          path.StartFigure(); current=point; start=point; started=true; closed=false; command='L';
        } else if(command=='L') {
          if(!started)throw new ArgumentException("A path must start with M.");
          var point=new PointF(Number(tokens,ref index),Number(tokens,ref index));
          path.AddLine(current,point); current=point; closed=false;
        } else if(command=='V') {
          if(!started)throw new ArgumentException("A path must start with M.");
          // V changes only y. Each repeated V must update the current point.
          var point=new PointF(current.X,Number(tokens,ref index));
          path.AddLine(current,point); current=point; closed=false;
        } else throw new ArgumentException("Unexpected coordinate or command in SVG path.");
      }
      if(!closed)throw new ArgumentException("The supplied filled path must close with Z.");
      return path;
    } catch {path.Dispose();throw;}
  }
  public static Bitmap Render(GraphicsPath[] paths,string[] fills,int width,int height,float logoWidth,string background) {
    const int sample=4;
    // PowerShell can bind a null string argument as an empty CLR string.
    bool transparent=string.IsNullOrEmpty(background);
    var format=transparent?PixelFormat.Format32bppArgb:PixelFormat.Format24bppRgb;
    using(var high=new Bitmap(width*sample,height*sample,format)) {
      using(var graphics=Graphics.FromImage(high)) {
        graphics.Clear(transparent?Color.Transparent:ColorTranslator.FromHtml(background));
        graphics.SmoothingMode=SmoothingMode.AntiAlias;
        graphics.PixelOffsetMode=PixelOffsetMode.HighQuality;
        float scale=logoWidth/51f;
        float left=(width-logoWidth)/2f, top=(height-43f*scale)/2f;
        using(var transform=new Matrix(scale*sample,0,0,scale*sample,left*sample,top*sample)) {
          graphics.Transform=transform;
          for(int index=0;index<paths.Length;index++)
            using(var brush=new SolidBrush(ColorTranslator.FromHtml(fills[index])))graphics.FillPath(brush,paths[index]);
        }
      }
      var output=new Bitmap(width,height,format);
      using(var graphics=Graphics.FromImage(output))
      using(var attributes=new ImageAttributes()) {
        graphics.Clear(transparent?Color.Transparent:ColorTranslator.FromHtml(background));
        graphics.CompositingMode=CompositingMode.SourceCopy;
        graphics.InterpolationMode=InterpolationMode.HighQualityBicubic;
        graphics.PixelOffsetMode=PixelOffsetMode.HighQuality;
        attributes.SetWrapMode(WrapMode.TileFlipXY);
        graphics.DrawImage(high,new Rectangle(0,0,width,height),0,0,high.Width,high.Height,GraphicsUnit.Pixel,attributes);
      }
      return output;
    }
  }
}
'@

if (-not ('BlueWordbookRaster' -as [type])) {
  if ($PSVersionTable.PSEdition -eq 'Core') {
    $references = @([System.Drawing.Bitmap].Assembly.Location, [System.Drawing.Color].Assembly.Location,
      'System.Runtime.dll', 'System.Collections.dll', 'System.Text.RegularExpressions.dll')
    foreach ($assembly in @('System.Private.Windows.Core.dll', 'System.Private.Windows.GdiPlus.dll')) {
      $assemblyPath = Join-Path $PSHOME $assembly
      if (Test-Path -LiteralPath $assemblyPath) { $references += $assemblyPath }
    }
  } else { $references = @('System.Drawing', 'System.Core') }
  Add-Type -TypeDefinition $rasterCode -ReferencedAssemblies $references
}

$paths = [System.Drawing.Drawing2D.GraphicsPath[]]@($pathData | ForEach-Object { [BlueWordbookRaster]::Parse($_) })
function Export-BluePng {
  param([string]$Name,[int]$Width,[int]$Height,[single]$LogoWidth,[AllowNull()][string]$Background,[string]$Directory)
  $clear = if ($Background) { $Background } else { $null }
  $bitmap = [BlueWordbookRaster]::Render($paths,$fills.ToArray(),$Width,$Height,$LogoWidth,$clear)
  try {
    $bitmap.Save((Join-Path $Directory $Name),[System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Exported: $Name ${Width}x${Height}, background $(if($clear){$clear}else{'transparent'})"
  } finally { $bitmap.Dispose() }
}

try {
  # Assert the vertical steps that were previously easy to misinterpret.
  if ([Math]::Abs($paths[0].PathPoints[1].X - 25.0794) -gt 0.0001 -or
      [Math]::Abs($paths[0].PathPoints[1].Y - 30.1425) -gt 0.0001 -or
      [Math]::Abs($paths[4].PathPoints[2].X - 25.0789) -gt 0.0001 -or
      [Math]::Abs($paths[4].PathPoints[2].Y) -gt 0.0001) {
    throw 'SVG vertical-command current-point validation failed.'
  }
  foreach ($theme in @('light','dark')) {
    $dark=$theme -eq 'dark'
    $suffix=if($dark){'-dark'}else{''}
    $background=if($dark){'#1B1C1E'}else{'#FFFFFF'}
    Export-BluePng -Name "favicon${suffix}.png" -Width 32 -Height 32 -LogoWidth 28.8 -Background $null -Directory $brandDirectory
    Export-BluePng -Name "apple-icon${suffix}.png" -Width 180 -Height 180 -LogoWidth 140.4 -Background $background -Directory $brandDirectory
    Export-BluePng -Name "og-image${suffix}.png" -Width 1200 -Height 630 -LogoWidth 320 -Background $background -Directory $brandDirectory
    foreach ($size in @(192,512)) {
      Export-BluePng -Name "blue-wordbook${suffix}-${size}.png" -Width $size -Height $size -LogoWidth ($size*0.78) -Background $background -Directory $iconDirectory
    }
    Export-BluePng -Name "blue-wordbook${suffix}-maskable-512.png" -Width 512 -Height 512 -LogoWidth (512*0.56) -Background $background -Directory $iconDirectory
  }

  # Standard ICO directory with PNG-encoded, transparent 16/32/48/256px frames.
  $frames=[System.Collections.Generic.List[byte[]]]::new()
  $sizes=@(16,32,48,256)
  foreach($size in $sizes) {
    $bitmap=[BlueWordbookRaster]::Render($paths,$fills.ToArray(),$size,$size,($size*0.9),$null)
    $memory=[System.IO.MemoryStream]::new()
    try {$bitmap.Save($memory,[System.Drawing.Imaging.ImageFormat]::Png);$frames.Add($memory.ToArray())}
    finally {$memory.Dispose();$bitmap.Dispose()}
  }
  $stream=[System.IO.File]::Create((Join-Path $brandDirectory 'favicon.ico'))
  $writer=[System.IO.BinaryWriter]::new($stream)
  try {
    $writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]$sizes.Count)
    $offset=6+16*$sizes.Count
    for($index=0;$index -lt $sizes.Count;$index++) {
      $dimension=if($sizes[$index] -eq 256){0}else{$sizes[$index]}
      $writer.Write([byte]$dimension);$writer.Write([byte]$dimension)
      $writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([uint16]1);$writer.Write([uint16]32)
      $writer.Write([uint32]$frames[$index].Length);$writer.Write([uint32]$offset)
      $offset += $frames[$index].Length
    }
    foreach($frame in $frames){$writer.Write($frame)}
  } finally {$writer.Dispose();$stream.Dispose()}
  Write-Output 'Exported: favicon.ico 16/32/48/256px PNG frames'
  Write-Output "Original fills: $($fills -join ', ')"
} finally {foreach($path in $paths){$path.Dispose()}}
