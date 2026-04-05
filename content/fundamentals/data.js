// ═══════════════════════════════════════════════════════
// Fundamentals — SOC Fundamentals, Log Analysis, Email & Phishing,
//   Alert Triage, Network Fundamentals, OSINT for SOC
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────
// 1. SOC Fundamentals
// ─────────────────────────────────────────
'soc-fundamentals': {
  name: 'SOC Fundamentals',
  subtitle: 'Apa itu SOC, role L1/L2/L3, daily routine, escalation, metrics & career path.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'what-is-soc', title: 'Apa itu SOC?', html: `
<p><strong>Security Operations Center (SOC)</strong> adalah tim — dan ruangan — yang bertanggung jawab memonitor, mendeteksi, menganalisis, dan merespons insiden keamanan siber <em>24 jam sehari, 7 hari seminggu</em>.</p>

<div class="callout callout-tip">
<strong>Analogi Gampangnya:</strong> SOC itu kayak <em>UGD rumah sakit</em>, tapi pasiennya adalah infrastruktur IT perusahaan. Alert masuk = pasien datang. Tugas kita: <strong>triage</strong> (prioritas), <strong>diagnosa</strong> (investigasi), dan <strong>treatment</strong> (response).
</div>

<h4>Kenapa SOC Itu Ada?</h4>
<p>Perusahaan yang punya ratusan server, ribuan endpoint, dan puluhan aplikasi <strong>tidak bisa mengandalkan satu orang admin</strong> untuk jaga keamanan. Dibutuhkan tim khusus yang:</p>
<ul>
  <li>Monitor log dan alert dari SIEM (Wazuh, Splunk, QRadar, dsb.) secara real-time</li>
  <li>Investigasi anomali dan potential threats</li>
  <li>Merespons insiden — dari phishing sampai ransomware</li>
  <li>Mendokumentasikan semuanya di ticketing system</li>
</ul>

<h4>Tipe SOC</h4>
<table class="ref-table">
  <tr><th>Tipe</th><th>Deskripsi</th><th>Contoh</th></tr>
  <tr><td><strong>In-House SOC</strong></td><td>Dibangun dan dioperasikan sendiri oleh perusahaan. Full control, tapi mahal.</td><td>Bank besar, telco, enterprise</td></tr>
  <tr><td><strong>MSSP / MDR</strong></td><td>Outsource ke penyedia layanan keamanan. Managed Security Service Provider.</td><td>CrowdStrike Falcon Complete, Secureworks</td></tr>
  <tr><td><strong>Hybrid SOC</strong></td><td>Kombinasi: tim internal handles critical, MSSP handles after-hours/L1.</td><td>Banyak perusahaan menengah pakai model ini</td></tr>
  <tr><td><strong>Virtual SOC</strong></td><td>Tim tersebar (remote), tidak ada ruangan fisik dedicated.</td><td>Startup, distributed team</td></tr>
</table>
`},

    { id: 'roles', title: 'Roles: L1, L2, L3', html: `
<p>SOC biasanya dibagi jadi <strong>3 tier</strong>. Makin tinggi tier, makin dalam technical depth-nya.</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">L1</span> SOC Analyst — Triage & Monitor</div>
<ul>
  <li><strong>Tugas utama:</strong> Monitor dashboard SIEM, triage alert yang masuk, tentukan False Positive (FP) atau True Positive (TP)</li>
  <li><strong>Realita:</strong> ~80% alert yang masuk itu <strong>false positive</strong>. L1 harus bisa bedain dengan cepat</li>
  <li><strong>Skill:</strong> Baca log, pahami alert, basic IOC lookup (VirusTotal, AbuseIPDB), tulis tiket</li>
  <li><strong>Shift:</strong> 24/7 rotation (pagi-siang-malam), biasanya 8 atau 12 jam per shift</li>
  <li><strong>Gaji ID market:</strong> IDR 6-12 juta/bulan (entry level, tergantung kota & perusahaan)</li>
</ul>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">L2</span> SOC Analyst — Deep Investigation</div>
<ul>
  <li><strong>Tugas utama:</strong> Investigasi lanjutan dari eskalasi L1, threat hunting proaktif, korelasi multi-alert</li>
  <li><strong>Realita:</strong> L2 nggak cuma reaktif — mereka juga <em>hunting</em>: cari threat yang belum trigger alert</li>
  <li><strong>Skill:</strong> Advanced SIEM queries, packet analysis, basic forensics, understanding of attack techniques (MITRE ATT&CK)</li>
  <li><strong>Gaji ID market:</strong> IDR 12-25 juta/bulan</li>
</ul>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">L3</span> SOC Analyst / Incident Responder</div>
<ul>
  <li><strong>Tugas utama:</strong> Advanced forensics, malware reverse engineering, IR lead, tuning rules & detection engineering</li>
  <li><strong>Realita:</strong> L3 seringkali juga handles architecture review, red team collaboration, dan threat intelligence</li>
  <li><strong>Skill:</strong> Memory forensics (Volatility), disk forensics (Autopsy), malware analysis, scripting (Python, PowerShell), incident coordination</li>
  <li><strong>Gaji ID market:</strong> IDR 25-50+ juta/bulan</li>
</ul>
</div>

<div class="callout callout-info">
<strong>Note:</strong> Nggak semua SOC pakai sistem tier. Beberapa SOC kecil cuma punya 2-3 orang yang handle semuanya. Tapi konsep tiering membantu memahami <em>progression</em> skill dan tanggung jawab.
</div>
`},

    { id: 'daily-routine', title: 'Hari Pertama di SOC', html: `
<p>Gimana sih hari-hari seorang SOC analyst L1? Ini contoh timeline shift pagi (08:00 - 16:00):</p>

<table class="ref-table">
  <tr><th>Waktu</th><th>Aktivitas</th><th>Detail</th></tr>
  <tr><td>08:00</td><td><strong>Shift Handover</strong></td><td>Baca notes dari shift malam. Ada ongoing incident? Ada alert yang pending? Cek Slack/Teams channel.</td></tr>
  <tr><td>08:15</td><td><strong>Dashboard Check</strong></td><td>Buka SIEM dashboard. Lihat alert volume 8 jam terakhir. Ada spike? Ada critical yang belum di-handle?</td></tr>
  <tr><td>08:30</td><td><strong>Alert Queue</strong></td><td>Mulai triage dari alert severity tertinggi. Critical → High → Medium.</td></tr>
  <tr><td>09:00</td><td><strong>Triage Alert #1</strong></td><td>Alert: "Multiple failed SSH logins from 185.x.x.x". Cek AbuseIPDB → known scanner. Cek internal: external facing server. Block IP, close as TP handled.</td></tr>
  <tr><td>09:30</td><td><strong>Triage Alert #2</strong></td><td>Alert: "Suspicious PowerShell execution". Cek user → IT admin running patch script. Verify dengan tim IT. Close as FP benign.</td></tr>
  <tr><td>10:00</td><td><strong>Investigate Escalation</strong></td><td>L2 minta bantu cari log tambahan. Run specific SIEM queries, collect evidence.</td></tr>
  <tr><td>11:00</td><td><strong>Email dari User</strong></td><td>"Saya terima email mencurigakan." → Analisis header, check URL di URLScan, hash attachment di VT.</td></tr>
  <tr><td>12:00</td><td><strong>Lunch</strong></td><td>Pastikan partner cover alert queue.</td></tr>
  <tr><td>13:00</td><td><strong>Continue Triage</strong></td><td>Process remaining medium alerts. Kebanyakan FP dari vulnerability scanner internal.</td></tr>
  <tr><td>14:00</td><td><strong>Documentation</strong></td><td>Update tiket, tulis investigation notes, close resolved cases di IRIS/TheHive.</td></tr>
  <tr><td>15:00</td><td><strong>Learning Time</strong></td><td>Review new detections, baca CTI report, practice di lab.</td></tr>
  <tr><td>15:45</td><td><strong>Shift Handover (keluar)</strong></td><td>Tulis notes untuk shift sore: pending alerts, ongoing investigation, things to watch.</td></tr>
</table>

<div class="callout callout-tip">
<strong>Pro tip:</strong> Dokumentasi yang baik saat handover = shift berikutnya nggak perlu ulang investigasi dari nol. Ini skill yang sering di-underestimate tapi sangat dihargai di SOC.
</div>
`},

    { id: 'tools-ecosystem', title: 'SOC Tools Ecosystem', html: `
<p>SOC analyst nggak kerja dengan satu tool aja. Ini gambaran bagaimana semua tools saling connect:</p>

<div class="code-block"><div class="code-label"><span>SOC Tools Flow</span></div><pre><code>┌─────────────────────────────────────────────────────────────┐
│                     LOG SOURCES                             │
│  Windows Events │ Linux Syslog │ Firewall │ Cloud │ Apps   │
└──────────────────────────┬──────────────────────────────────┘
                           │ forward logs
                           ▼
              ┌─────────────────────────┐
              │         SIEM            │
              │  (Wazuh / Splunk / etc) │
              │  Collect, Parse, Alert  │
              └─────────┬───────────────┘
                        │ generates alerts
          ┌─────────────┼─────────────────┐
          ▼             ▼                 ▼
   ┌─────────────┐ ┌──────────┐  ┌────────────────┐
   │   EDR       │ │ TICKETING│  │   CTI          │
   │ (Wazuh Agent│ │ (IRIS /  │  │ (VT, AbuseIPDB,│
   │  CrowdStrike│ │ TheHive) │  │  MISP, OTX)    │
   │  Defender)  │ │          │  │                │
   └─────────────┘ └──────────┘  └────────────────┘
          │                              │
          └────────── FORENSICS ─────────┘
              (Wireshark, Volatility, Autopsy)
</code></pre></div>

<p><strong>Alur kerja singkat:</strong></p>
<ol>
  <li><strong>Log Sources</strong> kirim log ke <strong>SIEM</strong></li>
  <li>SIEM melakukan <strong>parsing & korelasi</strong>, generate <strong>alert</strong></li>
  <li>SOC Analyst melakukan <strong>triage</strong> (pakai SIEM + CTI untuk enrichment)</li>
  <li><strong>EDR</strong> memberi visibilitas endpoint: proses berjalan, file changes, network connections</li>
  <li>Setiap investigasi di-track di <strong>Ticketing</strong> (IRIS/TheHive)</li>
  <li>Kalau butuh deep analysis → <strong>Forensics tools</strong></li>
</ol>
`},

    { id: 'metrics', title: 'Metrics & SLA', html: `
<p>SOC diukur pakai metrics. Kalau interview SOC, kemungkinan besar ditanya soal ini:</p>

<table class="ref-table">
  <tr><th>Metric</th><th>Apa Itu</th><th>Target Umum</th><th>Kenapa Penting</th></tr>
  <tr><td><strong>MTTD</strong></td><td>Mean Time to Detect — berapa lama dari incident terjadi sampai terdeteksi</td><td>&lt; 24 jam (ideal &lt; 1 jam)</td><td>Makin cepat detect = makin kecil damage</td></tr>
  <tr><td><strong>MTTR</strong></td><td>Mean Time to Respond — berapa lama dari deteksi sampai response selesai</td><td>&lt; 4 jam untuk critical</td><td>Measure efisiensi tim response</td></tr>
  <tr><td><strong>MTTA</strong></td><td>Mean Time to Acknowledge — berapa lama sampai alert pertama kali di-review</td><td>&lt; 15 menit untuk critical</td><td>SLA dasar untuk L1</td></tr>
  <tr><td><strong>FP Rate</strong></td><td>Persentase false positive dari total alert</td><td>&lt; 70% (ideal &lt; 50%)</td><td>FP tinggi = analyst fatigue = missed real threats</td></tr>
  <tr><td><strong>Alert Volume</strong></td><td>Jumlah alert per hari/minggu</td><td>Varies</td><td>Kalau terlalu banyak: tuning rules needed</td></tr>
  <tr><td><strong>Escalation Rate</strong></td><td>Berapa % alert yang di-escalate dari L1 ke L2</td><td>10-20%</td><td>Terlalu tinggi = L1 kurang training. Terlalu rendah = mungkin miss true positives.</td></tr>
</table>

<div class="callout callout-warn">
<strong>Alert Fatigue:</strong> Ini musuh terbesar SOC analyst. Kalau sehari ada 500 alert dan 80% FP, otak manusia <em>pasti</em> mulai skip-skip. Solusi: tuning detection rules, improve baseline, dan automate repetitive triage (SOAR).
</div>
`},

    { id: 'career', title: 'Career Path', html: `
<p>SOC analyst itu bukan dead-end job — ini <strong>launchpad</strong> ke banyak career path di cybersecurity.</p>

<div class="code-block"><div class="code-label"><span>Career Progression</span></div><pre><code>Junior SOC Analyst (L1)
  │
  ├── Senior SOC Analyst (L2)
  │     │
  │     ├── Threat Hunter
  │     ├── Detection Engineer
  │     └── Incident Response Lead (L3)
  │           │
  │           ├── Forensics Specialist
  │           ├── Malware Analyst
  │           ├── Red Team / Purple Team
  │           └── SOC Manager
  │                 │
  │                 └── CISO / Head of Security
  │
  └── GRC / Compliance (alternative path)
</code></pre></div>

<h4>Sertifikasi yang Relevan</h4>
<table class="ref-table">
  <tr><th>Level</th><th>Sertifikasi</th><th>Notes</th></tr>
  <tr><td>Entry</td><td><strong>CompTIA Security+</strong></td><td>Foundation. Banyak job posting minta ini.</td></tr>
  <tr><td>Entry-Mid</td><td><strong>BTL1</strong> (Blue Team Level 1)</td><td>Praktis, fokus defensive. Highly recommended untuk SOC.</td></tr>
  <tr><td>Mid</td><td><strong>CompTIA CySA+</strong></td><td>Cybersecurity Analyst. Covers SIEM, threat detection, IR.</td></tr>
  <tr><td>Mid</td><td><strong>SC-200</strong> (Microsoft)</td><td>Security Operations Analyst. Bagus kalau kerja di ekosistem Microsoft/Sentinel.</td></tr>
  <tr><td>Mid</td><td><strong>CDSA</strong> (HackTheBox)</td><td>Certified Defensive Security Analyst. Hands-on, modern.</td></tr>
  <tr><td>Advanced</td><td><strong>GCIH</strong> (SANS)</td><td>Incident Handler. Gold standard tapi mahal.</td></tr>
  <tr><td>Advanced</td><td><strong>GCFE / GCFA</strong> (SANS)</td><td>Forensics track.</td></tr>
  <tr><td>Specialist</td><td><strong>OSDA</strong> (OffSec)</td><td>Defense Analyst. Baru tapi promising.</td></tr>
</table>

<div class="callout callout-tip">
<strong>Tips:</strong> Sertifikasi itu penting untuk buka pintu, tapi <em>hands-on experience</em> yang bikin kamu beda. Practice di lab (TryHackMe, LetsDefend, CyberDefenders) itu sama pentingnya.
</div>
`}

  ] // end sections
}, // end soc-fundamentals

// ─────────────────────────────────────────
// 2. Log Analysis Basics
// ─────────────────────────────────────────
'log-analysis': {
  name: 'Log Analysis Basics',
  subtitle: 'Cara baca log dari nol: format, parsing, field extraction, dan analysis toolkit.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'why-logs', title: 'Kenapa Log Itu Penting', html: `
<p>Setiap sistem, aplikasi, dan device menghasilkan <strong>log</strong> — catatan kronologis tentang apa yang terjadi. Server login? Ada log. File dihapus? Ada log. Firewall block koneksi? Ada log.</p>

<p>Buat SOC analyst, log adalah <strong>sumber kebenaran utama</strong>. Tanpa log, kamu <em>buta total</em>:</p>
<ul>
  <li>Nggak bisa tahu siapa yang login ke server jam 3 pagi</li>
  <li>Nggak bisa trace bagaimana malware masuk</li>
  <li>Nggak bisa prove bahwa incident memang terjadi (atau nggak terjadi)</li>
</ul>

<div class="callout callout-warn">
<strong>Golden Rule:</strong> "No logs, no evidence. No evidence, no investigation." — Kalau logging nggak di-setup dengan benar, bahkan SIEM termahal pun nggak berguna.
</div>
`},

    { id: 'formats', title: 'Format Log yang Akan Kamu Temui', html: `
<h4>1. Syslog (RFC 5424)</h4>
<p>Format paling klasik di dunia Linux/Unix dan network devices. Hampir semua firewall, router, switch pakai Syslog.</p>
<div class="code-block"><div class="code-label"><span>Syslog</span></div><pre><code>Jan  5 14:32:07 webserver01 sshd[2847]: Failed password for root from 192.168.1.105 port 22 ssh2</code></pre></div>

<p>Breakdown field per field:</p>
<table class="ref-table">
  <tr><th>Field</th><th>Value</th><th>Penjelasan</th></tr>
  <tr><td>Timestamp</td><td><code>Jan  5 14:32:07</code></td><td>Kapan event terjadi. Note: nggak ada tahun! Ini limitasi Syslog lama.</td></tr>
  <tr><td>Hostname</td><td><code>webserver01</code></td><td>Mesin mana yang generate log ini</td></tr>
  <tr><td>Process</td><td><code>sshd[2847]</code></td><td>Service/daemon + PID</td></tr>
  <tr><td>Message</td><td><code>Failed password for root from 192.168.1.105 port 22 ssh2</code></td><td>Event detail — ini yang paling penting dibaca</td></tr>
</table>

<h4>2. Windows Event Log (XML/EVTX)</h4>
<p>Windows menyimpan event dalam format terstruktur. Di SIEM biasanya sudah di-parse, tapi kadang kamu perlu baca raw XML:</p>
<div class="code-block"><div class="code-label"><span>Windows Event XML</span></div><pre><code>&lt;Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"&gt;
  &lt;System&gt;
    &lt;Provider Name="Microsoft-Windows-Security-Auditing" /&gt;
    &lt;EventID&gt;4625&lt;/EventID&gt;
    &lt;TimeCreated SystemTime="2025-01-05T14:32:07.123Z" /&gt;
    &lt;Computer&gt;DC01.corp.local&lt;/Computer&gt;
  &lt;/System&gt;
  &lt;EventData&gt;
    &lt;Data Name="TargetUserName"&gt;admin&lt;/Data&gt;
    &lt;Data Name="IpAddress"&gt;10.0.0.55&lt;/Data&gt;
    &lt;Data Name="LogonType"&gt;3&lt;/Data&gt;
    &lt;Data Name="FailureReason"&gt;%%2313&lt;/Data&gt;
  &lt;/EventData&gt;
&lt;/Event&gt;</code></pre></div>

<p>Key fields: <code>EventID</code> (4625 = failed logon), <code>TargetUserName</code>, <code>IpAddress</code>, <code>LogonType</code> (3 = network logon).</p>

<h4>3. CEF (Common Event Format)</h4>
<p>Format standar yang banyak dipakai vendor security (ArcSight, banyak firewall):</p>
<div class="code-block"><div class="code-label"><span>CEF</span></div><pre><code>CEF:0|Fortinet|FortiGate|7.0|0419016384|session-close|5|src=192.168.1.100 dst=203.0.113.50 dpt=443 proto=TCP act=deny msg=Policy denied</code></pre></div>

<p>Struktur: <code>CEF:version|vendor|product|version|eventID|name|severity|key=value pairs</code></p>

<h4>4. JSON Structured Log</h4>
<p>Format modern. Elasticsearch, cloud services, dan modern applications prefer JSON karena mudah di-parse:</p>
<div class="code-block"><div class="code-label"><span>JSON</span></div><pre><code>{
  "timestamp": "2025-01-05T14:32:07.456Z",
  "level": "WARN",
  "source": "auth-service",
  "event": "login_failed",
  "user": "admin@corp.local",
  "src_ip": "10.0.0.55",
  "reason": "invalid_password",
  "attempt_count": 5
}</code></pre></div>

<div class="callout callout-info">
<strong>Kenapa JSON makin populer?</strong> Karena setiap field punya key yang jelas, nggak perlu regex parsing yang ribet. SIEM bisa langsung index setiap field.
</div>
`},

    { id: 'reading-logs', title: 'Cara Membaca Log', html: `
<p>Apapun formatnya, <strong>proses baca log itu sama</strong>. Ikuti 6 langkah ini:</p>

<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Identify Timestamp & Timezone</h4><p>Kapan event ini terjadi? Timezone UTC atau local? Ini penting untuk timeline correlation.</p></div></div>

<div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Find Source / Hostname</h4><p>Dari mesin mana log ini? Server? Workstation? Firewall? Ini menentukan konteks.</p></div></div>

<div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Find the Action / Event</h4><p>Apa yang terjadi? Login attempt? File access? Network connection? Process execution?</p></div></div>

<div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>Find the Actor</h4><p>Siapa/apa yang melakukan action? Username, source IP, process name, service account?</p></div></div>

<div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>Find the Target</h4><p>Apa yang menjadi target action? Destination IP, file path, user account, resource?</p></div></div>

<div class="playbook-step"><div class="pb-num">6</div><div class="pb-content"><h4>Determine Outcome</h4><p>Berhasil atau gagal? Success/failure, allow/deny, accept/reject?</p></div></div>

<h4>Contoh Penerapan — Apache Access Log</h4>
<div class="code-block"><div class="code-label"><span>Apache Access Log</span></div><pre><code>203.0.113.50 - admin [05/Jan/2025:14:32:07 +0700] "POST /wp-login.php HTTP/1.1" 401 4523</code></pre></div>

<table class="ref-table">
  <tr><th>Step</th><th>Field</th><th>Value</th></tr>
  <tr><td>1. Timestamp</td><td>Date</td><td>05/Jan/2025:14:32:07 +0700 (WIB)</td></tr>
  <tr><td>2. Source</td><td>Client IP</td><td>203.0.113.50</td></tr>
  <tr><td>3. Action</td><td>Request</td><td>POST /wp-login.php (login attempt)</td></tr>
  <tr><td>4. Actor</td><td>User</td><td>admin (attempted username)</td></tr>
  <tr><td>5. Target</td><td>Resource</td><td>/wp-login.php on this web server</td></tr>
  <tr><td>6. Outcome</td><td>Status</td><td><span class="sev sev-high">401 Unauthorized</span> — login gagal!</td></tr>
</table>
`},

    { id: 'common-logs', title: 'Log Sources yang Paling Sering Dianalisis', html: `
<p>Sebagai SOC analyst, ini log sources yang <em>pasti</em> kamu hadapi setiap hari:</p>

<h4>Windows Security Log</h4>
<div class="code-block"><div class="code-label"><span>Windows Event</span></div><pre><code>EventID: 4625 | Logon Type: 3 | Account: administrator | Source: 10.0.0.55 | Status: 0xC000006D</code></pre></div>
<p>Ini failed network logon. Status code 0xC000006D = wrong password. Kalau ada ratusan dari satu IP → <span class="sev sev-crit">BRUTE FORCE</span>.</p>

<h4>Linux auth.log</h4>
<div class="code-block"><div class="code-label"><span>auth.log</span></div><pre><code>Jan  5 03:14:22 prod-db sshd[9182]: Accepted publickey for deploy from 10.0.1.50 port 48221 ssh2
Jan  5 03:14:25 prod-db sudo:   deploy : TTY=pts/0 ; PWD=/home/deploy ; USER=root ; COMMAND=/bin/bash</code></pre></div>
<p>SSH login sukses pakai publickey → langsung sudo ke root. Normal kalau ini deploy user. Suspicious kalau jam 3 pagi dari IP unknown.</p>

<h4>Firewall Log</h4>
<div class="code-block"><div class="code-label"><span>Firewall</span></div><pre><code>2025-01-05T14:32:07Z FW01 action=deny proto=TCP src=185.220.101.33 dst=10.0.0.10 dport=3389 rule=BLOCK-RDP</code></pre></div>
<p>Firewall block RDP attempt dari IP eksternal. <strong>Good</strong> — firewall doing its job. Tapi cek: IP ini hit berapa kali? Dari mana asalnya?</p>

<h4>DNS Query Log</h4>
<div class="code-block"><div class="code-label"><span>DNS</span></div><pre><code>05-Jan-2025 14:32:07 client 10.0.0.55#51234: query: aHR0cHM6Ly9ldmlsLmNvbQ.data.evil-c2.com IN A +</code></pre></div>
<p>Lihat subdomain yang panjang dan aneh? Itu bisa jadi <span class="sev sev-crit">DNS TUNNELING</span> — data di-encode dalam DNS queries untuk exfiltration.</p>

<h4>Proxy / Web Filter Log</h4>
<div class="code-block"><div class="code-label"><span>Proxy</span></div><pre><code>2025-01-05 14:32:07 10.0.0.55 GET https://pastebin.com/raw/abc123 200 text/plain "Mozilla/5.0" category=uncategorized</code></pre></div>
<p>User akses Pastebin raw content? Bisa legitimate, tapi juga sering dipakai malware untuk download payload/C2 config. <strong>Investigate further</strong>.</p>
`},

    { id: 'grep-tips', title: 'Log Analysis Toolkit', html: `
<p>Sebelum pakai SIEM, kamu harus bisa analisis log manual pakai command line. Ini skill yang <strong>selalu berguna</strong>, terutama saat SIEM down atau saat analisis raw log file.</p>

<div class="code-block"><div class="code-label"><span>Essential Commands</span></div><pre><code><span class="code-comment"># Cari pattern dalam log</span>
grep "Failed password" /var/log/auth.log

<span class="code-comment"># Case-insensitive search</span>
grep -i "error\\|critical\\|fatal" /var/log/syslog

<span class="code-comment"># Show 3 lines before and after match (context)</span>
grep -B3 -A3 "segfault" /var/log/kern.log

<span class="code-comment"># Count occurrences</span>
grep -c "404" /var/log/apache2/access.log</code></pre></div>

<h4>Power Combo: The Log Analysis Pipeline</h4>
<p>Ini pipeline yang paling sering dipakai SOC analyst di CLI. Hapalkan:</p>

<div class="code-block"><div class="code-label"><span>Bash Pipeline</span></div><pre><code><span class="code-comment"># Top 10 IP yang paling banyak gagal login SSH</span>
cat /var/log/auth.log | grep "Failed password" | awk '{print $11}' | sort | uniq -c | sort -rn | head

<span class="code-comment"># Penjelasan step by step:</span>
<span class="code-comment"># cat auth.log          → tampilkan isi file</span>
<span class="code-comment"># grep "Failed password" → filter hanya baris yang berisi "Failed password"</span>
<span class="code-comment"># awk '{print $11}'     → ambil field ke-11 (IP address)</span>
<span class="code-comment"># sort                  → urutkan alphabetically (prerequisite uniq)</span>
<span class="code-comment"># uniq -c               → hitung jumlah duplikat</span>
<span class="code-comment"># sort -rn              → urutkan dari yang terbanyak (reverse numeric)</span>
<span class="code-comment"># head                  → tampilkan 10 teratas</span></code></pre></div>

<div class="code-block"><div class="code-label"><span>More Useful Pipelines</span></div><pre><code><span class="code-comment"># Top 10 URL yang paling banyak di-hit (Apache)</span>
awk '{print $7}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head

<span class="code-comment"># Semua IP yang dapat response 200 di wp-login.php (possible brute force success)</span>
grep "wp-login.php" /var/log/apache2/access.log | grep " 200 " | awk '{print $1}' | sort -u

<span class="code-comment"># Hitung total log entries per jam (traffic pattern)</span>
awk '{print $4}' /var/log/apache2/access.log | cut -d: -f1,2 | sort | uniq -c

<span class="code-comment"># Cari file executable di /tmp yang baru dibuat (suspicious!)</span>
find /tmp -type f -executable -newer /tmp -mmin -60 -ls 2>/dev/null

<span class="code-comment"># Quick count berapa baris total</span>
wc -l /var/log/auth.log</code></pre></div>

<div class="callout callout-tip">
<strong>Pro tip:</strong> Simpan pipeline yang sering kamu pakai sebagai alias atau script. Contoh: <code>alias top-fail='cat /var/log/auth.log | grep "Failed" | awk \\'{print $11}\\' | sort | uniq -c | sort -rn | head'</code>
</div>
`}

  ] // end sections
}, // end log-analysis

// ─────────────────────────────────────────
// 3. Email Security & Phishing Analysis
// ─────────────────────────────────────────
'email-phishing': {
  name: 'Email Security & Phishing Analysis',
  subtitle: 'Analisis email header, SPF/DKIM/DMARC, URL & attachment analysis, dan response steps.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'why-email', title: 'Kenapa Email = Attack Vector #1', html: `
<p>Statistik nggak bohong: <strong>90%+ serangan cyber dimulai dari email</strong>. Kenapa? Karena email:</p>
<ul>
  <li>Bisa dikirim ke siapa aja tanpa perlu "masuk" ke network</li>
  <li>User tinggal klik satu link atau buka satu file — game over</li>
  <li>Sulit di-block 100% tanpa mengganggu bisnis</li>
</ul>

<h4>Jenis-jenis Email Attack</h4>
<table class="ref-table">
  <tr><th>Jenis</th><th>Deskripsi</th><th>Severity</th></tr>
  <tr><td><strong>Credential Phishing</strong></td><td>Fake login page (Microsoft 365, Google, banking). User masukkan password → attacker dapat.</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Spear Phishing</strong></td><td>Targeted ke individu spesifik. Riset dulu: nama bos, project, context. Jauh lebih meyakinkan.</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>BEC</strong> (Business Email Compromise)</td><td>Pura-pura jadi CEO/CFO, minta transfer uang atau data sensitif. Seringkali tanpa link/attachment.</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Malware Attachment</strong></td><td>File .docm (macro), .iso, .img, .html smuggling, .pdf dengan exploit.</td><td><span class="sev sev-high">HIGH</span></td></tr>
  <tr><td><strong>QR Phishing (Quishing)</strong></td><td>QR code dalam email/PDF → redirect ke fake login page. Bypass URL scanning!</td><td><span class="sev sev-high">HIGH</span></td></tr>
</table>

<div class="callout callout-info">
<strong>SOC Analyst harus bisa</strong> analisis email dari awal sampai akhir: header → URL → attachment → impact assessment → response. Ini salah satu task paling frequent di L1.
</div>
`},

    { id: 'headers', title: 'Membaca Email Header', html: `
<p>Email header berisi <strong>metadata lengkap</strong> tentang email: dari mana asalnya, lewat server mana, authentication results, dll. Ini "jejak kaki" email yang nggak bisa dipalsukan semua.</p>

<h4>Cara Dapat Email Header</h4>
<ul>
  <li><strong>Outlook:</strong> Buka email → File → Properties → Internet Headers</li>
  <li><strong>Gmail:</strong> Buka email → titik tiga (⋮) → Show original</li>
  <li><strong>Thunderbird:</strong> View → Message Source (Ctrl+U)</li>
</ul>

<h4>Contoh Header & Breakdown</h4>
<div class="code-block"><div class="code-label"><span>Email Header (simplified)</span></div><pre><code>Return-Path: &lt;bounce@evil-sender.com&gt;
Received: from mail-gateway.corp.local (10.0.0.5)
  by mx01.corp.local with ESMTP id abc123
  for &lt;victim@corp.local&gt;; Mon, 5 Jan 2025 14:32:07 +0700
Received: from smtp.evil-sender.com (185.220.101.33)
  by mail-gateway.corp.local with ESMTP
  for &lt;victim@corp.local&gt;; Mon, 5 Jan 2025 14:32:05 +0700
From: "IT Support" &lt;support@corp-security.com&gt;
To: victim@corp.local
Subject: Urgent: Your Password Expires Today
Date: Mon, 5 Jan 2025 07:32:00 +0000
Message-ID: &lt;random123@evil-sender.com&gt;
X-Originating-IP: 185.220.101.33
Authentication-Results: mx01.corp.local;
  spf=fail (sender IP not in SPF record);
  dkim=none;
  dmarc=fail action=quarantine</code></pre></div>

<h4>Field-by-Field Analysis</h4>
<table class="ref-table">
  <tr><th>Field</th><th>Yang Dicek</th><th>Red Flag di Contoh</th></tr>
  <tr><td><strong>From</strong></td><td>Alamat pengirim yang <em>ditampilkan</em></td><td><code>support@corp-security.com</code> — bukan domain perusahaan kita!</td></tr>
  <tr><td><strong>Return-Path</strong></td><td>Kemana bounce email dikirim. Sering beda dengan From kalau spoofed.</td><td><code>bounce@evil-sender.com</code> — domain berbeda = <span class="sev sev-high">RED FLAG</span></td></tr>
  <tr><td><strong>Received</strong></td><td>Trace route email. <strong>Baca dari bawah ke atas!</strong> Entry terbawah = origin.</td><td>Origin IP: <code>185.220.101.33</code> (known Tor exit node!)</td></tr>
  <tr><td><strong>X-Originating-IP</strong></td><td>IP pengirim asli (tidak selalu ada)</td><td><code>185.220.101.33</code> — same suspicious IP</td></tr>
  <tr><td><strong>Message-ID</strong></td><td>Unique ID. Domain di Message-ID sering reveal real origin.</td><td><code>@evil-sender.com</code> — confirms malicious origin</td></tr>
  <tr><td><strong>Authentication-Results</strong></td><td>SPF, DKIM, DMARC results</td><td>SPF FAIL, DKIM NONE, DMARC FAIL = <span class="sev sev-crit">PHISHING CONFIRMED</span></td></tr>
</table>

<div class="callout callout-tip">
<strong>Tools untuk parsing header otomatis:</strong> Google Admin Toolbox (Messageheader), MXToolbox Header Analyzer, atau copy-paste ke CyberChef.
</div>
`},

    { id: 'auth-checks', title: 'SPF, DKIM, DMARC', html: `
<p>Tiga mekanisme autentikasi email yang <strong>wajib dipahami</strong> SOC analyst:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">SPF</span> Sender Policy Framework</div>
<p><strong>Apa:</strong> DNS record yang menyatakan "hanya IP ini yang boleh kirim email atas nama domain kami".</p>
<p><strong>Cara kerja:</strong> Receiving server cek: apakah IP pengirim ada di SPF record domain? Kalau nggak → SPF fail.</p>
<div class="code-block"><div class="code-label"><span>DNS TXT Record</span></div><pre><code>corp.local. IN TXT "v=spf1 ip4:203.0.113.0/24 include:_spf.google.com -all"</code></pre></div>
<p><code>-all</code> = strict (reject kalau nggak match). <code>~all</code> = soft fail (mark suspicious tapi terima).</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">DKIM</span> DomainKeys Identified Mail</div>
<p><strong>Apa:</strong> Digital signature yang ditambahkan ke email. Prove bahwa email nggak dimodifikasi dalam perjalanan.</p>
<p><strong>Cara kerja:</strong> Sending server sign email pakai private key → receiving server verify pakai public key di DNS.</p>
<div class="code-block"><div class="code-label"><span>Header</span></div><pre><code>DKIM-Signature: v=1; a=rsa-sha256; d=corp.local; s=selector1;
  h=from:to:subject:date; bh=abc123...; b=xyz789...</code></pre></div>
<p><code>d=</code> harus match dengan From domain. Kalau nggak → spoofed.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">DMARC</span> Domain-based Message Authentication</div>
<p><strong>Apa:</strong> Policy yang bilang "kalau SPF dan DKIM gagal, lakukan ini: none/quarantine/reject".</p>
<div class="code-block"><div class="code-label"><span>DNS TXT Record</span></div><pre><code>_dmarc.corp.local. IN TXT "v=DMARC1; p=reject; rua=mailto:dmarc@corp.local"</code></pre></div>
<p><code>p=none</code> = monitor only. <code>p=quarantine</code> = kirim ke spam. <code>p=reject</code> = blok total.</p>
</div>

<h4>Membaca Authentication-Results</h4>
<div class="code-block"><div class="code-label"><span>PASS — Legitimate</span></div><pre><code>Authentication-Results: mx.corp.local;
  spf=pass (sender IP matches SPF record);
  dkim=pass header.d=google.com;
  dmarc=pass action=none</code></pre></div>
<div class="code-block"><div class="code-label"><span>FAIL — Suspicious/Phishing</span></div><pre><code>Authentication-Results: mx.corp.local;
  spf=fail (sender IP 185.220.101.33 not in SPF);
  dkim=none (no DKIM signature);
  dmarc=fail action=quarantine</code></pre></div>

<div class="callout callout-warn">
<strong>Perhatian:</strong> SPF/DKIM/DMARC pass <strong>bukan jaminan</strong> email itu safe! Attacker bisa pakai compromised legitimate account (SPF/DKIM/DMARC akan pass). Selalu analisis content juga.
</div>
`},

    { id: 'url-analysis', title: 'Analisis URL Mencurigakan', html: `
<p>Link dalam email phishing biasanya terlihat legitimate tapi mengarah ke tempat lain. Ini teknik dan tools untuk menganalisisnya:</p>

<h4>Red Flags pada URL</h4>
<table class="ref-table">
  <tr><th>Tanda</th><th>Contoh</th><th>Penjelasan</th></tr>
  <tr><td><strong>IP-based URL</strong></td><td><code>http://185.220.101.33/login</code></td><td>Legitimate service pakai domain, bukan IP langsung</td></tr>
  <tr><td><strong>Typosquatting</strong></td><td><code>https://micr0soft.com/login</code></td><td>Huruf O diganti angka 0</td></tr>
  <tr><td><strong>Subdomain trick</strong></td><td><code>https://login.microsoft.com.evil.net/auth</code></td><td>Domain sebenarnya: evil.net, bukan microsoft.com!</td></tr>
  <tr><td><strong>URL shortener</strong></td><td><code>https://bit.ly/3xY2kZ</code></td><td>Sembunyikan destinasi asli. JANGAN langsung klik!</td></tr>
  <tr><td><strong>Encoded chars</strong></td><td><code>https://corp%2Elocal%40evil.com/</code></td><td>URL encoding untuk confuse user/filter</td></tr>
  <tr><td><strong>Long path</strong></td><td><code>https://evil.com/very/long/path/to/hide/the/real/page.php</code></td><td>Path panjang supaya user nggak scroll untuk lihat domain</td></tr>
</table>

<h4>Contoh: Suspicious vs Clean</h4>
<div class="code-block"><div class="code-label"><span>Suspicious URLs</span></div><pre><code><span class="code-comment"># IP-based with fake path</span>
http://45.33.32.156/microsoft365/login.html

<span class="code-comment"># Typosquatting</span>
https://0ffice365-security.com/verify-account

<span class="code-comment"># Subdomain trick (real domain: attacker.com)</span>
https://secure.microsoft.com.attacker.com/login

<span class="code-comment"># URL-encoded phishing</span>
https://evil.com/%6D%69%63%72%6F%73%6F%66%74/signin</code></pre></div>
<div class="code-block"><div class="code-label"><span>Clean URLs</span></div><pre><code><span class="code-comment"># Real Microsoft login</span>
https://login.microsoftonline.com/common/oauth2/authorize

<span class="code-comment"># Real Google</span>
https://accounts.google.com/signin/v2/identifier</code></pre></div>

<h4>Tools untuk URL Analysis</h4>
<div class="link-row">
  <a class="link-btn" href="https://urlscan.io" target="_blank">↗ URLScan.io</a>
  <a class="link-btn" href="https://www.virustotal.com" target="_blank">↗ VirusTotal</a>
  <a class="link-btn" href="https://any.run" target="_blank">↗ Any.run</a>
</div>

<div class="callout callout-warn">
<strong>JANGAN PERNAH</strong> klik URL mencurigakan langsung di browser kamu! Selalu pakai tools sandbox: URLScan.io (submit URL tanpa mengunjungi), VirusTotal, atau Any.run (interactive sandbox).
</div>
`},

    { id: 'attachment-analysis', title: 'Analisis Attachment', html: `
<p><strong>Rule #1: JANGAN PERNAH buka attachment mencurigakan langsung!</strong> Selalu analisis dulu di environment yang aman.</p>

<h4>Steps Analisis Attachment</h4>
<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Extract tanpa Buka</h4><p>Save attachment ke folder khusus tanpa double-click. Lebih baik lagi: extract dari .eml file.</p></div></div>

<div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Hitung Hash</h4><div class="code-block"><div class="code-label"><span>Hash File</span></div><pre><code><span class="code-comment"># Linux/Mac</span>
sha256sum suspicious_file.pdf

<span class="code-comment"># Windows PowerShell</span>
Get-FileHash -Algorithm SHA256 .\\suspicious_file.pdf</code></pre></div></div></div>

<div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Check Hash di VirusTotal</h4><p>Search hash di VT. Kalau sudah pernah di-submit dan flagged → confirmed malicious. Kalau belum ada → next step.</p></div></div>

<div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>Submit ke Sandbox</h4><p>Upload ke Any.run, Tria.ge, atau JoeSandbox. Lihat behavior: apakah file download sesuatu? Connect ke C2? Modify registry?</p></div></div>

<div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>Cek File Type vs Extension</h4><div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Cek real file type (Linux)</span>
file suspicious_document.pdf
<span class="code-comment"># Output: PE32 executable (GUI) ... ← PDF yang ternyata .exe!</span></code></pre></div></div></div>

<h4>Extension Berbahaya yang Harus Diwaspadai</h4>
<table class="ref-table">
  <tr><th>Extension</th><th>Risk</th><th>Penjelasan</th></tr>
  <tr><td>.exe, .scr, .com, .bat</td><td><span class="sev sev-crit">CRITICAL</span></td><td>Executable langsung. Nggak boleh ada di email corporate.</td></tr>
  <tr><td>.js, .vbs, .hta, .wsf</td><td><span class="sev sev-crit">CRITICAL</span></td><td>Script files. Sering dipakai dropper malware.</td></tr>
  <tr><td>.iso, .img, .vhd</td><td><span class="sev sev-high">HIGH</span></td><td>Disk image — bisa bypass Mark of the Web (MotW). Trend 2023-2024.</td></tr>
  <tr><td>.docm, .xlsm, .pptm</td><td><span class="sev sev-high">HIGH</span></td><td>Macro-enabled Office. Classic malware delivery.</td></tr>
  <tr><td>.html, .htm</td><td><span class="sev sev-high">HIGH</span></td><td>HTML smuggling — JavaScript di dalam HTML file download payload.</td></tr>
  <tr><td>.lnk</td><td><span class="sev sev-high">HIGH</span></td><td>Shortcut file bisa execute arbitrary commands.</td></tr>
  <tr><td>.zip, .rar (password-protected)</td><td><span class="sev sev-high">HIGH</span></td><td>Password di body email + encrypted ZIP = bypass email scanner.</td></tr>
</table>
`},

    { id: 'response', title: 'Response Steps', html: `
<p>Kalau analisis menunjukkan email itu memang <strong>phishing</strong>, lakukan langkah berikut:</p>

<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Collect Evidence</h4><p>Save .eml file (full headers + body). Screenshot kalau perlu. Catat semua IOC: sender, domain, IP, URL, hash.</p></div></div>

<div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Block IOC</h4><p>Block sender domain di email gateway. Block URL di proxy/web filter. Block IP di firewall kalau applicable.</p></div></div>

<div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>Scope — Siapa Lagi yang Kena?</h4><p>Search SIEM: siapa lagi yang terima email dari sender/domain yang sama? Sudah ada yang klik link atau buka attachment?</p>
<div class="code-block"><div class="code-label"><span>SPL Query</span></div><pre><code>index=email (sender="*evil-sender.com" OR url="*evil-phish.com*")
| stats count by recipient, action
| sort - count</code></pre></div></div></div>

<div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>User yang Sudah Klik</h4><p>Kalau ada user yang klik link atau buka attachment:</p>
<ul>
  <li><strong>Reset password segera</strong> (kalau credential phishing)</li>
  <li><strong>Scan endpoint</strong> pakai EDR (Wazuh Agent, CrowdStrike, Defender)</li>
  <li><strong>Check persistence:</strong> scheduled tasks baru, startup items, registry run keys</li>
  <li><strong>Check lateral movement:</strong> apakah ada login dari user itu ke sistem lain?</li>
</ul></div></div>

<div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>Quarantine Email</h4><p>Delete/quarantine email dari semua mailbox yang menerima (admin feature di Exchange/Google Workspace).</p></div></div>

<div class="playbook-step"><div class="pb-num">6</div><div class="pb-content"><h4>Document & Report</h4><p>Buat case di IRIS/TheHive. Catat: timeline, IOC, affected users, actions taken, recommendations.</p></div></div>

<div class="callout callout-tip">
<strong>Cara extract .eml file:</strong><br>
<strong>Outlook:</strong> Drag email ke desktop → save as .eml, atau File → Save As → .msg<br>
<strong>Gmail:</strong> Titik tiga (⋮) → Download message<br>
<strong>CLI:</strong> <code>msgconvert file.msg</code> (convert .msg ke .eml di Linux)
</div>
`}

  ] // end sections
}, // end email-phishing

// ─────────────────────────────────────────
// 4. Alert Triage Decision Framework
// ─────────────────────────────────────────
'alert-triage': {
  name: 'Alert Triage Decision Framework',
  subtitle: 'Decision framework: alert masuk → analisis → FP/TP → escalate/close.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'what-is-triage', title: 'Apa itu Alert Triage?', html: `
<p><strong>Triage</strong> berasal dari dunia medis — proses memilah pasien berdasarkan seberapa urgent kondisinya. Di SOC, triage artinya <strong>memilah alert</strong> untuk menentukan mana yang perlu ditindak segera, mana yang bisa ditunda, dan mana yang false positive.</p>

<div class="callout callout-tip">
<strong>Analogi:</strong> Kamu kerja di UGD dan ada 20 pasien antri. Yang mana duluan? Yang kecelakaan parah → langsung ditangani. Yang flu biasa → tunggu giliran. Yang cuma mau cek tekanan darah → bukan emergency. SOC triage: <strong>Critical alert → investigate immediately. Low FP → close with notes</strong>.
</div>

<p>Sebagai L1 SOC Analyst, <strong>triage adalah tugas utama kamu</strong>. Goal-nya sederhana:</p>
<ol>
  <li>Baca alert yang masuk</li>
  <li>Tentukan: <strong>False Positive (FP)</strong> atau <strong>True Positive (TP)</strong></li>
  <li>Kalau FP → close dan dokumentasikan kenapa</li>
  <li>Kalau TP → investigasi lebih lanjut atau escalate ke L2</li>
  <li>Kalau nggak yakin → <strong>gather more context</strong>, jangan asal close</li>
</ol>

<p>Speed matters, tapi <strong>akurasi lebih penting</strong>. Salah close TP (miss real attack) jauh lebih berbahaya daripada lambat 5 menit.</p>
`},

    { id: 'decision-tree', title: 'Decision Framework', html: `
<p>Gunakan framework ini setiap kali ada alert masuk. Urutannya selalu sama — build muscle memory:</p>

<div class="playbook-step"><div class="pb-num">1</div><div class="pb-content"><h4>Baca Alert Details</h4><p>Jawab 4 pertanyaan dasar: <strong>What</strong> (jenis alert apa?), <strong>When</strong> (kapan?), <strong>Who</strong> (user/IP/hostname mana?), <strong>Where</strong> (sistem/network segment mana?)</p>
<div class="code-block"><div class="code-label"><span>Contoh Alert</span></div><pre><code>Rule: Multiple Failed SSH Login
Severity: High
Source IP: 185.220.101.33
Target: prod-web-01 (10.0.1.10:22)
Count: 247 attempts in 5 minutes
User: root, admin, deploy, ubuntu</code></pre></div>
</div></div>

<div class="playbook-step"><div class="pb-num">2</div><div class="pb-content"><h4>Check Context — Apakah Ini Normal?</h4><p>Pertanyaan: Apakah aktivitas ini normal untuk user/sistem ini? Contoh context checks:</p>
<ul>
  <li>IP source: Internal atau external? Kalau external → lebih suspicious</li>
  <li>Waktu: Jam kerja normal atau jam 3 pagi?</li>
  <li>User: Regular user atau service account?</li>
  <li>Target: Public-facing server atau internal-only system?</li>
</ul>
<p><strong>Verdict contoh:</strong> External IP → ke SSH server production → 247 attempts → multi-user → <span class="sev sev-crit">HIGHLY SUSPICIOUS</span></p>
</div></div>

<div class="playbook-step"><div class="pb-num">3</div><div class="pb-content"><h4>IOC Enrichment</h4><p>Cek IP/domain/hash di threat intelligence:</p>
<ul>
  <li><strong>AbuseIPDB:</strong> <code>185.220.101.33</code> → Confidence: 100%, Reports: 5,247 → <span class="sev sev-crit">Known Tor Exit Node + Scanner</span></li>
  <li><strong>VirusTotal:</strong> IP flagged by 12/87 vendors</li>
  <li><strong>Shodan:</strong> IP running multiple services, located in Romania</li>
</ul>
</div></div>

<div class="playbook-step"><div class="pb-num">4</div><div class="pb-content"><h4>Check Historical</h4><p>Apakah alert ini pernah trigger sebelumnya? Bagaimana resolusinya?</p>
<ul>
  <li>SIEM: search IP ini 30 hari terakhir → sudah trigger 15 kali, semua di-close sebagai FP (automated scanner)</li>
  <li>Atau: <strong>IP ini baru pertama kali muncul → perlu investigasi lebih</strong></li>
</ul>
</div></div>

<div class="playbook-step"><div class="pb-num">5</div><div class="pb-content"><h4>Correlate — Ada Alert Terkait?</h4><p>Cek apakah ada alert lain dari source/target yang sama dalam timeframe dekat:</p>
<ul>
  <li>Same source IP juga trigger "Port Scan Detected" → <strong>confirmed reconnaissance</strong></li>
  <li>Target server juga punya alert "Successful Login After Failed Attempts" → <span class="sev sev-crit">POSSIBLE COMPROMISE</span></li>
</ul>
</div></div>

<div class="playbook-step"><div class="pb-num">6</div><div class="pb-content"><h4>Decision</h4>
<table class="ref-table">
  <tr><th>Hasil</th><th>Action</th><th>Contoh</th></tr>
  <tr><td><strong>False Positive</strong></td><td>Close dengan notes detail kenapa ini FP</td><td>"Known vulnerability scanner IP. No successful login. Recurring alert."</td></tr>
  <tr><td><strong>Suspicious</strong></td><td>Investigate lebih lanjut. Collect more data.</td><td>"External IP brute force tapi belum ada successful login. Monitor."</td></tr>
  <tr><td><strong>True Positive</strong></td><td>Escalate ke L2 atau take action sesuai playbook</td><td>"Brute force followed by successful login → escalate immediately!"</td></tr>
</table>
</div></div>
`},

    { id: 'common-fps', title: 'Common False Positives', html: `
<p>Ini false positive yang <strong>pasti</strong> akan kamu temui. Kenali pattern-nya supaya bisa close cepat dan fokus ke real threats:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">FP 1</span> Vulnerability Scanner Triggering IDS</div>
<p><strong>Alert:</strong> "SQL Injection attempt detected" / "XSS attempt detected"<br>
<strong>Source:</strong> 10.0.10.50 (Nessus/Qualys scanner)<br>
<strong>Kenapa FP:</strong> Vulnerability scanner memang kirim payload attack untuk test — itu tugasnya.<br>
<strong>Cara identifikasi:</strong> Cek source IP → apakah ada di daftar scanner yang sah? Cek jadwal scan? Kalau ya → FP.<br>
<strong>Fix:</strong> Whitelist scanner IPs di detection rules.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">FP 2</span> IT Admin Running Legitimate Tools</div>
<p><strong>Alert:</strong> "Suspicious tool execution: PsExec.exe" / "nmap scan detected"<br>
<strong>Source:</strong> IT-admin-01 (Ahmad dari tim infra)<br>
<strong>Kenapa FP:</strong> PsExec dan nmap memang dipakai IT admin untuk management. Tapi tools yang sama juga dipakai attacker.<br>
<strong>Cara identifikasi:</strong> Verify dengan IT team. Cek: apakah ada change ticket? Apakah jam kerja normal?<br>
<strong>Fix:</strong> Buat allowlist berdasarkan user + source system.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">FP 3</span> Software Updates Triggering FIM</div>
<p><strong>Alert:</strong> "File integrity monitoring: Critical system file modified"<br>
<strong>File:</strong> /usr/bin/curl (updated from 7.81 to 7.82)<br>
<strong>Kenapa FP:</strong> Package update legitimately mengubah system files.<br>
<strong>Cara identifikasi:</strong> Cek: ada maintenance window? Package manager log cocok?</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">FP 4</span> Impossible Travel Alert</div>
<p><strong>Alert:</strong> "User login from Indonesia then Germany within 30 minutes"<br>
<strong>User:</strong> joko@corp.local<br>
<strong>Kenapa FP:</strong> User pakai VPN/proxy yang exit di negara lain. Atau multiple devices.<br>
<strong>Cara identifikasi:</strong> Tanya user atau cek VPN logs. Cek apakah IP kedua itu known VPN provider.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">FP 5</span> Web Crawlers Triggering WAF</div>
<p><strong>Alert:</strong> "Multiple 403 Forbidden — possible directory bruteforce"<br>
<strong>Source:</strong> Googlebot (66.249.x.x)<br>
<strong>Kenapa FP:</strong> Web crawlers memang hit banyak URL termasuk yang restricted. User-Agent dan IP range bisa di-verify.<br>
<strong>Fix:</strong> Whitelist known bot IP ranges.</p>
</div>
`},

    { id: 'escalation', title: 'Kapan Harus Escalate', html: `
<p>Escalation itu bukan tanda kelemahan — itu bagian dari proses. Tapi escalate yang tidak perlu bikin L2 overloaded. Ini panduan kapan <strong>HARUS</strong> escalate:</p>

<h4>Escalate Segera Kalau:</h4>
<table class="ref-table">
  <tr><th>Kondisi</th><th>Contoh</th><th>Severity</th></tr>
  <tr><td><strong>Confirmed malware execution</strong></td><td>EDR alert: "Malicious file executed, C2 connection established"</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Successful unauthorized access</strong></td><td>Failed login followed by successful login from same attacker IP</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Data exfiltration signs</strong></td><td>Large outbound transfer ke IP unknown, DNS tunneling detected</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Ransomware indicators</strong></td><td>Mass file encryption, ransom note files, known ransomware hashes</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Active C2 communication</strong></td><td>Beaconing pattern detected, known C2 domain/IP contacted</td><td><span class="sev sev-crit">CRITICAL</span></td></tr>
  <tr><td><strong>Lateral movement detected</strong></td><td>Compromised account used to access multiple systems</td><td><span class="sev sev-high">HIGH</span></td></tr>
  <tr><td><strong>Privilege escalation</strong></td><td>Normal user suddenly has admin privileges</td><td><span class="sev sev-high">HIGH</span></td></tr>
</table>

<h4>Cara Menulis Escalation Notes yang Baik</h4>
<div class="code-block"><div class="code-label"><span>Escalation Template</span></div><pre><code>ESCALATION TO L2
================
Alert: [Nama alert dan rule ID]
Severity: [Critical/High]
Time: [Timestamp UTC]
Source: [IP/hostname/user]
Target: [IP/hostname/service]

INVESTIGATION DONE:
1. [Step yang sudah dilakukan]
2. [IOC enrichment results]
3. [Correlation findings]

FINDINGS:
- [Key finding 1]
- [Key finding 2]

WHY ESCALATING:
- [Alasan spesifik, bukan "looks suspicious"]

IOCs COLLECTED:
- IP: xxx.xxx.xxx.xxx
- Domain: evil-domain.com
- Hash: abc123...</code></pre></div>

<div class="callout callout-info">
<strong>Tips:</strong> L2 harus bisa lanjut investigasi <em>tanpa perlu tanya-tanya lagi ke L1</em>. Kalau escalation notes kamu lengkap, L2 akan sangat appreciate itu.
</div>
`},

    { id: 'documentation', title: 'Dokumentasi yang Baik', html: `
<p>Dokumentasi itu bukan "nice to have" — ini <strong>mandatory</strong>. Alasan:</p>
<ul>
  <li>Shift berikutnya perlu tahu apa yang sudah dilakukan</li>
  <li>Kalau insiden jadi besar, dokumentasi = evidence trail</li>
  <li>Metrics (MTTD, MTTR) dihitung dari tiket</li>
  <li>Audit dan compliance butuh bukti tertulis</li>
</ul>

<h4>Template Tiket Investigasi</h4>
<div class="code-block"><div class="code-label"><span>Ticket Template</span></div><pre><code>TICKET #[auto-generated]
========================

ALERT DETAILS:
- Rule: [Nama rule SIEM]
- Severity: [Low/Medium/High/Critical]  
- Timestamp: [UTC]
- Source: [IP/host]
- Destination: [IP/host]
- Description: [1-2 kalimat tentang alert]

INVESTIGATION STEPS:
1. Reviewed alert details in [SIEM name]
2. Checked source IP 185.220.101.33 on AbuseIPDB → 
   Result: Confidence 100%, known Tor exit node
3. Checked VirusTotal → flagged by 12 vendors
4. Searched SIEM for related alerts → found port scan 
   from same IP 10 minutes before
5. Verified no successful login after brute force attempts

IOCs:
- IP: 185.220.101.33
- Targeted accounts: root, admin, deploy

CONCLUSION: True Positive — External brute force attack
- Attack was unsuccessful (no compromised accounts)
- Source IP blocked at firewall

ACTIONS TAKEN:
- [x] Blocked IP at perimeter firewall
- [x] Verified no successful unauthorized access
- [x] Notified IT team to review SSH hardening

RECOMMENDATIONS:
- Implement fail2ban on production servers
- Consider disabling password auth (use key-based only)
- Restrict SSH access via VPN only

STATUS: Closed — TP Handled
ANALYST: [Nama kamu]</code></pre></div>

<div class="callout callout-tip">
<strong>Tips menulis ticket:</strong>
<ul>
  <li>Tulis supaya orang yang <strong>nggak ada konteks</strong> bisa paham</li>
  <li>Include timestamps di setiap step (bukan cuma di header)</li>
  <li>Screenshot penting (SIEM query results, VT results)</li>
  <li>Conclusion harus jelas: FP atau TP, dan kenapa</li>
  <li>Actions taken harus specific, bukan "handled"</li>
</ul>
</div>
`}

  ] // end sections
}, // end alert-triage

// ─────────────────────────────────────────
// 5. Network Fundamentals for SOC
// ─────────────────────────────────────────
'network-fundamentals': {
  name: 'Network Fundamentals for SOC',
  subtitle: 'OSI model, TCP handshake, DNS, HTTP anatomy — fondasi yang wajib dikuasai.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'osi-model', title: 'OSI Model — Quick Reference', html: `
<p>OSI Model punya 7 layer. Kamu nggak perlu hapal semuanya secara mendalam — fokus ke layer yang <strong>paling relevan untuk SOC</strong>:</p>

<table class="ref-table">
  <tr><th>Layer</th><th>Nama</th><th>Protocol</th><th>SOC Relevance</th></tr>
  <tr><td>7</td><td><strong>Application</strong></td><td>HTTP, HTTPS, DNS, FTP, SMTP, SSH</td><td><span class="sev sev-crit">PALING PENTING</span> — Ini yang kamu lihat di SIEM dan proxy logs. Phishing URL, C2, data exfil, web attacks.</td></tr>
  <tr><td>6</td><td>Presentation</td><td>SSL/TLS, encoding</td><td>Encryption. Kenapa kamu nggak bisa baca HTTPS traffic tanpa decrypt.</td></tr>
  <tr><td>5</td><td>Session</td><td>NetBIOS, RPC</td><td>Session management. Less directly visible.</td></tr>
  <tr><td>4</td><td><strong>Transport</strong></td><td>TCP, UDP</td><td><span class="sev sev-high">PENTING</span> — Port numbers, TCP flags (SYN scan detection), connection state.</td></tr>
  <tr><td>3</td><td><strong>Network</strong></td><td>IP, ICMP, ARP</td><td><span class="sev sev-high">PENTING</span> — Source/dest IP (who is talking to who), routing, IP spoofing.</td></tr>
  <tr><td>2</td><td>Data Link</td><td>Ethernet, ARP</td><td>MAC addresses. ARP spoofing detection. Switch-level visibility.</td></tr>
  <tr><td>1</td><td>Physical</td><td>Cables, radio</td><td>Jarang dianalisis di SOC, kecuali physical security audit.</td></tr>
</table>

<div class="callout callout-info">
<strong>Mental model untuk SOC:</strong> Kamu biasanya kerja di <strong>Layer 3-4-7</strong>. Layer 3 = siapa bicara ke siapa (IP). Layer 4 = pakai jalur mana (port). Layer 7 = ngomong apa (HTTP request, DNS query, email content).
</div>
`},

    { id: 'tcp-handshake', title: 'TCP Three-Way Handshake', html: `
<p>TCP adalah protokol connection-oriented — sebelum data dikirim, harus ada "perkenalan" dulu. Ini namanya <strong>three-way handshake</strong>:</p>

<div class="code-block"><div class="code-label"><span>TCP Handshake</span></div><pre><code>Client                          Server
  │                               │
  │ ──── SYN (seq=100) ────────▶ │  "Halo, mau connect"
  │                               │
  │ ◀── SYN-ACK (seq=200,        │  "Oke, saya siap"
  │      ack=101) ───────────     │
  │                               │
  │ ──── ACK (ack=201) ────────▶ │  "Deal, mulai kirim data"
  │                               │
  │ ◀────── DATA ──────────────▶ │  Connection established!
</code></pre></div>

<h4>Kenapa Ini Penting untuk SOC?</h4>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> SYN Scan Detection (Port Scanning)</div>
<p>Attacker kirim <strong>SYN tapi nggak pernah complete handshake</strong> (nggak kirim ACK terakhir). Ini namanya <strong>half-open scan</strong> atau SYN scan (nmap -sS). Di log terlihat sebagai banyak SYN tanpa established connection.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># Detect SYN scan: SYN flag set, no subsequent ACK</span>
tcp.flags.syn == 1 && tcp.flags.ack == 0</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> RST (Reset) Flag</div>
<p>RST = "connection ditolak/ditutup paksa". Banyak RST dari satu IP → kemungkinan port scan yang hit closed ports. Atau firewall yang reject connection.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> FIN Flag</div>
<p>FIN = "saya mau tutup connection secara normal". Kalau kamu lihat FIN tanpa preceding data → bisa jadi FIN scan (stealthy port scan).</p>
</div>

<div class="callout callout-tip">
<strong>Di SIEM:</strong> Kamu biasanya nggak lihat individual packets, tapi lihat <strong>connection logs</strong> (flow data). Yang penting: state=ESTABLISHED (berhasil), state=REJECTED/DROPPED (diblok), connection duration, bytes transferred.
</div>
`},

    { id: 'dns-deep', title: 'DNS Deep Dive', html: `
<p><strong>DNS (Domain Name System)</strong> = "buku telepon" internet. Translate domain name (google.com) ke IP address (142.250.x.x). Hampir SEMUA komunikasi internet dimulai dengan DNS query.</p>

<h4>Cara DNS Bekerja (Simplified)</h4>
<div class="code-block"><div class="code-label"><span>DNS Resolution Flow</span></div><pre><code>User ketik: www.corp.local

1. Browser cek cache lokal → nggak ada
2. OS cek /etc/hosts (atau C:\\Windows\\System32\\drivers\\etc\\hosts) → nggak ada
3. Query ke DNS resolver (biasanya ISP atau 8.8.8.8)
4. Resolver tanya Root DNS → "siapa yang handle .local?"
5. Root kasih referral ke TLD nameserver
6. TLD kasih referral ke authoritative nameserver untuk corp.local
7. Authoritative server jawab: "www.corp.local = 10.0.1.5"
8. Resolver cache jawaban, kirim ke client
</code></pre></div>

<h4>DNS Record Types yang Perlu Diketahui</h4>
<table class="ref-table">
  <tr><th>Type</th><th>Fungsi</th><th>SOC Relevance</th></tr>
  <tr><td><strong>A</strong></td><td>Domain → IPv4</td><td>Most common. Cek: domain resolve ke IP mana?</td></tr>
  <tr><td><strong>AAAA</strong></td><td>Domain → IPv6</td><td>Same tapi IPv6.</td></tr>
  <tr><td><strong>MX</strong></td><td>Mail server untuk domain</td><td>Phishing: domain punya MX record? Baru dibuat?</td></tr>
  <tr><td><strong>CNAME</strong></td><td>Alias ke domain lain</td><td>Subdomain takeover vulnerability.</td></tr>
  <tr><td><strong>TXT</strong></td><td>Arbitrary text (SPF, DKIM, DMARC)</td><td>Email authentication verification.</td></tr>
  <tr><td><strong>NS</strong></td><td>Nameserver untuk domain</td><td>Siapa yang control DNS domain ini?</td></tr>
</table>

<h4>DNS Threats yang Harus Dipahami</h4>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">⚠</span> DNS Tunneling</div>
<p>Data di-encode ke dalam DNS queries. Contoh: subdomain yang sangat panjang dan nggak human-readable:</p>
<div class="code-block"><div class="code-label"><span>Suspicious DNS</span></div><pre><code><span class="code-comment"># Normal DNS query</span>
www.google.com                    → normal, pendek, readable

<span class="code-comment"># DNS Tunneling query</span>
aGVsbG8gd29ybGQgdGhpcyBpcw.data.evil-c2.com  → encoded data dalam subdomain!
TG9uZyBzdHJpbmcgZW5jb2RlZA.x.evil-c2.com    → lagi! Pattern: base64-like strings</code></pre></div>
<p><strong>Detection:</strong> Monitor for unusually long domain names (>50 chars), high volume of queries to single domain, high entropy in subdomain.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">⚠</span> DGA (Domain Generation Algorithm)</div>
<p>Malware generate random-looking domain names untuk connect ke C2. Kalau satu domain di-takedown, malware generate yang baru.</p>
<div class="code-block"><div class="code-label"><span>DGA Domains</span></div><pre><code><span class="code-comment"># DGA examples (random-looking)</span>
xkjh7ya2p.net
a8f3kd92m.com
qw7yn3x8p.org

<span class="code-comment"># Normal domains (human-readable)</span>
google.com
microsoft.com
github.com</code></pre></div>
<p><strong>Detection:</strong> High entropy domain names, NXDomain responses (domain doesn't exist), rapid querying of many unique domains.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">⚠</span> Fast Flux</div>
<p>Domain resolve ke IP yang berubah-ubah sangat cepat (TTL rendah). Dipakai botnet untuk sembunyikan C2 infrastructure.</p>
<p><strong>Detection:</strong> Same domain resolving to many different IPs with very low TTL (< 5 minutes).</p>
</div>
`},

    { id: 'http-anatomy', title: 'HTTP Request/Response', html: `
<p>HTTP (Hypertext Transfer Protocol) adalah bahasa komunikasi web. Sebagai SOC analyst, kamu akan sering analisis HTTP traffic di proxy logs, WAF logs, dan packet captures.</p>

<h4>HTTP Request</h4>
<div class="code-block"><div class="code-label"><span>GET Request</span></div><pre><code>GET /api/users?id=42 HTTP/1.1
Host: app.corp.local
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: session=abc123def456</code></pre></div>

<div class="code-block"><div class="code-label"><span>POST Request (form data)</span></div><pre><code>POST /login HTTP/1.1
Host: app.corp.local
Content-Type: application/x-www-form-urlencoded
Content-Length: 42

username=admin&password=P%40ssw0rd123</code></pre></div>

<p><strong>Key parts:</strong> Method (GET/POST), Path (/login), Headers (Host, User-Agent, Cookie), Body (POST data).</p>

<h4>HTTP Response</h4>
<div class="code-block"><div class="code-label"><span>Response</span></div><pre><code>HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session=xyz789; HttpOnly; Secure
X-Frame-Options: DENY

{"status":"success","user":"admin"}</code></pre></div>

<h4>Status Codes untuk SOC</h4>
<table class="ref-table">
  <tr><th>Code</th><th>Meaning</th><th>SOC Relevance</th></tr>
  <tr><td><strong>200</strong></td><td>OK — berhasil</td><td>Normal. Tapi 200 ke malicious domain = data sent successfully</td></tr>
  <tr><td><strong>301/302</strong></td><td>Redirect</td><td>Phishing sering pakai redirect chain. Track final destination!</td></tr>
  <tr><td><strong>401</strong></td><td>Unauthorized</td><td>Auth gagal. Banyak 401 = possible brute force</td></tr>
  <tr><td><strong>403</strong></td><td>Forbidden</td><td>Access denied. Banyak 403 = possible directory enumeration</td></tr>
  <tr><td><strong>404</strong></td><td>Not Found</td><td>Banyak 404 ke path random = directory bruteforce / scanning</td></tr>
  <tr><td><strong>500</strong></td><td>Internal Server Error</td><td>Bisa indikasi: SQL injection attempt, input validation bypass</td></tr>
</table>

<h4>Suspicious HTTP Patterns</h4>
<div class="code-block"><div class="code-label"><span>Suspicious Requests</span></div><pre><code><span class="code-comment"># SQL Injection attempt</span>
GET /product?id=1' OR '1'='1'-- HTTP/1.1

<span class="code-comment"># Command injection</span>
GET /ping?host=127.0.0.1;cat+/etc/passwd HTTP/1.1

<span class="code-comment"># Path traversal</span>
GET /download?file=../../../../etc/shadow HTTP/1.1

<span class="code-comment"># Base64 in parameter (possible encoded payload)</span>
POST /api/exec HTTP/1.1
cmd=cG93ZXJzaGVsbCAtZSBKQUIwQU...

<span class="code-comment"># Unusual User-Agent</span>
GET / HTTP/1.1
User-Agent: python-requests/2.28.0</code></pre></div>

<div class="callout callout-tip">
<strong>Tip:</strong> Kalau lihat <code>python-requests</code>, <code>curl</code>, atau <code>Go-http-client</code> sebagai User-Agent — nggak selalu malicious, tapi worth investigating. Automated tools dan malware sering pakai default User-Agent.
</div>
`},

    { id: 'common-attacks', title: 'Serangan yang Terlihat di Network', html: `
<p>Ringkasan serangan network-level dan cara detection-nya:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Port Scan</div>
<p>Attacker probing port mana yang terbuka di target. Terlihat sebagai banyak connection attempts ke berbagai port dalam waktu singkat.</p>
<div class="code-block"><div class="code-label"><span>Wireshark / SIEM Detection</span></div><pre><code><span class="code-comment"># Wireshark: SYN packets tanpa completion</span>
tcp.flags.syn == 1 && tcp.flags.ack == 0

<span class="code-comment"># Splunk: Detect port scan pattern</span>
index=firewall action=blocked
| stats dc(dest_port) as unique_ports by src_ip
| where unique_ports > 20</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> ARP Spoofing</div>
<p>Attacker broadcast fake ARP replies: "IP 10.0.0.1 (gateway) itu MAC address saya". Traffic victim dikirim ke attacker dulu. Basis untuk Man-in-the-Middle.</p>
<div class="code-block"><div class="code-label"><span>Detection</span></div><pre><code><span class="code-comment"># Wireshark: Duplicate IP with different MAC</span>
arp.duplicate-address-detected

<span class="code-comment"># CLI check ARP table</span>
arp -a  <span class="code-comment"># look for duplicate IPs or suspicious MAC changes</span></code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> DNS Poisoning</div>
<p>Attacker inject fake DNS responses. User ketik google.com tapi diarahkan ke IP attacker. Detection: monitor for DNS responses yang nggak match expected records.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Man-in-the-Middle (MitM)</div>
<p>Attacker positioned between client dan server, intercept dan potentially modify traffic. Biasanya dimulai dari ARP spoofing atau rogue WiFi.</p>
<p><strong>Detection:</strong> SSL/TLS certificate warnings, unexpected certificate changes, ARP anomalies.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> DDoS Patterns</div>
<p>Massive traffic volume dari banyak source ke satu target. Types: SYN flood, UDP flood, HTTP flood, DNS amplification.</p>
<div class="code-block"><div class="code-label"><span>Detection Query</span></div><pre><code><span class="code-comment"># Splunk: Detect traffic spike</span>
index=firewall dest_ip=10.0.1.10
| timechart span=1m count as connections
| where connections > 10000

<span class="code-comment"># SYN flood detection</span>
index=firewall tcp_flag=SYN dest_ip=10.0.1.10
| stats count by src_ip
| where count > 1000</code></pre></div>
</div>
`}

  ] // end sections
}, // end network-fundamentals

// ─────────────────────────────────────────
// 6. OSINT for SOC Analyst
// ─────────────────────────────────────────
'osint-soc': {
  name: 'OSINT for SOC Analyst',
  subtitle: 'Shodan, WHOIS, passive DNS, Google dorking — investigasi aset dan threat intel.',
  tags: ['tag-reference'],
  tagLabels: ['Fundamentals'],
  sections: [

    { id: 'what-is-osint', title: 'OSINT dalam Konteks SOC', html: `
<p><strong>OSINT (Open Source Intelligence)</strong> = mengumpulkan informasi dari sumber publik yang tersedia secara gratis. Dalam konteks SOC, OSINT dipakai untuk:</p>
<ul>
  <li><strong>Investigate IP/domain</strong> yang muncul di alert → siapa pemiliknya? Dari mana? Pernah dipakai untuk attack?</li>
  <li><strong>Enrich IOC</strong> dengan konteks tambahan dari sumber publik</li>
  <li><strong>Understand attacker infrastructure</strong> — hosting, domain registration, SSL certificates</li>
  <li><strong>Verify threat reports</strong> — cross-reference dengan multiple sources</li>
</ul>

<div class="callout callout-info">
<strong>OSINT vs CTI:</strong> CTI (Cyber Threat Intelligence) tools seperti VirusTotal, AbuseIPDB, dll. adalah <em>subset</em> dari OSINT yang fokus ke threat indicators. OSINT lebih luas — termasuk investigasi domain, infrastructure, bahkan social engineering research.
</div>

<div class="callout callout-warn">
<strong>OPSEC Warning:</strong> Saat melakukan OSINT, hati-hati jangan sampai "tip off" threat actor bahwa kamu sedang investigasi mereka. Pakai passive tools (nggak langsung interact dengan target infrastructure). Jangan visit suspicious domain langsung dari network corporate.
</div>
`},

    { id: 'domain-intel', title: 'Domain & IP Investigation', html: `
<p>Ketika kamu menemukan IP atau domain mencurigakan di alert, langkah pertama: <strong>kumpulkan intel</strong>.</p>

<h4>WHOIS Lookup</h4>
<p>WHOIS memberikan informasi registrasi domain: siapa yang daftar, kapan, dimana di-host.</p>
<div class="code-block"><div class="code-label"><span>WHOIS Query</span></div><pre><code><span class="code-comment"># CLI</span>
whois evil-domain.com

<span class="code-comment"># Output yang perlu diperhatikan:</span>
Registrar: NameCheap, Inc.          <span class="code-comment"># Registrar tertentu popular di kalangan attacker</span>
Creation Date: 2025-01-03            <span class="code-comment"># Domain baru = RED FLAG</span>
Registrant Country: RU               <span class="code-comment"># Lokasi registrant</span>
Name Server: ns1.evil-hosting.com    <span class="code-comment"># Nameserver bisa reveal infrastructure</span></code></pre></div>

<div class="callout callout-tip">
<strong>Red flags di WHOIS:</strong>
<ul>
  <li>Domain dibuat <strong>kurang dari 30 hari</strong> yang lalu</li>
  <li>Privacy protection / WHOIS proxy (nggak selalu bad, tapi suspicious kalau combined)</li>
  <li>Registrant email pakai free provider (gmail, protonmail)</li>
  <li>Nameserver di hosting provider yang sering dipakai untuk phishing</li>
</ul>
</div>

<h4>Shodan — Search Engine untuk Internet-Connected Devices</h4>
<p>Shodan scan seluruh internet dan index informasi tentang device/server yang online.</p>
<div class="code-block"><div class="code-label"><span>Shodan Queries</span></div><pre><code><span class="code-comment"># Search IP spesifik</span>
https://www.shodan.io/host/185.220.101.33

<span class="code-comment"># Apa yang kamu dapat:</span>
- Open ports: 22, 80, 443, 8080
- Services: OpenSSH 8.9, nginx 1.18, Apache
- OS: Ubuntu
- Vulnerabilities: CVE-2023-XXXXX
- SSL certificates
- Geolocation

<span class="code-comment"># Search queries berguna:</span>
hostname:"evil-domain.com"          <span class="code-comment"># Cari semua host di domain</span>
org:"Evil Corp"                     <span class="code-comment"># Cari by organization</span>
ssl.cert.subject.cn:"*.evil.com"    <span class="code-comment"># Cari by SSL certificate</span>
port:4444 country:ID                <span class="code-comment"># Meterpreter port di Indonesia</span></code></pre></div>

<h4>Censys — Alternatif Shodan</h4>
<p>Mirip Shodan, tapi sering punya data yang berbeda. Good practice: cek di keduanya.</p>
<div class="code-block"><div class="code-label"><span>Censys Search</span></div><pre><code><span class="code-comment"># Search di https://search.censys.io</span>
ip: 185.220.101.33
services.service_name: HTTP and services.port: 8080
parsed.names: evil-domain.com</code></pre></div>

<h4>SecurityTrails — DNS History & Subdomains</h4>
<p>SecurityTrails menyimpan historical DNS records. Kamu bisa lihat domain dulu resolve kemana, dan discover subdomains.</p>
<div class="code-block"><div class="code-label"><span>SecurityTrails Use Cases</span></div><pre><code><span class="code-comment"># 1. Historical DNS — domain dulu resolve kemana?</span>
evil-domain.com:
  2025-01-01: 185.220.101.33 (known malicious)
  2024-12-15: 203.0.113.50 (clean IP)
  <span class="code-comment"># Domain baru dipakai untuk attack!</span>

<span class="code-comment"># 2. Subdomains</span>
evil-domain.com subdomains:
  admin.evil-domain.com
  c2.evil-domain.com      <span class="code-comment"># 👀 C2 panel!</span>
  phish.evil-domain.com   <span class="code-comment"># 👀 Phishing page!</span></code></pre></div>
`},

    { id: 'passive-dns', title: 'Passive DNS', html: `
<p><strong>Passive DNS</strong> = database historical DNS resolutions yang dikumpulkan secara pasif (tanpa query langsung ke domain). Ini penting karena:</p>
<ul>
  <li>Kamu bisa lihat history <strong>tanpa alert target</strong> bahwa kamu sedang investigasi</li>
  <li>Domain yang sudah di-takedown masih bisa di-trace</li>
  <li>Detect domain yang berubah behavior (dulu clean, sekarang malicious)</li>
</ul>

<h4>Use Case: Domain yang Berubah</h4>
<div class="scenario-card">
<div class="sc-head"><span class="sc-num">!</span> Real-World Scenario</div>
<p>Alert: User mengakses <code>download-update.com</code>.</p>
<p>Cek VirusTotal: 0/87 detections → clean?</p>
<p>Cek Passive DNS di SecurityTrails:</p>
<div class="code-block"><div class="code-label"><span>Passive DNS Timeline</span></div><pre><code>download-update.com:
  2024-06-01 → 2024-12-30: 104.21.x.x (Cloudflare, legitimate site)
  2025-01-02 → now:         185.220.101.33 (known C2 server!)
</code></pre></div>
<p><strong>Verdict:</strong> Domain <strong>baru saja dipindah</strong> ke malicious infrastructure. Kemungkinan domain hijacking atau expired domain diambil alih. <span class="sev sev-crit">INVESTIGATE FURTHER</span></p>
</div>

<h4>Passive DNS Tools</h4>
<table class="ref-table">
  <tr><th>Tool</th><th>URL</th><th>Notes</th></tr>
  <tr><td><strong>SecurityTrails</strong></td><td>securitytrails.com</td><td>Free tier available. Best for historical DNS + subdomains.</td></tr>
  <tr><td><strong>VirusTotal</strong></td><td>virustotal.com (Relations tab)</td><td>Passive DNS, historical WHOIS, associated files.</td></tr>
  <tr><td><strong>RiskIQ / PassiveTotal</strong></td><td>community.riskiq.com</td><td>Microsoft-owned. Great passive DNS database.</td></tr>
  <tr><td><strong>Farsight DNSDB</strong></td><td>dnsdb.info</td><td>Premium tapi sangat comprehensive.</td></tr>
</table>
`},

    { id: 'google-dorking', title: 'Google Dorking for Investigation', html: `
<p><strong>Google dorking</strong> = menggunakan operator pencarian Google yang advanced untuk menemukan informasi yang biasanya nggak muncul di search biasa. Sangat berguna untuk investigasi.</p>

<h4>Operator Dasar</h4>
<table class="ref-table">
  <tr><th>Operator</th><th>Fungsi</th><th>Contoh</th></tr>
  <tr><td><code>site:</code></td><td>Hanya hasil dari domain tertentu</td><td><code>site:evil-domain.com</code></td></tr>
  <tr><td><code>inurl:</code></td><td>Cari keyword di URL</td><td><code>inurl:admin inurl:login</code></td></tr>
  <tr><td><code>intitle:</code></td><td>Cari keyword di page title</td><td><code>intitle:"index of" "parent directory"</code></td></tr>
  <tr><td><code>filetype:</code></td><td>Cari file type spesifik</td><td><code>filetype:pdf site:corp.local</code></td></tr>
  <tr><td><code>ext:</code></td><td>Alias untuk filetype</td><td><code>ext:sql "password"</code></td></tr>
  <tr><td><code>cache:</code></td><td>Cached version of page</td><td><code>cache:evil-domain.com</code></td></tr>
  <tr><td><code>-</code></td><td>Exclude term</td><td><code>site:corp.local -inurl:www</code></td></tr>
</table>

<h4>Dork Queries untuk SOC Investigation</h4>
<div class="code-block"><div class="code-label"><span>Google Dorks</span></div><pre><code><span class="code-comment"># 1. Cari exposed login pages dari domain suspicious</span>
site:evil-domain.com inurl:login OR inurl:admin OR inurl:panel

<span class="code-comment"># 2. Cari leaked credentials/config files</span>
site:pastebin.com "corp.local" OR "corp.local password"

<span class="code-comment"># 3. Cari exposed directory listing (potential data leak)</span>
site:corp.local intitle:"index of" "parent directory"

<span class="code-comment"># 4. Cari error pages yang reveal informasi internal</span>
site:corp.local "Fatal error" OR "mysql_connect" OR "syntax error"

<span class="code-comment"># 5. Cari dokumen sensitif yang ke-index Google</span>
site:corp.local filetype:xlsx OR filetype:csv "password" OR "credential"

<span class="code-comment"># 6. Cari related infrastructure dari attacker domain</span>
"evil-domain.com" -site:evil-domain.com</code></pre></div>

<div class="callout callout-warn">
<strong>Legal notice:</strong> Google dorking itu <strong>legal</strong> — kamu hanya pakai informasi publik yang sudah di-index Google. Tapi <strong>mengakses</strong> resource yang kamu temukan (tanpa authorization) bisa melanggar hukum. View ≠ access.
</div>
`},

    { id: 'social-media', title: 'Social Engineering & Social Media', html: `
<p>Kadang investigasi SOC perlu extend ke luar technical scope — terutama saat dealing dengan targeted attacks atau investigating threat actors.</p>

<h4>Investigasi Sender Phishing</h4>
<p>Kalau phishing email datang dari "human-looking" account (bukan randomly generated), worth checking:</p>
<ul>
  <li>LinkedIn: apakah orang ini real? Apakah claim-nya (jabatan, perusahaan) legitimate?</li>
  <li>Twitter/X: apakah account ini terkait dengan kampanye tertentu?</li>
  <li>Search engine: "<code>nama pengirim</code>" + "<code>email</code>" — ada di data breach?</li>
</ul>

<h4>Monitor Paste Sites</h4>
<p>Attacker dan script kiddies sering dump data di paste sites:</p>
<ul>
  <li><strong>Pastebin.com</strong> — cari domain/email perusahaan kamu</li>
  <li><strong>GitHub Gists</strong> — public gists kadang berisi leaked secrets</li>
  <li><strong>GitHub code search</strong> — search domain perusahaan di GitHub public repos: <code>"corp.local" password OR api_key OR secret</code></li>
</ul>

<h4>Have I Been Pwned</h4>
<p>Check apakah email address (corporate atau personal dari attacker) muncul di known data breaches:</p>
<div class="code-block"><div class="code-label"><span>HIBP Check</span></div><pre><code><span class="code-comment"># Web</span>
https://haveibeenpwned.com/

<span class="code-comment"># API (kalau punya key)</span>
GET https://haveibeenpwned.com/api/v3/breachedaccount/user@corp.local
Authorization: hibp-api-key YOUR_KEY</code></pre></div>

<div class="callout callout-info">
<strong>Use case:</strong> Employee melaporkan "account saya di-hack". Cek HIBP → email muncul di breach XYZ bulan lalu. Employee pakai password yang sama di corporate? → <strong>credential stuffing risk</strong>. Force password reset + enable MFA.
</div>
`},

    { id: 'resources', title: 'OSINT Resources', html: `
<p>Quick links ke tools yang paling sering dipakai untuk OSINT investigation:</p>

<h4>Infrastructure Intelligence</h4>
<div class="link-row">
  <a class="link-btn" href="https://www.shodan.io" target="_blank">↗ Shodan</a>
  <a class="link-btn" href="https://search.censys.io" target="_blank">↗ Censys</a>
  <a class="link-btn" href="https://securitytrails.com" target="_blank">↗ SecurityTrails</a>
  <a class="link-btn" href="https://dnsdumpster.com" target="_blank">↗ DNSDumpster</a>
</div>

<h4>Threat Intelligence</h4>
<div class="link-row">
  <a class="link-btn" href="https://www.virustotal.com" target="_blank">↗ VirusTotal</a>
  <a class="link-btn" href="https://www.abuseipdb.com" target="_blank">↗ AbuseIPDB</a>
  <a class="link-btn" href="https://urlscan.io" target="_blank">↗ URLScan.io</a>
  <a class="link-btn" href="https://threatfox.abuse.ch" target="_blank">↗ ThreatFox</a>
</div>

<h4>Historical & Archives</h4>
<div class="link-row">
  <a class="link-btn" href="https://web.archive.org" target="_blank">↗ Wayback Machine</a>
  <a class="link-btn" href="https://haveibeenpwned.com" target="_blank">↗ Have I Been Pwned</a>
  <a class="link-btn" href="https://community.riskiq.com" target="_blank">↗ RiskIQ Community</a>
</div>

<h4>OSINT Frameworks & Collections</h4>
<div class="link-row">
  <a class="link-btn" href="https://osintframework.com" target="_blank">↗ OSINT Framework</a>
  <a class="link-btn" href="https://inteltechniques.com/tools/" target="_blank">↗ IntelTechniques</a>
</div>

<div class="callout callout-tip">
<strong>Workflow recommendation:</strong> Setiap kali menemukan suspicious IP/domain, <strong>minimal</strong> cek di: 1) VirusTotal 2) AbuseIPDB 3) WHOIS 4) Shodan. Kalau masih nggak jelas, expand ke Passive DNS dan Google dorking.
</div>
`}

  ] // end sections
}, // end osint-soc

// ═══════════════════════════════════════════
// AV vs EDR vs NDR vs XDR
// ═══════════════════════════════════════════
'av-edr-ndr-xdr': {
  name: 'Antivirus vs EDR vs NDR vs XDR',
  subtitle: 'Apa bedanya? Kapan pakai yang mana? Evolusi endpoint & network security dari AV tradisional sampai XDR modern.',
  tags: ['tag-reference'], tagLabels: ['Fundamentals'],
  sections: [

    { id: 'intro', title: 'Kenapa Ini Penting?',
      html: `
<p>Kalau baca job listing SOC analyst atau ikut meeting sama vendor, pasti ketemu istilah ini: AV, EDR, NDR, XDR. Semuanya solusi keamanan, tapi beda scope dan capability. Sebagai SOC analyst, kamu harus paham bedanya karena ini menentukan <strong>apa yang bisa kamu lihat</strong> dan <strong>apa yang bisa kamu lakukan</strong> saat investigasi.</p>

<div class="callout callout-info"><strong>Analogi sederhana:</strong><br>
• <strong>Antivirus</strong> = kunci pintu rumah — cuma cek siapa yang masuk, pakai daftar orang jahat yang dikenal<br>
• <strong>EDR</strong> = CCTV + alarm + security guard di setiap ruangan — record semua aktivitas, bisa respond<br>
• <strong>NDR</strong> = CCTV di jalanan dan lorong — monitor lalu lintas antar gedung, detect gerak-gerik mencurigakan<br>
• <strong>XDR</strong> = command center yang integrasikan semua CCTV, alarm, dan guard — satu dashboard, satu response</div>
` },

    { id: 'comparison-table', title: 'Perbandingan Lengkap',
      html: `
<table class="ref-table">
  <tr>
    <th>Aspek</th>
    <th>Antivirus (AV)</th>
    <th>EDR</th>
    <th>NDR</th>
    <th>XDR</th>
  </tr>
  <tr>
    <td><strong>Apa yang dimonitor</strong></td>
    <td>File di disk endpoint</td>
    <td>Semua aktivitas di endpoint (proses, file, registry, network, memory)</td>
    <td>Network traffic (packet, flow, metadata)</td>
    <td>Endpoint + Network + Cloud + Email + Identity — semuanya</td>
  </tr>
  <tr>
    <td><strong>Cara deteksi</strong></td>
    <td>Signature-based (cocokkan hash/pattern dengan database malware)</td>
    <td>Behavioral analysis + signature + machine learning + IOC matching</td>
    <td>Traffic analysis + anomaly detection + protocol inspection + ML</td>
    <td>Korelasi cross-layer — gabungan semua metode di atas</td>
  </tr>
  <tr>
    <td><strong>Response capability</strong></td>
    <td>Quarantine/delete file. Itu doang.</td>
    <td>Isolate endpoint, kill process, block hash, collect forensic data, remote shell</td>
    <td>Block IP/port, segment network, alert SOC</td>
    <td>Automated playbook across endpoint + network + cloud. Full orchestration.</td>
  </tr>
  <tr>
    <td><strong>Visibility</strong></td>
    <td>Low — cuma lihat file events</td>
    <td>High di endpoint — process tree, command line, file changes, registry, network per-process</td>
    <td>High di network — east-west traffic, lateral movement, C2, exfiltration</td>
    <td>Full — korelasi data dari semua sumber</td>
  </tr>
  <tr>
    <td><strong>Contoh produk</strong></td>
    <td>Windows Defender, Kaspersky, Norton, Avast</td>
    <td>CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint, Wazuh (open source)</td>
    <td>Darktrace, Vectra AI, ExtraHop, Corelight, Zeek (open source)</td>
    <td>Palo Alto Cortex XDR, Microsoft Sentinel + Defender, IntelliBron Orion, Trend Micro Vision One</td>
  </tr>
  <tr>
    <td><strong>Harga</strong></td>
    <td>Murah / gratis (built-in OS)</td>
    <td>$$$ per endpoint/year</td>
    <td>$$$$ per sensor/year</td>
    <td>$$$$$ — paling mahal, tapi paling comprehensive</td>
  </tr>
</table>
` },

    { id: 'av-detail', title: 'Antivirus — Si Veteran',
      html: `
<p>Antivirus adalah solusi keamanan paling tua. Cara kerjanya sederhana:</p>
<ol>
  <li>Vendor maintain <strong>database signature</strong> — hash dan pattern dari malware yang dikenal</li>
  <li>AV scan file di disk, cocokkan dengan database</li>
  <li>Kalau cocok → <strong>quarantine atau delete</strong></li>
  <li>Beberapa AV modern tambah <strong>heuristic</strong> (analisis behavior sederhana)</li>
</ol>

<h3>Kelebihan</h3>
<ul>
  <li>Simple, ringan, murah (sering gratis)</li>
  <li>Efektif untuk <strong>known malware</strong> — virus, trojan, worm yang sudah ada di database</li>
  <li>User-friendly, nggak butuh SOC team untuk manage</li>
</ul>

<h3>Kelemahan Fatal</h3>
<ul>
  <li><strong>Nggak bisa detect unknown malware</strong> — zero-day, custom malware, fileless attack = lolos semua</li>
  <li><strong>Nggak ada visibility</strong> — kamu nggak tau proses apa yang jalan, koneksi kemana, registry apa yang diubah</li>
  <li><strong>Nggak ada response capability</strong> — selain quarantine file, nggak bisa apa-apa</li>
  <li><strong>Nggak ada forensic data</strong> — kalau ada insiden, nggak ada data untuk investigasi</li>
</ul>

<div class="callout callout-warn"><strong>Reality check:</strong> Antivirus saja sudah TIDAK CUKUP untuk environment enterprise sejak ~2015. Attacker modern pakai teknik yang bypass AV dengan mudah: fileless malware, living-off-the-land (LOLBins), process injection, memory-only payloads.</div>
` },

    { id: 'edr-detail', title: 'EDR — Game Changer',
      html: `
<p><strong>Endpoint Detection & Response</strong> lahir karena AV nggak cukup. EDR bukan pengganti AV — EDR adalah <em>evolusi</em> yang jauh lebih advanced.</p>

<h3>Cara Kerja EDR</h3>
<ol>
  <li><strong>Agent di setiap endpoint</strong> — collect SEMUA telemetry: process creation (parent-child), file operations, registry changes, network connections per-process, DLL loads, memory allocations</li>
  <li><strong>Data dikirim ke cloud/server</strong> — untuk analysis dan korelasi</li>
  <li><strong>Detection engine</strong> — behavioral rules, machine learning, threat intel IOC matching, MITRE ATT&CK technique detection</li>
  <li><strong>Response actions</strong> — isolate endpoint, kill process, block hash, remote shell, memory dump, timeline reconstruction</li>
</ol>

<h3>Apa yang Bisa Dilihat SOC Analyst dari EDR</h3>
<div class="code-block"><div class="code-label"><span>Contoh Alert EDR</span></div><pre><code><span class="code-comment"># Alert: Suspicious PowerShell Execution</span>
Process: powershell.exe (PID 4832)
Parent:  cmd.exe (PID 2104) ← launched by excel.exe (PID 1560)
Command: powershell -enc SQBFAFgAIAAoA...  (Base64 encoded)
Network: Connected to 185.234.xx.xx:443 (C2 server)
File:    Dropped payload.dll to C:\\Users\\victim\\AppData\\Local\\Temp
MITRE:   T1059.001 (PowerShell), T1071.001 (Web C2), T1027 (Obfuscation)

<span class="code-comment"># Dari alert ini, analyst bisa lihat FULL attack chain:</span>
<span class="code-comment"># Email attachment (Excel) → Macro → cmd → PowerShell → C2 → Payload</span></code></pre></div>

<h3>Wazuh sebagai EDR Open Source</h3>
<p>Wazuh Agent yang sudah kita install adalah EDR — meskipun capability-nya tidak selengkap CrowdStrike atau SentinelOne, Wazuh bisa:</p>
<ul>
  <li>Process monitoring + command line logging</li>
  <li>File Integrity Monitoring (FIM)</li>
  <li>Rootkit detection</li>
  <li>Vulnerability scanning</li>
  <li>Active Response (block IP, disable account)</li>
  <li>Sysmon integration (Windows) — mendekati level EDR komersial</li>
</ul>
<div class="callout callout-tip"><strong>Untuk lab & training:</strong> Wazuh + Sysmon = EDR yang sangat capable dan gratis. Untuk production enterprise, pertimbangkan EDR komersial yang punya ML dan cloud-native architecture.</div>
` },

    { id: 'ndr-detail', title: 'NDR — Network Perspective',
      html: `
<p><strong>Network Detection & Response</strong> fokus ke traffic jaringan. Kalau EDR lihat apa yang terjadi <em>di dalam</em> endpoint, NDR lihat apa yang terjadi <em>di antara</em> endpoint.</p>

<h3>Cara Kerja NDR</h3>
<ol>
  <li><strong>Sensor/tap di network</strong> — mirror traffic dari switch (SPAN port) atau inline</li>
  <li><strong>Deep Packet Inspection</strong> — analisis isi packet, bukan cuma header</li>
  <li><strong>Flow analysis</strong> — pola koneksi: siapa bicara ke siapa, berapa sering, berapa banyak data</li>
  <li><strong>Anomaly detection</strong> — ML detect deviasi dari baseline normal: unusual protocols, data volume spikes, beacon patterns</li>
</ol>

<h3>Kenapa NDR Penting</h3>
<ul>
  <li><strong>Lateral movement detection</strong> — attacker pindah dari endpoint A ke B lewat network. EDR per-endpoint mungkin miss, NDR lihat pattern-nya.</li>
  <li><strong>C2 communication</strong> — beacon patterns (reguler interval ke IP tertentu) sangat visible di NDR</li>
  <li><strong>Data exfiltration</strong> — unusual data transfer volume ke external IP</li>
  <li><strong>East-west traffic</strong> — traffic antar server internal yang AV/EDR nggak cover</li>
  <li><strong>Agentless</strong> — nggak perlu install apa-apa di endpoint. IoT, OT, legacy systems yang nggak bisa install agent = NDR satu-satunya visibility</li>
</ul>

<h3>Contoh NDR Alert</h3>
<div class="code-block"><div class="code-label"><span>NDR Detection</span></div><pre><code><span class="code-comment"># Alert: DNS Tunneling Detected</span>
Source:    10.0.5.42 (workstation-42)
DNS Query: aGVsbG8gd29ybGQ.data.evil-c2.com
Pattern:   50+ queries/min to same domain, avg subdomain length 45 chars
Verdict:   Data exfiltration via DNS — encoded data in subdomain

<span class="code-comment"># Alert: Potential Lateral Movement</span>
Source:    10.0.5.42 → 10.0.5.100 (DC01)
Protocol:  SMB + PsExec pattern detected
Timing:    03:42 AM (outside business hours)
Context:   Source IP had malware alert 2 hours ago</code></pre></div>

<h3>Tools NDR</h3>
<p>Untuk training, kita pakai <strong>Wireshark + tcpdump</strong> sebagai "manual NDR". Di enterprise, NDR biasanya appliance seperti Darktrace, Vectra, atau open source <strong>Zeek</strong> (network analysis framework).</p>
` },

    { id: 'xdr-detail', title: 'XDR — The Full Picture',
      html: `
<p><strong>Extended Detection & Response</strong> adalah evolusi terbaru. XDR bukan produk tunggal — ini <em>platform</em> yang mengintegrasikan data dari semua sumber keamanan ke satu tempat.</p>

<h3>XDR = EDR + NDR + SIEM + SOAR + Cloud Security</h3>
<p>Bayangkan punya semua ini di satu console:</p>
<ul>
  <li>EDR telemetry dari semua endpoint</li>
  <li>Network traffic analysis dari semua sensor</li>
  <li>Cloud workload data (AWS, Azure, GCP)</li>
  <li>Email security alerts</li>
  <li>Identity/authentication logs</li>
  <li>Automated response playbooks</li>
</ul>

<h3>Kenapa XDR Muncul</h3>
<p>Problem: SOC analyst punya 10 tab terbuka — SIEM di satu, EDR di satu, NDR di satu, email security di satu. Alert dari masing-masing nggak terkorelasi. Analyst harus manually pivot antar tool.</p>
<p><strong>XDR menyelesaikan ini</strong> dengan otomatis korelasi alert dari semua sumber. Satu alert yang terjadi di email + endpoint + network = satu incident yang sudah terhubung.</p>

<h3>Contoh Korelasi XDR</h3>
<div class="code-block"><div class="code-label"><span>XDR Incident — Auto-correlated</span></div><pre><code><span class="code-comment"># XDR otomatis menghubungkan 4 alert jadi 1 incident:</span>

1. [Email Gateway] Phishing email delivered to user@company.com
   → Attachment: invoice.xlsm (SHA256: abc123...)

2. [EDR] excel.exe spawned powershell.exe with encoded command
   → Host: WORKSTATION-42, User: john.doe
   → MITRE: T1059.001 (PowerShell Execution)

3. [NDR] WORKSTATION-42 initiated connection to 185.234.xx.xx:443
   → Beacon pattern: every 60 seconds
   → MITRE: T1071.001 (Web C2)

4. [EDR] WORKSTATION-42 accessed \\\\DC01\\ADMIN$ via SMB
   → Credential: domain_admin (stolen)
   → MITRE: T1021.002 (Lateral Movement via SMB)

<span class="code-comment"># XDR Verdict: Active compromise — phishing → execution → C2 → lateral movement</span>
<span class="code-comment"># Auto-response: isolate WORKSTATION-42, block C2 IP, disable domain_admin account</span></code></pre></div>

<div class="callout callout-info"><strong>Di kelas ini:</strong> Kita pakai Wazuh (SIEM + EDR) + Wireshark (network analysis) + TheHive (case management) — ini essentially "manual XDR". Tools terpisah, tapi workflow-nya sama. Kalau nanti kerja di enterprise, kemungkinan besar akan pakai XDR platform yang integrasikan semuanya.</div>
` },

    { id: 'when-to-use', title: 'Kapan Pakai Yang Mana?',
      html: `
<table class="ref-table">
  <tr><th>Skenario</th><th>Solusi</th><th>Kenapa</th></tr>
  <tr><td>UMKM, 10 laptop, budget minim</td><td>AV (Windows Defender) + Wazuh Agent</td><td>Free, basic protection + some visibility</td></tr>
  <tr><td>Startup 50-200 karyawan</td><td>EDR (SentinelOne/CrowdStrike) + SIEM (Wazuh)</td><td>Endpoint visibility + log aggregation. Affordable per-seat.</td></tr>
  <tr><td>Enterprise 1000+ karyawan</td><td>EDR + NDR + SIEM</td><td>Full visibility endpoint + network. Butuh dedicated SOC team.</td></tr>
  <tr><td>Enterprise + cloud-heavy</td><td>XDR platform</td><td>Korelasi otomatis, reduce alert fatigue, faster response.</td></tr>
  <tr><td>OT/IoT environment</td><td>NDR (wajib)</td><td>Device nggak bisa install agent. NDR satu-satunya visibility.</td></tr>
  <tr><td>Compliance-driven (bank, telco)</td><td>XDR + SIEM + dedicated SOC</td><td>Regulasi require comprehensive monitoring + audit trail.</td></tr>
</table>

<div class="callout callout-tip"><strong>Career tip:</strong> Kalau mau kerja di SOC, pahami konsep semua — tapi fokus hands-on ke EDR dan SIEM dulu. Ini yang paling sering dipakai L1/L2 analyst sehari-hari. NDR dan XDR biasanya di-manage L3 atau security engineer.</div>
` },

    { id: 'evolution', title: 'Evolusi Security Stack',
      html: `
<p>Timeline evolusi dari AV ke XDR:</p>
<div class="flow-row" style="justify-content:flex-start;flex-wrap:wrap;gap:6px;margin:20px 0">
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px 16px;text-align:center;min-width:120px">
    <div style="font-size:0.7em;color:var(--text-faint)">1990s–2000s</div>
    <div style="font-weight:700;font-size:0.9em">Antivirus</div>
    <div style="font-size:0.7em;color:var(--text-muted)">Signature-only</div>
  </div>
  <div style="color:var(--text-faint);padding:0 4px">→</div>
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px 16px;text-align:center;min-width:120px">
    <div style="font-size:0.7em;color:var(--text-faint)">2010s</div>
    <div style="font-weight:700;font-size:0.9em">NGAV + SIEM</div>
    <div style="font-size:0.7em;color:var(--text-muted)">Heuristic + log centralization</div>
  </div>
  <div style="color:var(--text-faint);padding:0 4px">→</div>
  <div style="background:var(--bg-card);border:1px solid var(--accent-glow);border-radius:8px;padding:10px 16px;text-align:center;min-width:120px">
    <div style="font-size:0.7em;color:var(--text-faint)">2015–2020</div>
    <div style="font-weight:700;font-size:0.9em;color:var(--accent)">EDR + NDR</div>
    <div style="font-size:0.7em;color:var(--text-muted)">Behavioral + network visibility</div>
  </div>
  <div style="color:var(--text-faint);padding:0 4px">→</div>
  <div style="background:var(--bg-card);border:1px solid var(--accent);border-radius:8px;padding:10px 16px;text-align:center;min-width:120px">
    <div style="font-size:0.7em;color:var(--text-faint)">2020+</div>
    <div style="font-weight:700;font-size:0.9em;color:var(--accent)">XDR</div>
    <div style="font-size:0.7em;color:var(--text-muted)">Unified platform + AI/ML</div>
  </div>
</div>

<p>Setiap generasi <em>menambah</em> yang sebelumnya, bukan mengganti. XDR modern tetap punya signature scanning (AV), behavioral analysis (EDR), dan network inspection (NDR) — tapi semuanya di satu platform dengan korelasi otomatis.</p>

<div class="callout callout-warn"><strong>Hati-hati marketing.</strong> Banyak vendor yang re-label produk EDR mereka jadi "XDR" padahal cuma EDR + sedikit integrasi. True XDR harus genuinely cross-domain: endpoint + network + cloud + identity, dengan korelasi otomatis, bukan cuma dashboard yang kumpulin alert dari berbagai sumber.</div>
` }

  ] // end sections
} // end av-edr-ndr-xdr
}); // end Object.assign
