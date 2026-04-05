// ═══════════════════════════════════════════════════════
// Playbooks — IR Playbooks, Linux Live Response, Windows Live Response
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────
// Windows Live Response
// ─────────────────────────────────────────
'windows-response': {
  name: 'Windows Live Response',
  subtitle: 'PowerShell commands untuk investigasi dan triage di Windows system.',
  tags: ['tag-playbook','tag-cli'],
  tagLabels: ['IR Commands','PowerShell'],
  sections: [

    { id: 'system', title: 'System Info', html: `
<p>Langkah pertama live response: <strong>kumpulkan informasi dasar</strong> tentang sistem. Ini membantu membangun konteks — OS version, uptime, hostname, domain membership.</p>

<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Hostname & basic identity</span>
hostname

<span class="code-comment"># Detailed system info (OS version, domain, boot time, hotfixes)</span>
systeminfo

<span class="code-comment"># Comprehensive system info (PowerShell object — easier to parse)</span>
Get-ComputerInfo | Select-Object CsName, WindowsProductName, WindowsVersion, OsArchitecture, OsLastBootUpTime, CsDomain

<span class="code-comment"># Current date/time — penting untuk timeline!</span>
Get-Date -Format "yyyy-MM-dd HH:mm:ss K"

<span class="code-comment"># OS details via WMI</span>
Get-WmiObject Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber, LastBootUpTime, InstallDate

<span class="code-comment"># Uptime — berapa lama system sudah running?</span>
(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime</code></pre></div>

<div class="callout callout-info">
<strong>Kenapa uptime penting?</strong> Kalau attacker reboot system, evidence di RAM hilang. Uptime yang pendek + tanpa scheduled maintenance = suspicious. Catat boot time untuk timeline.
</div>
`},

    { id: 'users', title: 'Users & Auth', html: `
<p>Investigasi user accounts: siapa yang sedang logged in, account apa saja yang ada, siapa yang punya admin, dan riwayat login (berhasil & gagal).</p>

<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Siapa yang sedang logged in sekarang?</span>
query user

<span class="code-comment"># Semua local user accounts (termasuk disabled)</span>
Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordLastSet, Description

<span class="code-comment"># Siapa saja yang masuk group Administrators? (CRITICAL — cek backdoor accounts)</span>
Get-LocalGroupMember -Group "Administrators"

<span class="code-comment"># Detail spesifik user</span>
net user administrator

<span class="code-comment"># Account yang baru dibuat (potential backdoor)</span>
Get-LocalUser | Where-Object { $_.PasswordLastSet -gt (Get-Date).AddDays(-7) } | Select-Object Name, Enabled, PasswordLastSet</code></pre></div>

<div class="code-block"><div class="code-label"><span>PowerShell — Login History</span></div><pre><code><span class="code-comment"># 20 event login BERHASIL terakhir (EventID 4624)</span>
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4624} -MaxEvents 20 |
  Select-Object TimeCreated,
    @{N='User';E={$_.Properties[5].Value}},
    @{N='LogonType';E={$_.Properties[8].Value}},
    @{N='SourceIP';E={$_.Properties[18].Value}} |
  Format-Table -AutoSize

<span class="code-comment"># 20 event login GAGAL terakhir (EventID 4625) — brute force detection</span>
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625} -MaxEvents 20 |
  Select-Object TimeCreated,
    @{N='TargetUser';E={$_.Properties[5].Value}},
    @{N='SourceIP';E={$_.Properties[19].Value}},
    @{N='FailureReason';E={$_.Properties[8].Value}} |
  Format-Table -AutoSize

<span class="code-comment"># Login type reference:</span>
<span class="code-comment"># 2 = Interactive (keyboard), 3 = Network (SMB/share),</span>
<span class="code-comment"># 4 = Batch, 5 = Service, 7 = Unlock, 10 = RDP, 11 = Cached</span></code></pre></div>

<div class="callout callout-warn">
<strong>Red flags:</strong>
<ul>
  <li>User baru yang nggak dikenal di group Administrators</li>
  <li>LogonType 3 (network) dari IP yang nggak dikenal → lateral movement</li>
  <li>LogonType 10 (RDP) dari external IP → unauthorized remote access</li>
  <li>Banyak 4625 diikuti 4624 dari IP sama → brute force <strong>berhasil</strong></li>
</ul>
</div>
`},

    { id: 'processes', title: 'Processes', html: `
<p>Proses yang berjalan bisa reveal malware, C2 agents, reverse shells, cryptominers, dan tools attacker. Fokus ke: <strong>nama aneh, path suspicious, command line arguments mencurigakan</strong>.</p>

<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Top 20 processes by CPU (cryptominer detection)</span>
Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Name, Id, CPU, Path

<span class="code-comment"># CRITICAL: Semua proses DENGAN command line arguments</span>
<span class="code-comment"># Ini yang paling penting — bisa reveal malicious commands</span>
Get-WmiObject Win32_Process |
  Select-Object Name, ProcessId, ParentProcessId, CommandLine |
  Format-List

<span class="code-comment"># Proses yang jalan dari lokasi suspicious</span>
Get-Process | Where-Object {
  $_.Path -like "*temp*" -or
  $_.Path -like "*appdata*" -or
  $_.Path -like "*downloads*" -or
  $_.Path -like "*public*" -or
  $_.Path -like "*programdata*"
} | Select-Object Name, Id, Path

<span class="code-comment"># Alternative: wmic (legacy tapi masih berguna)</span>
wmic process get name,processid,parentprocessid,commandline /format:list

<span class="code-comment"># Cari proses berdasarkan nama (suspicious process hunting)</span>
Get-Process | Where-Object {
  $_.Name -match "powershell|cmd|wscript|cscript|mshta|certutil|bitsadmin|rundll32"
} | Select-Object Name, Id, Path, StartTime</code></pre></div>

<div class="callout callout-tip">
<strong>Suspicious process indicators:</strong>
<ul>
  <li><code>powershell.exe -enc</code> (encoded command — sering dipakai malware)</li>
  <li><code>cmd.exe /c</code> dari parent yang bukan explorer.exe</li>
  <li>Process running dari <code>C:\\Users\\*\\AppData\\Local\\Temp\\</code></li>
  <li><code>svchost.exe</code> yang nggak di-launch oleh services.exe (parent PID beda)</li>
  <li>Nama process mirip system process tapi typo: <code>svchosts.exe</code>, <code>csrs.exe</code></li>
</ul>
</div>
`},

    { id: 'network', title: 'Network', html: `
<p>Network connections bisa reveal C2 communication, data exfiltration, lateral movement, dan reverse shells. Cek: <strong>koneksi established ke IP external yang nggak dikenal</strong>.</p>

<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Semua koneksi TCP yang established (aktif)</span>
Get-NetTCPConnection -State Established |
  Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess,
    @{N='Process';E={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name}} |
  Format-Table -AutoSize

<span class="code-comment"># Koneksi ke port selain 80/443 (non-standard — bisa C2)</span>
Get-NetTCPConnection -State Established |
  Where-Object { $_.RemotePort -ne 443 -and $_.RemotePort -ne 80 -and $_.RemoteAddress -notmatch "^(127\.|::1|0\.0\.0\.0)" } |
  Select-Object RemoteAddress, RemotePort, OwningProcess,
    @{N='Process';E={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name}} |
  Format-Table -AutoSize

<span class="code-comment"># Classic netstat (masih berguna, shows PID)</span>
netstat -ano | findstr ESTABLISHED

<span class="code-comment"># DNS cache — domain apa yang baru di-resolve? (termasuk C2 domains)</span>
Get-DnsClientCache | Select-Object Entry, Data, TimeToLive | Sort-Object Entry

<span class="code-comment"># Firewall rules yang aktif</span>
Get-NetFirewallRule -Enabled True -Direction Inbound |
  Select-Object DisplayName, Action, Profile |
  Format-Table -AutoSize

<span class="code-comment"># Listening ports (services yang menunggu koneksi masuk)</span>
Get-NetTCPConnection -State Listen |
  Select-Object LocalAddress, LocalPort, OwningProcess,
    @{N='Process';E={(Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name}} |
  Sort-Object LocalPort |
  Format-Table -AutoSize</code></pre></div>

<div class="callout callout-warn">
<strong>Red flags di network:</strong>
<ul>
  <li>Koneksi established ke IP di negara yang nggak ada business relationship</li>
  <li>Port 4444, 5555, 8888, 1234 (default reverse shell/C2 ports)</li>
  <li>Proses <code>powershell.exe</code> atau <code>rundll32.exe</code> yang punya active network connection</li>
  <li>DNS cache berisi domain random/DGA-looking (xkj7h2ya.net)</li>
  <li>Banyak koneksi ke satu IP external (beaconing pattern)</li>
</ul>
</div>
`},

    { id: 'persistence', title: 'Persistence', html: `
<p>Attacker yang sudah masuk pasti pasang <strong>persistence</strong> — mekanisme supaya mereka bisa <em>balik lagi</em> setelah reboot. Cek semua tempat favorit persistence:</p>

<div class="code-block"><div class="code-label"><span>PowerShell — Scheduled Tasks</span></div><pre><code><span class="code-comment"># Scheduled tasks yang ready (active)</span>
Get-ScheduledTask | Where-Object { $_.State -eq 'Ready' } |
  Select-Object TaskName, TaskPath, State,
    @{N='Action';E={($_.Actions.Execute + ' ' + $_.Actions.Arguments)}} |
  Format-Table -AutoSize

<span class="code-comment"># Detail lengkap scheduled tasks (termasuk command line)</span>
schtasks /query /fo LIST /v | Select-String -Pattern "TaskName|Run As|Task To Run|Last Run|Next Run|Status" -Context 0,0

<span class="code-comment"># Cari task yang baru dibuat (7 hari terakhir)</span>
Get-ScheduledTask | ForEach-Object {
  $info = $_ | Get-ScheduledTaskInfo -ErrorAction SilentlyContinue
  if ($info.LastRunTime -gt (Get-Date).AddDays(-7)) {
    [PSCustomObject]@{
      Name = $_.TaskName; Action = $_.Actions.Execute
      LastRun = $info.LastRunTime
    }
  }
}</code></pre></div>

<div class="code-block"><div class="code-label"><span>PowerShell — Registry Run Keys</span></div><pre><code><span class="code-comment"># Registry Run keys (auto-start saat user login)</span>
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" -ErrorAction SilentlyContinue
Get-ItemProperty "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run" -ErrorAction SilentlyContinue

<span class="code-comment"># RunOnce keys (execute once then delete)</span>
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce" -ErrorAction SilentlyContinue
Get-ItemProperty "HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce" -ErrorAction SilentlyContinue</code></pre></div>

<div class="code-block"><div class="code-label"><span>PowerShell — Services & Startup</span></div><pre><code><span class="code-comment"># Services yang auto-start</span>
Get-Service | Where-Object { $_.StartType -eq 'Automatic' } |
  Select-Object Name, DisplayName, Status, StartType |
  Format-Table -AutoSize

<span class="code-comment"># WMI Startup commands (comprehensive)</span>
Get-WmiObject Win32_StartupCommand |
  Select-Object Name, Command, Location, User |
  Format-Table -AutoSize

<span class="code-comment"># Service baru yang di-install (EventID 7045)</span>
Get-WinEvent -FilterHashtable @{LogName='System';Id=7045} -MaxEvents 10 |
  Select-Object TimeCreated,
    @{N='ServiceName';E={$_.Properties[0].Value}},
    @{N='ImagePath';E={$_.Properties[1].Value}},
    @{N='ServiceType';E={$_.Properties[2].Value}} |
  Format-Table -AutoSize</code></pre></div>

<div class="callout callout-tip">
<strong>Common persistence locations:</strong>
<ul>
  <li><strong>Scheduled Tasks</strong> — paling sering dipakai malware modern</li>
  <li><strong>Registry Run/RunOnce</strong> — klasik tapi masih efektif</li>
  <li><strong>Services</strong> — bisa running sebagai SYSTEM (highest privilege)</li>
  <li><strong>Startup folder</strong> — <code>C:\\Users\\*\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup</code></li>
  <li><strong>WMI Event Subscriptions</strong> — stealthy, sering di-miss</li>
</ul>
</div>
`},

    { id: 'files', title: 'Files & Event Logs', html: `
<p>Cari file yang baru dimodified, file di lokasi suspicious, dan review event log untuk bukti tambahan.</p>

<div class="code-block"><div class="code-label"><span>PowerShell — Recent Files</span></div><pre><code><span class="code-comment"># File yang di-modify dalam 24 jam terakhir di folder Users</span>
Get-ChildItem "C:\\Users" -Recurse -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) -and !$_.PSIsContainer } |
  Select-Object FullName, LastWriteTime, Length |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 50

<span class="code-comment"># File di temp directories (sering dipakai malware untuk staging)</span>
Get-ChildItem "C:\\Windows\\Temp" -Force -ErrorAction SilentlyContinue |
  Select-Object Name, LastWriteTime, Length
Get-ChildItem "$env:TEMP" -Force -ErrorAction SilentlyContinue |
  Select-Object Name, LastWriteTime, Length

<span class="code-comment"># Cari executable di lokasi yang seharusnya nggak ada .exe</span>
Get-ChildItem "C:\\Users" -Recurse -Include "*.exe","*.dll","*.ps1","*.bat","*.vbs","*.hta" -Force -ErrorAction SilentlyContinue |
  Select-Object FullName, LastWriteTime, Length |
  Sort-Object LastWriteTime -Descending</code></pre></div>

<div class="code-block"><div class="code-label"><span>PowerShell — Event Logs</span></div><pre><code><span class="code-comment"># 50 event Security terbaru</span>
Get-WinEvent -LogName Security -MaxEvents 50 |
  Select-Object TimeCreated, Id, LevelDisplayName, Message |
  Format-Table -Wrap

<span class="code-comment"># Service installations (persistence indicator — EventID 7045)</span>
Get-WinEvent -FilterHashtable @{LogName='System';Id=7045} -MaxEvents 10 |
  Format-List TimeCreated, Message

<span class="code-comment"># PowerShell script block logging (EventID 4104 — lihat apa yang diexecute)</span>
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational';Id=4104} -MaxEvents 10 |
  Select-Object TimeCreated, Message |
  Format-List

<span class="code-comment"># Log cleared events (EventID 1102 — ALMOST ALWAYS MALICIOUS!)</span>
Get-WinEvent -FilterHashtable @{LogName='Security';Id=1102} -ErrorAction SilentlyContinue |
  Format-List TimeCreated, Message

<span class="code-comment"># Process creation events (EventID 4688 — kalau audit policy enabled)</span>
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4688} -MaxEvents 20 |
  Select-Object TimeCreated,
    @{N='Process';E={$_.Properties[5].Value}},
    @{N='CommandLine';E={$_.Properties[8].Value}} |
  Format-Table -AutoSize</code></pre></div>

<div class="callout callout-warn">
<strong>⚠ DESTRUCTIVE COMMAND — JANGAN JALANKAN SAAT INVESTIGASI:</strong>
<div class="code-block"><div class="code-label"><span>DANGEROUS — DO NOT USE</span></div><pre><code><span class="code-comment"># HAPUS semua Security logs — ini MENGHANCURKAN evidence!</span>
<span class="code-comment"># Hanya attacker yang pakai ini. Kalau kamu lihat ini di log = RED FLAG.</span>
wevtutil cl Security</code></pre></div>
<p>Kalau kamu menemukan EventID 1102 (Log Cleared) — itu <span class="sev sev-crit">CRITICAL INDICATOR</span> bahwa seseorang sengaja menghapus jejak. <strong>Escalate immediately.</strong></p>
</div>

<div class="callout callout-tip">
<strong>Evidence collection order (volatility):</strong>
<ol>
  <li><strong>Network connections</strong> (paling volatile — berubah tiap detik)</li>
  <li><strong>Running processes</strong> (bisa di-kill kapan saja)</li>
  <li><strong>Logged-in users</strong> (bisa logout)</li>
  <li><strong>Scheduled tasks & persistence</strong> (lebih stabil)</li>
  <li><strong>File system</strong> (paling stabil, tapi bisa dihapus)</li>
  <li><strong>Event logs</strong> (persistent, tapi bisa di-clear)</li>
</ol>
<p>Collect dari yang paling volatile duluan!</p>
</div>
`}

  ] // end sections
}, // end windows-response

'ir-playbooks': {
  name: 'IR Playbooks', subtitle: 'Step-by-step incident response: phishing, malware, brute force.',
  tags: ['tag-playbook'], tagLabels: ['IR Playbook'],
  sections: [
    { id: 'overview', title: 'Framework', html: `<p>NIST SP 800-61: <strong>Preparation → Detection → Containment → Eradication → Recovery → Lessons Learned</strong></p>` },
    { id: 'phishing', title: 'Playbook: Phishing', html: `<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Identifikasi</h4><p>Dapatkan .eml. Analisis header: From, SPF/DKIM/DMARC, X-Originating-IP.</p></div></div><div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Extract IOC</h4><p>Sender, domain, IP, URL, hash attachment → lookup VT + AbuseIPDB.</p></div></div><div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Scope</h4><p>Siapa lagi yang terima? Sudah ada yang klik?</p></div></div><div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>Contain</h4><p>Block sender di gateway. Block URL di proxy. Quarantine email.</p></div></div><div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>User Impact</h4><p>Kalau klik: reset password, scan EDR, check persistence.</p></div></div><div class="playbook-step"><div class="pb-num">6</div><div class="pb-content"><h4>Document</h4><p>Buat case di IRIS/TheHive.</p></div></div>` },
    { id: 'malware', title: 'Playbook: Malware', html: `<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Isolasi</h4><p>SEGERA isolasi endpoint. Jangan shutdown (RAM artifacts).</p></div></div><div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Collect</h4><p>Memory dump, running processes, network connections.</p></div></div><div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Analyze</h4><p>Hash → VT. Unknown → sandbox. C2? Persistence?</p></div></div><div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>Scope</h4><p>Search IOC di SIEM across all endpoints.</p></div></div><div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>Eradicate</h4><p>Remove malware + persistence. Reimage jika parah.</p></div></div>` },
    { id: 'bruteforce', title: 'Playbook: Brute Force', html: `<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Confirm</h4><p>Berapa failures? Dari IP mana? Ada success setelahnya?</p></div></div><div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Check IP</h4><p>AbuseIPDB, VT, Talos.</p></div></div><div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Block</h4><p>Block IP di firewall.</p></div></div><div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>If Compromised</h4><p>Reset password. Check lateral movement, persistence.</p></div></div>` }
  ]
},

'linux-response': {
  name: 'Linux Live Response', subtitle: 'Command penting untuk investigasi Linux.',
  tags: ['tag-playbook','tag-cli'], tagLabels: ['IR Commands','CLI'],
  sections: [
    { id: 'system', title: 'System Info', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>hostname && uname -a
uptime && date
df -h && free -h</code></pre></div>` },
    { id: 'users', title: 'Users & Auth', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>who && w
last -20 && lastb -20
grep -v '/nologin\\|/false' /etc/passwd
awk -F: '$3 == 0 {print}' /etc/passwd
grep "Failed password" /var/log/auth.log | tail -20</code></pre></div>` },
    { id: 'processes', title: 'Processes', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>ps auxf
ps aux --sort=-%cpu | head -20
ps aux | grep -iE "nc |ncat|netcat|python.*http|/tmp/|/dev/shm/"
ls -la /proc/[PID]/exe
lsof -i -P</code></pre></div>` },
    { id: 'network', title: 'Network', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>ss -tulnp
ss -tp state established
cat /etc/resolv.conf && cat /etc/hosts
iptables -L -n -v</code></pre></div>` },
    { id: 'persistence', title: 'Persistence', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>for u in $(cut -d: -f1 /etc/passwd); do crontab -l -u $u 2>/dev/null && echo "^^^ $u"; done
ls -la /etc/cron.*
systemctl list-unit-files --state=enabled
find /etc/systemd/ -name "*.service" -mtime -7 -ls
find / -perm -4000 -type f 2>/dev/null</code></pre></div>` },
    { id: 'files', title: 'Files & Logs', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>find / -mtime -1 -type f 2>/dev/null | grep -v "/proc\\|/sys"
ls -la /tmp/ /dev/shm/ /var/tmp/
find /tmp /dev/shm -type f -executable 2>/dev/null
tail -100 /var/log/auth.log
journalctl --since "1 hour ago"</code></pre></div>` }
  ]
}
}); // end Object.assign
