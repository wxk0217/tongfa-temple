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
    // 公開 API
    window.BookEngine = { applyBookSize, calcBookSize };

})();
    // 封面改為 iframe，不再需要 overlay 控制