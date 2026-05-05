//**
 * main.js — 初始化進入點
 * 只負責：啟動書本、音效 toast、說明按鈕
 * 翻頁邏輯 → flip-engine.js
 * 傳記彈窗 → bio-modal.js
 * 法脈切換 → lineage.js
 * 書本尺寸 → book-engine.js
 * 裝置切換 → device-switcher.js
 */

// Mermaid 初始化（法脈圖用）
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'loose',
        maxNodes: 10000,
        flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'linear' },
        theme: 'base',
        themeVariables: {
            primaryColor: '#fffcf5',
            primaryTextColor: '#4a3325',
            lineColor: '#c6a059',
            fontFamily: '"Noto Serif TC", serif'
        }
    });
}

// 音效（暫停，待日後接外部連結）
function toggleZenAudio(e) {
    if (e) e.stopPropagation();
    _showToast('音樂功能即將上線');
}

function _showToast(msg) {
    let t = document.getElementById('audioToast');
    if (!t) {
        t = Object.assign(document.createElement('div'), { id: 'audioToast' });
        t.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);
            background:rgba(93,64,55,0.88);color:#fffcf5;padding:8px 20px;
            border-radius:20px;font-size:0.8rem;letter-spacing:2px;z-index:9999;
            pointer-events:none;opacity:0;transition:opacity 0.3s;`;
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

// 說明按鈕（右下角）
function _injectHelpBtn() {
    if (document.getElementById('helpBtn')) return;
    const btn = Object.assign(document.createElement('button'), {
        id: 'helpBtn',
        className: 'help-btn',
        title: '操作說明',
        innerHTML: '？'
    });
    btn.onclick = () => _showToast('點擊書本兩側邊緣可翻頁，上方導覽列可跳轉章節');
    document.body.appendChild(btn);
}

// ─── 啟動 ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // 書本尺寸
    if (window.BookEngine) window.BookEngine.applyBookSize();

    // 翻頁引擎
    initBook();

    // 說明按鈕
    _injectHelpBtn();
});