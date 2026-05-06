/**
 * flip-engine.js
 * 翻頁書核心引擎
 * 負責：3D翻頁動畫、桌機/平板/手機三種模式初始化、手勢偵測
 */

// ─── 全域狀態 ────────────────────────────────────────────────────────────────
let leaves      = [];   // 在 initBook 時才初始化，確保 DOM 已就緒
let currentLeaf = 0;
let isFlipping  = false;

// ─── 裝置偵測（與 main.js 共用）────────────────────────────────────────────
const isTouchDevice  = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const getDevicePref  = () => document.documentElement.getAttribute('data-device');
const isMobile  = () => getDevicePref() === 'mobile'  || (getDevicePref() === null && window.innerWidth <= 767);
const isTablet  = () => getDevicePref() === 'tablet'  || (getDevicePref() === null && window.innerWidth > 767 && window.innerWidth <= 1100 && isTouchDevice());
const isDesktop = () => getDevicePref() === 'desktop' || (getDevicePref() === null && window.innerWidth > 767 && !(window.innerWidth <= 1100 && isTouchDevice()));

function getDeviceType() {
    const p = getDevicePref();
    if (p) return p;
    if (window.innerWidth <= 767) return 'mobile';
    if (window.innerWidth <= 1100 && isTouchDevice()) return 'tablet';
    return 'desktop';
}

// ─── Nav 對應表：leaf index → nav button index ────────────────────────────
// nav 按鈕順序：封面(0) 簡介(1) 法脈(2) 文物(3) 執事(4) 活動(5) 聯絡(6)
// leaf 順序：   0封面  1扉頁  2簡介  3法脈  4文物  5執事  6活動  7聯絡  8結尾
const LEAF_TO_NAV = { 0: 0, 1: -1, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: -1 };

function updateNavActive(leafIndex) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => b.classList.remove('active-nav'));
    const navIdx = LEAF_TO_NAV[leafIndex];
    if (navIdx >= 0 && navBtns[navIdx]) {
        navBtns[navIdx].classList.add('active-nav');
    }
}

// ─── 主翻頁函數 ───────────────────────────────────────────────────────────────
function flipToPage(targetLeafIndex) {
    // leaves 若未初始化，先初始化後再執行
    if (leaves.length === 0) {
        initBook();
        // initBook 後延遲執行，確保狀態已就緒
        setTimeout(function() { flipToPage(targetLeafIndex); }, 50);
        return;
    }
    if (isFlipping) return;
    if (targetLeafIndex === currentLeaf) return;
    if (targetLeafIndex < 0 || targetLeafIndex >= leaves.length) return;

    isFlipping = true;
    updateNavActive(targetLeafIndex);

    if (isMobile()) {
        _flipMobile(targetLeafIndex);
    } else {
        _flipDesktop(targetLeafIndex);
    }
}

function _flipMobile(targetIdx) {
    const outLeaf = leaves[currentLeaf];
    const inLeaf  = leaves[targetIdx];

    inLeaf.style.transition = 'none';
    inLeaf.style.opacity    = '0';
    inLeaf.classList.remove('mobile-active', 'mobile-prev');
    inLeaf.style.display = 'block';

    requestAnimationFrame(() => requestAnimationFrame(() => {
        inLeaf.style.transition  = 'opacity 0.4s ease';
        inLeaf.style.opacity     = '1';
        inLeaf.classList.add('mobile-active');
        outLeaf.style.transition = 'opacity 0.4s ease';
        outLeaf.style.opacity    = '0';
        outLeaf.classList.remove('mobile-active');
        outLeaf.classList.add('mobile-prev');
    }));

    currentLeaf = targetIdx;
    _updateMobilePageInfo();
    setTimeout(() => { isFlipping = false; }, 450);
}

function _flipDesktop(targetIdx) {
    const isForward = targetIdx > currentLeaf;
    let delay = 0;
    const steps = Math.abs(targetIdx - currentLeaf);

    if (isForward) {
        for (let i = currentLeaf; i < targetIdx; i++) {
            // 顯示即將翻到的 leaf
            if (leaves[i + 1]) leaves[i + 1].style.visibility = 'visible';
            setTimeout(() => {
                leaves[i].classList.add('flipping', 'flipped');
                setTimeout(() => {
                    leaves[i].style.zIndex = i + 1;
                    leaves[i].classList.remove('flipping');
                }, 600);
            }, delay);
            delay += 150;
        }
    } else {
        for (let i = currentLeaf - 1; i >= targetIdx; i--) {
            leaves[i].style.visibility = 'visible';
            setTimeout(() => {
                leaves[i].classList.add('flipping');
                leaves[i].classList.remove('flipped');
                setTimeout(() => {
                    leaves[i].style.zIndex = leaves.length - i;
                    leaves[i].classList.remove('flipping');
                }, 600);
            }, delay);
            delay += 150;
        }
    }

    currentLeaf = targetIdx;
    setTimeout(() => {
        isFlipping = false;
        if (isTablet()) _updateTabletArrows();
    }, steps * 150 + 400);
}

function nextPage() { flipToPage(currentLeaf + 1); }
function prevPage() { flipToPage(currentLeaf - 1); }

// ─── 桌機初始化 ───────────────────────────────────────────────────────────────
function initDesktop() {
    leaves.forEach((leaf, index) => {
        leaf.style.zIndex = leaves.length - index;
        leaf.style.transform = '';
        leaf.classList.remove('mobile-active', 'mobile-prev');

        // 初始只顯示 leaf-0
        leaf.style.visibility = index === 0 ? 'visible' : 'hidden';
    });

    // 建立透明點擊熱區（覆蓋在書本左右兩側，不被 iframe 攔截）
    _createClickZones();

    // 移除手機UI
    ['mobileNavBar','tabletArrowLeft','tabletArrowRight','swipeHintBar']
        .forEach(id => document.getElementById(id)?.remove());
}

function _createClickZones() {
    const book = document.getElementById('bookFlip');
    if (!book || book.querySelector('.click-zone-left')) return;

    // 左側熱區（上一頁）
    const zoneL = document.createElement('div');
    zoneL.className = 'click-zone-left';
    zoneL.style.cssText = [
        'position:absolute', 'top:0', 'left:0',
        'width:15%', 'height:100%',
        'z-index:9999', 'cursor:pointer',
        'background:transparent',
    ].join(';');
    zoneL.addEventListener('click', function(e) {
        e.stopPropagation();
        prevPage();
    });

    // 右側熱區（下一頁）
    const zoneR = document.createElement('div');
    zoneR.className = 'click-zone-right';
    zoneR.style.cssText = [
        'position:absolute', 'top:0', 'right:0',
        'width:15%', 'height:100%',
        'z-index:9999', 'cursor:pointer',
        'background:transparent',
    ].join(';');
    zoneR.addEventListener('click', function(e) {
        e.stopPropagation();
        nextPage();
    });

    book.appendChild(zoneL);
    book.appendChild(zoneR);
}

// ─── 平板初始化 ───────────────────────────────────────────────────────────────
function initTablet() {
    const book = document.getElementById('bookFlip');
    if (!book) return;

    if (!document.getElementById('tabletArrowLeft')) {
        const left = Object.assign(document.createElement('div'), {
            className: 'tablet-arrow tablet-arrow-left',
            id: 'tabletArrowLeft',
            innerHTML: '&#8592;',
            onclick: prevPage
        });
        const right = Object.assign(document.createElement('div'), {
            className: 'tablet-arrow tablet-arrow-right',
            id: 'tabletArrowRight',
            innerHTML: '&#8594;',
            onclick: nextPage
        });
        book.appendChild(left);
        book.appendChild(right);
    }
    _updateTabletArrows();
}

function _updateTabletArrows() {
    document.getElementById('tabletArrowLeft')?.classList.toggle('disabled', currentLeaf === 0);
    document.getElementById('tabletArrowRight')?.classList.toggle('disabled', currentLeaf === leaves.length - 1);
}

// ─── 手機初始化 ───────────────────────────────────────────────────────────────
function initMobile() {
    leaves.forEach(leaf => {
        leaf.classList.remove('flipped', 'flipping', 'mobile-active', 'mobile-prev');
        leaf.style.cssText = '';
    });
    if (leaves[0]) leaves[0].classList.add('mobile-active');
    _updateMobilePageInfo();
}

function _updateMobilePageInfo() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    let info = nav.querySelector('.page-info');
    if (!info) {
        info = Object.assign(document.createElement('span'), {
            className: 'page-info'
        });
        info.style.cssText = 'margin-left:auto;color:rgba(255,252,245,0.8);font-size:0.85rem;';
        nav.appendChild(info);
    }
    info.textContent = `${currentLeaf + 1} / ${leaves.length}`;
}

// ─── 手勢滑動（平板 + 手機共用）────────────────────────────────────────────
(function initSwipe() {
    let sx = 0, sy = 0;
    const vp = document.getElementById('viewport');
    if (!vp) return;
    vp.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    vp.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? nextPage() : prevPage();
        }
    }, { passive: true });
})();

// ─── 書本入口 ─────────────────────────────────────────────────────────────────
function initBook() {
    // 每次初始化都重新取得，確保 DOM 已就緒
    leaves = Array.from(document.querySelectorAll('.leaf'));

    // 清除錯誤的 localStorage 偏好
    const saved = localStorage.getItem('devicePreference');
    if ((saved === 'mobile' || saved === 'tablet') && window.innerWidth > 1100) {
        localStorage.removeItem('devicePreference');
        document.documentElement.removeAttribute('data-device');
    }

    if (isMobile()) {
        initMobile();
    } else {
        initDesktop();
        if (isTablet()) initTablet();
    }
    updateNavActive(currentLeaf);
}

// resize 重新初始化
window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(() => {
        currentLeaf = 0;
        isFlipping  = false;
        initBook();
    }, 300);
});
