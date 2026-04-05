// ═══════════════════════════════════════════════════════
// Navigation, Categories & Shared Helpers
// ═══════════════════════════════════════════════════════

const TOOLS = {};

function osTabs(tabs) {
  const bar = tabs.map((t,i) => `<button class="os-tab-btn ${i===0?'active':''}" data-tab="${t.id}" onclick="switchTab(this)"><span class="tab-icon">${t.icon}</span> ${t.label}</button>`).join('');
  const panels = tabs.map((t,i) => `<div class="os-tab-panel ${i===0?'active':''}" data-tab="${t.id}">${t.html}</div>`).join('');
  return `<div class="os-tabs"><div class="os-tab-bar">${bar}</div>${panels}</div>`;
}

const NAV_SECTIONS = [
  {
    label: 'Fundamentals',
    items: [
      { id: 'soc-fundamentals', name: 'SOC Fundamentals', color: '#34d399' },
      { id: 'log-analysis', name: 'Log Analysis', color: '#34d399' },
      { id: 'network-fundamentals', name: 'Network Basics', color: '#34d399' },
      { id: 'email-phishing', name: 'Email & Phishing', color: '#34d399' },
      { id: 'alert-triage', name: 'Alert Triage', color: '#34d399' },
      { id: 'osint-soc', name: 'OSINT for SOC', color: '#34d399' },
      { id: 'av-edr-ndr-xdr', name: 'AV vs EDR vs NDR vs XDR', color: '#34d399' }
    ]
  },
  {
    label: 'SIEM',
    items: [
      { id: 'wazuh', name: 'Wazuh', color: '#58a6ff', children: [
        { id: 'wazuh-overview', name: 'Overview' },
        { id: 'wazuh-setup', name: 'Getting Started' },
        { id: 'wazuh-usage', name: 'Usage Guide' }
      ]},
      { id: 'splunk', name: 'Splunk', color: '#58a6ff', children: [
        { id: 'splunk-overview', name: 'Overview' },
        { id: 'splunk-setup', name: 'Getting Started' },
        { id: 'splunk-usage', name: 'SPL Mastery' }
      ]}
    ]
  },
  {
    label: 'EDR',
    items: [
      { id: 'wazuh-agent', name: 'Wazuh Agent', color: '#3fb950', children: [
        { id: 'wazuh-agent-overview', name: 'Overview' },
        { id: 'wazuh-agent-setup', name: 'Setup & Troubleshoot' },
        { id: 'wazuh-agent-usage', name: 'Config & Response' }
      ]}
    ]
  },
  {
    label: 'NDR / IDS',
    items: [
      { id: 'ndr-ids', name: 'IDS/IPS & NDR', color: '#f472b6', children: [
        { id: 'ndr-overview', name: 'Overview' },
        { id: 'ndr-suricata', name: 'Suricata' },
        { id: 'ndr-snort', name: 'Snort' }
      ]}
    ]
  },
  {
    label: 'Ticketing',
    items: [
      { id: 'iris', name: 'DFIR-IRIS', color: '#1D9E75', children: [
        { id: 'iris-overview', name: 'Overview' },
        { id: 'iris-setup', name: 'Setup' },
        { id: 'iris-usage', name: 'Full Guide' }
      ]},
      { id: 'thehive', name: 'TheHive', color: '#1D9E75', children: [
        { id: 'thehive-overview', name: 'Overview' },
        { id: 'thehive-setup', name: 'Setup' },
        { id: 'thehive-usage', name: 'Full Guide' }
      ]}
    ]
  },
  {
    label: 'CTI',
    items: [
      { id: 'cti', name: 'CTI Platforms', color: '#bc8cff' }
    ]
  },
  {
    label: 'Forensics',
    items: [
      { id: 'wireshark', name: 'Wireshark', color: '#f85149' },
      { id: 'tcpdump', name: 'tcpdump', color: '#f85149' },
      { id: 'volatility', name: 'Volatility 3', color: '#f85149' },
      { id: 'autopsy', name: 'Autopsy', color: '#f85149' },
      { id: 'ftk', name: 'FTK Imager', color: '#f85149' },
      { id: 'misc', name: 'strings & hash', color: '#f85149' }
    ]
  },
  {
    label: 'Practice',
    items: [
      { id: 'blue-team-platforms', name: 'Lab Platforms', color: '#818cf8' }
    ]
  },
  {
    label: 'Reference',
    items: [
      { id: 'windows-events', name: 'Windows Event IDs', color: '#f59e0b' },
      { id: 'common-ports', name: 'Ports & Protocols', color: '#f59e0b' },
      { id: 'mitre-attack', name: 'MITRE ATT&CK', color: '#f59e0b' }
    ]
  },
  {
    label: 'Playbooks',
    items: [
      { id: 'ir-playbooks', name: 'IR Playbooks', color: '#ec4899' },
      { id: 'linux-response', name: 'Linux Live Response', color: '#ec4899' },
      { id: 'windows-response', name: 'Windows Live Response', color: '#ec4899' }
    ]
  }
];

const HOME_CATEGORIES = [
  { name: 'SOC Fundamentals', tools: [
    { id: 'soc-fundamentals', name: 'SOC Fundamentals', hosted: false, desc: 'Apa itu SOC, role L1/L2/L3, daily routine, escalation, dan SLA.' },
    { id: 'log-analysis', name: 'Log Analysis', hosted: false, desc: 'Cara baca log dari nol: format, timestamp, severity, dan field extraction.' },
    { id: 'network-fundamentals', name: 'Network Basics', hosted: false, desc: 'OSI model, TCP handshake, DNS, HTTP anatomy — fondasi network security.' },
    { id: 'email-phishing', name: 'Email & Phishing', hosted: false, desc: 'Analisis email header, SPF/DKIM/DMARC, URL analysis, attachment triage.' },
    { id: 'alert-triage', name: 'Alert Triage', hosted: false, desc: 'Decision framework: alert masuk → analisis → FP/TP → escalate/close.' },
    { id: 'osint-soc', name: 'OSINT for SOC', hosted: false, desc: 'Shodan, Censys, WHOIS, passive DNS, Google dorking — investigasi aset.' },
    { id: 'av-edr-ndr-xdr', name: 'AV vs EDR vs XDR', hosted: false, desc: 'Apa bedanya Antivirus, EDR, NDR, dan XDR? Kapan pakai yang mana.' }
  ]},
  { name: 'SIEM', tools: [
    { id: 'wazuh-overview', name: 'Wazuh', hosted: true, desc: 'Open source SIEM + EDR. Monitor log, detect threat, vulnerability management.' },
    { id: 'splunk-overview', name: 'Splunk', hosted: false, desc: 'SIEM enterprise. SPL query language — wajib dikuasai untuk kerja di SOC.' }
  ]},
  { name: 'EDR', tools: [
    { id: 'wazuh-agent-overview', name: 'Wazuh Agent', hosted: true, desc: 'EDR agent di endpoint. Process monitoring, FIM, network tracking, active response.' }
  ]},
  { name: 'NDR / IDS', tools: [
    { id: 'ndr-overview', name: 'IDS/IPS & NDR', hosted: false, desc: 'Apa bedanya IDS vs IPS vs NDR? Suricata & Snort setup, rules, dan detection.' }
  ]},
  { name: 'Ticketing System', tools: [
    { id: 'iris-overview', name: 'DFIR-IRIS', hosted: true, desc: 'Case management DFIR. IOC tracking, timeline, evidence, report generation.' },
    { id: 'thehive-overview', name: 'TheHive', hosted: true, desc: 'IR kolaboratif + Cortex enrichment. Alert → Case → Task → Close.' }
  ]},
  { name: 'CTI Platforms', tools: [
    { id: 'cti', name: '9 CTI Tools', hosted: false, desc: 'VirusTotal, AbuseIPDB, Any.run, ThreatFox, Talos, X-Force, OTX, MalwareBazaar.' }
  ]},
  { name: 'Forensics', tools: [
    { id: 'wireshark', name: 'Wireshark', hosted: false, desc: 'Network packet analyzer. Analisis traffic, C2, network forensics.' },
    { id: 'tcpdump', name: 'tcpdump', hosted: false, desc: 'CLI packet capture. Ringan, ada di semua Linux.' },
    { id: 'volatility', name: 'Volatility 3', hosted: false, desc: 'Memory forensics. RAM dump analysis.' },
    { id: 'autopsy', name: 'Autopsy', hosted: false, desc: 'Disk forensics GUI.' },
    { id: 'ftk', name: 'FTK Imager', hosted: false, desc: 'Forensic disk imaging.' },
    { id: 'misc', name: 'strings & hash', hosted: false, desc: 'Strings extraction + hash verification.' }
  ]},
  { name: 'Practice Platforms', tools: [
    { id: 'blue-team-platforms', name: 'Blue Team Labs', hosted: false, desc: 'BTLO, TryHackMe, HackTheBox, LetsDefend, CyberDefenders.' }
  ]},
  { name: 'SOC Reference', tools: [
    { id: 'windows-events', name: 'Windows Event IDs', hosted: false, desc: 'Event ID wajib dihapal SOC analyst.' },
    { id: 'common-ports', name: 'Ports & Protocols', hosted: false, desc: 'Port dan protokol jaringan.' },
    { id: 'mitre-attack', name: 'MITRE ATT&CK', hosted: false, desc: 'Framework taksonomi serangan.' },
    { id: 'ir-playbooks', name: 'IR Playbooks', hosted: false, desc: 'Playbook: phishing, malware, brute force.' },
    { id: 'linux-response', name: 'Linux Live Response', hosted: false, desc: 'Command investigasi Linux.' },
    { id: 'windows-response', name: 'Windows Live Response', hosted: false, desc: 'PowerShell commands untuk investigasi Windows.' }
  ]}
];
