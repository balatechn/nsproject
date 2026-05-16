$tok = "23|9vxiaAd4vvERTXoultcwRyjel0hTjV4AAXZvtb8Y1c3cb556"
$base = "http://187.127.134.246:8000/api/v1"
$H = @{ Authorization = "Bearer $tok"; "Content-Type" = "application/json" }
$apiUUID = "bj8dch8qutl5jbr5q1sqp0rm"

$dbUrl = "postgres://nsproject:NsProject_DB_2026%21@s135yvxs6fhla61xn1tv1qom:5432/nsproject"
$redisUrl = "redis://default:Ags2cyDu3HxyX1cAvOwSBOQR9nBbyb86cf421ObLJgnXcK7VdpRQGg7uUKpOIB0Q@wjrqiz9bg8al94qrph9iazs1:6379/0"

# List current env vars
Write-Host "Current API env vars:"
$envs = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method GET
$envs | ForEach-Object { Write-Host "  $($_.key) = $($_.value.Substring(0, [Math]::Min(50, $_.value.Length)))..." }

# PATCH DATABASE_URL
Write-Host "`nPatching DATABASE_URL..."
$body = [ordered]@{ key = "DATABASE_URL"; value = $dbUrl } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method PATCH -Body $body -ErrorAction Stop
    Write-Host "DATABASE_URL patched OK"
} catch {
    Write-Host "PATCH error: $($_.ErrorDetails.Message)"
    # Try POST (create new)
    try {
        $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method POST -Body $body -ErrorAction Stop
        Write-Host "DATABASE_URL created OK"
    } catch {
        Write-Host "POST error: $($_.ErrorDetails.Message)"
    }
}

# PATCH REDIS_URL
Write-Host "`nPatching REDIS_URL..."
$body = [ordered]@{ key = "REDIS_URL"; value = $redisUrl } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method PATCH -Body $body -ErrorAction Stop
    Write-Host "REDIS_URL patched OK"
} catch {
    Write-Host "PATCH error: $($_.ErrorDetails.Message)"
    try {
        $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method POST -Body $body -ErrorAction Stop
        Write-Host "REDIS_URL created OK"
    } catch {
        Write-Host "POST error: $($_.ErrorDetails.Message)"
    }
}

# Verify
Write-Host "`nVerifying env vars:"
$envs = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method GET
$envs | Where-Object { $_.key -in @("DATABASE_URL","REDIS_URL") } | ForEach-Object { Write-Host "  $($_.key) = $($_.value)" }
