//**
 * bio-modal.js
 * 祖師傳記彈窗 + Tooltip 懸浮卡片
 * 依賴：data.js（monkDatabase）
 * 讀取優先順序：docs/monk/{name}.md → data.js full → data.js short
 */

// ─── MD 路徑解析 ─────────────────────────────────────────────────────────────
// monkDatabase 的 key 可能含空格，統一移除後對應到 docs/monk/{name}.md
function _mdPath(name) {
    return `docs/monk/${name.replace(/\s/g, '')}.md`;
}

function _getMonkData(name) {
    if (typeof monkDatabase === 'undefined') return null;
    if (monkDatabase[name]) return monkDatabase[name];
    // 容錯：移除空格後比對
    const clean = name.replace(/\s/g, '');
    for (const key of Object.keys(monkDatabase)) {
        if (key.replace(/\s/g, '') === clean) return monkDatabase[key];
    }
    return null;
}

// ─── 開啟傳記彈窗 ─────────────────────────────────────────────────────────────
function openModal(name) {
    const cleanName = name.replace(/<[^>]*>/g, '').trim();
    const data = _getMonkData(cleanName);
    if (!data) return;

    // 優先讀 docs/monk/*.md
    fetch(_mdPath(cleanName))
        .then(r => { if (!r.ok) throw new Error('no md'); return r.text(); })
        .then(md  => _showModal(cleanName, md, data.image))
        .catch(()  => {
            // fallback：data.js 的 full 欄位
            if (data.full) _showModal(cleanName, data.full, data.image);
        });
}

function _showModal(name, content, imgPath) {
    const modal = document.getElementById('bioModal');
    if (!modal) return;

    // 重建彈窗 HTML（若 DOM 結構不同則動態填充）
    let nameEl  = document.getElementById('bioName');
    let storyEl = document.getElementById('bioStory');
    let imgEl   = document.getElementById('bioPortrait');

    if (!nameEl) {
        // 舊版 modal 結構不存在，動態建立
        modal.innerHTML = `
            <div class="bio-modal-content">
                <button class="bio-modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                <div style="display:flex;gap:20px;align-items:flex-start;">
                    <img id="bioPortrait" style="width:100px;height:120px;object-fit:cover;border-radius:4px;flex-shrink:0;">
                    <div>
                        <h2 id="bioName" style="margin:0 0 12px;font-size:1.4rem;color:var(--primary-color)"></h2>
                        <p id="bioStory" style="white-space:pre-wrap;line-height:1.9;font-size:0.95rem;"></p>
                    </div>
                </div>
            </div>`;
        nameEl  = document.getElementById('bioName');
        storyEl = document.getElementById('bioStory');
        imgEl   = document.getElementById('bioPortrait');
    }

    nameEl.textContent  = name;
    storyEl.textContent = content;

    if (imgPath) {
        imgEl.src = imgPath;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    modal.classList.add('show');
    modal.style.display = 'flex';

    // 隱藏 tooltip
    const tip = document.getElementById('hoverTooltip');
    if (tip) tip.classList.remove('show');
}

function closeModal() {
    const modal = document.getElementById('bioModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// 相容舊版
function closeBioModal() { closeModal(); }

// ─── Tooltip 懸浮卡片（桌機 hover）──────────────────────────────────────────
(function initTooltip() {
    const tip = document.getElementById('hoverTooltip');
    if (!tip) return;

    document.addEventListener('mouseover', e => {
        const node = e.target.closest('.node');
        if (!node) return;
        if (document.getElementById('bioModal')?.classList.contains('show')) return;

        const name = node.querySelector('.nodeLabel')?.textContent?.replace(/<[^>]*>/g, '').trim();
        if (!name) return;
        const data = _getMonkData(name);

        let short = data?.short || '資料整理中...';
        if (short.length > 60) short = short.slice(0, 57) + '…';

        const hint  = data?.full ? '<span class="tooltip-hint">雙擊查看完整傳記</span>' : '';
        const img   = data?.image
            ? `<img class="tooltip-portrait" src="${data.image}" alt="${name}" onerror="this.style.display='none'">`
            : '';

        tip.innerHTML = `<div class="tooltip-inner">${img}<div class="tooltip-text">
            <span class="tooltip-name">${name}</span>
            <span class="tooltip-short">${short}</span>
            ${hint}
        </div></div>`;
        tip.classList.add('show');
    });

    document.addEventListener('mousemove', e => {
        if (!tip.classList.contains('show')) return;
        let x = e.pageX + 18, y = e.pageY + 18;
        if (x + 320 > window.innerWidth) x = e.pageX - 325;
        tip.style.left = x + 'px';
        tip.style.top  = y + 'px';
    });

    document.addEventListener('mouseout', e => {
        if (e.target.closest('.node')) tip.classList.remove('show');
    });

    // 雙擊開彈窗（桌機）
    document.addEventListener('dblclick', e => {
        const node = e.target.closest('.node');
        if (!node) return;
        const name = node.querySelector('.nodeLabel')?.textContent?.trim();
        if (name) openModal(name);
    });
})();

// ─── 觸控裝置底部滑入資訊欄 ──────────────────────────────────────────────────
(function initMonkSheet() {
    const sheet = Object.assign(document.createElement('div'), {
        className: 'monk-info-sheet',
        id: 'monkInfoSheet',
        innerHTML: `
            <img id="sheetImg" src="" alt="" style="display:none">
            <div class="monk-sheet-text">
                <span class="monk-sheet-name" id="sheetName"></span>
                <span class="monk-sheet-short" id="sheetShort"></span>
                <span class="monk-sheet-hint" id="sheetHint"></span>
            </div>
            <button class="monk-sheet-close" onclick="closeMonkSheet()">✕</button>`
    });
    document.body.appendChild(sheet);

    let tapTimer = null;
    document.addEventListener('touchend', e => {
        const isTouchDev = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if (!isTouchDev) return;
        const node = e.target.closest('.node');
        if (!node) return;
        e.preventDefault();
        const name = node.querySelector('.nodeLabel')?.textContent?.trim();
        if (!name) return;

        if (tapTimer) {
            clearTimeout(tapTimer);
            tapTimer = null;
            openModal(name);
        } else {
            tapTimer = setTimeout(() => {
                tapTimer = null;
                _showMonkSheet(name);
            }, 280);
        }
    }, { passive: false });
})();

function _showMonkSheet(name) {
    const data = _getMonkData(name);
    document.getElementById('sheetName').textContent  = name;
    document.getElementById('sheetShort').textContent = data?.short || '資料整理中...';
    document.getElementById('sheetHint').textContent  = data?.full ? '點兩下查看完整傳記' : '';
    const img = document.getElementById('sheetImg');
    if (data?.image) { img.src = data.image; img.style.display = 'block'; }
    else img.style.display = 'none';
    document.getElementById('monkInfoSheet')?.classList.add('show');
}

function closeMonkSheet() {
    document.getElementById('monkInfoSheet')?.classList.remove('show');
}

// ─── 接收來自 lineage iframe 的訊息 ──────────────────────────────────────────
window.addEventListener('message', function(e) {
    const d = e.data;
    if (!d || !d.action) return;

    if (d.action === 'openModal') {
        openModal(d.name);
    }
    else if (d.action === 'showTooltip') {
        const data = _getMonkData(d.name);
        if (!data) return;
        const tip = document.getElementById('hoverTooltip');
        if (!tip) return;
        let short = data.short || '資料整理中...';
        if (short.length > 60) short = short.slice(0, 57) + '…';
        const hint = data.full ? '<span class="tooltip-hint">雙擊查看完整傳記</span>' : '';
        const img  = data.image
            ? `<img class="tooltip-portrait" src="${data.image}" alt="${d.name}" onerror="this.style.display='none'">`
            : '';
        tip.innerHTML = `<div class="tooltip-inner">${img}<div class="tooltip-text">
            <span class="tooltip-name">${d.name}</span>
            <span class="tooltip-short">${short}</span>
            ${hint}
        </div></div>`;
        tip.classList.add('show');
        // 定位到法脈圖 iframe 中央上方
        const frame = document.getElementById('lineage-frame');
        if (frame) {
            const r = frame.getBoundingClientRect();
            tip.style.left = (r.left + r.width / 2 - 150) + 'px';
            tip.style.top  = (r.top + 40) + 'px';
        }
    }
    else if (d.action === 'hideTooltip') {
        document.getElementById('hoverTooltip')?.classList.remove('show');
    }
});