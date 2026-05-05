/**
 * lineage.js
 * 法脈傳承頁面的邏輯：
 *  - Tab 切換（直系傳承 / 曹洞宗全圖 / 通法寺法脈 / 壽昌法派 / 祖師傳記）
 *  - 祖師傳記卡片渲染
 *  - 生平彈窗（openModal / closeBioModal）
 * 
 * 依賴：data.js（monkDatabase）、main.js（displayBioModal）
 */

// ─── Tab 清單 ─────────────────────────────────────────────────────────────────
const LINEAGE_TABS = ['direct', 'caodong', 'full', 'shouchang', 'biographies'];

/**
 * 切換法脈圖 Tab
 * @param {string} type - 'direct' | 'caodong' | 'full' | 'shouchang' | 'biographies'
 */
function switchLineage(type) {
    LINEAGE_TABS.forEach(t => {
        document.getElementById('btn-'     + t)?.classList.remove('active');
        document.getElementById('mermaid-' + t)?.classList.remove('active');
    });
    document.getElementById('btn-'     + type)?.classList.add('active');
    document.getElementById('mermaid-' + type)?.classList.add('active');

    if (type === 'biographies') {
        renderBiographiesGrid();
    }
}

// ─── 祖師傳記卡片 ──────────────────────────────────────────────────────────────
function renderBiographiesGrid() {
    const grid = document.getElementById('biographiesGrid');
    if (!grid || grid.children.length > 0) return; // 已生成過就不再生成

    if (typeof monkDatabase === 'undefined') {
        console.warn('lineage.js: monkDatabase 未定義，請確認 data.js 已載入');
        return;
    }

    const monksWithBio = Object.entries(monkDatabase)
        .filter(([, data]) => data.full || data.image);

    monksWithBio.forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = 'bio-card';

        const imgHtml   = data.image
            ? `<img src="${data.image}" alt="${name}" class="bio-card-img">`
            : '';
        const shortText = data.short && data.short.length > 80
            ? data.short.substring(0, 77) + '…'
            : (data.short || '');

        card.innerHTML = `
            ${imgHtml}
            <div class="bio-card-content">
                <h3 class="bio-card-name">${name}</h3>
                <p class="bio-card-short">${shortText}</p>
                <button class="bio-card-btn" onclick="openModal('${name}')">查看完整傳記</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ─── 彈窗：開啟 / 關閉 ────────────────────────────────────────────────────────
function openModal(name) {
    // displayBioModal 定義在 main.js
    if (typeof displayBioModal === 'function') {
        displayBioModal(name);
    } else {
        console.warn('lineage.js: displayBioModal 未定義');
    }
}

function closeBioModal() {
    const modal = document.getElementById('bioModal');
    if (modal) modal.style.display = 'none';
}

// ─── 公開 API ─────────────────────────────────────────────────────────────────
window.Lineage = { switchLineage, renderBiographiesGrid, openModal, closeBioModal };
