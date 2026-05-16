$tok = "23|9vxiaAd4vvERTXoultcwRyjel0hTjV4AAXZvtb8Y1c3cb556"
$base = "http://187.127.134.246:8000/api/v1"
$H = @{ Authorization = "Bearer $tok"; "Content-Type" = "application/json" }

# --- Create PostgreSQL ---
Write-Host "Creating PostgreSQL database..."
$pgBody = '{"project_uuid":"vm1079cpi2jd3pn0qjfxl43r","environment_name":"production","server_uuid":"amfvd7ig8xpj28zj25v5vl6t","name":"nsproject-postgres","postgres_user":"nsproject","postgres_password":"NsProject_DB_2026!","postgres_db":"nsproject","instant_deploy":true}'
try {
    $pg = Invoke-RestMethod -Uri "$base/databases/postgresql" -Headers $H -Method POST -Body $pgBody -ErrorAction Stop
    $pgUUID = $pg.uuid
    $pgInternalUrl = $pg.internal_db_url
    Write-Host "PG UUID: $pgUUID"
    Write-Host "PG Internal URL: $pgInternalUrl"
} catch {
    Write-Host "PG Create Error: $($_.ErrorDetails.Message)"
    $pgUUID = $null
    $pgInternalUrl = $null
}

# --- Create Redis ---
Write-Host "Creating Redis..."
$redisBody = '{"project_uuid":"vm1079cpi2jd3pn0qjfxl43r","environment_name":"production","server_uuid":"amfvd7ig8xpj28zj25v5vl6t","name":"nsproject-redis","instant_deploy":true}'
try {
    $redis = Invoke-RestMethod -Uri "$base/databases/redis" -Headers $H -Method POST -Body $redisBody -ErrorAction Stop
    $redisUUID = $redis.uuid
    $redisInternalUrl = $redis.internal_db_url
    Write-Host "Redis UUID: $redisUUID"
    Write-Host "Redis Internal URL: $redisInternalUrl"
} catch {
    Write-Host "Redis Create Error: $($_.ErrorDetails.Message)"
    $redisUUID = $null
    $redisInternalUrl = $null
}

# --- Build connection strings ---
if ($pgInternalUrl) {
    $dbUrl = $pgInternalUrl
} elseif ($pgUUID) {
    $dbUrl = "postgresql://nsproject:NsProject_DB_2026%21@${pgUUID}:5432/nsproject"
} else {
    Write-Host "ERROR: Could not create PostgreSQL. Aborting env var update."
    exit 1
}

if ($redisInternalUrl) {
    $redisUrl = $redisInternalUrl
} elseif ($redisUUID) {
    $redisUrl = "redis://${redisUUID}:6379"
} else {
    Write-Host "ERROR: Could not create Redis. Aborting env var update."
    exit 1
}

Write-Host "DATABASE_URL = $dbUrl"
Write-Host "REDIS_URL = $redisUrl"

# --- Update API app env vars with correct DB/Redis URLs ---
$apiUUID = "bj8dch8qutl5jbr5q1sqp0rm"
$apiDomain = "http://bj8dch8qutl5jbr5q1sqp0rm.187.127.134.246.sslip.io"
$webDomain = "http://carx7dk6yfwk3ysxe4uurbnm.187.127.134.246.sslip.io"

Write-Host "Updating API DATABASE_URL env var..."
$envBody = "{`"key`":`"DATABASE_URL`",`"value`":`"$dbUrl`"}"
try {
    $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method POST -Body $envBody -ErrorAction Stop
    Write-Host "DATABASE_URL updated"
} catch {
    $msg = $_.ErrorDetails.Message
    if ($msg -match "already exists") {
        # Update existing
        $patchBody = "{`"key`":`"DATABASE_URL`",`"value`":`"$dbUrl`"}"
        $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method PATCH -Body $patchBody
        Write-Host "DATABASE_URL patched"
    } else {
        Write-Host "Error: $msg"
    }
}

Write-Host "Updating API REDIS_URL env var..."
$envBody = "{`"key`":`"REDIS_URL`",`"value`":`"$redisUrl`"}"
try {
    $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method POST -Body $envBody -ErrorAction Stop
    Write-Host "REDIS_URL updated"
} catch {
    $msg = $_.ErrorDetails.Message
    if ($msg -match "already exists") {
        $patchBody = "{`"key`":`"REDIS_URL`",`"value`":`"$redisUrl`"}"
        $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs" -Headers $H -Method PATCH -Body $patchBody
        Write-Host "REDIS_URL patched"
    } else {
        Write-Host "Error: $msg"
    }
}

Write-Host ""
Write-Host "=== Databases Created ==="
Write-Host "PostgreSQL UUID: $pgUUID"
Write-Host "PostgreSQL URL:  $dbUrl"
Write-Host "Redis UUID:      $redisUUID"
Write-Host "Redis URL:       $redisUrl"
Write-Host ""
Write-Host "=== Application URLs ==="
Write-Host "API: $apiDomain"
Write-Host "Web: $webDomain"
