$tok = "23|9vxiaAd4vvERTXoultcwRyjel0hTjV4AAXZvtb8Y1c3cb556"
$base = "http://187.127.134.246:8000/api/v1"
$H = @{ Authorization = "Bearer $tok"; "Content-Type" = "application/json" }
$apiUUID = "bj8dch8qutl5jbr5q1sqp0rm"
$webUUID = "carx7dk6yfwk3ysxe4uurbnm"

# --- Delete duplicate/wrong env vars for API ---
Write-Host "=== Getting all API env vars ==="
$envs = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method GET
Write-Host "Total env vars: $($envs.Count)"

# Find duplicates and old wrong ones
$dbUrlOld = "postgresql://nsproject:NsProject_DB_2026%21@nsproject-postgres:5432/nsproject"
$redisUrlOld = "redis://nsproject-redis:6379"

foreach ($env in $envs) {
    if ($env.key -eq "DATABASE_URL" -and $env.value -eq $dbUrlOld) {
        Write-Host "Deleting old DATABASE_URL (uuid=$($env.uuid))"
        try {
            Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs/$($env.uuid)" -Headers $H -Method DELETE | Out-Null
            Write-Host "Deleted"
        } catch { Write-Host "Error: $($_.ErrorDetails.Message)" }
    }
    if ($env.key -eq "REDIS_URL" -and $env.value -eq $redisUrlOld) {
        Write-Host "Deleting old REDIS_URL (uuid=$($env.uuid))"
        try {
            Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs/$($env.uuid)" -Headers $H -Method DELETE | Out-Null
            Write-Host "Deleted"
        } catch { Write-Host "Error: $($_.ErrorDetails.Message)" }
    }
}

# --- Re-deploy API with correct env vars ---
Write-Host "`n=== Re-deploying API app ==="
try {
    $d = Invoke-RestMethod -Uri "$base/applications/$apiUUID/start" -Headers $H -Method GET
    Write-Host "API deploy queued: $($d.deployment_uuid)"
} catch { Write-Host "Deploy error: $($_.ErrorDetails.Message)" }

# --- Re-deploy Web app ---
Write-Host "`n=== Re-deploying Web app ==="
try {
    $d = Invoke-RestMethod -Uri "$base/applications/$webUUID/start" -Headers $H -Method GET
    Write-Host "Web deploy queued: $($d.deployment_uuid)"
} catch { Write-Host "Deploy error: $($_.ErrorDetails.Message)" }

Write-Host "`n=== DEPLOYMENT STATUS ==="
Write-Host "Check Coolify dashboard: http://187.127.134.246:8000"
Write-Host "API app UUID: $apiUUID"
Write-Host "Web app UUID: $webUUID"
Write-Host "API URL: http://bj8dch8qutl5jbr5q1sqp0rm.187.127.134.246.sslip.io"
Write-Host "Web URL: http://carx7dk6yfwk3ysxe4uurbnm.187.127.134.246.sslip.io"
