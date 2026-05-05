/**
 * book-engine.js
 * 專責管理翻頁書的尺寸、佈局與封面初始化
 * 獨立於 main.js，避免衝突
 */

(function () {
    'use strict';

    // ─── 設定 ────────────────────────────────────────────────────────────────
    const BOOK_MAX_W   = 1100;   // px，桌機最大書寬
    const BOOK_RATIO   = 0.84;   // 書高 / 視窗高
    const MOBILE_BP    = 768;    // px，手機斷點
    const TABLET_BP    = 1100;   // px，平板斷點（觸控）

    // ─── 取得元素 ─────────────────────────────────────────────────────────────
    function getBookFlip()    { return document.getElementById('bookFlip'); }
    function getContainer()   { return document.querySelector('.book-container'); }
    function getLeaf(n)       { return document.getElementById('leaf-' + n); }

    // ─── 計算書本尺寸 ─────────────────────────────────────────────────────────
    function calcBookSize() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isMob = vw <= MOBILE_BP;
        if (isMob) {
            return { w: vw, h: Math.round(vh * 0.88), mode: 'mobile' };
        }
        const isTab = vw <= TABLET_BP && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        if (isTab) {
            return { w: Math.round(vw * 0.94), h: Math.round(vh * 0.82), mode: 'tablet' };
        }
        const w = Math.min(BOOK_MAX_W, vw - 80);
        return { w, h: Math.round(vh * BOOK_RATIO), mode: 'desktop' };
    }

    // ─── 套用書本尺寸 ─────────────────────────────────────────────────────────
    function applyBookSize() {
        const flip = getBookFlip();
        const cont = getContainer();
        if (!flip || !cont) return;

        const { w, h, mode } = calcBookSize();

        // 書本容器：水平置中
        cont.style.display         = 'flex';
        cont.style.justifyContent  = 'center';
        cont.style.alignItems      = 'center';
        cont.style.width           = '100%';
        cont.style.height          = h + 'px';

        // bookFlip：固定尺寸
        flip.style.position   = 'relative';
        flip.style.width      = w + 'px';
        flip.style.height     = h + 'px';
        flip.style.flexShrink = '0';

        // 把尺寸同步到 CSS 變數，讓其他 CSS 也能用
        document.documentElement.style.setProperty('--book-width',  w + 'px');
        document.documentElement.style.setProperty('--book-height', h + 'px');

        return { w, h, mode };
    }

    // ─── 封面初始化（leaf-0）────────────────────────────────────────────────
    function initCover(bookH) {
        // 封面 panel 直接在 leaf-0 層級，不受 backface-visibility 影響
        const panel = document.getElementById('cover-panel');
        if (!panel) return;
        panel.style.height = bookH + 'px';
    }

    // ─── 視窗 resize 自動更新 ─────────────────────────────────────────────────
    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            const result = applyBookSize();
            if (result) initCover(result.h);
        }, 200);
    });

    // ─── DOM 載入完成後執行 ────────────────────────────────────────────────────
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    onReady(function () {
        const result = applyBookSize();
        if (result) {
            // 等 main.js 的 initBook() 執行完再修封面
            // （initBook 在 DOMContentLoaded 裡呼叫，與這個 handler 同批次）
            setTimeout(function () { initCover(result.h); }, 50);
        }
    });

    // 公開 API（方便 main.js 或 console 呼叫）
    window.BookEngine = { applyBookSize, initCover, calcBookSize };

})();

    // ─── 封面覆蓋層顯示/隱藏 ─────────────────────────────────────────────────
    function updateCoverOverlay(currentLeaf) {
        const overlay = document.getElementById('cover-overlay');
        if (!overlay) return;
        overlay.style.display = currentLeaf === 0 ? 'flex' : 'none';
    }

    // 監聽 flipToPage 呼叫（透過自定義事件）
    document.addEventListener('pageChanged', function(e) {
        updateCoverOverlay(e.detail.leaf);
    });

    // 初始顯示
    onReady(function() {
        setTimeout(function() { updateCoverOverlay(0); }, 100);
    });

    window.BookEngine.updateCoverOverlay = updateCoverOverlay;