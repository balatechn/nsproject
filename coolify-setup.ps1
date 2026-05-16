$tok = "23|9vxiaAd4vvERTXoultcwRyjel0hTjV4AAXZvtb8Y1c3cb556"
$base = "http://187.127.134.246:8000/api/v1"
$H = @{ Authorization = "Bearer $tok"; "Content-Type" = "application/json" }

# Known UUIDs
$apiUUID = "bj8dch8qutl5jbr5q1sqp0rm"
$webUUID = "carx7dk6yfwk3ysxe4uurbnm"
$apiDomain = "http://bj8dch8qutl5jbr5q1sqp0rm.187.127.134.246.sslip.io"
$webDomain = "http://carx7dk6yfwk3ysxe4uurbnm.187.127.134.246.sslip.io"

# --- Step 1: Create PostgreSQL ---
Write-Host "Creating PostgreSQL..."
$pgBody = @{
  project_uuid = "vm1079cpi2jd3pn0qjfxl43r"
  environment_name = "production"
  server_uuid = "amfvd7ig8xpj28zj25v5vl6t"
  type = "standalone-postgresql"
  name = "nsproject-postgres"
  postgres_user = "nsproject"
  postgres_password = "NsProject_DB_2026!"
  postgres_db = "nsproject"
  instant_deploy = $true
} | ConvertTo-Json
try {
  $pg = Invoke-RestMethod -Uri "$base/databases" -Headers $H -Method POST -Body $pgBody -ErrorAction Stop
  $pgUUID = $pg.uuid
  Write-Host "PG UUID: $pgUUID"
  Write-Host "PG URL: $($pg.internal_db_url)"
} catch {
  Write-Host "PG Error: $($_.ErrorDetails.Message)"
  $pgUUID = $null
}

# --- Step 2: Create Redis ---
Write-Host "Creating Redis..."
$redisBody = @{
  project_uuid = "vm1079cpi2jd3pn0qjfxl43r"
  environment_name = "production"
  server_uuid = "amfvd7ig8xpj28zj25v5vl6t"
  type = "standalone-redis"
  name = "nsproject-redis"
  instant_deploy = $true
} | ConvertTo-Json
try {
  $redis = Invoke-RestMethod -Uri "$base/databases" -Headers $H -Method POST -Body $redisBody -ErrorAction Stop
  $redisUUID = $redis.uuid
  Write-Host "Redis UUID: $redisUUID"
  Write-Host "Redis URL: $($redis.internal_db_url)"
} catch {
  Write-Host "Redis Error: $($_.ErrorDetails.Message)"
  $redisUUID = $null
}

# --- Derive connection strings ---
if ($pgUUID) {
  $dbUrl = "postgresql://nsproject:NsProject_DB_2026%21@${pgUUID}:5432/nsproject"
} else {
  $dbUrl = "postgresql://nsproject:NsProject_DB_2026%21@nsproject-postgres:5432/nsproject"
}
if ($redisUUID) {
  $redisUrl = "redis://${redisUUID}:6379"
} else {
  $redisUrl = "redis://nsproject-redis:6379"
}

Write-Host "DB URL: $dbUrl"
Write-Host "Redis URL: $redisUrl"

# --- Step 3: Set env vars for API app ---
Write-Host "Setting API env vars..."
$apiEnvs = @{
  data = @(
    @{ key = "NODE_ENV"; value = "production" },
    @{ key = "PORT"; value = "4000" },
    @{ key = "DATABASE_URL"; value = $dbUrl },
    @{ key = "REDIS_URL"; value = $redisUrl },
    @{ key = "JWT_SECRET"; value = "NsProject_JWT_Secret_2026_Super_Secure_Key_XYZ!" },
    @{ key = "JWT_REFRESH_SECRET"; value = "NsProject_JWT_Refresh_Secret_2026_Super_Secure!" },
    @{ key = "FRONTEND_URL"; value = $webDomain },
    @{ key = "S3_ENDPOINT"; value = "http://minio:9000" },
    @{ key = "S3_ACCESS_KEY"; value = "nsproject" },
    @{ key = "S3_SECRET_KEY"; value = "NsProject_MinIO_2026!" },
    @{ key = "S3_BUCKET"; value = "nsproject" },
    @{ key = "GOOGLE_CLIENT_ID"; value = "placeholder_google_client_id" },
    @{ key = "GOOGLE_CLIENT_SECRET"; value = "placeholder_google_client_secret" },
    @{ key = "WHATSAPP_API_URL"; value = "http://placeholder" },
    @{ key = "WHATSAPP_API_KEY"; value = "placeholder" },
    @{ key = "N8N_URL"; value = "http://placeholder:5678" }
  )
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "$base/applications/$apiUUID/envs/bulk" -Headers $H -Method PATCH -Body $apiEnvs -ErrorAction Stop
  Write-Host "API envs set: $($r.Count) vars"
} catch {
  Write-Host "API env error: $($_.ErrorDetails.Message)"
}

# --- Step 4: Set env vars for Web app ---
Write-Host "Setting Web env vars..."
$webEnvs = @{
  data = @(
    @{ key = "NEXT_PUBLIC_API_URL"; value = "$apiDomain/api" },
    @{ key = "NEXT_PUBLIC_WS_URL"; value = $apiDomain },
    @{ key = "NODE_ENV"; value = "production" }
  )
} | ConvertTo-Json -Depth 5

try {
  $r = Invoke-RestMethod -Uri "$base/applications/$webUUID/envs/bulk" -Headers $H -Method PATCH -Body $webEnvs -ErrorAction Stop
  Write-Host "Web envs set: $($r.Count) vars"
} catch {
  Write-Host "Web env error: $($_.ErrorDetails.Message)"
}

# --- Step 5: Deploy both apps ---
Write-Host "Deploying API..."
try {
  $d = Invoke-RestMethod -Uri "$base/applications/$apiUUID/start" -Headers $H -Method GET
  Write-Host "API deploy: $($d.message) / $($d.deployment_uuid)"
} catch {
  Write-Host "API deploy error: $($_.ErrorDetails.Message)"
}

Write-Host "Deploying Web..."
try {
  $d = Invoke-RestMethod -Uri "$base/applications/$webUUID/start" -Headers $H -Method GET
  Write-Host "Web deploy: $($d.message) / $($d.deployment_uuid)"
} catch {
  Write-Host "Web deploy error: $($_.ErrorDetails.Message)"
}

Write-Host ""
Write-Host "=== SUMMARY ==="
Write-Host "API: $apiDomain"
Write-Host "Web: $webDomain"
Write-Host "Coolify Dashboard: http://187.127.134.246:8000"
