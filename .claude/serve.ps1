$root = "E:\Claude Repo\TDM Hyderabad - Landing Page"
$prefix = "http://localhost:5599/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
$mime = @{
  ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".js"="application/javascript; charset=utf-8"; ".svg"="image/svg+xml";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
  ".webp"="image/webp"; ".ico"="image/x-icon"; ".mp4"="video/mp4";
  ".woff2"="font/woff2"; ".txt"="text/plain; charset=utf-8"; ".json"="application/json"
}
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $full = Join-Path $root ($rel -replace '/', '\')
    if (Test-Path $full -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $ct
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
      $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    }
    $ctx.Response.Close()
  } catch { }
}
