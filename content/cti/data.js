// CTI Platforms (with ThreatFox)
Object.assign(TOOLS, {
cti: {
  name: 'CTI Platforms', subtitle: 'Cyber Threat Intelligence — semua web-based. Lookup IOC, analisis file/URL, threat research.',
  tags: ['tag-cti','tag-web'], tagLabels: ['CTI','Web-based'],
  sections: [
    { id: 'overview', title: 'Overview', html: `<p>CTI tools dipakai setiap hari untuk <em>enrichment</em> — menambah konteks pada IOC.</p>
      <div class="callout callout-tip"><strong>Workflow:</strong> IOC dari SIEM → lookup VT + AbuseIPDB → sandbox (Any.run) → dokumentasikan di IRIS/TheHive.</div>
      <table class="cti-table">
        <tr><th>Tool</th><th>Kegunaan</th><th>Link</th></tr>
        <tr><td>VirusTotal</td><td>Scan file/URL/IP/hash ke 70+ engine</td><td><a href="https://virustotal.com" target="_blank">virustotal.com</a></td></tr>
        <tr><td>AbuseIPDB</td><td>Cek reputasi IP</td><td><a href="https://abuseipdb.com" target="_blank">abuseipdb.com</a></td></tr>
        <tr><td>Any.run</td><td>Interactive malware sandbox</td><td><a href="https://any.run" target="_blank">any.run</a></td></tr>
        <tr><td>Tria.ge</td><td>Malware sandbox cepat</td><td><a href="https://tria.ge" target="_blank">tria.ge</a></td></tr>
        <tr><td>ThreatFox</td><td>Database IOC — C2, malware config, botnet</td><td><a href="https://threatfox.abuse.ch" target="_blank">threatfox.abuse.ch</a></td></tr>
        <tr><td>Talos</td><td>Threat intel Cisco</td><td><a href="https://talosintelligence.com" target="_blank">talosintelligence.com</a></td></tr>
        <tr><td>IBM X-Force</td><td>Database IP/URL/malware</td><td><a href="https://exchange.xforce.ibmcloud.com" target="_blank">exchange.xforce.ibmcloud.com</a></td></tr>
        <tr><td>OTX AlienVault</td><td>Open Threat Exchange</td><td><a href="https://otx.alienvault.com" target="_blank">otx.alienvault.com</a></td></tr>
        <tr><td>MalwareBazaar</td><td>Database malware sample</td><td><a href="https://bazaar.abuse.ch" target="_blank">bazaar.abuse.ch</a></td></tr>
      </table>` },
    { id: 'threatfox', title: 'ThreatFox — IOC Database', html: `<p><a href="https://threatfox.abuse.ch" target="_blank" style="color:var(--accent)">ThreatFox</a> dari abuse.ch — database IOC komunitas.</p>
      <ul><li><strong>C2 Server Lookup</strong></li><li><strong>Malware Config</strong></li><li><strong>Bulk IOC Export</strong> → import ke SIEM/firewall</li><li><strong>API Integration</strong></li></ul>
      <div class="code-block"><div class="code-label"><span>Bash — ThreatFox API</span></div><pre><code>curl -X POST https://threatfox-api.abuse.ch/api/v1/ \\
  -d '{"query":"search_ioc","search_term":"emotet"}'</code></pre></div>` },
    { id: 'frameworks', title: 'Framework Analisis', html: `<h3>Cyber Kill Chain</h3><p>7 fase: Recon → Weaponize → Deliver → Exploit → Install → C2 → Actions.</p><h3>Diamond Model</h3><p>4 komponen: Adversary, Infrastructure, Capability, Victim. Pivot analysis.</p>` }
  ]
}
});
