#!/usr/bin/env pwsh
# NsProject QA smoke + security probe (live deployment)
param(
  [string]$Api = "http://bj8dch8qutl5jbr5q1sqp0rm.187.127.134.246.sslip.io",
  [string]$Web = "http://carx7dk6yfwk3ysxe4uurbnm.187.127.134.246.sslip.io"
)

$ErrorActionPreference = 'Continue'
$results = New-Object System.Collections.ArrayList
function Add-Result([string]$cat,[string]$name,[string]$status,[string]$detail,[int]$ms=0) {
  $null = $results.Add([pscustomobject]@{Cat=$cat;Name=$name;Status=$status;Ms=$ms;Detail=$detail})
}
function Probe([string]$method,[string]$url,[hashtable]$h=$null,[string]$body=$null) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $args = @{Method=$method;Uri=$url;TimeoutSec=15;SkipHttpErrorCheck=$true;Headers=$h}
    if ($body) { $args.ContentType = 'application/json'; $args.Body = $body }
    $r = Invoke-WebRequest @args
    $sw.Stop()
    return @{Status=[int]$r.StatusCode;Ms=$sw.ElapsedMilliseconds;Body=$r.Content;Headers=$r.Headers}
  } catch {
    $sw.Stop()
    return @{Status=0;Ms=$sw.ElapsedMilliseconds;Body=$_.Exception.Message;Headers=@{}}
  }
}

Write-Host "`n=== 1. CONNECTIVITY ===" -ForegroundColor Cyan
$apiDocs = Probe GET "$Api/api/docs"
Add-Result "Connect" "API /api/docs" $(if($apiDocs.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($apiDocs.Status)" $apiDocs.Ms
$webRoot = Probe GET "$Web/"
Add-Result "Connect" "Web /" $(if($webRoot.Status -in 200,307,308){"PASS"}else{"FAIL"}) "HTTP $($webRoot.Status)" $webRoot.Ms
$webLogin = Probe GET "$Web/auth/login"
Add-Result "Connect" "Web /auth/login" $(if($webLogin.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($webLogin.Status)" $webLogin.Ms

Write-Host "`n=== 2. AUTH ===" -ForegroundColor Cyan
# Wrong password
$bad = Probe POST "$Api/api/v1/auth/login" $null '{"email":"admin@nsproject.com","password":"wrong"}'
Add-Result "Auth" "Login wrong password" $(if($bad.Status -eq 401){"PASS"}else{"FAIL"}) "HTTP $($bad.Status)" $bad.Ms
# Invalid email format
$invalid = Probe POST "$Api/api/v1/auth/login" $null '{"email":"notanemail","password":"x"}'
Add-Result "Auth" "Login invalid email validation" $(if($invalid.Status -in 400,422){"PASS"}else{"WARN"}) "HTTP $($invalid.Status)" $invalid.Ms
# Empty body
$empty = Probe POST "$Api/api/v1/auth/login" $null '{}'
Add-Result "Auth" "Login empty body validation" $(if($empty.Status -in 400,422){"PASS"}else{"WARN"}) "HTTP $($empty.Status)" $empty.Ms
# Good login
$good = Probe POST "$Api/api/v1/auth/login" $null '{"email":"admin@nsproject.com","password":"Admin@123"}'
Add-Result "Auth" "Login valid credentials" $(if($good.Status -eq 200 -or $good.Status -eq 201){"PASS"}else{"FAIL"}) "HTTP $($good.Status)" $good.Ms
$token = $null; $refresh = $null
if ($good.Status -in 200,201) {
  $j = $good.Body | ConvertFrom-Json
  $token = $j.accessToken; $refresh = $j.refreshToken
  Add-Result "Auth" "JWT token returned" $(if($token){"PASS"}else{"FAIL"}) "token length $($token.Length)"
  Add-Result "Auth" "RefreshToken returned" $(if($refresh){"PASS"}else{"FAIL"}) ""
  Add-Result "Auth" "Roles include SUPER_ADMIN" $(if($j.user.roles -contains 'SUPER_ADMIN'){"PASS"}else{"WARN"}) "roles=$($j.user.roles -join ',')"
}
$H = @{Authorization="Bearer $token"}
# /me with token
$me = Probe GET "$Api/api/v1/auth/me" $H
Add-Result "Auth" "GET /auth/me with JWT" $(if($me.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($me.Status)" $me.Ms
# /me without token
$meNo = Probe GET "$Api/api/v1/auth/me"
Add-Result "Auth" "GET /auth/me unauth -> 401" $(if($meNo.Status -eq 401){"PASS"}else{"FAIL"}) "HTTP $($meNo.Status)"
# Tampered JWT
$tH = @{Authorization="Bearer $($token)tampered"}
$tamp = Probe GET "$Api/api/v1/auth/me" $tH
Add-Result "Auth" "Tampered JWT rejected" $(if($tamp.Status -eq 401){"PASS"}else{"FAIL"}) "HTTP $($tamp.Status)"

Write-Host "`n=== 3. RBAC / PROTECTED ENDPOINTS ===" -ForegroundColor Cyan
$protected = @("/api/v1/users","/api/v1/projects","/api/v1/tasks","/api/v1/crm/leads","/api/v1/crm/pipeline","/api/v1/crm/stats","/api/v1/dashboard/kpis","/api/v1/dashboard/activity","/api/v1/dashboard/upcoming-tasks","/api/v1/dashboard/project-progress","/api/v1/dashboard/task-status-chart","/api/v1/dashboard/team-utilization","/api/v1/dashboard/monthly-completion","/api/v1/notifications","/api/v1/notifications/unread-count","/api/v1/workflows","/api/v1/resources","/api/v1/admin/stats","/api/v1/admin/audit-logs","/api/v1/admin/roles","/api/v1/admin/settings","/api/v1/reports/projects","/api/v1/reports/resources","/api/v1/reports/time","/api/v1/chat/rooms","/api/v1/whatsapp/status")
foreach ($p in $protected) {
  $u = Probe GET "$Api$p"
  Add-Result "RBAC" "Unauth $p -> 401" $(if($u.Status -eq 401){"PASS"}else{"FAIL"}) "HTTP $($u.Status)"
  $a = Probe GET "$Api$p" $H
  $ok = $a.Status -in 200,201,204
  Add-Result "API" "Auth GET $p" $(if($ok){"PASS"}elseif($a.Status -eq 403){"WARN"}else{"FAIL"}) "HTTP $($a.Status)" $a.Ms
}

Write-Host "`n=== 4. CRUD ===" -ForegroundColor Cyan
$projBody = '{"name":"QA Test Project","description":"automated QA","startDate":"2026-05-16","endDate":"2026-12-31"}'
$createProj = Probe POST "$Api/api/v1/projects" $H $projBody
Add-Result "CRUD" "Create project" $(if($createProj.Status -in 200,201){"PASS"}else{"FAIL"}) "HTTP $($createProj.Status) $($createProj.Body.Substring(0,[Math]::Min(200,$createProj.Body.Length)))" $createProj.Ms
$projId = $null
if ($createProj.Status -in 200,201) { try { $projId = ($createProj.Body | ConvertFrom-Json).id } catch {} }
if ($projId) {
  $getProj = Probe GET "$Api/api/v1/projects/$projId" $H
  Add-Result "CRUD" "Get project by id" $(if($getProj.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($getProj.Status)" $getProj.Ms
  $patchProj = Probe PATCH "$Api/api/v1/projects/$projId" $H '{"description":"updated"}'
  Add-Result "CRUD" "Patch project" $(if($patchProj.Status -in 200,204){"PASS"}else{"FAIL"}) "HTTP $($patchProj.Status)" $patchProj.Ms
  $gantt = Probe GET "$Api/api/v1/projects/$projId/gantt" $H
  Add-Result "CRUD" "Project gantt data" $(if($gantt.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($gantt.Status)" $gantt.Ms
  $stats = Probe GET "$Api/api/v1/projects/$projId/stats" $H
  Add-Result "CRUD" "Project stats" $(if($stats.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($stats.Status)" $stats.Ms
  # Task
  $taskBody = "{`"title`":`"QA Task`",`"projectId`":`"$projId`",`"status`":`"TODO`",`"priority`":`"MEDIUM`"}"
  $createTask = Probe POST "$Api/api/v1/tasks" $H $taskBody
  Add-Result "CRUD" "Create task" $(if($createTask.Status -in 200,201){"PASS"}else{"FAIL"}) "HTTP $($createTask.Status) $($createTask.Body.Substring(0,[Math]::Min(200,$createTask.Body.Length)))" $createTask.Ms
  $taskId = $null
  if ($createTask.Status -in 200,201) { try { $taskId = ($createTask.Body | ConvertFrom-Json).id } catch {} }
  if ($taskId) {
    $kan = Probe GET "$Api/api/v1/tasks/kanban/$projId" $H
    Add-Result "CRUD" "Kanban view" $(if($kan.Status -eq 200){"PASS"}else{"FAIL"}) "HTTP $($kan.Status)" $kan.Ms
    $delTask = Probe DELETE "$Api/api/v1/tasks/$taskId" $H
    Add-Result "CRUD" "Delete task" $(if($delTask.Status -in 200,204){"PASS"}else{"FAIL"}) "HTTP $($delTask.Status)" $delTask.Ms
  }
  $delProj = Probe DELETE "$Api/api/v1/projects/$projId" $H
  Add-Result "CRUD" "Delete project" $(if($delProj.Status -in 200,204){"PASS"}else{"FAIL"}) "HTTP $($delProj.Status)" $delProj.Ms
}

# CRM Lead
$leadBody = '{"firstName":"QA","lastName":"Lead","email":"qa.lead@example.com","phone":"5551234567","source":"WEBSITE"}'
$createLead = Probe POST "$Api/api/v1/crm/leads" $H $leadBody
Add-Result "CRUD" "Create CRM lead" $(if($createLead.Status -in 200,201){"PASS"}else{"FAIL"}) "HTTP $($createLead.Status) $($createLead.Body.Substring(0,[Math]::Min(200,$createLead.Body.Length)))" $createLead.Ms

Write-Host "`n=== 5. SECURITY ===" -ForegroundColor Cyan
# SQL injection in login
$sqli = Probe POST "$Api/api/v1/auth/login" $null '{"email":"admin@nsproject.com'' OR ''1''=''1","password":"x"}'
Add-Result "Sec" "SQLi login attempt rejected" $(if($sqli.Status -in 400,401,422){"PASS"}else{"FAIL"}) "HTTP $($sqli.Status)"
# XSS in lead
$xss = Probe POST "$Api/api/v1/crm/leads" $H '{"firstName":"<script>alert(1)</script>","lastName":"x","email":"xss@test.com"}'
Add-Result "Sec" "XSS payload in lead" $(if($xss.Status -in 200,201,400,422){"PASS"}else{"FAIL"}) "HTTP $($xss.Status) (input handling — manual review needed for output encoding)"
# CORS preflight from foreign origin
$cors = Probe OPTIONS "$Api/api/v1/auth/login" @{Origin='https://evil.com';'Access-Control-Request-Method'='POST'}
$acao = $cors.Headers['Access-Control-Allow-Origin']
Add-Result "Sec" "CORS preflight" "INFO" "ACAO=$acao status=$($cors.Status)"
# Security headers on web
$webHdr = Probe GET "$Web/auth/login"
$secHdrs = @('X-Frame-Options','X-Content-Type-Options','Strict-Transport-Security','Content-Security-Policy','Referrer-Policy')
foreach ($h in $secHdrs) {
  $v = $webHdr.Headers[$h]
  Add-Result "Sec" "Web header $h" $(if($v){"PASS"}else{"WARN"}) "$($v -join ',')"
}
# Rate limiting probe (20 rapid bad logins)
$rl = 0; $rlBlocked = 0
1..20 | ForEach-Object {
  $r = Probe POST "$Api/api/v1/auth/login" $null '{"email":"admin@nsproject.com","password":"wrong"}'
  if ($r.Status -eq 429) { $rlBlocked++ }
  $rl++
}
Add-Result "Sec" "Rate limiting (20 bad logins)" $(if($rlBlocked -gt 0){"PASS"}else{"WARN"}) "$rlBlocked / $rl returned 429"
# HTTPS / TLS
Add-Result "Sec" "HTTPS enabled" "FAIL" "Application served over plain HTTP only"

Write-Host "`n=== 6. WEB PAGES ===" -ForegroundColor Cyan
$pages = @("/","/auth/login","/auth/register","/auth/forgot-password","/dashboard","/projects","/tasks","/crm","/workflows","/reports","/team","/resources","/admin","/chat","/settings")
foreach ($p in $pages) {
  $r = Probe GET "$Web$p"
  $status = if ($r.Status -in 200,307,308){"PASS"} elseif ($r.Status -eq 404){"WARN"} else {"FAIL"}
  Add-Result "Web" "GET $p" $status "HTTP $($r.Status)" $r.Ms
}

Write-Host "`n=== 7. PERFORMANCE ===" -ForegroundColor Cyan
$perfEndpoints = @("/api/v1/auth/me","/api/v1/dashboard/kpis","/api/v1/projects","/api/v1/tasks","/api/v1/crm/leads")
foreach ($p in $perfEndpoints) {
  $times = 1..5 | ForEach-Object { (Probe GET "$Api$p" $H).Ms }
  $avg = [int](($times | Measure-Object -Average).Average)
  $max = [int](($times | Measure-Object -Maximum).Maximum)
  $st = if ($avg -lt 300) {"PASS"} elseif ($avg -lt 1000) {"WARN"} else {"FAIL"}
  Add-Result "Perf" "$p latency avg" $st "avg=${avg}ms max=${max}ms (5 samples)"
}

# Concurrent load (10 parallel)
$sw = [Diagnostics.Stopwatch]::StartNew()
$jobs = 1..10 | ForEach-Object {
  Start-ThreadJob -ScriptBlock {
    param($u,$tok)
    try { (Invoke-WebRequest -Uri $u -Headers @{Authorization="Bearer $tok"} -TimeoutSec 30 -SkipHttpErrorCheck).StatusCode } catch { 0 }
  } -ArgumentList "$Api/api/v1/dashboard/kpis",$token
}
$jobs | Wait-Job | Out-Null
$codes = $jobs | Receive-Job
$jobs | Remove-Job
$sw.Stop()
$ok200 = ($codes | Where-Object {$_ -eq 200}).Count
Add-Result "Perf" "10 concurrent requests" $(if($ok200 -ge 9){"PASS"}elseif($ok200 -ge 5){"WARN"}else{"FAIL"}) "$ok200/10 200 OK in $($sw.ElapsedMilliseconds)ms"

# Output JSON report
$summary = @{
  Generated = (Get-Date).ToString('o')
  Api = $Api; Web = $Web
  Counts = @{
    Total = $results.Count
    Pass  = ($results | Where-Object Status -eq 'PASS').Count
    Fail  = ($results | Where-Object Status -eq 'FAIL').Count
    Warn  = ($results | Where-Object Status -eq 'WARN').Count
    Info  = ($results | Where-Object Status -eq 'INFO').Count
  }
  Results = $results
}
$summary | ConvertTo-Json -Depth 6 | Out-File qa-report.json -Encoding utf8
Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
"PASS: $($summary.Counts.Pass) | FAIL: $($summary.Counts.Fail) | WARN: $($summary.Counts.Warn) | INFO: $($summary.Counts.Info) | Total: $($summary.Counts.Total)"
"`n--- Failures & Warnings ---"
$results | Where-Object {$_.Status -in 'FAIL','WARN'} | Format-Table -AutoSize -Wrap
"`nFull report -> qa-report.json"
