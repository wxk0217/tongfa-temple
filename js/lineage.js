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
 * 切換法脈圖 Tab（iframe 版本）
 * @param {string} type - 'direct' | 'caodong' | 'full' | 'shouchang' | 'biographies'
 */
function switchLineage(type) {
    // 切換按鈕 active 狀態
    LINEAGE_TABS.forEach(t => {
        document.getElementById('btn-' + t)?.classList.remove('active');
    });
    document.getElementById('btn-' + type)?.classList.add('active');

    // 切換 iframe src
    const frame = document.getElementById('lineage-frame');
    if (frame) {
        frame.src = `assets/lineage/${type}.html`;
    }
}

// ─── 公開 API ─────────────────────────────────────────────────────────────────
window.Lineage = { switchLineage };
