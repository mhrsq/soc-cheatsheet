// ═══════════════════════════════════════════════════════
// NDR / IDS: Overview, Suricata, Snort (3 sub-modules)
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────
// 1. IDS, IPS & NDR — Overview
// ─────────────────────────────────────────
'ndr-overview': {
  name: 'IDS, IPS & NDR — Overview',
  subtitle: 'Pahami perbedaan IDS, IPS, dan NDR — dari passive monitoring sampai intelligent network defense.',
  tags: ['tag-reference'], tagLabels: ['NDR / IDS'],
  parent: 'ndr-ids',
  sections: [

    { id: 'what-is-ids', title: 'Apa itu IDS?', html: `
<p><strong>Intrusion Detection System (IDS)</strong> adalah sistem yang memonitor traffic jaringan secara <em>pasif</em>. Dia "mengintip" semua paket yang lewat, mencocokkan dengan database rules/signatures, dan kalau ketemu yang mencurigakan — generate alert. Itu aja. <strong>IDS tidak memblokir traffic.</strong></p>

<div class="callout callout-tip">
<strong>Analogi:</strong> IDS itu kayak <em>CCTV</em> di toko. Dia bisa record dan alert kalau ada orang mencurigakan, tapi dia <strong>nggak bisa stop pencuri</strong>. Yang nge-stop itu security guard (IPS) atau kamu sendiri (manual response).
</div>

<h4>Dua Jenis IDS</h4>
<table class="ref-table">
  <tr><th>Tipe</th><th>Deskripsi</th><th>Contoh</th></tr>
  <tr><td><strong>NIDS</strong> (Network-based)</td><td>Monitor traffic di level jaringan. Dipasang di titik strategis — biasanya lewat SPAN port atau TAP.</td><td>Suricata, Snort, Zeek</td></tr>
  <tr><td><strong>HIDS</strong> (Host-based)</td><td>Monitor aktivitas di level host/endpoint. Cek log, file integrity, process, dll.</td><td>Wazuh Agent, OSSEC, Tripwire</td></tr>
</table>

<h4>Bagaimana IDS Masuk ke Network?</h4>
<p>IDS itu <strong>passive</strong> — dia nggak inline di traffic path. Cara dia "lihat" traffic:</p>

<div class="code-block"><div class="code-label"><span>Text — IDS Deployment via SPAN Port / TAP</span></div><pre><code>                    Internet
                       │
                  ┌────┴────┐
                  │ Firewall │
                  └────┬────┘
                       │
              ┌────────┼────────┐
              │    Core Switch   │
              │                  │
              │   SPAN Port ─────┼──────► ┌──────────┐
              │   (mirror)       │        │ IDS/NIDS │ ← Sniff semua traffic
              └────────┬─────────┘        │ Sensor   │
                       │                  └────┬─────┘
               ┌───────┼───────┐               │
               │  Endpoints    │          Alert ke SIEM
               │  (servers,    │
               │   workstation)│
               └───────────────┘</code></pre></div>

<p>SPAN port (Switch Port Analyzer) mirror semua traffic dari port tertentu ke port tempat IDS sensor terpasang. Alternatifnya pakai <strong>network TAP</strong> — device fisik yang dipasang inline tapi hanya <em>copy</em> traffic ke sensor, tanpa mengganggu flow.</p>

<p><strong>Key takeaway:</strong> IDS = <em>detection only</em>. Dia kasih tau kamu "ada yang aneh", tapi keputusan mau ngapain — itu urusan kamu atau sistem lain (SOAR, IPS, dsb).</p>
`},

    { id: 'what-is-ips', title: 'Apa itu IPS?', html: `
<p><strong>Intrusion Prevention System (IPS)</strong> itu IDS yang dikasih "tangan". Dia nggak cuma detect — dia bisa <strong>DROP paket</strong> yang dianggap malicious. Untuk itu, IPS harus dipasang <strong>inline</strong> di jalur traffic, bukan di samping kayak IDS.</p>

<div class="callout callout-tip">
<strong>Analogi:</strong> Kalau IDS itu CCTV, maka IPS itu <em>security guard</em> yang berdiri di pintu masuk. Dia bisa <strong>tangkap pencuri</strong>, bukan cuma report. Tapi kalau dia salah tangkap orang baik... ya masalah baru.
</div>

<h4>Cara Kerja IPS</h4>
<div class="code-block"><div class="code-label"><span>Text — IPS Inline Deployment</span></div><pre><code>  Internet ──► Firewall ──► [ IPS (inline) ] ──► Core Switch ──► Endpoints
                                   │
                              Inspect setiap paket:
                              ✓ Match rule → DROP / REJECT
                              ✗ No match  → PASS (forward)</code></pre></div>

<p>IPS pakai <strong>engine yang sama</strong> dengan IDS — rules, signatures, pattern matching. Bedanya: IPS bisa ambil aksi. Actions yang bisa dilakukan:</p>
<ul>
  <li><strong>DROP</strong> — buang paket diam-diam (attacker nggak tau kalau diblok)</li>
  <li><strong>REJECT</strong> — buang paket + kirim RST/ICMP unreachable ke pengirim</li>
  <li><strong>ALERT</strong> — log saja (sama kayak IDS mode)</li>
</ul>

<h4>Trade-off: False Positive = Outage</h4>
<div class="callout callout-warn">
<strong>Ini masalah paling serius di IPS.</strong> Kalau IDS salah detect (false positive), efeknya cuma alert spam — annoying tapi nggak fatal. Tapi kalau <strong>IPS false positive</strong>, traffic legitimate kena block. User nggak bisa akses aplikasi. Bisa jadi <strong>production outage</strong>.
</div>

<p>Makanya best practice di banyak organisasi:</p>
<ol>
  <li><strong>Mulai dari IDS mode dulu</strong> — monitor, kumpulkan data, lihat alert apa yang muncul</li>
  <li><strong>Tune rules</strong> — disable/suppress rules yang terlalu noisy atau generate FP</li>
  <li><strong>Gradually switch ke IPS mode</strong> — mulai dengan rules yang high-confidence dulu</li>
  <li><strong>Terus monitor</strong> — false positive bisa muncul kapan saja, terutama setelah update rules</li>
</ol>

<p>Di Suricata, switch dari IDS ke IPS mode cuma beda konfigurasi: ubah <code>af-packet</code> mode dari <code>workers</code> ke <code>ips</code> dan set <code>copy-mode</code>.</p>
`},

    { id: 'what-is-ndr', title: 'Apa itu NDR?', html: `
<p><strong>Network Detection & Response (NDR)</strong> adalah evolusi dari IDS/IPS. Kalau IDS/IPS mainly andalkan <em>signatures</em> (known bad patterns), NDR menambahkan:</p>
<ul>
  <li><strong>Behavioral analysis</strong> — belajar baseline "normal" traffic, detect deviasi</li>
  <li><strong>Machine Learning</strong> — detect anomaly yang nggak bisa ditangkap signature</li>
  <li><strong>Response capability</strong> — bukan cuma alert, tapi bisa trigger automated response</li>
  <li><strong>Network metadata analysis</strong> — deep visibility ke protocol, flow, session</li>
</ul>

<div class="callout callout-info">
<strong>Ingat hierarki-nya:</strong> AV → EDR → NDR → XDR. Kalau EDR fokus di endpoint, NDR fokus di <em>network-level visibility</em>. XDR = gabungin semua. Baca bagian <em>AV vs EDR vs NDR vs XDR</em> di Fundamentals untuk perbandingan lengkapnya.
</div>

<h4>Apa yang Bisa Di-detect NDR tapi IDS Nggak Bisa?</h4>
<ul>
  <li><strong>Beaconing</strong> — malware yang berkomunikasi periodik ke C2 server (misal tiap 60 detik). IDS nggak punya konsep "periodik" — NDR punya karena dia analisis pattern over time.</li>
  <li><strong>Lateral movement</strong> — traffic internal yang abnormal (workstation A tiba-tiba connect ke 50 server). IDS bisa detect kalau ada rule spesifik, tapi NDR detect karena ini <em>anomaly</em> dari baseline.</li>
  <li><strong>Data exfiltration</strong> — upload besar ke IP yang belum pernah dikontak sebelumnya.</li>
  <li><strong>Encrypted threat</strong> — NDR bisa analisis metadata TLS (JA3/JA3S fingerprint, certificate info) tanpa decrypt traffic.</li>
</ul>

<h4>Contoh Produk NDR</h4>
<table class="ref-table">
  <tr><th>Produk</th><th>Tipe</th><th>Catatan</th></tr>
  <tr><td><strong>Darktrace</strong></td><td>Commercial</td><td>AI-powered, self-learning, pricey tapi powerful</td></tr>
  <tr><td><strong>Vectra AI</strong></td><td>Commercial</td><td>Focus di attack detection, bagus untuk lateral movement</td></tr>
  <tr><td><strong>ExtraHop Reveal(x)</strong></td><td>Commercial</td><td>Real-time wire data analysis, cloud-native option</td></tr>
  <tr><td><strong>Corelight</strong></td><td>Commercial</td><td>Enterprise Zeek — network evidence, open-source core</td></tr>
  <tr><td><strong>Suricata + Zeek</strong></td><td>Open Source</td><td>"Poor man's NDR" — Suricata untuk IDS/IPS, Zeek untuk network analysis & metadata</td></tr>
</table>

<div class="callout callout-tip">
<strong>Budget terbatas?</strong> Kombinasi <strong>Suricata</strong> (IDS/IPS, signature-based) + <strong>Zeek</strong> (protocol analysis, connection logs, metadata) + <strong>Wazuh</strong> (korelasi alert) bisa jadi "poor man's NDR" yang surprisingly capable. Nggak se-fancy Darktrace, tapi untuk training dan small-medium environment, lebih dari cukup.
</div>
`},

    { id: 'ids-vs-ips-vs-ndr', title: 'Perbandingan IDS vs IPS vs NDR', html: `
<p>Ini ringkasan head-to-head supaya gampang dibandingkan:</p>

<table class="ref-table">
  <tr>
    <th>Aspek</th>
    <th>IDS</th>
    <th>IPS</th>
    <th>NDR</th>
  </tr>
  <tr>
    <td><strong>Posisi di Network</strong></td>
    <td>Passive (SPAN/TAP)</td>
    <td>Inline (di jalur traffic)</td>
    <td>Passive + bisa inline</td>
  </tr>
  <tr>
    <td><strong>Detection Method</strong></td>
    <td>Signature-based</td>
    <td>Signature-based</td>
    <td>Signature + Behavioral + ML</td>
  </tr>
  <tr>
    <td><strong>Response</strong></td>
    <td>Alert only</td>
    <td>Block / Drop / Reject</td>
    <td>Alert + Investigate + Auto-respond</td>
  </tr>
  <tr>
    <td><strong>False Positive Impact</strong></td>
    <td>Low (cuma alert spam)</td>
    <td>High (traffic diblock!)</td>
    <td>Medium (tergantung response config)</td>
  </tr>
  <tr>
    <td><strong>Performance Impact</strong></td>
    <td>None (passive)</td>
    <td>Yes (inline = latency)</td>
    <td>Varies</td>
  </tr>
  <tr>
    <td><strong>Detect Unknown Threats</strong></td>
    <td>❌ (hanya known signatures)</td>
    <td>❌ (hanya known signatures)</td>
    <td>✅ (behavioral/ML)</td>
  </tr>
  <tr>
    <td><strong>Encrypted Traffic</strong></td>
    <td>❌ (nggak bisa baca payload)</td>
    <td>❌ (nggak bisa baca payload)</td>
    <td>Partial (metadata/JA3)</td>
  </tr>
  <tr>
    <td><strong>Use Case</strong></td>
    <td>Monitoring, compliance, visibility</td>
    <td>Active blocking, perimeter defense</td>
    <td>Advanced threat detection, hunting</td>
  </tr>
  <tr>
    <td><strong>Contoh Produk</strong></td>
    <td>Suricata (IDS mode), Snort, Zeek</td>
    <td>Suricata (IPS mode), Snort, Palo Alto</td>
    <td>Darktrace, Vectra, ExtraHop, Corelight</td>
  </tr>
</table>

<div class="callout callout-info">
<strong>Realita di lapangan:</strong> Banyak organisasi deploy <strong>ketiganya</strong> di layer yang berbeda. Firewall punya IPS built-in di perimeter, IDS/Suricata monitor internal traffic, dan NDR sit on top untuk behavioral analysis. Defense in depth — nggak ada satu solusi yang cukup.
</div>
`},

    { id: 'deployment', title: 'Deployment Architecture', html: `
<p>Dimana kamu harus taruh IDS/IPS di network? Jawabannya: <strong>tergantung apa yang mau kamu lihat</strong>. Ini beberapa posisi umum:</p>

<h4>1. Di Belakang Firewall (Post-Firewall)</h4>
<p>Detect traffic yang <strong>lolos dari firewall</strong>. Firewall biasanya filter berdasarkan port/IP — IDS bisa detect <em>content-level</em> threats yang firewall lewatkan (misalnya exploit di HTTP traffic yang lewat port 80).</p>

<h4>2. Di Network Perimeter</h4>
<p>Lihat <strong>semua traffic masuk/keluar</strong>. Cocok untuk detect C2 communication, data exfiltration, inbound scanning.</p>

<h4>3. Di Antara Segmen Network (Inter-segment)</h4>
<p>Detect <strong>lateral movement</strong>. Ini yang sering di-skip, padahal paling penting. Attacker yang sudah masuk biasanya bergerak dari satu segmen ke segmen lain — kalau kamu cuma monitor perimeter, kamu buta terhadap internal movement.</p>

<h4>4. Di DMZ</h4>
<p>Monitor traffic ke/dari server yang exposed ke internet (web server, mail server). High-value target yang sering diserang.</p>

<div class="code-block"><div class="code-label"><span>Text — IDS/IPS Deployment Points</span></div><pre><code>                        Internet
                           │
                    ┌──────┴──────┐
                    │   Firewall   │ ← IPS built-in (layer 1)
                    │   + IPS      │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
        ┌─────┴─────┐           ┌──────┴──────┐
        │    DMZ     │           │  Core Switch │
        │ Web / Mail │           │              │
        └─────┬─────┘           └──┬────┬────┬─┘
              │                    │    │    │
         [IDS Sensor]         ┌───┘    │    └───┐
          (DMZ traffic)       │        │        │
                         ┌────┴──┐ ┌───┴───┐ ┌──┴─────┐
                         │Server │ │Workst.│ │  IoT   │
                         │Segment│ │Segment│ │Segment │
                         └───────┘ └───────┘ └────────┘
                              │
                         [IDS Sensor]  ← Monitor inter-segment
                              │
                         ┌────┴────┐
                         │  SIEM   │  ← Semua alert masuk sini
                         │(Wazuh / │
                         │ Splunk) │
                         └─────────┘</code></pre></div>

<h4>SPAN Port vs TAP vs Inline</h4>
<table class="ref-table">
  <tr><th>Method</th><th>Cara Kerja</th><th>Pro</th><th>Con</th></tr>
  <tr><td><strong>SPAN Port</strong></td><td>Switch mirror traffic dari port X ke port Y (sensor)</td><td>Mudah setup, nggak perlu hardware tambahan</td><td>Bisa drop packets kalau overload, nggak 100% reliable</td></tr>
  <tr><td><strong>Network TAP</strong></td><td>Device fisik di antara link, copy traffic ke sensor</td><td>100% reliable, nggak drop packets</td><td>Butuh hardware tambahan, perlu physical access</td></tr>
  <tr><td><strong>Inline</strong></td><td>IPS dipasang langsung di jalur traffic</td><td>Bisa block (IPS mode)</td><td>Single point of failure, add latency</td></tr>
</table>

<h4>Integrasi Suricata + Wazuh</h4>
<p>Setup yang paling umum di open-source stack: Suricata generate alert → kirim ke Wazuh Manager → muncul di Wazuh Dashboard.</p>

<div class="code-block"><div class="code-label"><span>Text — Suricata → Wazuh Integration Flow</span></div><pre><code>  Suricata Sensor                    Wazuh Manager
  ┌──────────────┐                  ┌──────────────┐
  │ af-packet    │                  │ ossec.conf   │
  │ engine       │──► eve.json ──►  │ localfile    │──► Wazuh Rules ──► Alert
  │              │   /var/log/      │ (monitor     │    (suricata     di Dashboard
  │ Rules match  │   suricata/      │  eve.json)   │     decoder)
  └──────────────┘                  └──────────────┘

  Alternatif: Filebeat ──► Wazuh Manager (untuk remote sensor)</code></pre></div>

<p>Detail konfigurasi integrasi ini ada di bagian Suricata → SIEM Integration.</p>
`},

    { id: 'rules-concepts', title: 'Konsep Rules/Signatures', html: `
<p>IDS/IPS bekerja berdasarkan <strong>rules</strong> (sering disebut signatures). Setiap rule mendefinisikan: "kalau kamu lihat traffic yang match pattern ini, generate alert (atau block)."</p>

<h4>Struktur Dasar Rule</h4>
<div class="code-block"><div class="code-label"><span>Text — Anatomy of IDS Rule</span></div><pre><code>action  protocol  src_ip  src_port  ->  dst_ip  dst_port  (options)
  │        │        │        │      │      │        │         │
  │        │        │        │      │      │        │         └─ msg, content, sid, rev, dll
  │        │        │        │      │      │        └─ port tujuan
  │        │        │        │      │      └─ IP tujuan
  │        │        │        │      └─ arah traffic (-> atau <>)
  │        │        │        └─ port asal
  │        │        └─ IP asal
  │        └─ tcp, udp, icmp, http, dns, tls, dll
  └─ alert, drop, reject, pass</code></pre></div>

<p>Contoh rule sederhana:</p>
<div class="code-block"><div class="code-label"><span>Snort/Suricata Rule — Detect ICMP Ping</span></div><pre><code>alert icmp any any -> $HOME_NET any (msg:"ICMP Ping Detected"; sid:1000001; rev:1;)</code></pre></div>
<p>Artinya: kalau ada paket ICMP dari mana saja ke network kita, generate alert dengan pesan "ICMP Ping Detected".</p>

<h4>Rule Sources</h4>
<table class="ref-table">
  <tr><th>Source</th><th>Deskripsi</th><th>Cost</th></tr>
  <tr><td><strong>ET Open</strong> (Emerging Threats)</td><td>Community rules gratis, di-maintain oleh Proofpoint. Paling populer untuk open-source IDS.</td><td>Free</td></tr>
  <tr><td><strong>ET Pro</strong></td><td>Versi premium dari ET Open, lebih banyak rules dan update lebih cepat.</td><td>Paid</td></tr>
  <tr><td><strong>Snort Community</strong></td><td>Rules gratis dari Snort/Talos community.</td><td>Free</td></tr>
  <tr><td><strong>Snort VRT (Talos)</strong></td><td>Rules premium dari Cisco Talos. Real-time updates.</td><td>Paid (free setelah 30 hari delay)</td></tr>
  <tr><td><strong>Custom / Local Rules</strong></td><td>Rules yang kamu tulis sendiri untuk environment spesifik kamu.</td><td>Free (tapi butuh skill)</td></tr>
</table>

<h4>Kategori Rules</h4>
<p>Rules biasanya dikelompokkan berdasarkan jenis threat:</p>
<ul>
  <li><strong>malware</strong> — detect known malware signatures, C2 communication patterns</li>
  <li><strong>exploit</strong> — detect exploitation attempts (buffer overflow, RCE payloads)</li>
  <li><strong>policy</strong> — detect policy violations (TOR usage, crypto mining, unauthorized apps)</li>
  <li><strong>scan</strong> — detect reconnaissance (port scanning, network enumeration)</li>
  <li><strong>dos</strong> — detect denial-of-service attempts</li>
  <li><strong>web-attack</strong> — SQL injection, XSS, directory traversal via HTTP</li>
  <li><strong>trojan</strong> — detect trojan/backdoor communication</li>
</ul>

<div class="callout callout-warn">
<strong>Rules harus selalu di-update!</strong> Rules itu kayak antivirus signatures — kalau stale, kamu miss threats baru. Set cron job untuk update minimal <strong>sekali sehari</strong>. Tools seperti <code>suricata-update</code> atau <code>PulledPork</code> bisa automate ini.
</div>

<div class="callout callout-info">
<strong>Jumlah rules itu banyak.</strong> ET Open aja punya <strong>40,000+ rules</strong>. Nggak semua perlu aktif — enable rules yang relevan dengan environment kamu. Terlalu banyak rules aktif = performance hit + alert fatigue.
</div>
`}
  ] // end sections
}, // end ndr-overview


// ─────────────────────────────────────────
// 2. Suricata — Setup & Usage
// ─────────────────────────────────────────
'ndr-suricata': {
  name: 'Suricata — Setup & Usage',
  subtitle: 'Open-source IDS/IPS/NSM engine — install, konfigurasi, tulis rules, dan integrasi dengan SIEM.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['NDR / IDS','CLI'],
  parent: 'ndr-ids',
  sections: [

    { id: 'overview', title: 'Kenapa Suricata?', html: `
<p><strong>Suricata</strong> adalah open-source IDS/IPS/NSM (Network Security Monitoring) engine yang di-maintain oleh <strong>OISF</strong> (Open Information Security Foundation). Ini engine paling populer di dunia open-source IDS sekarang, dan banyak yang bilang dia successor spiritual dari Snort.</p>

<h4>Kenapa Pilih Suricata?</h4>
<ul>
  <li><strong>Multi-threaded dari awal</strong> — ini advantage terbesar vs Snort 2. Suricata bisa utilize semua CPU core. Di high-traffic environment, ini game changer.</li>
  <li><strong>Kompatibel dengan Snort rules</strong> — bisa pakai rules yang sudah ada dari Snort ecosystem. Migrasi gampang.</li>
  <li><strong>Built-in protocol parsing</strong> — HTTP, TLS, DNS, SMB, SSH, FTP, SMTP, dan banyak lagi. Bisa inspect di layer aplikasi, bukan cuma header.</li>
  <li><strong>EVE JSON output</strong> — semua log dalam format JSON. Satu file, structured, gampang diparse. Perfect untuk integrasi SIEM (Wazuh, Splunk, ELK).</li>
  <li><strong>Dual mode: IDS & IPS</strong> — satu engine, bisa passive (IDS) atau inline (IPS). Tinggal ubah config.</li>
  <li><strong>File extraction</strong> — bisa extract file dari network traffic (HTTP downloads, email attachments) untuk malware analysis.</li>
  <li><strong>Lua scripting</strong> — bisa tulis custom detection logic pakai Lua script.</li>
</ul>

<div class="callout callout-info">
<strong>Suricata vs Snort — quick take:</strong> Untuk <em>training dan lab</em>, Suricata menang di kemudahan install dan output JSON yang langsung kompatibel dengan SIEM. Untuk <em>production</em>, keduanya viable — pilih berdasarkan existing ecosystem dan support yang dibutuhkan. Detail perbandingan ada di bagian Snort → Snort vs Suricata.
</div>

<h4>Suricata Bisa Apa Saja?</h4>
<table class="ref-table">
  <tr><th>Capability</th><th>Deskripsi</th></tr>
  <tr><td><strong>IDS Mode</strong></td><td>Passive monitoring — sniff traffic, generate alert, nggak ganggu traffic</td></tr>
  <tr><td><strong>IPS Mode</strong></td><td>Inline — bisa drop/reject malicious traffic</td></tr>
  <tr><td><strong>NSM Mode</strong></td><td>Network Security Monitoring — log semua metadata (DNS queries, HTTP requests, TLS certs, file hashes)</td></tr>
  <tr><td><strong>Pcap Processing</strong></td><td>Bisa baca file .pcap dan analisis offline — perfect untuk forensik</td></tr>
  <tr><td><strong>File Extraction</strong></td><td>Extract file yang lewat di network traffic untuk analisis lebih lanjut</td></tr>
</table>
`},

    { id: 'install', title: 'Install Suricata', html: `
<p>Suricata bisa diinstall di Linux (native) atau via Docker. <strong>Nggak ada native support untuk Windows/macOS</strong> — kalau pakai OS tersebut, gunakan VM atau Docker.</p>

${osTabs([
  { id: 'linux', icon: '🐧', label: 'Linux (Ubuntu/Debian)', html: `
<div class="code-block"><div class="code-label"><span>Bash — Install Suricata di Ubuntu/Debian</span></div><pre><code><span class="code-comment"># Install dari repository</span>
sudo apt update
sudo apt install suricata suricata-update -y

<span class="code-comment"># Cek versi</span>
suricata --build-info | head -1
<span class="code-comment"># Output: Suricata 7.x.x</span>

<span class="code-comment"># Cek lokasi config default</span>
ls -la /etc/suricata/suricata.yaml

<span class="code-comment"># Enable service supaya jalan otomatis pas boot</span>
sudo systemctl enable suricata
sudo systemctl start suricata

<span class="code-comment"># Cek status</span>
sudo systemctl status suricata</code></pre></div>

<div class="callout callout-tip">
<strong>Mau versi terbaru?</strong> Repository Ubuntu kadang agak ketinggalan. Untuk versi latest, pakai PPA resmi OISF:
<div class="code-block"><div class="code-label"><span>Bash — Install Suricata dari PPA</span></div><pre><code>sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt update
sudo apt install suricata -y</code></pre></div>
</div>
  ` },
  { id: 'docker', icon: '🐳', label: 'Docker', html: `
<div class="code-block"><div class="code-label"><span>Bash — Suricata via Docker</span></div><pre><code><span class="code-comment"># Pull image resmi</span>
docker pull jasonish/suricata:latest

<span class="code-comment"># Jalankan Suricata (IDS mode, listen di host network)</span>
docker run --rm -it --net=host \\
  --cap-add=net_raw --cap-add=sys_nice \\
  -v /var/log/suricata:/var/log/suricata \\
  jasonish/suricata:latest -i eth0

<span class="code-comment"># Atau dengan custom config dan rules</span>
docker run --rm -it --net=host \\
  --cap-add=net_raw --cap-add=sys_nice \\
  -v /etc/suricata:/etc/suricata \\
  -v /var/log/suricata:/var/log/suricata \\
  jasonish/suricata:latest -c /etc/suricata/suricata.yaml -i eth0</code></pre></div>

<div class="callout callout-info">
<strong>--net=host</strong> diperlukan supaya container bisa lihat traffic di host network interface. Tanpa ini, Suricata cuma lihat traffic di Docker bridge network — nggak berguna untuk monitoring.
</div>
  ` }
])}

<p>Setelah install, file-file penting:</p>
<table class="ref-table">
  <tr><th>File/Path</th><th>Fungsi</th></tr>
  <tr><td><code>/etc/suricata/suricata.yaml</code></td><td>Config utama — network, rules, logging, engine settings</td></tr>
  <tr><td><code>/var/lib/suricata/rules/</code></td><td>Default rule directory (setelah suricata-update)</td></tr>
  <tr><td><code>/var/log/suricata/eve.json</code></td><td>Main log file — JSON format, semua event</td></tr>
  <tr><td><code>/var/log/suricata/fast.log</code></td><td>Quick alert log — satu baris per alert</td></tr>
  <tr><td><code>/var/log/suricata/stats.log</code></td><td>Performance statistics</td></tr>
</table>
`},

    { id: 'config', title: 'Konfigurasi Dasar', html: `
<p>Config utama Suricata ada di <code>/etc/suricata/suricata.yaml</code>. File ini panjang (1000+ baris), tapi yang perlu kamu ubah cuma beberapa bagian kunci.</p>

<h4>1. HOME_NET — Definisikan Network Kamu</h4>
<div class="callout callout-warn">
<strong>Ini setting PALING PENTING.</strong> Salah set HOME_NET = semua alert jadi garbage. Rules bergantung pada konsep "internal" vs "external" — kalau Suricata nggak tau mana yang internal, dia nggak bisa detect dengan benar.
</div>

<div class="code-block"><div class="code-label"><span>YAML — suricata.yaml: vars section</span></div><pre><code>vars:
  address-groups:
    HOME_NET: "[192.168.1.0/24, 10.0.0.0/8, 172.16.0.0/12]"
    <span class="code-comment"># ^ Sesuaikan dengan range IP internal kamu!</span>
    <span class="code-comment"># Contoh: kalau network kamu cuma 192.168.1.0/24:</span>
    <span class="code-comment"># HOME_NET: "[192.168.1.0/24]"</span>

    EXTERNAL_NET: "!$HOME_NET"
    <span class="code-comment"># ^ Otomatis: semua yang bukan HOME_NET = external</span>

    HTTP_SERVERS: "$HOME_NET"
    DNS_SERVERS: "$HOME_NET"
    SMTP_SERVERS: "$HOME_NET"</code></pre></div>

<h4>2. Network Interface — af-packet</h4>
<div class="code-block"><div class="code-label"><span>YAML — suricata.yaml: af-packet section</span></div><pre><code>af-packet:
  - interface: eth0
    <span class="code-comment"># ^ Ganti dengan nama interface kamu (cek: ip a)</span>
    cluster-id: 99
    cluster-type: cluster_flow
    defrag: yes
    use-mmap: yes
    tpacket-v3: yes

    <span class="code-comment"># Untuk IDS mode (default):</span>
    <span class="code-comment"># Tidak perlu copy-mode</span>

    <span class="code-comment"># Untuk IPS mode (inline), tambahkan:</span>
    <span class="code-comment"># copy-mode: ips</span>
    <span class="code-comment"># copy-iface: eth1</span></code></pre></div>

<h4>3. Rule Files</h4>
<div class="code-block"><div class="code-label"><span>YAML — suricata.yaml: rule-files section</span></div><pre><code>default-rule-path: /var/lib/suricata/rules

rule-files:
  - suricata.rules
  <span class="code-comment"># ^ File ini di-generate otomatis oleh suricata-update</span>
  <span class="code-comment"># Semua enabled rules digabung jadi satu file</span>

  <span class="code-comment"># Tambahkan custom rules:</span>
  - /etc/suricata/rules/local.rules</code></pre></div>

<h4>4. EVE JSON Log Output</h4>
<div class="code-block"><div class="code-label"><span>YAML — suricata.yaml: eve-log output</span></div><pre><code>outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: eve.json
      <span class="code-comment"># ^ Output ke /var/log/suricata/eve.json</span>

      types:
        - alert:
            payload: yes           <span class="code-comment"># Include payload data</span>
            payload-printable: yes <span class="code-comment"># Human-readable payload</span>
            packet: yes            <span class="code-comment"># Include packet data</span>
            metadata: yes          <span class="code-comment"># Include rule metadata</span>
        - http:
            extended: yes          <span class="code-comment"># Log HTTP requests/responses</span>
        - dns:
            <span class="code-comment"># Log semua DNS queries & answers</span>
        - tls:
            extended: yes          <span class="code-comment"># Log TLS handshake info, JA3</span>
        - files:
            force-magic: yes       <span class="code-comment"># File type detection</span>
        - flow                     <span class="code-comment"># Network flow records</span>
        - stats:
            totals: yes
            threads: no</code></pre></div>

<h4>5. IDS vs IPS Mode</h4>
<table class="ref-table">
  <tr><th>Setting</th><th>IDS Mode</th><th>IPS Mode</th></tr>
  <tr><td>af-packet copy-mode</td><td>Tidak diset</td><td><code>copy-mode: ips</code></td></tr>
  <tr><td>Interface</td><td>Satu interface (SPAN/TAP)</td><td>Dua interface (bridge)</td></tr>
  <tr><td>Rule actions</td><td><code>alert</code> (log saja)</td><td><code>drop</code>, <code>reject</code> (block traffic)</td></tr>
  <tr><td>NFQueue (alternatif)</td><td>—</td><td><code>suricata -q 0</code> (NFQUEUE mode)</td></tr>
</table>

<div class="callout callout-tip">
<strong>Untuk belajar, selalu mulai dari IDS mode.</strong> Nggak ada risiko block traffic. Setelah familiar dengan rules dan tuning, baru pertimbangkan IPS mode.
</div>
`},

    { id: 'rules-management', title: 'Rule Management', html: `
<p><strong>suricata-update</strong> adalah tool resmi untuk manage rules di Suricata. Dia download rules dari berbagai sumber, merge, dan generate satu file <code>suricata.rules</code>.</p>

<h4>Basic Rule Management</h4>
<div class="code-block"><div class="code-label"><span>Bash — suricata-update commands</span></div><pre><code><span class="code-comment"># Download & update rules (ET Open = default source)</span>
sudo suricata-update

<span class="code-comment"># Lihat available rule sources</span>
sudo suricata-update list-sources

<span class="code-comment"># Enable additional source (contoh: Abuse.ch SSLBL)</span>
sudo suricata-update enable-source sslbl/ssl-fp-blacklist

<span class="code-comment"># Enable ET/Open (biasanya sudah default)</span>
sudo suricata-update enable-source et/open

<span class="code-comment"># Update rules + auto-reload Suricata (tanpa restart)</span>
sudo suricata-update --reload-command "suricatasc -c reload-rules"

<span class="code-comment"># Lihat rules yang disabled</span>
sudo suricata-update list-disabled-rules | head -20

<span class="code-comment"># Automate: cron job update harian</span>
<span class="code-comment"># Tambahkan di crontab (sudo crontab -e):</span>
<span class="code-comment"># 0 3 * * * /usr/bin/suricata-update && suricatasc -c reload-rules</span></code></pre></div>

<h4>Custom Rules — local.rules</h4>
<p>Buat file <code>/etc/suricata/rules/local.rules</code> untuk rules buatan sendiri. Jangan lupa tambahkan path-nya di <code>suricata.yaml</code>.</p>

<div class="code-block"><div class="code-label"><span>Suricata Rules — Contoh local.rules</span></div><pre><code><span class="code-comment"># 1. Detect NMAP SYN scan</span>
alert tcp any any -> $HOME_NET any (msg:"LOCAL - Possible NMAP SYN Scan"; \\
  flags:S; threshold:type threshold, track by_src, count 20, seconds 5; \\
  classtype:attempted-recon; sid:9000001; rev:1;)

<span class="code-comment"># 2. Detect reverse shell connection ke port 4444 (Metasploit default)</span>
alert tcp $HOME_NET any -> $EXTERNAL_NET 4444 (msg:"LOCAL - Possible Reverse Shell to Port 4444"; \\
  flow:to_server,established; classtype:trojan-activity; sid:9000002; rev:1;)

<span class="code-comment"># 3. Detect DNS query ke known malicious domain</span>
alert dns $HOME_NET any -> any any (msg:"LOCAL - DNS Query to Malicious Domain"; \\
  dns.query; content:"evil-domain.com"; nocase; \\
  classtype:bad-unknown; sid:9000003; rev:1;)

<span class="code-comment"># 4. Detect suspicious HTTP User-Agent</span>
alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"LOCAL - Suspicious User-Agent Detected"; \\
  http.user_agent; content:"Mozilla/4.0 (compatible|3b| MSIE 6.0)"; \\
  classtype:trojan-activity; sid:9000004; rev:1;)</code></pre></div>

<h4>Rule Syntax Breakdown</h4>
<p>Mari bedah satu rule secara detail:</p>
<div class="code-block"><div class="code-label"><span>Suricata Rule — Breakdown</span></div><pre><code>alert http $HOME_NET any -> $EXTERNAL_NET any (
  msg:"ET MALWARE Possible C2 Beacon";
  <span class="code-comment">│  └─ Pesan alert yang muncul di log</span>
  flow:to_server,established;
  <span class="code-comment">│  └─ Hanya match traffic ke server, yang sudah established</span>
  http.user_agent;
  <span class="code-comment">│  └─ Inspect HTTP User-Agent header</span>
  content:"Mozilla/4.0";
  <span class="code-comment">│  └─ Cari string ini di User-Agent</span>
  reference:url,malware-domain-list.com;
  <span class="code-comment">│  └─ Referensi untuk investigasi</span>
  classtype:trojan-activity;
  <span class="code-comment">│  └─ Kategori rule (untuk prioritas)</span>
  sid:1000001;
  <span class="code-comment">│  └─ Signature ID (unik per rule)</span>
  rev:1;
  <span class="code-comment">│  └─ Revision number</span>
)</code></pre></div>

<div class="callout callout-info">
<strong>SID ranges:</strong> SID 1-999999 reserved untuk Snort/ET official rules. Untuk custom rules, <strong>pakai SID 9000000+</strong> supaya nggak konflik.
</div>

<p>Setelah tambah/edit rules, reload Suricata:</p>
<div class="code-block"><div class="code-label"><span>Bash — Reload Rules</span></div><pre><code><span class="code-comment"># Via suricatasc (tanpa restart service)</span>
sudo suricatasc -c reload-rules

<span class="code-comment"># Atau restart service (lebih reliable, tapi ada downtime singkat)</span>
sudo systemctl restart suricata</code></pre></div>
`},

    { id: 'running', title: 'Menjalankan Suricata', html: `
<h4>Start Suricata</h4>
<div class="code-block"><div class="code-label"><span>Bash — Menjalankan Suricata</span></div><pre><code><span class="code-comment"># ─── IDS Mode (live capture) ───</span>
<span class="code-comment"># Cara 1: Langsung dari command line</span>
sudo suricata -c /etc/suricata/suricata.yaml -i eth0

<span class="code-comment"># Cara 2: Sebagai service (recommended untuk production)</span>
sudo systemctl start suricata
sudo systemctl status suricata

<span class="code-comment"># ─── IPS Mode (NFQUEUE) ───</span>
sudo suricata -c /etc/suricata/suricata.yaml -q 0
<span class="code-comment"># Pastikan iptables sudah redirect traffic ke NFQUEUE 0:</span>
<span class="code-comment"># sudo iptables -I FORWARD -j NFQUEUE --queue-num 0</span>

<span class="code-comment"># ─── Baca file PCAP (offline analysis) ───</span>
sudo suricata -c /etc/suricata/suricata.yaml -r capture.pcap
<span class="code-comment"># Hasilnya ada di /var/log/suricata/eve.json</span>

<span class="code-comment"># ─── Test config tanpa start ───</span>
sudo suricata -c /etc/suricata/suricata.yaml -T
<span class="code-comment"># Berguna untuk cek apakah config valid setelah edit</span></code></pre></div>

<h4>Membaca Log</h4>
<div class="code-block"><div class="code-label"><span>Bash — Membaca Suricata Logs</span></div><pre><code><span class="code-comment"># ─── EVE JSON (main log, structured) ───</span>

<span class="code-comment"># Tail realtime, pretty-print dengan jq</span>
tail -f /var/log/suricata/eve.json | jq .

<span class="code-comment"># Filter: hanya alerts</span>
jq 'select(.event_type=="alert")' /var/log/suricata/eve.json

<span class="code-comment"># Filter: alerts dari 1 jam terakhir</span>
jq 'select(.event_type=="alert") | {timestamp, src_ip: .src_ip, dest_ip: .dest_ip, msg: .alert.signature}' \\
  /var/log/suricata/eve.json

<span class="code-comment"># Filter: hanya DNS queries</span>
jq 'select(.event_type=="dns")' /var/log/suricata/eve.json

<span class="code-comment"># Filter: HTTP requests ke domain tertentu</span>
jq 'select(.event_type=="http" and .http.hostname=="suspicious-site.com")' \\
  /var/log/suricata/eve.json

<span class="code-comment"># Hitung jumlah alert per signature</span>
jq -r 'select(.event_type=="alert") | .alert.signature' \\
  /var/log/suricata/eve.json | sort | uniq -c | sort -rn | head -20

<span class="code-comment"># ─── fast.log (quick view, satu baris per alert) ───</span>
tail -f /var/log/suricata/fast.log

<span class="code-comment"># Contoh output fast.log:</span>
<span class="code-comment"># 04/05/2026-10:23:45.123456  [**] [1:2001219:20] ET SCAN Potential VNC Scan</span>
<span class="code-comment"># [**] [Classification: Attempted Information Leak] [Priority: 2]</span>
<span class="code-comment"># {TCP} 10.0.0.5:54321 -> 192.168.1.100:5900</span></code></pre></div>

<h4>Performance & Monitoring</h4>
<div class="code-block"><div class="code-label"><span>Bash — Suricata Performance Monitoring</span></div><pre><code><span class="code-comment"># Cek running stats via Unix socket</span>
sudo suricatasc -c "dump-counters"

<span class="code-comment"># Lihat capture stats (dropped packets = masalah!)</span>
sudo suricatasc -c "iface-stat eth0"

<span class="code-comment"># Cek uptime dan version</span>
sudo suricatasc -c "version"
sudo suricatasc -c "uptime"

<span class="code-comment"># Lihat stats.log</span>
tail -20 /var/log/suricata/stats.log
<span class="code-comment"># Perhatikan: capture.kernel_drops — kalau tinggi, Suricata nggak keep up</span></code></pre></div>

<div class="callout callout-warn">
<strong>Perhatikan kernel drops!</strong> Kalau <code>capture.kernel_drops</code> banyak, artinya Suricata nggak sempat proses semua paket. Solusi: tambah CPU core, tune af-packet settings, atau kurangi rules yang aktif.
</div>
`},

    { id: 'siem-integration', title: 'Integrasi dengan SIEM', html: `
<p>Suricata sendirian cuma generate log file. Untuk jadi berguna di SOC, alert-nya harus masuk ke <strong>SIEM</strong> supaya bisa dikorelasikan dengan data lain, divisualisasikan, dan di-triage oleh analyst.</p>

<h4>Integrasi dengan Wazuh</h4>
<p>Wazuh punya built-in decoder untuk Suricata EVE JSON. Setup-nya straightforward:</p>

<div class="code-block"><div class="code-label"><span>XML — ossec.conf: Monitor EVE JSON (di Wazuh Agent pada host Suricata)</span></div><pre><code>&lt;ossec_config&gt;
  &lt;localfile&gt;
    &lt;log_format&gt;json&lt;/log_format&gt;
    &lt;location&gt;/var/log/suricata/eve.json&lt;/location&gt;
  &lt;/localfile&gt;
&lt;/ossec_config&gt;</code></pre></div>

<p>Setelah config di atas ditambahkan dan Wazuh Agent di-restart:</p>
<div class="code-block"><div class="code-label"><span>Bash — Restart Wazuh Agent</span></div><pre><code>sudo systemctl restart wazuh-agent</code></pre></div>

<p>Wazuh Manager akan otomatis:</p>
<ol>
  <li>Baca EVE JSON log via agent</li>
  <li>Parse menggunakan built-in Suricata decoder</li>
  <li>Apply Wazuh rules — Suricata alerts muncul dengan <code>rule.groups: ["suricata"]</code></li>
  <li>Tampilkan di Wazuh Dashboard → Security Events, filter by <code>rule.groups: suricata</code></li>
</ol>

<div class="callout callout-tip">
<strong>Di Wazuh Dashboard:</strong> Buka <em>Threat Hunting</em> → filter <code>rule.groups: suricata</code>. Kamu akan lihat semua Suricata alerts lengkap dengan src_ip, dest_ip, signature, severity, dan timestamp. Bisa di-drill down untuk investigasi.
</div>

<h4>Integrasi dengan Splunk</h4>
<div class="code-block"><div class="code-label"><span>INI — inputs.conf: Splunk Universal Forwarder</span></div><pre><code>[monitor:///var/log/suricata/eve.json]
disabled = false
sourcetype = suricata
index = ids</code></pre></div>

<p>Di Splunk Search Head, install <strong>Splunk Add-on for Suricata</strong> (TA-suricata) dari Splunkbase. Add-on ini menyediakan:</p>
<ul>
  <li>Field extraction untuk EVE JSON</li>
  <li>CIM mapping (Network Traffic, Intrusion Detection data models)</li>
  <li>Automatic parsing untuk alert, http, dns, tls, flow event types</li>
</ul>

<div class="code-block"><div class="code-label"><span>SPL — Query Suricata Alerts di Splunk</span></div><pre><code><span class="code-comment"># Semua Suricata alerts</span>
index=ids sourcetype=suricata event_type=alert

<span class="code-comment"># Top 10 alert signatures</span>
index=ids sourcetype=suricata event_type=alert
| stats count by alert.signature | sort -count | head 10

<span class="code-comment"># Alerts dari src IP tertentu</span>
index=ids sourcetype=suricata event_type=alert src_ip="10.0.0.50"
| table _time src_ip dest_ip dest_port alert.signature alert.severity</code></pre></div>

<h4>Flow Overview</h4>
<div class="code-block"><div class="code-label"><span>Text — Suricata → SIEM Integration Summary</span></div><pre><code>  Suricata Sensor         Wazuh Stack                 Splunk Stack
  ┌──────────────┐       ┌─────────────┐             ┌─────────────┐
  │  eve.json    │──────►│ Wazuh Agent │             │ Splunk UF   │
  │              │       │ (localfile) │             │ (monitor)   │
  └──────────────┘       └──────┬──────┘             └──────┬──────┘
                                │                           │
                         ┌──────┴──────┐             ┌──────┴──────┐
                         │Wazuh Manager│             │ Splunk HF / │
                         │  (decoder)  │             │ Indexer     │
                         └──────┬──────┘             └──────┬──────┘
                                │                           │
                         ┌──────┴──────┐             ┌──────┴──────┐
                         │  Dashboard  │             │ Search Head │
                         │ (visualize) │             │ (TA-suricata│
                         └─────────────┘             └─────────────┘</code></pre></div>
`},

    { id: 'practice', title: 'Skenario Latihan', html: `
<p>Teori tanpa praktek = nol. Berikut beberapa skenario yang bisa kamu coba di lab:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">01</span> Replay PCAP & Analisis Alert</div>
<p><strong>Objective:</strong> Capture traffic, replay melalui Suricata, analisis alert yang muncul.</p>
<div class="code-block"><div class="code-label"><span>Bash — Capture & Replay</span></div><pre><code><span class="code-comment"># Step 1: Capture traffic (di mesin lain atau interface lain)</span>
sudo tcpdump -i eth0 -w /tmp/lab-capture.pcap -c 10000

<span class="code-comment"># Step 2: Replay melalui Suricata</span>
sudo suricata -c /etc/suricata/suricata.yaml -r /tmp/lab-capture.pcap -l /tmp/suricata-output/

<span class="code-comment"># Step 3: Analisis alerts</span>
jq 'select(.event_type=="alert")' /tmp/suricata-output/eve.json | head -50

<span class="code-comment"># Step 4: Lihat summary</span>
jq -r 'select(.event_type=="alert") | .alert.signature' \\
  /tmp/suricata-output/eve.json | sort | uniq -c | sort -rn</code></pre></div>
<p><strong>Expected result:</strong> Kamu akan lihat berbagai alert dari rules yang match. Investigate setiap alert — apakah true positive atau false positive?</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">02</span> Tulis Custom Rule & Test</div>
<p><strong>Objective:</strong> Buat rule custom, trigger rule, verifikasi alert muncul.</p>
<div class="code-block"><div class="code-label"><span>Bash — Custom Rule Test</span></div><pre><code><span class="code-comment"># Step 1: Tulis rule di local.rules</span>
echo 'alert http any any -> any any (msg:"LAB - Test Rule Detected"; \\
  http.uri; content:"/test-suricata-rule"; \\
  sid:9999999; rev:1;)' | sudo tee -a /etc/suricata/rules/local.rules

<span class="code-comment"># Step 2: Pastikan local.rules ada di suricata.yaml</span>
<span class="code-comment"># Cek: rule-files section harus include local.rules</span>

<span class="code-comment"># Step 3: Reload rules</span>
sudo suricatasc -c reload-rules

<span class="code-comment"># Step 4: Trigger rule (dari mesin lain atau localhost)</span>
curl http://localhost/test-suricata-rule

<span class="code-comment"># Step 5: Cek alert</span>
grep "LAB - Test Rule Detected" /var/log/suricata/fast.log
jq 'select(.alert.signature=="LAB - Test Rule Detected")' /var/log/suricata/eve.json</code></pre></div>
<p><strong>Expected result:</strong> Alert "LAB - Test Rule Detected" muncul di log. Kalau nggak muncul, cek: apakah rule syntax valid? Apakah Suricata listen di interface yang benar?</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">03</span> Integrasi Suricata → Wazuh End-to-End</div>
<p><strong>Objective:</strong> Setup integrasi, trigger Suricata alert, lihat di Wazuh Dashboard.</p>
<ol>
  <li>Pastikan Wazuh Agent terinstall di host yang menjalankan Suricata</li>
  <li>Tambahkan localfile config untuk <code>eve.json</code> di <code>ossec.conf</code></li>
  <li>Restart Wazuh Agent</li>
  <li>Trigger Suricata alert (pakai skenario 01 atau 02)</li>
  <li>Buka Wazuh Dashboard → Threat Hunting</li>
  <li>Filter: <code>rule.groups: suricata</code></li>
  <li>Verify: alert Suricata muncul dengan detail lengkap (src_ip, dest_ip, signature)</li>
</ol>
<p><strong>Expected result:</strong> Alert Suricata muncul sebagai Wazuh alert, bisa di-investigate dari satu dashboard. Ini adalah workflow SOC yang sesungguhnya — semua alert terpusat di SIEM.</p>
</div>
`}
  ] // end sections
}, // end ndr-suricata


// ─────────────────────────────────────────
// 3. Snort 3 — Setup & Usage
// ─────────────────────────────────────────
'ndr-snort': {
  name: 'Snort 3 — Setup & Usage',
  subtitle: 'The original IDS — install Snort 3, konfigurasi, tulis rules, dan perbandingan dengan Suricata.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['NDR / IDS','CLI'],
  parent: 'ndr-ids',
  sections: [

    { id: 'overview', title: 'Snort — The OG IDS', html: `
<p><strong>Snort</strong> adalah IDS/IPS open-source <em>pertama</em> yang benar-benar populer. Dibuat oleh <strong>Martin Roesch</strong> pada tahun 1998, dan sampai sekarang masih jadi salah satu IDS paling widely-deployed di dunia. Sekarang di-maintain oleh <strong>Cisco Talos</strong>.</p>

<h4>Sejarah Singkat</h4>
<ul>
  <li><strong>1998</strong> — Snort v1 dirilis sebagai lightweight network sniffer</li>
  <li><strong>2001</strong> — Sourcefire didirikan oleh Roesch untuk komersialkan Snort</li>
  <li><strong>2013</strong> — Cisco akuisisi Sourcefire, Snort jadi bagian dari Cisco security portfolio</li>
  <li><strong>2021</strong> — <strong>Snort 3</strong> dirilis — complete rewrite. Multi-threaded, arsitektur plugin-based, config pakai Lua</li>
</ul>

<h4>Snort 3 — Apa yang Baru?</h4>
<table class="ref-table">
  <tr><th>Fitur</th><th>Snort 2</th><th>Snort 3</th></tr>
  <tr><td><strong>Threading</strong></td><td>Single-threaded</td><td>Multi-threaded (packet threads)</td></tr>
  <tr><td><strong>Config format</strong></td><td>snort.conf (custom syntax)</td><td>snort.lua (Lua-based, lebih flexible)</td></tr>
  <tr><td><strong>Architecture</strong></td><td>Monolithic</td><td>Plugin-based (inspectors, codecs, loggers)</td></tr>
  <tr><td><strong>Rule parsing</strong></td><td>At startup only</td><td>Reload tanpa restart</td></tr>
  <tr><td><strong>Protocol support</strong></td><td>Basic</td><td>Improved (HTTP/2, lebih banyak inspector)</td></tr>
</table>

<div class="callout callout-info">
<strong>Snort rules = de-facto standard.</strong> Bahkan Suricata bisa baca Snort rules. Kalau kamu belajar Snort rule syntax, ilmunya applicable di hampir semua IDS/IPS. Ini kenapa Snort masih relevan meskipun banyak yang pindah ke Suricata.
</div>

<h4>Snort vs Suricata — Quick Take</h4>
<ul>
  <li><strong>Snort advantage:</strong> Cisco/Talos backing, massive rule ecosystem (Talos VRT rules), entrenched di banyak enterprise</li>
  <li><strong>Suricata advantage:</strong> Multi-threaded dari awal (Snort 3 baru catch up), EVE JSON output (Snort baru add JSON di v3), lebih banyak protocol parser built-in</li>
  <li><strong>Realita:</strong> Kebanyakan SOC pakai salah satu. Rules bisa saling dipakai. Pilih berdasarkan apa yang sudah ada di environment.</li>
</ul>
`},

    { id: 'install', title: 'Install Snort 3', html: `
<p>Install Snort 3 lebih complex dari Suricata karena dependency yang lebih banyak. Ada dua jalur: install dari repo (biasanya Snort 2) atau compile dari source (Snort 3).</p>

${osTabs([
  { id: 'linux', icon: '🐧', label: 'Linux (Ubuntu/Debian)', html: `
<h4>Opsi 1: Quick Path — Snort 2 dari Repo</h4>
<p>Untuk belajar rule syntax dan basic IDS, Snort 2 dari repo sudah cukup:</p>
<div class="code-block"><div class="code-label"><span>Bash — Install Snort 2 (quick & easy)</span></div><pre><code>sudo apt update
sudo apt install snort -y

<span class="code-comment"># Saat install, akan ditanya HOME_NET — isi dengan network kamu</span>
<span class="code-comment"># Contoh: 192.168.1.0/24</span>

<span class="code-comment"># Verify</span>
snort -V</code></pre></div>

<h4>Opsi 2: Snort 3 dari Source</h4>
<p>Untuk fitur terbaru dan multi-threading:</p>
<div class="code-block"><div class="code-label"><span>Bash — Build Snort 3 dari Source</span></div><pre><code><span class="code-comment"># Install dependencies</span>
sudo apt install -y build-essential cmake libhwloc-dev \\
  libpcap-dev libpcre2-dev libdumbnet-dev libluajit-5.1-dev \\
  zlib1g-dev liblzma-dev openssl libssl-dev pkg-config \\
  libsqlite3-dev uuid-dev libcmocka-dev libnetfilter-queue-dev \\
  flex bison

<span class="code-comment"># Install libdaq (Data Acquisition library)</span>
git clone https://github.com/snort3/libdaq.git
cd libdaq
./bootstrap
./configure
make
sudo make install
cd ..

<span class="code-comment"># Build Snort 3</span>
git clone https://github.com/snort3/snort3.git
cd snort3
./configure_cmake.sh --prefix=/usr/local
cd build
make -j$(nproc)
sudo make install

<span class="code-comment"># Update shared library cache</span>
sudo ldconfig

<span class="code-comment"># Verify</span>
snort -V
<span class="code-comment"># Output: Snort++ 3.x.x.x</span></code></pre></div>

<div class="callout callout-warn">
<strong>Build dari source memakan waktu 10-20 menit</strong> tergantung spec mesin. Kalau cuma untuk belajar rule syntax, Snort 2 dari repo sudah cukup. Snort 3 worth it kalau kamu mau experience real production setup.
</div>
` },
  { id: 'docker', icon: '🐳', label: 'Docker', html: `
<div class="code-block"><div class="code-label"><span>Bash — Snort 3 via Docker</span></div><pre><code><span class="code-comment"># Pull image</span>
docker pull snort3/snort3

<span class="code-comment"># Jalankan interaktif (IDS mode)</span>
docker run -it --rm --net=host \\
  --cap-add=net_raw \\
  snort3/snort3 snort -c /usr/local/etc/snort/snort.lua -i eth0

<span class="code-comment"># Baca PCAP file</span>
docker run -it --rm \\
  -v /path/to/pcaps:/pcaps \\
  snort3/snort3 snort -c /usr/local/etc/snort/snort.lua -r /pcaps/capture.pcap

<span class="code-comment"># Masuk ke container untuk explore</span>
docker run -it --rm --net=host snort3/snort3 /bin/bash</code></pre></div>
  ` }
])}
`},

    { id: 'config', title: 'Konfigurasi Snort', html: `
<p>Snort 3 pakai <strong>Lua</strong> untuk konfigurasi — <code>snort.lua</code> menggantikan <code>snort.conf</code> di Snort 2. Ini lebih flexible dan readable.</p>

<h4>Key Settings di snort.lua</h4>
<div class="code-block"><div class="code-label"><span>Lua — snort.lua: Network Variables</span></div><pre><code><span class="code-comment">-- Definisikan network kamu</span>
HOME_NET = '192.168.1.0/24'
EXTERNAL_NET = '!$HOME_NET'

<span class="code-comment">-- Server groups</span>
DNS_SERVERS = HOME_NET
HTTP_SERVERS = HOME_NET
SMTP_SERVERS = HOME_NET
SQL_SERVERS = HOME_NET</code></pre></div>

<div class="code-block"><div class="code-label"><span>Lua — snort.lua: IPS Section</span></div><pre><code>ips = {
    <span class="code-comment">-- Enable built-in rules</span>
    enable_builtin_rules = true,

    <span class="code-comment">-- Rule files</span>
    rules = [[
        include $RULE_PATH/snort3-community.rules
        include /etc/snort/rules/local.rules
    ]],

    <span class="code-comment">-- Variables</span>
    variables = default_variables
}</code></pre></div>

<div class="code-block"><div class="code-label"><span>Lua — snort.lua: Logging</span></div><pre><code><span class="code-comment">-- JSON alert output (mirip Suricata EVE JSON)</span>
alert_json = {
    file = true,
    limit = 100,
    fields = 'timestamp pkt_num proto pkt_gen pkt_len dir src_addr src_port dst_addr dst_port service rule action'
}

<span class="code-comment">-- Unified2 output (legacy, untuk tools seperti Barnyard2)</span>
<span class="code-comment">-- unified2 = { limit = 128 }</span></code></pre></div>

<div class="callout callout-info">
<strong>Snort 2 vs Snort 3 config:</strong> Kalau kamu menemukan tutorial lama yang pakai <code>snort.conf</code> dengan syntax seperti <code>var HOME_NET 192.168.1.0/24</code> — itu Snort 2. Snort 3 pakai <code>snort.lua</code> dengan syntax Lua. Konsepnya sama, formatnya beda.
</div>

<h4>Default File Locations</h4>
<table class="ref-table">
  <tr><th>File</th><th>Snort 2 (apt install)</th><th>Snort 3 (from source)</th></tr>
  <tr><td>Config utama</td><td><code>/etc/snort/snort.conf</code></td><td><code>/usr/local/etc/snort/snort.lua</code></td></tr>
  <tr><td>Rules directory</td><td><code>/etc/snort/rules/</code></td><td><code>/usr/local/etc/snort/rules/</code></td></tr>
  <tr><td>Log directory</td><td><code>/var/log/snort/</code></td><td><code>/var/log/snort/</code></td></tr>
</table>
`},

    { id: 'rules', title: 'Snort Rules', html: `
<p>Snort rule syntax adalah <strong>standar industri</strong> — dipakai oleh Snort, Suricata, dan banyak IDS lainnya. Kalau kamu belajar Snort rules, kamu otomatis bisa tulis rules untuk Suricata juga.</p>

<h4>Rule Sources</h4>
<table class="ref-table">
  <tr><th>Source</th><th>Akses</th><th>Update</th></tr>
  <tr><td><strong>Snort Community Rules</strong></td><td>Free, download dari snort.org</td><td>Periodic</td></tr>
  <tr><td><strong>Talos VRT Rules (Registered)</strong></td><td>Free registration, 30-day delay dari release</td><td>30 hari setelah subscriber</td></tr>
  <tr><td><strong>Talos VRT Rules (Subscriber)</strong></td><td>Paid subscription</td><td>Real-time</td></tr>
  <tr><td><strong>Custom / Local Rules</strong></td><td>Tulis sendiri</td><td>Manual</td></tr>
</table>

<h4>Download & Install Rules</h4>
<div class="code-block"><div class="code-label"><span>Bash — Download Snort Community Rules</span></div><pre><code><span class="code-comment"># Download community rules</span>
wget https://www.snort.org/downloads/community/snort3-community-rules.tar.gz

<span class="code-comment"># Extract ke rules directory</span>
sudo tar -xzf snort3-community-rules.tar.gz -C /usr/local/etc/snort/rules/

<span class="code-comment"># Atau untuk Snort 2:</span>
<span class="code-comment"># sudo tar -xzf community-rules.tar.gz -C /etc/snort/rules/</span></code></pre></div>

<h4>Contoh Rules dengan Penjelasan</h4>
<div class="code-block"><div class="code-label"><span>Snort Rules — Contoh dengan Penjelasan</span></div><pre><code><span class="code-comment"># 1. Detect SSH brute force (banyak koneksi SSH dalam waktu singkat)</span>
alert tcp any any -> $HOME_NET 22 (msg:"Possible SSH Brute Force"; \\
  flow:to_server; flags:S; \\
  threshold:type threshold, track by_src, count 5, seconds 60; \\
  classtype:attempted-admin; sid:1000001; rev:1;)

<span class="code-comment"># 2. Detect outbound connection ke Metasploit default port</span>
alert tcp $HOME_NET any -> $EXTERNAL_NET 4444 (msg:"Outbound Connection to Port 4444 - Possible Reverse Shell"; \\
  flow:to_server,established; \\
  classtype:trojan-activity; sid:1000002; rev:1;)

<span class="code-comment"># 3. Detect HTTP request dengan PowerShell download cradle</span>
alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"PowerShell Download Cradle Detected in HTTP"; \\
  flow:to_server,established; \\
  content:"powershell"; nocase; http_uri; \\
  content:"downloadstring"; nocase; http_uri; \\
  classtype:trojan-activity; sid:1000003; rev:1;)</code></pre></div>

<h4>Rule Management di Snort 3</h4>
<div class="code-block"><div class="code-label"><span>Bash — Snort 3 Rule Loading</span></div><pre><code><span class="code-comment"># Load rules via command line</span>
snort -c /usr/local/etc/snort/snort.lua \\
  --rule "alert icmp any any -> any any (msg:\\"Test ICMP\\"; sid:9999999; rev:1;)"

<span class="code-comment"># Load rules file via snort.lua ips section</span>
<span class="code-comment"># (edit snort.lua, tambahkan include di ips.rules)</span>

<span class="code-comment"># Validate rules</span>
snort -c /usr/local/etc/snort/snort.lua --warn-all 2>&1 | grep -i "rule"</code></pre></div>

<div class="callout callout-tip">
<strong>PulledPork3</strong> adalah tool untuk automate rule download dan management di Snort 3. Mirip fungsinya dengan <code>suricata-update</code> untuk Suricata. Install dari GitHub: <code>github.com/shirkdog/pulledpork3</code>.
</div>
`},

    { id: 'running', title: 'Menjalankan Snort', html: `
<h4>Snort 3 Commands</h4>
<div class="code-block"><div class="code-label"><span>Bash — Menjalankan Snort 3</span></div><pre><code><span class="code-comment"># ─── IDS Mode (live capture) ───</span>
sudo snort -c /usr/local/etc/snort/snort.lua -i eth0 -A alert_json
<span class="code-comment"># -A alert_json → output alerts dalam format JSON</span>

<span class="code-comment"># ─── Baca file PCAP ───</span>
snort -c /usr/local/etc/snort/snort.lua -r capture.pcap -A alert_json
<span class="code-comment"># Berguna untuk forensik: analisis traffic yang sudah di-capture</span>

<span class="code-comment"># ─── Test config (validate tanpa run) ───</span>
snort -c /usr/local/etc/snort/snort.lua --warn-all
<span class="code-comment"># Pastikan config valid sebelum deploy</span>

<span class="code-comment"># ─── Verbose mode (untuk debugging) ───</span>
snort -c /usr/local/etc/snort/snort.lua -i eth0 -A alert_fast -v
<span class="code-comment"># -v → tampilkan packet headers di console</span>

<span class="code-comment"># ─── IPS mode (inline via NFQUEUE) ───</span>
sudo snort -c /usr/local/etc/snort/snort.lua --daq nfq -Q
<span class="code-comment"># Perlu iptables rule untuk redirect traffic ke NFQUEUE</span>

<span class="code-comment"># ─── Multi-thread (Snort 3) ───</span>
sudo snort -c /usr/local/etc/snort/snort.lua -i eth0 -z 4
<span class="code-comment"># -z 4 → pakai 4 packet threads</span></code></pre></div>

<h4>Output Modes</h4>
<table class="ref-table">
  <tr><th>Flag</th><th>Output</th><th>Keterangan</th></tr>
  <tr><td><code>-A alert_json</code></td><td>JSON file</td><td>Structured, cocok untuk SIEM. <strong>Recommended.</strong></td></tr>
  <tr><td><code>-A alert_fast</code></td><td>One-line per alert</td><td>Quick view, gampang dibaca di terminal</td></tr>
  <tr><td><code>-A alert_full</code></td><td>Full packet info</td><td>Verbose, lebih detail tapi besar</td></tr>
  <tr><td><code>-A cmg</code></td><td>Console output</td><td>Untuk debugging — print alert langsung ke stdout</td></tr>
</table>

<h4>Membaca Alerts</h4>
<div class="code-block"><div class="code-label"><span>Bash — Reading Snort 3 Alerts</span></div><pre><code><span class="code-comment"># Kalau pakai alert_json:</span>
cat /var/log/snort/alert_json.txt | jq .

<span class="code-comment"># Kalau pakai alert_fast:</span>
tail -f /var/log/snort/alert_fast.txt

<span class="code-comment"># Contoh output alert_fast:</span>
<span class="code-comment"># 04/05-10:30:12.123456 [**] [1:1000001:1] "Possible SSH Brute Force"</span>
<span class="code-comment"># [**] [Priority: 1] {TCP} 10.0.0.5:54321 -> 192.168.1.100:22</span></code></pre></div>
`},

    { id: 'snort-vs-suricata', title: 'Snort vs Suricata — Mana yang Dipilih?', html: `
<p>Ini pertanyaan yang <em>selalu</em> muncul. Jawabannya: <strong>tergantung</strong>. Tapi ini perbandingan detail untuk bantu kamu decide:</p>

<table class="ref-table">
  <tr>
    <th>Aspek</th>
    <th>Snort 3</th>
    <th>Suricata</th>
  </tr>
  <tr>
    <td><strong>Threading</strong></td>
    <td>Multi-threaded (baru di v3)</td>
    <td>Multi-threaded (dari awal, lebih mature)</td>
  </tr>
  <tr>
    <td><strong>Rule Compatibility</strong></td>
    <td>Snort rules (native)</td>
    <td>Snort rules + Suricata-specific keywords</td>
  </tr>
  <tr>
    <td><strong>Protocol Support</strong></td>
    <td>Good (improved di v3)</td>
    <td>Wider (HTTP, TLS, DNS, SMB, SSH, FTP, SMTP, NFS, dll)</td>
  </tr>
  <tr>
    <td><strong>Config Format</strong></td>
    <td>Lua (snort.lua)</td>
    <td>YAML (suricata.yaml)</td>
  </tr>
  <tr>
    <td><strong>Output Format</strong></td>
    <td>JSON (alert_json), unified2, fast</td>
    <td>EVE JSON (comprehensive, satu file untuk semua)</td>
  </tr>
  <tr>
    <td><strong>Community</strong></td>
    <td>Cisco/Talos backed, enterprise focus</td>
    <td>OISF backed, strong open-source community</td>
  </tr>
  <tr>
    <td><strong>Rule Sources</strong></td>
    <td>Talos VRT (premium), Community (free)</td>
    <td>ET Open (free), ET Pro (premium), juga baca Snort rules</td>
  </tr>
  <tr>
    <td><strong>Install Complexity</strong></td>
    <td>Snort 2: mudah. Snort 3: complex (build from source)</td>
    <td>Mudah (apt install suricata)</td>
  </tr>
  <tr>
    <td><strong>SIEM Integration</strong></td>
    <td>Baik (tapi EVE JSON Suricata lebih "SIEM-ready")</td>
    <td>Excellent (EVE JSON = first-class citizen)</td>
  </tr>
  <tr>
    <td><strong>File Extraction</strong></td>
    <td>Limited</td>
    <td>Built-in, powerful</td>
  </tr>
  <tr>
    <td><strong>Lua Scripting</strong></td>
    <td>Yes (config + detection)</td>
    <td>Yes (detection scripts)</td>
  </tr>
  <tr>
    <td><strong>NSM Capability</strong></td>
    <td>Basic</td>
    <td>Strong (detailed protocol logs)</td>
  </tr>
</table>

<h4>Rekomendasi</h4>

<div class="callout callout-tip">
<strong>Untuk training & lab:</strong> Pakai <strong>Suricata</strong>. Alasan: install lebih mudah (<code>apt install suricata</code>), output JSON langsung kompatibel dengan Wazuh/Splunk, dokumentasi open-source lebih banyak, dan community support kuat.
</div>

<div class="callout callout-info">
<strong>Untuk production:</strong> Pilih berdasarkan <strong>existing ecosystem</strong>. Kalau organisasi sudah pakai Cisco stack → Snort lebih make sense (Talos rules, Firepower integration). Kalau organisasi pakai open-source stack (Wazuh, ELK, TheHive) → Suricata lebih natural fit.
</div>

<p><strong>Yang paling penting:</strong> keduanya pakai rule syntax yang sama. Skill yang kamu bangun di satu IDS 100% transferable ke yang lain. Jangan terlalu overthink — <em>pick one, get good at it, then the other one is easy</em>.</p>

<div class="code-block"><div class="code-label"><span>Text — Decision Flowchart</span></div><pre><code>  Mau belajar IDS/IPS?
         │
         ├─► Budget terbatas / self-learning?
         │        └─► Suricata (free, easy install, EVE JSON)
         │
         ├─► Organisasi pakai Cisco stack?
         │        └─► Snort 3 (Talos rules, Firepower compat)
         │
         ├─► Butuh deep protocol analysis?
         │        └─► Suricata + Zeek combo
         │
         └─► Nggak tau / nggak peduli?
                  └─► Suricata (path of least resistance)</code></pre></div>
`}
  ] // end sections
} // end ndr-snort

}); // end Object.assign
