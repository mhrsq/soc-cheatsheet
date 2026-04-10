// ═══════════════════════════════════════════════════════
// Environment Setup: VM, WSL, VPS — Lab Setup Guides
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────
// 1. Lab Setup: Virtual Machine
// ─────────────────────────────────────────
'env-vm': {
  name: 'Lab Setup: Virtual Machine',
  subtitle: 'Setup lab environment dengan VirtualBox/VMware — dari nol sampai siap install semua SOC tools.',
  tags: ['tag-reference'],
  tagLabels: ['Getting Started'],
  sections: [

    { id: 'why-vm', title: 'Kenapa Pakai VM?', html: `
<p>Virtual Machine (VM) adalah cara <strong>paling aman dan fleksibel</strong> untuk belajar cybersecurity. Kamu menjalankan sistem operasi lengkap di dalam "komputer virtual" — terisolasi dari sistem utamamu.</p>

<div class="callout callout-tip">
<strong>Analogi:</strong> VM itu kayak <em>aquarium</em>. Kamu bisa masukin ikan (malware, exploit, tools) ke dalamnya tanpa takut ikan kabur ke ruang tamu (host OS kamu). Kalau aquarium-nya kotor? <strong>Snapshot → restore</strong> — bersih lagi dalam hitungan detik.
</div>

<h4>Kenapa VM = Best Practice untuk Lab Security?</h4>
<ul>
  <li><strong>Isolasi total</strong> — malware yang kamu analisis nggak bisa lompat ke host OS (selama network di-set benar)</li>
  <li><strong>Snapshot</strong> — save state VM kapan saja, restore kalau rusak. Ini game-changer buat belajar</li>
  <li><strong>Safe for malware analysis</strong> — bisa jalankan sample malware tanpa risiko infeksi mesin utama</li>
  <li><strong>Simulate network</strong> — buat multiple VM, hubungkan ke internal network, simulasi attacker vs defender</li>
  <li><strong>Reproducible</strong> — export VM, share ke teman/murid, semua punya environment yang sama</li>
</ul>

<h4>VirtualBox vs VMware Workstation</h4>
<table class="ref-table">
  <tr><th>Aspek</th><th>VirtualBox</th><th>VMware Workstation</th></tr>
  <tr><td><strong>Harga</strong></td><td>100% gratis (open source)</td><td>Player gratis (personal), Pro berbayar</td></tr>
  <tr><td><strong>Performa</strong></td><td>Cukup bagus, kadang ada minor lag</td><td>Lebih smooth, terutama untuk GUI-heavy OS</td></tr>
  <tr><td><strong>Snapshot</strong></td><td>Ada, tapi UI agak basic</td><td>Snapshot management lebih powerful</td></tr>
  <tr><td><strong>OS Support</strong></td><td>Windows, macOS, Linux</td><td>Windows, Linux (Fusion untuk macOS)</td></tr>
  <tr><td><strong>Networking</strong></td><td>NAT, Bridged, Host-Only, Internal</td><td>NAT, Bridged, Host-Only, Custom</td></tr>
  <tr><td><strong>Recommendation</strong></td><td>👍 Untuk pemula — gratis dan cukup powerful</td><td>👍 Untuk yang butuh performance lebih</td></tr>
</table>

<div class="callout callout-info">
<strong>Rekomendasi:</strong> Mulai dengan <strong>VirtualBox</strong>. Gratis, cross-platform, dan lebih dari cukup untuk lab SOC. Kalau nanti butuh performance lebih (misal jalankan 3+ VM sekaligus), pindah ke VMware.
</div>
`},

    { id: 'virtualbox-install', title: 'Install VirtualBox', html: `
<p>VirtualBox bisa diinstall di <strong>Windows, macOS, dan Linux</strong>. Download dari situs resmi, lalu ikuti langkah di bawah sesuai OS kamu.</p>

${osTabs([
  { id: 'win', icon: '⊞', label: 'Windows', html: `
<h4>Step 1: Download</h4>
<p>Buka <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank">virtualbox.org/wiki/Downloads</a> → klik <strong>"Windows hosts"</strong>.</p>

<h4>Step 2: Install</h4>
<ol>
  <li>Jalankan installer (.exe) yang sudah di-download</li>
  <li>Klik <strong>Next</strong> terus — default settings sudah OK</li>
  <li>Installer akan install network adapter (klik <strong>Yes</strong> kalau ada warning)</li>
  <li>Klik <strong>Install</strong> → selesai</li>
</ol>

<h4>Step 3: Enable Virtualization di BIOS</h4>
<p>Kalau pas buat VM dapat error <code>VT-x is disabled in BIOS</code>, berarti fitur virtualization di BIOS belum nyala:</p>
<div class="code-block"><div class="code-label"><span>Steps — Enable VT-x/AMD-V</span></div><pre><code>1. Restart PC → masuk BIOS (tekan F2/F10/DEL saat boot — tergantung merk)
2. Cari menu: Advanced → CPU Configuration
3. Cari "Intel Virtualization Technology" atau "AMD-V" atau "SVM Mode"
4. Set ke ENABLED
5. Save & Exit (F10)
6. Boot ke Windows → buka VirtualBox lagi</code></pre></div>

<div class="callout callout-warn">
<strong>Common Error:</strong> Kalau pakai Windows + Hyper-V aktif (Docker Desktop, WSL2), bisa bentrok dengan VirtualBox. Solusi: disable Hyper-V (<code>bcdedit /set hypervisorlaunchtype off</code>) atau pakai VirtualBox versi 7+ yang sudah support Hyper-V co-existence.
</div>
` },
  { id: 'mac', icon: '', label: 'macOS', html: `
<h4>Step 1: Download</h4>
<p>Buka <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank">virtualbox.org/wiki/Downloads</a> → klik <strong>"macOS / Intel hosts"</strong> (atau Apple Silicon kalau pakai M1/M2/M3+).</p>

<h4>Step 2: Install</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Atau via Homebrew (lebih gampang):
brew install --cask virtualbox</code></pre></div>
<ol>
  <li>Buka .dmg file → double click installer</li>
  <li>Kalau ada "System Extension Blocked" → buka <strong>System Preferences → Security & Privacy</strong> → klik <strong>Allow</strong></li>
  <li>Restart Mac jika diminta</li>
</ol>

<div class="callout callout-warn">
<strong>Apple Silicon (M1/M2/M3+):</strong> VirtualBox support untuk ARM masih beta. Alternatif yang lebih stabil: <strong>UTM</strong> (gratis, native ARM support) atau <strong>Parallels</strong> (berbayar).
</div>
` },
  { id: 'linux', icon: '🐧', label: 'Linux', html: `
<h4>Ubuntu/Debian</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Cara 1: Dari repository (mungkin bukan versi terbaru)
sudo apt update && sudo apt install -y virtualbox

# Cara 2: Download .deb dari website (versi terbaru)
# Buka virtualbox.org/wiki/Downloads → Linux distributions → Ubuntu
wget https://download.virtualbox.org/virtualbox/7.x.x/virtualbox-7.x_amd64.deb
sudo dpkg -i virtualbox-7.x_amd64.deb
sudo apt install -f  # fix dependencies kalau ada error</code></pre></div>

<h4>Fedora/RHEL</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo dnf install @development-tools kernel-headers kernel-devel
sudo dnf install VirtualBox</code></pre></div>

<div class="callout callout-info">
<strong>Verify:</strong> Setelah install, jalankan <code>vboxmanage --version</code> di terminal. Kalau keluar versi, berarti sukses.
</div>
` }
])}
`},

    { id: 'create-vm', title: 'Membuat VM Linux', html: `
<p>Sekarang kita buat VM. Rekomendasi OS:</p>

<table class="ref-table">
  <tr><th>OS</th><th>Use Case</th><th>Download</th></tr>
  <tr><td><strong>Ubuntu Server 22.04/24.04</strong></td><td>SOC tools lab (Wazuh, Splunk, Suricata) — stabil, lightweight</td><td><a href="https://ubuntu.com/download/server" target="_blank">ubuntu.com/download/server</a></td></tr>
  <tr><td><strong>Ubuntu Desktop</strong></td><td>Kalau butuh GUI (Wireshark, browser, dsb)</td><td><a href="https://ubuntu.com/download/desktop" target="_blank">ubuntu.com/download/desktop</a></td></tr>
  <tr><td><strong>Kali Linux</strong></td><td>Kalau mau belajar offensive juga (pentest + defense)</td><td><a href="https://www.kali.org/get-kali/" target="_blank">kali.org/get-kali</a></td></tr>
</table>

<div class="callout callout-tip">
<strong>Rekomendasi:</strong> Untuk SOC lab, pakai <strong>Ubuntu Server 22.04 LTS</strong>. Lebih ringan daripada Desktop, lebih stabil daripada Kali, dan semua SOC tools bisa diinstall tanpa masalah. Kalau butuh GUI (Wireshark), bisa install desktop environment nanti.
</div>

<h4>Step-by-Step Buat VM di VirtualBox</h4>

<div class="playbook-step">
  <div class="pb-num">1</div>
  <div class="pb-content">
    <strong>Download ISO</strong> — Download Ubuntu Server ISO dari link di atas. File size sekitar 1.5-2 GB.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">2</div>
  <div class="pb-content">
    <strong>Create New VM</strong> — Buka VirtualBox → klik <strong>New</strong><br>
    • Name: <code>SOC-Lab</code> (atau nama apapun)<br>
    • Type: <strong>Linux</strong><br>
    • Version: <strong>Ubuntu (64-bit)</strong><br>
    • Klik Next
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">3</div>
  <div class="pb-content">
    <strong>RAM</strong> — Minimum <strong>4 GB</strong> (4096 MB). Kalau PC kamu punya 16 GB RAM, kasih <strong>8 GB</strong> ke VM. Wazuh + Splunk = RAM hungry.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">4</div>
  <div class="pb-content">
    <strong>Hard Disk</strong> — Create a virtual hard disk now → <strong>VDI</strong> → <strong>Dynamically allocated</strong> → Size: <strong>50 GB</strong> minimum (Wazuh + Splunk butuh banyak storage). Dynamically allocated artinya file nggak langsung 50 GB — cuma grow sesuai pemakaian.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">5</div>
  <div class="pb-content">
    <strong>Mount ISO</strong> — Klik VM yang baru dibuat → <strong>Settings</strong> → <strong>Storage</strong> → klik icon CD kosong → klik icon CD di kanan → <strong>Choose a disk file</strong> → pilih ISO Ubuntu yang sudah di-download.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">6</div>
  <div class="pb-content">
    <strong>Boot & Install Ubuntu</strong> — Klik <strong>Start</strong> → VM boot dari ISO → Ikuti installer:
    <ul>
      <li>Language: English (biar error message gampang di-Google)</li>
      <li>Keyboard layout: sesuaikan</li>
      <li>Network: biarkan default (DHCP)</li>
      <li>Storage: Use entire disk → done</li>
      <li>Username: <code>analyst</code> (atau nama kamu)</li>
      <li>Password: pilih yang kuat tapi gampang diingat untuk lab</li>
      <li><strong>Install OpenSSH server: YES ✅</strong> — ini penting supaya bisa SSH dari host</li>
      <li>Featured snaps: skip semua</li>
      <li>Tunggu install selesai → Reboot</li>
    </ul>
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">7</div>
  <div class="pb-content">
    <strong>First Boot</strong> — Login dengan username/password yang tadi dibuat. Langsung update:
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt update && sudo apt upgrade -y</code></pre></div>
  </div>
</div>

<div class="callout callout-info">
<strong>Processor:</strong> Di Settings → System → Processor, kasih minimal <strong>2 CPU</strong>. Kalau host punya 8+ core, kasih 4. Ini ngaruh banget ke performa VM.
</div>
`},

    { id: 'post-install', title: 'Setup Setelah Install', html: `
<p>VM sudah jalan, Ubuntu sudah terinstall. Sekarang kita setup environment supaya siap install SOC tools.</p>

<h4>1. Update System</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt update && sudo apt upgrade -y</code></pre></div>

<h4>2. Install Essential Packages</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt install -y git curl wget python3 python3-pip net-tools \\
  build-essential unzip jq htop vim tmux software-properties-common</code></pre></div>
<p class="code-comment">Ini semua tools dasar yang bakal dibutuhin: git untuk clone repo, curl/wget untuk download, python3 untuk scripting, net-tools untuk <code>ifconfig</code>/<code>netstat</code>, build-essential untuk compile dari source.</p>

<h4>3. Install Docker</h4>
<p>Banyak SOC tools (Wazuh, DFIR-IRIS, TheHive) paling gampang di-deploy pakai Docker:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Install Docker via convenience script
curl -fsSL https://get.docker.com | sh

# Supaya bisa jalankan docker tanpa sudo
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version</code></pre></div>

<div class="callout callout-warn">
<strong>Penting:</strong> Setelah <code>usermod -aG docker</code>, kamu harus <strong>logout lalu login lagi</strong> (atau restart VM) supaya group membership aktif. Kalau nggak, <code>docker ps</code> bakal error permission denied.
</div>

<h4>4. SSH Access dari Host</h4>
<p>Supaya bisa SSH ke VM dari terminal host (lebih nyaman daripada console VirtualBox):</p>
<div class="code-block"><div class="code-label"><span>Bash — VirtualBox Port Forwarding (di host)</span></div><pre><code># Option A: Port Forwarding (NAT mode)
# VirtualBox → VM Settings → Network → Adapter 1 (NAT) → 
#   Advanced → Port Forwarding → Add rule:
#   Name: SSH | Protocol: TCP | Host Port: 2222 | Guest Port: 22
#
# Lalu dari host:
ssh analyst@127.0.0.1 -p 2222

# Option B: Bridged Network
# VirtualBox → VM Settings → Network → Attached to: Bridged Adapter
# VM akan dapat IP dari router — cek dengan: ip addr show
# Lalu dari host:
ssh analyst@VM_IP_ADDRESS</code></pre></div>

<h4>5. VirtualBox Guest Additions</h4>
<p>Untuk clipboard sharing (copy-paste antara host ↔ VM), drag-and-drop files, dan auto-resize display:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Install dependencies
sudo apt install -y dkms build-essential linux-headers-$(uname -r)

# Mount Guest Additions CD:
# VirtualBox menu → Devices → Insert Guest Additions CD Image
sudo mount /dev/cdrom /mnt
sudo /mnt/VBoxLinuxAdditions.run
sudo reboot

# Setelah reboot, enable di VirtualBox:
# Devices → Shared Clipboard → Bidirectional
# Devices → Drag and Drop → Bidirectional</code></pre></div>

<h4>6. TAKE SNAPSHOT NOW 📸</h4>
<div class="callout callout-tip">
<strong>Ini crucial!</strong> Setelah semua setup di atas selesai, ambil snapshot: VirtualBox → Machine → <strong>Take Snapshot</strong> → beri nama <strong>"Clean Base"</strong>. Ini jadi restore point kamu. Kapanpun VM rusak atau kacau, tinggal restore ke snapshot ini — 30 detik beres.
</div>
`},

    { id: 'network-config', title: 'Konfigurasi Network VM', html: `
<p>Networking VM itu sering bikin bingung. Ini penjelasan tiap mode dan kapan pakainya:</p>

<table class="ref-table">
  <tr><th>Mode</th><th>Internet?</th><th>Host → VM?</th><th>VM → Host?</th><th>VM ↔ VM?</th><th>Use Case</th></tr>
  <tr><td><strong>NAT</strong></td><td>✅ Ya</td><td>❌ (butuh port forward)</td><td>✅ Ya</td><td>❌ Tidak</td><td>Default. Internet access, cukup untuk install tools.</td></tr>
  <tr><td><strong>Bridged</strong></td><td>✅ Ya</td><td>✅ Ya</td><td>✅ Ya</td><td>✅ Ya</td><td>VM jadi "device" di network yang sama. Visible di network.</td></tr>
  <tr><td><strong>Host-Only</strong></td><td>❌ Tidak</td><td>✅ Ya</td><td>✅ Ya</td><td>✅ Ya</td><td>Isolated lab. VM bisa komunikasi satu sama lain dan host.</td></tr>
  <tr><td><strong>Internal Network</strong></td><td>❌ Tidak</td><td>❌ Tidak</td><td>❌ Tidak</td><td>✅ Ya</td><td>VM ↔ VM only. Fully isolated. Malware analysis sandbox.</td></tr>
</table>

<h4>Rekomendasi Setup Lab</h4>
<div class="code-block"><div class="code-label"><span>Text — Recommended Network Setup</span></div><pre><code>VM "SOC-Lab"
├── Adapter 1: NAT          → Untuk internet access (download tools, update)
└── Adapter 2: Host-Only    → Untuk komunikasi host ↔ VM dan VM ↔ VM

Setup:
1. VirtualBox → File → Host Network Manager → Create (vboxnet0)
   - IP: 192.168.56.1/24, DHCP enabled
2. VM Settings → Network:
   - Adapter 1: NAT (sudah default)
   - Adapter 2: Enable → Host-Only Adapter → vboxnet0</code></pre></div>

<p>Dengan setup ini, VM punya <strong>2 interface</strong>:</p>
<ul>
  <li><code>enp0s3</code> (NAT) — IP otomatis, untuk internet</li>
  <li><code>enp0s8</code> (Host-Only) — IP 192.168.56.x, untuk lab communication</li>
</ul>

<div class="code-block"><div class="code-label"><span>Bash — Cek IP di VM</span></div><pre><code>ip addr show
# enp0s3: 10.0.2.15 (NAT - internet)
# enp0s8: 192.168.56.101 (Host-Only - lab)

# Dari host, SSH ke VM via Host-Only IP:
ssh analyst@192.168.56.101</code></pre></div>

<div class="callout callout-tip">
<strong>Pro tip:</strong> Kalau bikin multi-VM lab (misalnya: 1 VM Wazuh Manager + 1 VM sebagai target), kedua VM pakai Host-Only adapter di network yang sama. Mereka bisa komunikasi tanpa internet exposure.
</div>
`},

    { id: 'vmware-alt', title: 'VMware Workstation (Alternative)', html: `
<p>Kalau kamu prefer VMware daripada VirtualBox, prosesnya mirip. Berikut perbedaannya:</p>

<h4>Download & Install</h4>
<ul>
  <li><strong>VMware Workstation Player</strong> — gratis untuk personal use: <a href="https://www.vmware.com/products/workstation-player.html" target="_blank">vmware.com</a></li>
  <li><strong>VMware Workstation Pro</strong> — berbayar, tapi sekarang gratis untuk personal use juga (sejak 2024)</li>
</ul>

<h4>Create VM — Sama Aja</h4>
<div class="code-block"><div class="code-label"><span>Text — VMware VM Setup</span></div><pre><code>1. File → New Virtual Machine → Typical
2. Installer disc image: pilih Ubuntu ISO
3. Easy Install: masukkan username/password (VMware auto-install Ubuntu)
4. VM name: SOC-Lab
5. Disk: 50 GB, Split into multiple files
6. Customize: RAM 4-8 GB, CPU 2-4 cores
7. Finish → Power On</code></pre></div>

<h4>VMware Pros vs Cons</h4>
<table class="ref-table">
  <tr><th>Pro</th><th>Con</th></tr>
  <tr><td>Performa lebih baik (terutama disk I/O)</td><td>Workstation Pro dulu berbayar (sekarang free personal)</td></tr>
  <tr><td>Snapshot management lebih intuitif</td><td>Nggak open source</td></tr>
  <tr><td>"Easy Install" auto-install OS</td><td>Networking setup sedikit lebih kompleks</td></tr>
  <tr><td>VMware Tools > Guest Additions (lebih stabil)</td><td>Kalau pakai Player, fitur terbatas</td></tr>
</table>

<div class="callout callout-info">
<strong>Bottom line:</strong> Untuk belajar, VirtualBox dan VMware sama-sama bagus. Pilih salah satu, commit, jangan buang waktu debat. Yang penting VM-nya jalan dan kamu bisa mulai belajar.
</div>
`},

    { id: 'tools-ready', title: 'Tools yang Bisa Diinstall', html: `
<p>Setelah VM setup selesai, ini semua SOC tools yang bisa langsung kamu install di environment ini:</p>

<table class="ref-table">
  <tr><th>Tool</th><th>Kategori</th><th>Install Method</th><th>RAM Needed</th><th>Guide</th></tr>
  <tr><td><strong>Wazuh (All-in-one)</strong></td><td>SIEM + EDR</td><td>Docker / Script</td><td>4 GB+</td><td>Lihat halaman Wazuh</td></tr>
  <tr><td><strong>Wazuh Agent</strong></td><td>EDR</td><td>apt/yum</td><td>128 MB</td><td>Lihat halaman Wazuh Agent</td></tr>
  <tr><td><strong>Splunk</strong></td><td>SIEM</td><td>Docker / .deb</td><td>4 GB+</td><td>Lihat halaman Splunk</td></tr>
  <tr><td><strong>Suricata</strong></td><td>IDS/IPS</td><td>apt / PPA</td><td>1 GB</td><td>Lihat halaman Suricata</td></tr>
  <tr><td><strong>Wireshark</strong></td><td>Forensics</td><td>apt</td><td>512 MB</td><td>Lihat halaman Wireshark</td></tr>
  <tr><td><strong>tcpdump</strong></td><td>Forensics</td><td>apt</td><td>Minimal</td><td>Lihat halaman tcpdump</td></tr>
  <tr><td><strong>Volatility 3</strong></td><td>Memory Forensics</td><td>pip / git clone</td><td>2 GB+</td><td>Lihat halaman Volatility</td></tr>
  <tr><td><strong>Autopsy</strong></td><td>Disk Forensics</td><td>apt (Linux) / installer (Win)</td><td>2 GB</td><td>Lihat halaman Autopsy</td></tr>
  <tr><td><strong>DFIR-IRIS</strong></td><td>Case Management</td><td>Docker</td><td>2 GB</td><td>Lihat halaman DFIR-IRIS</td></tr>
  <tr><td><strong>TheHive</strong></td><td>Case Management</td><td>Docker</td><td>2 GB</td><td>Lihat halaman TheHive</td></tr>
  <tr><td><strong>strings, md5sum, sha256sum</strong></td><td>Misc Forensics</td><td>Pre-installed / apt</td><td>Minimal</td><td>Lihat halaman strings & hash</td></tr>
</table>

<div class="callout callout-warn">
<strong>Resource Planning:</strong> Kalau mau jalankan Wazuh + Splunk + IRIS sekaligus, kamu butuh VM dengan minimal <strong>8 GB RAM dan 4 CPU</strong>. Kalau PC kamu cuma punya 8 GB RAM total, jalankan satu tools berat aja per session. Atau, buat beberapa VM terpisah.
</div>

<div class="callout callout-tip">
<strong>Quick Start Path:</strong><br>
1️⃣ Setup VM (halaman ini) → 2️⃣ Install Wazuh (SIEM) → 3️⃣ Install Wazuh Agent (EDR) → 4️⃣ Explore alerts & investigate → 5️⃣ Practice di lab platforms (BTLO, LetsDefend)
</div>
`}

  ]
},

// ─────────────────────────────────────────
// 2. Lab Setup: WSL (Windows Subsystem for Linux)
// ─────────────────────────────────────────
'env-wsl': {
  name: 'Lab Setup: WSL (Windows Subsystem for Linux)',
  subtitle: 'Jalankan Linux tools langsung di Windows tanpa VM — cepat, ringan, tapi ada limitasi.',
  tags: ['tag-reference'],
  tagLabels: ['Getting Started'],
  sections: [

    { id: 'why-wsl', title: 'Kenapa WSL?', html: `
<p><strong>Windows Subsystem for Linux (WSL)</strong> memungkinkan kamu menjalankan Linux environment <em>langsung di dalam Windows</em> — tanpa VM, tanpa dual boot, tanpa overhead berat.</p>

<div class="callout callout-tip">
<strong>Analogi:</strong> Kalau VM itu kayak bangun rumah baru (OS lengkap), WSL itu kayak <em>nambah kamar</em> di rumah yang sudah ada. Lebih cepat, lebih ringan, tapi ada batasan — kamu nggak bisa renovasi fondasi rumah (kernel-level stuff).
</div>

<h4>WSL2 vs WSL1</h4>
<table class="ref-table">
  <tr><th>Aspek</th><th>WSL1</th><th>WSL2 ✅</th></tr>
  <tr><td><strong>Kernel</strong></td><td>Translation layer (bukan real Linux kernel)</td><td>Full Linux kernel (real deal)</td></tr>
  <tr><td><strong>Performance</strong></td><td>Fast file I/O di Windows filesystem</td><td>Much faster untuk Linux-native operations</td></tr>
  <tr><td><strong>Docker</strong></td><td>❌ Tidak support</td><td>✅ Full Docker support</td></tr>
  <tr><td><strong>Systemd</strong></td><td>❌</td><td>✅ (dengan config)</td></tr>
  <tr><td><strong>GUI Apps</strong></td><td>Butuh X Server external</td><td>WSLg built-in (Windows 11)</td></tr>
  <tr><td><strong>Recommendation</strong></td><td>—</td><td>👍 <strong>Selalu pakai WSL2</strong></td></tr>
</table>

<h4>Kelebihan WSL untuk Lab</h4>
<ul>
  <li><strong>Zero overhead</strong> — boot dalam 1-2 detik, nggak perlu allocate RAM/CPU terpisah</li>
  <li><strong>Native Windows integration</strong> — akses file Windows dari Linux (<code>/mnt/c/</code>) dan sebaliknya</li>
  <li><strong>Docker Desktop integration</strong> — Docker containers jalan di WSL2 backend</li>
  <li><strong>VS Code integration</strong> — <code>code .</code> dari WSL langsung buka VS Code</li>
</ul>

<div class="callout callout-warn">
<strong>Limitasi penting:</strong> WSL <strong>bukan VM</strong>. Ada beberapa hal yang nggak bisa/sulit dilakukan — lihat section "Limitasi WSL" di bawah sebelum memutuskan.
</div>
`},

    { id: 'install-wsl', title: 'Install WSL2', html: `
<p>Install WSL2 di Windows 10 (build 2004+) atau Windows 11. Butuh <strong>PowerShell as Administrator</strong>.</p>

<h4>Cara Cepat (Recommended)</h4>
<div class="code-block"><div class="code-label"><span>PowerShell (Admin)</span></div><pre><code># Satu command install WSL2 + Ubuntu (default)
wsl --install

# Restart Windows setelah selesai
# Setelah restart, Ubuntu window otomatis terbuka
# Set username & password untuk Linux</code></pre></div>

<div class="callout callout-info">
<strong>Itu aja.</strong> Satu command. WSL2 + Ubuntu langsung terinstall. Setelah restart, tinggal set username/password dan siap pakai.
</div>

<h4>Kalau <code>wsl --install</code> Gagal — Manual Steps</h4>
<div class="code-block"><div class="code-label"><span>PowerShell (Admin) — Manual Install</span></div><pre><code># Step 1: Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Step 2: Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Step 3: Restart Windows
Restart-Computer

# Step 4: Download & install WSL2 kernel update
# Download dari: https://aka.ms/wsl2kernel
# Jalankan installer .msi

# Step 5: Set WSL2 as default
wsl --set-default-version 2

# Step 6: Install Ubuntu dari Microsoft Store
# Atau via command:
wsl --install -d Ubuntu-22.04</code></pre></div>

<h4>Verify Installation</h4>
<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code># Cek installed distros
wsl --list --verbose

#   NAME            STATE           VERSION
# * Ubuntu-22.04    Running         2        ← WSL2 ✅

# Masuk ke WSL
wsl

# Cek kernel version (harus Linux kernel, bukan translation)
uname -r
# Output: 5.15.xxx-microsoft-standard-WSL2</code></pre></div>
`},

    { id: 'setup', title: 'Setup Environment', html: `
<p>Setelah WSL2 terinstall, setup environment-nya sama kayak VM:</p>

<h4>1. Update System</h4>
<div class="code-block"><div class="code-label"><span>Bash (di WSL)</span></div><pre><code>sudo apt update && sudo apt upgrade -y</code></pre></div>

<h4>2. Install Essential Packages</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt install -y git curl wget python3 python3-pip net-tools \\
  build-essential unzip jq htop vim tmux software-properties-common</code></pre></div>

<h4>3. Docker Setup</h4>
<p>Untuk Docker di WSL, ada 2 cara:</p>
<div class="code-block"><div class="code-label"><span>Bash — Option A: Docker Desktop (Recommended untuk Windows)</span></div><pre><code># 1. Download & install Docker Desktop for Windows
#    https://www.docker.com/products/docker-desktop
# 2. Buka Docker Desktop → Settings → Resources → WSL Integration
# 3. Enable integration untuk distro Ubuntu kamu
# 4. Test di WSL:
docker --version
docker run hello-world</code></pre></div>

<div class="code-block"><div class="code-label"><span>Bash — Option B: Docker Engine langsung di WSL</span></div><pre><code># Install Docker di WSL (tanpa Docker Desktop)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Enable Docker service (perlu systemd)
# Edit /etc/wsl.conf:
sudo tee /etc/wsl.conf << 'EOF'
[boot]
systemd=true
EOF

# Restart WSL dari PowerShell:
# wsl --shutdown
# Lalu buka WSL lagi

sudo systemctl start docker
sudo systemctl enable docker</code></pre></div>

<h4>4. Enable Systemd (Penting!)</h4>
<p>Banyak SOC tools butuh systemd (Wazuh, Suricata). WSL2 sekarang support systemd:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Cek apakah systemd sudah aktif
ps -p 1 -o comm=
# Kalau output: systemd → sudah aktif ✅
# Kalau output: init → belum aktif

# Aktifkan systemd:
sudo tee /etc/wsl.conf << 'EOF'
[boot]
systemd=true
EOF

# Dari PowerShell: wsl --shutdown
# Buka WSL lagi, cek ulang</code></pre></div>
`},

    { id: 'gui-apps', title: 'GUI Apps di WSL', html: `
<p>Beberapa tools forensics butuh GUI (Wireshark, Autopsy). Begini caranya jalankan GUI apps dari WSL.</p>

<h4>Windows 11 — WSLg (Built-in)</h4>
<p>Windows 11 punya <strong>WSLg</strong> — GUI apps WSL otomatis muncul sebagai window di Windows. Nggak perlu setup apa-apa.</p>
<div class="code-block"><div class="code-label"><span>Bash — Test GUI di WSL (Windows 11)</span></div><pre><code># Install Wireshark
sudo apt install -y wireshark
# Pilih "Yes" untuk allow non-root users to capture packets

# Jalankan — window Wireshark muncul di Windows!
wireshark &</code></pre></div>

<h4>Windows 10 — Butuh X Server</h4>
<div class="code-block"><div class="code-label"><span>Setup X Server untuk Windows 10</span></div><pre><code># 1. Download & install VcXsrv (gratis):
#    https://sourceforge.net/projects/vcxsrv/
#
# 2. Jalankan VcXsrv dengan settings:
#    - Multiple windows
#    - Start no client
#    - Disable access control ✅
#
# 3. Di WSL, set DISPLAY variable:
echo 'export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk "{print \\$2}"):0' >> ~/.bashrc
source ~/.bashrc

# 4. Test
sudo apt install -y x11-apps
xclock   # Kalau muncul jam → berhasil!

# 5. Install & run Wireshark
sudo apt install -y wireshark
wireshark &</code></pre></div>

<div class="callout callout-tip">
<strong>Alternative X Server:</strong> Kalau VcXsrv ribet, coba <strong>X410</strong> (berbayar tapi smooth) atau <strong>MobaXterm</strong> (gratis, built-in X server).
</div>
`},

    { id: 'limitations', title: 'Limitasi WSL', html: `
<p>WSL powerful, tapi <strong>bukan pengganti VM</strong> untuk semua use case. Ini yang perlu kamu tahu:</p>

<h4>❌ Yang TIDAK Bisa / Sulit di WSL</h4>
<table class="ref-table">
  <tr><th>Feature</th><th>Status</th><th>Penjelasan</th></tr>
  <tr><td><strong>Kernel modules (LiME)</strong></td><td>❌ Tidak bisa</td><td>WSL pakai Microsoft-maintained kernel. Nggak bisa load custom module untuk memory dumping.</td></tr>
  <tr><td><strong>Suricata IPS mode (inline)</strong></td><td>❌ Tidak bisa</td><td>IPS butuh netfilter/iptables NFQUEUE — nggak available di WSL.</td></tr>
  <tr><td><strong>Raw network capture (full)</strong></td><td>⚠️ Terbatas</td><td>tcpdump bisa capture di WSL interface, tapi nggak bisa capture host Windows traffic.</td></tr>
  <tr><td><strong>Snapshot / restore</strong></td><td>⚠️ Manual</td><td>Bisa export/import distro (<code>wsl --export</code>), tapi nggak se-instant snapshot VM.</td></tr>
  <tr><td><strong>Network isolation</strong></td><td>❌ Terbatas</td><td>WSL share network stack dengan host. Nggak bisa buat isolated network lab seperti VM.</td></tr>
</table>

<h4>✅ Yang BISA Jalan di WSL</h4>
<table class="ref-table">
  <tr><th>Tool</th><th>Status</th><th>Notes</th></tr>
  <tr><td><strong>Wazuh Manager</strong></td><td>✅ (Docker)</td><td>Jalankan via Docker. Butuh systemd enabled.</td></tr>
  <tr><td><strong>Wazuh Agent</strong></td><td>✅</td><td>Install langsung, monitor WSL environment.</td></tr>
  <tr><td><strong>Splunk</strong></td><td>✅ (Docker)</td><td>Jalankan via Docker container.</td></tr>
  <tr><td><strong>Suricata (IDS mode)</strong></td><td>✅</td><td>Detection only (bukan IPS inline).</td></tr>
  <tr><td><strong>Wireshark</strong></td><td>✅</td><td>GUI via WSLg (Win11) atau X Server (Win10).</td></tr>
  <tr><td><strong>tcpdump</strong></td><td>✅</td><td>Capture di WSL interface.</td></tr>
  <tr><td><strong>Volatility 3</strong></td><td>✅</td><td>Analyze memory dumps. Tapi nggak bisa bikin dump dari WSL sendiri.</td></tr>
  <tr><td><strong>Autopsy</strong></td><td>⚠️</td><td>CLI tools jalan, GUI butuh X Server/WSLg. Bisa juga pakai versi Windows native.</td></tr>
  <tr><td><strong>DFIR-IRIS</strong></td><td>✅ (Docker)</td><td>Docker container, accessible via browser.</td></tr>
  <tr><td><strong>TheHive</strong></td><td>✅ (Docker)</td><td>Docker container.</td></tr>
  <tr><td><strong>strings, hash, CyberChef</strong></td><td>✅</td><td>Semua jalan tanpa masalah.</td></tr>
  <tr><td><strong>Python tools</strong></td><td>✅</td><td>pip install apapun — semua works.</td></tr>
</table>

<div class="callout callout-info">
<strong>Verdict:</strong> WSL cocok untuk <strong>daily SOC work</strong> (analisis log, scripting, Docker-based tools). Untuk <strong>advanced lab</strong> (network simulation, malware analysis, memory forensics), tetap butuh VM.
</div>
`},

    { id: 'tools-ready', title: 'Tools Checklist', html: `
<p>Summary tools yang bisa diinstall di WSL — dengan catatan khusus:</p>

<table class="ref-table">
  <tr><th>Tool</th><th>WSL Status</th><th>Install Command</th></tr>
  <tr><td>Wazuh (Docker)</td><td>✅ Works</td><td><code>docker compose up -d</code> (lihat guide Wazuh)</td></tr>
  <tr><td>Splunk (Docker)</td><td>✅ Works</td><td><code>docker run -d -p 8000:8000 splunk/splunk</code></td></tr>
  <tr><td>Suricata</td><td>✅ IDS only</td><td><code>sudo apt install -y suricata</code></td></tr>
  <tr><td>Wireshark</td><td>✅ GUI</td><td><code>sudo apt install -y wireshark</code></td></tr>
  <tr><td>tcpdump</td><td>✅</td><td><code>sudo apt install -y tcpdump</code></td></tr>
  <tr><td>Volatility 3</td><td>✅ Analyze only</td><td><code>pip3 install volatility3</code></td></tr>
  <tr><td>DFIR-IRIS</td><td>✅ Docker</td><td>Lihat guide DFIR-IRIS</td></tr>
  <tr><td>TheHive</td><td>✅ Docker</td><td>Lihat guide TheHive</td></tr>
  <tr><td>strings / hash</td><td>✅</td><td>Pre-installed / <code>sudo apt install binutils</code></td></tr>
</table>

<div class="callout callout-tip">
<strong>Best practice:</strong> Pakai WSL sebagai <strong>daily driver</strong> untuk scripting, log analysis, dan Docker-based tools. Pakai <strong>VM</strong> untuk advanced lab (network sim, malware sandbox). Bisa pakai keduanya sekaligus — nggak harus pilih satu.
</div>
`}

  ]
},

// ─────────────────────────────────────────
// 3. Lab Setup: VPS (Cloud)
// ─────────────────────────────────────────
'env-vps': {
  name: 'Lab Setup: VPS (Cloud)',
  subtitle: 'Setup lab di cloud — akses dari mana saja, always-on, bisa share dengan tim.',
  tags: ['tag-reference'],
  tagLabels: ['Getting Started'],
  sections: [

    { id: 'why-vps', title: 'Kenapa VPS?', html: `
<p><strong>VPS (Virtual Private Server)</strong> adalah server Linux di cloud yang kamu kontrol penuh via SSH. Untuk lab SOC, VPS punya beberapa keunggulan yang nggak ada di VM lokal.</p>

<h4>Kapan Pakai VPS?</h4>
<ul>
  <li><strong>Access dari mana saja</strong> — tinggal SSH dari laptop/HP/warnet/kantor</li>
  <li><strong>Always-on</strong> — Wazuh dan SIEM jalan 24/7, collect log terus tanpa matikan PC</li>
  <li><strong>Share dengan tim</strong> — buat shared lab untuk kelas/tim, semua bisa akses</li>
  <li><strong>Powerful specs</strong> — butuh 16 GB RAM untuk Wazuh + Splunk? Cloud bisa</li>
  <li><strong>Deploy SIEM/ticketing yang berat</strong> — Wazuh Manager, DFIR-IRIS, TheHive — semua jalan lancar</li>
</ul>

<h4>Providers & Budget</h4>
<table class="ref-table">
  <tr><th>Provider</th><th>Starting Price</th><th>Notes</th></tr>
  <tr><td><strong>DigitalOcean</strong></td><td>$6/mo (1 vCPU, 1GB)</td><td>UI bagus, docs lengkap, cocok pemula</td></tr>
  <tr><td><strong>Vultr</strong></td><td>$6/mo</td><td>Banyak lokasi, performa bagus</td></tr>
  <tr><td><strong>Linode (Akamai)</strong></td><td>$5/mo</td><td>Stabil, harga kompetitif</td></tr>
  <tr><td><strong>OVH</strong></td><td>€3.50/mo</td><td>Paling murah untuk specs tinggi (EU-based)</td></tr>
  <tr><td><strong>AWS EC2</strong></td><td>Free tier 1 tahun</td><td>t2.micro gratis, tapi terbatas. Hati-hati billing.</td></tr>
  <tr><td><strong>Hetzner</strong></td><td>€3.79/mo</td><td>Best value — specs tinggi, harga murah (EU)</td></tr>
</table>

<div class="callout callout-info">
<strong>Budget guide:</strong><br>
• <strong>Basic lab</strong> (learn tools): 2 vCPU, 4 GB RAM → ~$12-20/mo<br>
• <strong>Full SOC lab</strong> (Wazuh + Splunk + IRIS): 4 vCPU, 8 GB RAM → ~$24-48/mo<br>
• <strong>Shared class lab</strong>: 8 vCPU, 16 GB RAM → ~$48-96/mo
</div>
`},

    { id: 'create-vps', title: 'Membuat VPS', html: `
<p>Prosesnya mirip di semua provider. Kita pakai <strong>generic steps</strong> yang applicable di mana saja:</p>

<div class="playbook-step">
  <div class="pb-num">1</div>
  <div class="pb-content">
    <strong>Sign Up</strong> — Buat akun di provider pilihan. Biasanya butuh credit card atau PayPal.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">2</div>
  <div class="pb-content">
    <strong>Create VPS / Droplet / Instance</strong><br>
    • OS: <strong>Ubuntu 22.04 LTS</strong> atau <strong>24.04 LTS</strong><br>
    • Plan: minimum <strong>2 vCPU, 4 GB RAM</strong> untuk basic (8 GB kalau mau Wazuh)<br>
    • Region: pilih yang paling dekat dengan lokasi kamu<br>
    • Authentication: pilih <strong>SSH Key</strong> (recommended) atau password
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">3</div>
  <div class="pb-content">
    <strong>Setup SSH Key (Kalau belum punya)</strong>
<div class="code-block"><div class="code-label"><span>Bash — Generate SSH Key di lokal PC</span></div><pre><code># Generate key pair
ssh-keygen -t ed25519 -C "soc-lab"
# Tekan Enter untuk default path (~/.ssh/id_ed25519)
# Set passphrase (optional tapi recommended)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy output → paste ke form "Add SSH Key" di provider</code></pre></div>
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">4</div>
  <div class="pb-content">
    <strong>Connect via SSH</strong>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Setelah VPS created, kamu dapat IP address (contoh: 203.0.113.50)
ssh root@203.0.113.50

# Kalau pakai password:
ssh root@203.0.113.50
# Masukkan password yang di-set saat create VPS</code></pre></div>
  </div>
</div>

<div class="callout callout-warn">
<strong>JANGAN LANGSUNG INSTALL TOOLS!</strong> VPS ini exposed ke internet. Step selanjutnya (<strong>Securing VPS</strong>) itu <strong>WAJIB</strong> dilakukan dulu sebelum install apapun.
</div>
`},

    { id: 'secure-vps', title: 'Securing VPS — WAJIB!', html: `
<div class="callout callout-warn">
<strong>⚠️ Ini section paling penting di halaman ini.</strong> VPS kamu exposed langsung ke internet. Tanpa security hardening, server akan di-scan dan di-brute-force dalam <strong>hitungan menit</strong> setelah dibuat. Bukan hiperbola — cek <code>/var/log/auth.log</code> setelah 1 jam, kamu akan lihat ratusan failed SSH login attempts.
</div>

<h4>Step 1: Change Root Password</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>passwd
# Masukkan password baru yang KUAT (min 16 karakter, mix huruf/angka/simbol)</code></pre></div>

<h4>Step 2: Create Non-Root User</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Buat user baru
adduser analyst
# Isi password dan info (bisa skip info dengan Enter)

# Kasih sudo privileges
usermod -aG sudo analyst

# Test login sebagai user baru (buka terminal baru)
ssh analyst@YOUR_VPS_IP</code></pre></div>

<h4>Step 3: Setup SSH Key Authentication</h4>
<div class="code-block"><div class="code-label"><span>Bash — Di VPS, sebagai user 'analyst'</span></div><pre><code># Buat .ssh directory
mkdir -p ~/.ssh && chmod 700 ~/.ssh

# Copy public key dari PC kamu ke VPS:
# Dari PC lokal (bukan VPS):
# ssh-copy-id analyst@YOUR_VPS_IP
#
# Atau manual — dari PC lokal:
# cat ~/.ssh/id_ed25519.pub | ssh analyst@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"

# Set permission
chmod 600 ~/.ssh/authorized_keys</code></pre></div>

<h4>Step 4: Disable Password Login</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Edit SSH config
sudo nano /etc/ssh/sshd_config

# Ubah/tambahkan baris berikut:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd</code></pre></div>

<div class="callout callout-warn">
<strong>PASTIKAN</strong> kamu sudah test login SSH key <strong>SEBELUM</strong> disable password! Kalau belum dan kamu disable password, kamu <strong>terkunci di luar server</strong>. Test dulu di terminal baru: <code>ssh analyst@YOUR_VPS_IP</code> — kalau bisa masuk tanpa password prompt, baru aman disable.
</div>

<h4>Step 5: Setup UFW Firewall</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Install UFW (biasanya sudah pre-installed)
sudo apt install -y ufw

# Default: deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (PENTING — jangan lupa ini sebelum enable!)
sudo ufw allow ssh              # port 22

# Allow HTTP/HTTPS (untuk web dashboard nanti)
sudo ufw allow 80/tcp           # HTTP
sudo ufw allow 443/tcp          # HTTPS

# Enable firewall
sudo ufw enable
# Jawab "y"

# Cek status
sudo ufw status verbose</code></pre></div>

<h4>Step 6: Install Fail2ban</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Install
sudo apt install -y fail2ban

# Buat local config (jangan edit file utama)
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Cari section [sshd], pastikan:
# [sshd]
# enabled = true
# port = ssh
# filter = sshd
# logpath = /var/log/auth.log
# maxretry = 3
# bantime = 3600

# Start & enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Cek banned IPs
sudo fail2ban-client status sshd</code></pre></div>

<h4>Step 7: (Optional) Change SSH Port</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Edit SSH config
sudo nano /etc/ssh/sshd_config
# Ubah: Port 22 → Port 2222 (atau angka lain 1024-65535)

# Update UFW
sudo ufw allow 2222/tcp
sudo ufw delete allow ssh

# Restart SSH
sudo systemctl restart sshd

# Connect pakai port baru:
# ssh analyst@YOUR_VPS_IP -p 2222</code></pre></div>

<div class="callout callout-tip">
<strong>Checklist Securing VPS:</strong><br>
☐ Root password changed<br>
☐ Non-root user with sudo created<br>
☐ SSH key authentication working<br>
☐ Password login disabled<br>
☐ UFW firewall enabled<br>
☐ Fail2ban installed & running<br>
☐ (Optional) SSH port changed
</div>
`},

    { id: 'setup', title: 'Setup Environment', html: `
<p>Setelah VPS secured, setup environment mirip dengan VM:</p>

<h4>Update & Install Essentials</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Update
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y git curl wget python3 python3-pip net-tools \\
  build-essential unzip jq htop vim tmux software-properties-common \\
  nginx certbot python3-certbot-nginx</code></pre></div>

<h4>Install Docker</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose-plugin

# Logout & login lagi, lalu verify:
docker --version
docker compose version</code></pre></div>

<h4>Install Nginx (Reverse Proxy)</h4>
<p>Nginx berguna sebagai reverse proxy — supaya semua web dashboard (Wazuh, Splunk, IRIS) bisa diakses via domain/subdomain dengan HTTPS:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Nginx sudah diinstall di atas. Verify:
sudo systemctl status nginx

# Test: buka http://YOUR_VPS_IP di browser → should see Nginx welcome page</code></pre></div>
`},

    { id: 'deploy-tools', title: 'Deploy SOC Tools', html: `
<p>Quick reference deploy SOC tools di VPS via Docker. Untuk guide lengkap, ikuti halaman masing-masing tool.</p>

<h4>Wazuh (Docker Single-node)</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Clone Wazuh Docker repo
git clone https://github.com/wazuh/wazuh-docker.git -b v4.9.2
cd wazuh-docker/single-node

# Generate SSL certs
docker compose -f generate-indexer-certs.yml run --rm generator

# Start Wazuh
docker compose up -d

# Dashboard: https://YOUR_VPS_IP:443
# Default login: admin / SecretPassword
# ⚠️ GANTI PASSWORD DEFAULT SEGERA</code></pre></div>

<h4>DFIR-IRIS (Docker)</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>git clone https://github.com/dfir-iris/iris-web.git
cd iris-web

# Copy env file & customize
cp .env.model .env

# Start
docker compose up -d

# Dashboard: https://YOUR_VPS_IP:8443
# Default login: administrator / password yang di-set di .env</code></pre></div>

<h4>Splunk (Docker)</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>docker run -d \\
  --name splunk \\
  -p 8000:8000 \\
  -e SPLUNK_START_ARGS="--accept-license" \\
  -e SPLUNK_PASSWORD="YourStr0ngPassword!" \\
  splunk/splunk:latest

# Dashboard: http://YOUR_VPS_IP:8000
# Login: admin / YourStr0ngPassword!</code></pre></div>

<div class="callout callout-warn">
<strong>GANTI SEMUA DEFAULT PASSWORD!</strong> VPS exposed ke internet — siapapun bisa akses dashboard kalau password masih default. Ini bukan paranoia, ini basic hygiene.
</div>
`},

    { id: 'access-config', title: 'Akses & Firewall', html: `
<p>Setiap tool punya port yang perlu dibuka di firewall:</p>

<h4>UFW Rules per Tool</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Wazuh Dashboard
sudo ufw allow 443/tcp       # Wazuh web UI (HTTPS)
sudo ufw allow 1514/tcp      # Wazuh agent registration
sudo ufw allow 1515/tcp      # Wazuh agent communication
sudo ufw allow 55000/tcp     # Wazuh API

# DFIR-IRIS
sudo ufw allow 8443/tcp      # IRIS web UI

# Splunk
sudo ufw allow 8000/tcp      # Splunk web UI
sudo ufw allow 8088/tcp      # Splunk HEC (HTTP Event Collector)
sudo ufw allow 9997/tcp      # Splunk forwarder receiving

# Cek semua rules
sudo ufw status numbered</code></pre></div>

<h4>Nginx Reverse Proxy (Production-style)</h4>
<p>Daripada buka banyak port, lebih aman pakai Nginx sebagai reverse proxy + SSL:</p>
<div class="code-block"><div class="code-label"><span>Nginx — /etc/nginx/sites-available/wazuh</span></div><pre><code>server {
    listen 80;
    server_name wazuh.yourdomain.com;

    location / {
        proxy_pass https://127.0.0.1:443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
    }
}

# Enable site:
# sudo ln -s /etc/nginx/sites-available/wazuh /etc/nginx/sites-enabled/
# sudo nginx -t && sudo systemctl reload nginx</code></pre></div>

<h4>SSL dengan Let's Encrypt (Gratis)</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code># Setup domain dulu (A record pointing ke VPS IP)
# Lalu:
sudo certbot --nginx -d wazuh.yourdomain.com
# Ikuti prompts — certbot auto-configure HTTPS

# Auto-renewal (biasanya sudah auto-configured)
sudo certbot renew --dry-run</code></pre></div>

<div class="callout callout-tip">
<strong>Pro tip:</strong> Kalau nggak punya domain, bisa pakai <strong>IP-based access</strong> dengan self-signed cert, atau pakai <strong>nip.io</strong> (contoh: <code>203.0.113.50.nip.io</code> auto-resolve ke IP tersebut — bisa dipakai untuk Let's Encrypt wildcard).
</div>
`},

    { id: 'tools-ready', title: 'Tools Checklist', html: `
<p>Status tools di VPS — semua works karena VPS = full Linux server:</p>

<table class="ref-table">
  <tr><th>Tool</th><th>VPS Status</th><th>Deploy Method</th><th>Notes</th></tr>
  <tr><td><strong>Wazuh Manager</strong></td><td>✅ Full support</td><td>Docker / Script</td><td>Best environment untuk Wazuh — always-on, bisa terima agent dari mana saja</td></tr>
  <tr><td><strong>Splunk</strong></td><td>✅ Full support</td><td>Docker</td><td>Butuh minimal 4 GB RAM untuk index data real</td></tr>
  <tr><td><strong>Suricata</strong></td><td>✅ IDS & IPS</td><td>apt</td><td>Bisa inline IPS mode — VPS punya real network interface</td></tr>
  <tr><td><strong>DFIR-IRIS</strong></td><td>✅ Full support</td><td>Docker</td><td>Ideal di VPS — tim bisa akses case dari mana saja</td></tr>
  <tr><td><strong>TheHive</strong></td><td>✅ Full support</td><td>Docker</td><td>Collaborative — VPS = best environment</td></tr>
  <tr><td><strong>Wireshark</strong></td><td>⚠️ CLI only</td><td>apt</td><td>tshark (CLI) works. GUI butuh X forwarding: <code>ssh -X</code></td></tr>
  <tr><td><strong>tcpdump</strong></td><td>✅ Full support</td><td>apt</td><td>Capture real internet traffic — hati-hati privacy/legal</td></tr>
  <tr><td><strong>Volatility 3</strong></td><td>✅ Full support</td><td>pip</td><td>Upload memory dump ke VPS untuk analysis</td></tr>
  <tr><td><strong>Nginx</strong></td><td>✅</td><td>apt</td><td>Reverse proxy + SSL untuk semua dashboards</td></tr>
</table>

<div class="callout callout-info">
<strong>VPS vs VM vs WSL — Kapan Pakai Apa?</strong><br>
• <strong>VM (VirtualBox)</strong>: Lab lokal, malware analysis, network simulation, offline learning<br>
• <strong>WSL</strong>: Quick scripting, daily analysis tools, Docker-based tools di Windows<br>
• <strong>VPS</strong>: Shared lab, always-on SIEM, production-style deployment, remote access<br><br>
Bisa kombinasi: WSL untuk sehari-hari + VPS untuk centralized SIEM + VM untuk malware sandbox.
</div>
`}

  ]
}

});
