// ═══════════════════════════════════════════════════════
// Ticketing: DFIR-IRIS (3 sub-modules), TheHive (3 sub-modules)
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─── DFIR-IRIS ─────────────────────────────────────────

'iris-overview': {
  name: 'DFIR-IRIS — Overview',
  subtitle: 'Web-based incident response platform — case management, IOC tracking, timeline, dan evidence management untuk tim DFIR.',
  tags: ['tag-ticketing','tag-vps'], tagLabels: ['Ticketing','VPS Hosted'],
  parent: 'iris',
  sections: [
    { id: 'what-is-iris', title: 'Apa itu DFIR-IRIS?',
      html: `
<p><strong>DFIR-IRIS</strong> (biasa disebut IRIS) adalah platform incident response berbasis web yang dibangun khusus untuk tim <strong>DFIR</strong> (Digital Forensics & Incident Response). Dibuat oleh komunitas DFIR-IRIS yang berasal dari Prancis, dan sekarang dipakai oleh banyak tim SOC/DFIR di seluruh dunia.</p>

<p>Apa yang IRIS tawarkan:</p>
<ul>
  <li><strong>Case Management</strong> — buat dan kelola case investigasi dengan severity, status, assignment</li>
  <li><strong>IOC Tracking</strong> — catat semua Indicators of Compromise: IP, domain, hash, email, URL</li>
  <li><strong>Timeline Reconstruction</strong> — bangun urutan kronologis event selama insiden</li>
  <li><strong>Evidence Management</strong> — dokumentasikan artefak: memory dump, disk image, log file, PCAP</li>
  <li><strong>Task Assignment</strong> — bagi tugas ke anggota tim, track progress</li>
  <li><strong>Notes</strong> — catatan analyst yang bisa dikaitkan ke evidence dan IOC</li>
  <li><strong>Reporting</strong> — generate laporan insiden otomatis dari data case</li>
  <li><strong>Multi-user Collaboration</strong> — beberapa analyst bisa kerja di case yang sama</li>
  <li><strong>Audit Trail</strong> — semua aktivitas di-log untuk accountability</li>
</ul>

<h3>IRIS vs TheHive — Kapan Pakai yang Mana?</h3>
<table class="ref-table">
  <thead><tr><th>Aspek</th><th>DFIR-IRIS</th><th>TheHive</th></tr></thead>
  <tbody>
    <tr><td><strong>Fokus utama</strong></td><td>DFIR documentation & investigation depth</td><td>SOC workflow & team collaboration</td></tr>
    <tr><td><strong>Timeline</strong></td><td>Built-in, sangat detail</td><td>Terbatas</td></tr>
    <tr><td><strong>Evidence chain of custody</strong></td><td>Lengkap</td><td>Basic</td></tr>
    <tr><td><strong>Alert integration</strong></td><td>Via API</td><td>Native (Wazuh, MISP, email)</td></tr>
    <tr><td><strong>Auto-enrichment</strong></td><td>Via API custom</td><td>Cortex (built-in)</td></tr>
    <tr><td><strong>Reporting</strong></td><td>Detailed, customizable template</td><td>Dashboards & metrics</td></tr>
    <tr><td><strong>Best for</strong></td><td>Investigasi mendalam, forensic documentation</td><td>Daily SOC operations, alert triage</td></tr>
  </tbody>
</table>

<div class="callout callout-tip"><strong>Pro tip:</strong> Banyak tim SOC pakai <strong>KEDUANYA</strong> — TheHive untuk daily operations (alert triage, case assignment, Cortex enrichment) dan IRIS untuk dokumentasi investigasi mendalam (timeline, evidence, forensic report). Mereka saling melengkapi, bukan menggantikan.</div>` },

    { id: 'architecture', title: 'Architecture & Concepts',
      html: `
<p>IRIS dibangun dengan filosofi <strong>API-first</strong> — semua yang bisa dilakukan di web UI juga bisa dilakukan via REST API. Ini bikin IRIS sangat mudah diintegrasikan dengan tool lain.</p>

<h3>Core Concepts</h3>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">1</span> Case</div>
<p>Container utama untuk setiap investigasi. Berisi semua data terkait satu insiden: IOCs, timeline, evidence, notes, tasks. Setiap case punya:</p>
<ul>
  <li><strong>Case ID</strong> — auto-generated (misalnya #1, #2)</li>
  <li><strong>SOC ID</strong> — referensi dari ticketing system lain (misalnya JIRA-1234)</li>
  <li><strong>Severity</strong> — Informational / Low / Medium / High / Critical</li>
  <li><strong>Status</strong> — Open → In Progress → Containment → Closed</li>
  <li><strong>Customer</strong> — organisasi/client yang terdampak</li>
  <li><strong>Tags</strong> — label untuk kategorisasi (phishing, malware, insider-threat)</li>
</ul>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">2</span> IOC (Indicators of Compromise)</div>
<p>Artefak yang menandakan compromise: IP address, domain name, file hash, URL, email address, filename, registry key. Setiap IOC bisa diberi:</p>
<ul>
  <li><strong>TLP</strong> (Traffic Light Protocol) — White/Green/Amber/Red — siapa boleh lihat</li>
  <li><strong>Tags</strong> — phishing, c2, malware, etc</li>
  <li><strong>Description</strong> — konteks kenapa ini IOC</li>
</ul>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">3</span> Timeline</div>
<p>Urutan kronologis event selama insiden. Setiap entry punya timestamp, title, description, category (network/file/process/user), dan link ke evidence yang mendukung.</p>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">4</span> Evidence</div>
<p>Artefak digital yang dikumpulkan selama investigasi: memory dump, disk image, PCAP, log files, screenshots. Metadata: hash, acquisition tool, chain of custody.</p>
</div>

<div class="scenario-card"><div class="sc-head"><span class="sc-num">5</span> Notes & Tasks</div>
<p><strong>Notes</strong> = catatan observasi analyst, bisa dikaitkan ke evidence/IOC. <strong>Tasks</strong> = work items yang bisa di-assign ke anggota tim.</p>
</div>

<div class="code-block"><div class="code-label"><span>Text — Hubungan antar concepts</span></div><pre><code>  ┌──────────────────────────────────────────────────┐
  │                    CASE                          │
  │  ┌──────────┐ ┌──────────┐ ┌─────────────────┐  │
  │  │   IOCs   │ │ Timeline │ │    Evidence      │  │
  │  │ IP,hash  │ │ event 1  │ │ memdump, pcap   │  │
  │  │ domain   │ │ event 2  │ │ disk image, log │  │
  │  │ URL,file │ │ event 3  │ │ screenshot      │  │
  │  └──────────┘ └──────────┘ └─────────────────┘  │
  │  ┌──────────┐ ┌──────────┐                      │
  │  │  Notes   │ │  Tasks   │                      │
  │  │ analyst  │ │ assigned │                      │
  │  │ findings │ │ to team  │                      │
  │  └──────────┘ └──────────┘                      │
  └──────────────────────────────────────────────────┘</code></pre></div>` },

    { id: 'resources', title: 'Resources',
      html: `
<div class="link-row">
  <a class="link-btn" href="https://docs.dfir-iris.org" target="_blank">↗ Official Docs</a>
  <a class="link-btn" href="https://github.com/dfir-iris/iris-web" target="_blank">↗ GitHub</a>
  <a class="link-btn" href="https://github.com/dfir-iris/iris-web/releases" target="_blank">↗ Releases</a>
  <a class="link-btn" href="https://docs.dfir-iris.org/operations/api/" target="_blank">↗ API Reference</a>
</div>` }
  ]
},

'iris-setup': {
  name: 'DFIR-IRIS — Setup',
  subtitle: 'Install IRIS dengan Docker Compose, konfigurasi awal, dan user management.',
  tags: ['tag-ticketing'], tagLabels: ['Ticketing'],
  parent: 'iris',
  sections: [
    { id: 'docker-install', title: 'Install dengan Docker Compose',
      html: `
<p>IRIS paling gampang di-deploy pakai <strong>Docker Compose</strong>. Semua dependensi (PostgreSQL, RabbitMQ, Nginx) sudah dikonfigurasi di compose file.</p>

<div class="callout callout-info"><strong>Minimum Requirements:</strong> 4 GB RAM, 2 CPU cores, 20 GB disk. OS: Ubuntu 22.04 atau CentOS 8+ dengan Docker Engine + Docker Compose v2 terinstall.</div>

<div class="playbook-step"><span class="pb-num">1</span><div class="pb-content"><strong>Install Docker (kalau belum)</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Install Docker Engine</span>
curl -fsSL https://get.docker.com | sh

<span class="code-comment"># Tambah user ke docker group (logout-login setelahnya)</span>
sudo usermod -aG docker $USER

<span class="code-comment"># Verifikasi</span>
docker --version
docker compose version</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">2</span><div class="pb-content"><strong>Clone Repository IRIS</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Clone repo</span>
git clone https://github.com/dfir-iris/iris-web.git
cd iris-web

<span class="code-comment"># Checkout stable release (cek latest di GitHub Releases)</span>
git checkout v2.4.7</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">3</span><div class="pb-content"><strong>Configure Environment</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Copy sample env file</span>
cp .env.model .env

<span class="code-comment"># Edit .env — yang WAJIB diubah:</span>
nano .env</code></pre></div>

<div class="code-block"><div class="code-label"><span>.env — Key settings</span></div><pre><code><span class="code-comment"># Database password (GANTI!)</span>
POSTGRES_PASSWORD=YourStr0ngP@ssword

<span class="code-comment"># IRIS secret key (GANTI! Bisa generate pakai: openssl rand -hex 32)</span>
IRIS_SECRET_KEY=c8a3f1b29e4d7a6f5082...

<span class="code-comment"># Admin credentials untuk first login</span>
IRIS_ADM_PASSWORD=administrator
IRIS_ADM_EMAIL=admin@iris.local
IRIS_ADM_USERNAME=administrator</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">4</span><div class="pb-content"><strong>Start Containers</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Build dan start semua service</span>
docker compose build
docker compose up -d

<span class="code-comment"># Cek status</span>
docker compose ps

<span class="code-comment"># Lihat logs (troubleshoot kalau ada error)</span>
docker compose logs -f iriswebapp</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">5</span><div class="pb-content"><strong>Akses Web UI</strong>
<div class="code-block"><div class="code-label"><span>First Login</span></div><pre><code>URL:      https://&lt;SERVER_IP&gt;:443
Username: administrator
Password: administrator   <span class="code-comment">← GANTI SEGERA setelah login!</span></code></pre></div>
<div class="callout callout-warn"><strong>Penting:</strong> IRIS pakai self-signed certificate by default. Browser akan warning "Not Secure" — klik Advanced → Proceed. Untuk production, ganti dengan proper SSL cert.</div>
</div></div>` },

    { id: 'initial-config', title: 'Konfigurasi Awal',
      html: `
<p>Setelah first login, ada beberapa hal yang harus kamu setup:</p>

<h3>1. Ganti Password Admin</h3>
<p>Klik avatar di kanan atas → <strong>My Profile</strong> → <strong>Change Password</strong>. Gunakan password yang kuat (minimal 12 karakter, mixed case + numbers + symbols).</p>

<h3>2. Setup Customer / Organization</h3>
<p>IRIS menggunakan konsep "Customer" untuk mengidentifikasi organisasi yang terdampak insiden.</p>
<p><strong>Admin Panel</strong> → <strong>Customers</strong> → <strong>Add Customer</strong></p>
<ul>
  <li><strong>Customer Name</strong> — nama organisasi (misalnya "PT Teknologi Indonesia")</li>
  <li><strong>Customer ID</strong> — kode singkat (misalnya "PTI")</li>
  <li><strong>Description</strong> — info tambahan</li>
</ul>

<h3>3. Create User Accounts</h3>
<p>Buat akun untuk setiap anggota tim. <strong>Admin Panel</strong> → <strong>Users</strong> → <strong>Add User</strong>.</p>

<h3>4. Configure Case Classification (Optional)</h3>
<p>Kamu bisa setup custom classification untuk case: Phishing, Malware, Data Breach, Insider Threat, dll. Ini membantu reporting dan metrics nanti.</p>

<h3>5. Email Notifications (Optional)</h3>
<p>IRIS bisa kirim email notification saat case di-update, task di-assign, dll. Setup via <strong>Admin Panel</strong> → <strong>Server Settings</strong> → <strong>Email</strong> (butuh SMTP server).</p>

<div class="callout callout-tip"><strong>Quick start:</strong> Minimal yang harus disetup: ganti password admin, buat 1 customer, buat akun user untuk setiap analyst. Sisanya bisa disetup seiring waktu.</div>` },

    { id: 'user-management', title: 'User Management',
      html: `
<p>IRIS punya model role sederhana tapi efektif. Setiap user punya role yang menentukan apa yang bisa mereka akses.</p>

<h3>Roles</h3>
<table class="ref-table">
  <thead><tr><th>Role</th><th>Bisa Apa</th><th>Untuk Siapa</th></tr></thead>
  <tbody>
    <tr><td><strong>Administrator</strong></td><td>Full access: manage users, settings, semua case</td><td>SOC Manager, sysadmin</td></tr>
    <tr><td><strong>Analyst</strong></td><td>Create & manage case, add IOC, timeline, evidence, notes</td><td>SOC/DFIR analyst (L1, L2, L3)</td></tr>
    <tr><td><strong>Viewer</strong></td><td>Read-only access ke case</td><td>Management, auditor, legal team</td></tr>
  </tbody>
</table>

<h3>Create User</h3>
<p><strong>Admin Panel</strong> → <strong>Access Control</strong> → <strong>Users</strong> → <strong>Add User</strong></p>
<ul>
  <li><strong>Username</strong> — biasanya firstname.lastname</li>
  <li><strong>Full Name</strong> — nama lengkap</li>
  <li><strong>Email</strong> — untuk notifications</li>
  <li><strong>Password</strong> — set temporary, suruh user ganti sendiri</li>
  <li><strong>Role</strong> — pilih sesuai kebutuhan</li>
  <li><strong>Active</strong> — enable/disable tanpa hapus akun</li>
</ul>

<h3>API Key per User</h3>
<p>Setiap user bisa generate API key sendiri dari profile. API key ini dipakai untuk integrasi via REST API (misalnya auto-create case dari script). Key bisa di-revoke kapan saja.</p>

<div class="callout callout-warn"><strong>Security:</strong> Jangan share API key. Setiap user harus punya key sendiri supaya audit trail jelas — tau siapa yang create/modify case via API.</div>` }
  ]
},

'iris-usage': {
  name: 'DFIR-IRIS — Full Guide',
  subtitle: 'Walkthrough lengkap: case management, IOC, timeline, evidence, reporting, dan API basics.',
  tags: ['tag-ticketing','tag-vps'], tagLabels: ['Ticketing','VPS Hosted'],
  parent: 'iris',
  sections: [
    { id: 'case-walkthrough', title: 'Membuat & Mengelola Case',
      html: `
<p>Case adalah unit kerja utama di IRIS. Setiap insiden yang kamu investigasi = satu case. Berikut walkthrough lengkap:</p>

<div class="playbook-step"><span class="pb-num">1</span><div class="pb-content"><strong>Buat Case Baru</strong>
<p>Klik <strong>+ New Case</strong> di sidebar. Isi form:</p>
<ul>
  <li><strong>Case Name</strong> — deskriptif, contoh: "Phishing Campaign targeting Finance Dept — Jan 2024"</li>
  <li><strong>SOC ID</strong> — referensi dari sistem lain kalau ada (JIRA-1234, SNOW-5678)</li>
  <li><strong>Description</strong> — ringkasan awal insiden. Tulis apa yang kamu tau sejauh ini.</li>
  <li><strong>Customer</strong> — pilih organisasi yang terdampak</li>
  <li><strong>Classification</strong> — tipe insiden (Phishing, Malware, Brute Force, etc)</li>
  <li><strong>Severity</strong> — Informational / Low / Medium / High / Critical</li>
</ul>
</div></div>

<div class="playbook-step"><span class="pb-num">2</span><div class="pb-content"><strong>Navigate Case Tabs</strong>
<p>Setelah case dibuat, kamu akan lihat beberapa tab:</p>
<ul>
  <li><strong>Summary</strong> — overview case, status, severity, assignment</li>
  <li><strong>IOC</strong> — indicators of compromise yang ditemukan</li>
  <li><strong>Timeline</strong> — urutan kronologis event</li>
  <li><strong>Evidence</strong> — artefak digital yang dikumpulkan</li>
  <li><strong>Tasks</strong> — work items yang perlu dikerjakan</li>
  <li><strong>Notes</strong> — catatan analyst</li>
</ul>
</div></div>

<div class="playbook-step"><span class="pb-num">3</span><div class="pb-content"><strong>Assign ke Analyst</strong>
<p>Di tab <strong>Summary</strong>, klik <strong>Assign</strong> → pilih analyst yang akan handle. Bisa assign ke multiple orang untuk case besar.</p>
</div></div>

<div class="playbook-step"><span class="pb-num">4</span><div class="pb-content"><strong>Update Status & Close</strong>
<p>Status flow: <strong>Open</strong> → <strong>In Progress</strong> → <strong>Containment</strong> → <strong>Closed</strong></p>
<p>Saat close case, tambahkan <strong>closing note</strong>: summary temuan, tindakan yang diambil, rekomendasi. Ini penting untuk knowledge base.</p>
</div></div>

<h3>Contoh Case yang Well-Documented</h3>
<div class="code-block"><div class="code-label"><span>Contoh — Good Case Documentation</span></div><pre><code>Case Name: Phishing Campaign — CFO Impersonation — 15 Jan 2024
SOC ID: SOC-2024-0042
Severity: HIGH
Classification: Phishing

Description:
Pada 15 Jan 2024 pukul 09:15 WIB, 12 karyawan divisi Finance menerima 
email yang mengaku dari CFO (spoofed address: cfo@company-secure.com). 
Email berisi link ke fake login page yang meng-harvest credentials.
3 karyawan sudah klik link dan submit credentials.

IOCs: 5 (2 domain, 1 IP, 2 hash)
Timeline: 15 entries
Evidence: Email headers, phishing page source, access logs
Tasks: 8 (5 completed, 3 in progress)</code></pre></div>

<div class="callout callout-info"><strong>Tips dokumentasi:</strong> Tulis description seolah-olah orang yang baca nggak tau konteks apapun. Jelaskan <em>apa yang terjadi</em>, <em>kapan</em>, <em>siapa yang terdampak</em>, dan <em>apa yang sudah dilakukan</em>.</div>` },

    { id: 'ioc-management', title: 'IOC Management',
      html: `
<p>IOC (Indicators of Compromise) adalah artefak teknis yang menunjukkan adanya compromise. IRIS mendukung berbagai tipe IOC:</p>

<h3>Tipe IOC yang Supported</h3>
<table class="ref-table">
  <thead><tr><th>Tipe</th><th>Contoh</th><th>Kapan Dipakai</th></tr></thead>
  <tbody>
    <tr><td><strong>IP Address</strong></td><td>185.234.53.108</td><td>C2 server, scanner, attacker origin</td></tr>
    <tr><td><strong>Domain</strong></td><td>evil-login.company-secure.com</td><td>Phishing domain, C2 domain</td></tr>
    <tr><td><strong>URL</strong></td><td>https://evil.com/login.php</td><td>Phishing URL, malware download</td></tr>
    <tr><td><strong>Hash (MD5)</strong></td><td>d41d8cd98f00b204e9800998ecf8427e</td><td>Malware hash</td></tr>
    <tr><td><strong>Hash (SHA256)</strong></td><td>e3b0c44298fc1c149afbf4...</td><td>Malware hash (preferred)</td></tr>
    <tr><td><strong>Email</strong></td><td>attacker@phishing.com</td><td>Phishing sender</td></tr>
    <tr><td><strong>Filename</strong></td><td>invoice_update.exe</td><td>Malware dropper name</td></tr>
    <tr><td><strong>Registry Key</strong></td><td>HKLM\\SOFTWARE\\...\\Run\\malware</td><td>Persistence mechanism</td></tr>
  </tbody>
</table>

<h3>Tambah IOC</h3>
<p>Di case → tab <strong>IOC</strong> → <strong>Add IOC</strong>:</p>
<ul>
  <li><strong>IOC Type</strong> — pilih dari dropdown (IP, domain, hash, dll)</li>
  <li><strong>IOC Value</strong> — nilai IOC-nya</li>
  <li><strong>TLP</strong> — Traffic Light Protocol (siapa boleh akses info ini)
    <ul>
      <li><strong>WHITE</strong> — public, boleh dishare bebas</li>
      <li><strong>GREEN</strong> — community, boleh dishare ke komunitas</li>
      <li><strong>AMBER</strong> — restricted, hanya tim internal + partner terpercaya</li>
      <li><strong>RED</strong> — confidential, hanya penerima langsung</li>
    </ul>
  </li>
  <li><strong>Description</strong> — konteks: "C2 server yang dipakai malware untuk beacon setiap 30 menit"</li>
  <li><strong>Tags</strong> — c2, phishing, malware, exfil, etc</li>
</ul>

<h3>Bulk Import</h3>
<p>Untuk import banyak IOC sekaligus, IRIS support CSV import. Format:</p>
<div class="code-block"><div class="code-label"><span>CSV — ioc_import.csv</span></div><pre><code>ioc_type,ioc_value,ioc_description,ioc_tlp,ioc_tags
ip-dst,185.234.53.108,C2 Server,amber,c2
domain,evil-login.com,Phishing domain,amber,phishing
sha256,e3b0c44298fc1c14...,Malware dropper,red,malware</code></pre></div>

<h3>Export IOC</h3>
<p>Kamu bisa export semua IOC dari case untuk sharing ke tim lain atau feed ke security tools (firewall, SIEM, dll). Export format: CSV atau JSON via API.</p>` },

    { id: 'timeline-building', title: 'Membangun Timeline',
      html: `
<p>Timeline adalah <strong>rekonstruksi kronologis</strong> semua event yang terjadi selama insiden. Ini salah satu deliverable paling penting dari investigasi — timeline yang bagus bisa menceritakan "cerita" insiden dari awal sampai akhir.</p>

<h3>Best Practices Timeline</h3>
<ul>
  <li><strong>Chronological accuracy</strong> — pastikan timestamp akurat. Kalau ada timezone berbeda, convert ke satu timezone (biasanya UTC)</li>
  <li><strong>Source attribution</strong> — setiap entry harus jelas dari mana datanya (log mana? evidence mana?)</li>
  <li><strong>Link to evidence</strong> — kaitkan entry ke evidence yang mendukung</li>
  <li><strong>Category</strong> — klasifikasi: network, file, process, user, email</li>
  <li><strong>Be specific</strong> — "User klik link" kurang baik. "john.doe@finance klik https://evil.com/login.php dari Outlook (PID 4532)" lebih baik.</li>
</ul>

<h3>Membuat Timeline Entry</h3>
<p>Di case → tab <strong>Timeline</strong> → <strong>Add Event</strong>:</p>
<ul>
  <li><strong>Timestamp</strong> — waktu event terjadi (format: YYYY-MM-DD HH:MM:SS)</li>
  <li><strong>Title</strong> — ringkasan singkat (1 baris)</li>
  <li><strong>Description</strong> — detail lengkap</li>
  <li><strong>Category</strong> — Network / File System / Process / User Activity / Email</li>
  <li><strong>Source</strong> — dari evidence/log mana info ini didapat</li>
</ul>

<h3>Good vs Bad Timeline</h3>
<table class="ref-table">
  <thead><tr><th>❌ Bad</th><th>✅ Good</th></tr></thead>
  <tbody>
    <tr><td>"User kena phishing"</td><td>"john.doe@finance menerima email phishing dari cfo-office@company-secure.com (Subject: Urgent Wire Transfer)"</td></tr>
    <tr><td>"Malware jalan"</td><td>"invoice_update.exe (SHA256: e3b0c4...) dieksekusi oleh john.doe dari C:\\Users\\john\\Downloads\\ — PID 7824, parent: explorer.exe"</td></tr>
    <tr><td>"Data dicuri"</td><td>"Process invoice_update.exe (PID 7824) melakukan HTTP POST ke 185.234.53.108:443 — transfer 15.2 MB data dalam 3 menit"</td></tr>
  </tbody>
</table>

<h3>Contoh Timeline: Phishing Incident</h3>
<div class="code-block"><div class="code-label"><span>Timeline — Phishing Case Example</span></div><pre><code>2024-01-15 09:10:22 UTC | EMAIL    | Phishing email diterima oleh john.doe@finance
                                      From: cfo-office@company-secure.com
                                      Subject: "Urgent: Q4 Wire Transfer Approval"
                                      Source: Email gateway logs

2024-01-15 09:15:47 UTC | EMAIL    | john.doe membuka email dan klik link 
                                      URL: https://company-secure.com/login
                                      Source: Proxy logs (Squid)

2024-01-15 09:16:02 UTC | NETWORK  | john.doe workstation resolve DNS: company-secure.com → 185.234.53.108
                                      Source: DNS server logs

2024-01-15 09:16:15 UTC | USER     | john.doe submit credentials di fake login page
                                      Source: Proxy logs (POST request to /login.php)

2024-01-15 09:45:00 UTC | USER     | Attacker login ke OWA pakai john.doe credentials
                                      Source IP: 91.234.56.78 (VPN exit node, RU)
                                      Source: Exchange audit logs

2024-01-15 09:47:22 UTC | EMAIL    | Attacker forward 15 email dari john.doe inbox ke
                                      attacker@protonmail.com
                                      Source: Exchange transport logs

2024-01-15 10:30:00 UTC | USER     | SOC detect anomali: login dari geo impossible
                                      Alert: Wazuh rule 100200
                                      Source: Wazuh dashboard</code></pre></div>

<div class="callout callout-tip"><strong>Pro tip:</strong> Build timeline secara <em>iteratif</em>. Mulai dari yang kamu tau, lalu isi gap seiring investigasi. Timeline yang awalnya sparse akan jadi lengkap seiring kamu analisis lebih banyak evidence.</div>` },

    { id: 'evidence-tracking', title: 'Evidence & Notes',
      html: `
<p>Evidence management di IRIS membantu kamu track semua artefak digital yang dikumpulkan selama investigasi. Ini penting untuk <strong>chain of custody</strong> — membuktikan bahwa evidence tidak di-tamper.</p>

<h3>Tipe Evidence yang Biasa Dikumpulkan</h3>
<ul>
  <li><strong>Memory dump</strong> — RAM capture dari endpoint terinfeksi (tool: Belkasoft, WinPMEM, LiME)</li>
  <li><strong>Disk image</strong> — full disk clone (tool: FTK Imager, dd)</li>
  <li><strong>Log files</strong> — export log dari SIEM, endpoint, application</li>
  <li><strong>PCAP</strong> — network traffic capture (tool: Wireshark, tcpdump)</li>
  <li><strong>Screenshots</strong> — bukti visual dari dashboard, alert, phishing page</li>
  <li><strong>Email files</strong> — .eml atau .msg dari phishing email</li>
  <li><strong>Malware samples</strong> — file suspicious yang ditemukan (handle with care!)</li>
</ul>

<h3>Menambah Evidence</h3>
<p>Di case → tab <strong>Evidence</strong> → <strong>Add Evidence</strong>:</p>
<ul>
  <li><strong>Filename</strong> — nama file evidence</li>
  <li><strong>File size</strong> — ukuran file</li>
  <li><strong>Hash (MD5/SHA256)</strong> — untuk verifikasi integritas</li>
  <li><strong>Acquisition tool</strong> — tool apa yang dipakai untuk collect (FTK Imager, dd, tcpdump, etc)</li>
  <li><strong>Description</strong> — apa evidence ini dan dari mana diambil</li>
  <li><strong>Date acquired</strong> — kapan evidence di-collect</li>
</ul>

<div class="code-block"><div class="code-label"><span>Contoh Evidence Entry</span></div><pre><code>Filename:         WORKSTATION-PC_memdump_20240115.raw
File size:        16.2 GB
MD5:              a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
SHA256:           9f86d081884c7d659a2feaa0c55ad015...
Acquisition tool: WinPMEM 4.0
Acquired by:      Analyst Budi (analyst-budi@soc.local)
Date acquired:    2024-01-15 11:30:00 UTC
Description:      Memory dump dari workstation john.doe (WORKSTATION-PC, 
                  IP: 192.168.1.50). Diambil sebelum isolasi endpoint.
                  Endpoint masih running saat acquisition.</code></pre></div>

<h3>Notes — Catatan Analyst</h3>
<p>Notes adalah tempat kamu catat <strong>observasi dan temuan</strong> selama investigasi. Tips:</p>
<ul>
  <li>Tulis apa yang kamu temukan, dari evidence mana, dan interpretasinya</li>
  <li>Link ke IOC dan timeline entry yang relevan</li>
  <li>Include screenshots dan command output yang relevan</li>
  <li>Note siapa yang menulis dan kapan</li>
</ul>

<div class="callout callout-warn"><strong>Chain of Custody:</strong> Selalu catat <em>siapa</em> yang mengambil evidence, <em>kapan</em>, pakai <em>tool apa</em>, dan <em>hash</em>-nya. Kalau chain of custody rusak, evidence bisa dipertanyakan kredibilitasnya — terutama kalau kasus sampai ke ranah hukum.</div>` },

    { id: 'reporting', title: 'Generate Reports',
      html: `
<p>Salah satu kelebihan IRIS: kamu bisa generate <strong>laporan insiden lengkap</strong> langsung dari data case. Nggak perlu bikin report manual dari scratch.</p>

<h3>Apa yang Masuk di Report</h3>
<ul>
  <li><strong>Case Summary</strong> — overview insiden, severity, status, tim yang handle</li>
  <li><strong>Timeline</strong> — urutan kronologis event</li>
  <li><strong>IOC List</strong> — semua indicators yang ditemukan</li>
  <li><strong>Evidence List</strong> — artefak yang dikumpulkan beserta metadata</li>
  <li><strong>Analysis Notes</strong> — temuan analyst</li>
  <li><strong>Recommendations</strong> — tindakan preventif dan remediasi</li>
</ul>

<h3>Generate Report</h3>
<p>Di case → <strong>Reports</strong> → pilih template → <strong>Generate</strong>. IRIS akan compile semua data case ke dalam dokumen yang bisa di-download.</p>

<h3>Customize Report Template</h3>
<p>IRIS menggunakan template berbasis <strong>Jinja2</strong> (Python templating). Kamu bisa customize:</p>
<ul>
  <li>Logo dan branding perusahaan</li>
  <li>Section mana yang di-include/exclude</li>
  <li>Format tabel dan visualisasi</li>
  <li>Footer, disclaimer, classification marking</li>
</ul>
<p>Template files ada di admin panel → <strong>Report Templates</strong>. Upload template sendiri (format .docx dengan Jinja2 tags).</p>

<h3>Export Formats</h3>
<ul>
  <li><strong>DOCX</strong> — Word document (most common)</li>
  <li><strong>PDF</strong> — via Word → PDF conversion</li>
  <li><strong>JSON</strong> — via API export (for automation)</li>
</ul>

<div class="callout callout-tip"><strong>Pro tip:</strong> Buat template report standar untuk organisasi kamu. Include section: Executive Summary (untuk management), Technical Details (untuk tim teknis), dan Recommendations (untuk semua). Biasakan generate report untuk <em>setiap</em> case, bahkan yang kecil — ini membangun knowledge base.</div>` },

    { id: 'api-basics', title: 'IRIS API Basics',
      html: `
<p>IRIS punya REST API yang lengkap — semua yang bisa dilakukan di web UI bisa dilakukan via API. Ini berguna untuk: automation (auto-create case dari SIEM alert), integration dengan script, dan bulk operations.</p>

<h3>Setup API Key</h3>
<p>Login ke IRIS → klik avatar → <strong>My Profile</strong> → <strong>API Key</strong> → <strong>Renew</strong>. Copy API key dan simpan dengan aman.</p>

<h3>Basic API Calls</h3>

<div class="code-block"><div class="code-label"><span>Bash — List semua cases</span></div><pre><code>curl -k -X GET "https://IRIS_SERVER/manage/cases/list" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" | jq .</code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Create new case</span></div><pre><code>curl -k -X POST "https://IRIS_SERVER/manage/cases/add" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "case_name": "Suspicious Login from Unusual Location",
    "case_description": "Multiple failed logins followed by successful login from IP 91.234.56.78 (Russia). User: john.doe. Detected by Wazuh rule 100200.",
    "case_customer": 1,
    "case_soc_id": "SOC-2024-0043",
    "classification_id": 3,
    "case_severity_id": 3
  }'</code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Add IOC to case</span></div><pre><code>curl -k -X POST "https://IRIS_SERVER/case/ioc/add" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ioc_type_id": 1,
    "ioc_value": "91.234.56.78",
    "ioc_description": "Attacker source IP — VPN exit node (Russia)",
    "ioc_tlp_id": 3,
    "ioc_tags": "attacker,suspicious-login",
    "cid": 43
  }'</code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Get case timeline</span></div><pre><code>curl -k -X GET "https://IRIS_SERVER/case/timeline/list?cid=43" \\
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.data[] | {date: .event_date, title: .event_title}'</code></pre></div>

<h3>Automation Example: Auto-create Case dari Wazuh Alert</h3>
<div class="code-block"><div class="code-label"><span>Python — wazuh_to_iris.py (simplified)</span></div><pre><code>import requests
import json

IRIS_URL = "https://iris-server"
API_KEY = "YOUR_API_KEY"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_case_from_alert(alert):
    """Create IRIS case dari Wazuh alert."""
    payload = {
        "case_name": f"[Wazuh] {alert['rule']['description']}",
        "case_description": (
            f"Agent: {alert['agent']['name']}\\n"
            f"Rule ID: {alert['rule']['id']}\\n"
            f"Level: {alert['rule']['level']}\\n"
            f"Source IP: {alert.get('data', {}).get('srcip', 'N/A')}"
        ),
        "case_customer": 1,
        "case_soc_id": f"WAZUH-{alert['id']}",
        "classification_id": 3,
        "case_severity_id": 3 if alert['rule']['level'] >= 10 else 2
    }
    
    resp = requests.post(
        f"{IRIS_URL}/manage/cases/add",
        headers=HEADERS,
        json=payload,
        verify=False
    )
    return resp.json()</code></pre></div>

<div class="callout callout-info"><strong>API docs lengkap:</strong> <a href="https://docs.dfir-iris.org/operations/api/" target="_blank" style="color:var(--accent)">docs.dfir-iris.org/operations/api</a>. Semua endpoint terdokumentasi dengan contoh request/response.</div>` }
  ]
},

// ─── TheHive ───────────────────────────────────────────

'thehive-overview': {
  name: 'TheHive — Overview',
  subtitle: 'Security Incident Response Platform — alert management, case workflow, dan auto-enrichment via Cortex.',
  tags: ['tag-ticketing','tag-vps'], tagLabels: ['Ticketing','VPS Hosted'],
  parent: 'thehive',
  sections: [
    { id: 'what-is-thehive', title: 'Apa itu TheHive?',
      html: `
<p><strong>TheHive</strong> adalah Security Incident Response Platform yang dikembangkan oleh <strong>StrangeBee</strong> (sebelumnya TheHive Project). Fokus utamanya: <strong>SOC workflow dan team collaboration</strong> — dari alert masuk sampai case closed.</p>

<p>Apa yang membuat TheHive special: integrasinya dengan <strong>Cortex</strong>, engine yang bisa auto-enrich observables (IOC) pakai puluhan analyzer (VirusTotal, AbuseIPDB, Shodan, OTX, MISP, dll). Satu klik, langsung tau apakah IP itu malicious, domain itu phishing, hash itu malware.</p>

<h3>Sejarah Singkat</h3>
<ul>
  <li><strong>TheHive 3</strong> — versi legacy, masih banyak yang pakai tapi sudah deprecated</li>
  <li><strong>TheHive 4</strong> — transisi ke StrangeBee</li>
  <li><strong>TheHive 5</strong> — versi current, dikembangkan oleh StrangeBee. UI redesign, multi-tenancy, improved performance</li>
</ul>
<p><strong>Community vs Enterprise:</strong> TheHive 5 tersedia dalam versi community (free, fitur terbatas) dan enterprise (berbayar, fitur lengkap). Untuk belajar dan SOC kecil, community version sudah cukup.</p>

<h3>Core Concepts</h3>
<table class="ref-table">
  <thead><tr><th>Concept</th><th>Penjelasan</th><th>Analogi</th></tr></thead>
  <tbody>
    <tr><td><strong>Alert</strong></td><td>Notifikasi dari external source (SIEM, email, API) yang belum di-triage</td><td>Laporan masuk di meja resepsionis</td></tr>
    <tr><td><strong>Case</strong></td><td>Container investigasi — dibuat dari alert yang di-promote atau manual</td><td>Berkas perkara yang dibuka</td></tr>
    <tr><td><strong>Task</strong></td><td>Work item dalam case — assign ke analyst</td><td>Tugas-tugas dalam berkas perkara</td></tr>
    <tr><td><strong>Observable</strong></td><td>IOC — IP, domain, hash, email, URL, filename</td><td>Barang bukti</td></tr>
    <tr><td><strong>Analyzer (Cortex)</strong></td><td>Module yang auto-enrich observable — lookup ke VT, AbuseIPDB, dll</td><td>Laboratorium forensik yang analisa barang bukti</td></tr>
  </tbody>
</table>

<div class="callout callout-info"><strong>Workflow utama:</strong> Alert masuk → analyst triage (FP atau TP?) → kalau TP, promote ke Case → assign Tasks ke analyst → investigate (add Observables, run Cortex) → resolve & close Case.</div>` },

    { id: 'thehive-vs-iris', title: 'TheHive vs DFIR-IRIS',
      html: `
<p>Pertanyaan yang sering muncul: "Pilih TheHive atau IRIS?" Jawabannya: <strong>tergantung kebutuhan</strong>, dan idealnya <strong>pakai keduanya</strong>.</p>

<table class="ref-table">
  <thead><tr><th>Aspek</th><th>TheHive 🐝</th><th>DFIR-IRIS 🔍</th></tr></thead>
  <tbody>
    <tr><td><strong>Fokus</strong></td><td>SOC daily operations, alert workflow</td><td>Deep DFIR investigation & documentation</td></tr>
    <tr><td><strong>Alert integration</strong></td><td>✅ Native (Wazuh, Elasticsearch, email, MISP)</td><td>⚠️ Via API only</td></tr>
    <tr><td><strong>Auto-enrichment</strong></td><td>✅ Cortex — 100+ analyzers</td><td>⚠️ Custom scripts via API</td></tr>
    <tr><td><strong>Team collaboration</strong></td><td>✅ Excellent (real-time, task assignment)</td><td>✅ Good</td></tr>
    <tr><td><strong>Timeline reconstruction</strong></td><td>⚠️ Basic</td><td>✅ Built-in, sangat detail</td></tr>
    <tr><td><strong>Evidence chain of custody</strong></td><td>⚠️ Basic</td><td>✅ Lengkap</td></tr>
    <tr><td><strong>Forensic documentation</strong></td><td>⚠️ Terbatas</td><td>✅ Designed for this</td></tr>
    <tr><td><strong>Reporting</strong></td><td>✅ Dashboards & metrics (MTTD/MTTR)</td><td>✅ Detailed case reports</td></tr>
    <tr><td><strong>Case template</strong></td><td>✅ Pre-defined tasks per incident type</td><td>⚠️ Manual</td></tr>
    <tr><td><strong>Learning curve</strong></td><td>Moderate</td><td>Easy-moderate</td></tr>
  </tbody>
</table>

<div class="callout callout-tip"><strong>Rekomendasi deployment:</strong>
<ul>
  <li><strong>SOC kecil (1-3 orang):</strong> Pilih salah satu. TheHive kalau fokus alert triage. IRIS kalau fokus dokumentasi.</li>
  <li><strong>SOC medium-besar:</strong> Pakai <strong>TheHive untuk daily operations</strong> (alert triage, quick case, Cortex enrichment) + <strong>IRIS untuk investigasi serius</strong> (timeline detail, evidence chain, forensic report).</li>
  <li><strong>Learning:</strong> Coba keduanya! Install di Docker, mainkan, lalu tentukan mana yang cocok untuk workflow kamu.</li>
</ul></div>` },

    { id: 'resources', title: 'Resources',
      html: `
<div class="link-row">
  <a class="link-btn" href="https://docs.strangebee.com/thehive/" target="_blank">↗ TheHive 5 Docs</a>
  <a class="link-btn" href="https://github.com/TheHive-Project/TheHive" target="_blank">↗ GitHub</a>
  <a class="link-btn" href="https://docs.strangebee.com/cortex/" target="_blank">↗ Cortex Docs</a>
  <a class="link-btn" href="https://github.com/TheHive-Project/Cortex-Analyzers" target="_blank">↗ Cortex Analyzers</a>
  <a class="link-btn" href="https://strangebee.com/" target="_blank">↗ StrangeBee (Company)</a>
</div>` }
  ]
},

'thehive-setup': {
  name: 'TheHive — Setup',
  subtitle: 'Install TheHive 5 + Cortex dengan Docker, configure analyzers, user management.',
  tags: ['tag-ticketing'], tagLabels: ['Ticketing'],
  parent: 'thehive',
  sections: [
    { id: 'docker-install', title: 'Install dengan Docker',
      html: `
<p>Cara paling straightforward: deploy TheHive 5 + Elasticsearch + Cortex pakai Docker Compose. Satu command, semua jalan.</p>

<div class="callout callout-info"><strong>Minimum Requirements:</strong> 8 GB RAM (TheHive + Elasticsearch + Cortex butuh banyak memory), 4 CPU cores, 50 GB disk. OS: Ubuntu 22.04 atau CentOS 8+.</div>

<div class="playbook-step"><span class="pb-num">1</span><div class="pb-content"><strong>Siapkan Docker Compose File</strong>
<div class="code-block"><div class="code-label"><span>YAML — docker-compose.yml</span></div><pre><code>version: "3.8"
services:
  thehive:
    image: strangebee/thehive:5.3
    ports:
      - "9000:9000"
    environment:
      - JVM_OPTS=-Xms1024m -Xmx1024m
    volumes:
      - thehive_data:/etc/thehive
      - thehive_index:/opt/thp/thehive/index
      - thehive_db:/opt/thp/thehive/db
      - thehive_files:/opt/thp/thehive/files
    depends_on:
      elasticsearch:
        condition: service_healthy
    command:
      - --secret
      - "mySecretForTheHive"
      - "--cql-hostnames"
      - "cassandra"
      - "--index-backend"
      - "elasticsearch"
      - "--es-hostnames"
      - "elasticsearch"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.16
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9200"]
      interval: 10s
      timeout: 5s
      retries: 5

  cassandra:
    image: cassandra:4
    volumes:
      - cassandra_data:/var/lib/cassandra
    environment:
      - CASSANDRA_CLUSTER_NAME=TheHive

  cortex:
    image: thehiveproject/cortex:3.1.7
    ports:
      - "9001:9001"
    volumes:
      - cortex_data:/etc/cortex
    depends_on:
      elasticsearch:
        condition: service_healthy

volumes:
  thehive_data:
  thehive_index:
  thehive_db:
  thehive_files:
  es_data:
  cassandra_data:
  cortex_data:</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">2</span><div class="pb-content"><strong>Start Services</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Start semua container</span>
docker compose up -d

<span class="code-comment"># Tunggu sampai semua healthy (bisa 2-3 menit pertama kali)</span>
docker compose ps

<span class="code-comment"># Cek logs kalau ada masalah</span>
docker compose logs -f thehive
docker compose logs -f cortex</code></pre></div>
</div></div>

<div class="playbook-step"><span class="pb-num">3</span><div class="pb-content"><strong>First Login</strong>
<div class="code-block"><div class="code-label"><span>Access</span></div><pre><code>TheHive:  http://&lt;SERVER_IP&gt;:9000
          Username: admin@thehive.local
          Password: secret

Cortex:   http://&lt;SERVER_IP&gt;:9001
          <span class="code-comment"># First access → create admin account</span></code></pre></div>
<div class="callout callout-warn"><strong>Ganti password default segera!</strong> TheHive dan Cortex keduanya harus diganti dari default credentials.</div>
</div></div>` },

    { id: 'cortex-setup', title: 'Setup Cortex',
      html: `
<p><strong>Cortex</strong> adalah "otak" yang otomatis enrich observables di TheHive. Kamu submit IP/domain/hash, Cortex kirim ke VirusTotal, AbuseIPDB, Shodan, dll, dan return hasilnya ke TheHive. Satu klik, dapet insight dari 10+ sources.</p>

<h3>Initial Cortex Setup</h3>
<ol>
  <li>Akses Cortex: <code>http://SERVER_IP:9001</code></li>
  <li>First time → klik <strong>Update Database</strong> untuk load semua analyzer</li>
  <li>Create admin account (username, password, org)</li>
  <li>Login sebagai admin</li>
</ol>

<h3>Enable Analyzers</h3>
<p>Setelah login, buka <strong>Organization</strong> → <strong>Analyzers</strong>. Enable yang kamu mau:</p>

<table class="ref-table">
  <thead><tr><th>Analyzer</th><th>Fungsi</th><th>API Key Needed?</th></tr></thead>
  <tbody>
    <tr><td><strong>VirusTotal_GetReport</strong></td><td>Lookup hash, IP, domain di VirusTotal</td><td>Ya (free tier OK)</td></tr>
    <tr><td><strong>AbuseIPDB</strong></td><td>Cek reputasi IP address</td><td>Ya (free)</td></tr>
    <tr><td><strong>Shodan_Host</strong></td><td>Info tentang IP: open ports, services, vulns</td><td>Ya (free tier OK)</td></tr>
    <tr><td><strong>OTXQuery</strong></td><td>AlienVault OTX threat intel lookup</td><td>Ya (free)</td></tr>
    <tr><td><strong>MISP</strong></td><td>Lookup di MISP threat intel database</td><td>Ya (MISP instance)</td></tr>
    <tr><td><strong>MaxMind_GeoIP</strong></td><td>Geolocation IP address</td><td>Ya (free tier)</td></tr>
    <tr><td><strong>URLhaus</strong></td><td>Malicious URL lookup</td><td>Tidak</td></tr>
    <tr><td><strong>FileInfo</strong></td><td>File analysis: hash, magic, strings</td><td>Tidak</td></tr>
    <tr><td><strong>Yara</strong></td><td>Scan file dengan YARA rules</td><td>Tidak</td></tr>
  </tbody>
</table>

<h3>Configure API Keys</h3>
<p>Untuk setiap analyzer yang butuh API key:</p>
<ol>
  <li>Klik analyzer → <strong>Configure</strong></li>
  <li>Masukkan API key dari masing-masing service</li>
  <li>Set rate limit (untuk free tier, biasanya terbatas)</li>
  <li>Klik <strong>Save</strong></li>
</ol>

<div class="code-block"><div class="code-label"><span>Contoh config VirusTotal analyzer</span></div><pre><code>API Key:     a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8
Rate limit:  4 requests/minute (free tier)
Polling:     enabled
Timeout:     5 minutes</code></pre></div>

<h3>Test Analyzer</h3>
<p>Setelah enable dan configure, test:</p>
<ol>
  <li>Cortex → <strong>New Analysis</strong></li>
  <li>Pilih analyzer (misalnya VirusTotal_GetReport)</li>
  <li>Masukkan observable (misalnya IP: 8.8.8.8)</li>
  <li>Klik <strong>Analyze</strong></li>
  <li>Tunggu result → cek apakah response valid</li>
</ol>

<h3>Connect Cortex ke TheHive</h3>
<p>Di TheHive, kamu perlu point ke Cortex instance:</p>
<div class="code-block"><div class="code-label"><span>TheHive — application.conf (atau environment variable)</span></div><pre><code><span class="code-comment"># Di TheHive config</span>
play.modules.enabled += org.thp.thehive.connector.cortex.CortexModule

cortex {
  servers = [
    {
      name = "local"
      url = "http://cortex:9001"
      auth {
        type = "bearer"
        key = "CORTEX_API_KEY"  <span class="code-comment"># Generate di Cortex → user → API key</span>
      }
    }
  ]
}</code></pre></div>

<div class="callout callout-tip"><strong>Free API keys:</strong> VirusTotal, AbuseIPDB, Shodan, OTX, MaxMind — semua punya free tier. Daftar di masing-masing service dan masukkan API key ke Cortex. Ini sudah cukup powerful untuk small-medium SOC.</div>` },

    { id: 'initial-config', title: 'Konfigurasi Awal',
      html: `
<p>Setelah TheHive dan Cortex jalan, setup berikut di TheHive:</p>

<h3>1. Organization</h3>
<p>TheHive 5 support <strong>multi-tenancy</strong> — satu instance bisa serve multiple organizations. Untuk setup awal, minimal buat satu org:</p>
<p><strong>Admin Panel</strong> → <strong>Organizations</strong> → <strong>Create Organization</strong>. Isi nama dan deskripsi.</p>

<h3>2. Users & Roles</h3>
<table class="ref-table">
  <thead><tr><th>Role</th><th>Bisa Apa</th><th>Untuk Siapa</th></tr></thead>
  <tbody>
    <tr><td><strong>admin</strong></td><td>Platform administration, manage orgs & users</td><td>Platform admin</td></tr>
    <tr><td><strong>org-admin</strong></td><td>Manage users dalam org, configure templates</td><td>SOC Manager</td></tr>
    <tr><td><strong>analyst</strong></td><td>Full case operations: create, update, enrich, close</td><td>SOC Analyst L1/L2/L3</td></tr>
    <tr><td><strong>read-only</strong></td><td>View cases dan alerts, no edit</td><td>Management, auditor</td></tr>
  </tbody>
</table>
<p>Buat user: <strong>Admin Panel</strong> → <strong>Users</strong> → <strong>Add User</strong>. Assign ke organization dan role.</p>

<h3>3. Custom Fields</h3>
<p>Tambahkan custom fields yang relevan untuk organisasi kamu. Misalnya:</p>
<ul>
  <li><strong>business-unit</strong> — departemen mana yang terdampak</li>
  <li><strong>detection-source</strong> — dari tool mana alert pertama kali muncul</li>
  <li><strong>regulatory-impact</strong> — apakah ada implikasi compliance (PDP, PCI-DSS)</li>
</ul>

<h3>4. Case Templates</h3>
<p>Case template memungkinkan kamu pre-define task list untuk jenis insiden tertentu. Ini <strong>sangat berguna</strong> supaya analyst nggak lupa step-step penting.</p>

<div class="code-block"><div class="code-label"><span>Example — Phishing Case Template</span></div><pre><code>Template Name: Phishing Incident
Default Severity: Medium
Default TLP: AMBER

Pre-defined Tasks:
 1. [Triage]     Review email headers dan content
 2. [Analysis]   Extract dan analyze URLs/attachments
 3. [Scope]      Identifikasi berapa user yang terima email serupa
 4. [Contain]    Block sender, domain, URL di email gateway
 5. [Enrich]     Submit observables ke Cortex (VT, URLhaus, etc)
 6. [Credential] Cek apakah ada user yang submit credentials
 7. [Reset]      Reset password user yang compromise
 8. [Document]   Update case documentation dan timeline
 9. [Close]      Final review dan close case</code></pre></div>

<div class="callout callout-tip"><strong>Buat template untuk:</strong> Phishing, Malware Infection, Brute Force, Unauthorized Access, Data Leak, Insider Threat. Template standar memastikan semua insiden di-handle secara konsisten — apapun shift, siapapun analyst yang on-duty.</div>

<h3>5. Notification (Optional)</h3>
<p>TheHive bisa kirim notifikasi via:</p>
<ul>
  <li><strong>Email</strong> — saat case di-assign, task di-update</li>
  <li><strong>Webhook</strong> — trigger ke Slack, Teams, atau custom endpoint</li>
</ul>
<p>Setup via <strong>Admin</strong> → <strong>Notifications</strong> → add endpoint.</p>` }
  ]
},

'thehive-usage': {
  name: 'TheHive — Full Guide',
  subtitle: 'Alert workflow, case management, Cortex enrichment, reporting, dan integrasi Wazuh-TheHive.',
  tags: ['tag-ticketing','tag-vps'], tagLabels: ['Ticketing','VPS Hosted'],
  parent: 'thehive',
  sections: [
    { id: 'alert-workflow', title: 'Alert Workflow',
      html: `
<p>Di TheHive, <strong>Alert</strong> adalah entry point. Alert masuk dari berbagai sumber, analyst triage, lalu decide: promote to case (true positive) atau mark sebagai false positive.</p>

<h3>Dari Mana Alert Masuk?</h3>
<ul>
  <li><strong>SIEM (Wazuh/Splunk)</strong> — forward high-severity alert via webhook/API</li>
  <li><strong>Email</strong> — user report phishing, auto-ingest ke TheHive</li>
  <li><strong>MISP</strong> — threat intel feed yang match environment kamu</li>
  <li><strong>Manual</strong> — analyst bikin alert manual dari temuan ad-hoc</li>
  <li><strong>API</strong> — custom script/tool kirim alert via REST API</li>
</ul>

<h3>Alert Fields</h3>
<table class="ref-table">
  <thead><tr><th>Field</th><th>Deskripsi</th><th>Contoh</th></tr></thead>
  <tbody>
    <tr><td><strong>Type</strong></td><td>Sumber/kategori alert</td><td>"wazuh", "phishing_report", "ids"</td></tr>
    <tr><td><strong>Source</strong></td><td>Sistem yang generate</td><td>"Wazuh Manager", "User Report"</td></tr>
    <tr><td><strong>sourceRef</strong></td><td>ID unik dari sumber</td><td>"wazuh-alert-12345"</td></tr>
    <tr><td><strong>Title</strong></td><td>Judul alert</td><td>"SSH Brute Force from 91.234.56.78"</td></tr>
    <tr><td><strong>Description</strong></td><td>Detail alert</td><td>"5 failed SSH attempts in 60s..."</td></tr>
    <tr><td><strong>Severity</strong></td><td>1 (Low) — 4 (Critical)</td><td>3 (High)</td></tr>
    <tr><td><strong>Tags</strong></td><td>Label untuk filter</td><td>["brute-force", "ssh", "external"]</td></tr>
    <tr><td><strong>Artifacts</strong></td><td>Observable yang melekat</td><td>IP: 91.234.56.78, User: root</td></tr>
  </tbody>
</table>

<h3>Triage Alert</h3>
<p>Buka <strong>Alerts</strong> queue → klik alert → review detail → decide:</p>
<ul>
  <li><strong>🟢 Promote to Case</strong> — ini real incident, buat case untuk investigasi</li>
  <li><strong>🔴 Mark as False Positive</strong> — salah deteksi, bukan ancaman nyata</li>
  <li><strong>🟡 Import & Merge</strong> — gabungkan dengan case yang sudah ada (alert terkait insiden yang sama)</li>
  <li><strong>🔵 Ignore</strong> — bukan FP tapi nggak actionable (info only)</li>
</ul>

<h3>Bulk Operations</h3>
<p>Kalau ada banyak alert serupa (misalnya brute force dari IP yang sama), kamu bisa select multiple → <strong>Bulk Action</strong>:</p>
<ul>
  <li>Merge ke satu case</li>
  <li>Mark as FP semua</li>
  <li>Add tag ke semua</li>
</ul>

<div class="callout callout-info"><strong>Metric penting:</strong> Track <strong>MTTD</strong> (Mean Time to Detect — berapa lama dari alert masuk sampai analyst acknowledge) dan <strong>MTTR</strong> (Mean Time to Respond — berapa lama dari acknowledge sampai resolved). Target: MTTD &lt; 15 menit, MTTR tergantung severity.</div>` },

    { id: 'case-management', title: 'Case Management',
      html: `
<p>Case di TheHive adalah tempat kerja utama analyst. Setelah alert di-promote, semua investigasi terjadi di dalam case.</p>

<h3>Buat Case</h3>
<p>Ada dua cara:</p>
<ul>
  <li><strong>Dari Alert</strong> — promote alert → otomatis buat case dengan data dari alert</li>
  <li><strong>Manual</strong> — <strong>Cases</strong> → <strong>New Case</strong> → isi form manual</li>
</ul>

<h3>Case Fields</h3>
<ul>
  <li><strong>Title</strong> — judul deskriptif</li>
  <li><strong>Severity</strong> — Low / Medium / High / Critical</li>
  <li><strong>TLP</strong> — Traffic Light Protocol (siapa boleh tau)</li>
  <li><strong>PAP</strong> — Permissible Actions Protocol (apa boleh dilakukan dengan info ini)</li>
  <li><strong>Tags</strong> — categorization (phishing, malware, insider, etc)</li>
  <li><strong>Description</strong> — ringkasan insiden</li>
  <li><strong>Template</strong> — pilih case template yang sesuai (auto-populate tasks)</li>
</ul>

<h3>Task Management</h3>
<p>Tasks adalah work items dalam case. Kalau pakai template, tasks sudah pre-populated. Kalau manual, kamu bisa add task kapan saja.</p>
<div class="code-block"><div class="code-label"><span>Contoh Tasks dalam Case</span></div><pre><code>Case: "Phishing Campaign — Finance Dept"

Tasks:
 ☑ [Budi]   Review email headers dan content          → Completed
 ☑ [Budi]   Extract URLs dan submit ke VirusTotal     → Completed
 ☐ [Andi]   Identify all recipients (scope)            → In Progress
 ☐ [Sari]   Block phishing domain di email gateway     → Waiting
 ☐ [Budi]   Check credential compromise                → TODO
 ☐ [Andi]   Write incident report                      → TODO</code></pre></div>

<h3>Case Templates</h3>
<p>Template menghemat waktu dan memastikan konsistensi. Buat template untuk setiap jenis insiden yang sering terjadi:</p>
<ul>
  <li><strong>Phishing</strong> — 8-10 tasks standar</li>
  <li><strong>Malware Infection</strong> — 10-12 tasks (isolate, collect evidence, analyze, eradicate)</li>
  <li><strong>Brute Force</strong> — 6-8 tasks</li>
  <li><strong>Unauthorized Access</strong> — 8-10 tasks</li>
  <li><strong>Data Exfiltration</strong> — 12+ tasks</li>
</ul>

<h3>Merge Cases</h3>
<p>Kadang ternyata beberapa case sebenarnya bagian dari satu insiden yang sama. TheHive bisa <strong>merge cases</strong> — semua data (tasks, observables, notes) digabungkan.</p>

<div class="callout callout-tip"><strong>Case lifecycle:</strong> New → In Progress → (True Positive → Containment → Eradication → Recovery →) Resolved → Closed. Atau: New → In Progress → False Positive → Closed. Selalu tutup case dengan closing summary dan lessons learned.</div>` },

    { id: 'observables-cortex', title: 'Observables & Cortex Enrichment',
      html: `
<p>Observables adalah IOC/artefak teknis yang kamu temukan selama investigasi. TheHive + Cortex bikin proses enrichment jadi <strong>satu klik</strong>.</p>

<h3>Tipe Observable</h3>
<ul>
  <li><strong>ip</strong> — IP address (source, destination, C2)</li>
  <li><strong>domain</strong> — domain name</li>
  <li><strong>url</strong> — full URL</li>
  <li><strong>hash</strong> — MD5, SHA1, SHA256</li>
  <li><strong>mail</strong> — email address</li>
  <li><strong>filename</strong> — nama file</li>
  <li><strong>fqdn</strong> — fully qualified domain name</li>
  <li><strong>registry</strong> — Windows registry key</li>
  <li><strong>user-agent</strong> — HTTP user agent string</li>
  <li><strong>other</strong> — apapun yang nggak masuk kategori di atas</li>
</ul>

<h3>Tambah Observable</h3>
<p>Di case → tab <strong>Observables</strong> → <strong>Add Observable</strong>. Atau: TheHive otomatis extract observables dari alert artifacts saat promote.</p>

<h3>Cortex Enrichment — Satu Klik</h3>
<p>Ini yang bikin TheHive powerful:</p>
<ol>
  <li>Klik observable (misalnya IP: 185.234.53.108)</li>
  <li>Klik <strong>Analyze</strong></li>
  <li>Pilih analyzer: VirusTotal, AbuseIPDB, Shodan, OTX (atau klik <strong>Run All</strong>)</li>
  <li>Tunggu beberapa detik</li>
  <li>Result muncul: reputation score, malware detections, geolocation, open ports, whois, dll</li>
</ol>

<div class="code-block"><div class="code-label"><span>Contoh Cortex Analysis Result</span></div><pre><code>Observable: 185.234.53.108 (IP)

VirusTotal:       12/87 engines flagged as malicious
AbuseIPDB:        Confidence Score: 95% — reported 247 times
                  Categories: SSH brute force, port scan, web attack
Shodan:           Open ports: 22, 80, 443, 8080
                  OS: Ubuntu 20.04
                  ISP: DigitalOcean (NL)
MaxMind GeoIP:    Netherlands, Amsterdam
OTX:              Found in 3 pulse feeds — associated with APT campaign

<span class="code-comment">Verdict: MALICIOUS — known attack infrastructure</span></code></pre></div>

<h3>IOC Tagging & TLP</h3>
<p>Setelah enrichment, tag observable:</p>
<ul>
  <li><strong>sighted</strong> — kamu lihat di environment kamu</li>
  <li><strong>ioc</strong> — confirmed indicator of compromise</li>
  <li><strong>TLP:AMBER</strong> — share hanya dengan tim internal</li>
</ul>

<div class="callout callout-warn"><strong>Jangan auto-block semua yang "malicious" di VirusTotal.</strong> FP rate bisa tinggi. Selalu crosscheck dengan beberapa source (VT + AbuseIPDB + konteks dari investigasi). Cortex hasilnya informatif, keputusan tetap di tangan analyst.</div>` },

    { id: 'reporting-metrics', title: 'Reporting & Metrics',
      html: `
<p>TheHive punya built-in dashboard yang membantu kamu track performa SOC dan generate report untuk management.</p>

<h3>Built-in Dashboards</h3>
<ul>
  <li><strong>Open Cases</strong> — berapa case yang sedang aktif, breakdown per severity</li>
  <li><strong>Cases by Severity</strong> — distribusi: berapa Critical, High, Medium, Low</li>
  <li><strong>Cases by Status</strong> — berapa New, In Progress, Resolved, Closed</li>
  <li><strong>Analyst Workload</strong> — berapa case/task per analyst</li>
  <li><strong>MTTD</strong> (Mean Time to Detect) — rata-rata waktu dari alert masuk sampai acknowledged</li>
  <li><strong>MTTR</strong> (Mean Time to Respond) — rata-rata waktu dari acknowledged sampai resolved</li>
  <li><strong>Alert Resolution</strong> — berapa % True Positive vs False Positive</li>
</ul>

<h3>Custom Dashboards</h3>
<p>TheHive 5 support custom dashboard pakai query-based widgets. Kamu bisa buat dashboard untuk:</p>
<ul>
  <li><strong>Weekly report</strong> — alert count, case count, top IOCs, analyst activity</li>
  <li><strong>Trend analysis</strong> — apakah attack volume naik/turun</li>
  <li><strong>SLA compliance</strong> — berapa % case yang resolved within SLA</li>
</ul>

<h3>Export & Reporting</h3>
<ul>
  <li><strong>Case export</strong> — export individual case ke JSON/PDF</li>
  <li><strong>Bulk export</strong> — export multiple cases via API untuk analisis di Excel/BI tool</li>
  <li><strong>Metrics export</strong> — dump metrics ke CSV untuk reporting</li>
</ul>

<h3>Case Closure & Lessons Learned</h3>
<p>Saat close case, best practice:</p>
<ul>
  <li>Tulis <strong>closing summary</strong> — apa yang terjadi (1-2 paragraf)</li>
  <li>Categorize: True Positive / False Positive / Benign True Positive</li>
  <li>Add <strong>resolution type</strong>: Resolved, Duplicate, No Impact, Not Applicable</li>
  <li>Tulis <strong>lessons learned</strong>: apa yang bisa diperbaiki? Butuh rule baru? Butuh update playbook?</li>
</ul>

<div class="callout callout-tip"><strong>Monthly SOC report template:</strong> Total alerts received, % FP rate, total cases created, cases by type (phishing 40%, malware 25%, brute force 20%, other 15%), MTTD/MTTR trend, top 5 attacker IPs/domains, recommendations. Kirim ke management setiap bulan — ini yang bikin SOC terlihat valuable.</div>` },

    { id: 'integrations', title: 'Integrations',
      html: `
<p>TheHive jadi sangat powerful saat diintegrasikan dengan tool lain di SOC stack. Berikut integrasi yang paling common:</p>

<h3>Wazuh → TheHive (Forward Alerts)</h3>
<p>Ini integrasi paling populer: Wazuh detect threat → otomatis kirim alert ke TheHive → analyst triage di TheHive.</p>

<div class="code-block"><div class="code-label"><span>Python — wazuh_to_thehive.py (Custom Integration)</span></div><pre><code>import requests
import json
import sys

<span class="code-comment"># TheHive API config</span>
THEHIVE_URL = "http://thehive:9000"
THEHIVE_API_KEY = "YOUR_API_KEY"

def create_alert(wazuh_alert):
    """Forward Wazuh alert ke TheHive."""
    
    <span class="code-comment"># Map severity: Wazuh level → TheHive severity</span>
    level = int(wazuh_alert.get("rule", {}).get("level", 3))
    if level >= 12:
        severity = 4  <span class="code-comment"># Critical</span>
    elif level >= 10:
        severity = 3  <span class="code-comment"># High</span>
    elif level >= 7:
        severity = 2  <span class="code-comment"># Medium</span>
    else:
        severity = 1  <span class="code-comment"># Low</span>
    
    alert_data = {
        "type": "wazuh",
        "source": "Wazuh Manager",
        "sourceRef": wazuh_alert.get("id", "unknown"),
        "title": wazuh_alert["rule"]["description"],
        "description": json.dumps(wazuh_alert, indent=2),
        "severity": severity,
        "tags": ["wazuh", f"rule-{wazuh_alert['rule']['id']}"],
        "artifacts": []
    }
    
    <span class="code-comment"># Extract observables dari alert</span>
    src_ip = wazuh_alert.get("data", {}).get("srcip")
    if src_ip:
        alert_data["artifacts"].append({
            "dataType": "ip",
            "data": src_ip,
            "message": "Source IP from Wazuh alert"
        })
    
    dst_ip = wazuh_alert.get("data", {}).get("dstip")
    if dst_ip:
        alert_data["artifacts"].append({
            "dataType": "ip",
            "data": dst_ip,
            "message": "Destination IP from Wazuh alert"
        })
    
    resp = requests.post(
        f"{THEHIVE_URL}/api/v1/alert",
        headers={
            "Authorization": f"Bearer {THEHIVE_API_KEY}",
            "Content-Type": "application/json"
        },
        json=alert_data
    )
    return resp.json()</code></pre></div>

<div class="callout callout-info"><strong>Alternative:</strong> Ada juga <a href="https://github.com/wazuh/wazuh/tree/master/integrations" target="_blank" style="color:var(--accent)">Wazuh built-in TheHive integration</a> yang bisa dikonfigurasi langsung di ossec.conf manager. Tapi custom script memberi lebih banyak kontrol.</div>

<h3>MISP Integration</h3>
<p>MISP (Malware Information Sharing Platform) bisa terintegrasi dengan TheHive untuk:</p>
<ul>
  <li><strong>Import</strong> — tarik IOC dari MISP feed ke TheHive sebagai alert</li>
  <li><strong>Export</strong> — push IOC dari case TheHive ke MISP untuk sharing</li>
  <li><strong>Cortex lookup</strong> — query MISP sebagai Cortex analyzer</li>
</ul>
<p>Configure via <strong>Admin</strong> → <strong>MISP</strong> → tambah MISP server URL + API key.</p>

<h3>Slack / Microsoft Teams Notification</h3>
<div class="code-block"><div class="code-label"><span>TheHive Notification Config — Webhook</span></div><pre><code><span class="code-comment"># Di TheHive Admin → Notifications → New Notification</span>

Name: Slack SOC Channel
Type: Webhook
URL: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
Events:
  - Alert created
  - Case created
  - Case severity changed (to High/Critical)
  - Task assigned

<span class="code-comment"># Sekarang setiap kali event di atas terjadi,</span>
<span class="code-comment"># TheHive otomatis kirim notifikasi ke Slack</span></code></pre></div>

<h3>Full SOC Stack Integration</h3>
<div class="code-block"><div class="code-label"><span>Text — SOC Tool Integration Map</span></div><pre><code>  ┌──────────────┐
  │   Endpoints   │  Wazuh Agent (log + FIM + rootcheck)
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │ Wazuh Manager │  Rules → generate alert
  └──────┬───────┘
         │ API/Webhook
         ▼
  ┌──────────────┐        ┌──────────┐
  │   TheHive    │◄──────►│  Cortex  │  auto-enrich observables
  │ (SOC Ops)    │        │ VT, AIDB │
  └──────┬───────┘        └──────────┘
         │
         ├──► MISP (threat intel sharing)
         ├──► DFIR-IRIS (deep investigation)
         ├──► Slack/Teams (notifications)
         └──► SOAR (automated playbooks)</code></pre></div>

<div class="callout callout-tip"><strong>Start small:</strong> Pertama, integrate Wazuh → TheHive. Ini satu-satunya integrasi yang paling impactful. Setelah itu, baru tambahkan Cortex, MISP, Slack satu per satu. Jangan coba setup semuanya sekaligus — nanti bingung troubleshoot.</div>` }
  ]
}

});
