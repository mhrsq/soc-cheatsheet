// ═══════════════════════════════════════════════════════
// Reporting — Incident Reporting Guide
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

// ─────────────────────────────────────────
// 1. Incident Reporting Guide
// ─────────────────────────────────────────
'reporting': {
  name: 'Incident Reporting Guide',
  subtitle: 'Cara menulis report yang benar — dari triage note sampai formal incident report. Templates, tips, IOC sharing, dan SOC metrics.',
  tags: ['tag-reference'],
  tagLabels: ['Reporting'],
  sections: [

    { id: 'why-reporting', title: 'Kenapa Reporting Penting?', html: `
<p>Report adalah <strong>bukti kerja analyst</strong>. Kamu bisa investigate dengan brilian, tapi kalau nggak didokumentasikan dengan benar — seolah-olah nggak pernah terjadi.</p>

<div class="callout callout-tip">
<strong>Analogi:</strong> Bayangin kamu dokter UGD yang baru selesai selamatkan pasien kritis. Tapi nggak nulis catatan medis. Pas shift berikutnya datang, nggak ada yang tahu apa yang terjadi, obat apa yang sudah diberikan, tindakan apa yang diambil. Chaos. <strong>Reporting = medical record SOC.</strong>
</div>

<h4>Report Dipakai Untuk Apa?</h4>
<ul>
  <li><strong>Management visibility</strong> — "SOC ngapain aja sih?" Report jawab pertanyaan ini.</li>
  <li><strong>Legal & compliance</strong> — Regulasi (GDPR, UU PDP) mewajibkan dokumentasi insiden.</li>
  <li><strong>Lessons learned</strong> — Tanpa report, kesalahan yang sama terulang.</li>
  <li><strong>Threat intelligence sharing</strong> — IOC dari report kamu bisa bantu organisasi lain.</li>
  <li><strong>Post-incident improvement</strong> — Report jadi dasar perbaikan rule, proses, dan tools.</li>
  <li><strong>Career proof</strong> — Report yang bagus = portfolio yang bisa kamu tunjukkan saat interview.</li>
</ul>

<h4>Bad Report vs Good Report</h4>
<div class="scenario-card">
  <div class="sc-head"><span class="sc-num">✗</span> Bad Report</div>
  <p><em>"We detected malware on a computer and cleaned it."</em></p>
  <p>Nggak ada detail: komputer mana? Malware apa? Kapan detected? Kapan cleaned? Siapa yang affected? Apa dampaknya? How did it get in? IOC apa yang bisa di-block?</p>
</div>

<div class="scenario-card">
  <div class="sc-head"><span class="sc-num">✓</span> Good Report</div>
  <p><em>"Pada 2024-01-15 09:23 UTC, Wazuh alert rule 100002 triggered di endpoint WS-FINANCE-042 (user: j.smith). File <code>invoice_jan.exe</code> (SHA256: a1b2c3...) terdeteksi sebagai Emotet trojan. File di-download via phishing email dari <code>billing@fake-vendor.com</code>. Endpoint di-isolate via Wazuh Active Response pada 09:31 UTC. 3 endpoint lain teridentifikasi melakukan komunikasi ke C2 domain <code>update.evil-domain.com</code>..."</em></p>
</div>

<div class="callout callout-info">
<strong>Bottom line:</strong> Without good reports, SOC looks like a <em>cost center</em> (pengeluaran) instead of a <em>value creator</em> (investasi). Report yang bagus membuktikan bahwa SOC team <strong>menyelamatkan perusahaan</strong> dari kerugian.
</div>
`},

    { id: 'report-types', title: 'Jenis-Jenis Report', html: `
<p>Nggak semua insiden butuh report formal. Ini jenis report berdasarkan <strong>audience</strong> dan <strong>situasi</strong>:</p>

<table class="ref-table">
  <tr><th>Jenis Report</th><th>Audience</th><th>Panjang</th><th>Format</th><th>Kapan Dipakai</th></tr>
  <tr>
    <td><strong>1. Alert First Notification Report</strong></td>
    <td>SOC team, SOC Manager, stakeholder terkait</td>
    <td>0.5-1 halaman</td>
    <td>Email / ticket / short doc</td>
    <td>Segera setelah alert pertama kali terdeteksi dan dikonfirmasi bukan FP. Ini notifikasi awal sebelum investigasi mendalam selesai.</td>
  </tr>
  <tr>
    <td><strong>2. Incident Report</strong></td>
    <td>Management, Legal, CISO, Regulator</td>
    <td>3-10+ halaman</td>
    <td>Formal document (PDF)</td>
    <td>Setelah insiden selesai di-handle. Laporan lengkap: timeline, root cause, impact, containment, eradication, recovery, recommendations.</td>
  </tr>
  <tr>
    <td><strong>3. Digital Forensic Report</strong></td>
    <td>Legal, law enforcement, CISO, IR team</td>
    <td>5-20+ halaman</td>
    <td>Formal document (PDF) + evidence appendix</td>
    <td>Ketika ada investigasi forensik mendalam — memory analysis, disk forensics, malware analysis. Harus mencakup chain of custody, metodologi, dan temuan teknis detail.</td>
  </tr>
  <tr>
    <td><strong>4. Threat Intel Report</strong></td>
    <td>SOC team, threat intel community, partner</td>
    <td>1-3 halaman</td>
    <td>TLP-labeled document, structured IOC</td>
    <td>Ketika menemukan campaign/threat baru, malware variant, atau C2 infrastructure yang perlu di-share ke komunitas atau partner.</td>
  </tr>
  <tr>
    <td><strong>5. Monthly / Weekly Report</strong></td>
    <td>SOC Manager, CISO, Management</td>
    <td>2-5 halaman</td>
    <td>PDF summary + dashboard screenshot</td>
    <td>Periodic report: rangkuman insiden, highlight threat, notable events, status open cases, achievement, dan area yang perlu improvement.</td>
  </tr>
  <tr>
    <td><strong>6. SOC Metrics Report</strong></td>
    <td>CISO, Management, Board</td>
    <td>1-2 halaman + dashboard</td>
    <td>Dashboard / executive summary</td>
    <td>KPI-driven report: MTTD, MTTR, false positive rate, alert volume trend, SLA compliance. Fokus angka dan trend, bukan narasi.</td>
  </tr>
</table>

<div class="callout callout-tip">
<strong>Rule of thumb:</strong> Alert masuk = first notification report. Insiden selesai = incident report. Ada forensics = digital forensic report. Temuan baru = threat intel report. Tiap minggu/bulan = periodic + metrics report.
</div>
`},

    { id: 'incident-report-template', title: 'Template: Incident Report', html: `
<p>Ini template yang bisa kamu pakai untuk incident report formal. Adaptasi sesuai kebutuhan organisasi kamu.</p>

<h4>Struktur Incident Report</h4>
<div class="code-block"><div class="code-label"><span>Incident Report Template — Outline</span></div><pre><code>═══════════════════════════════════════════════════════
              INCIDENT REPORT
═══════════════════════════════════════════════════════

1. EXECUTIVE SUMMARY
   - Ringkasan 1-2 paragraf: apa yang terjadi, dampak, status saat ini

2. INCIDENT DETAILS
   - Incident ID: INC-2024-0042
   - Date/Time Detected: YYYY-MM-DD HH:MM UTC
   - Date/Time Contained: YYYY-MM-DD HH:MM UTC
   - Date/Time Resolved: YYYY-MM-DD HH:MM UTC
   - Severity: Critical / High / Medium / Low
   - Classification: Phishing / Malware / Brute Force / Data Breach / ...
   - Affected Systems: (list hostname, IP)
   - Affected Users: (list username, department)
   - Analyst: (nama analyst yang handle)

3. TIMELINE OF EVENTS
   Timestamp (UTC)  | Event                        | Source      | Analyst
   ─────────────────┼──────────────────────────────┼────────────┼────────
   2024-01-15 09:23 | Alert triggered              | Wazuh      | L1-Ahmad
   2024-01-15 09:25 | Alert triaged as TP          | -          | L1-Ahmad
   2024-01-15 09:31 | Endpoint isolated             | Wazuh AR   | L2-Budi
   ...

4. ROOT CAUSE ANALYSIS
   - Initial access vector: (bagaimana attacker masuk?)
   - Vulnerability exploited: (CVE? misconfiguration? social engineering?)
   - Attack progression: (apa yang attacker lakukan setelah masuk?)

5. IMPACT ASSESSMENT
   - Data exposed: Ya/Tidak — apa yang exposed?
   - Systems affected: jumlah endpoint/server
   - Business impact: downtime? data loss? reputasi?
   - Financial impact: estimasi kerugian (kalau applicable)

6. CONTAINMENT ACTIONS
   - Tindakan yang diambil untuk stop spread
   - Endpoint isolation, account disable, firewall block, dll

7. ERADICATION & RECOVERY
   - Malware removal / file cleanup
   - Patch / configuration fix
   - System restore dari backup
   - Credential reset

8. INDICATORS OF COMPROMISE (IOC)
   Type      | Value                              | Context
   ──────────┼────────────────────────────────────┼──────────────
   IP        | 203.0.113.42                       | C2 server
   Domain    | update.evil-domain.com             | C2 domain
   SHA256    | a1b2c3d4e5f6...                    | Malware hash
   Email     | billing@fake-vendor.com            | Phishing sender
   URL       | https://evil.com/payload.exe       | Malware delivery

9. RECOMMENDATIONS
   Short-term:
   - Block IOCs di firewall/proxy
   - Reset credentials untuk affected users
   Long-term:
   - Implement email gateway filtering
   - Security awareness training
   - Enhance detection rules

10. APPENDIX
    - Evidence screenshots
    - Relevant log excerpts
    - Tool output (VirusTotal, Wazuh alert detail, dll)</code></pre></div>

<h4>Contoh: Incident Report — Phishing Attack</h4>
<div class="scenario-card">
  <div class="sc-head"><span class="sc-num">INC-2024-0042</span> Emotet Phishing — Finance Department</div>

<h4>1. Executive Summary</h4>
<p>Pada tanggal 15 Januari 2024, SOC mendeteksi aktivitas malware di endpoint WS-FINANCE-042 milik user <code>j.smith</code> (Finance Department). Investigasi mengungkap bahwa malware Emotet trojan terdownload melalui phishing email yang menyamar sebagai invoice dari vendor. Dalam waktu 8 menit setelah deteksi, endpoint berhasil diisolasi. Total 3 endpoint lain teridentifikasi telah berkomunikasi dengan C2 server yang sama. Seluruh 4 endpoint telah di-clean dan restored. Tidak ada indikasi data exfiltration.</p>

<h4>2. Incident Details</h4>
<table class="ref-table">
  <tr><td><strong>Incident ID</strong></td><td>INC-2024-0042</td></tr>
  <tr><td><strong>Detected</strong></td><td>2024-01-15 09:23 UTC</td></tr>
  <tr><td><strong>Contained</strong></td><td>2024-01-15 09:31 UTC (8 menit)</td></tr>
  <tr><td><strong>Resolved</strong></td><td>2024-01-15 14:45 UTC</td></tr>
  <tr><td><strong>Severity</strong></td><td>HIGH</td></tr>
  <tr><td><strong>Classification</strong></td><td>Phishing → Malware Execution</td></tr>
  <tr><td><strong>Affected Systems</strong></td><td>WS-FINANCE-042, WS-FINANCE-018, WS-HR-003, SRV-FILE-01</td></tr>
  <tr><td><strong>Affected Users</strong></td><td>j.smith, m.putri, r.santoso</td></tr>
</table>

<h4>3. Timeline</h4>
<table class="ref-table">
  <tr><th>Timestamp (UTC)</th><th>Event</th><th>Source</th></tr>
  <tr><td>2024-01-15 08:45</td><td>Phishing email received by j.smith</td><td>Email Gateway Log</td></tr>
  <tr><td>2024-01-15 09:20</td><td>j.smith opened attachment <code>invoice_jan.exe</code></td><td>Wazuh Syscheck</td></tr>
  <tr><td>2024-01-15 09:23</td><td>Wazuh Alert: Suspicious process execution (Rule 100002)</td><td>Wazuh</td></tr>
  <tr><td>2024-01-15 09:25</td><td>L1 analyst triaged alert as True Positive</td><td>DFIR-IRIS</td></tr>
  <tr><td>2024-01-15 09:28</td><td>Escalated to L2 — lateral movement indicators found</td><td>DFIR-IRIS</td></tr>
  <tr><td>2024-01-15 09:31</td><td>Endpoint WS-FINANCE-042 isolated via Wazuh Active Response</td><td>Wazuh</td></tr>
  <tr><td>2024-01-15 09:45</td><td>3 additional endpoints identified communicating with C2</td><td>Wazuh/Wireshark</td></tr>
  <tr><td>2024-01-15 10:00</td><td>All 4 endpoints isolated, C2 domain blocked at firewall</td><td>Firewall</td></tr>
  <tr><td>2024-01-15 12:00</td><td>Malware eradicated, systems scanned</td><td>Wazuh</td></tr>
  <tr><td>2024-01-15 14:45</td><td>Systems restored, credentials reset, incident closed</td><td>DFIR-IRIS</td></tr>
</table>

<h4>8. IOC</h4>
<table class="ref-table">
  <tr><th>Type</th><th>Value</th><th>Context</th></tr>
  <tr><td>SHA256</td><td><code>a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2</code></td><td>Emotet dropper (invoice_jan.exe)</td></tr>
  <tr><td>Domain</td><td><code>update.evil-domain.com</code></td><td>C2 server</td></tr>
  <tr><td>IP</td><td><code>203.0.113.42</code></td><td>C2 IP (resolved from domain)</td></tr>
  <tr><td>Email</td><td><code>billing@fake-vendor.com</code></td><td>Phishing sender</td></tr>
  <tr><td>Subject</td><td><code>Invoice January 2024 - URGENT</code></td><td>Phishing email subject</td></tr>
</table>
</div>
`},

    { id: 'writing-tips', title: 'Tips Menulis Report yang Bagus', html: `
<p>Report yang bagus itu bukan soal panjang — tapi soal <strong>jelas, lengkap, dan actionable</strong>. Ini tips praktis:</p>

<div class="playbook-step">
  <div class="pb-num">1</div>
  <div class="pb-content">
    <strong>Write for Your Audience</strong><br>
    Executive = high level (dampak bisnis, kerugian, rekomendasi). Technical team = detailed (IOC, log evidence, timeline). Jangan kasih detail teknis ke CEO, jangan kasih summary doang ke L3.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">2</div>
  <div class="pb-content">
    <strong>Use Active Voice</strong><br>
    ✅ "Attacker exploited CVE-2024-1234 to gain initial access"<br>
    ❌ "A vulnerability was exploited by an unknown threat actor"<br>
    Active voice lebih jelas dan lebih confident.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">3</div>
  <div class="pb-content">
    <strong>Timestamps dengan Timezone</strong><br>
    Selalu pakai <strong>UTC</strong> untuk semua timestamp di report. Format: <code>2024-01-15 09:23 UTC</code>. Kalau perlu mention local time, tulis keduanya: <code>09:23 UTC (16:23 WIB)</code>.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">4</div>
  <div class="pb-content">
    <strong>Reference Evidence untuk Setiap Claim</strong><br>
    Jangan tulis "attacker used PowerShell" tanpa bukti. Tulis: "attacker used PowerShell (Event ID 4104, see Appendix A, line 42-58)". Setiap claim harus <em>traceable</em> ke evidence.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">5</div>
  <div class="pb-content">
    <strong>Be Specific — Angka, Bukan Kata</strong><br>
    ✅ "3 endpoints compromised, 1 user credential exposed"<br>
    ❌ "several endpoints were affected"<br>
    Spesifik membantu stakeholder mengambil keputusan.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">6</div>
  <div class="pb-content">
    <strong>IOC di Tabel Terpisah — Mudah Di-copy</strong><br>
    Jangan embed IOC di dalam paragraf. Buat tabel terpisah (Type | Value | Context) supaya tim lain bisa langsung copy-paste ke firewall/SIEM rule.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">7</div>
  <div class="pb-content">
    <strong>Pakai MITRE ATT&CK IDs</strong><br>
    Map setiap teknik ke ATT&CK ID: "Attacker used spearphishing attachment (<strong>T1566.001</strong>) for initial access, then executed PowerShell (<strong>T1059.001</strong>) for payload delivery." Ini standar industri untuk komunikasi.
  </div>
</div>

<div class="playbook-step">
  <div class="pb-num">8</div>
  <div class="pb-content">
    <strong>Proofread!</strong><br>
    Report represent profesionalisme tim SOC. Typo, grammar error, formatting berantakan = kesan nggak profesional. Review sebelum submit. Kalau bisa, minta rekan review juga.
  </div>
</div>

<div class="callout callout-info">
<strong>Template mental saat menulis:</strong> "Siapa yang baca ini? Apa yang perlu mereka tahu? Apa yang harus mereka lakukan setelah baca?" — kalau ketiga pertanyaan ini terjawab, report kamu sudah bagus.
</div>
`},

    { id: 'ioc-sharing', title: 'IOC Sharing & Standards', html: `
<p>IOC (Indicators of Compromise) yang kamu temukan saat investigasi bisa bermanfaat untuk komunitas dan partner. Tapi harus di-share dengan <strong>format standar</strong> dan <strong>aturan yang jelas</strong>.</p>

<h4>Format Standar IOC</h4>
<table class="ref-table">
  <tr><th>Format</th><th>Deskripsi</th><th>Use Case</th></tr>
  <tr><td><strong>STIX / TAXII</strong></td><td>Structured Threat Information Expression. Format JSON standar untuk threat intel sharing.</td><td>Machine-to-machine sharing, integrasi SIEM, threat intel platform</td></tr>
  <tr><td><strong>OpenIOC</strong></td><td>XML-based format dari Mandiant/FireEye. Fokus pada host-based indicators.</td><td>Endpoint scanning, forensic analysis</td></tr>
  <tr><td><strong>CSV / Plaintext</strong></td><td>Simple list of IOC values.</td><td>Quick sharing via email, manual import ke firewall</td></tr>
  <tr><td><strong>YARA Rules</strong></td><td>Pattern matching rules untuk file/memory scanning.</td><td>Malware detection, file scanning</td></tr>
  <tr><td><strong>Sigma Rules</strong></td><td>Generic SIEM detection rules (YAML format).</td><td>SIEM rule sharing across platforms</td></tr>
</table>

<h4>Platform untuk Sharing IOC</h4>
<table class="ref-table">
  <tr><th>Platform</th><th>Tipe</th><th>Deskripsi</th></tr>
  <tr><td><strong>MISP</strong></td><td>Open source</td><td>Threat intelligence platform. Bisa share IOC antar organisasi. Self-hosted atau community instances. <a href="https://www.misp-project.org/" target="_blank">misp-project.org</a></td></tr>
  <tr><td><strong>ThreatFox (abuse.ch)</strong></td><td>Free / Public</td><td>Submit & search IOC (malware, botnet C2). <a href="https://threatfox.abuse.ch/" target="_blank">threatfox.abuse.ch</a></td></tr>
  <tr><td><strong>AlienVault OTX</strong></td><td>Free / Public</td><td>Open Threat Exchange. Share "pulse" (collections of IOC). <a href="https://otx.alienvault.com/" target="_blank">otx.alienvault.com</a></td></tr>
  <tr><td><strong>VirusTotal</strong></td><td>Free / Paid</td><td>Upload file/hash/URL — otomatis shared dengan community (hati-hati data sensitif!)</td></tr>
  <tr><td><strong>ISACs</strong></td><td>Industry-specific</td><td>Information Sharing and Analysis Centers. Sektor-based (Financial, Healthcare, dll).</td></tr>
</table>

<h4>Traffic Light Protocol (TLP)</h4>
<p>TLP menentukan <strong>sejauh mana informasi boleh di-share</strong>. Ini standar global — pakai di setiap report dan IOC sharing.</p>

<table class="ref-table">
  <tr><th>TLP Level</th><th>Warna</th><th>Boleh Dishare ke</th><th>Contoh Penggunaan</th></tr>
  <tr><td><strong>TLP:RED</strong></td><td style="background:#FF2B2B;color:#fff;padding:2px 8px;border-radius:4px">🔴 Red</td><td><strong>Hanya peserta meeting/email</strong>. Tidak boleh dishare ke siapapun lain, bahkan di internal organisasi.</td><td>Informasi tentang zero-day yang belum di-patch, identitas korban, operasi aktif.</td></tr>
  <tr><td><strong>TLP:AMBER</strong></td><td style="background:#FFC000;color:#000;padding:2px 8px;border-radius:4px">🟡 Amber</td><td><strong>Organisasi penerima saja</strong>. Boleh dishare internal kalau perlu tahu (need-to-know basis).</td><td>IOC spesifik untuk organisasi partner, vulnerability yang belum public.</td></tr>
  <tr><td><strong>TLP:AMBER+STRICT</strong></td><td style="background:#FFC000;color:#000;padding:2px 8px;border-radius:4px">🟡 Amber+Strict</td><td><strong>Hanya organisasi penerima</strong>. Tidak boleh dishare ke customer/client penerima.</td><td>Threat intel sensitif untuk partner tertentu saja.</td></tr>
  <tr><td><strong>TLP:GREEN</strong></td><td style="background:#33FF00;color:#000;padding:2px 8px;border-radius:4px">🟢 Green</td><td><strong>Komunitas terbatas</strong>. Boleh dishare ke peers/community, tapi tidak ke public.</td><td>IOC yang berguna untuk komunitas ISAC, sharing antar SOC team.</td></tr>
  <tr><td><strong>TLP:CLEAR</strong></td><td style="background:#fff;color:#000;padding:2px 8px;border-radius:4px;border:1px solid #555">⚪ Clear</td><td><strong>Publik</strong>. Tidak ada batasan sharing.</td><td>IOC dari campaign yang sudah di-publish, advisory public, general threat trends.</td></tr>
</table>

<div class="callout callout-warn">
<strong>Penting:</strong> Kalau kamu terima informasi dengan label TLP, <strong>hormati label-nya</strong>. Sharing info TLP:RED ke publik bisa merusak trust dan relasi dengan partner intel. Kalau ragu, tanya sumber informasi.
</div>

<h4>Contoh IOC Sharing Format (STIX-style)</h4>
<div class="code-block"><div class="code-label"><span>JSON — STIX 2.1 Indicator (simplified)</span></div><pre><code>{
  "type": "indicator",
  "spec_version": "2.1",
  "id": "indicator--a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created": "2024-01-15T14:00:00Z",
  "name": "Emotet C2 Domain",
  "description": "C2 domain used in phishing campaign targeting finance sector",
  "indicator_types": ["malicious-activity"],
  "pattern": "[domain-name:value = 'update.evil-domain.com']",
  "pattern_type": "stix",
  "valid_from": "2024-01-15T00:00:00Z",
  "labels": ["emotet", "c2", "phishing"],
  "confidence": 90
}</code></pre></div>
`},

    { id: 'metrics-report', title: 'SOC Metrics Report', html: `
<p>SOC Metrics Report membuktikan <strong>value SOC</strong> ke management. Track metrics ini weekly/monthly:</p>

<h4>Key SOC Metrics</h4>
<table class="ref-table">
  <tr><th>Metric</th><th>Formula</th><th>Target (Contoh)</th><th>Kenapa Penting</th></tr>
  <tr><td><strong>Total Alerts Processed</strong></td><td>Count semua alert yang ditangani dalam periode</td><td>—</td><td>Menunjukkan beban kerja SOC</td></tr>
  <tr><td><strong>False Positive Rate</strong></td><td>FP alerts ÷ Total alerts × 100%</td><td>&lt; 70%</td><td>FP terlalu tinggi = rule perlu tuning. Analyst burnout.</td></tr>
  <tr><td><strong>MTTD (Mean Time to Detect)</strong></td><td>Rata-rata waktu dari incident terjadi sampai alert pertama</td><td>&lt; 15 menit</td><td>Seberapa cepat SOC mendeteksi threat</td></tr>
  <tr><td><strong>MTTR (Mean Time to Respond)</strong></td><td>Rata-rata waktu dari alert pertama sampai containment</td><td>&lt; 30 menit</td><td>Seberapa cepat SOC merespons threat</td></tr>
  <tr><td><strong>Escalation Rate</strong></td><td>Escalated alerts ÷ Total alerts × 100%</td><td>10-20%</td><td>Terlalu tinggi = L1 kurang skill/confidence. Terlalu rendah = mungkin ada miss.</td></tr>
  <tr><td><strong>Cases Opened / Closed</strong></td><td>Count cases di ticketing system</td><td>—</td><td>Throughput investigasi. Backlog = masalah staffing.</td></tr>
  <tr><td><strong>Top Alert Categories</strong></td><td>Group by rule/category, sort by count</td><td>—</td><td>Identifikasi threat paling umum — fokuskan training dan tuning di sini.</td></tr>
  <tr><td><strong>Top Attack Sources</strong></td><td>Group by source IP/country</td><td>—</td><td>Geolocation insight. Apakah perlu geo-block?</td></tr>
  <tr><td><strong>SLA Compliance Rate</strong></td><td>Alerts responded within SLA ÷ Total × 100%</td><td>&gt; 95%</td><td>KPI utama SOC — apakah kita memenuhi janji service level?</td></tr>
</table>

<h4>Contoh SPL Queries untuk Metrics (Splunk)</h4>

<div class="code-block"><div class="code-label"><span>SPL — Total Alerts per Day</span></div><pre><code>index=wazuh sourcetype=wazuh_alerts
| timechart span=1d count AS "Daily Alerts"</code></pre></div>

<div class="code-block"><div class="code-label"><span>SPL — False Positive Rate</span></div><pre><code>index=soc_tickets status=closed
| eval is_fp=if(resolution="false_positive", 1, 0)
| stats count AS total, sum(is_fp) AS fp_count
| eval fp_rate=round((fp_count/total)*100, 1)
| table total, fp_count, fp_rate</code></pre></div>

<div class="code-block"><div class="code-label"><span>SPL — Mean Time to Respond (MTTR)</span></div><pre><code>index=soc_tickets status=closed
| eval detect_time=strptime(detected_at, "%Y-%m-%dT%H:%M:%S")
| eval contain_time=strptime(contained_at, "%Y-%m-%dT%H:%M:%S")
| eval response_seconds=contain_time - detect_time
| eval response_minutes=round(response_seconds/60, 1)
| stats avg(response_minutes) AS "Avg MTTR (min)"
        median(response_minutes) AS "Median MTTR (min)"
        max(response_minutes) AS "Max MTTR (min)"</code></pre></div>

<div class="code-block"><div class="code-label"><span>SPL — Top 10 Alert Categories</span></div><pre><code>index=wazuh sourcetype=wazuh_alerts
| top limit=10 rule.description
| rename rule.description AS "Alert Type", count AS "Count", percent AS "Pct"</code></pre></div>

<div class="code-block"><div class="code-label"><span>SPL — Top Attack Source Countries</span></div><pre><code>index=wazuh sourcetype=wazuh_alerts
| iplocation src_ip
| top limit=10 Country
| rename Country AS "Source Country", count AS "Attacks"</code></pre></div>

<div class="code-block"><div class="code-label"><span>SPL — SLA Compliance</span></div><pre><code>index=soc_tickets status=closed
| eval detect_time=strptime(detected_at, "%Y-%m-%dT%H:%M:%S")
| eval respond_time=strptime(responded_at, "%Y-%m-%dT%H:%M:%S")
| eval response_min=round((respond_time - detect_time)/60, 1)
| eval within_sla=if(response_min &lt;= 30, "Yes", "No")
| stats count AS total, 
        count(eval(within_sla="Yes")) AS within
| eval sla_pct=round((within/total)*100, 1)." %"
| table total, within, sla_pct</code></pre></div>

<h4>Contoh Wazuh API Query untuk Metrics</h4>
<div class="code-block"><div class="code-label"><span>Bash — Wazuh API: Alert Count Last 24h</span></div><pre><code># Authenticate
TOKEN=$(curl -s -u &lt;user&gt;:&lt;password&gt; -k -X POST \\
  "https://localhost:55000/security/user/authenticate" | jq -r '.data.token')

# Get alert summary
curl -s -k -X GET \\
  "https://localhost:55000/overview/agents" \\
  -H "Authorization: Bearer $TOKEN" | jq '.data'</code></pre></div>

<div class="callout callout-tip">
<strong>Visualisasi:</strong> Metrics paling impactful kalau divisualisasikan. Buat Splunk dashboard atau Wazuh dashboard khusus untuk SOC Metrics. Capture screenshot untuk report bulanan.
</div>
`},

    { id: 'tools-for-reporting', title: 'Tools untuk Reporting', html: `
<p>Nggak perlu nulis report dari nol setiap kali. Ini tools yang bisa bantu:</p>

<h4>Case Management → Report Generation</h4>
<table class="ref-table">
  <tr><th>Tool</th><th>Reporting Feature</th><th>Format</th></tr>
  <tr><td><strong>DFIR-IRIS</strong></td><td>Built-in report generation dari case data. Timeline, IOC, evidence otomatis di-compile.</td><td>PDF, DOCX</td></tr>
  <tr><td><strong>TheHive</strong></td><td>Case export, observable list export. Bisa custom template dengan Cortex.</td><td>JSON, CSV</td></tr>
  <tr><td><strong>Splunk</strong></td><td>Dashboard → PDF report. Schedule auto-delivery via email.</td><td>PDF, CSV</td></tr>
  <tr><td><strong>Wazuh</strong></td><td>Dashboard export, alert summary via API.</td><td>CSV, API JSON</td></tr>
</table>

<h4>Recommended Reporting Workflow</h4>
<div class="code-block"><div class="code-label"><span>Text — SOC Reporting Workflow</span></div><pre><code>Alert Detected
    │
    ▼
┌──────────────────────┐
│  1. INVESTIGATE       │  ← Wazuh, Splunk, Wireshark
│     Gather evidence   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  2. DOCUMENT in IRIS  │  ← Timeline, IOC, notes real-time
│     or TheHive        │     JANGAN tunggu selesai baru dokumentasi!
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  3. GENERATE REPORT   │  ← IRIS report generator, atau manual template
│     Review & edit     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  4. SHARE IOC         │  ← MISP, ThreatFox, OTX
│     (kalau applicable)│     Pakai TLP yang sesuai!
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  5. LESSONS LEARNED   │  ← Post-incident review meeting
│     Update rules &    │     Improve detection & process
│     process           │
└──────────────────────┘</code></pre></div>

<h4>Other Useful Tools</h4>
<ul>
  <li><strong>CyberChef</strong> — Format IOC: defang URLs (<code>hxxps://</code>), extract hashes, encode/decode. Berguna sebelum paste IOC ke report.</li>
  <li><strong>Markdown / Notion / Confluence</strong> — Untuk template report yang reusable. Markdown bagus karena version-controlled (Git).</li>
  <li><strong>Timesketch</strong> — Open source timeline analysis tool. Import dari Plaso/log2timeline, visualisasi timeline insiden.</li>
  <li><strong>Velociraptor</strong> — Endpoint forensics + reporting. Bisa generate report dari hasil collection.</li>
</ul>

<div class="callout callout-tip">
<strong>Pro tip:</strong> Dokumentasi itu bukan tugas <em>setelah</em> investigasi selesai — dokumentasi harus dilakukan <strong>SAMBIL</strong> investigasi jalan. Buka IRIS/TheHive, catat setiap finding real-time. Pas investigasi selesai, report tinggal di-polish, bukan ditulis dari nol.
</div>

<div class="callout callout-info">
<strong>Next steps:</strong><br>
• Pelajari DFIR-IRIS → lihat halaman <strong>DFIR-IRIS Guide</strong> untuk setup & penggunaan<br>
• Pelajari TheHive → lihat halaman <strong>TheHive Guide</strong> untuk case management<br>
• Pelajari MITRE ATT&CK → lihat halaman <strong>MITRE ATT&CK</strong> untuk mapping teknik<br>
• Latihan di lab platform → lihat <strong>Lab Platforms</strong> (CyberDefenders, BTLO)
</div>
`}

  ]
}

});
