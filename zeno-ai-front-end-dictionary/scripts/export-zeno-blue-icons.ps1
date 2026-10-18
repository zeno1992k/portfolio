param(
  [Parameter(Mandatory = $true)][string]$SourceSvg,
  [Parameter(Mandatory = $true)][string]$SourceDarkSvg
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$brandDirectory = Join-Path $projectDirectory 'public/brand/zeno-blue'
$iconDirectory = Join-Path $projectDirectory 'public/icons'
$null = New-Item -ItemType Directory -Path $brandDirectory -Force
$null = New-Item -ItemType Directory -Path $iconDirectory -Force

function Read-ZenoSvg {
  param([string]$Source,[string]$Name,[string]$ExpectedFill)
  $destination = Join-Path $brandDirectory $Name
  if ([System.IO.Path]::GetFullPath($Source) -ne [System.IO.Path]::GetFullPath($destination)) {
    Copy-Item -LiteralPath $Source -Destination $destination -Force
  }
  $originalHash = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
  $copiedHash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
  if ($originalHash -ne $copiedHash) { throw 'The copied SVG differs from its source.' }
  Write-Host "$Name SHA256 verified: $copiedHash"
  $document = [System.Xml.XmlDocument]::new()
  $document.XmlResolver = $null
  $document.Load($destination)
  $root = $document.DocumentElement
  if ($root.LocalName -ne 'svg' -or $root.GetAttribute('viewBox') -ne '0 0 145 145' -or
      $root.GetAttribute('width') -ne '145' -or $root.GetAttribute('height') -ne '145') {
    throw 'This renderer expects the supplied 145x145 SVG viewBox.'
  }
  foreach ($attribute in $root.Attributes) {
    if ($attribute.Name -notin @('width','height','viewBox','fill','xmlns')) {
      throw "Unsupported SVG attribute: $($attribute.Name)"
    }
  }
  $data = [System.Collections.Generic.List[string]]::new()
  $fills = [System.Collections.Generic.List[string]]::new()
  foreach ($node in $root.ChildNodes) {
    if ($node.NodeType -ne [System.Xml.XmlNodeType]::Element) { continue }
    if ($node.LocalName -ne 'path') { throw "Unsupported SVG element: $($node.LocalName)" }
    foreach ($attribute in $node.Attributes) {
      if ($attribute.Name -notin @('d','fill')) { throw "Unsupported path attribute: $($attribute.Name)" }
    }
    if ($node.GetAttribute('fill') -ne $ExpectedFill) { throw 'The original mode-specific fill changed.' }
    $data.Add($node.GetAttribute('d'))
    $fills.Add($node.GetAttribute('fill'))
  }
  if ($data.Count -ne 2) { throw 'The supplied logo must contain its two original paths.' }
  return [pscustomobject]@{ Data=$data.ToArray(); Fills=$fills.ToArray() }
}
$light = Read-ZenoSvg -Source $SourceSvg -Name 'logo.svg' -ExpectedFill '#0066FF'
$dark = Read-ZenoSvg -Source $SourceDarkSvg -Name 'logo-dark.svg' -ExpectedFill '#5E9FFF'

$rasterCode = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.Text.RegularExpressions;

public static class ZenoBlueRaster {
  private const string Token = @"[MLCHVZ]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?";
  private static float Number(MatchCollection tokens, ref int index) {
    if(index >= tokens.Count || Regex.IsMatch(tokens[index].Value, @"^[MLCHVZ]$"))
      throw new ArgumentException("Missing coordinate in SVG path.");
    return float.Parse(tokens[index++].Value, NumberStyles.Float, CultureInfo.InvariantCulture);
  }
  public static GraphicsPath Parse(string data) {
    if(Regex.IsMatch(Regex.Replace(data, Token, ""), @"[^\s,]"))
      throw new ArgumentException("Only absolute M, L, C, H, V, Z path commands are supported.");
    var tokens=Regex.Matches(data, Token);
    var path=new GraphicsPath(FillMode.Winding);
    int index=0; char command='\0'; bool started=false, closed=false;
    var current=new PointF(); var start=new PointF();
    try {
      while(index<tokens.Count) {
        var token=tokens[index].Value;
        if(Regex.IsMatch(token,@"^[MLCHVZ]$")) {
          command=token[0]; index++;
          if(command=='Z') {
            if(!started)throw new ArgumentException("A path must start with M.");
            path.CloseFigure(); current=start; closed=true; command='\0'; continue;
          }
        }
        if(command=='M') {
          var point=new PointF(Number(tokens,ref index),Number(tokens,ref index));
          path.StartFigure(); current=point; start=point; started=true; closed=false; command='L';
        } else {
          if(!started)throw new ArgumentException("A path must start with M.");
          PointF point;
          if(command=='C') {
            var control1=new PointF(Number(tokens,ref index),Number(tokens,ref index));
            var control2=new PointF(Number(tokens,ref index),Number(tokens,ref index));
            point=new PointF(Number(tokens,ref index),Number(tokens,ref index));
            path.AddBezier(current,control1,control2,point);
          } else if(command=='L') {
            point=new PointF(Number(tokens,ref index),Number(tokens,ref index));
            path.AddLine(current,point);
          } else if(command=='H') {
            point=new PointF(Number(tokens,ref index),current.Y);
            path.AddLine(current,point);
          } else if(command=='V') {
            point=new PointF(current.X,Number(tokens,ref index));
            path.AddLine(current,point);
          } else throw new ArgumentException("Unexpected coordinate or command in SVG path.");
          // All commands, including repeated C/H/V, start from the last endpoint.
          current=point; closed=false;
        }
      }
      if(!closed)throw new ArgumentException("The supplied filled path must close with Z.");
      return path;
    } catch {path.Dispose();throw;}
  }
  public static Bitmap Render(GraphicsPath[] paths,string[] fills,int width,int height,float logoWidth,string background) {
    const int sample=4;
    // PowerShell binds a null string argument as an empty CLR string.
    bool transparent=string.IsNullOrEmpty(background);
    var format=transparent?PixelFormat.Format32bppArgb:PixelFormat.Format24bppRgb;
    using(var high=new Bitmap(width*sample,height*sample,format)) {
      using(var graphics=Graphics.FromImage(high)) {
        graphics.Clear(transparent?Color.Transparent:ColorTranslator.FromHtml(background));
        graphics.SmoothingMode=SmoothingMode.AntiAlias;
        graphics.PixelOffsetMode=PixelOffsetMode.HighQuality;
        float scale=logoWidth/145f;
        float left=(width-logoWidth)/2f, top=(height-logoWidth)/2f;
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

if (-not ('ZenoBlueRaster' -as [type])) {
  if ($PSVersionTable.PSEdition -eq 'Core') {
    $references = @([System.Drawing.Bitmap].Assembly.Location, [System.Drawing.Color].Assembly.Location,
      'System.Runtime.dll','System.Collections.dll','System.Text.RegularExpressions.dll')
    foreach ($assembly in @('System.Private.Windows.Core.dll','System.Private.Windows.GdiPlus.dll')) {
      $assemblyPath = Join-Path $PSHOME $assembly
      if (Test-Path -LiteralPath $assemblyPath) { $references += $assemblyPath }
    }
  } else { $references = @('System.Drawing','System.Core') }
  Add-Type -TypeDefinition $rasterCode -ReferencedAssemblies $references
}

$lightPaths = [System.Drawing.Drawing2D.GraphicsPath[]]@($light.Data | ForEach-Object { [ZenoBlueRaster]::Parse($_) })
$darkPaths = [System.Drawing.Drawing2D.GraphicsPath[]]@($dark.Data | ForEach-Object { [ZenoBlueRaster]::Parse($_) })
function Export-ZenoPng {
  param([string]$Name,[int]$Width,[int]$Height,[single]$LogoWidth,[AllowNull()][string]$Background,
    [string]$Directory,[System.Drawing.Drawing2D.GraphicsPath[]]$Paths,[string[]]$Fills)
  $bitmap = [ZenoBlueRaster]::Render($Paths,$Fills,$Width,$Height,$LogoWidth,$Background)
  try {
    $bitmap.Save((Join-Path $Directory $Name),[System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "Exported: $Name ${Width}x${Height}, background $(if($Background){$Background}else{'transparent'})"
  } finally { $bitmap.Dispose() }
}

try {
  $probe=[ZenoBlueRaster]::Parse('M1 2C3 4 5 6 7 8C9 10 11 12 13 14H15V16L17 18Z')
  try {
    $expected=@(@(7,8),@(13,14),@(15,14),@(15,16),@(17,18))
    $indices=@(3,6,7,8,9)
    for($i=0;$i -lt $indices.Count;$i++) {
      $point=$probe.PathPoints[$indices[$i]]
      if ($point.X -ne $expected[$i][0] -or $point.Y -ne $expected[$i][1]) {
        throw 'SVG cubic/horizontal/vertical current-point validation failed.'
      }
    }
    if ($lightPaths[0].PointCount -ne 13 -or $lightPaths[0].PathPoints[3].X -ne 21 -or
        $lightPaths[0].PathPoints[3].Y -ne 42 -or $darkPaths[0].PointCount -ne 13) {
      throw 'The supplied four-cubic circle failed validation.'
    }
  } finally {$probe.Dispose()}
  Write-Output 'C/H/V current-point and original circle assertions passed.'
  foreach ($theme in @('light','dark')) {
    $isDark=$theme -eq 'dark'
    $suffix=if($isDark){'-dark'}else{''}
    $background=if($isDark){'#1B1C1E'}else{'#FFFFFF'}
    $paths=if($isDark){$darkPaths}else{$lightPaths}
    $fills=if($isDark){$dark.Fills}else{$light.Fills}
    $mode=@{ Paths=$paths; Fills=$fills }
    Export-ZenoPng @mode -Name "favicon${suffix}.png" -Width 32 -Height 32 -LogoWidth 28.8 -Background $null -Directory $brandDirectory
    Export-ZenoPng @mode -Name "apple-icon${suffix}.png" -Width 180 -Height 180 -LogoWidth 140.4 -Background $background -Directory $brandDirectory
    Export-ZenoPng @mode -Name "og-image${suffix}.png" -Width 1200 -Height 630 -LogoWidth 320 -Background $background -Directory $brandDirectory
    foreach ($size in @(192,512)) {
      Export-ZenoPng @mode -Name "zeno-blue${suffix}-${size}.png" -Width $size -Height $size -LogoWidth ($size*0.78) -Background $background -Directory $iconDirectory
    }
    Export-ZenoPng @mode -Name "zeno-blue${suffix}-maskable-512.png" -Width 512 -Height 512 -LogoWidth (512*0.56) -Background $background -Directory $iconDirectory
  }

  # ICO fallback uses the light original and transparent PNG-encoded frames.
  $frames=[System.Collections.Generic.List[byte[]]]::new()
  $sizes=@(16,32,48,256)
  foreach($size in $sizes) {
    $bitmap=[ZenoBlueRaster]::Render($lightPaths,$light.Fills,$size,$size,($size*0.9),$null)
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
  Write-Output 'Exported: favicon.ico 16/32/48/256px transparent PNG frames'
} finally {foreach($path in @($lightPaths)+@($darkPaths)){$path.Dispose()}}
