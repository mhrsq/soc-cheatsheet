// ═══════════════════════════════════════════════════════
// SIEM: Wazuh (3 sub-modules), Splunk (3 sub-modules), Wazuh Agent
// ═══════════════════════════════════════════════════════

Object.assign(TOOLS, {

'wazuh-overview': {
  name: 'Wazuh — Overview',
  subtitle: 'Open Source SIEM — Log collection, threat detection, dan vulnerability management dalam satu platform.',
  tags: ['tag-siem','tag-vps','tag-oss'], tagLabels: ['SIEM','VPS Hosted','Open Source'],
  parent: 'wazuh',
  sections: [
    { id: 'overview', title: 'Apa itu Wazuh?',
      html: `<p>Wazuh adalah platform keamanan open source yang paling populer dipakai oleh tim SOC. Satu platform ini handle: SIEM, EDR, log management, vulnerability detection, sampai compliance monitoring.</p>
      <p>Arsitekturnya terdiri dari tiga komponen:</p>
      <ul>
        <li><strong>Wazuh Manager</strong> — otak sistem. Terima data dari semua agent, proses alert, jalankan rules.</li>
        <li><strong>Wazuh Agent</strong> — diinstall di endpoint. Kirim log dan event ke Manager.</li>
        <li><strong>Wazuh Dashboard</strong> — UI (OpenSearch/Kibana) untuk visualisasi alert dan log.</li>
      </ul>
      <div class="callout callout-info"><strong>Architecture:</strong> Manager + Indexer + Dashboard bisa di-deploy di satu server (all-in-one) atau distributed. Agent diinstall di setiap endpoint yang mau dimonitor.</div>` },
    { id: 'usecases', title: 'Kapan Wazuh Dipakai',
      html: `<p>Di SOC, Wazuh dipakai untuk monitoring <em>terus-menerus</em>:</p>
      <ul>
        <li><strong>Log Collection & Aggregation</strong> — kumpulkan log dari banyak endpoint ke satu tempat</li>
        <li><strong>Intrusion Detection</strong> — deteksi brute force, privilege escalation, port scan</li>
        <li><strong>File Integrity Monitoring (FIM)</strong> — alert kalau file kritis dimodifikasi</li>
        <li><strong>Vulnerability Detection</strong> — scan software dan bandingkan dengan CVE database</li>
        <li><strong>Compliance</strong> — cek standar PCI-DSS, HIPAA, CIS Benchmark</li>
        <li><strong>Active Response</strong> — otomatis block IP atau kill proses saat threat terdeteksi</li>
      </ul>` },
    { id: 'resources', title: 'Resources',
      html: `<div class="link-row">
        <a class="link-btn" href="https://documentation.wazuh.com" target="_blank">↗ Official Docs</a>
        <a class="link-btn" href="https://wazuh.com/blog/" target="_blank">↗ Blog</a>
        <a class="link-btn" href="https://github.com/wazuh/wazuh" target="_blank">↗ GitHub</a>
        <a class="link-btn" href="https://wazuh.com/training/" target="_blank">↗ Free Training</a>
      </div>` }
  ]
},

'wazuh-setup': {
  name: 'Wazuh — Getting Started',
  subtitle: 'Cara install Wazuh dari nol: all-in-one, Docker, atau cloud. Plus install agent di setiap OS.',
  tags: ['tag-siem','tag-oss'], tagLabels: ['SIEM','Open Source'],
  parent: 'wazuh',
  sections: [
    { id: 'server-install', title: 'Install Wazuh Server',
      html: `<p>Wazuh Server (Manager + Indexer + Dashboard) bisa diinstall dengan beberapa cara:</p>` +
      osTabs([
        { id: 'aio', icon: '🖥️', label: 'All-in-One (Recommended)', html: `<div class="code-block"><div class="code-label"><span>Bash — All-in-One Install</span></div><pre><code><span class="code-comment"># Download dan jalankan installer script</span>
curl -sO https://packages.wazuh.com/4.9/wazuh-install.sh
curl -sO https://packages.wazuh.com/4.9/config.yml

<span class="code-comment"># Edit config.yml — sesuaikan IP address</span>
nano config.yml

<span class="code-comment"># Generate certificates</span>
bash wazuh-install.sh --generate-config-files

<span class="code-comment"># Install semua komponen di satu server</span>
bash wazuh-install.sh --wazuh-indexer node-1
bash wazuh-install.sh --wazuh-server wazuh-1
bash wazuh-install.sh --wazuh-dashboard dashboard

<span class="code-comment"># Akses Dashboard: https://&lt;SERVER_IP&gt;
# Default: admin / admin (ganti segera!)</span></code></pre></div>
<div class="callout callout-warn"><strong>Minimum:</strong> 4 CPU, 8 GB RAM, 50 GB disk. Ubuntu 22.04 atau CentOS 8+.</div>` },
        { id: 'docker', icon: '🐳', label: 'Docker Compose', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>git clone https://github.com/wazuh/wazuh-docker.git -b v4.9.0
cd wazuh-docker/single-node
docker compose -f generate-indexer-certs.yml run --rm generator
docker compose up -d
docker compose ps
<span class="code-comment"># Dashboard: https://localhost:443 — admin / SecretPassword</span></code></pre></div>` }
      ]) },
    { id: 'agent-install', title: 'Install Wazuh Agent',
      html: `<p>Ganti <code>[MANAGER_IP]</code> dengan IP Wazuh Server.</p>` +
      osTabs([
        { id: 'linux', icon: '🐧', label: 'Linux', html: `<div class="code-block"><div class="code-label"><span>Bash — Ubuntu/Debian/Kali</span></div><pre><code>curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg
echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" | sudo tee /etc/apt/sources.list.d/wazuh.list
sudo WAZUH_MANAGER='[MANAGER_IP]' apt-get update && sudo WAZUH_MANAGER='[MANAGER_IP]' apt-get install wazuh-agent -y
sudo systemctl daemon-reload && sudo systemctl enable wazuh-agent && sudo systemctl start wazuh-agent</code></pre></div>` },
        { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>PowerShell — Admin</span></div><pre><code>Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.9.0-1.msi -OutFile wazuh-agent.msi
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER='[MANAGER_IP]'
NET START WazuhSvc</code></pre></div>` },
        { id: 'mac', icon: '🍎', label: 'macOS', html: `<div class="code-block"><div class="code-label"><span>Terminal</span></div><pre><code>curl -so wazuh-agent.pkg https://packages.wazuh.com/4.x/macos/wazuh-agent-4.9.0-1.intel64.pkg
sudo installer -pkg wazuh-agent.pkg -target /
sudo /Library/Ossec/bin/wazuh-control stop
sudo sed -i '' 's/MANAGER_IP/[MANAGER_IP]/' /Library/Ossec/etc/ossec.conf
sudo /Library/Ossec/bin/wazuh-control start</code></pre></div>
<div class="callout callout-info"><strong>Apple Silicon:</strong> Ganti <code>intel64</code> dengan <code>arm64</code> untuk M1/M2/M3.</div>` }
      ]) +
      `<div class="callout callout-tip"><strong>Verifikasi:</strong> Dashboard → Agents → device harus status hijau (Active).</div>` },
    { id: 'agent-management', title: 'Agent Management',
      html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo systemctl status wazuh-agent
sudo tail -f /var/ossec/logs/ossec.log
sudo systemctl restart wazuh-agent
/var/ossec/bin/manage_agents -l</code></pre></div>` }
  ]
},

'wazuh-usage': {
  name: 'Wazuh — Usage Guide',
  subtitle: 'Dashboard navigation, alert analysis, custom rules, FIM, vulnerability detection, active response, threat hunting.',
  tags: ['tag-siem','tag-vps'], tagLabels: ['SIEM','VPS Hosted'],
  parent: 'wazuh',
  sections: [
    { id: 'dashboard', title: 'Dashboard Navigation', html: `<p>Section paling sering dipakai:</p><ul><li><strong>Overview</strong> — summary alert, agent status, top threats</li><li><strong>Threat Intelligence → Alerts</strong> — filter by level, agent, time</li><li><strong>Security Events</strong> — raw events</li><li><strong>Vulnerability Detector</strong> — CVE per endpoint</li><li><strong>Integrity Monitoring</strong> — file changes</li><li><strong>Agents</strong> — status semua agent</li></ul>` },
    { id: 'alert-analysis', title: 'Alert Analysis & Filtering', html: `<div class="code-block"><div class="code-label"><span>KQL/Lucene</span></div><pre><code>rule.level: [7 TO 15]
agent.name: "nama-laptop-kamu"
rule.groups: "authentication_failed"
data.srcip: "192.168.1.100"
rule.level: >= 10 AND agent.name: "webserver-01"
rule.groups: "syscheck"
rule.groups: "vulnerability-detector"</code></pre></div>` },
    { id: 'custom-rules', title: 'Custom Rules', html: `<p>Custom rules di <code>/var/ossec/etc/rules/local_rules.xml</code>. ID harus 100000+.</p>
      <div class="code-block"><div class="code-label"><span>XML</span></div><pre><code>&lt;group name="custom_fim,"&gt;
  &lt;rule id="100001" level="10"&gt;
    &lt;if_sid&gt;550&lt;/if_sid&gt;
    &lt;field name="file"&gt;/etc/shadow&lt;/field&gt;
    &lt;description&gt;Critical file accessed: /etc/shadow&lt;/description&gt;
    &lt;mitre&gt;&lt;id&gt;T1003&lt;/id&gt;&lt;/mitre&gt;
  &lt;/rule&gt;
&lt;/group&gt;</code></pre></div>
      <div class="code-block"><div class="code-label"><span>Bash — Test</span></div><pre><code>/var/ossec/bin/wazuh-logtest
sudo systemctl restart wazuh-manager</code></pre></div>` },
    { id: 'decoders', title: 'Custom Decoders', html: `<p>Decoders di <code>/var/ossec/etc/decoders/local_decoder.xml</code>.</p><div class="code-block"><div class="code-label"><span>XML</span></div><pre><code>&lt;decoder name="custom_webapp"&gt;
  &lt;prematch&gt;^\\[webapp\\]&lt;/prematch&gt;
&lt;/decoder&gt;
&lt;decoder name="custom_webapp_fields"&gt;
  &lt;parent&gt;custom_webapp&lt;/parent&gt;
  &lt;regex&gt;user=(\\S+) action=(\\S+) ip=(\\S+)&lt;/regex&gt;
  &lt;order&gt;user, action, srcip&lt;/order&gt;
&lt;/decoder&gt;</code></pre></div>` },
    { id: 'fim', title: 'File Integrity Monitoring', html: `<div class="code-block"><div class="code-label"><span>XML — ossec.conf</span></div><pre><code>&lt;syscheck&gt;
  &lt;frequency&gt;300&lt;/frequency&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;/etc,/usr/bin,/usr/sbin&lt;/directories&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;/var/www/html&lt;/directories&gt;
  &lt;directories check_all="yes" realtime="yes"&gt;C:\\Windows\\System32&lt;/directories&gt;
  &lt;ignore&gt;/etc/mtab&lt;/ignore&gt;
  &lt;ignore type="sregex"&gt;.log$|.tmp$&lt;/ignore&gt;
&lt;/syscheck&gt;</code></pre></div>` },
    { id: 'vuln-detect', title: 'Vulnerability Detection', html: `<div class="code-block"><div class="code-label"><span>XML</span></div><pre><code>&lt;vulnerability-detector&gt;
  &lt;enabled&gt;yes&lt;/enabled&gt;
  &lt;interval&gt;5m&lt;/interval&gt;
  &lt;run_on_start&gt;yes&lt;/run_on_start&gt;
  &lt;provider name="nvd"&gt;&lt;enabled&gt;yes&lt;/enabled&gt;&lt;update_interval&gt;1h&lt;/update_interval&gt;&lt;/provider&gt;
&lt;/vulnerability-detector&gt;</code></pre></div>` },
    { id: 'active-response', title: 'Active Response', html: `<div class="code-block"><div class="code-label"><span>XML</span></div><pre><code>&lt;active-response&gt;
  &lt;command&gt;firewall-drop&lt;/command&gt;
  &lt;location&gt;local&lt;/location&gt;
  &lt;rules_id&gt;5763&lt;/rules_id&gt;
  &lt;timeout&gt;600&lt;/timeout&gt;
&lt;/active-response&gt;</code></pre></div>
<div class="callout callout-warn"><strong>Hati-hati:</strong> Test di lab dulu sebelum production.</div>` },
    { id: 'threat-hunting', title: 'Threat Hunting', html: `<div class="code-block"><div class="code-label"><span>KQL</span></div><pre><code>data.win.system.eventID: 1 AND (data.win.eventdata.image: "*powershell*" OR data.win.eventdata.image: "*cmd.exe*")
data.win.system.eventID: 4624 AND data.win.eventdata.logonType: "10"
data.win.system.eventID: 7045
rule.groups: "syscheck" AND syscheck.path: "/tmp/*"</code></pre></div>` }
  ]
},

'splunk-overview': {
  name: 'Splunk — Overview', subtitle: 'SIEM enterprise #1. SPL = skill wajib untuk SOC corporate.',
  tags: ['tag-siem'], tagLabels: ['SIEM'], parent: 'splunk',
  sections: [
    { id: 'overview', title: 'Apa itu Splunk?', html: `<p>SIEM enterprise yang mendominasi market. SPL (Search Processing Language) sangat fleksibel untuk analisis log besar.</p><ul><li><strong>Splunk Enterprise</strong> — self-hosted</li><li><strong>Splunk Cloud</strong> — managed</li><li><strong>Splunk Free</strong> — 500MB/day, cukup latihan</li><li><strong>ES</strong> — SIEM add-on premium</li><li><strong>SOAR</strong> — orchestration & automation</li></ul>` },
    { id: 'resources', title: 'Resources', html: `<div class="link-row"><a class="link-btn" href="https://docs.splunk.com" target="_blank">↗ Docs</a><a class="link-btn" href="https://education.splunk.com" target="_blank">↗ Training</a><a class="link-btn" href="https://bots.splunk.com" target="_blank">↗ BOTS</a></div>` }
  ]
},

'splunk-setup': {
  name: 'Splunk — Getting Started', subtitle: 'Install Splunk Enterprise, Cloud Trial, atau Docker. Setup Universal Forwarder.',
  tags: ['tag-siem'], tagLabels: ['SIEM'], parent: 'splunk',
  sections: [
    { id: 'install-server', title: 'Install Splunk', html: osTabs([
      { id: 'linux', icon: '🐧', label: 'Linux', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>wget -O splunk.deb 'https://download.splunk.com/products/splunk/releases/9.3.0/linux/splunk-9.3.0-linux-amd64.deb'
sudo dpkg -i splunk.deb
sudo /opt/splunk/bin/splunk start --accept-license
sudo /opt/splunk/bin/splunk enable boot-start
<span class="code-comment"># http://localhost:8000</span></code></pre></div>` },
      { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code>msiexec.exe /i splunk.msi SPLUNKPASSWORD=YourPassword123! /quiet
Start-Service Splunkd</code></pre></div>` },
      { id: 'mac', icon: '🍎', label: 'macOS', html: `<div class="code-block"><div class="code-label"><span>Terminal</span></div><pre><code>tar -xvzf splunk-9.3.0-macosx-10.12-x86_64.tgz -C /opt
/opt/splunk/bin/splunk start --accept-license</code></pre></div>` },
      { id: 'docker', icon: '🐳', label: 'Docker', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>docker run -d -p 8000:8000 -e SPLUNK_START_ARGS='--accept-license' -e SPLUNK_PASSWORD='YourPass123!' --name splunk splunk/splunk:latest</code></pre></div>` }
    ]) + `<div class="callout callout-tip"><strong>Tercepat:</strong> Docker, atau Splunk Cloud Trial 14 hari.</div>` },
    { id: 'forwarder', title: 'Universal Forwarder', html: osTabs([
      { id: 'linux', icon: '🐧', label: 'Linux', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>wget -O splunkforwarder.deb 'https://download.splunk.com/products/universalforwarder/releases/9.3.0/linux/splunkforwarder-9.3.0-linux-amd64.deb'
sudo dpkg -i splunkforwarder.deb
sudo /opt/splunkforwarder/bin/splunk start --accept-license
sudo /opt/splunkforwarder/bin/splunk add forward-server [SPLUNK_IP]:9997
sudo /opt/splunkforwarder/bin/splunk add monitor /var/log/</code></pre></div>` },
      { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code>msiexec.exe /i splunkforwarder.msi RECEIVING_INDEXER="[SPLUNK_IP]:9997" /quiet</code></pre></div>` }
    ]) }
  ]
},

'splunk-usage': {
  name: 'Splunk — SPL Mastery', subtitle: 'Basic → advanced SPL, threat hunting, dashboards, alerts. Ini yang bikin dapet kerja.',
  tags: ['tag-siem'], tagLabels: ['SIEM'], parent: 'splunk',
  sections: [
    { id: 'basic', title: 'SPL Basics', html: `<div class="code-block"><div class="code-label"><span>SPL</span></div><pre><code>index=* earliest=-24h
index=windows EventCode=4625 | stats count by user, src_ip
index=web_logs | top limit=10 src_ip
index=* | timechart count span=1h
index=* src_ip="192.168.1.100" | table _time, sourcetype, EventCode, user</code></pre></div>` },
    { id: 'hunting', title: 'Threat Hunting', html: `<div class="code-block"><div class="code-label"><span>SPL</span></div><pre><code>index=windows EventCode=4625 | bucket _time span=5m | stats count by _time, src_ip, user | where count > 5
index=windows EventCode=4688 CommandLine="*-enc*" OR CommandLine="*-EncodedCommand*"
index=network bytes_out > 10000000 | stats sum(bytes_out) as total_MB by src_ip, dest_ip | eval total_MB=round(total_MB/1024/1024,1) | sort -total_MB</code></pre></div>` },
    { id: 'advanced', title: 'Advanced SPL', html: `<div class="code-block"><div class="code-label"><span>SPL</span></div><pre><code><span class="code-comment"># eval</span>
index=network | eval MB = bytes_out/1024/1024 | where MB > 100

<span class="code-comment"># rex</span>
index=web_logs | rex field=_raw "user=(?&lt;username&gt;\\w+)" | stats count by username

<span class="code-comment"># transaction</span>
index=windows EventCode=4624 OR EventCode=4634 | transaction user maxspan=1h | eval duration=round(duration/60,1) | table user, duration, eventcount

<span class="code-comment"># lookup</span>
index=firewall action=blocked | lookup threat_intel.csv ip AS src_ip OUTPUT threat_name, severity | where isnotnull(threat_name)

<span class="code-comment"># tstats</span>
| tstats count where index=windows by _time, host span=1h</code></pre></div>
<div class="callout callout-tip"><strong>Interview:</strong> Hafalkan stats, eval, rex, transaction, lookup, timechart.</div>` },
    { id: 'dashboards', title: 'Dashboards', html: `<ul><li><strong>Failed Logins:</strong> <code>index=windows EventCode=4625 | timechart count span=1h</code></li><li><strong>Top Attackers:</strong> <code>index=windows EventCode=4625 | top limit=10 src_ip</code></li><li><strong>New Services:</strong> <code>index=windows EventCode=7045 | table _time, host, ServiceName</code></li><li><strong>PowerShell:</strong> <code>index=windows EventCode=4104 | stats count by host | sort -count</code></li></ul>` },
    { id: 'alerts', title: 'Alerts', html: `<p>Save As → Alert. Config: trigger condition, schedule (5-15min), action (email/webhook), throttle.</p><div class="callout callout-warn"><strong>Jangan</strong> real-time alert untuk heavy queries.</div>` },
    { id: 'bots', title: 'BOTS Challenge', html: `<div class="link-row"><a class="link-btn" href="https://bots.splunk.com" target="_blank">↗ BOTS</a><a class="link-btn" href="https://education.splunk.com" target="_blank">↗ Training</a></div>` }
  ]
},

});
