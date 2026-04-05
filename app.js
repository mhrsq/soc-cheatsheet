// ═══════════════════════════════════════════════════════
// SOC Tools Guide — JagoanSiber
// app.js — Application Logic v2
// ═══════════════════════════════════════════════════════

let currentTool = null;
let currentTheme = localStorage.getItem('soc-theme') || 'dark';
let sidebarCollapsed = localStorage.getItem('soc-sidebar') !== 'expanded'; // collapsed by default
let searchIndex = [];
let searchActiveIdx = -1;
let scrollObserver = null;

// ─── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  applySidebarState();
  buildSidebar();
  buildSearchIndex();
  setupKeyboard();
  setupProgressBar();
  const hash = window.location.hash.slice(1);
  navigate(hash && TOOLS[hash] ? hash : 'home', true);
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (!hash || hash === 'home') navigate('home', true);
  else if (TOOLS[hash]) navigate(hash, true);
});

// ─── SIDEBAR STATE ──────────────────────────────────────
function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  localStorage.setItem('soc-sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
  applySidebarState();
}

function applySidebarState() {
  const sb = document.getElementById('sidebarLeft');
  if (!sb) return;
  sb.classList.toggle('collapsed', sidebarCollapsed);
  document.body.classList.toggle('sidebar-is-collapsed', sidebarCollapsed);
}

// ─── SIDEBAR BUILDER ────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  let html = '';
  NAV_SECTIONS.forEach(section => {
    html += `<div class="nav-section"><div class="nav-label">${section.label}</div>`;
    section.items.forEach(item => {
      if (item.children) {
        // Collapsible group (Wazuh, Splunk)
        html += `<div class="nav-group-header" id="nav-group-${item.id}" onclick="toggleNavGroup('${item.id}')">
          <div class="nav-dot" style="background:${item.color}"></div>
          <span class="nav-item-text">${item.name}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          <span class="nav-expand-icon">▶</span>
        </div>
        <div class="nav-sub-items" id="nav-sub-${item.id}">`;
        item.children.forEach(child => {
          html += `<div class="nav-sub-item" id="nav-${child.id}" onclick="navigate('${child.id}')">
            <span style="color:var(--text3)">·</span> <span class="nav-item-text">${child.name}</span>
          </div>`;
        });
        html += `</div>`;
      } else {
        html += `<div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
          <div class="nav-dot" style="background:${item.color}"></div>
          <span class="nav-item-text">${item.name}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </div>`;
      }
    });
    html += `</div>`;
  });
  nav.innerHTML = html;
}

function toggleNavGroup(groupId) {
  const header = document.getElementById('nav-group-' + groupId);
  const sub = document.getElementById('nav-sub-' + groupId);
  if (!header || !sub) return;
  header.classList.toggle('expanded');
  sub.classList.toggle('open');
}

// ─── HOME PAGE BUILDER ──────────────────────────────────
function buildHomePage() {
  let html = '';
  HOME_CATEGORIES.forEach(cat => {
    const cards = cat.tools.map(t =>
      `<div class="tool-card" onclick="navigate('${t.id}')">
        <div class="tc-top"><div class="tc-name">${t.name}</div>${t.hosted ? '<div class="tc-hosted">VPS</div>' : ''}</div>
        <div class="tc-desc">${t.desc}</div>
        <div class="tc-arrow">Baca guide →</div>
      </div>`
    ).join('');
    html += `<div class="cat-section"><div class="cat-header"><h2>${cat.name}</h2><div class="cat-line"></div></div><div class="tools-grid">${cards}</div></div>`;
  });
  return html;
}

// ─── NAVIGATION ─────────────────────────────────────────
function navigate(toolId, skipHash) {
  currentTool = toolId;
  if (!skipHash) window.location.hash = toolId === 'home' ? '' : toolId;

  // Clear active states
  document.querySelectorAll('.nav-item,.nav-home,.nav-sub-item,.nav-group-header').forEach(el => el.classList.remove('active','group-active'));

  // Set active
  const target = document.getElementById('nav-' + toolId);
  if (target) {
    target.classList.add('active');
    // If it's a sub-item, expand parent and mark header
    const tool = TOOLS[toolId];
    if (tool && tool.parent) {
      const header = document.getElementById('nav-group-' + tool.parent);
      const sub = document.getElementById('nav-sub-' + tool.parent);
      if (header) { header.classList.add('expanded', 'group-active'); }
      if (sub) sub.classList.add('open');
    }
  }
  if (toolId === 'home') document.getElementById('navHome').classList.add('active');

  const main = document.getElementById('main');
  const toc = document.getElementById('tocSidebar');
  const mainEl = document.querySelector('.main');

  if (toolId === 'home') {
    main.innerHTML = `<div class="page-content">${renderHomePage()}</div>`;
    toc.classList.remove('visible');
    mainEl.classList.remove('with-toc');
  } else {
    main.innerHTML = `<div class="page-content">${renderToolPage(toolId)}</div>`;
    toc.classList.add('visible');
    mainEl.classList.add('with-toc');
    renderTOC(TOOLS[toolId].sections);
    injectCopyButtons();
    setupScrollSpy(TOOLS[toolId].sections);
  }

  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── RENDER HOME ────────────────────────────────────────
function renderHomePage() {
  return `
    <div class="home-hero">
      <h1>SOC Tools &<br><span>Reference Guide</span></h1>
      <p>Panduan lengkap tools dan referensi SOC Analyst — dari install, cara pakai, sampai playbook investigasi.</p>
    </div>
    <div class="soc-workflow">
      <div class="soc-workflow-label">🔄 SOC Analyst Workflow — Incident Response Lifecycle</div>
      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-tooltip">Alert masuk dari SIEM (Wazuh/Splunk).<br>Bisa dari rule, threshold, atau anomaly.</div>
          <div class="wf-num">1</div><div class="wf-name">Detect</div><div class="wf-desc">SIEM alert masuk</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">L1 Analyst review alert.<br>Tentukan: False Positive atau True Positive?<br>Cek context, enrichment IOC.</div>
          <div class="wf-num">2</div><div class="wf-name">Triage</div><div class="wf-desc">FP atau TP?</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">Deep dive analysis oleh L2/L3.<br>Gunakan: Wireshark, Volatility, log analysis.<br>Tentukan scope dan impact.</div>
          <div class="wf-num">3</div><div class="wf-name">Investigate</div><div class="wf-desc">Deep analysis</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">Stop penyebaran threat.<br>Isolasi endpoint, block IP/domain,<br>disable compromised account.</div>
          <div class="wf-num">4</div><div class="wf-name">Contain</div><div class="wf-desc">Stop penyebaran</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">Hapus threat dari environment.<br>Remove malware, patch vulnerability,<br>clean persistence mechanisms.</div>
          <div class="wf-num">5</div><div class="wf-name">Eradicate</div><div class="wf-desc">Hapus threat</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">Kembalikan sistem ke normal.<br>Restore backup, verify clean state,<br>monitor untuk re-infection.</div>
          <div class="wf-num">6</div><div class="wf-name">Recover</div><div class="wf-desc">Back to normal</div>
        </div><div class="wf-arrow">→</div>
        <div class="wf-step">
          <div class="wf-tooltip">Dokumentasi di IRIS/TheHive.<br>Case report, IOC list, timeline,<br>lessons learned, update rules.</div>
          <div class="wf-num">7</div><div class="wf-name">Document</div><div class="wf-desc">Case report</div>
        </div>
      </div>
      <div class="wf-return">
        <div class="wf-return-arrow">
          <div class="wf-return-line"></div>
          ↩ Lessons learned → update detection rules → kembali ke Detect
          <div class="wf-return-line"></div>
        </div>
      </div>
    </div>
    ${buildHomePage()}`;
}

// ─── RENDER TOOL PAGE ───────────────────────────────────
function renderToolPage(toolId) {
  const tool = TOOLS[toolId];
  if (!tool) return '<p>Tool not found.</p>';
  const tagHtml = tool.tags.map((t, i) => `<span class="tag ${t}">${tool.tagLabels[i]}</span>`).join('');

  // Breadcrumb with parent support
  let breadcrumb = `<span class="bc-link" onclick="navigate('home')">Home</span><span class="bc-sep">/</span>`;
  if (tool.parent) {
    const parentName = tool.parent.charAt(0).toUpperCase() + tool.parent.slice(1);
    breadcrumb += `<span class="bc-link" onclick="navigate('${tool.parent}-overview')">${parentName}</span><span class="bc-sep">/</span>`;
  }
  breadcrumb += `<span>${tool.name.replace(/^(Wazuh|Splunk) — /, '')}</span>`;

  const sections = tool.sections.map((s, i) => `
    <div class="doc-section" id="sec-${s.id}">
      <h2><div class="s-num">${String(i+1).padStart(2,'0')}</div>${s.title}</h2>
      ${s.html}
    </div>
    ${i < tool.sections.length - 1 ? '<div class="doc-divider"></div>' : ''}
  `).join('');

  return `<div class="breadcrumb">${breadcrumb}</div>
    <div class="tool-header">
      <div class="tool-header-top"><h1>${tool.name}</h1><div class="tool-tags">${tagHtml}</div></div>
      <p class="tool-subtitle">${tool.subtitle}</p>
    </div>${sections}`;
}

// ─── TOC ────────────────────────────────────────────────
function renderTOC(sections) {
  document.getElementById('tocList').innerHTML = sections.map(s =>
    `<a class="toc-item" onclick="scrollToSection('sec-${s.id}')">${s.title}</a>`
  ).join('');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupScrollSpy(sections) {
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('sec-', '');
        document.querySelectorAll('.toc-item').forEach(t => t.classList.remove('toc-active'));
        const el = document.querySelector(`.toc-item[onclick="scrollToSection('sec-${id}')"]`);
        if (el) el.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });
  sections.forEach(s => { const el = document.getElementById('sec-' + s.id); if (el) scrollObserver.observe(el); });
}

// ─── COPY BUTTONS ───────────────────────────────────────
function injectCopyButtons() {
  document.querySelectorAll('.code-block').forEach(block => {
    const label = block.querySelector('.code-label');
    if (!label || label.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '📋 Copy';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const code = block.querySelector('pre code') || block.querySelector('pre');
      if (!code) return;
      navigator.clipboard.writeText(code.textContent).then(() => {
        btn.innerHTML = '✓ Copied!'; btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
      }).catch(() => {
        const ta = document.createElement('textarea'); ta.value = code.textContent;
        ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        btn.innerHTML = '✓ Copied!'; btn.classList.add('copied');
        setTimeout(() => { btn.innerHTML = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
      });
    });
    label.appendChild(btn);
  });
}

// ─── OS TAB SWITCHING ───────────────────────────────────
function switchTab(btn) {
  const tabs = btn.closest('.os-tabs');
  const tabId = btn.dataset.tab;
  tabs.querySelectorAll('.os-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  tabs.querySelectorAll('.os-tab-panel').forEach(p => p.classList.toggle('active', p.dataset.tab === tabId));
  // Re-inject copy buttons for newly visible panels
  injectCopyButtons();
}

// ─── SEARCH ─────────────────────────────────────────────
function buildSearchIndex() {
  searchIndex = [];
  Object.keys(TOOLS).forEach(toolId => {
    const tool = TOOLS[toolId];
    searchIndex.push({ toolId, toolName: tool.name, sectionId: null, sectionTitle: tool.name, text: tool.name + ' ' + tool.subtitle, type: 'tool' });
    tool.sections.forEach(section => {
      const stripped = section.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      searchIndex.push({ toolId, toolName: tool.name, sectionId: section.id, sectionTitle: section.title, text: section.title + ' ' + stripped, type: 'section' });
    });
  });
}

function openSearch() {
  document.getElementById('searchOverlay').classList.add('active');
  const input = document.getElementById('searchInput');
  input.value = ''; input.focus(); searchActiveIdx = -1;
  document.getElementById('searchResults').innerHTML = '<div class="search-empty">Ketik untuk mulai mencari...</div>';
}

function closeSearch() { document.getElementById('searchOverlay').classList.remove('active'); searchActiveIdx = -1; }

function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  const div = document.getElementById('searchResults');
  if (!query) { div.innerHTML = '<div class="search-empty">Ketik untuk mulai mencari...</div>'; searchActiveIdx = -1; return; }
  const terms = query.split(/\s+/);
  const results = searchIndex.map(item => {
    const text = item.text.toLowerCase();
    let score = 0, ok = true;
    terms.forEach(t => { if (text.includes(t)) { score++; if (item.sectionTitle.toLowerCase().includes(t)) score += 3; if (item.toolName.toLowerCase().includes(t)) score += 2; } else ok = false; });
    return { ...item, score, ok };
  }).filter(r => r.ok && r.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);

  if (!results.length) { div.innerHTML = '<div class="search-empty">Tidak ada hasil</div>'; searchActiveIdx = -1; return; }
  div.innerHTML = results.map((r, i) => {
    let snip = '';
    const idx = r.text.toLowerCase().indexOf(terms[0]);
    if (idx >= 0) {
      const s = Math.max(0, idx - 40), e = Math.min(r.text.length, idx + 80);
      snip = (s > 0 ? '...' : '') + r.text.slice(s, e) + (e < r.text.length ? '...' : '');
      terms.forEach(t => { snip = snip.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark>$1</mark>'); });
    }
    return `<div class="search-result ${i===searchActiveIdx?'sr-active':''}" onclick="searchNavigate('${r.toolId}','${r.sectionId||''}')"><span class="sr-tool">${r.toolName}</span><span class="sr-title">${r.sectionTitle}</span>${snip?`<span class="sr-snippet">${snip}</span>`:''}</div>`;
  }).join('');
}

function handleSearchKey(e) {
  const res = document.querySelectorAll('.search-result');
  if (!res.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); searchActiveIdx = Math.min(searchActiveIdx + 1, res.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); searchActiveIdx = Math.max(searchActiveIdx - 1, 0); }
  else if (e.key === 'Enter' && searchActiveIdx >= 0) { e.preventDefault(); res[searchActiveIdx].click(); return; }
  else return;
  res.forEach((r, i) => r.classList.toggle('sr-active', i === searchActiveIdx));
  if (res[searchActiveIdx]) res[searchActiveIdx].scrollIntoView({ block: 'nearest' });
}

function searchNavigate(toolId, sectionId) {
  closeSearch(); navigate(toolId);
  if (sectionId) setTimeout(() => scrollToSection('sec-' + sectionId), 100);
}

// ─── MOBILE ─────────────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById('sidebarLeft').classList.toggle('mobile-open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeMobileMenu() {
  document.getElementById('sidebarLeft').classList.remove('mobile-open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ─── THEME ──────────────────────────────────────────────
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('soc-theme', currentTheme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// ─── KEYBOARD ───────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape') {
      if (document.getElementById('searchOverlay').classList.contains('active')) closeSearch();
      else closeMobileMenu();
    }
  });
}

// ─── PROGRESS BAR ───────────────────────────────────────
function setupProgressBar() {
  const bar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    if (currentTool === 'home') { bar.style.width = '0%'; return; }
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? Math.min(window.scrollY / h * 100, 100) + '%' : '0%';
  }, { passive: true });
}
