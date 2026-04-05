// ═══════════════════════════════════════════════════════
// EDR: Wazuh Agent (3 sub-modules)
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

'wazuh-agent-overview': {
  name: 'Wazuh Agent — Overview',
  subtitle: 'Lightweight daemon di endpoint — kumpulkan log, deteksi threat, monitor file integrity, dan inventory system.',
  tags: ['tag-edr','tag-vps','tag-oss'], tagLabels: ['EDR','VPS','Open Source'],
  parent: 'wazuh-agent',
  sections: [
    { id: 'what-is-agent', title: 'Apa itu Wazuh Agent?',
      html: `
<p>Wazuh Agent itu daemon ringan yang kamu install di setiap endpoint (server, workstation, laptop). Tugasnya: <strong>mengumpulkan data</strong> dari endpoint itu, lalu <strong>kirim ke Wazuh Manager</strong> untuk dianalisis. Agent nggak melakukan analisis sendiri — dia cuma "mata dan telinga" di lapangan.</p>

<p>Komunikasi antara Agent dan Manager pakai <strong>encrypted channel</strong> (AES 256-bit) via port <strong>1514/TCP</strong>. Jadi meskipun lewat jaringan publik, data tetap aman. Registrasi awal pakai port <strong>1515/TCP</strong>.</p>

<div class="callout callout-info"><strong>Analogi sederhana:</strong> Bayangkan gedung besar. Wazuh Agent = CCTV + alarm system + sensor pintu di <em>setiap ruangan</em>. Wazuh Manager = command center security yang terima semua feed, analisis, dan kasih alert ke petugas. Dashboard = monitor besar di command center tempat petugas lihat semua kejadian.</div>

<p><strong>Architecture overview:</strong></p>
<div class="code-block"><div class="code-label"><span>Text — Agent ↔ Manager Architecture</span></div><pre><code>  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Endpoint 1  │     │  Endpoint 2  │     │  Endpoint 3  │
  │ (Linux srv)  │     │ (Win workst) │     │ (Mac laptop) │
  │  ┌─────────┐ │     │  ┌─────────┐ │     │  ┌─────────┐ │
  │  │  Agent  │ │     │  │  Agent  │ │     │  │  Agent  │ │
  │  └────┬────┘ │     │  └────┬────┘ │     │  └────┬────┘ │
  └───────┼──────┘     └───────┼──────┘     └───────┼──────┘
          │   Port 1514 (AES)  │                    │
          └────────────┬───────┘────────────────────┘
                       ▼
              ┌────────────────┐
              │  Wazuh Manager │  ← Analisis, rules, alert
              └───────┬────────┘
                      ▼
              ┌────────────────┐
              │ Wazuh Indexer  │  ← Simpan data (OpenSearch)
              └───────┬────────┘
                      ▼
              ┌────────────────┐
              │   Dashboard    │  ← Visualisasi untuk analyst
              └────────────────┘</code></pre></div>

<p>Setiap agent punya <strong>Agent ID</strong> unik (misalnya 001, 002, dst) dan <strong>Agent Name</strong> (biasanya hostname). Di dashboard, kamu bisa filter alert berdasarkan agent — jadi langsung tau alert ini dari endpoint mana.</p>

<p><strong>Registration process:</strong></p>
<ol>
  <li>Install agent di endpoint</li>
  <li>Agent minta registrasi ke Manager (port 1515)</li>
  <li>Manager verifikasi dan beri <strong>key</strong> ke agent</li>
  <li>Agent simpan key, mulai kirim data via port 1514</li>
  <li>Manager terima data, proses pakai rules, generate alert</li>
</ol>

<div class="callout callout-tip"><strong>Fun fact:</strong> Satu Wazuh Manager bisa handle <strong>ribuan agent</strong> sekaligus. Di production besar, biasanya pakai multi-node cluster untuk load balancing.</div>` },

    { id: 'how-it-works', title: 'Cara Kerja di Balik Layar',
      html: `
<p>Di dalam agent, ada beberapa <strong>module</strong> yang jalan secara paralel. Masing-masing punya tugas spesifik. Ini yang bikin Wazuh Agent powerful — bukan cuma kirim log, tapi juga melakukan berbagai jenis monitoring.</p>

<h3>1. Logcollector</h3>
<p>Module ini <strong>mengumpulkan log</strong> dari berbagai sumber di endpoint:</p>
<ul>
  <li><strong>Linux:</strong> <code>/var/log/syslog</code>, <code>/var/log/auth.log</code>, <code>/var/log/secure</code></li>
  <li><strong>Windows:</strong> Windows Event Log (Security, System, Application, Sysmon, PowerShell)</li>
  <li><strong>macOS:</strong> <code>/var/log/system.log</code>, unified logging</li>
  <li><strong>Custom:</strong> log aplikasi apapun yang kamu tentukan di <code>ossec.conf</code></li>
</ul>
<p>Log dikumpulkan secara real-time (tail-like behavior) lalu dikirim ke Manager. Manager yang apply rules dan generate alert.</p>

<h3>2. Syscheck (FIM — File Integrity Monitoring)</h3>
<p>Monitor perubahan file di direktori yang kamu tentukan. Setiap kali file di-create, modify, atau delete — Syscheck detect dan report.</p>
<div class="code-block"><div class="code-label"><span>Contoh alert FIM</span></div><pre><code>Rule: 550 — Integrity checksum changed
File: /etc/passwd
Changed: size, md5, sha1, mtime
Old MD5: 5d41402abc4b2a76b9719d911017c592
New MD5: 7d793037a0760186574b0282f2f435e7</code></pre></div>
<p>Ini sangat berguna untuk deteksi: backdoor ditaro di <code>/etc/crontab</code>, config web server diubah, binary sistem diganti (trojanized).</p>

<h3>3. Rootcheck</h3>
<p>Scan endpoint untuk tanda-tanda <strong>rootkit</strong>: hidden files, hidden processes, suspicious kernel modules, known rootkit signatures. Juga cek file permissions yang anomali.</p>

<h3>4. Syscollector (Inventory)</h3>
<p>Kumpulkan informasi tentang endpoint: <strong>installed software</strong> (nama + versi), OS version, network interfaces, open ports, running processes, hardware info. Data ini dipakai untuk:</p>
<ul>
  <li><strong>Vulnerability Detection</strong> — bandingkan software version dengan CVE database</li>
  <li><strong>Asset management</strong> — tau semua yang terinstall di setiap endpoint</li>
  <li><strong>Compliance</strong> — pastikan software yang harusnya ada memang ada</li>
</ul>

<h3>5. SCA (Security Configuration Assessment)</h3>
<p>Cek konfigurasi endpoint terhadap <strong>benchmark</strong> standar industri (CIS Benchmark, PCI-DSS, HIPAA). Misalnya: apakah password policy sudah sesuai, apakah SSH root login disabled, apakah firewall aktif.</p>
<div class="code-block"><div class="code-label"><span>Contoh SCA check result</span></div><pre><code>Check: Ensure SSH root login is disabled
Result: FAILED
Expected: PermitRootLogin no
Found: PermitRootLogin yes
Remediation: Edit /etc/ssh/sshd_config, set PermitRootLogin to no</code></pre></div>

<h3>6. Active Response</h3>
<p>Module yang bisa <strong>otomatis ambil aksi</strong> saat threat terdeteksi. Misalnya: auto-block IP yang brute force, auto-disable account yang compromise. Ini dikonfigurasi di <em>Manager side</em>, tapi dieksekusi di <em>Agent side</em>.</p>

<div class="callout callout-warn"><strong>Penting:</strong> Active Response itu powerful tapi harus hati-hati. Salah konfigurasi bisa auto-block IP legitimate. Selalu test dulu di environment staging!</div>` },

    { id: 'agent-vs-agentless', title: 'Agent vs Agentless Monitoring',
      html: `
<p>Wazuh support dua model monitoring: <strong>agent-based</strong> (install agent di endpoint) dan <strong>agentless</strong> (tanpa install, biasanya via SSH/SNMP). Kapan pakai yang mana?</p>

<table class="ref-table">
  <thead><tr><th>Aspek</th><th>Agent-Based</th><th>Agentless</th></tr></thead>
  <tbody>
    <tr><td><strong>Install</strong></td><td>Perlu install agent di endpoint</td><td>Tidak perlu install apapun</td></tr>
    <tr><td><strong>Data yang bisa dikumpulkan</strong></td><td>Lengkap: log, FIM, rootcheck, inventory, SCA</td><td>Terbatas: FIM, log collection basic</td></tr>
    <tr><td><strong>Real-time monitoring</strong></td><td>Ya — semua module</td><td>Terbatas — hanya periodik</td></tr>
    <tr><td><strong>Active Response</strong></td><td>Ya — bisa auto-respond</td><td>Tidak</td></tr>
    <tr><td><strong>Performance impact</strong></td><td>Ringan (biasanya &lt;2% CPU, &lt;50MB RAM)</td><td>Minimal di endpoint</td></tr>
    <tr><td><strong>Use case ideal</strong></td><td>Server, workstation, laptop — endpoint yang kamu kelola</td><td>Network device (router, switch, firewall), legacy system, IoT</td></tr>
    <tr><td><strong>OS support</strong></td><td>Linux, Windows, macOS, Solaris, AIX, HP-UX</td><td>Apapun yang bisa di-SSH</td></tr>
  </tbody>
</table>

<div class="callout callout-tip"><strong>Rekomendasi:</strong> Selalu pakai <strong>agent-based</strong> kalau memungkinkan. Agentless hanya untuk device yang nggak bisa diinstall agent (router, printer, embedded system, legacy server yang nggak boleh diubah).</div>

<p><strong>Agentless setup</strong> dilakukan via konfigurasi di Manager — kamu tentukan IP target, credential SSH, dan apa yang mau dimonitor. Manager yang akan SSH ke target secara periodik dan ambil data.</p>` },

    { id: 'what-it-detects', title: 'Apa yang Bisa Dideteksi?',
      html: `
<p>Ini daftar threat/anomali yang bisa dideteksi Wazuh Agent + Manager rules. Untuk setiap jenis, gue kasih <strong>rule ID</strong> dan apa yang muncul di dashboard.</p>

<h3>🔐 Brute Force SSH/RDP</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 5763
Level: 10
Description: "SSHD brute force trying to get access to the system"
<span class="code-comment"># Terlihat di dashboard: multiple failed login dari IP yang sama dalam waktu singkat</span>
<span class="code-comment"># Agent detect dari: /var/log/auth.log (Linux) atau Security Event Log (Windows)</span></code></pre></div>

<h3>👤 Privilege Escalation</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 5401 — "User successfully changed UID to root"
Rule ID: 5402 — "Attempt to run sudo with wrong password"
Rule ID: 5403 — "User NOT in sudoers file. Command not allowed"
<span class="code-comment"># Deteksi dari: /var/log/auth.log, sudo logs</span>
<span class="code-comment"># Dashboard: alert kalau user biasa tiba-tiba jadi root, atau coba sudo tanpa izin</span></code></pre></div>

<h3>🦠 Malware Execution (via Sysmon/VirusTotal)</h3>
<p>Kalau Sysmon terinstall + VirusTotal integration aktif:</p>
<ul>
  <li>Process creation dengan command line mencurigakan (encoded PowerShell, certutil download, dll)</li>
  <li>File hash di-lookup ke VirusTotal — kalau malicious, alert muncul</li>
  <li>Rule ID: 92000+ (custom Sysmon rules)</li>
</ul>

<h3>🔍 Port Scan</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 581
Level: 10
Description: "Host-based anomaly detection event (connection flood)"
<span class="code-comment"># Detect dari: syscollector network data + firewall logs</span></code></pre></div>

<h3>📂 Unauthorized File Changes (FIM)</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 550 — "Integrity checksum changed"
Rule ID: 554 — "File added to the system"
Rule ID: 553 — "File deleted from the system"
<span class="code-comment"># Contoh: /etc/passwd diubah → alert level tinggi</span>
<span class="code-comment"># Contoh: file baru muncul di /tmp/.hidden → alert</span></code></pre></div>

<h3>🕵️ Rootkit Detection</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 510 — "Host-based anomaly detection event (rootcheck)"
<span class="code-comment"># Rootcheck scan periodik untuk:</span>
<span class="code-comment"># - Hidden processes (proses yang nggak muncul di ps tapi ada di /proc)</span>
<span class="code-comment"># - Hidden files/directories</span>
<span class="code-comment"># - Known rootkit signatures</span>
<span class="code-comment"># - Suspicious kernel modules</span></code></pre></div>

<h3>📦 Vulnerable Software</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert</span></div><pre><code>Rule ID: 23504 — "Vulnerable software found"
<span class="code-comment"># Syscollector inventory software → bandingkan dengan CVE database</span>
<span class="code-comment"># Dashboard: list software + CVE ID + severity (Critical/High/Medium/Low)</span>
<span class="code-comment"># Contoh: "Apache 2.4.49 — CVE-2021-41773 — Critical — Path Traversal"</span></code></pre></div>

<div class="callout callout-info"><strong>Pro tip:</strong> Semua rule ID bisa kamu cari di <a href="https://documentation.wazuh.com/current/user-manual/ruleset/rules-classification.html" target="_blank" style="color:var(--accent)">Wazuh Rules Classification</a>. Kamu juga bisa bikin custom rules untuk deteksi spesifik yang kamu butuhkan.</div>` }
  ]
},

'wazuh-agent-setup': {
  name: 'Wazuh Agent — Setup & Troubleshoot',
  subtitle: 'Registrasi agent, troubleshooting koneksi, baca log, dan upgrade — semua yang kamu perlu tau buat maintain agent.',
  tags: ['tag-edr','tag-oss'], tagLabels: ['EDR','Open Source'],
  parent: 'wazuh-agent',
  sections: [
    { id: 'install', title: 'Install Agent',
      html: `
<p>Tutorial install lengkap ada di halaman <strong>Wazuh → Getting Started</strong> (section Install Agent). Halaman ini fokus ke <strong>troubleshooting</strong> dan <strong>advanced configuration</strong>.</p>

<div class="callout callout-info"><strong>👉 Install agent:</strong> <a href="#" onclick="navigate('wazuh-setup');return false;" style="color:var(--accent);font-weight:600">Buka Wazuh → Getting Started → Install Agent</a> untuk panduan install step-by-step di Linux, Windows, dan macOS.</div>

<p>Setelah agent terinstall dan bisa konek ke Manager, lanjut ke section di bawah untuk registration, troubleshooting, dan maintenance.</p>` },

    { id: 'registration', title: 'Agent Registration',
      html: `
<p>Sebelum agent bisa kirim data, dia harus <strong>terdaftar</strong> di Manager. Ada dua cara:</p>

<h3>Cara 1: Auto-Enrollment (Recommended)</h3>
<p>Ini cara paling gampang. Agent otomatis register saat pertama kali nyala, selama Manager mengizinkan auto-enrollment.</p>
<div class="code-block"><div class="code-label"><span>ossec.conf di Agent — auto-enrollment</span></div><pre><code>&lt;client&gt;
  &lt;server&gt;
    &lt;address&gt;MANAGER_IP&lt;/address&gt;
    &lt;port&gt;1514&lt;/port&gt;
    &lt;protocol&gt;tcp&lt;/protocol&gt;
  &lt;/server&gt;
  &lt;enrollment&gt;
    &lt;enabled&gt;yes&lt;/enabled&gt;
    &lt;manager_address&gt;MANAGER_IP&lt;/manager_address&gt;
    &lt;port&gt;1515&lt;/port&gt;
    &lt;agent_name&gt;my-server-01&lt;/agent_name&gt;
    &lt;groups&gt;linux,webservers&lt;/groups&gt;
  &lt;/enrollment&gt;
&lt;/client&gt;</code></pre></div>
<p>Restart agent → dia auto register dan mulai kirim data.</p>

<h3>Cara 2: Manual Key Extraction</h3>
<p>Kalau auto-enrollment disabled (environment ketat), kamu extract key dari Manager, lalu import di Agent.</p>
<div class="code-block"><div class="code-label"><span>Bash — Di Manager</span></div><pre><code><span class="code-comment"># List semua agent</span>
/var/ossec/bin/manage_agents -l

<span class="code-comment"># Tambah agent baru</span>
/var/ossec/bin/manage_agents -a 192.168.1.100 -n my-server-01

<span class="code-comment"># Extract key untuk agent (misal ID 001)</span>
/var/ossec/bin/manage_agents -e 001
<span class="code-comment"># Output: MDAxIHNlcnZlci0wMSAxOTIuMT... (base64 key)</span></code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Di Agent</span></div><pre><code><span class="code-comment"># Import key dari Manager</span>
/var/ossec/bin/manage_agents -i MDAxIHNlcnZlci0wMSAxOTIuMT...

<span class="code-comment"># Restart agent</span>
sudo systemctl restart wazuh-agent</code></pre></div>

<h3>Agent Groups</h3>
<p>Groups itu cara mengelompokkan agent berdasarkan fungsi/tipe. Manfaatnya: kamu bisa push konfigurasi yang berbeda ke group yang berbeda.</p>
<div class="code-block"><div class="code-label"><span>Bash — Manage groups di Manager</span></div><pre><code><span class="code-comment"># Buat group baru</span>
/var/ossec/bin/agent_groups -a -g webservers

<span class="code-comment"># Assign agent ke group</span>
/var/ossec/bin/agent_groups -a -i 001 -g webservers

<span class="code-comment"># Lihat group mana yang dipunyai agent</span>
/var/ossec/bin/agent_groups -s -i 001

<span class="code-comment"># List semua agent di suatu group</span>
/var/ossec/bin/agent_groups -l -g webservers</code></pre></div>

<div class="callout callout-tip"><strong>Best practice:</strong> Group by function (webservers, databases, workstations) bukan by OS. Kamu bisa assign agent ke <em>multiple groups</em> — config dari semua group di-merge.</div>` },

    { id: 'troubleshoot', title: 'Troubleshooting Guide',
      html: `
<p>Ini masalah yang paling sering ditemukan saat deploy atau maintain Wazuh Agent. Gue urutkan dari yang paling umum.</p>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">1</span> Agent Not Connecting — "Never connected" di Dashboard</div>
<p><strong>Gejala:</strong> Agent sudah diinstall tapi status di dashboard "Never connected" atau nggak muncul sama sekali.</p>
<p><strong>Diagnosis:</strong></p>
<div class="code-block"><div class="code-label"><span>Bash — Di Agent</span></div><pre><code><span class="code-comment"># Cek status agent</span>
sudo systemctl status wazuh-agent

<span class="code-comment"># Cek apakah bisa reach Manager</span>
telnet MANAGER_IP 1514
nc -zv MANAGER_IP 1514

<span class="code-comment"># Cek firewall lokal</span>
sudo iptables -L -n | grep 1514
sudo ufw status

<span class="code-comment"># Cek ossec.conf — apakah IP Manager benar</span>
cat /var/ossec/etc/ossec.conf | grep -A5 "&lt;server&gt;"</code></pre></div>
<p><strong>Fix:</strong></p>
<ul>
  <li>Pastikan IP Manager di <code>ossec.conf</code> sudah benar</li>
  <li>Buka port <strong>1514/TCP</strong> (data) dan <strong>1515/TCP</strong> (enrollment) di firewall Manager</li>
  <li>Kalau pakai cloud/VPS, cek juga security group / firewall rules di level cloud</li>
  <li>Restart agent setelah fix: <code>sudo systemctl restart wazuh-agent</code></li>
</ul>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">2</span> Agent Shows "Disconnected"</div>
<p><strong>Gejala:</strong> Agent pernah connected tapi sekarang "Disconnected" di dashboard.</p>
<div class="code-block"><div class="code-label"><span>Bash — Diagnosis</span></div><pre><code><span class="code-comment"># Cek apakah service running</span>
sudo systemctl status wazuh-agent

<span class="code-comment"># Cek log untuk error</span>
sudo tail -50 /var/ossec/logs/ossec.log

<span class="code-comment"># Cek koneksi ke Manager</span>
ss -tnp | grep 1514

<span class="code-comment"># Force restart</span>
sudo systemctl restart wazuh-agent

<span class="code-comment"># Tunggu 30 detik, cek log</span>
sudo tail -20 /var/ossec/logs/ossec.log</code></pre></div>
<p><strong>Common causes:</strong> Network interruption, Manager down/restart, agent service crashed (OOM killer), time sync issue (NTP).</p>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">3</span> Agent Registered tapi No Data / No Alerts</div>
<p><strong>Gejala:</strong> Agent connected (hijau di dashboard) tapi nggak ada alert atau log data.</p>
<div class="code-block"><div class="code-label"><span>Bash — Diagnosis</span></div><pre><code><span class="code-comment"># Cek apakah ossec.conf punya localfile entries</span>
grep -A3 "&lt;localfile&gt;" /var/ossec/etc/ossec.conf

<span class="code-comment"># Cek apakah file yang diminta ada dan bisa dibaca</span>
ls -la /var/log/syslog
ls -la /var/log/auth.log

<span class="code-comment"># Cek permission — agent harus bisa baca log files</span>
sudo -u wazuh cat /var/log/auth.log

<span class="code-comment"># Generate test alert</span>
sudo /var/ossec/bin/agent_control -r</code></pre></div>
<p><strong>Fix:</strong> Pastikan <code>&lt;localfile&gt;</code> di <code>ossec.conf</code> menunjuk ke file yang benar dan bisa dibaca oleh agent. Nama file beda di tiap distro (<code>auth.log</code> vs <code>secure</code>).</p>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">4</span> Permission Errors</div>
<p><strong>Gejala:</strong> Agent crash atau error "Permission denied" di log.</p>
<div class="code-block"><div class="code-label"><span>Bash — Fix ownership</span></div><pre><code><span class="code-comment"># Cek ownership /var/ossec</span>
ls -la /var/ossec/

<span class="code-comment"># Fix ownership (harus milik wazuh:wazuh atau root:wazuh)</span>
sudo chown -R root:wazuh /var/ossec
sudo chown -R wazuh:wazuh /var/ossec/logs
sudo chown -R wazuh:wazuh /var/ossec/queue
sudo chown -R wazuh:wazuh /var/ossec/var

<span class="code-comment"># Fix permissions</span>
sudo chmod -R 750 /var/ossec
sudo chmod 770 /var/ossec/queue/sockets

<span class="code-comment"># Restart</span>
sudo systemctl restart wazuh-agent</code></pre></div>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">5</span> SSL Certificate Errors</div>
<p><strong>Gejala:</strong> Log menunjukkan "SSL error" atau "certificate verify failed" saat agent coba konek.</p>
<div class="code-block"><div class="code-label"><span>Bash — Re-register agent</span></div><pre><code><span class="code-comment"># Hapus key lama</span>
sudo rm -f /var/ossec/etc/client.keys

<span class="code-comment"># Hapus certificate cache</span>
sudo rm -f /var/ossec/etc/sslagent.cert
sudo rm -f /var/ossec/etc/sslagent.key

<span class="code-comment"># Restart — agent akan re-register</span>
sudo systemctl restart wazuh-agent

<span class="code-comment"># Verifikasi di log</span>
sudo tail -f /var/ossec/logs/ossec.log</code></pre></div>
<p>Biasanya terjadi setelah Manager di-reinstall atau certificate di-regenerate. Agent harus re-register untuk dapat certificate baru.</p>
</div>

<div class="callout callout-warn"><strong>Golden rule troubleshooting:</strong> Selalu cek <code>/var/ossec/logs/ossec.log</code> dulu. 90% masalah jawabannya ada di situ.</div>` },

    { id: 'log-reading', title: 'Membaca Agent Log',
      html: `
<p>File log utama agent ada di <code>/var/ossec/logs/ossec.log</code>. Ini "diary" agent — semua yang terjadi dicatat di sini. Kamu harus bisa baca log ini untuk troubleshooting.</p>

<h3>Log Level</h3>
<div class="code-block"><div class="code-label"><span>Log — Level yang akan kamu temukan</span></div><pre><code><span class="code-comment"># INFO — normal operation, everything OK</span>
2024-01-15 10:30:22 wazuh-agentd: INFO: Connected to the server (192.168.1.10:1514/tcp).
2024-01-15 10:30:22 wazuh-agentd: INFO: (4102): Connected to the server (192.168.1.10:1514/tcp).

<span class="code-comment"># WARNING — ada masalah tapi agent masih jalan</span>
2024-01-15 10:31:45 wazuh-agentd: WARNING: (1228): Sending message to manager failed. Buffering message.

<span class="code-comment"># ERROR — ada masalah serius</span>
2024-01-15 10:32:01 wazuh-agentd: ERROR: (1205): Could not connect to server (192.168.1.10:1514/tcp).

<span class="code-comment"># CRITICAL — agent mungkin berhenti</span>
2024-01-15 10:33:00 wazuh-agentd: CRITICAL: (1207): Unable to connect to any server.</code></pre></div>

<h3>Apa Artinya Setiap Pesan</h3>
<table class="ref-table">
  <thead><tr><th>Pesan Log</th><th>Artinya</th><th>Action</th></tr></thead>
  <tbody>
    <tr><td><code>Connected to the server</code></td><td>Agent berhasil konek ke Manager ✅</td><td>Tidak perlu action</td></tr>
    <tr><td><code>Could not connect to server</code></td><td>Agent gagal konek — network/firewall issue</td><td>Cek IP, port 1514, firewall</td></tr>
    <tr><td><code>Sending message to manager failed</code></td><td>Koneksi putus sementara, agent buffer data</td><td>Cek stabilitas network</td></tr>
    <tr><td><code>Unable to connect to any server</code></td><td>Agent nyerah — semua server unreachable</td><td>Fix koneksi ASAP</td></tr>
    <tr><td><code>Valid key received</code></td><td>Registration berhasil ✅</td><td>Tidak perlu action</td></tr>
    <tr><td><code>Agent key not found</code></td><td>Agent belum terdaftar</td><td>Register agent ke Manager</td></tr>
    <tr><td><code>Started (pid: XXXX)</code></td><td>Agent service baru start</td><td>Normal setelah restart</td></tr>
  </tbody>
</table>

<h3>Grep Patterns yang Berguna</h3>
<div class="code-block"><div class="code-label"><span>Bash — Grep patterns</span></div><pre><code><span class="code-comment"># Lihat semua error</span>
grep "ERROR" /var/ossec/logs/ossec.log

<span class="code-comment"># Lihat koneksi status</span>
grep -E "Connected|Could not connect|Unable to connect" /var/ossec/logs/ossec.log

<span class="code-comment"># Lihat registration events</span>
grep -E "key|enroll|register" /var/ossec/logs/ossec.log -i

<span class="code-comment"># Lihat last 100 lines real-time</span>
sudo tail -f -n 100 /var/ossec/logs/ossec.log

<span class="code-comment"># Lihat error dalam 1 jam terakhir (format: YYYY/MM/DD HH:MM)</span>
grep "$(date +%Y/%m/%d)" /var/ossec/logs/ossec.log | grep "ERROR"

<span class="code-comment"># Count errors per type</span>
grep "ERROR" /var/ossec/logs/ossec.log | sort | uniq -c | sort -rn</code></pre></div>

<div class="callout callout-tip"><strong>Di Windows:</strong> Log agent ada di <code>C:\\Program Files (x86)\\ossec-agent\\ossec.log</code>. Bisa dibuka pakai Notepad atau PowerShell: <code>Get-Content "C:\\Program Files (x86)\\ossec-agent\\ossec.log" -Tail 50</code></div>` },

    { id: 'upgrade', title: 'Upgrade Agent',
      html: `
<p>Wazuh Agent harus di-upgrade ketika Manager di-upgrade (version harus match atau agent ≤ manager version). Berikut cara upgrade di setiap OS:</p>` +
      osTabs([
        { id: 'linux', icon: '🐧', label: 'Linux', html: `
<div class="code-block"><div class="code-label"><span>Bash — Ubuntu/Debian</span></div><pre><code><span class="code-comment"># Cek versi saat ini</span>
/var/ossec/bin/wazuh-control info | grep WAZUH_VERSION

<span class="code-comment"># Update package list</span>
sudo apt update

<span class="code-comment"># Upgrade agent</span>
sudo apt install wazuh-agent

<span class="code-comment"># Restart service</span>
sudo systemctl restart wazuh-agent

<span class="code-comment"># Verifikasi</span>
/var/ossec/bin/wazuh-control info</code></pre></div>
<div class="code-block"><div class="code-label"><span>Bash — RHEL/CentOS</span></div><pre><code>sudo yum update wazuh-agent
sudo systemctl restart wazuh-agent</code></pre></div>` },
        { id: 'windows', icon: '🪟', label: 'Windows', html: `
<div class="code-block"><div class="code-label"><span>PowerShell — Upgrade Agent</span></div><pre><code># Cek versi saat ini
& "C:\\Program Files (x86)\\ossec-agent\\wazuh-agent.exe" --version

# Download installer terbaru dari https://packages.wazuh.com/4.x/windows/
# Jalankan installer — dia akan detect existing install dan upgrade in-place

# Atau via command line (silent upgrade):
wazuh-agent-4.9.0-1.msi /q

# Restart service
Restart-Service WazuhSvc

# Verifikasi
Get-Service WazuhSvc</code></pre></div>` },
        { id: 'macos', icon: '🍎', label: 'macOS', html: `
<div class="code-block"><div class="code-label"><span>Bash — macOS upgrade</span></div><pre><code><span class="code-comment"># Cek versi</span>
/Library/Ossec/bin/wazuh-control info

<span class="code-comment"># Download dan install .pkg terbaru dari:</span>
<span class="code-comment"># https://packages.wazuh.com/4.x/macos/</span>
sudo installer -pkg wazuh-agent-4.9.0-1.pkg -target /

<span class="code-comment"># Restart</span>
sudo /Library/Ossec/bin/wazuh-control restart</code></pre></div>` },
        { id: 'remote', icon: '📡', label: 'Remote Upgrade', html: `
<div class="code-block"><div class="code-label"><span>Bash — Upgrade dari Manager (WPK)</span></div><pre><code><span class="code-comment"># Di Manager — upgrade satu agent</span>
/var/ossec/bin/agent_upgrade -a 001

<span class="code-comment"># Upgrade semua agent</span>
/var/ossec/bin/agent_upgrade -a all

<span class="code-comment"># Upgrade agent di group tertentu</span>
/var/ossec/bin/agent_upgrade -g webservers

<span class="code-comment"># Cek status upgrade</span>
/var/ossec/bin/agent_upgrade -l</code></pre></div>
<div class="callout callout-tip"><strong>Remote upgrade</strong> pakai WPK (Wazuh Package). Ini cara paling efisien kalau kamu punya banyak agent — nggak perlu SSH ke setiap endpoint.</div>` }
      ]) }
  ]
},

'wazuh-agent-usage': {
  name: 'Wazuh Agent — Config & Response',
  subtitle: 'Konfigurasi ossec.conf, tambah log sources, active response, Sysmon integration, dan FIM advanced.',
  tags: ['tag-edr','tag-vps'], tagLabels: ['EDR','VPS'],
  parent: 'wazuh-agent',
  sections: [
    { id: 'ossec-conf', title: 'ossec.conf — Agent Configuration',
      html: `
<p>File konfigurasi utama agent ada di <code>/var/ossec/etc/ossec.conf</code> (Linux/Mac) atau <code>C:\\Program Files (x86)\\ossec-agent\\ossec.conf</code> (Windows). Ini yang mengatur semua behavior agent.</p>

<h3>Section: &lt;server&gt; — Koneksi ke Manager</h3>
<div class="code-block"><div class="code-label"><span>XML — ossec.conf</span></div><pre><code>&lt;ossec_config&gt;
  &lt;client&gt;
    &lt;server&gt;
      &lt;address&gt;192.168.1.10&lt;/address&gt;
      &lt;port&gt;1514&lt;/port&gt;
      &lt;protocol&gt;tcp&lt;/protocol&gt;
    &lt;/server&gt;
    <span class="code-comment">&lt;!-- Bisa tambah backup server --&gt;</span>
    &lt;server&gt;
      &lt;address&gt;192.168.1.11&lt;/address&gt;
    &lt;/server&gt;
    &lt;notify_time&gt;10&lt;/notify_time&gt;
    &lt;time-reconnect&gt;60&lt;/time-reconnect&gt;
  &lt;/client&gt;
&lt;/ossec_config&gt;</code></pre></div>

<h3>Section: &lt;localfile&gt; — Log Sources</h3>
<div class="code-block"><div class="code-label"><span>XML — Collect syslog + auth log</span></div><pre><code><span class="code-comment">&lt;!-- Linux syslog --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/syslog&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Linux auth log --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/auth.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Apache access log --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;apache&lt;/log_format&gt;
  &lt;location&gt;/var/log/apache2/access.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- JSON format log (misalnya app log) --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;json&lt;/log_format&gt;
  &lt;location&gt;/var/log/myapp/events.json&lt;/location&gt;
&lt;/localfile&gt;</code></pre></div>

<h3>Section: &lt;syscheck&gt; — File Integrity Monitoring</h3>
<div class="code-block"><div class="code-label"><span>XML — FIM config</span></div><pre><code>&lt;syscheck&gt;
  &lt;disabled&gt;no&lt;/disabled&gt;
  &lt;frequency&gt;43200&lt;/frequency&gt; <span class="code-comment">&lt;!-- scan tiap 12 jam --&gt;</span>
  
  <span class="code-comment">&lt;!-- Direktori yang dimonitor --&gt;</span>
  &lt;directories check_all="yes" realtime="yes"&gt;/etc,/usr/bin,/usr/sbin&lt;/directories&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;/bin,/sbin,/boot&lt;/directories&gt;
  
  <span class="code-comment">&lt;!-- Ignore pattern --&gt;</span>
  &lt;ignore&gt;/etc/mtab&lt;/ignore&gt;
  &lt;ignore&gt;/etc/hosts.deny&lt;/ignore&gt;
  &lt;ignore type="sregex"&gt;.log$|.swp$&lt;/ignore&gt;
&lt;/syscheck&gt;</code></pre></div>

<h3>Section: &lt;rootcheck&gt; dan &lt;syscollector&gt;</h3>
<div class="code-block"><div class="code-label"><span>XML — Rootcheck + Inventory</span></div><pre><code><span class="code-comment">&lt;!-- Rootcheck — deteksi rootkit --&gt;</span>
&lt;rootcheck&gt;
  &lt;disabled&gt;no&lt;/disabled&gt;
  &lt;frequency&gt;36000&lt;/frequency&gt;
&lt;/rootcheck&gt;

<span class="code-comment">&lt;!-- Syscollector — hardware/software inventory --&gt;</span>
&lt;wodle name="syscollector"&gt;
  &lt;disabled&gt;no&lt;/disabled&gt;
  &lt;interval&gt;1h&lt;/interval&gt;
  &lt;scan_on_start&gt;yes&lt;/scan_on_start&gt;
  &lt;hardware&gt;yes&lt;/hardware&gt;
  &lt;os&gt;yes&lt;/os&gt;
  &lt;network&gt;yes&lt;/network&gt;
  &lt;packages&gt;yes&lt;/packages&gt;
  &lt;ports all="no"&gt;yes&lt;/ports&gt;
  &lt;processes&gt;yes&lt;/processes&gt;
&lt;/wodle&gt;</code></pre></div>

<div class="callout callout-warn"><strong>Setelah edit ossec.conf:</strong> Selalu restart agent! <code>sudo systemctl restart wazuh-agent</code>. Cek log untuk memastikan nggak ada error parsing XML.</div>` },

    { id: 'centralized-config', title: 'Centralized Configuration (Manager-side)',
      html: `
<p>Selain edit <code>ossec.conf</code> langsung di setiap agent (ribet kalau ratusan endpoint), kamu bisa push konfigurasi dari <strong>Manager</strong> pakai <code>agent.conf</code>. Ini namanya <strong>centralized configuration</strong>.</p>

<h3>Bagaimana Cara Kerjanya</h3>
<ol>
  <li>Di Manager, edit file <code>/var/ossec/etc/shared/&lt;group_name&gt;/agent.conf</code></li>
  <li>Manager otomatis push config ini ke semua agent di group tersebut</li>
  <li>Agent merge <code>agent.conf</code> (dari Manager) dengan <code>ossec.conf</code> lokal</li>
  <li>Kalau ada konflik, <code>agent.conf</code> menang</li>
</ol>

<div class="code-block"><div class="code-label"><span>XML — /var/ossec/etc/shared/webservers/agent.conf (di Manager)</span></div><pre><code>&lt;agent_config&gt;
  <span class="code-comment">&lt;!-- Tambah monitoring Apache log untuk semua agent di group webservers --&gt;</span>
  &lt;localfile&gt;
    &lt;log_format&gt;apache&lt;/log_format&gt;
    &lt;location&gt;/var/log/apache2/access.log&lt;/location&gt;
  &lt;/localfile&gt;

  &lt;localfile&gt;
    &lt;log_format&gt;apache&lt;/log_format&gt;
    &lt;location&gt;/var/log/apache2/error.log&lt;/location&gt;
  &lt;/localfile&gt;

  <span class="code-comment">&lt;!-- FIM khusus webserver --&gt;</span>
  &lt;syscheck&gt;
    &lt;directories check_all="yes" realtime="yes"&gt;/var/www/html&lt;/directories&gt;
    &lt;directories check_all="yes" realtime="yes"&gt;/etc/apache2&lt;/directories&gt;
  &lt;/syscheck&gt;
&lt;/agent_config&gt;</code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Verify config pushed</span></div><pre><code><span class="code-comment"># Di Manager — cek shared config</span>
ls -la /var/ossec/etc/shared/webservers/

<span class="code-comment"># Force push (biasanya auto, tapi bisa dipaksa)</span>
/var/ossec/bin/agent_groups -S -g webservers

<span class="code-comment"># Di Agent — verifikasi config diterima</span>
cat /var/ossec/etc/shared/agent.conf</code></pre></div>

<h3>Local ossec.conf vs Centralized agent.conf</h3>
<table class="ref-table">
  <thead><tr><th>Aspek</th><th>ossec.conf (lokal)</th><th>agent.conf (centralized)</th></tr></thead>
  <tbody>
    <tr><td><strong>Lokasi edit</strong></td><td>Di setiap agent</td><td>Di Manager, per group</td></tr>
    <tr><td><strong>Scope</strong></td><td>Satu agent</td><td>Semua agent di group</td></tr>
    <tr><td><strong>Deploy</strong></td><td>Manual (SSH ke agent)</td><td>Otomatis push dari Manager</td></tr>
    <tr><td><strong>Use case</strong></td><td>Config unik per agent</td><td>Config standar per group</td></tr>
    <tr><td><strong>Priority</strong></td><td>Di-override oleh agent.conf</td><td>Menang kalau konflik</td></tr>
  </tbody>
</table>

<div class="callout callout-tip"><strong>Rekomendasi:</strong> Pakai <strong>agent.conf</strong> untuk 80% konfigurasi (standarisasi). Pakai <strong>ossec.conf</strong> lokal hanya untuk setting yang unik per agent (misalnya custom app log path).</div>` },

    { id: 'log-sources', title: 'Menambah Log Sources',
      html: `
<p>Secara default, agent cuma monitor beberapa log dasar. Untuk monitoring yang lebih komprehensif, kamu perlu tambahkan log sources secara manual. Berikut contoh untuk berbagai skenario:</p>

<h3>Linux — Standard Log Files</h3>
<div class="code-block"><div class="code-label"><span>XML — ossec.conf additions</span></div><pre><code><span class="code-comment">&lt;!-- Syslog (Debian/Ubuntu) --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/syslog&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Auth log (login, sudo, SSH) --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/auth.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Kernel messages --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/kern.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Cron jobs --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/cron.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- DPKG (software install/uninstall) --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/dpkg.log&lt;/location&gt;
&lt;/localfile&gt;</code></pre></div>

<h3>Linux — Application Logs</h3>
<div class="code-block"><div class="code-label"><span>XML — Web server, database, custom app</span></div><pre><code><span class="code-comment">&lt;!-- Apache/Nginx access log --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;apache&lt;/log_format&gt;
  &lt;location&gt;/var/log/apache2/access.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Nginx error log --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/nginx/error.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- MySQL/MariaDB --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/mysql/error.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- PostgreSQL --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;syslog&lt;/log_format&gt;
  &lt;location&gt;/var/log/postgresql/postgresql-*.log&lt;/location&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Custom app log (JSON format) --&gt;</span>
&lt;localfile&gt;
  &lt;log_format&gt;json&lt;/log_format&gt;
  &lt;location&gt;/opt/myapp/logs/events.json&lt;/location&gt;
  &lt;label key="app_name"&gt;myapp&lt;/label&gt;
&lt;/localfile&gt;</code></pre></div>

<h3>Windows — Event Channels</h3>
<div class="code-block"><div class="code-label"><span>XML — Windows Event Log collection</span></div><pre><code><span class="code-comment">&lt;!-- Security events (logon, logoff, policy change) --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Security&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- System events (service start/stop, driver load) --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;System&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Application events --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Application&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Sysmon (CRITICAL — kamu HARUS install ini) --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Microsoft-Windows-Sysmon/Operational&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- PowerShell script block logging --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Microsoft-Windows-PowerShell/Operational&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Windows Defender --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Microsoft-Windows-Windows Defender/Operational&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;

<span class="code-comment">&lt;!-- Windows Firewall --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Microsoft-Windows-Windows Firewall With Advanced Security/Firewall&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;</code></pre></div>

<div class="callout callout-warn"><strong>Windows agent:</strong> Setelah edit <code>ossec.conf</code>, restart service via <code>Restart-Service WazuhSvc</code> atau dari Services console.</div>` },

    { id: 'active-response', title: 'Active Response',
      html: `
<p>Active Response memungkinkan Wazuh <strong>otomatis mengambil tindakan</strong> saat rule tertentu trigger. Misalnya: auto-block IP yang brute force, auto-disable user yang compromise.</p>

<div class="callout callout-warn"><strong>⚠️ HATI-HATI:</strong> Active Response bisa auto-block IP legitimate kalau salah konfigurasi. <em>Selalu test di staging environment dulu</em>. Gunakan whitelist untuk IP yang nggak boleh di-block (management IP, VPN, dll).</div>

<h3>Built-in Commands</h3>
<table class="ref-table">
  <thead><tr><th>Command</th><th>Fungsi</th><th>Platform</th></tr></thead>
  <tbody>
    <tr><td><code>firewall-drop</code></td><td>Block IP di iptables (Linux) atau netsh (Windows)</td><td>Linux, Windows</td></tr>
    <tr><td><code>host-deny</code></td><td>Tambah IP ke /etc/hosts.deny</td><td>Linux</td></tr>
    <tr><td><code>disable-account</code></td><td>Disable user account</td><td>Linux, Windows</td></tr>
    <tr><td><code>restart-wazuh</code></td><td>Restart Wazuh agent/manager</td><td>All</td></tr>
    <tr><td><code>route-null</code></td><td>Null-route IP address</td><td>Linux, Windows</td></tr>
  </tbody>
</table>

<h3>Konfigurasi di Manager (ossec.conf)</h3>
<div class="code-block"><div class="code-label"><span>XML — Active Response config (di Manager ossec.conf)</span></div><pre><code><span class="code-comment">&lt;!-- Definisi command --&gt;</span>
&lt;command&gt;
  &lt;name&gt;firewall-drop&lt;/name&gt;
  &lt;executable&gt;firewall-drop&lt;/executable&gt;
  &lt;timeout_allowed&gt;yes&lt;/timeout_allowed&gt;
&lt;/command&gt;

<span class="code-comment">&lt;!-- Active Response: block IP saat brute force SSH (rule 5763) --&gt;</span>
&lt;active-response&gt;
  &lt;command&gt;firewall-drop&lt;/command&gt;
  &lt;location&gt;local&lt;/location&gt;          <span class="code-comment">&lt;!-- Eksekusi di agent yang trigger --&gt;</span>
  &lt;rules_id&gt;5763&lt;/rules_id&gt;           <span class="code-comment">&lt;!-- Rule: SSH brute force --&gt;</span>
  &lt;timeout&gt;600&lt;/timeout&gt;              <span class="code-comment">&lt;!-- Unblock setelah 10 menit --&gt;</span>
&lt;/active-response&gt;

<span class="code-comment">&lt;!-- Whitelist — IP yang TIDAK BOLEH di-block --&gt;</span>
&lt;global&gt;
  &lt;white_list&gt;10.0.0.1&lt;/white_list&gt;      <span class="code-comment">&lt;!-- Management IP --&gt;</span>
  &lt;white_list&gt;192.168.1.0/24&lt;/white_list&gt; <span class="code-comment">&lt;!-- Internal network --&gt;</span>
&lt;/global&gt;</code></pre></div>

<h3>Custom Active Response Script</h3>
<p>Kamu bisa bikin script sendiri yang dijalankan saat alert trigger. Contoh: kirim notifikasi ke Slack.</p>
<div class="code-block"><div class="code-label"><span>Bash — /var/ossec/active-response/bin/slack-notify.sh</span></div><pre><code>#!/bin/bash
<span class="code-comment"># Custom Active Response — Kirim notifikasi ke Slack</span>

LOCAL=$(dirname $0)
cd $LOCAL
cd ../
PWD=$(pwd)

<span class="code-comment"># Read alert input dari stdin</span>
read INPUT_JSON

ALERT_MSG=$(echo $INPUT_JSON | /usr/bin/jq -r '.parameters.alert.rule.description')
ALERT_LEVEL=$(echo $INPUT_JSON | /usr/bin/jq -r '.parameters.alert.rule.level')
SRC_IP=$(echo $INPUT_JSON | /usr/bin/jq -r '.parameters.alert.data.srcip')
AGENT_NAME=$(echo $INPUT_JSON | /usr/bin/jq -r '.parameters.alert.agent.name')

WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

<span class="code-comment"># Kirim ke Slack</span>
curl -s -X POST "$WEBHOOK_URL" \\
  -H 'Content-Type: application/json' \\
  -d "{
    \\"text\\": \\"🚨 Wazuh Alert (Level $ALERT_LEVEL)\\\\n*$ALERT_MSG*\\\\nAgent: $AGENT_NAME\\\\nSource IP: $SRC_IP\\"
  }"</code></pre></div>

<div class="code-block"><div class="code-label"><span>XML — Register custom command (di Manager ossec.conf)</span></div><pre><code>&lt;command&gt;
  &lt;name&gt;slack-notify&lt;/name&gt;
  &lt;executable&gt;slack-notify.sh&lt;/executable&gt;
  &lt;timeout_allowed&gt;no&lt;/timeout_allowed&gt;
&lt;/command&gt;

&lt;active-response&gt;
  &lt;command&gt;slack-notify&lt;/command&gt;
  &lt;location&gt;server&lt;/location&gt;
  &lt;level&gt;10&lt;/level&gt;  <span class="code-comment">&lt;!-- Trigger untuk semua alert level 10+ --&gt;</span>
&lt;/active-response&gt;</code></pre></div>

<div class="callout callout-tip"><strong>Tips:</strong> Set <code>&lt;location&gt;server&lt;/location&gt;</code> kalau script hanya perlu jalan di Manager (misal: Slack notification). Set <code>&lt;location&gt;local&lt;/location&gt;</code> kalau harus jalan di agent yang trigger (misal: firewall block).</div>` },

    { id: 'sysmon-integration', title: 'Sysmon + Wazuh (Windows)',
      html: `
<p>Windows Event Log default itu <strong>sangat terbatas</strong> untuk threat detection. Kamu bisa tau ada login, tapi nggak tau process apa yang dijalankan dengan command line apa. Di sinilah <strong>Sysmon</strong> (System Monitor) dari Microsoft Sysinternals jadi game changer.</p>

<h3>Kenapa Sysmon Wajib untuk SOC</h3>
<table class="ref-table">
  <thead><tr><th>Event Type</th><th>Tanpa Sysmon</th><th>Dengan Sysmon</th></tr></thead>
  <tbody>
    <tr><td><strong>Process creation</strong></td><td>Event 4688 — hanya nama proses</td><td>Sysmon 1 — full command line, parent process, hash, user</td></tr>
    <tr><td><strong>Network connection</strong></td><td>Firewall log (terbatas)</td><td>Sysmon 3 — proses mana yang konek ke IP/port mana</td></tr>
    <tr><td><strong>File creation</strong></td><td>Tidak ada</td><td>Sysmon 11 — file baru dibuat, oleh proses apa</td></tr>
    <tr><td><strong>Registry changes</strong></td><td>Audit policy (ribet)</td><td>Sysmon 12/13/14 — create, modify, delete registry key</td></tr>
    <tr><td><strong>DLL loading</strong></td><td>Tidak ada</td><td>Sysmon 7 — DLL apa di-load oleh proses apa</td></tr>
    <tr><td><strong>DNS queries</strong></td><td>Tidak ada</td><td>Sysmon 22 — proses mana query domain apa</td></tr>
  </tbody>
</table>

<h3>Install Sysmon</h3>
<div class="code-block"><div class="code-label"><span>PowerShell — Install Sysmon</span></div><pre><code># Download Sysmon dari Sysinternals
# https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon

# Download config SwiftOnSecurity (community recommended)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/SwiftOnSecurity/sysmon-config/master/sysmonconfig-export.xml" -OutFile sysmonconfig.xml

# Install Sysmon dengan config
.\\Sysmon64.exe -accepteula -i sysmonconfig.xml

# Verifikasi Sysmon running
Get-Service Sysmon64
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 5</code></pre></div>

<h3>Konfigurasi Wazuh Agent untuk Collect Sysmon</h3>
<div class="code-block"><div class="code-label"><span>XML — Tambah di ossec.conf agent (Windows)</span></div><pre><code><span class="code-comment">&lt;!-- Collect Sysmon event log --&gt;</span>
&lt;localfile&gt;
  &lt;location&gt;Microsoft-Windows-Sysmon/Operational&lt;/location&gt;
  &lt;log_format&gt;eventchannel&lt;/log_format&gt;
&lt;/localfile&gt;</code></pre></div>
<p>Restart Wazuh agent service. Sekarang semua Sysmon event akan dikirim ke Manager dan muncul di dashboard.</p>

<h3>Contoh Detection dengan Sysmon + Wazuh Rules</h3>
<div class="code-block"><div class="code-label"><span>Wazuh Alert — Sysmon Process Creation</span></div><pre><code><span class="code-comment"># Sysmon Event 1 (Process Creation) — encoded PowerShell</span>
Rule ID: 92002
Description: "Sysmon - Suspicious Process - Encoded PowerShell"
Sysmon Event: Process Create
Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe
CommandLine: powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0A...
ParentImage: C:\\Windows\\System32\\cmd.exe
User: CORP\\john.doe
Hash: SHA256=a1b2c3d4...</code></pre></div>

<div class="code-block"><div class="code-label"><span>Wazuh Alert — Sysmon Network Connection</span></div><pre><code><span class="code-comment"># Sysmon Event 3 (Network Connection) — suspicious outbound</span>
Rule ID: 92010
Description: "Sysmon - Process connected to external IP"
Image: C:\\Users\\john\\AppData\\Local\\Temp\\payload.exe
DestinationIp: 185.234.53.108
DestinationPort: 443
Protocol: tcp
User: CORP\\john.doe</code></pre></div>

<div class="callout callout-info"><strong>Best practice:</strong> Sysmon + Wazuh Agent adalah <strong>minimum setup</strong> untuk Windows endpoint monitoring di SOC. Tanpa Sysmon, kamu basically buta terhadap process-level activity. Install Sysmon di SEMUA Windows endpoint.</div>` },

    { id: 'fim-advanced', title: 'FIM Advanced Configuration',
      html: `
<p>File Integrity Monitoring (FIM) default cukup basic. Di section ini kita bahas fitur advanced: real-time monitoring, who-data, registry monitoring, dan tuning.</p>

<h3>Real-time vs Scheduled Monitoring</h3>
<div class="code-block"><div class="code-label"><span>XML — Real-time FIM</span></div><pre><code>&lt;syscheck&gt;
  <span class="code-comment">&lt;!-- Scheduled scan (default) — scan periodik --&gt;</span>
  &lt;frequency&gt;43200&lt;/frequency&gt;  <span class="code-comment">&lt;!-- 12 jam --&gt;</span>

  <span class="code-comment">&lt;!-- Real-time monitoring — instant alert saat file berubah --&gt;</span>
  &lt;directories check_all="yes" realtime="yes"&gt;/etc&lt;/directories&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;/usr/bin&lt;/directories&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;/var/www/html&lt;/directories&gt;

  <span class="code-comment">&lt;!-- Scheduled only (non-critical) --&gt;</span>
  &lt;directories check_all="yes"&gt;/opt&lt;/directories&gt;
  &lt;directories check_all="yes"&gt;/home&lt;/directories&gt;
&lt;/syscheck&gt;</code></pre></div>
<p><strong>Real-time</strong> pakai inotify (Linux) atau ReadDirectoryChangesW (Windows). Alert muncul <em>detik</em> setelah perubahan. <strong>Scheduled</strong> cuma detect saat scan periodik — bisa miss perubahan yang terjadi dan di-revert sebelum scan.</p>

<h3>Who-Data — Track Siapa yang Ubah File</h3>
<p>Fitur <code>whodata</code> nggak cuma kasih tau file berubah, tapi juga <strong>siapa user</strong> dan <strong>proses apa</strong> yang mengubahnya. Sangat berguna untuk forensik.</p>
<div class="code-block"><div class="code-label"><span>XML — Who-data config</span></div><pre><code>&lt;syscheck&gt;
  <span class="code-comment">&lt;!-- whodata = real-time + user/process tracking --&gt;</span>
  &lt;directories check_all="yes" whodata="yes"&gt;/etc&lt;/directories&gt;
  &lt;directories check_all="yes" whodata="yes"&gt;/var/www/html&lt;/directories&gt;
&lt;/syscheck&gt;</code></pre></div>

<div class="code-block"><div class="code-label"><span>Contoh Alert dengan who-data</span></div><pre><code>Rule: 550 — Integrity checksum changed
File: /etc/passwd
Changed by:
  User: root (uid=0)
  Process: /usr/sbin/useradd
  Process ID: 12847
  Audit user: john (auid=1001)   <span class="code-comment">← user asli yang sudo</span></code></pre></div>

<div class="callout callout-info"><strong>Penting:</strong> Who-data butuh <strong>auditd</strong> aktif di Linux. Install: <code>apt install auditd</code>. Wazuh otomatis setup audit rules yang diperlukan.</div>

<h3>File Limit dan Ignore Patterns</h3>
<div class="code-block"><div class="code-label"><span>XML — Tuning FIM</span></div><pre><code>&lt;syscheck&gt;
  <span class="code-comment">&lt;!-- Limit jumlah file yang di-track (default: 100000) --&gt;</span>
  &lt;file_limit&gt;
    &lt;enabled&gt;yes&lt;/enabled&gt;
    &lt;entries&gt;200000&lt;/entries&gt;
  &lt;/file_limit&gt;

  <span class="code-comment">&lt;!-- Ignore file/directory tertentu --&gt;</span>
  &lt;ignore&gt;/etc/mtab&lt;/ignore&gt;
  &lt;ignore&gt;/etc/resolv.conf&lt;/ignore&gt;
  &lt;ignore type="sregex"&gt;\\.log$|\\.tmp$|\\.swp$&lt;/ignore&gt;
  &lt;ignore type="sregex"&gt;^/proc&lt;/ignore&gt;

  <span class="code-comment">&lt;!-- Hanya monitor file extension tertentu --&gt;</span>
  &lt;directories check_all="yes" restrict=".conf$|.cfg$|.ini$"&gt;/etc&lt;/directories&gt;

  <span class="code-comment">&lt;!-- Recursion level (default: 256) --&gt;</span>
  &lt;directories check_all="yes" recursion_level="3"&gt;/home&lt;/directories&gt;
&lt;/syscheck&gt;</code></pre></div>

<h3>Windows Registry Monitoring</h3>
<div class="code-block"><div class="code-label"><span>XML — Registry FIM (Windows agent)</span></div><pre><code>&lt;syscheck&gt;
  <span class="code-comment">&lt;!-- Monitor registry keys kritis --&gt;</span>
  
  <span class="code-comment">&lt;!-- Autorun / persistence --&gt;</span>
  &lt;windows_registry arch="both"&gt;HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Run&lt;/windows_registry&gt;
  &lt;windows_registry arch="both"&gt;HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce&lt;/windows_registry&gt;
  &lt;windows_registry arch="both"&gt;HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run&lt;/windows_registry&gt;

  <span class="code-comment">&lt;!-- Services --&gt;</span>
  &lt;windows_registry&gt;HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Services&lt;/windows_registry&gt;

  <span class="code-comment">&lt;!-- Scheduled Tasks --&gt;</span>
  &lt;windows_registry&gt;HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Schedule\\TaskCache\\Tasks&lt;/windows_registry&gt;

  <span class="code-comment">&lt;!-- Security policies --&gt;</span>
  &lt;windows_registry&gt;HKEY_LOCAL_MACHINE\\SECURITY\\Policy&lt;/windows_registry&gt;

  <span class="code-comment">&lt;!-- Ignore noisy keys --&gt;</span>
  &lt;registry_ignore&gt;HKEY_LOCAL_MACHINE\\Security\\SAM\\Domains\\Account\\Users\\.+\\V&lt;/registry_ignore&gt;
&lt;/syscheck&gt;</code></pre></div>

<div class="callout callout-tip"><strong>Prioritas monitoring:</strong> Registry keys di atas adalah yang paling sering dipakai attacker untuk <strong>persistence</strong>. Kalau kamu cuma bisa monitor sedikit, prioritaskan <code>Run</code>, <code>RunOnce</code>, dan <code>Services</code> — ini yang paling umum dipakai malware.</div>` }
  ]
}

});
