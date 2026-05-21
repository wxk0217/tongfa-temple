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
  let busy           = false;

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
     iOS iframe 捲動修正
     在同源 iframe 載入後注入 CSS，將內部捲動容器從
     overflow:auto 強制改為 overflow:scroll，
     並套用 GPU 合成層讓 iOS Safari 正確辨識捲動區域。
  ══════════════════════════════ */
  function fixIOSScroll() {
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.head) return;
      const old = doc.getElementById('_iosfix');
      if (old) old.remove();
      const s = doc.createElement('style');
      s.id = '_iosfix';
      s.textContent =
        'html{height:100%!important;overflow:hidden!important;}' +
        'body{height:100%!important;overflow:visible!important;}' +
        '.scroll-wrap,.intro-text{' +
          'overflow-y:scroll!important;' +
          '-webkit-overflow-scrolling:touch!important;' +
          'transform:translateZ(0);}' +
        'div[style*="overflow:auto"],div[style*="overflow: auto"]{' +
          'overflow-y:scroll!important;' +
          '-webkit-overflow-scrolling:touch!important;' +
          'transform:translateZ(0);}' +
        'div[style*="overflow-y:auto"],div[style*="overflow-y: auto"]{' +
          'overflow-y:scroll!important;' +
          '-webkit-overflow-scrolling:touch!important;' +
          'transform:translateZ(0);}';
      doc.head.appendChild(s);
    } catch (e) {}
  }

  /* ══════════════════════════════
     頁面切換（fade）
  ══════════════════════════════ */
  const FADE_OUT = 200;
  const FADE_IN  = 400;

  function goTo(section, src, label) {
    if (busy) return;
    closeMenu();

    menuItems.forEach(item =>
      item.classList.toggle('active', item.dataset.section === section)
    );

    if (section === 'lineage') {
      lineageBar.classList.add('visible');
      lineageBar.setAttribute('aria-hidden', 'false');
      mMain.classList.add('lineage-active');
      lineageBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
    } else {
      lineageBar.classList.remove('visible');
      lineageBar.setAttribute('aria-hidden', 'true');
      mMain.classList.remove('lineage-active');
    }

    currentSection = section;
    busy = true;

    mMain.classList.add('fading');
    iframe.classList.remove('visible');
    sectionName.style.opacity = '0';

    setTimeout(() => {
      iframe.src = src;
      sectionName.textContent = label;
      sectionName.style.opacity = '1';

      function onLoad() {
        fixIOSScroll();
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
          fixIOSScroll();
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

      if (label === '曹洞全圖') {
        openCaodongModal(src);
        return;
      }

      lineageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

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
          fixIOSScroll();
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
            fixIOSScroll();
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
    caodongIframe.src = src;
    caodongModal.classList.add('open');
    caodongModal.setAttribute('aria-hidden', 'false');
  }
  window.openCaodongModal = openCaodongModal;

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

  /* ══════════════════════════════
     BGM 開關
  ══════════════════════════════ */
  const bgmBtn   = document.getElementById('mBgmBtn');
  const bgmAudio = document.getElementById('mBgm');
  let bgmPlaying = false;

  bgmBtn.addEventListener('click', () => {
    if (bgmPlaying) {
      bgmAudio.pause();
      bgmBtn.classList.remove('playing');
      bgmBtn.setAttribute('aria-label', '播放背景音樂');
    } else {
      bgmAudio.play().catch(() => {});
      bgmBtn.classList.add('playing');
      bgmBtn.setAttribute('aria-label', '停止背景音樂');
    }
    bgmPlaying = !bgmPlaying;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (bgmPlaying) bgmAudio.pause();
    } else {
      if (bgmPlaying) bgmAudio.play().catch(() => {});
    }
  });

  /* ══════════════════════════════
     初始化：封面淡入
  ══════════════════════════════ */
  iframe.addEventListener('load', function onFirstLoad() {
    fixIOSScroll();
    mMain.classList.remove('fading');
    iframe.classList.add('visible');
    iframe.removeEventListener('load', onFirstLoad);
  });

})();