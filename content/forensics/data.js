// ═══════════════════════════════════════════════════════
// FORENSICS: Wireshark, tcpdump, Volatility 3, Autopsy, FTK Imager, strings & hash
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────────
// WIRESHARK
// ─────────────────────────────────────────────
wireshark: {
  name: 'Wireshark',
  subtitle: 'Network packet analyzer. Capture dan analisis traffic — dari investigasi C2 sampai rekonstruksi file dari HTTP.',
  tags: ['tag-forensics'], tagLabels: ['Network Forensics'],
  sections: [
    { id: 'overview', title: 'Apa itu Wireshark?',
      html: `
<p>Wireshark adalah <strong>network packet analyzer</strong> paling populer di dunia. Tool ini menangkap setiap paket yang lewat di network interface, lalu menampilkannya dalam format yang bisa dibaca manusia — lengkap dengan protocol dissection, payload, timestamps, dan metadata.</p>

<p>Kalau kamu SOC analyst, Wireshark adalah senjata utama untuk:</p>
<ul>
  <li><strong>Investigasi C2 (Command &amp; Control)</strong> — lacak komunikasi malware dengan server C2. Identifikasi beaconing pattern, exfil channel, dan command execution.</li>
  <li><strong>Data Exfiltration</strong> — deteksi data yang dikirim keluar jaringan secara diam-diam via DNS tunneling, HTTP POST besar, atau ICMP covert channel.</li>
  <li><strong>Credential Sniffing</strong> — temukan password yang dikirim cleartext via HTTP Basic Auth, FTP, Telnet, atau SMTP tanpa TLS.</li>
  <li><strong>Malware Traffic Analysis</strong> — pahami behavior malware dari network perspective. Apa yang didownload? Kemana dia connect? Berapa sering?</li>
  <li><strong>Network Forensics</strong> — rekonstruksi kejadian. Apa yang terjadi di jaringan pada jam 02:00 tadi malam? Siapa yang ngomong sama siapa?</li>
  <li><strong>Troubleshooting</strong> — bukan cuma security, Wireshark juga esensial buat debug koneksi gagal, latency tinggi, packet loss, dll.</li>
</ul>

<div class="callout callout-info"><strong>GUI vs CLI:</strong> Wireshark punya dua mode. <strong>Wireshark</strong> (GUI) untuk analisis interaktif dengan visual. <strong>tshark</strong> (CLI) untuk capture dan analisis di server headless atau scripting automation. Keduanya pakai engine yang sama.</div>

<p><strong>Apa itu PCAP?</strong> PCAP (Packet Capture) adalah format file yang menyimpan network traffic. Saat kamu capture di Wireshark, hasilnya disimpan sebagai file <code>.pcap</code> atau <code>.pcapng</code>. File ini bisa dibuka ulang kapanpun, di-share ke tim, atau dianalisis dengan tool lain. Banyak challenge CTF dan sample malware traffic disediakan dalam format pcap.</p>
` },

    { id: 'install', title: 'Install',
      html: osTabs([
        { id: 'linux', icon: '🐧', label: 'Linux', html: `
<div class="code-block"><div class="code-label"><span>Bash — Ubuntu/Debian/Kali</span></div><pre><code><span class="code-comment"># Install Wireshark + tshark</span>
sudo apt update && sudo apt install wireshark tshark -y

<span class="code-comment"># Izinkan user non-root capture packet</span>
sudo usermod -aG wireshark $USER

<span class="code-comment"># Logout & login ulang, lalu cek</span>
wireshark --version
tshark --version</code></pre></div>
<div class="callout callout-tip"><strong>Non-root capture:</strong> Kalau skip <code>usermod</code>, kamu harus selalu pakai <code>sudo wireshark</code> — tidak disarankan karena security risk.</div>` },
        { id: 'windows', icon: '🪟', label: 'Windows', html: `
<div class="code-block"><div class="code-label"><span>Windows</span></div><pre><code><span class="code-comment"># Download installer dari official site:</span>
<span class="code-comment"># https://www.wireshark.org/download.html</span>

<span class="code-comment"># PENTING: saat install, pilih juga install Npcap</span>
<span class="code-comment"># Npcap = driver capture packet di Windows</span>
<span class="code-comment"># Tanpa Npcap, Wireshark gak bisa capture live traffic</span>

<span class="code-comment"># Atau via Chocolatey:</span>
choco install wireshark -y</code></pre></div>` },
        { id: 'mac', icon: '🍎', label: 'macOS', html: `
<div class="code-block"><div class="code-label"><span>Terminal</span></div><pre><code><span class="code-comment"># Via Homebrew</span>
brew install --cask wireshark

<span class="code-comment"># Atau download .dmg dari wireshark.org</span>
<span class="code-comment"># macOS mungkin perlu izin di System Preferences → Privacy</span></code></pre></div>` }
      ]) },

    { id: 'capture', title: 'Capture Traffic',
      html: `
<p>Langkah pertama analisis network: <strong>capture traffic</strong>. Kamu bisa capture live dari interface, atau buka file pcap yang sudah ada.</p>

<h4>Cara Capture</h4>
<ol>
  <li>Buka Wireshark → pilih <strong>network interface</strong> (eth0, wlan0, ens33, dll). Interface yang ada traffic-nya akan terlihat ada grafik mini.</li>
  <li>(Opsional) Set <strong>Capture Filter</strong> di kolom sebelum start.</li>
  <li>Klik tombol <strong>shark fin biru</strong> (Start Capturing) atau tekan <code>Ctrl+E</code>.</li>
  <li>Reproduksi activity yang mau diinvestigasi.</li>
  <li>Stop capture: klik tombol <strong>kotak merah</strong> atau <code>Ctrl+E</code> lagi.</li>
  <li>Save: <code>File → Save As</code> → pilih format <code>.pcapng</code> (recommended) atau <code>.pcap</code>.</li>
</ol>

<div class="callout callout-warn"><strong>Capture Filter ≠ Display Filter!</strong> Ini sumber kebingungan paling umum di Wireshark. <strong>Capture Filter</strong> diterapkan <em>saat capture</em> — paket yang tidak cocok tidak akan direkam sama sekali. <strong>Display Filter</strong> diterapkan <em>setelah capture</em> — semua paket direkam, filter hanya menampilkan yang cocok. Capture filter hemat disk space. Display filter lebih fleksibel.</div>

<h4>Capture Filter (BPF Syntax)</h4>
<p>Capture filter menggunakan <strong>Berkeley Packet Filter (BPF)</strong> syntax — sama seperti tcpdump. Diset <em>sebelum</em> mulai capture:</p>
<div class="code-block"><div class="code-label"><span>Capture Filters — BPF</span></div><pre><code><span class="code-comment"># Filter by host</span>
host 192.168.1.100
src host 10.0.0.5
dst host 8.8.8.8

<span class="code-comment"># Filter by port</span>
port 80
port 443
dst port 4444

<span class="code-comment"># Filter by network</span>
net 192.168.1.0/24
net 10.0.0.0/8

<span class="code-comment"># Filter by protocol</span>
tcp
udp
icmp

<span class="code-comment"># Kombinasi</span>
host 192.168.1.100 and port 80
tcp and not port 22
src net 10.0.0.0/8 and dst port 443</code></pre></div>
<div class="callout callout-tip"><strong>Kapan pakai Capture Filter?</strong> Saat kamu tau persis traffic apa yang kamu cari dan file size jadi concern. Misalnya: monitoring server selama 24 jam — tanpa capture filter, pcap bisa puluhan GB. Dengan filter <code>host 10.0.0.50 and port 443</code>, filenya jauh lebih kecil.</div>
` },

    { id: 'display-filters', title: 'Display Filters — Cheat Sheet',
      html: `
<p>Display filter adalah fitur paling powerful di Wireshark. Diterapkan setelah capture, jadi kamu bisa filter bolak-balik tanpa kehilangan data. Syntax-nya berbeda dari capture filter (BPF).</p>

<h4>Protocol Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>http                          <span class="code-comment"># Semua HTTP traffic</span>
dns                           <span class="code-comment"># Semua DNS queries/responses</span>
tcp                           <span class="code-comment"># Semua TCP</span>
udp                           <span class="code-comment"># Semua UDP</span>
tls                           <span class="code-comment"># Semua TLS/SSL</span>
smb || smb2                   <span class="code-comment"># SMB traffic (lateral movement)</span>
icmp                          <span class="code-comment"># ICMP (ping, tunneling)</span>
arp                           <span class="code-comment"># ARP (spoofing detection)</span>
ftp || ftp-data               <span class="code-comment"># FTP commands + data transfer</span>
ssh                           <span class="code-comment"># SSH sessions</span></code></pre></div>

<h4>IP Address Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>ip.addr == 192.168.1.100      <span class="code-comment"># Source ATAU destination</span>
ip.src == 10.0.0.5            <span class="code-comment"># Hanya source</span>
ip.dst == 8.8.8.8             <span class="code-comment"># Hanya destination</span>
ip.addr == 10.0.0.0/24        <span class="code-comment"># Subnet range</span>
!(ip.addr == 192.168.1.1)     <span class="code-comment"># Exclude IP tertentu</span></code></pre></div>

<h4>Port Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>tcp.port == 80                <span class="code-comment"># TCP port 80 (src atau dst)</span>
tcp.dstport == 4444           <span class="code-comment"># Destination port 4444 (reverse shell?)</span>
tcp.srcport == 443            <span class="code-comment"># Source port 443</span>
udp.port == 53                <span class="code-comment"># DNS (UDP)</span>
tcp.port in {80 443 8080}     <span class="code-comment"># Multiple ports</span></code></pre></div>

<h4>HTTP Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>http.request.method == "GET"          <span class="code-comment"># HTTP GET requests</span>
http.request.method == "POST"         <span class="code-comment"># POST (form submit, data exfil)</span>
http.request.uri contains "/admin"    <span class="code-comment"># URI berisi /admin</span>
http.host contains "evil"             <span class="code-comment"># Hostname suspicious</span>
http.response.code == 200             <span class="code-comment"># Successful responses</span>
http.response.code >= 400             <span class="code-comment"># Error responses</span>
http.user_agent contains "curl"       <span class="code-comment"># Non-browser User-Agent</span>
http.content_type contains "executable" <span class="code-comment"># Downloaded executables</span>
http.request.uri contains ".exe"      <span class="code-comment"># Request for .exe files</span></code></pre></div>

<h4>DNS Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>dns.qry.name contains "evil.com"      <span class="code-comment"># DNS query ke domain tertentu</span>
dns.qry.name contains ".tk"           <span class="code-comment"># TLD suspicious</span>
dns.flags.response == 0               <span class="code-comment"># Hanya DNS queries (bukan response)</span>
dns.flags.response == 1               <span class="code-comment"># Hanya DNS responses</span>
dns.flags.rcode != 0                  <span class="code-comment"># DNS errors (NXDOMAIN, dll)</span>
dns.qry.type == 16                    <span class="code-comment"># TXT records (tunneling?)</span>
dns.qry.name matches "^[a-z0-9]{30}" <span class="code-comment"># Subdomain panjang (DGA/tunnel)</span></code></pre></div>

<h4>TCP Analysis Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0  <span class="code-comment"># SYN only — scan detection</span>
tcp.flags.reset == 1                      <span class="code-comment"># RST — connection rejected</span>
tcp.analysis.retransmission               <span class="code-comment"># Retransmisi (network issue)</span>
tcp.analysis.duplicate_ack                <span class="code-comment"># Duplicate ACK</span>
tcp.analysis.zero_window                  <span class="code-comment"># Zero window (overwhelmed)</span>
tcp.analysis.flags                        <span class="code-comment"># Semua TCP analysis flags</span></code></pre></div>

<h4>TLS Filters</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter</span></div><pre><code>tls.handshake.type == 1                              <span class="code-comment"># Client Hello</span>
tls.handshake.type == 2                              <span class="code-comment"># Server Hello</span>
tls.handshake.extensions_server_name contains "evil" <span class="code-comment"># SNI check</span>
tls.handshake.ciphersuite == 0x1301                  <span class="code-comment"># Specific cipher</span>
x509af.utcTime                                       <span class="code-comment"># Certificate time</span></code></pre></div>

<h4>Kombinasi Powerful</h4>
<div class="code-block"><div class="code-label"><span>Wireshark Display Filter — Kombinasi</span></div><pre><code><span class="code-comment"># Traffic dari IP internal ke luar, bukan HTTP/HTTPS biasa</span>
ip.src == 10.0.0.0/8 &amp;&amp; !(tcp.dstport == 80 || tcp.dstport == 443)

<span class="code-comment"># POST request ke IP (bukan domain) — sering C2</span>
http.request.method == "POST" &amp;&amp; !http.host contains "."

<span class="code-comment"># DNS query yang sangat panjang (tunneling indicator)</span>
dns &amp;&amp; dns.qry.name.len > 50

<span class="code-comment"># Koneksi ke port non-standard dari workstation</span>
ip.src == 192.168.1.0/24 &amp;&amp; tcp.dstport > 1024 &amp;&amp; tcp.flags.syn == 1

<span class="code-comment"># Cari string tertentu di payload</span>
frame contains "password"
frame contains "cmd.exe"
tcp contains "powershell"</code></pre></div>
` },

    { id: 'analysis-techniques', title: 'Teknik Analisis',
      html: `
<p>Capture sudah selesai, sekarang waktunya analisis. Berikut teknik-teknik yang paling sering dipakai SOC analyst:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Follow Stream — Rekonstruksi Conversation</div>
<p>Klik kanan pada paket → <strong>Follow → TCP Stream</strong> (atau UDP/HTTP/TLS). Wireshark akan menampilkan seluruh percakapan antara client dan server dalam format readable. Warna merah = data dari client, biru = data dari server.</p>
<p><strong>Kapan pakai:</strong> Mau lihat isi percakapan HTTP lengkap, baca command C2, lihat data yang diexfil, atau debug komunikasi.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Export Objects — Ekstrak File</div>
<p><code>File → Export Objects → HTTP</code> (atau SMB, DICOM, IMF, TFTP). Wireshark akan list semua file yang ditransfer lewat protokol tersebut. Kamu bisa save satu per satu atau semuanya.</p>
<p><strong>Kapan pakai:</strong> Mau extract malware yang didownload, dokumen yang diexfil, atau file apapun yang lewat jaringan. Setelah extract, hash file → cek di VirusTotal.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Statistics → Conversations</div>
<p><code>Statistics → Conversations</code> → tab Ethernet/IPv4/TCP/UDP. Menampilkan semua pasangan komunikasi: siapa ngomong sama siapa, berapa paket, berapa bytes.</p>
<p><strong>Kapan pakai:</strong> Mau identifikasi top talkers, cari koneksi dengan volume data besar (exfiltration), atau mapping komunikasi di jaringan.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Statistics → Protocol Hierarchy</div>
<p><code>Statistics → Protocol Hierarchy</code>. Overview distribusi protokol di capture. Misalnya: 60% HTTP, 20% DNS, 10% TLS, 5% SMB, 5% lainnya.</p>
<p><strong>Kapan pakai:</strong> Quick overview capture besar. Kalau ada protokol unexpected (misal banyak ICMP atau IRC), langsung suspicious.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Expert Info</div>
<p><code>Analyze → Expert Information</code>. Wireshark otomatis mendeteksi anomali: errors (checksum bad, malformed packet), warnings (retransmission, out-of-order), notes (connection setup/teardown), chats (protocol info).</p>
<p><strong>Kapan pakai:</strong> Cari masalah di capture — error yang banyak bisa indikasi attack (malformed packets = exploitation attempt) atau network issue.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">6</span> Coloring Rules</div>
<p><code>View → Coloring Rules</code>. Customize warna berdasarkan filter. Default: hijau = HTTP, biru muda = TCP, kuning = warning, merah = error. Kamu bisa tambahkan rule kustom.</p>
<p><strong>Kapan pakai:</strong> Kalau sering investigasi tipe traffic tertentu, bikin rule warna custom. Misalnya: merah terang untuk port 4444 (reverse shell), orange untuk DNS TXT queries.</p>
</div>
` },

    { id: 'hunting-patterns', title: 'Hunting Patterns di Wireshark',
      html: `
<p>Ini pattern-pattern yang harus kamu cari saat melakukan threat hunting di pcap. Setiap pattern ada penjelasan kenapa suspicious dan filter yang bisa langsung dipakai.</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> C2 Beaconing</div>
<p>Malware yang sudah active biasanya "phone home" ke C2 server secara <strong>berkala</strong> — setiap 30 detik, 1 menit, 5 menit, dll. Regularitas ini yang bikin beda dari traffic normal.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># Cari koneksi ke IP tertentu yang dicurigai C2</span>
ip.dst == [C2_IP] &amp;&amp; tcp.flags.syn == 1

<span class="code-comment"># Lalu lihat Statistics → IO Graphs</span>
<span class="code-comment"># Set interval 60s — kalau ada spike reguler, itu beaconing</span>

<span class="code-comment"># Cari koneksi HTTP POST reguler (C2 common pattern)</span>
http.request.method == "POST" &amp;&amp; ip.dst == [C2_IP]</code></pre></div>
<p><strong>Tanda-tanda:</strong> interval koneksi konsisten, payload size mirip-mirip, sering pakai HTTP POST, URI path seringkali random atau encoded.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> DNS Tunneling</div>
<p>Attacker encode data ke dalam DNS queries. Data dimasukkan sebagai subdomain — jadi query-nya panjang banget dan random: <code>aGVsbG8gd29ybGQ.evil.com</code>.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># DNS queries dengan nama sangat panjang</span>
dns.qry.name.len > 50

<span class="code-comment"># TXT record queries (sering dipakai tunneling)</span>
dns.qry.type == 16

<span class="code-comment"># Volume DNS ke satu domain</span>
dns.qry.name contains "suspicious-domain.com"

<span class="code-comment"># Lihat Statistics → DNS → pilih "by query name"</span></code></pre></div>
<p><strong>Tanda-tanda:</strong> subdomain sangat panjang, banyak TXT queries, volume DNS abnormally high ke satu domain, karakter base64 di subdomain.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> Data Exfiltration</div>
<p>Data curian dikirim keluar jaringan. Bisa via HTTP POST besar, DNS tunneling, FTP, cloud storage, atau bahkan ICMP.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># HTTP POST dengan content-length besar (> 1MB)</span>
http.request.method == "POST" &amp;&amp; http.content_length > 1000000

<span class="code-comment"># Upload ke cloud storage</span>
tls.handshake.extensions_server_name contains "drive.google"
tls.handshake.extensions_server_name contains "dropbox"
tls.handshake.extensions_server_name contains "mega.nz"

<span class="code-comment"># Cek conversations: sort by bytes descending</span>
<span class="code-comment"># Statistics → Conversations → IPv4 → sort Bytes A→B</span></code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> Cleartext Credentials</div>
<p>Password yang dikirim tanpa enkripsi. Masih lebih umum daripada yang kamu kira.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># HTTP Basic Auth (base64 encoded, bukan encrypted!)</span>
http.authbasic

<span class="code-comment"># FTP credentials</span>
ftp.request.command == "USER" || ftp.request.command == "PASS"

<span class="code-comment"># Cari string "password" di payload</span>
frame contains "password"
frame contains "passwd"
frame contains "login"

<span class="code-comment"># HTTP form POST (login forms)</span>
http.request.method == "POST" &amp;&amp; frame contains "password"</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> Suspicious TLS</div>
<p>TLS bukan jaminan aman — malware juga pakai HTTPS. Tapi sering ada tanda-tanda yang beda dari traffic TLS normal.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># Self-signed certificates (issuer == subject)</span>
<span class="code-comment"># Cek di packet detail: TLS → Certificate → issuer vs subject</span>

<span class="code-comment"># SNI (Server Name Indication) check</span>
tls.handshake.extensions_server_name contains "."

<span class="code-comment"># TLS ke IP tanpa domain (C2 sering gak punya domain)</span>
tls &amp;&amp; !dns</code></pre></div>
<p><strong>Tanda-tanda:</strong> self-signed cert, SNI mismatch, TLS ke bare IP, certificate baru (recently issued), cipher suite lemah, JA3 hash yang known malicious.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">🔍</span> Port Scanning</div>
<p>Attacker scanning jaringan internal setelah initial foothold — bagian dari reconnaissance phase.</p>
<div class="code-block"><div class="code-label"><span>Wireshark Filter</span></div><pre><code><span class="code-comment"># Banyak SYN tanpa completion (SYN scan)</span>
tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0

<span class="code-comment"># Lalu cek Statistics → Conversations → TCP</span>
<span class="code-comment"># Satu source IP dengan BANYAK destination ports = port scan</span>

<span class="code-comment"># RST responses (port closed)</span>
tcp.flags.reset == 1

<span class="code-comment"># ICMP unreachable (filtered ports)</span>
icmp.type == 3</code></pre></div>
</div>
` },

    { id: 'tshark', title: 'tshark — CLI Mode',
      html: `
<p><code>tshark</code> adalah versi command-line dari Wireshark. Sama powerful-nya, tapi bisa dijalankan di server tanpa GUI, di-pipe ke tools lain, dan dimasukkan ke script automation.</p>

<div class="callout callout-info"><strong>Kapan pakai tshark?</strong> Saat kamu di server headless via SSH, butuh quick analysis tanpa buka GUI, atau mau automate analisis pcap dalam script.</div>

<h4>Capture Traffic</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Capture dari interface eth0, simpan ke file</span>
sudo tshark -i eth0 -w /tmp/capture.pcap

<span class="code-comment"># Capture dengan filter (BPF syntax)</span>
sudo tshark -i eth0 -f "port 80" -w /tmp/http.pcap

<span class="code-comment"># Capture 1000 paket saja</span>
sudo tshark -i eth0 -c 1000 -w /tmp/sample.pcap</code></pre></div>

<h4>Read &amp; Analyze PCAP</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Baca pcap file</span>
tshark -r capture.pcap

<span class="code-comment"># Apply display filter</span>
tshark -r capture.pcap -Y "http.request.method == POST"

<span class="code-comment"># Extract specific fields (output CSV-style)</span>
tshark -r capture.pcap -Y "dns" -T fields -e dns.qry.name -e dns.a

<span class="code-comment"># Output format JSON</span>
tshark -r capture.pcap -Y "http" -T json > http_traffic.json</code></pre></div>

<h4>One-Liner Useful Commands</h4>
<div class="code-block"><div class="code-label"><span>Bash — tshark One-Liners</span></div><pre><code><span class="code-comment"># Top 10 DNS queries</span>
tshark -r capture.pcap -Y "dns.flags.response == 0" \\
  -T fields -e dns.qry.name | sort | uniq -c | sort -rn | head -10

<span class="code-comment"># List semua HTTP URLs yang diakses</span>
tshark -r capture.pcap -Y "http.request" \\
  -T fields -e http.host -e http.request.uri

<span class="code-comment"># Extract semua User-Agent (detect unusual tools)</span>
tshark -r capture.pcap -Y "http.user_agent" \\
  -T fields -e http.user_agent | sort -u

<span class="code-comment"># Semua koneksi TCP unik (src → dst:port)</span>
tshark -r capture.pcap -Y "tcp.flags.syn==1 &amp;&amp; tcp.flags.ack==0" \\
  -T fields -e ip.src -e ip.dst -e tcp.dstport | sort -u

<span class="code-comment"># Export HTTP objects via CLI</span>
tshark -r capture.pcap --export-objects http,/tmp/exported_files/

<span class="code-comment"># Hitung total bytes per conversation</span>
tshark -r capture.pcap -q -z conv,tcp</code></pre></div>
` },

    { id: 'resources', title: 'Resources',
      html: `
<div class="link-row">
  <a class="link-btn" href="https://wiki.wireshark.org/DisplayFilters" target="_blank">↗ Display Filters Wiki</a>
  <a class="link-btn" href="https://www.wireshark.org/docs/man-pages/tshark.html" target="_blank">↗ tshark Manual</a>
  <a class="link-btn" href="https://malware-traffic-analysis.net" target="_blank">↗ Malware Traffic Analysis (PCAP Samples)</a>
  <a class="link-btn" href="https://www.netresec.com/?page=PcapFiles" target="_blank">↗ Public PCAP Repository</a>
  <a class="link-btn" href="https://unit42.paloaltonetworks.com/tag/wireshark/" target="_blank">↗ Unit42 Wireshark Tutorials</a>
  <a class="link-btn" href="https://packetlife.net/library/cheat-sheets/" target="_blank">↗ PacketLife Cheat Sheets</a>
</div>
` }
  ]
},


// ─────────────────────────────────────────────
// TCPDUMP
// ─────────────────────────────────────────────
tcpdump: {
  name: 'tcpdump',
  subtitle: 'CLI packet capture. Built-in di semua Linux. Capture di server, analisis di Wireshark.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Network Forensics','CLI'],
  sections: [
    { id: 'overview', title: 'Kenapa tcpdump?',
      html: `
<p><code>tcpdump</code> adalah tool capture packet paling fundamental di dunia Linux/Unix. Hampir pasti sudah terinstall di setiap server Linux — jadi saat kamu SSH ke production server yang compromised, <strong>tcpdump sudah siap pakai</strong> tanpa perlu install apapun.</p>

<p>Philosophy-nya simpel: <strong>capture di server, analisis di workstation</strong>. Kamu capture traffic di server dengan tcpdump, simpan sebagai file pcap, lalu buka file itu di Wireshark untuk analisis mendalam.</p>

<div class="callout callout-info"><strong>tcpdump vs Wireshark:</strong> tcpdump = <em>capture tool</em> (ringan, CLI, bisa di server headless). Wireshark = <em>analysis tool</em> (berat, GUI, untuk investigasi mendalam). Keduanya saling melengkapi, bukan kompetitor.</div>

<p><strong>Kelebihan tcpdump:</strong></p>
<ul>
  <li>Pre-installed di hampir semua Linux distro</li>
  <li>Sangat ringan — bisa running lama tanpa makan resource</li>
  <li>Bisa di-pipe ke tools lain (grep, awk, sort, dll)</li>
  <li>Bisa dijalankan via SSH di remote server</li>
  <li>Support BPF filter yang sama dengan Wireshark capture filter</li>
</ul>
` },

    { id: 'basic-capture', title: 'Basic Capture',
      html: `
<p>Semua command tcpdump membutuhkan <code>sudo</code> karena capture packet butuh akses raw socket.</p>

<div class="code-block"><div class="code-label"><span>Bash — Basic tcpdump Commands</span></div><pre><code><span class="code-comment"># Capture semua traffic di interface eth0, simpan ke file</span>
sudo tcpdump -i eth0 -w /tmp/capture.pcap

<span class="code-comment"># Capture di ANY interface (semua interface)</span>
sudo tcpdump -i any -w /tmp/capture.pcap

<span class="code-comment"># Capture traffic dari/ke host tertentu</span>
sudo tcpdump -i eth0 host 192.168.1.100 -w /tmp/host.pcap

<span class="code-comment"># Capture traffic di port tertentu</span>
sudo tcpdump -i eth0 port 80 -w /tmp/http.pcap

<span class="code-comment"># Capture traffic di network tertentu</span>
sudo tcpdump -i eth0 net 192.168.1.0/24 -w /tmp/lan.pcap

<span class="code-comment"># No DNS resolution (-n) — lebih cepat, lebih bersih</span>
sudo tcpdump -i eth0 -n -w /tmp/capture.pcap

<span class="code-comment"># Limit jumlah packet (-c)</span>
sudo tcpdump -i eth0 -n -c 100 -w /tmp/sample.pcap

<span class="code-comment"># Verbose output (-v, -vv, -vvv)</span>
sudo tcpdump -i eth0 -n -vv host 10.0.0.5

<span class="code-comment"># Tampilkan ASCII payload (-A) — bisa lihat HTTP content</span>
sudo tcpdump -i eth0 -n -A port 80

<span class="code-comment"># Tampilkan hex + ASCII (-X)</span>
sudo tcpdump -i eth0 -n -X port 80</code></pre></div>

<div class="callout callout-tip"><strong>Selalu pakai <code>-n</code></strong> untuk disable DNS resolution. Tanpa <code>-n</code>, tcpdump akan coba resolve setiap IP ke hostname — bikin output lambat dan kadang generate DNS traffic tambahan yang ikut ke-capture.</div>

<div class="callout callout-warn"><strong>Selalu pakai <code>-w</code> untuk capture serius.</strong> Output ke terminal memang enak buat quick look, tapi kalau mau analisis proper, selalu simpan ke file. Tanpa <code>-w</code>, kamu cuma lihat header — payload tidak ditampilkan lengkap.</div>
` },

    { id: 'filters', title: 'BPF Filters',
      html: `
<p>tcpdump menggunakan <strong>Berkeley Packet Filter (BPF)</strong> syntax. Filter diterapkan saat capture — paket yang tidak match filter tidak akan direkam.</p>

<div class="code-block"><div class="code-label"><span>Bash — BPF Filter Syntax</span></div><pre><code><span class="code-comment"># === Host Filters ===</span>
sudo tcpdump -i eth0 host 192.168.1.100              <span class="code-comment"># Src ATAU dst</span>
sudo tcpdump -i eth0 src host 10.0.0.5               <span class="code-comment"># Hanya source</span>
sudo tcpdump -i eth0 dst host 8.8.8.8                <span class="code-comment"># Hanya destination</span>

<span class="code-comment"># === Port Filters ===</span>
sudo tcpdump -i eth0 port 443                        <span class="code-comment"># Src ATAU dst port</span>
sudo tcpdump -i eth0 dst port 22                     <span class="code-comment"># SSH destination</span>
sudo tcpdump -i eth0 portrange 8000-9000             <span class="code-comment"># Port range</span>

<span class="code-comment"># === Network Filters ===</span>
sudo tcpdump -i eth0 net 10.0.0.0/8                  <span class="code-comment"># Subnet</span>
sudo tcpdump -i eth0 src net 192.168.0.0/16          <span class="code-comment"># Dari subnet</span>

<span class="code-comment"># === Protocol Filters ===</span>
sudo tcpdump -i eth0 tcp                             <span class="code-comment"># Hanya TCP</span>
sudo tcpdump -i eth0 udp                             <span class="code-comment"># Hanya UDP</span>
sudo tcpdump -i eth0 icmp                            <span class="code-comment"># Hanya ICMP</span>

<span class="code-comment"># === Logical Operators ===</span>
sudo tcpdump -i eth0 'host 10.0.0.5 and port 80'    <span class="code-comment"># AND</span>
sudo tcpdump -i eth0 'port 80 or port 443'           <span class="code-comment"># OR</span>
sudo tcpdump -i eth0 'not port 22'                   <span class="code-comment"># NOT (exclude SSH)</span>
sudo tcpdump -i eth0 'not (port 22 or port 53)'      <span class="code-comment"># Exclude multiple</span></code></pre></div>

<h4>Practical Combinations</h4>
<div class="code-block"><div class="code-label"><span>Bash — Real-World Filters</span></div><pre><code><span class="code-comment"># Capture hanya SSH traffic</span>
sudo tcpdump -i eth0 -n 'tcp port 22' -w ssh.pcap

<span class="code-comment"># Capture semua kecuali DNS dan SSH (reduce noise)</span>
sudo tcpdump -i eth0 -n 'not (port 53 or port 22)' -w clean.pcap

<span class="code-comment"># Capture SYN packets saja (detect port scan)</span>
sudo tcpdump -i eth0 -n 'tcp[tcpflags] &amp; tcp-syn != 0 and tcp[tcpflags] &amp; tcp-ack == 0'

<span class="code-comment"># Capture large packets (possible data exfil)</span>
sudo tcpdump -i eth0 -n 'greater 1000' -w large.pcap

<span class="code-comment"># Capture traffic ke external IPs saja (bukan RFC1918)</span>
sudo tcpdump -i eth0 -n 'not (dst net 10.0.0.0/8 or dst net 172.16.0.0/12 or dst net 192.168.0.0/16)' -w external.pcap

<span class="code-comment"># Capture ICMP yang bukan ping biasa (tunneling?)</span>
sudo tcpdump -i eth0 -n 'icmp and not icmp[icmptype] == icmp-echo and not icmp[icmptype] == icmp-echoreply'

<span class="code-comment"># HTTP traffic berisi kata tertentu</span>
sudo tcpdump -i eth0 -n -A 'port 80' | grep -i 'password\\|login\\|user'

<span class="code-comment"># Capture dari specific MAC address</span>
sudo tcpdump -i eth0 ether src aa:bb:cc:dd:ee:ff</code></pre></div>
` },

    { id: 'advanced', title: 'Advanced Usage',
      html: `
<h4>Rotate Capture Files</h4>
<p>Untuk monitoring jangka panjang, kamu gak mau satu file pcap yang berukuran 50 GB. Pakai rotation:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Rotate setiap 100 MB, simpan max 10 files</span>
sudo tcpdump -i eth0 -n -w /tmp/capture.pcap -C 100 -W 10

<span class="code-comment"># -C 100 = rotate saat file mencapai 100 MB</span>
<span class="code-comment"># -W 10  = simpan max 10 files (lalu overwrite yang lama)</span>
<span class="code-comment"># Hasilnya: capture.pcap0, capture.pcap1, ... capture.pcap9</span>

<span class="code-comment"># Rotate berdasarkan waktu (setiap 3600 detik / 1 jam)</span>
sudo tcpdump -i eth0 -n -w /tmp/capture_%Y%m%d_%H%M.pcap -G 3600

<span class="code-comment"># Kombinasi: rotate per jam, simpan max 24 files (1 hari)</span>
sudo tcpdump -i eth0 -n -w /tmp/cap_%H.pcap -G 3600 -W 24</code></pre></div>

<h4>Timestamp &amp; Snap Length</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Tampilkan timestamp human-readable</span>
sudo tcpdump -i eth0 -n -tttt

<span class="code-comment"># Snap length: berapa byte per paket yang dicapture</span>
<span class="code-comment"># Default = 262144 bytes (full packet)</span>
sudo tcpdump -i eth0 -n -s 96 -w headers_only.pcap  <span class="code-comment"># Headers saja</span>
sudo tcpdump -i eth0 -n -s 0 -w full.pcap           <span class="code-comment"># Full packet (explicit)</span></code></pre></div>

<h4>Read &amp; Quick Analysis</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Baca pcap file</span>
tcpdump -r capture.pcap -n

<span class="code-comment"># Baca dengan filter</span>
tcpdump -r capture.pcap -n 'port 80'

<span class="code-comment"># Top talkers (IP paling banyak traffic)</span>
tcpdump -r capture.pcap -n | awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -rn | head -20

<span class="code-comment"># Top destination ports</span>
tcpdump -r capture.pcap -n 'tcp' | awk '{print $5}' | cut -d. -f5 | sort | uniq -c | sort -rn | head -20

<span class="code-comment"># Hitung jumlah paket per protokol</span>
tcpdump -r capture.pcap -n | awk '{print $6}' | sort | uniq -c | sort -rn

<span class="code-comment"># Cari pattern di payload</span>
tcpdump -r capture.pcap -n -A | grep -i "cmd.exe\\|powershell\\|/bin/sh"</code></pre></div>
` },

    { id: 'workflow', title: 'Capture → Analyze Workflow',
      html: `
<p>Ini workflow standar saat kamu perlu capture traffic dari remote server untuk investigasi:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> SSH ke Server</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>ssh analyst@10.0.0.50</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Identifikasi Interface</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># List network interfaces</span>
ip addr show
<span class="code-comment"># atau</span>
tcpdump -D</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Mulai Capture</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Capture semua traffic, exclude SSH biar gak capture session sendiri</span>
sudo tcpdump -i eth0 -n 'not port 22' -w /tmp/incident_$(date +%Y%m%d_%H%M).pcap</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Reproduksi Issue / Tunggu Aktivitas</div>
<p>Biarkan capture berjalan selama aktivitas suspicious terjadi. Kalau kamu investigasi scheduled C2, capture minimal selama 2x interval yang dicurigai.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Stop Capture</div>
<p>Tekan <code>Ctrl+C</code>. tcpdump akan menampilkan jumlah paket yang ditangkap.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">6</span> Transfer ke Workstation</div>
<div class="code-block"><div class="code-label"><span>Bash — Dari workstation lokal</span></div><pre><code><span class="code-comment"># SCP: copy pcap dari server ke lokal</span>
scp analyst@10.0.0.50:/tmp/incident_*.pcap ~/cases/

<span class="code-comment"># Atau rsync (lebih reliable untuk file besar)</span>
rsync -avz --progress analyst@10.0.0.50:/tmp/incident_*.pcap ~/cases/</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">7</span> Buka di Wireshark</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>wireshark ~/cases/incident_20260405_1430.pcap</code></pre></div>
<p>Sekarang kamu bisa pakai semua fitur GUI Wireshark: display filters, follow stream, export objects, statistics, dll.</p>
</div>

<div class="callout callout-warn"><strong>JANGAN capture langsung di disk evidence!</strong> Kalau server-nya evidence (compromised machine), write pcap ke USB atau network share. Jangan nulis ke disk server — bisa overwrite deleted evidence.</div>
` }
  ]
},


// ─────────────────────────────────────────────
// VOLATILITY 3
// ─────────────────────────────────────────────
volatility: {
  name: 'Volatility 3',
  subtitle: 'Memory forensics framework. Analisis RAM dump — temukan malware, proses tersembunyi, koneksi aktif, credentials.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Memory Forensics','CLI'],
  sections: [
    { id: 'overview', title: 'Kenapa Memory Forensics?',
      html: `
<p>RAM menyimpan artifact yang <strong>tidak ada di disk</strong>. Ini termasuk:</p>
<ul>
  <li><strong>Running processes</strong> — termasuk yang sudah di-unlink dari filesystem (fileless malware)</li>
  <li><strong>Network connections</strong> — koneksi aktif yang mungkin tidak tercatat di log</li>
  <li><strong>Decrypted data</strong> — data yang di-encrypt di disk tapi sedang digunakan dalam bentuk plaintext di RAM</li>
  <li><strong>Injected code</strong> — kode yang di-inject ke proses legitimate (process hollowing, DLL injection)</li>
  <li><strong>Credentials</strong> — password hash, Kerberos tickets, session tokens yang masih ada di memory</li>
  <li><strong>Clipboard content</strong> — apa yang terakhir di-copy</li>
  <li><strong>Command history</strong> — perintah yang dijalankan di CMD/PowerShell</li>
  <li><strong>Registry hives</strong> — termasuk volatile registry keys yang hilang saat shutdown</li>
</ul>

<div class="callout callout-warn"><strong>Rule #1 Incident Response: JANGAN MATIKAN KOMPUTER yang dicurigai compromised!</strong> RAM itu <em>volatile</em> — semua artifact di atas hilang begitu mesin di-shutdown atau restart. Itulah kenapa memory acquisition dilakukan PERTAMA sebelum disk imaging.</div>

<p><strong>Volatility</strong> adalah framework open source untuk menganalisis memory dump. Dibuat oleh komunitas forensics dan dipakai di seluruh dunia — dari SOC enterprise sampai law enforcement. Volatility 3 adalah versi terbaru, rewrite total dari Volatility 2 dengan arsitektur plugin yang lebih modular.</p>
` },

    { id: 'install', title: 'Install Volatility 3',
      html: `
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Clone repository</span>
git clone https://github.com/volatilityfoundation/volatility3.git
cd volatility3

<span class="code-comment"># Install dependencies</span>
pip3 install -r requirements.txt

<span class="code-comment"># Verify instalasi</span>
python3 vol.py -h

<span class="code-comment"># Atau install via pip (lebih simpel)</span>
pip3 install volatility3
vol -h</code></pre></div>

<div class="callout callout-info"><strong>Vol2 vs Vol3:</strong> Volatility 2 butuh kamu specify "profile" (OS version exact). Volatility 3 menggunakan <strong>symbol tables</strong> yang lebih fleksibel — otomatis mendeteksi OS dari memory dump. Kalau kamu baca tutorial lama yang pakai <code>--profile=Win7SP1x64</code>, itu Vol2 syntax.</div>

<h4>Symbol Tables (Windows)</h4>
<p>Untuk analisis Windows memory dump, Volatility 3 butuh symbol tables. Download dari:</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Download Windows symbol pack</span>
<span class="code-comment"># https://downloads.volatilityfoundation.org/volatility3/symbols/windows.zip</span>

<span class="code-comment"># Extract ke folder symbols</span>
mkdir -p volatility3/symbols
cd volatility3/symbols
wget https://downloads.volatilityfoundation.org/volatility3/symbols/windows.zip
unzip windows.zip</code></pre></div>
` },

    { id: 'acquisition', title: 'Mengambil Memory Dump',
      html: `
<p>Sebelum bisa analisis, kamu harus <strong>capture RAM</strong> dari mesin yang dicurigai. Ini harus dilakukan SEBELUM disk imaging karena RAM volatile.</p>

<div class="callout callout-warn"><strong>Chain of Custody!</strong> Catat: siapa yang capture, kapan, dari mesin mana, pakai tool apa, hash file output. Semua harus terdokumentasi.</div>

<h4>Windows — FTK Imager (GUI)</h4>
<div class="code-block"><div class="code-label"><span>FTK Imager</span></div><pre><code><span class="code-comment"># Buka FTK Imager (jalankan dari USB, jangan install di evidence!)</span>
<span class="code-comment"># File → Capture Memory</span>
<span class="code-comment"># Destination Path: pilih USB external drive</span>
<span class="code-comment"># Centang "Include pagefile" (berisi data swap dari RAM)</span>
<span class="code-comment"># Klik Capture Memory</span>
<span class="code-comment"># Output: memdump.mem + pagefile.sys</span></code></pre></div>

<h4>Windows — WinPMem (CLI)</h4>
<div class="code-block"><div class="code-label"><span>CMD — Run as Administrator</span></div><pre><code><span class="code-comment"># Download: https://github.com/Velocidex/WinPmem/releases</span>
<span class="code-comment"># Jalankan dari USB drive</span>

<span class="code-comment"># Capture memory ke file</span>
winpmem_mini_x64.exe E:\\evidence\\memdump.raw

<span class="code-comment"># Output: file .raw yang bisa langsung dianalisis Volatility</span></code></pre></div>

<h4>Linux — LiME (Loadable Kernel Module)</h4>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Install build tools</span>
sudo apt install build-essential linux-headers-$(uname -r) -y

<span class="code-comment"># Clone LiME</span>
git clone https://github.com/504ensicsLabs/LiME.git
cd LiME/src &amp;&amp; make

<span class="code-comment"># Capture memory</span>
sudo insmod lime-$(uname -r).ko "path=/tmp/memdump.lime format=lime"

<span class="code-comment"># Verify</span>
ls -lh /tmp/memdump.lime</code></pre></div>

<h4>macOS — osxpmem</h4>
<div class="code-block"><div class="code-label"><span>Terminal</span></div><pre><code><span class="code-comment"># Download dari: https://github.com/Velocidex/c-aff4/releases</span>

<span class="code-comment"># Capture memory</span>
sudo osxpmem -o /tmp/memdump.aff4

<span class="code-comment"># Convert ke raw format untuk Volatility</span>
osxpmem -e /tmp/memdump.raw /tmp/memdump.aff4</code></pre></div>
` },

    { id: 'investigation-flow', title: 'Alur Investigasi Memory',
      html: `
<p>Ini alur standar yang dipakai forensic analyst saat menganalisis memory dump. Ikuti step-by-step:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Identifikasi OS</div>
<p>Langkah pertama: pastikan memory dump valid dan identifikasi OS-nya.</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>python3 vol.py -f memdump.raw windows.info</code></pre></div>
<p>Output: versi Windows, build number, waktu capture. Kalau command ini gagal, coba <code>linux.info</code> atau <code>mac.info</code>.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> List Semua Proses</div>
<p>Bandingkan <code>pslist</code> dan <code>psscan</code>. Proses yang muncul di <code>psscan</code> tapi <strong>tidak</strong> di <code>pslist</code> = kemungkinan <strong>hidden process</strong> (rootkit!).</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># List proses dari linked list (cara OS normal list proses)</span>
python3 vol.py -f memdump.raw windows.pslist

<span class="code-comment"># Scan semua memory untuk process structures (temukan hidden)</span>
python3 vol.py -f memdump.raw windows.psscan

<span class="code-comment"># Tree view — lihat parent-child relationship</span>
python3 vol.py -f memdump.raw windows.pstree</code></pre></div>
<p><strong>Yang dicari:</strong> proses dengan nama aneh, <code>svchost.exe</code> yang parent-nya bukan <code>services.exe</code>, <code>cmd.exe</code> spawn dari <code>outlook.exe</code> (macro!), proses tanpa parent.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Cek Command Line Arguments</div>
<p>Lihat command line yang dipakai untuk menjalankan setiap proses. Ini sering reveal malicious activity.</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>python3 vol.py -f memdump.raw windows.cmdline</code></pre></div>
<p><strong>Yang dicari:</strong> PowerShell dengan <code>-enc</code> (encoded command), <code>cmd.exe /c</code> dengan command suspicious, <code>certutil -urlcache -split -f</code> (download), paths di temp/appdata.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Cek Koneksi Network</div>
<p>Koneksi apa saja yang aktif saat memory di-capture? Ini bisa reveal C2 communication.</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Untuk Windows 10+</span>
python3 vol.py -f memdump.raw windows.netstat

<span class="code-comment"># Scan lebih luas (termasuk closed connections)</span>
python3 vol.py -f memdump.raw windows.netscan</code></pre></div>
<p><strong>Yang dicari:</strong> koneksi ESTABLISHED ke IP external yang tidak dikenal, proses yang seharusnya tidak punya network connection (notepad.exe?), port destination yang suspicious (4444, 8080, high ports).</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Deteksi Injected Code</div>
<p><code>malfind</code> adalah plugin paling powerful untuk deteksi malware. Dia scan memory regions yang punya permission executable tapi bukan dari file di disk.</p>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Scan semua proses untuk injected code</span>
python3 vol.py -f memdump.raw windows.malfind

<span class="code-comment"># Filter proses tertentu</span>
python3 vol.py -f memdump.raw windows.malfind --pid 1234</code></pre></div>
<p><strong>Yang dicari:</strong> regions dengan protection <code>PAGE_EXECUTE_READWRITE</code>, header <code>MZ</code> (PE file) di memory region yang bukan dari loaded DLL, shellcode patterns.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">6</span> Cek DLLs yang Loaded</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># List DLLs per proses</span>
python3 vol.py -f memdump.raw windows.dlllist --pid 1234</code></pre></div>
<p><strong>Yang dicari:</strong> DLL dari path yang unusual (temp, downloads, user profile), DLL dengan nama mirip system DLL tapi beda path (DLL hijacking).</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">7</span> Dump File Suspicious</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Dump executable dari proses suspicious</span>
python3 vol.py -f memdump.raw windows.dumpfiles --pid 1234

<span class="code-comment"># Dump proses memory (untuk analisis lebih lanjut)</span>
python3 vol.py -f memdump.raw windows.pslist --pid 1234 --dump</code></pre></div>
<p>File yang sudah di-dump bisa di-hash dan dicek di VirusTotal, atau dianalisis lebih lanjut di sandbox.</p>
</div>
` },

    { id: 'plugins-reference', title: 'Plugin Reference',
      html: `
<h4>Process Analysis</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.pslist</td><td>List proses dari EPROCESS linked list</td><td><code>vol.py -f mem.raw windows.pslist</code></td></tr>
<tr><td>windows.psscan</td><td>Scan semua memory untuk proses (temukan hidden)</td><td><code>vol.py -f mem.raw windows.psscan</code></td></tr>
<tr><td>windows.pstree</td><td>Tree view parent-child relationship</td><td><code>vol.py -f mem.raw windows.pstree</code></td></tr>
<tr><td>windows.cmdline</td><td>Command line arguments per proses</td><td><code>vol.py -f mem.raw windows.cmdline</code></td></tr>
<tr><td>windows.envars</td><td>Environment variables per proses</td><td><code>vol.py -f mem.raw windows.envars</code></td></tr>
<tr><td>windows.handles</td><td>Open handles (files, registry, mutexes)</td><td><code>vol.py -f mem.raw windows.handles --pid 1234</code></td></tr>
</table>

<h4>Network</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.netstat</td><td>Active network connections</td><td><code>vol.py -f mem.raw windows.netstat</code></td></tr>
<tr><td>windows.netscan</td><td>Scan memory untuk connection objects</td><td><code>vol.py -f mem.raw windows.netscan</code></td></tr>
</table>

<h4>Malware Detection</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.malfind</td><td>Deteksi injected code / shellcode</td><td><code>vol.py -f mem.raw windows.malfind</code></td></tr>
<tr><td>windows.vadinfo</td><td>Virtual Address Descriptor info</td><td><code>vol.py -f mem.raw windows.vadinfo --pid 1234</code></td></tr>
</table>

<h4>DLLs &amp; Modules</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.dlllist</td><td>Loaded DLLs per proses</td><td><code>vol.py -f mem.raw windows.dlllist --pid 1234</code></td></tr>
<tr><td>windows.modules</td><td>Loaded kernel modules (drivers)</td><td><code>vol.py -f mem.raw windows.modules</code></td></tr>
<tr><td>windows.modscan</td><td>Scan memory untuk kernel modules</td><td><code>vol.py -f mem.raw windows.modscan</code></td></tr>
</table>

<h4>Registry</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.registry.hivelist</td><td>List registry hives di memory</td><td><code>vol.py -f mem.raw windows.registry.hivelist</code></td></tr>
<tr><td>windows.registry.printkey</td><td>Print registry key values</td><td><code>vol.py -f mem.raw windows.registry.printkey --key "Software\\Microsoft\\Windows\\CurrentVersion\\Run"</code></td></tr>
</table>

<h4>Files &amp; Dump</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.filescan</td><td>Scan memory untuk file objects</td><td><code>vol.py -f mem.raw windows.filescan</code></td></tr>
<tr><td>windows.dumpfiles</td><td>Extract files dari memory</td><td><code>vol.py -f mem.raw windows.dumpfiles --pid 1234</code></td></tr>
</table>

<h4>Credentials</h4>
<table class="ref-table">
<tr><th>Plugin</th><th>Fungsi</th><th>Contoh</th></tr>
<tr><td>windows.hashdump</td><td>Extract NTLM password hashes</td><td><code>vol.py -f mem.raw windows.hashdump</code></td></tr>
<tr><td>windows.lsadump</td><td>LSA secrets (cached credentials)</td><td><code>vol.py -f mem.raw windows.lsadump</code></td></tr>
</table>
` },

    { id: 'real-investigation', title: 'Contoh Investigasi Nyata',
      html: `
<div class="callout callout-info"><strong>Skenario:</strong> SOC menerima alert bahwa workstation (PC-FINANCE-01, IP 10.0.0.25) melakukan koneksi mencurigakan ke IP external. Tim IR melakukan memory capture menggunakan WinPMem. File memory dump: <code>finance01.raw</code> (4 GB).</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Identifikasi OS dan Validasi</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>$ python3 vol.py -f finance01.raw windows.info

Variable        Value
Kernel Base     0xf8046a000000
DTB             0x1aa000
Is64Bit         True
NtMajorVersion  10
NtMinorVersion  0
NtBuildLab      19041.1.amd64fre.vb_release.191206-1406
<span class="code-comment"># → Windows 10 Build 19041 (Version 2004)</span></code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Cari Proses Suspicious</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>$ python3 vol.py -f finance01.raw windows.pstree

PID   PPID  ImageFileName      CreateTime
...
604   496   services.exe       2026-04-05 01:00:12
724   604   svchost.exe        2026-04-05 01:00:15
812   604   svchost.exe        2026-04-05 01:00:16
2048  604   svchost.exe        2026-04-05 03:42:08  <span class="code-comment"># ← Ini baru! Jam 3 pagi?</span>
...
3344  2048  cmd.exe            2026-04-05 03:42:15  <span class="code-comment"># ← cmd dari svchost??</span>
3512  3344  powershell.exe     2026-04-05 03:42:18  <span class="code-comment"># ← PowerShell dari cmd!</span></code></pre></div>
<p><strong>Temuan:</strong> PID 2048 (<code>svchost.exe</code>) dibuat jam 3:42 pagi — jauh setelah boot. Legitimate <code>svchost.exe</code> selalu start saat boot. Dan <code>svchost.exe</code> tidak seharusnya spawn <code>cmd.exe</code>. Ini sangat suspicious.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Cek Command Line</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>$ python3 vol.py -f finance01.raw windows.cmdline --pid 3512

PID   Process          Args
3512  powershell.exe   powershell.exe -nop -w hidden -enc aQBlAHgAIAAoA...
<span class="code-comment"># → Encoded PowerShell command! -nop (no profile) -w hidden (hidden window)</span></code></pre></div>
<p><strong>Temuan:</strong> PowerShell dijalankan dengan flags yang klasik malware: <code>-nop</code> (no profile), <code>-w hidden</code> (hidden window), <code>-enc</code> (Base64 encoded command). Ini hampir pasti malicious.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Cek Network Connections</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>$ python3 vol.py -f finance01.raw windows.netscan

Offset     Proto  LocalAddr       LocalPort  ForeignAddr      ForeignPort  State        PID  Owner
...
0xe48a1c0  TCP    10.0.0.25       49712      185.220.101.34   443          ESTABLISHED  2048 svchost.exe
<span class="code-comment"># → PID 2048 (fake svchost) connect ke IP external via HTTPS!</span></code></pre></div>
<p><strong>Temuan:</strong> PID 2048 punya koneksi ESTABLISHED ke IP <code>185.220.101.34</code> port 443. Cek IP ini di VirusTotal/AbuseIPDB — kemungkinan besar C2 server.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Deteksi Injected Code</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>$ python3 vol.py -f finance01.raw windows.malfind --pid 2048

PID   Process      Start VPN  End VPN    Tag  Protection           Hexdump   Disasm
2048  svchost.exe  0x2a40000  0x2a7ffff  VadS PAGE_EXECUTE_READWRITE
4d 5a 90 00 03 00 00 00  MZ......
<span class="code-comment"># → MZ header! Ada PE file yang di-inject ke memory svchost.exe</span></code></pre></div>
<p><strong>Temuan:</strong> malfind menemukan memory region dengan protection <code>PAGE_EXECUTE_READWRITE</code> dan header <code>MZ</code> (PE executable) di dalam proses <code>svchost.exe</code>. Ini <strong>konfirmasi injected malware</strong>.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">6</span> Dump Payload untuk Analisis</div>
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Dump files dari proses suspicious</span>
python3 vol.py -f finance01.raw windows.dumpfiles --pid 2048

<span class="code-comment"># Hash payload</span>
sha256sum pid.2048.dmp
<span class="code-comment"># → a7b8c9d0e1f2... → Cek di VirusTotal!</span></code></pre></div>
<p><strong>Kesimpulan:</strong> Fake <code>svchost.exe</code> yang dijalankan jam 3 pagi, spawn hidden PowerShell dengan encoded command, terkoneksi ke IP C2 external, dan mengandung injected PE file di memory. Ini adalah <strong>confirmed compromise</strong>.</p>
</div>
` },

    { id: 'resources', title: 'Resources',
      html: `
<div class="link-row">
  <a class="link-btn" href="https://volatility3.readthedocs.io" target="_blank">↗ Volatility 3 Docs</a>
  <a class="link-btn" href="https://github.com/volatilityfoundation/volatility3" target="_blank">↗ GitHub</a>
  <a class="link-btn" href="https://cyberdefenders.org" target="_blank">↗ CyberDefenders (Challenges)</a>
  <a class="link-btn" href="https://blueteamlabs.online" target="_blank">↗ Blue Team Labs Online</a>
  <a class="link-btn" href="https://www.sans.org/posters/memory-forensics-cheat-sheet/" target="_blank">↗ SANS Memory Forensics Poster</a>
</div>
` }
  ]
},


// ─────────────────────────────────────────────
// AUTOPSY
// ─────────────────────────────────────────────
autopsy: {
  name: 'Autopsy',
  subtitle: 'Digital forensics platform. Analisis disk image, recover file terhapus, browser history, email, timeline.',
  tags: ['tag-forensics'], tagLabels: ['Disk Forensics'],
  sections: [
    { id: 'overview', title: 'Apa itu Autopsy?',
      html: `
<p><strong>Autopsy</strong> adalah platform digital forensics open source — GUI frontend untuk <strong>The Sleuth Kit (TSK)</strong>, toolkit forensics command-line yang sudah lama dipakai di industri. Anggap aja Autopsy itu "Wireshark-nya disk forensics."</p>

<p><strong>Format yang didukung:</strong></p>
<ul>
  <li><strong>Disk images:</strong> E01 (EnCase), DD/raw, VHD, VMDK, ISO</li>
  <li><strong>Live disks:</strong> USB, HDD, SSD yang terpasang</li>
  <li><strong>Logical files:</strong> folder biasa (tanpa disk image)</li>
  <li><strong>Unallocated space:</strong> area disk dimana file terhapus mungkin masih ada</li>
</ul>

<p><strong>Apa yang bisa ditemukan Autopsy:</strong></p>
<ul>
  <li><strong>Deleted files</strong> — file terhapus yang belum di-overwrite. Bisa di-recover!</li>
  <li><strong>Browser history, bookmarks, cookies, downloads</strong> — Chrome, Firefox, Edge, IE</li>
  <li><strong>Email</strong> — Thunderbird (MBOX), Outlook (PST)</li>
  <li><strong>Documents</strong> — Office docs, PDF, images dengan EXIF metadata (GPS location!)</li>
  <li><strong>Recent activity</strong> — recent documents, USB devices yang pernah connect, installed programs</li>
  <li><strong>Registry artifacts</strong> — Windows registry keys yang berisi treasure trove of evidence</li>
  <li><strong>Timeline</strong> — semua file activity diplot di timeline kronologis</li>
  <li><strong>Keyword hits</strong> — search terms across seluruh disk (plaintext + unallocated space)</li>
</ul>

<div class="callout callout-info"><strong>Free &amp; Open Source.</strong> Autopsy didevelop oleh Basis Technology dan Brian Carrier (pembuat Sleuth Kit). Dipakai oleh law enforcement, military, dan corporate investigators di seluruh dunia. Alternatif komersial: EnCase ($$$), X-Ways ($$).</div>
` },

    { id: 'install', title: 'Install',
      html: osTabs([
        { id: 'windows', icon: '🪟', label: 'Windows (Recommended)', html: `
<div class="code-block"><div class="code-label"><span>Windows</span></div><pre><code><span class="code-comment"># Download Autopsy 4.x dari website resmi:</span>
<span class="code-comment"># https://www.autopsy.com/download/</span>

<span class="code-comment"># Pilih Windows 64-bit installer (.msi)</span>
<span class="code-comment"># Install — semua default OK</span>
<span class="code-comment"># Butuh Java Runtime (biasanya bundled)</span>

<span class="code-comment"># TIPS: Install di SSD untuk performa lebih baik</span>
<span class="code-comment"># Case output directory juga taruh di SSD</span></code></pre></div>
<div class="callout callout-tip"><strong>Autopsy 4.x di Windows</strong> adalah versi paling feature-complete. GUI modern, semua ingest modules tersedia, support multi-user cases. Ini yang direkomendasikan.</div>` },
        { id: 'linux', icon: '🐧', label: 'Linux', html: `
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Autopsy di Linux tersedia sebagai web-based UI (versi lama)</span>
sudo apt install autopsy sleuthkit -y

<span class="code-comment"># Jalankan — buka browser ke localhost:9999</span>
autopsy

<span class="code-comment"># CATATAN: Versi Linux = Autopsy 2.x (web-based, fitur terbatas)</span>
<span class="code-comment"># Untuk fitur lengkap, gunakan Autopsy 4.x di Windows</span>
<span class="code-comment"># Atau compile dari source: https://github.com/sleuthkit/autopsy</span></code></pre></div>` }
      ]) },

    { id: 'workflow', title: 'Workflow Investigasi',
      html: `
<p>Berikut step-by-step workflow investigasi disk forensics menggunakan Autopsy 4.x:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Create New Case</div>
<p>Buka Autopsy → <strong>New Case</strong>. Isi informasi:</p>
<ul>
  <li><strong>Case Name:</strong> nama kasus (contoh: "INC-2026-0042_DataBreach")</li>
  <li><strong>Case Number:</strong> nomor tiket incident</li>
  <li><strong>Examiner:</strong> nama kamu sebagai analyst</li>
  <li><strong>Base Directory:</strong> folder output (taruh di drive yang berbeda dari evidence)</li>
</ul>
<p>Informasi ini masuk ke metadata case dan penting untuk chain of custody.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Add Data Source</div>
<p><strong>Add Data Source</strong> → pilih tipe:</p>
<ul>
  <li><strong>Disk Image or VM File:</strong> file E01, DD, raw, VMDK, VHD</li>
  <li><strong>Local Disk:</strong> physical disk yang terpasang (read-only recommended!)</li>
  <li><strong>Logical Files:</strong> folder biasa yang mau dianalisis</li>
  <li><strong>Unallocated Space:</strong> raw unallocated space image</li>
</ul>
<div class="callout callout-warn"><strong>JANGAN analisis evidence disk langsung!</strong> Selalu analisis dari <em>forensic image</em> (E01/DD). Ini menjaga integritas evidence. Kalau terpaksa akses disk langsung, gunakan <strong>write blocker</strong>.</div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Configure Ingest Modules</div>
<p>Autopsy akan menampilkan daftar <strong>Ingest Modules</strong> — analyzer otomatis yang akan scan evidence. Pilih sesuai kebutuhan:</p>
<table class="ref-table">
<tr><th>Module</th><th>Fungsi</th><th>Kapan Dipakai</th></tr>
<tr><td>Recent Activity</td><td>Extract browser history, downloads, USB log, recent docs</td><td>Selalu aktifkan</td></tr>
<tr><td>Hash Lookup</td><td>Hitung hash semua file, bandingkan dengan known DB</td><td>Selalu — filter known files</td></tr>
<tr><td>File Type ID</td><td>Identifikasi real file type (bukan cuma extension)</td><td>Selalu — detect renamed files</td></tr>
<tr><td>Keyword Search</td><td>Search text di seluruh disk + unallocated</td><td>Selalu — cari IOC</td></tr>
<tr><td>Email Parser</td><td>Parse Thunderbird (MBOX), Outlook (PST)</td><td>Investigasi email</td></tr>
<tr><td>Extension Mismatch</td><td>File dengan extension yang gak match content-nya</td><td>Data hiding detection</td></tr>
<tr><td>EXIF Parser</td><td>Extract EXIF dari images (GPS, camera, timestamp)</td><td>Investigasi foto/dokumen</td></tr>
<tr><td>Encryption Detection</td><td>Detect encrypted files/volumes</td><td>Investigasi data hiding</td></tr>
<tr><td>Interesting Files</td><td>Flag files based on custom rules</td><td>Custom IOC hunting</td></tr>
</table>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Wait for Processing</div>
<p>Ingest modules jalan di background. Progress bar ada di pojok kanan bawah. Durasi tergantung ukuran evidence dan modules yang dipilih — bisa menit sampai jam untuk disk besar. Kamu bisa mulai browse results sambil ingest masih running.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Browse Results</div>
<p>Navigasi di panel kiri (tree view):</p>
<ul>
  <li><strong>Data Sources:</strong> browse file system seperti explorer</li>
  <li><strong>Views:</strong> file by type, by size, deleted files, by extension</li>
  <li><strong>Results:</strong> extracted content (web history, emails, downloads, recent docs, installed programs)</li>
  <li><strong>Tags:</strong> files yang sudah kamu tag sebagai interesting/notable</li>
  <li><strong>Timeline:</strong> chronological view of all file activity</li>
</ul>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">6</span> Generate Report</div>
<p><strong>Generate Report</strong> → pilih format (HTML, Excel, KML). Report berisi semua tagged items, bookmarked artifacts, dan summary findings. Ini yang kamu lampirkan ke case documentation.</p>
</div>
` },

    { id: 'key-artifacts', title: 'Artifact yang Dicari',
      html: `
<p>Saat investigasi disk forensics, ini kategori artifact yang paling sering dicari dan dimana menemukannya di Autopsy:</p>

<h4>Web Activity</h4>
<table class="ref-table">
<tr><th>Artifact</th><th>Lokasi di Autopsy</th><th>Relevansi</th></tr>
<tr><td>Browser History</td><td>Results → Extracted Content → Web History</td><td>Situs yang dikunjungi, timestamp, visit count</td></tr>
<tr><td>Downloads</td><td>Results → Extracted Content → Web Downloads</td><td>File yang didownload (malware?)</td></tr>
<tr><td>Bookmarks</td><td>Results → Extracted Content → Web Bookmarks</td><td>Situs yang di-bookmark</td></tr>
<tr><td>Cookies</td><td>Results → Extracted Content → Web Cookies</td><td>Sessions, login status</td></tr>
<tr><td>Form Data</td><td>Results → Extracted Content → Web Form Autofill</td><td>Data yang pernah diisi di form</td></tr>
<tr><td>Cache</td><td>Views → File Types → Images/Documents</td><td>Cached web content (bisa recover halaman)</td></tr>
</table>

<h4>File System</h4>
<table class="ref-table">
<tr><th>Artifact</th><th>Lokasi di Autopsy</th><th>Relevansi</th></tr>
<tr><td>Deleted Files</td><td>Views → Deleted Files</td><td>File terhapus yang bisa di-recover</td></tr>
<tr><td>File Metadata</td><td>Select file → Content tab</td><td>MAC times, size, hash, path</td></tr>
<tr><td>File Signatures</td><td>Results → Extension Mismatch</td><td>File yang extension-nya di-rename (hiding data)</td></tr>
</table>

<h4>User Activity</h4>
<table class="ref-table">
<tr><th>Artifact</th><th>Lokasi di Autopsy</th><th>Relevansi</th></tr>
<tr><td>Recent Documents</td><td>Results → Extracted Content → Recent Documents</td><td>File terakhir dibuka</td></tr>
<tr><td>USB Devices</td><td>Results → Extracted Content → USB Device Attached</td><td>USB yang pernah connect (exfil?)</td></tr>
<tr><td>Installed Programs</td><td>Results → Extracted Content → Installed Programs</td><td>Software yang terinstall</td></tr>
<tr><td>User Accounts</td><td>Results → OS Accounts</td><td>User accounts di mesin</td></tr>
</table>

<h4>Timeline Analysis</h4>
<p><strong>MAC times</strong> (Modified, Accessed, Changed/Created) adalah fondasi timeline forensics:</p>
<ul>
  <li><strong>Modified:</strong> kapan konten file terakhir diubah</li>
  <li><strong>Accessed:</strong> kapan file terakhir dibuka/dibaca</li>
  <li><strong>Changed (NTFS) / Created:</strong> kapan metadata terakhir diubah / file dibuat</li>
</ul>
<p>Di Autopsy: <strong>Timeline tab</strong> → set date range sesuai incident window → lihat semua file activity dalam range itu. Ini sangat powerful untuk reconstruct "apa yang terjadi saat incident."</p>

<div class="callout callout-tip"><strong>Tips Timeline:</strong> Narrow date range ke window incident. Misalnya alert masuk jam 14:00, cek timeline dari jam 12:00-16:00. Terlalu lebar = terlalu banyak noise.</div>
` },

    { id: 'tips', title: 'Tips &amp; Best Practices',
      html: `
<div class="scenario-card">
<div class="sc-head"><span class="sc-num">💡</span> Hash Set Lookup</div>
<p>Import hash sets untuk filtering otomatis:</p>
<ul>
  <li><strong>NSRL (National Software Reference Library)</strong> — hash semua known legitimate software. Import ini agar Autopsy otomatis <em>skip</em> file OS dan software umum. Hasilnya: kamu cuma perlu fokus ke file yang <em>unknown</em>.</li>
  <li><strong>Known Malware Hashes</strong> — import hash list dari VirusTotal, MalwareBazaar, atau internal IOC. File yang match otomatis di-flag.</li>
</ul>
<p>Setup: Tools → Options → Hash Sets → New Hash Set → import.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">💡</span> Keyword Search</div>
<p>Search di seluruh disk termasuk unallocated space. Pattern yang berguna:</p>
<ul>
  <li>IP addresses dari IOC list</li>
  <li>Domain names suspicious</li>
  <li>Email addresses</li>
  <li>Credit card patterns (regex)</li>
  <li>Specific filenames atau strings</li>
</ul>
<p>Bisa pakai regex. Results termasuk file terhapus dan data di unallocated space!</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">💡</span> Tagging Artifacts</div>
<p>Klik kanan artifact → <strong>Tag</strong>. Gunakan tags untuk organize findings: "Notable", "Follow Up", "Suspicious". Semua tagged items masuk ke report akhir. Ini best practice untuk keep track apa yang sudah dilihat dan apa yang penting.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">💡</span> Chain of Custody</div>
<p>Selalu catat: siapa analyst, kapan mulai analisis, hash dari evidence file (sebelum dan sesudah), tools yang dipakai, apa yang ditemukan. Autopsy otomatis log actions di database case — tapi tetap dokumentasi manual juga penting.</p>
</div>
` },

    { id: 'resources', title: 'Resources',
      html: `
<div class="link-row">
  <a class="link-btn" href="https://www.autopsy.com/download/" target="_blank">↗ Download Autopsy</a>
  <a class="link-btn" href="https://sleuthkit.org/autopsy/docs/user-docs/4.21.0/" target="_blank">↗ User Guide</a>
  <a class="link-btn" href="https://github.com/sleuthkit/autopsy" target="_blank">↗ GitHub</a>
  <a class="link-btn" href="https://cfreds.nist.gov/" target="_blank">↗ NIST CFReDS (Test Images)</a>
  <a class="link-btn" href="https://www.digitalcorpora.org/corpora/scenarios" target="_blank">↗ Digital Corpora (Practice)</a>
</div>
` }
  ]
},


// ─────────────────────────────────────────────
// FTK IMAGER
// ─────────────────────────────────────────────
ftk: {
  name: 'FTK Imager',
  subtitle: 'Forensic imaging tool. Buat disk image bit-by-bit tanpa ubah evidence — prosedur chain of custody.',
  tags: ['tag-forensics'], tagLabels: ['Disk Acquisition'],
  sections: [
    { id: 'overview', title: 'Apa itu FTK Imager?',
      html: `
<p><strong>FTK Imager</strong> dari Exterro (sebelumnya AccessData) adalah tool standar industri untuk <strong>forensic disk imaging</strong>. Fungsi utamanya: membuat salinan bit-by-bit dari storage device (HDD, SSD, USB, memory card) tanpa mengubah satu byte pun dari evidence asli.</p>

<p><strong>Kenapa imaging penting?</strong></p>
<ul>
  <li><strong>Preserve evidence:</strong> analisis dilakukan di salinan, bukan barang bukti asli</li>
  <li><strong>Chain of custody:</strong> hash membuktikan image identik dengan aslinya</li>
  <li><strong>Legal admissibility:</strong> evidence yang di-image dengan benar diterima di pengadilan</li>
  <li><strong>Reproducibility:</strong> multiple analyst bisa analisis salinan yang sama</li>
  <li><strong>Safety:</strong> kalau salah operasi, evidence asli tetap aman</li>
</ul>

<p><strong>Format Image:</strong></p>
<table class="ref-table">
<tr><th>Format</th><th>Extension</th><th>Kelebihan</th><th>Kekurangan</th></tr>
<tr><td>E01 (EnCase)</td><td>.E01</td><td>Compressed, metadata, hash built-in, segmented</td><td>Proprietary format</td></tr>
<tr><td>DD / Raw</td><td>.dd, .raw, .img</td><td>Simple, universal, compatible semua tools</td><td>Tidak compressed, besar</td></tr>
<tr><td>AFF</td><td>.aff</td><td>Open source, compressed, metadata</td><td>Less common</td></tr>
</table>

<div class="callout callout-tip"><strong>Rekomendasi:</strong> Pakai <strong>E01</strong> untuk kasus serius — compressed (hemat space), ada metadata case, hash otomatis, bisa di-split ke segment files. FTK Imager, Autopsy, Volatility, EnCase semua support E01.</div>

<div class="callout callout-warn"><strong>Windows only.</strong> FTK Imager hanya tersedia untuk Windows. Alternatif Linux: <code>dd</code>, <code>dc3dd</code>, <code>ewfacquire</code> (libewf).</div>
` },

    { id: 'install', title: 'Download &amp; Install',
      html: `
<div class="code-block"><div class="code-label"><span>Windows</span></div><pre><code><span class="code-comment"># Download gratis (butuh registrasi email):</span>
<span class="code-comment"># https://www.exterro.com/digital-forensics-software/ftk-imager</span>

<span class="code-comment"># Install — semua default OK</span>
<span class="code-comment"># Tidak butuh license key (free tool)</span>

<span class="code-comment"># BEST PRACTICE: copy installer ke USB drive</span>
<span class="code-comment"># Saat incident, jalankan FTK Imager dari USB</span>
<span class="code-comment"># JANGAN install di mesin evidence!</span></code></pre></div>
<div class="callout callout-info"><strong>Portable version:</strong> FTK Imager bisa dijalankan dari USB tanpa install. Copy folder program ke USB → jalankan langsung. Ini penting saat kamu harus capture evidence dari mesin yang tidak boleh dimodifikasi.</div>
` },

    { id: 'disk-imaging', title: 'Membuat Disk Image',
      html: `
<p>Ini langkah detail membuat forensic image dari physical disk:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Buka FTK Imager → File → Create Disk Image</div>
<p>Akan muncul dialog untuk memilih sumber evidence.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Pilih Source Type</div>
<table class="ref-table">
<tr><th>Option</th><th>Kapan Dipakai</th></tr>
<tr><td>Physical Drive</td><td>Image seluruh disk (termasuk unallocated space, deleted files) — <strong>RECOMMENDED</strong></td></tr>
<tr><td>Logical Drive</td><td>Image satu partition saja (C:, D:, dll)</td></tr>
<tr><td>Image File</td><td>Convert format image (DD → E01, dll)</td></tr>
<tr><td>Contents of a Folder</td><td>Image folder spesifik saja (bukan full disk)</td></tr>
</table>
<p><strong>Untuk forensics lengkap, selalu pilih Physical Drive.</strong></p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Pilih Destination Format</div>
<p>Klik <strong>Add</strong> → pilih <strong>E01</strong> (recommended). Lalu isi informasi case:</p>
<ul>
  <li><strong>Case Number:</strong> nomor case/ticket (contoh: INC-2026-0042)</li>
  <li><strong>Evidence Number:</strong> nomor evidence (contoh: E001)</li>
  <li><strong>Unique Description:</strong> deskripsi device (contoh: "Dell Latitude 5520 — suspect workstation")</li>
  <li><strong>Examiner:</strong> nama kamu</li>
  <li><strong>Notes:</strong> catatan tambahan (serial number, lokasi pengambilan, dll)</li>
</ul>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> Set Destination Path &amp; Options</div>
<ul>
  <li><strong>Image Destination Folder:</strong> pilih drive EXTERNAL (jangan tulis ke evidence disk!)</li>
  <li><strong>Image Filename:</strong> deskriptif (contoh: "INC-2026-0042_E001_Dell5520")</li>
  <li><strong>Image Fragment Size:</strong> 0 = satu file, atau set 2048 MB untuk split (berguna kalau target FAT32)</li>
  <li><strong>Compression:</strong> default (6) OK untuk balance speed/size</li>
</ul>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">5</span> Start Imaging</div>
<p>Centang <strong>"Verify images after they are created"</strong> — ini akan auto-verify hash setelah imaging selesai. Klik <strong>Start</strong>.</p>
<p>Durasi: tergantung ukuran disk dan kecepatan USB. Rule of thumb: 500 GB ≈ 1-3 jam via USB 3.0.</p>
</div>

<div class="callout callout-warn"><strong>PENTING:</strong> Image ke drive EXTERNAL yang berbeda dari source. Jangan pernah image ke disk yang sama — ini mengubah evidence (menimpa unallocated space). Gunakan external HDD/SSD dengan kapasitas lebih besar dari evidence disk.</div>
` },

    { id: 'hash-verification', title: 'Verifikasi Hash',
      html: `
<p>Setelah imaging selesai, FTK Imager otomatis menghitung <strong>MD5 dan SHA1 hash</strong> dari image dan membandingkannya dengan source. Ini adalah langkah paling kritis dalam forensics.</p>

<h4>Kenapa Hash Penting?</h4>
<ul>
  <li><strong>Proof of authenticity:</strong> hash membuktikan image adalah salinan EXACT dari source — tidak ada byte yang berubah, tidak ada yang ditambahkan, tidak ada yang hilang.</li>
  <li><strong>Tamper detection:</strong> kalau seseorang mengubah image setelah acquisition, hash akan berbeda. Ini proteksi integritas evidence.</li>
  <li><strong>Legal requirement:</strong> di pengadilan, kamu harus bisa buktikan evidence tidak dimanipulasi. Hash adalah buktinya.</li>
</ul>

<h4>Proses Verifikasi</h4>
<div class="code-block"><div class="code-label"><span>FTK Imager Output</span></div><pre><code><span class="code-comment"># Setelah imaging selesai, FTK Imager menampilkan:</span>

[Computed Hashes]
MD5 checksum:    d41d8cd98f00b204e9800998ecf8427e
SHA1 checksum:   da39a3ee5e6b4b0d3255bfef95601890afd80709

[Verify Results]
MD5 hash verified   : match ✓
SHA1 hash verified  : match ✓

<span class="code-comment"># MATCH = image identik dengan source → proceed</span>
<span class="code-comment"># MISMATCH = ada masalah! → re-image</span></code></pre></div>

<h4>Verifikasi Ulang di Kemudian Hari</h4>
<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Verifikasi hash image setelah dipindahkan/disimpan</span>
Get-FileHash -Path "E:\\evidence\\INC-2026-0042.E01" -Algorithm SHA1
Get-FileHash -Path "E:\\evidence\\INC-2026-0042.E01" -Algorithm MD5

<span class="code-comment"># Bandingkan dengan hash yang dicatat saat acquisition</span></code></pre></div>

<div class="callout callout-warn"><strong>CATAT HASH!</strong> Simpan hash di dokumen terpisah, di chain of custody form, dan di case management system. Hash ini harus bisa dicocokkan kapanpun — bahkan bertahun-tahun kemudian saat kasus masuk pengadilan.</div>
` },

    { id: 'memory-capture', title: 'Capture RAM',
      html: `
<p>Selain disk imaging, FTK Imager juga bisa <strong>capture RAM (memory)</strong>. Ini harus dilakukan <strong>SEBELUM</strong> disk imaging karena RAM volatile — hilang saat mesin dimatikan.</p>

<h4>Langkah Capture RAM</h4>
<ol>
  <li>Buka FTK Imager → <strong>File → Capture Memory</strong></li>
  <li><strong>Destination Path:</strong> pilih USB external drive</li>
  <li>Centang <strong>"Include pagefile"</strong> — pagefile.sys berisi data yang pernah ada di RAM tapi di-swap ke disk. Bisa berisi password, data proses, dll.</li>
  <li>Klik <strong>Capture Memory</strong></li>
  <li>Tunggu selesai — output file <code>.mem</code></li>
</ol>

<div class="callout callout-info"><strong>Output:</strong> File <code>.mem</code> yang dihasilkan bisa langsung dianalisis dengan <strong>Volatility</strong>. Ukuran file = ukuran RAM mesin (8 GB RAM → 8 GB file).</div>

<h4>Urutan Acquisition yang Benar</h4>
<div class="code-block"><div class="code-label"><span>Best Practice — Order of Volatility</span></div><pre><code><span class="code-comment"># 1. PERTAMA: Capture RAM (paling volatile!)</span>
FTK Imager → File → Capture Memory → USB drive

<span class="code-comment"># 2. KEDUA: Capture disk image</span>
FTK Imager → File → Create Disk Image → USB drive

<span class="code-comment"># 3. Setelah selesai: verify hash keduanya</span>
<span class="code-comment"># 4. Dokumentasi: catat semua hash, waktu, dan langkah</span></code></pre></div>
` },

    { id: 'preview-extract', title: 'Preview &amp; Extract Files',
      html: `
<p>FTK Imager juga bisa dipakai untuk <strong>quick preview</strong> — browse isi disk/image tanpa mounting, tanpa mengubah evidence.</p>

<h4>Preview Evidence</h4>
<ol>
  <li><strong>File → Add Evidence Item</strong></li>
  <li>Pilih source (Physical Drive, Logical Drive, atau Image File)</li>
  <li>Browse file system di panel kiri</li>
  <li>Preview file di panel kanan (hex view, text view, image preview)</li>
</ol>

<h4>Extract Individual Files</h4>
<p>Klik kanan pada file → <strong>Export Files</strong>. File akan di-copy keluar tanpa mengubah evidence asli.</p>

<p><strong>Kapan pakai preview:</strong></p>
<ul>
  <li><strong>Quick triage</strong> — sebelum full imaging yang memakan waktu lama, cek dulu apakah evidence relevan</li>
  <li><strong>Extract specific files</strong> — butuh satu file tertentu dari disk tanpa harus image seluruh disk</li>
  <li><strong>Verify image content</strong> — setelah imaging, buka image di FTK Imager untuk pastikan isinya benar</li>
  <li><strong>Browse deleted files</strong> — FTK Imager bisa lihat file terhapus (ditandai dengan X merah)</li>
</ul>

<div class="callout callout-tip"><strong>Hex viewer</strong> di FTK Imager sangat berguna. Kamu bisa lihat raw bytes dari file — berguna untuk identifikasi file signature (magic bytes), cek apakah file corrupt, atau lihat string di binary.</div>
` },

    { id: 'chain-of-custody', title: 'Chain of Custody',
      html: `
<p><strong>Chain of Custody</strong> (CoC) adalah dokumentasi yang mencatat SIAPA yang handle evidence, KAPAN, DAN APA yang dilakukan. Tanpa CoC yang proper, evidence bisa <strong>ditolak di pengadilan</strong>.</p>

<h4>Yang Harus Didokumentasi</h4>
<table class="ref-table">
<tr><th>Field</th><th>Contoh</th></tr>
<tr><td>Case Number</td><td>INC-2026-0042</td></tr>
<tr><td>Evidence Number</td><td>E001</td></tr>
<tr><td>Description</td><td>Dell Latitude 5520, S/N: ABC123, 512GB SSD</td></tr>
<tr><td>Acquired By</td><td>Analyst: Budi Santoso</td></tr>
<tr><td>Date/Time Acquired</td><td>2026-04-05 14:30 WIB</td></tr>
<tr><td>Location</td><td>Kantor Finance, Lantai 3, Desk 12</td></tr>
<tr><td>Acquisition Tool</td><td>FTK Imager 4.7.1.2</td></tr>
<tr><td>Image Format</td><td>E01 (compressed)</td></tr>
<tr><td>MD5 Hash</td><td>d41d8cd98f00b204e9800998ecf8427e</td></tr>
<tr><td>SHA1 Hash</td><td>da39a3ee5e6b4b0d3255bfef95601890afd80709</td></tr>
<tr><td>Storage Location</td><td>Evidence Locker B, Shelf 3, Bag #42</td></tr>
</table>

<h4>Kenapa Penting</h4>
<ul>
  <li><strong>Legal:</strong> evidence tanpa CoC tidak diterima di pengadilan. Defense attorney akan challenge: "Bagaimana kita tahu evidence ini tidak dimanipulasi?"</li>
  <li><strong>Integrity:</strong> hash membuktikan data tidak berubah, CoC membuktikan proses handling proper</li>
  <li><strong>Accountability:</strong> jelas siapa yang bertanggung jawab atas evidence di setiap titik waktu</li>
  <li><strong>Reproducibility:</strong> analyst lain bisa mengulangi langkah yang sama dan mendapat hasil yang sama</li>
</ul>

<div class="callout callout-warn"><strong>Setiap kali evidence berpindah tangan, CATAT.</strong> Dari analyst A ke analyst B, dari lab ke storage, dari storage ke pengadilan — semuanya harus ada record. Satu gap di chain = seluruh evidence bisa invalid.</div>
` }
  ]
},


// ─────────────────────────────────────────────
// STRINGS & HASH (misc)
// ─────────────────────────────────────────────
misc: {
  name: 'strings & hash',
  subtitle: 'Utility dasar tapi powerful. Langkah pertama malware analysis dan evidence verification.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Malware Analysis','CLI'],
  sections: [
    { id: 'strings-overview', title: 'strings — Apa dan Kenapa?',
      html: `
<p><code>strings</code> mengekstrak semua text yang bisa dibaca (ASCII/Unicode) dari file binary. Tool ini <strong>langkah pertama</strong> dalam malware analysis — sebelum reverse engineering yang kompleks, jalankan <code>strings</code> dulu untuk cari petunjuk cepat.</p>

<p><strong>Apa yang bisa ditemukan dari strings:</strong></p>
<ul>
  <li><strong>URLs dan IP addresses</strong> — alamat C2 server, download URLs</li>
  <li><strong>Filenames dan paths</strong> — file yang dibuat/diakses malware</li>
  <li><strong>Registry keys</strong> — persistence mechanism</li>
  <li><strong>Error messages</strong> — debug strings yang lupa dihapus developer malware</li>
  <li><strong>C2 domains</strong> — domain untuk command &amp; control</li>
  <li><strong>Credentials</strong> — hardcoded passwords, API keys</li>
  <li><strong>Anti-analysis strings</strong> — "VMware", "VirtualBox", "sandbox" (evasion check)</li>
  <li><strong>Encryption keys</strong> — kadang hardcoded di binary</li>
  <li><strong>PDB paths</strong> — path debug symbols yang reveal developer's username/project name</li>
</ul>

<div class="callout callout-info"><strong>Real story:</strong> Banyak kasus dimana C2 server ditemukan hanya dari menjalankan <code>strings</code> pada file malware. Attacker sering hardcode URL/IP di binary — terutama malware "murah" atau commodity malware. Satu command <code>strings malware.exe | grep http</code> bisa langsung kasih jawaban.</div>
` },

    { id: 'strings-usage', title: 'strings — Usage',
      html: osTabs([
        { id: 'linux', icon: '🐧', label: 'Linux/macOS', html: `
<div class="code-block"><div class="code-label"><span>Bash — strings (built-in)</span></div><pre><code><span class="code-comment"># Basic usage — extract semua readable strings</span>
strings malware.exe

<span class="code-comment"># Minimum length — default 4, naikkan untuk reduce noise</span>
strings -n 8 malware.exe       <span class="code-comment"># Minimum 8 karakter</span>
strings -n 12 malware.exe      <span class="code-comment"># Minimum 12 — lebih clean</span>

<span class="code-comment"># Unicode strings (Wide strings — malware Windows sering pakai)</span>
strings -el malware.exe        <span class="code-comment"># Little-endian 16-bit (UTF-16LE)</span>
strings -eb malware.exe        <span class="code-comment"># Big-endian 16-bit</span>

<span class="code-comment"># Gabungkan ASCII + Unicode</span>
(strings malware.exe; strings -el malware.exe) | sort -u

<span class="code-comment"># ═══════════════════════════════</span>
<span class="code-comment"># PRACTICAL PIPELINES</span>
<span class="code-comment"># ═══════════════════════════════</span>

<span class="code-comment"># Cari URLs</span>
strings malware.exe | grep -Ei "https?://"

<span class="code-comment"># Cari IP addresses</span>
strings malware.exe | grep -oE "([0-9]{1,3}\\.){3}[0-9]{1,3}"

<span class="code-comment"># Cari email addresses</span>
strings malware.exe | grep -oEi "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}"

<span class="code-comment"># Cari Windows registry keys</span>
strings malware.exe | grep -i "HKEY\\|CurrentVersion\\\\Run\\|Software\\\\Microsoft"

<span class="code-comment"># Cari file paths</span>
strings malware.exe | grep -Ei "C:\\\\|%TEMP%|%APPDATA%|/tmp/|/etc/"

<span class="code-comment"># Cari Base64 encoded strings (panjang, charset base64)</span>
strings malware.exe | grep -E "^[A-Za-z0-9+/]{20,}={0,2}$"

<span class="code-comment"># Cari PowerShell commands</span>
strings malware.exe | grep -i "powershell\\|invoke-\\|downloadstring\\|iex\\|bypass"

<span class="code-comment"># Cari DLL imports yang suspicious</span>
strings malware.exe | grep -i "VirtualAlloc\\|WriteProcessMemory\\|CreateRemoteThread"

<span class="code-comment"># Simpan semua strings ke file untuk analisis lebih lanjut</span>
strings -n 6 malware.exe > malware_strings_ascii.txt
strings -n 6 -el malware.exe > malware_strings_unicode.txt</code></pre></div>` },
        { id: 'windows', icon: '🪟', label: 'Windows', html: `
<div class="code-block"><div class="code-label"><span>CMD / PowerShell</span></div><pre><code><span class="code-comment"># Windows tidak punya strings bawaan</span>
<span class="code-comment"># Download Sysinternals Strings:</span>
<span class="code-comment"># https://learn.microsoft.com/en-us/sysinternals/downloads/strings</span>

<span class="code-comment"># Basic usage</span>
strings64.exe malware.exe

<span class="code-comment"># Minimum length</span>
strings64.exe -n 8 malware.exe

<span class="code-comment"># Hanya ASCII</span>
strings64.exe -a malware.exe

<span class="code-comment"># Hanya Unicode</span>
strings64.exe -u malware.exe

<span class="code-comment"># Cari URL (PowerShell pipeline)</span>
strings64.exe malware.exe | Select-String "http"

<span class="code-comment"># Cari IP address</span>
strings64.exe malware.exe | Select-String "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}"

<span class="code-comment"># Simpan ke file</span>
strings64.exe -n 6 malware.exe > strings_output.txt</code></pre></div>
<div class="callout callout-tip"><strong>Sysinternals Strings</strong> sekarang bisa diinstall via <code>winget install sysinternals</code> atau download individual dari Microsoft.</div>` }
      ]) },

    { id: 'strings-examples', title: 'strings — Real Examples',
      html: `
<p>Berikut contoh apa yang bisa ditemukan saat menjalankan <code>strings</code> pada file suspicious:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Malware dengan Hardcoded C2 URL</div>
<div class="code-block"><div class="code-label"><span>Output strings</span></div><pre><code>$ strings -n 8 suspicious.exe | grep -Ei "http|\\.com|\\.xyz|\\.top"

http://185.220.101.34:8080/gate.php
http://evil-c2.xyz/beacon
https://pastebin.com/raw/Ab3xY9z2
Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/x-www-form-urlencoded
POST /submit.php HTTP/1.1</code></pre></div>
<p><strong>Temuan:</strong> C2 URL (<code>gate.php</code>, <code>/beacon</code> = common C2 path), User-Agent string (spoofing browser), POST request ke <code>submit.php</code> (data exfiltration endpoint). IP <code>185.220.101.34</code> bisa langsung dicek di VirusTotal.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Document dengan Embedded Macro</div>
<div class="code-block"><div class="code-label"><span>Output strings</span></div><pre><code>$ strings -n 8 invoice.docm

ThisDocument
VBA_PROJECT
Module1
Auto_Open
Shell
cmd.exe /c
powershell -nop -w hidden -enc
WScript.Shell
HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run
%TEMP%\\update.exe</code></pre></div>
<p><strong>Temuan:</strong> <code>Auto_Open</code> = macro yang jalan otomatis saat dokumen dibuka. <code>cmd.exe</code> + <code>powershell -enc</code> = classic malicious macro chain. Persistence via <code>CurrentVersion\\Run</code> registry. Drops file ke <code>%TEMP%</code>. Ini textbook phishing document.</p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Executable dengan Anti-Analysis</div>
<div class="code-block"><div class="code-label"><span>Output strings</span></div><pre><code>$ strings -n 6 trojan.exe | grep -Ei "vmware|virtual|sandbox|debug|wireshark"

VMwareVMware
VBoxService.exe
SbieDll.dll
sbiedll.dll
wireshark.exe
ollydbg.exe
x64dbg.exe
IsDebuggerPresent
CheckRemoteDebuggerPresent</code></pre></div>
<p><strong>Temuan:</strong> Malware ini melakukan <strong>sandbox detection</strong> — dia cek apakah berjalan di VM (VMware, VirtualBox), sandbox (Sandboxie/SbieDll), atau sedang di-debug (Wireshark, OllyDbg, x64dbg). Kalau terdeteksi, malware biasanya tidak jalan (dormant) untuk menghindari analisis.</p>
</div>
` },

    { id: 'hash-overview', title: 'Hash — Apa dan Kenapa?',
      html: `
<p><strong>Hash</strong> adalah "sidik jari" digital dari sebuah file. Algoritma hash mengubah file menjadi string fixed-length yang unik. Kalau file berubah satu byte saja, hash-nya berubah total. Ini properti yang membuatnya sangat berguna dalam forensics.</p>

<p><strong>Dua kegunaan utama hash:</strong></p>
<ol>
  <li><strong>Verification</strong> — buktikan bahwa file tidak berubah. Dipakai untuk evidence integrity, update verification, download verification.</li>
  <li><strong>Identification</strong> — identifikasi file tanpa perlu membukanya. Hash file → cek di database (VirusTotal, MalwareBazaar, NSRL) → tau langsung apakah malware, legitimate, atau unknown.</li>
</ol>

<h4>Algoritma Hash</h4>
<table class="ref-table">
<tr><th>Algoritma</th><th>Output</th><th>Kecepatan</th><th>Kegunaan</th></tr>
<tr><td>MD5</td><td>128-bit (32 hex chars)</td><td>Paling cepat</td><td>Quick check, legacy. <strong>Vulnerable to collision</strong> — jangan pakai untuk security-critical.</td></tr>
<tr><td>SHA-1</td><td>160-bit (40 hex chars)</td><td>Cepat</td><td>Legacy, masih dipakai banyak tool. Collision demonstrated (SHAttered, 2017).</td></tr>
<tr><td>SHA-256</td><td>256-bit (64 hex chars)</td><td>Moderate</td><td><strong>Standard industri saat ini.</strong> Dipakai VirusTotal, MISP, STIX/TAXII, semua modern tools.</td></tr>
</table>

<div class="callout callout-tip"><strong>Rule of thumb:</strong> Gunakan <strong>SHA-256</strong> untuk identifikasi dan sharing IOC. MD5 masih OK untuk quick lookup dan compatibility dengan tools lama. Untuk forensics, catat minimal MD5 + SHA-256.</div>

<h4>Hash Collision</h4>
<p>Hash collision = dua file berbeda menghasilkan hash yang sama. MD5 dan SHA-1 sudah terbukti vulnerable. SHA-256 belum ada collision yang diketahui. Untuk forensics, ini berarti: jangan hanya pakai MD5 — selalu pakai SHA-256 juga sebagai backup.</p>
` },

    { id: 'hash-usage', title: 'Hash — Usage',
      html: osTabs([
        { id: 'linux', icon: '🐧', label: 'Linux/macOS', html: `
<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code><span class="code-comment"># Calculate hash</span>
md5sum suspicious.exe
sha1sum suspicious.exe
sha256sum suspicious.exe

<span class="code-comment"># Hash multiple files sekaligus</span>
sha256sum *.exe

<span class="code-comment"># Hash semua file di folder (recursive)</span>
find /evidence/ -type f -exec sha256sum {} \\;

<span class="code-comment"># Simpan hash ke file</span>
sha256sum evidence.E01 > evidence.sha256

<span class="code-comment"># Verify hash dari file</span>
sha256sum -c evidence.sha256
<span class="code-comment"># Output: evidence.E01: OK</span>

<span class="code-comment"># ═══════════════════════════════</span>
<span class="code-comment"># VIRUSTOTAL LOOKUP WORKFLOW</span>
<span class="code-comment"># ═══════════════════════════════</span>

<span class="code-comment"># Step 1: Hash file</span>
sha256sum suspicious.exe
<span class="code-comment"># → a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8</span>

<span class="code-comment"># Step 2: Copy hash → paste di https://www.virustotal.com/gui/search</span>
<span class="code-comment"># Step 3: Instant result — berapa engine yang detect + detail</span>

<span class="code-comment"># Atau via VT API (butuh API key):</span>
curl -s "https://www.virustotal.com/api/v3/files/SHA256_HASH" \\
  -H "x-apikey: YOUR_API_KEY" | jq '.data.attributes.last_analysis_stats'</code></pre></div>` },
        { id: 'windows', icon: '🪟', label: 'Windows', html: `
<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code><span class="code-comment"># Calculate hash (default: SHA-256)</span>
Get-FileHash suspicious.exe

<span class="code-comment"># Specific algorithm</span>
Get-FileHash suspicious.exe -Algorithm MD5
Get-FileHash suspicious.exe -Algorithm SHA1
Get-FileHash suspicious.exe -Algorithm SHA256

<span class="code-comment"># Hash multiple files</span>
Get-ChildItem *.exe | Get-FileHash

<span class="code-comment"># Hash semua file di folder (recursive)</span>
Get-ChildItem -Path C:\\evidence\\ -Recurse -File | Get-FileHash | Export-Csv hashes.csv

<span class="code-comment"># Compare dua file (apakah identik?)</span>
(Get-FileHash file1.exe).Hash -eq (Get-FileHash file2.exe).Hash

<span class="code-comment"># CMD alternative: certutil</span>
certutil -hashfile suspicious.exe SHA256
certutil -hashfile suspicious.exe MD5</code></pre></div>` }
      ]) },

    { id: 'hash-forensics', title: 'Hash dalam Forensics',
      html: `
<p>Hash digunakan di hampir setiap tahap forensic workflow. Berikut bagaimana:</p>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">1</span> Evidence Integrity</div>
<p>Hash evidence SEBELUM dan SESUDAH acquisition. Kedua hash harus match — membuktikan proses imaging tidak mengubah data.</p>
<div class="code-block"><div class="code-label"><span>Workflow</span></div><pre><code><span class="code-comment"># Saat acquisition (FTK Imager otomatis hitung):</span>
Source disk MD5:  abc123...
Image file MD5:   abc123...  → MATCH ✓

<span class="code-comment"># Saat mulai analisis (verify image masih utuh):</span>
sha256sum evidence.E01
<span class="code-comment"># → bandingkan dengan hash yang dicatat saat acquisition</span></code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">2</span> Known File Filtering (NSRL)</div>
<p><strong>NSRL (National Software Reference Library)</strong> berisi hash dari jutaan file legitimate — Windows OS files, Office, browser, dll. Import ke Autopsy → file yang match NSRL otomatis di-skip → kamu fokus ke file unknown.</p>
<div class="code-block"><div class="code-label"><span>Workflow</span></div><pre><code><span class="code-comment"># Dari 500.000 files di disk image:</span>
<span class="code-comment"># 480.000 match NSRL hash → known good, skip</span>
<span class="code-comment"># 20.000 NOT in NSRL → perlu investigasi</span>
<span class="code-comment"># Ini menghemat BANYAK waktu!</span></code></pre></div>
<p>Download NSRL: <a href="https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl" target="_blank">nist.gov/nsrl</a></p>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">3</span> Malware Identification</div>
<p>Hash file suspicious → cek di database malware. Kalau ada match, kamu langsung tau itu malware apa tanpa perlu reverse engineering.</p>
<div class="code-block"><div class="code-label"><span>Platforms untuk Hash Lookup</span></div><pre><code><span class="code-comment"># VirusTotal — paling populer, 70+ AV engines</span>
https://www.virustotal.com/gui/search/[SHA256_HASH]

<span class="code-comment"># MalwareBazaar — database malware samples</span>
https://bazaar.abuse.ch/browse/

<span class="code-comment"># Hybrid Analysis — sandbox + hash lookup</span>
https://www.hybrid-analysis.com/

<span class="code-comment"># AlienVault OTX — threat intelligence</span>
https://otx.alienvault.com/</code></pre></div>
</div>

<div class="scenario-card">
<div class="sc-head"><span class="sc-num">4</span> IOC Sharing</div>
<p>Hash adalah cara paling aman untuk <strong>share IOC (Indicator of Compromise)</strong> antar tim atau organisasi. Kamu share hash instead of actual malware file — penerima bisa cek apakah mereka punya file yang match hash itu tanpa perlu terima file malicious.</p>
<div class="code-block"><div class="code-label"><span>Contoh IOC Sharing</span></div><pre><code><span class="code-comment"># Format IOC tipikal:</span>
Type: SHA256
Value: a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2...
Malware: Emotet Loader
First Seen: 2026-04-05
Source: Internal IR Case INC-2026-0042

<span class="code-comment"># Tim lain bisa search hash ini di SIEM mereka:</span>
<span class="code-comment"># Splunk: index=endpoint file_hash="a7b8c9d0..."</span>
<span class="code-comment"># Wazuh: syscheck module hash comparison</span></code></pre></div>
</div>
` }
  ]
}

});
