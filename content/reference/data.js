// Reference: Windows Events, Ports, MITRE ATT&CK
Object.assign(TOOLS, {
'windows-events': {
  name: 'Windows Event IDs', subtitle: 'Cheat sheet Event ID wajib dihapal SOC analyst.',
  tags: ['tag-reference'], tagLabels: ['SOC Reference'],
  sections: [
    { id: 'auth', title: 'Authentication', html: `<table class="ref-table"><tr><th>ID</th><th>Event</th><th>Notes</th></tr><tr><td>4624</td><td>Successful logon</td><td>Type: 2=Interactive, 3=Network, 10=RDP</td></tr><tr><td>4625</td><td>Failed logon</td><td><span class="sev sev-crit">CRITICAL</span> Brute force</td></tr><tr><td>4648</td><td>Explicit credentials</td><td><span class="sev sev-high">HIGH</span> Lateral movement</td></tr><tr><td>4672</td><td>Special privileges</td><td><span class="sev sev-high">HIGH</span> Admin logon</td></tr><tr><td>4768</td><td>Kerberos TGT</td><td>Kerberoasting</td></tr></table>` },
    { id: 'account', title: 'Account Management', html: `<table class="ref-table"><tr><th>ID</th><th>Event</th><th>Notes</th></tr><tr><td>4720</td><td>User created</td><td><span class="sev sev-crit">CRITICAL</span> Backdoor</td></tr><tr><td>4724</td><td>Password reset</td><td><span class="sev sev-high">HIGH</span> Takeover</td></tr><tr><td>4728</td><td>Added to global group</td><td><span class="sev sev-crit">CRITICAL</span> Domain Admins</td></tr><tr><td>4732</td><td>Added to local group</td><td><span class="sev sev-high">HIGH</span> Administrators</td></tr></table>` },
    { id: 'process', title: 'Process & Service', html: `<table class="ref-table"><tr><th>ID</th><th>Event</th><th>Notes</th></tr><tr><td>4688</td><td>Process created</td><td><span class="sev sev-crit">CRITICAL</span> Enable cmdline logging!</td></tr><tr><td>7045</td><td>Service installed</td><td><span class="sev sev-crit">CRITICAL</span> Persistence</td></tr><tr><td>4698</td><td>Scheduled task</td><td><span class="sev sev-high">HIGH</span> T1053</td></tr><tr><td>1102</td><td>Log cleared</td><td><span class="sev sev-crit">CRITICAL</span> Always suspicious</td></tr><tr><td>4104</td><td>PowerShell script</td><td><span class="sev sev-crit">CRITICAL</span> Full content</td></tr></table>` },
    { id: 'queries', title: 'SIEM Queries', html: `<div class="code-block"><div class="code-label"><span>SPL</span></div><pre><code>index=windows EventCode=4625 | stats count by src_ip, user | where count > 5
index=windows (EventCode=4720 OR EventCode=4728)
index=windows EventCode=4104 | search ScriptBlockText="*downloadstring*"
index=windows EventCode=1102</code></pre></div>` }
  ]
},
'common-ports': {
  name: 'Ports & Protocols', subtitle: 'Quick reference port dan protokol.',
  tags: ['tag-reference'], tagLabels: ['SOC Reference'],
  sections: [
    { id: 'common', title: 'Common Ports', html: `<table class="ref-table"><tr><th>Port</th><th>Service</th><th>SOC Notes</th></tr><tr><td>22</td><td>SSH</td><td>Brute force target #1</td></tr><tr><td>23</td><td>Telnet</td><td><span class="sev sev-crit">CLEARTEXT</span></td></tr><tr><td>53</td><td>DNS</td><td>Tunneling, DGA</td></tr><tr><td>80</td><td>HTTP</td><td>C2 blends in</td></tr><tr><td>443</td><td>HTTPS</td><td>C2 juga pakai 443</td></tr><tr><td>445</td><td>SMB</td><td><span class="sev sev-crit">CRITICAL</span> Lateral movement</td></tr><tr><td>3389</td><td>RDP</td><td><span class="sev sev-crit">CRITICAL</span> Jangan expose!</td></tr></table>` },
    { id: 'suspicious', title: 'Suspicious Ports', html: `<table class="ref-table"><tr><th>Port</th><th>Asosiasi</th><th>Notes</th></tr><tr><td>4444</td><td>Meterpreter</td><td><span class="sev sev-crit">ALERT</span> Reverse shell</td></tr><tr><td>5555</td><td>Android ADB</td><td>Investigate</td></tr><tr><td>6667</td><td>IRC</td><td>Botnet C2</td></tr><tr><td>8080</td><td>HTTP Alt</td><td>Proxy or C2</td></tr><tr><td>9001</td><td>Tor</td><td>Investigate</td></tr></table>` }
  ]
},
'mitre-attack': {
  name: 'MITRE ATT&CK', subtitle: 'Framework taksonomi serangan standar industri.',
  tags: ['tag-reference'], tagLabels: ['SOC Reference'],
  sections: [
    { id: 'overview', title: 'Apa itu ATT&CK?', html: `<p>Knowledge base teknik serangan nyata. Untuk: klasifikasi alert, gap analysis, threat hunting, standar komunikasi.</p><div class="link-row"><a class="link-btn" href="https://attack.mitre.org" target="_blank">↗ ATT&CK Matrix</a><a class="link-btn" href="https://mitre-attack.github.io/attack-navigator/" target="_blank">↗ Navigator</a></div>` },
    { id: 'tactics', title: '14 Taktik', html: `<table class="ref-table"><tr><th>#</th><th>Tactic</th><th>Contoh</th></tr><tr><td>1</td><td>Reconnaissance</td><td>Port scan, OSINT</td></tr><tr><td>3</td><td>Initial Access</td><td>Phishing T1566, Valid Accounts T1078</td></tr><tr><td>4</td><td>Execution</td><td>PowerShell T1059.001, Schtask T1053</td></tr><tr><td>5</td><td>Persistence</td><td>Registry T1547, Service T1543</td></tr><tr><td>7</td><td>Defense Evasion</td><td>Clear Logs T1070</td></tr><tr><td>8</td><td>Credential Access</td><td>Brute Force T1110, Kerberoasting T1558</td></tr><tr><td>10</td><td>Lateral Movement</td><td>RDP, SMB, PSExec, WinRM</td></tr><tr><td>12</td><td>C2</td><td>HTTP C2, DNS Tunneling</td></tr><tr><td>14</td><td>Impact</td><td>Ransomware T1486</td></tr></table>` },
    { id: 'mapping', title: 'Tool Mapping', html: `<table class="ref-table"><tr><th>Tactic</th><th>Detection</th><th>How</th></tr><tr><td>Initial Access</td><td>Wazuh, Email GW</td><td>Phishing, external logins</td></tr><tr><td>Execution</td><td>Wazuh, Splunk</td><td>4688, PowerShell 4104</td></tr><tr><td>Persistence</td><td>Wazuh FIM, Sysmon</td><td>Registry, services 7045</td></tr><tr><td>Credential</td><td>Wazuh, Splunk</td><td>4625, Kerberos 4768</td></tr><tr><td>Lateral</td><td>Wazuh, Wireshark</td><td>RDP type10, SMB 5140</td></tr><tr><td>C2</td><td>Wireshark, FW</td><td>Beaconing, DNS tunneling</td></tr></table>` }
  ]
}
});
