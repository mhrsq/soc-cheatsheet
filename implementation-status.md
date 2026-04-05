# SOC Tools Guide — Implementation Status

> JagoanSiber SOC Analyst Training  
> Repository: [github.com/mhrsq/soc-cheatsheet](https://github.com/mhrsq/soc-cheatsheet)  
> Live: [141.94.36.151/cheatsheet](http://141.94.36.151/cheatsheet/)  
> Last updated: April 5, 2026

---

## Starting Point

Single monolithic HTML file (`soc-docs.html`, ~2200 lines) containing a basic SOC tools reference with:
- 12 tool pages (Wazuh, Splunk, Wazuh Agent, DFIR-IRIS, TheHive, CTI Platforms, Wireshark, tcpdump, Volatility, Autopsy, FTK Imager, strings & hash)
- Dark/light theme toggle
- Left sidebar navigation
- No search, no copy buttons, no mobile support, no URL routing
- All content in one file, hard to maintain
- Placeholder VPS URLs

---

## Round 1 — Complete Rebuild (HTML + CSS + JS split)

**Goal:** Fix all UX/UI issues, add essential SOC content, split into maintainable files.

### Files Created
| File | Purpose |
|------|---------|
| `index.html` | HTML shell — header, sidebar, search modal, layout |
| `styles.css` | All CSS — variables, layout, components, responsive, print |
| `data.js` | All tool content as JS TOOLS object |
| `app.js` | All logic — navigation, search, copy, theme, routing |

### UX/UI Improvements Implemented
- ✅ **Copy button** on all code blocks with "Copied!" feedback
- ✅ **Search** (Ctrl+K) — fuzzy search across all content with highlighted matches
- ✅ **URL hash routing** — `#wazuh`, `#splunk`, etc. Bookmarkable, shareable, refresh-safe
- ✅ **Mobile hamburger menu** — slide-out sidebar with overlay
- ✅ **Theme persistence** — dark/light saved to localStorage
- ✅ **Reading progress bar** — green bar at top of header during scroll
- ✅ **Page transitions** — smooth fade-in on navigate
- ✅ **SOC Workflow diagram** — visual 7-step flow on homepage
- ✅ **Staggered card animations** — tool cards appear with delay
- ✅ **Callout icons** — 💡 tip, ⚠️ warn, ℹ️ info
- ✅ **Print stylesheet** — Ctrl+P renders clean layout
- ✅ **Keyboard shortcuts** — Ctrl+K search, ESC close, / focus search
- ✅ **Favicon** — JagoanSiber logo as favicon
- ✅ **Meta tags** — title, description, author

### New Content Added (5 pages)
| Page | Sections |
|------|----------|
| Windows Event IDs | Authentication, Account Management, Process & Service, SIEM Queries |
| Ports & Protocols | Common Ports (7), Suspicious Ports (5) |
| MITRE ATT&CK | Overview, 14 Tactics, Tool Mapping |
| IR Playbooks | NIST Framework, Phishing, Malware, Brute Force playbooks |
| Linux Live Response | System Info, Users, Processes, Network, Persistence, Files & Logs |

### Existing Content Enhanced
- **Wazuh** — added Custom Rules section (XML structure, testing, MITRE mapping)
- **Splunk** — added Advanced SPL (eval, rex, transaction, lookup, subsearch, tstats)
- **CTI** — added Cyber Kill Chain + Diamond Model frameworks

---

## Round 2 — Sidebar, Logo, Sub-modules, OS Tabs

**Goal:** Collapsible sidebar, JagoanSiber branding, restructure Wazuh/Splunk into sub-modules, add OS switching tabs, add Blue Team platforms.

### Changes
- ✅ **Sidebar collapsed by default** — toggle open/close, state saved to localStorage
- ✅ **JagoanSiber logo** — favicon.png in header + browser tab
- ✅ **Removed** all "Batch 2", "Modul 2", "Mahrus Qusaeri" references
- ✅ **OS Tab UI component** — `osTabs()` function for Linux/Windows/macOS/Docker switching
- ✅ **Wazuh → 3 sub-modules:**
  - Overview (architecture, use cases, resources)
  - Getting Started (server install: All-in-One + Docker tabs, agent install: Linux/Win/Mac tabs, agent management)
  - Usage Guide (dashboard, alert analysis, custom rules, decoders, FIM, vuln detection, active response, threat hunting)
- ✅ **Splunk → 3 sub-modules:**
  - Overview (ecosystem, resources)
  - Getting Started (install: Linux/Win/Mac/Docker tabs, Universal Forwarder: Linux/Win tabs)
  - SPL Mastery (basics, threat hunting, advanced, dashboards, alerts, BOTS)
- ✅ **CTI** — added ThreatFox (abuse.ch IOC database with API examples)
- ✅ **New section: Blue Team Practice Platforms** — BTLO, TryHackMe, HackTheBox, LetsDefend, CyberDefenders with comparison table and recommended learning paths
- ✅ **Collapsible nav groups** — Wazuh and Splunk have expandable sub-navigation

---

## Round 3 — Modular Content Architecture + 7 New Articles

**Goal:** Split monolithic data.js into per-category modules. Add fundamental SOC training articles.

### Architecture Change
Replaced single `data.js` (937 lines) with modular content system:

```
content/
  _nav.js              (150 lines) — Navigation, categories, TOOLS init, osTabs helper
  fundamentals/data.js (1623 lines) — 7 article-style pages
  siem/data.js          (232 lines) — Wazuh ×3, Splunk ×3
  edr/data.js           (953 lines) — Wazuh Agent ×3
  ticketing/data.js    (1200 lines) — IRIS ×3, TheHive ×3
  cti/data.js            (28 lines) — CTI Platforms
  forensics/data.js      (89 lines) — Wireshark, tcpdump, Volatility, Autopsy, FTK, strings & hash
  practice/data.js       (18 lines) — Blue Team Platforms
  reference/data.js      (33 lines) — Windows Events, Ports, MITRE ATT&CK
  playbooks/data.js     (355 lines) — IR Playbooks, Linux Response, Windows Response
```

Each file uses `Object.assign(TOOLS, {...})` pattern. Edit one category without touching others.

### New Fundamentals Articles (article-style with explanations + commands + examples)
| Article | Key Content |
|---------|-------------|
| **SOC Fundamentals** | What is SOC, L1/L2/L3 roles (with ID salary ranges), daily routine timeline, tools ecosystem, metrics/SLA (MTTD, MTTR), career path + certifications |
| **Log Analysis Basics** | 4 formats with field-by-field breakdown (Syslog, Windows Event XML, CEF, JSON), 6-step log reading framework, common log sources with real examples, CLI toolkit (grep/awk/sort/uniq pipeline) |
| **Email & Phishing Analysis** | Attack stats, 5 phishing types, full email header walkthrough, SPF/DKIM/DMARC deep dive, URL red flags, attachment analysis steps, response checklist |
| **Alert Triage Framework** | 6-step decision framework with real examples, 5 common false positive scenarios, escalation criteria, ticket documentation template |
| **Network Fundamentals** | OSI model (SOC-focused), TCP handshake + SYN scan detection, DNS deep dive (tunneling, DGA, fast flux), HTTP anatomy, 5 network attack patterns |
| **OSINT for SOC** | WHOIS/Shodan/Censys/SecurityTrails with real queries, passive DNS, Google dorking (6 practical dorks), social media investigation |
| **Windows Live Response** | PowerShell commands: system info, users/auth (EventID 4624/4625), processes, network connections, persistence (registry/schtask/services), files & event logs |

---

## Round 4 — EDR & Ticketing Deep Expansion

**Goal:** Expand thin EDR and Ticketing sections to match SIEM depth.

### Before vs After

| Category | Before | After |
|----------|--------|-------|
| **EDR (Wazuh Agent)** | 1 page, 2 sections | **3 pages, 15 sections** |
| **DFIR-IRIS** | 1 page, 3 sections (1-2 sentences each) | **3 pages, 12 sections** |
| **TheHive** | 1 page, 3 sections (1-2 sentences each) | **3 pages, 12 sections** |

### EDR — Wazuh Agent (3 sub-modules, 953 lines)
- **Overview** — architecture, 6 agent modules (Logcollector, Syscheck, Rootcheck, Syscollector, SCA, Active Response), agent vs agentless comparison, detection capabilities with Wazuh rule IDs
- **Setup & Troubleshoot** — registration methods, 5 troubleshooting scenarios with diagnostic commands, agent log reading guide, upgrade procedures
- **Config & Response** — ossec.conf guide, centralized vs local config, adding log sources (Linux/Windows), active response + custom scripts, Sysmon integration, FIM advanced (realtime, whodata, registry)

### DFIR-IRIS (3 sub-modules, ~400 lines)
- **Overview** — features, IRIS vs TheHive comparison, architecture concepts
- **Setup** — Docker Compose install, initial config, user management & roles
- **Full Guide** — case walkthrough (4 steps), IOC management (types, TLP, bulk import), timeline building best practices, evidence & chain of custody, report generation, REST API basics (curl + Python examples)

### TheHive (3 sub-modules, ~400 lines)
- **Overview** — concepts (Alert/Case/Task/Observable), TheHive vs IRIS detailed comparison, Cortex explanation
- **Setup** — Docker install (TheHive + Elasticsearch + Cortex), Cortex analyzer setup, initial config (roles, templates)
- **Full Guide** — alert workflow (sources, triage, bulk ops), case management + templates, Cortex enrichment walkthrough, reporting & metrics (MTTD/MTTR dashboards), integrations (Wazuh→TheHive Python script, MISP, Slack)

---

## Article: AV vs EDR vs NDR vs XDR

Standalone article added to Fundamentals section:
- Analogy (CCTV/alarm metaphor)
- Comparison table (6 aspects: monitoring scope, detection method, response capability, visibility, products, pricing)
- Deep dive per technology (AV limitations, EDR capabilities with real alert example, NDR network perspective, XDR cross-layer correlation)
- "Kapan Pakai Yang Mana" decision matrix (6 scenarios from UMKM to enterprise)
- Evolution timeline (1990s AV → 2020+ XDR)
- Vendor marketing warnings

---

## Slide Deck — Pertemuan 2: SOC Tools Preparation

**Files:** `slides/index.html` + `slides/theme.css`  
**Tech:** Reveal.js 5.1.0 (CDN), custom JagoanSiber theme  
**Access:** [141.94.36.151/slides](http://141.94.36.151/slides/)

### 15 Slides
| # | Title | Type |
|---|-------|------|
| 01 | Title — SOC Tools Preparation | Cover |
| 02 | Agenda — Context 15min + Hands-on 90min | Overview |
| 03 | SOC Analyst Workflow — 7-step flow | Recap |
| 04 | Tools Ecosystem — 6 category cards | Overview |
| 05 | Workflow → Tools Mapping — table | Overview |
| 06 | VPS Shared Access — 3 service cards | Setup |
| 07 | Yang Diinstall Hari Ini — Install vs Register | Hands-on |
| 08 | Install: Wazuh Agent — step-by-step | Hands-on |
| 09 | Install: Wireshark — quick test | Hands-on |
| 10 | Register: CTI Platforms — VT + AbuseIPDB | Hands-on |
| 11 | Live Demo: Trigger Alert — nmap + dashboard | Hands-on |
| 12 | Practice Platforms — LetsDefend/THM/CD | Homework |
| 13 | Verification Checklist — 4-column checklist | Wrap-up |
| 14 | Preview Pertemuan 3 — phishing investigation | Next |
| 15 | Questions / Closing | Closing |

### Features
- Dark/light mode toggle
- Fullscreen button
- Arrow key / click navigation
- Hash routing (shareable slide links)
- JagoanSiber watermark
- Fade transitions
- Print-friendly

---

## VPS Deployment

**Server:** OVH VPS — 141.94.36.151 (Ubuntu 24.04, 4 CPU, 8GB RAM)

### Services Running
| Service | Port | Access |
|---------|------|--------|
| **Nginx** | 80 | Reverse proxy + static file server |
| **Wazuh** (Manager + Indexer + Dashboard) | 443, 1514, 1515, 514, 55000, 9200 | https://141.94.36.151 |
| **DFIR-IRIS** | 8443 | https://141.94.36.151:8443 |
| **Splunk** | 8001 (→8000), 8089 | http://141.94.36.151:8001 |
| **CTFd** | 8000 | http://141.94.36.151:8000 |
| **Cheatsheet** | 80 /cheatsheet/ | http://141.94.36.151/cheatsheet/ |
| **Slides** | 80 /slides/ | http://141.94.36.151/slides/ |

### Deployment Flow
```bash
# Local: make changes → push
git add -A && git commit -m "message" && git push

# VPS: pull latest
cd /var/www/soc-cheatsheet && git pull
```

### Docker Containers
- Wazuh: `single-node-wazuh.manager-1`, `single-node-wazuh.indexer-1`, `single-node-wazuh.dashboard-1`
- IRIS: `iriswebapp_app`, `iriswebapp_nginx`, `iriswebapp_worker`, `iriswebapp_db`, `iriswebapp_rabbitmq`
- Splunk: `splunk`
- CTFd: `ctfd`, `ctfd_db`, `ctfd_cache`
- TheHive: **stopped** (optional, can restart later)

---

## Final Statistics

| Metric | Count |
|--------|-------|
| Total tool/article pages | **36** |
| Content module files | **10** |
| Total content lines | **~4,700** |
| Total codebase lines (CSS + JS + HTML) | **~810** |
| Nav sections | **9** (Fundamentals, SIEM, EDR, Ticketing, CTI, Forensics, Practice, Reference, Playbooks) |
| Home page categories | **8** |
| Git commits | **3** |

### All 36 Pages by Category

**Fundamentals (7)**
- SOC Fundamentals
- Log Analysis Basics
- Network Fundamentals
- Email & Phishing Analysis
- Alert Triage Framework
- OSINT for SOC
- AV vs EDR vs NDR vs XDR

**SIEM (6)**
- Wazuh — Overview
- Wazuh — Getting Started
- Wazuh — Usage Guide
- Splunk — Overview
- Splunk — Getting Started
- Splunk — SPL Mastery

**EDR (3)**
- Wazuh Agent — Overview
- Wazuh Agent — Setup & Troubleshoot
- Wazuh Agent — Config & Response

**Ticketing (6)**
- DFIR-IRIS — Overview
- DFIR-IRIS — Setup
- DFIR-IRIS — Full Guide
- TheHive — Overview
- TheHive — Setup
- TheHive — Full Guide

**CTI (1)**
- CTI Platforms (9 tools: VT, AbuseIPDB, Any.run, Tria.ge, ThreatFox, Talos, X-Force, OTX, MalwareBazaar)

**Forensics (6)**
- Wireshark
- tcpdump
- Volatility 3
- Autopsy
- FTK Imager
- strings & hash

**Practice (1)**
- Blue Team Platforms (BTLO, THM, HTB, LetsDefend, CyberDefenders + comparison)

**Reference (3)**
- Windows Event IDs
- Ports & Protocols
- MITRE ATT&CK

**Playbooks (3)**
- IR Playbooks (Phishing, Malware, Brute Force)
- Linux Live Response
- Windows Live Response

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vanilla HTML + CSS + JavaScript (no framework) |
| Presentation | Reveal.js 5.1.0 (CDN) |
| Fonts | Plus Jakarta Sans + JetBrains Mono (Google Fonts) |
| Hosting | Nginx on OVH VPS (Ubuntu 24.04) |
| Version Control | Git + GitHub (mhrsq/soc-cheatsheet) |
| SOC Tools | Docker containers (Wazuh, IRIS, Splunk, CTFd) |
