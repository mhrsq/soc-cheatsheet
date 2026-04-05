// Forensics: Wireshark, tcpdump, Volatility, Autopsy, FTK, strings & hash
Object.assign(TOOLS, {
wireshark: {
  name: 'Wireshark', subtitle: 'Network packet analyzer. Capture dan analisis traffic.',
  tags: ['tag-forensics'], tagLabels: ['Network Forensics'],
  sections: [
    { id: 'overview', title: 'Overview', html: `<p>Capture semua packet di network interface. Untuk analisis C2, data exfil, rekonstruksi HTTP, network forensics.</p>` },
    { id: 'install', title: 'Install', html: osTabs([
      { id: 'linux', icon: '🐧', label: 'Linux', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt update && sudo apt install wireshark -y
sudo usermod -aG wireshark $USER</code></pre></div>` },
      { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>Windows</span></div><pre><code><span class="code-comment"># Download dari wireshark.org/download.html
# Include Npcap driver</span></code></pre></div>` },
      { id: 'mac', icon: '🍎', label: 'macOS', html: `<div class="code-block"><div class="code-label"><span>Terminal</span></div><pre><code>brew install --cask wireshark</code></pre></div>` }
    ]) },
    { id: 'filters', title: 'Display Filters', html: `<div class="code-block"><div class="code-label"><span>Wireshark</span></div><pre><code>http | dns | tcp | tls
ip.addr == 192.168.1.100
ip.src == 10.0.0.5 && tcp.port == 4444
frame contains "password"
http.request.method == "POST"</code></pre></div><p><strong>Follow Stream:</strong> Right-click → Follow → TCP Stream. <strong>Export:</strong> File → Export Objects → HTTP.</p>` },
    { id: 'resources', title: 'Resources', html: `<div class="link-row"><a class="link-btn" href="https://wiki.wireshark.org/DisplayFilters" target="_blank">↗ Filters</a><a class="link-btn" href="https://malware-traffic-analysis.net" target="_blank">↗ PCAP Samples</a></div>` }
  ]
},
tcpdump: {
  name: 'tcpdump', subtitle: 'CLI packet capture. Ada di semua Linux.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Network Forensics','CLI'],
  sections: [
    { id: 'usage', title: 'Commands', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo tcpdump -i eth0 -w /tmp/capture.pcap
sudo tcpdump -i eth0 port 80 -w http.pcap
sudo tcpdump -i eth0 host 192.168.1.100 -w host.pcap
sudo tcpdump -n -i eth0 -c 100 -w small.pcap
sudo tcpdump -r capture.pcap
sudo tcpdump -i eth0 -A port 80</code></pre></div>` }
  ]
},
volatility: {
  name: 'Volatility 3', subtitle: 'Memory forensics. RAM dump analysis.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Memory Forensics','CLI'],
  sections: [
    { id: 'install', title: 'Install', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>git clone https://github.com/volatilityfoundation/volatility3.git
cd volatility3 && pip3 install -r requirements.txt
python3 vol.py -h</code></pre></div>` },
    { id: 'plugins', title: 'Plugin Penting', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>python3 vol.py -f memory.dmp windows.pslist
python3 vol.py -f memory.dmp windows.psscan
python3 vol.py -f memory.dmp windows.cmdline
python3 vol.py -f memory.dmp windows.netstat
python3 vol.py -f memory.dmp windows.malfind
python3 vol.py -f memory.dmp windows.dlllist
python3 vol.py -f memory.dmp windows.dumpfiles --pid 1234</code></pre></div>
<div class="callout callout-tip"><strong>Start with:</strong> pslist + cmdline + netstat.</div>` },
    { id: 'resources', title: 'Resources', html: `<div class="link-row"><a class="link-btn" href="https://volatility3.readthedocs.io" target="_blank">↗ Docs</a><a class="link-btn" href="https://github.com/volatilityfoundation/volatility3" target="_blank">↗ GitHub</a></div>` }
  ]
},
autopsy: {
  name: 'Autopsy', subtitle: 'Disk forensics GUI.',
  tags: ['tag-forensics'], tagLabels: ['Disk Forensics'],
  sections: [
    { id: 'install', title: 'Install', html: osTabs([
      { id: 'linux', icon: '🐧', label: 'Linux', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>sudo apt install autopsy -y
autopsy</code></pre></div>` },
      { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>Windows</span></div><pre><code><span class="code-comment"># Download Autopsy 4.x dari autopsy.com/download</span></code></pre></div>` }
    ]) },
    { id: 'usage', title: 'Workflow', html: `<ol><li>New Case</li><li>Add Data Source</li><li>Ingest Modules</li><li>Browse Results</li><li>Generate Report</li></ol>` }
  ]
},
ftk: {
  name: 'FTK Imager', subtitle: 'Forensic disk imaging. Windows only.',
  tags: ['tag-forensics'], tagLabels: ['Disk Acquisition'],
  sections: [
    { id: 'overview', title: 'Overview', html: `<p>Forensic imaging — salinan 1:1 tanpa ubah asli.</p><div class="callout callout-warn"><strong>Windows only.</strong></div><div class="link-row"><a class="link-btn" href="https://www.exterro.com/ftk-product-downloads/ftk-imager-4-7-1" target="_blank">↗ Download</a></div>` },
    { id: 'usage', title: 'Cara Pakai', html: `<p><strong>Disk Image:</strong> File → Create Disk Image → E01. <strong>Hash:</strong> Auto MD5+SHA1. <strong>RAM:</strong> File → Capture Memory.</p>` }
  ]
},
misc: {
  name: 'strings & hash', subtitle: 'Strings extraction + hash verification.',
  tags: ['tag-forensics','tag-cli'], tagLabels: ['Malware Analysis','CLI'],
  sections: [
    { id: 'strings', title: 'strings', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>strings malware.exe
strings -n 8 malware.exe
strings malware.exe | grep -E "(http|https|[0-9]{1,3}\\.[0-9]{1,3})"
strings malware.exe | grep -i "HKEY"</code></pre></div>` },
    { id: 'hash', title: 'Hash', html: osTabs([
      { id: 'linux', icon: '🐧', label: 'Linux/Mac', html: `<div class="code-block"><div class="code-label"><span>Bash</span></div><pre><code>md5sum file.exe
sha256sum file.exe</code></pre></div>` },
      { id: 'windows', icon: '🪟', label: 'Windows', html: `<div class="code-block"><div class="code-label"><span>PowerShell</span></div><pre><code>Get-FileHash file.exe
Get-FileHash file.exe -Algorithm MD5</code></pre></div>` }
    ]) }
  ]
}
});
