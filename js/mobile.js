/**
 * 通法禪寺 — 手機版邏輯（現代簡潔版）
 * js/mobile.js
 *
 * 完全獨立。不依賴 flip-engine / book-engine 等電腦版邏輯。
 */

(function () {
  'use strict';

  /* ── 裝置檢查：電腦打開就跳回 index.html ── */
  if (
    window.innerWidth > 768 &&
    !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  ) {
    location.replace('index.html');
    return;
  }

  /* ══════════════════════════════
     DOM 參照
  ══════════════════════════════ */
  const fab         = document.getElementById('mFab');
  const menu        = document.getElementById('mMenu');
  const overlay     = document.getElementById('mOverlay');
  const mMain       = document.getElementById('mMain');
  const iframe      = document.getElementById('mIframe');
  const sectionName = document.getElementById('mSectionName');
  const lineageBar  = document.getElementById('mLineageBar');
  const menuItems   = document.querySelectorAll('.m-menu-item');
  const lineageBtns = document.querySelectorAll('.m-lineage-btn');

  const caodongModal   = document.getElementById('mCaodongModal');
  const caodongWrapper = document.getElementById('mCaodongWrapper');
  const caodongIframe  = document.getElementById('mCaodongIframe');
  const caodongClose   = document.getElementById('mCaodongClose');

  /* ══════════════════════════════
     狀態
  ══════════════════════════════ */
  let menuOpen       = false;
  let currentSection = 'cover';
  let busy           = false;   // 換頁動畫進行中，忽略重複觸發

  // 全圖縮放
  let _zoom = 1, _panX = 0, _panY = 0;
  let _dragging = false, _lastX = 0, _lastY = 0, _lastDist = 0;

  /* ══════════════════════════════
     選單開關
  ══════════════════════════════ */
  function openMenu() {
    menuOpen = true;
    fab.classList.add('open');
    menu.classList.add('open');
    overlay.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    menuOpen = false;
    fab.classList.remove('open');
    menu.classList.remove('open');
    overlay.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  }

  fab.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  overlay.addEventListener('click', closeMenu);

  /* ══════════════════════════════
     頁面切換（fade）
  ══════════════════════════════ */
  const FADE_OUT = 200;   // ms，遮罩蓋住
  const FADE_IN  = 400;   // ms，新頁淡入

  function goTo(section, src, label) {
    if (busy) return;
    closeMenu();

    // 更新選單 active
    menuItems.forEach(item =>
      item.classList.toggle('active', item.dataset.section === section)
    );

    // 法脈子選單顯示 / 隱藏
    if (section === 'lineage') {
      lineageBar.classList.add('visible');
      lineageBar.setAttribute('aria-hidden', 'false');
      // 重設子頁 active（預設第一個）
      lineageBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
    } else {
      lineageBar.classList.remove('visible');
      lineageBar.setAttribute('aria-hidden', 'true');
    }

    currentSection = section;
    busy = true;

    // 淡出
    mMain.classList.add('fading');
    iframe.classList.remove('visible');
    sectionName.style.opacity = '0';

    setTimeout(() => {
      iframe.src = src;
      sectionName.textContent = label;
      sectionName.style.opacity = '1';

      function onLoad() {
        mMain.classList.remove('fading');
        requestAnimationFrame(() => {
          iframe.classList.add('visible');
          busy = false;
        });
        iframe.removeEventListener('load', onLoad);
      }
      iframe.addEventListener('load', onLoad);

      // 保險計時器（iframe 有時不觸發 load）
      setTimeout(() => {
        if (busy) {
          mMain.classList.remove('fading');
          iframe.classList.add('visible');
          busy = false;
        }
      }, 1500);

    }, FADE_OUT);
  }

  /* ══════════════════════════════
     主選單點擊
  ══════════════════════════════ */
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      goTo(item.dataset.section, item.dataset.src, item.dataset.label);
    });
  });

  /* ══════════════════════════════
     法脈子選單點擊
  ══════════════════════════════ */
  lineageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src   = btn.dataset.src;
      const label = btn.dataset.label;

      // 曹洞全圖 → Modal
      if (label === '曹洞全圖') {
        openCaodongModal(src);
        return;
      }

      // 更新子頁 active
      lineageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 子頁 fade 切換（section 不變）
      if (busy) return;
      busy = true;

      mMain.classList.add('fading');
      iframe.classList.remove('visible');
      sectionName.style.opacity = '0';

      setTimeout(() => {
        iframe.src = src;
        sectionName.textContent = `法脈 · ${label}`;
        sectionName.style.opacity = '1';

        function onLoad() {
          mMain.classList.remove('fading');
          requestAnimationFrame(() => {
            iframe.classList.add('visible');
            busy = false;
          });
          iframe.removeEventListener('load', onLoad);
        }
        iframe.addEventListener('load', onLoad);

        setTimeout(() => {
          if (busy) {
            mMain.classList.remove('fading');
            iframe.classList.add('visible');
            busy = false;
          }
        }, 1500);
      }, FADE_OUT);
    });
  });

  /* ══════════════════════════════
     曹洞全圖 Modal
  ══════════════════════════════ */
  function openCaodongModal(src) {
    _zoom = 1; _panX = 0; _panY = 0;
    caodongIframe.src = src;
    caodongModal.classList.add('open');
    caodongModal.setAttribute('aria-hidden', 'false');
    _applyTransform();
  }

  function closeCaodongModal() {
    caodongModal.classList.remove('open');
    caodongModal.setAttribute('aria-hidden', 'true');
    setTimeout(() => { caodongIframe.src = ''; }, 350);
  }

  caodongClose.addEventListener('click', closeCaodongModal);
  caodongModal.addEventListener('click', e => {
    if (e.target === caodongModal) closeCaodongModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCaodongModal();
  });

  function _applyTransform() {
    const w = caodongWrapper.clientWidth;
    const h = caodongWrapper.clientHeight;
    const maxX = Math.max(0, w * _zoom - w);
    const maxY = Math.max(0, h * _zoom - h);
    _panX = Math.min(0, Math.max(-maxX, _panX));
    _panY = Math.min(0, Math.max(-maxY, _panY));
    caodongIframe.style.transform =
      `translate(${_panX}px,${_panY}px) scale(${_zoom})`;
  }

  // 滾輪縮放
  caodongWrapper.addEventListener('wheel', e => {
    e.preventDefault();
    _zoom = Math.min(6, Math.max(1, _zoom * (e.deltaY > 0 ? 0.88 : 1.14)));
    _applyTransform();
  }, { passive: false });

  // 滑鼠拖曳
  caodongWrapper.addEventListener('mousedown', e => {
    _dragging = true; _lastX = e.clientX; _lastY = e.clientY;
  });
  document.addEventListener('mousemove', e => {
    if (!_dragging) return;
    _panX += e.clientX - _lastX;
    _panY += e.clientY - _lastY;
    _lastX = e.clientX; _lastY = e.clientY;
    _applyTransform();
  });
  document.addEventListener('mouseup', () => { _dragging = false; });

  // 觸控 pinch + 拖曳
  caodongWrapper.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      _lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else {
      _dragging = true;
      _lastX = e.touches[0].clientX;
      _lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  caodongWrapper.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (_lastDist > 0) {
        _zoom = Math.min(6, Math.max(1, _zoom * (dist / _lastDist)));
        _applyTransform();
      }
      _lastDist = dist;
    } else if (_dragging) {
      _panX += e.touches[0].clientX - _lastX;
      _panY += e.touches[0].clientY - _lastY;
      _lastX = e.touches[0].clientX;
      _lastY = e.touches[0].clientY;
      _applyTransform();
    }
  }, { passive: false });

  caodongWrapper.addEventListener('touchend', () => {
    _dragging = false; _lastDist = 0;
  });

  /* ══════════════════════════════
     初始化：封面淡入
  ══════════════════════════════ */
  iframe.addEventListener('load', function onFirstLoad() {
    mMain.classList.remove('fading');
    iframe.classList.add('visible');
    iframe.removeEventListener('load', onFirstLoad);
  });

})();
