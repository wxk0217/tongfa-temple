/**
 * flip-engine.js — 翻頁書核心引擎
 *
 * 修正重點：
 *  1. iframe pointer-events:none（fix.css），改用透明熱區 div 攔截點擊
 *  2. updateNavActive 支援全部 23 個 leaf，依 data-nav 屬性比對
 *  3. 翻頁邏輯維持原版 _flipDesktop / _flipMobile 架構
 */

// ─── 狀態 ─────────────────────────────────────────────────────────────────────
var leaves      = [];
var currentLeaf = 0;
var isFlipping  = false;

// ─── 裝置判斷 ─────────────────────────────────────────────────────────────────
function isTouchDevice()  { return ('ontouchstart' in window) || navigator.maxTouchPoints > 0; }
function getDevicePref()  { return document.documentElement.getAttribute('data-device'); }
function isMobile()  { var p = getDevicePref(); return p === 'mobile'  || (!p && window.innerWidth <= 767); }
function isTablet()  { var p = getDevicePref(); return p === 'tablet'  || (!p && window.innerWidth > 767 && window.innerWidth <= 1100 && isTouchDevice()); }
function isDesktop() { var p = getDevicePref(); return p === 'desktop' || (!p && window.innerWidth > 767 && !(window.innerWidth <= 1100 && isTouchDevice())); }

// ─── Nav 高亮（依 data-nav 屬性，支援全部 23 個 leaf） ───────────────────────
function updateNavActive(leafIndex) {
    var leaf = document.getElementById('leaf-' + leafIndex);
    var navKey = leaf ? (leaf.dataset.nav || '') : '';

    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.classList.toggle('active-nav', btn.dataset.nav === navKey && navKey !== '');
    });

    // submenu 高亮
    var subKey = leaf ? (leaf.dataset.sub || '') : '';
    document.querySelectorAll('.submenu-btn').forEach(function(btn) {
        btn.classList.toggle('active-sub', btn.dataset.sub === subKey && subKey !== '');
    });

    // submenuBar 顯示/隱藏
    var bar = document.getElementById('submenuBar');
    if (bar) {
        var hasMenu = typeof window.chapterConfig !== 'undefined' &&
                      window.chapterConfig[navKey] &&
                      window.chapterConfig[navKey].length > 0;
        bar.style.display = hasMenu ? 'flex' : 'none';
    }
}

// ─── 翻頁 ─────────────────────────────────────────────────────────────────────
function flipToPage(targetLeafIndex) {
    if (leaves.length === 0) initBook();
    if (isFlipping) return;
    if (targetLeafIndex === currentLeaf) return;
    if (targetLeafIndex < 0 || targetLeafIndex >= leaves.length) return;
    // 保險：強制清除任何殘留的 flipping class
    leaves.forEach(function(l) { l.classList.remove('flipping'); });

function _flipMobile(targetIdx) {
    var outLeaf = leaves[currentLeaf];
    var inLeaf  = leaves[targetIdx];

    inLeaf.style.transition = 'none';
    inLeaf.style.opacity    = '0';
    inLeaf.classList.remove('mobile-active', 'mobile-prev');
    inLeaf.style.display = 'block';

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            inLeaf.style.transition  = 'opacity 0.4s ease';
            inLeaf.style.opacity     = '1';
            inLeaf.classList.add('mobile-active');
            outLeaf.style.transition = 'opacity 0.4s ease';
            outLeaf.style.opacity    = '0';
            outLeaf.classList.remove('mobile-active');
            outLeaf.classList.add('mobile-prev');
        });
    });

    currentLeaf = targetIdx;
    _updateMobilePageInfo();
    setTimeout(function() { isFlipping = false; }, 450);
}

function _flipDesktop(targetIdx) {
    var isForward = targetIdx > currentLeaf;
    var delay = 0;
    var steps = Math.abs(targetIdx - currentLeaf);

    if (isForward) {
        for (var i = currentLeaf; i < targetIdx; i++) {
            if (leaves[i + 1]) leaves[i + 1].style.visibility = 'visible';
            (function(idx) {
                setTimeout(function() {
                    leaves[idx].classList.add('flipping', 'flipped');
                    setTimeout(function() {
                        leaves[idx].style.zIndex = idx + 1;
                        leaves[idx].classList.remove('flipping');
                    }, 600);
                }, delay);
            })(i);
            delay += 150;
        }
    } else {
        for (var j = currentLeaf - 1; j >= targetIdx; j--) {
            leaves[j].style.visibility = 'visible';
            (function(idx) {
                setTimeout(function() {
                    leaves[idx].classList.add('flipping');
                    leaves[idx].classList.remove('flipped');
                    setTimeout(function() {
                        leaves[idx].style.zIndex = leaves.length - idx;
                        leaves[idx].classList.remove('flipping');
                    }, 600);
                }, delay);
            })(j);
            delay += 150;
        }
    }

    currentLeaf = targetIdx;
    setTimeout(function() {
        isFlipping = false;
        if (isTablet()) _updateTabletArrows();
    }, steps * 150 + 400);
}

function nextPage() { flipToPage(currentLeaf + 1); }
function prevPage() { flipToPage(currentLeaf - 1); }

// ─── 透明熱區（取代 iframe 吞掉點擊的問題） ──────────────────────────────────
function _createClickZones(flip) {
    if (document.querySelector('.flip-btn-left')) return;

    // 翻頁按鈕掛在 body，固定定位對齊書本左右側
    function makeBtn(side, handler, label) {
        var btn = document.createElement('button');
        btn.className = 'flip-btn flip-btn-' + side;
        btn.setAttribute('aria-label', label);
        btn.innerHTML =
            side === 'left'
            ? '<span class="flip-arrow">&#10094;</span><span class="flip-label">翻頁</span>'
            : '<span class="flip-label">翻頁</span><span class="flip-arrow">&#10095;</span>';
        btn.addEventListener('click', handler);
        return btn;
    }

    document.body.appendChild(makeBtn('left',  prevPage, '上一頁'));
    document.body.appendChild(makeBtn('right', nextPage, '下一頁'));
}

// ─── Desktop 初始化 ───────────────────────────────────────────────────────────
function initDesktop() {
    leaves.forEach(function(leaf, index) {
        leaf.style.zIndex = leaves.length - index;
        leaf.style.transform = '';
        leaf.classList.remove('mobile-active', 'mobile-prev');
        leaf.style.visibility = index === 0 ? 'visible' : 'hidden';
    });

    // 建立透明熱區
    var book = document.getElementById('bookFlip');
    if (book) {
        _createClickZones(book);
        // spine shadow
        if (!book.querySelector('.spine-shadow')) {
            var spine = document.createElement('div');
            spine.className = 'spine-shadow';
            book.appendChild(spine);
        }
    }

    // 移除舊的 mobile/tablet UI
    ['mobileNavBar', 'tabletArrowLeft', 'tabletArrowRight', 'swipeHintBar']
        .forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.remove();
        });
}

// ─── Tablet 初始化 ────────────────────────────────────────────────────────────
function initTablet() {
    var book = document.getElementById('bookFlip');
    if (!book) return;

    if (!document.getElementById('tabletArrowLeft')) {
        var left = document.createElement('div');
        left.className = 'tablet-arrow tablet-arrow-left';
        left.id = 'tabletArrowLeft';
        left.innerHTML = '&#8592;';
        left.onclick = prevPage;

        var right = document.createElement('div');
        right.className = 'tablet-arrow tablet-arrow-right';
        right.id = 'tabletArrowRight';
        right.innerHTML = '&#8594;';
        right.onclick = nextPage;

        book.appendChild(left);
        book.appendChild(right);
    }
    _updateTabletArrows();
}

function _updateTabletArrows() {
    var l = document.getElementById('tabletArrowLeft');
    var r = document.getElementById('tabletArrowRight');
    if (l) l.classList.toggle('disabled', currentLeaf === 0);
    if (r) r.classList.toggle('disabled', currentLeaf === leaves.length - 1);
}

// ─── Mobile 初始化 ────────────────────────────────────────────────────────────
function initMobile() {
    leaves.forEach(function(leaf) {
        leaf.classList.remove('flipped', 'flipping', 'mobile-active', 'mobile-prev');
        leaf.style.cssText = '';
    });
    if (leaves[0]) leaves[0].classList.add('mobile-active');
    _updateMobilePageInfo();
}

function _updateMobilePageInfo() {
    var nav = document.querySelector('nav');
    if (!nav) return;
    var info = nav.querySelector('.page-info');
    if (!info) {
        info = document.createElement('span');
        info.className = 'page-info';
        info.style.cssText = 'margin-left:auto;color:rgba(255,252,245,0.8);font-size:0.85rem;';
        nav.appendChild(info);
    }
    info.textContent = (currentLeaf + 1) + ' / ' + leaves.length;
}

// ─── 滑動手勢 ─────────────────────────────────────────────────────────────────
(function initSwipe() {
    var sx = 0, sy = 0;
    var vp = document.getElementById('viewport');
    if (!vp) return;
    vp.addEventListener('touchstart', function(e) {
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
    }, { passive: true });
    vp.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - sx;
        var dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? nextPage() : prevPage();
        }
    }, { passive: true });
})();

// ─── initBook ─────────────────────────────────────────────────────────────────
function initBook() {
    leaves = Array.from(document.querySelectorAll('.leaf'));

    var saved = localStorage.getItem('devicePreference');
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

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', function() {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(function() {
        currentLeaf = 0;
        isFlipping  = false;
        initBook();
    }, 300);
});
