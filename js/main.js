/**
 * ==========================================================================
 * 曹洞正宗通法禪寺志 | 核心互動引擎 (V22 互動優化版)
 * 功能：3D 翻頁、法脈切換、滑鼠懸停預覽 (Tooltip)、點擊查閱生平 (Modal)
 * ==========================================================================
 */

// 1. 初始化 Mermaid.js
mermaid.initialize({ 
    startOnLoad: true, 
    securityLevel: 'loose',
    maxNodes: 10000,
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'linear'
    },
    theme: 'base', 
    themeVariables: { 
        primaryColor: '#fffcf5', 
        primaryTextColor: '#4a3325', 
        lineColor: '#c6a059', 
        fontFamily: '"Noto Serif TC", serif' 
    } 
});

// 2. 進場歡迎頁 — 同時解決音效授權問題
const INSTRUCTIONS = {
    desktop: {
        title: '桌機操作方式',
        items: [
            '點擊上方導覽列切換章節',
            '書本兩側點擊可前後翻頁',
            '滑鼠停在祖師名上顯示簡介',
            '雙擊祖師名開啟完整傳記',
            '左下角按鈕啟動頌缽音樂'
        ]
    },
    tablet: {
        title: 'iPad / 平板操作方式',
        items: [
            '左右滑動或點擊兩側箭頭翻頁',
            '上方導覽列可左右滾動切換',
            '點一下祖師名顯示簡介卡片',
            '連點兩下祖師名開啟完整傳記',
            '左下角按鈕啟動頌缽音樂'
        ]
    },
    mobile: {
        title: '手機操作方式',
        items: [
            '左右滑動或點擊底部箭頭翻頁',
            '上方導覽列可左右滾動切換',
            '點一下祖師名顯示簡介卡片',
            '連點兩下祖師名開啟完整傳記',
            '左下角按鈕啟動頌缽音樂'
        ]
    }
};

function buildWelcomeInstructions() {
    const type = getDeviceType();
    const inst  = INSTRUCTIONS[type];
    const ul    = inst.items.map(t => `<li>${t}</li>`).join('');
    document.getElementById('welcomeInstructions').innerHTML =
        `<span class="inst-title">◈ ${inst.title}</span><ul>${ul}</ul>`;
    document.getElementById('welcomeAudioNote').textContent =
        '點擊入寺後即可啟用頌缽背景音樂';
}

function enterTemple() {
    const overlay = document.getElementById('welcomeOverlay');
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display = 'none'; }, 800);
}

// 說明按鈕（右下角）
function showHelp() {
    buildWelcomeInstructions();
    document.getElementById('welcomeAudioNote').textContent = '';
    const overlay = document.getElementById('welcomeOverlay');
    overlay.style.display = 'flex';
    overlay.classList.remove('fade-out');
    // 把「入寺參禮」按鈕文字改為「關閉」
    const btn = overlay.querySelector('.welcome-enter-btn');
    btn.innerHTML = '<i class="fas fa-times"></i> 關閉';
}

// 音效暫時停用
const zenAudio = null;
const audioBtn  = null;
const audioIcon = null;
let isAudioPlaying = false;

function showAudioToast(msg) {
    let toast = document.getElementById('audioToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'audioToast';
        toast.style.cssText = `
            position:fixed; bottom:100px; left:50%; transform:translateX(-50%);
            background:rgba(93,64,55,0.88); color:#fffcf5;
            padding:8px 20px; border-radius:20px; font-size:0.8rem;
            letter-spacing:2px; z-index:9999; pointer-events:none;
            opacity:0; transition:opacity 0.3s;`;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function toggleZenAudio(e) {
    // 音效功能暫停，待日後以外部連結實現
    if (e) e.stopPropagation();
    showAudioToast('音樂功能即將上線');
}

// 3. 彈出式生平視窗邏輯 (雙擊觸發，需有 full 傳記才開啟)
function getMonkData(name) {
    if (typeof monkDatabase === 'undefined') return null;
    // 直接比對
    if (monkDatabase[name]) return monkDatabase[name];
    // 容錯：移除空格後比對
    const noSpace = name.replace(/\s/g, '');
    for (const key of Object.keys(monkDatabase)) {
        if (key.replace(/\s/g, '') === noSpace) return monkDatabase[key];
    }
    return null;
}

function openModal(name) {
    const cleanName = name.replace(/<[^>]*>?/gm, '').trim();
    const data = getMonkData(cleanName);
    
    if (!data) return; // 無祖師資料則不開
    
    // 優先嘗試讀取 docs/*.md，如果失敗則用 data.js 中的 full
    const mdPath = `docs/${cleanName}.md`;
    
    fetch(mdPath)
        .then(response => {
            if (!response.ok) throw new Error('MD not found');
            return response.text();
        })
        .then(mdContent => {
            // MD 讀取成功，用 md 內容
            displayBioModal(cleanName, mdContent, data.image);
        })
        .catch(() => {
            // MD 讀取失敗，回退到 data.js 中的 full 內容
            if (data.full) {
                displayBioModal(cleanName, data.full, data.image);
            } else {
                // 都沒有就不開
                return;
            }
        });
}

function displayBioModal(name, content, imagePath) {
    document.getElementById('bioName').innerText = name;
    document.getElementById('bioStory').innerText = content;

    // 肖像圖
    const imgEl = document.getElementById('bioPortrait');
    if (imagePath) {
        imgEl.src = imagePath;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    document.getElementById('bioModal').classList.add('show');
    tooltip.classList.remove('show');
}

function closeModal() {
    document.getElementById('bioModal').classList.remove('show');
}

// 4. 懸停預覽 (Tooltip) 邏輯處理 -------------------------------------------
const tooltip = document.getElementById('hoverTooltip');

// 雙擊開詳細彈窗
document.addEventListener('dblclick', function(e) {
    const node = e.target.closest('.node');
    if (node) {
        const label = node.querySelector('.nodeLabel').textContent;
        openModal(label);
    }
});

// 監聽滑鼠移入節點 (Hover In)
document.addEventListener('mouseover', function(e) {
    const node = e.target.closest('.node');
    const isModalOpen = document.getElementById('bioModal').classList.contains('show');
    if (node && !isModalOpen) {
        const name = node.querySelector('.nodeLabel').textContent.replace(/<[^>]*>?/gm, '').trim();
        const data = getMonkData(name);

        let shortText = data ? data.short : '資料整理中...';
        if (shortText.length > 60) shortText = shortText.substring(0, 57) + '...';

        // 有 full 傳記者顯示雙擊提示
        const hint = (data && data.full)
            ? '<span class="tooltip-hint">雙擊查看完整傳記</span>'
            : '';

        // 有肖像者顯示縮圖
        const imgHtml = (data && data.image)
            ? `<img class="tooltip-portrait" src="${data.image}" alt="${name}" onerror="this.style.display='none'">`
            : '';

        tooltip.innerHTML = `
            <div class="tooltip-inner">
                ${imgHtml}
                <div class="tooltip-text">
                    <span class="tooltip-name">${name}</span>
                    <span class="tooltip-short">${shortText}</span>
                    ${hint}
                </div>
            </div>`;
        tooltip.classList.add('show');
    }
});

// 滑鼠移動時懸浮框跟隨
document.addEventListener('mousemove', function(e) {
    if (tooltip && tooltip.classList.contains('show')) {
        let x = e.pageX + 18;
        let y = e.pageY + 18;
        // 防止跑出視窗右側
        if (x + 300 > window.innerWidth) x = e.pageX - 310;
        tooltip.style.left = x + 'px';
        tooltip.style.top  = y + 'px';
    }
});

// 滑鼠移出節點隱藏 tooltip
document.addEventListener('mouseout', function(e) {
    const node = e.target.closest('.node');
    if (node) tooltip.classList.remove('show');
});
// -------------------------------------------------------------------------

// 5. 法脈圖切換邏輯（五圖）
const LINEAGE_TABS = ['direct', 'caodong', 'full', 'shouchang', 'biographies'];

function switchLineage(type) {
    LINEAGE_TABS.forEach(t => {
        document.getElementById('btn-' + t)?.classList.remove('active');
        document.getElementById('mermaid-' + t)?.classList.remove('active');
    });
    document.getElementById('btn-'     + type)?.classList.add('active');
    document.getElementById('mermaid-' + type)?.classList.add('active');
    
    // 生成祖師傳記卡片（只在切換到該tab時）
    if (type === 'biographies') {
        renderBiographiesGrid();
    }
}

function renderBiographiesGrid() {
    const grid = document.getElementById('biographiesGrid');
    if (!grid || grid.children.length > 0) return; // 已生成過就不再生成
    
    const monksWithBio = Object.entries(monkDatabase).filter(([name, data]) => data.full || data.image);
    
    monksWithBio.forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = 'bio-card';
        
        const imgHtml = data.image ? `<img src="${data.image}" alt="${name}" class="bio-card-img">` : '';
        const shortText = data.short.length > 80 ? data.short.substring(0, 77) + '...' : data.short;
        
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

// 6. 裝置偵測（三段式：桌機 / 觸控平板 / 手機）
// 優先檢查device-switcher的設置，否則自動檢測
const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const getDevicePreference = () => document.documentElement.getAttribute('data-device');
const isMobile  = () => getDevicePreference() === 'mobile'  || (getDevicePreference() === null && window.innerWidth <= 767);
const isTablet  = () => getDevicePreference() === 'tablet'  || (getDevicePreference() === null && window.innerWidth > 767 && window.innerWidth <= 1100 && isTouchDevice());
const isDesktop = () => getDevicePreference() === 'desktop' || (getDevicePreference() === null && window.innerWidth > 767 && !(window.innerWidth <= 1100 && isTouchDevice()));

function getDeviceType() {
    const pref = getDevicePreference();
    if (pref) return pref;
    if (window.innerWidth <= 767) return 'mobile';
    if (window.innerWidth <= 1100 && isTouchDevice()) return 'tablet';
    return 'desktop';  // 寬度 > 1100px 一律桌機模式，不管有沒有觸控
}

// 7. 翻書引擎核心
// 清除上次手動切換的裝置偏好，讓寬度自動決定
(function() {
    const saved = localStorage.getItem('devicePreference');
    const w = window.innerWidth;
    // 如果儲存的是 mobile 但視窗寬度 > 1100px，清除它
    if (saved === 'mobile' && w > 1100) {
        localStorage.removeItem('devicePreference');
        document.documentElement.removeAttribute('data-device');
    }
    if (saved === 'tablet' && w > 1100) {
        localStorage.removeItem('devicePreference');
        document.documentElement.removeAttribute('data-device');
    }
})();

const leaves = document.querySelectorAll('.leaf');
const navButtons = document.querySelectorAll('nav button');
let currentLeaf = 0;
let isFlipping = false;

// 初始化書本
function initBook() {
    // 強制限制書本寬度，讓封面不超出視窗
    const bookFlip = document.getElementById('bookFlip');
    if (bookFlip && !isMobile()) {
        const bookWidth = Math.min(1100, window.innerWidth - 40);
        const bookHeight = Math.round(window.innerHeight * 0.84);
        bookFlip.style.width = bookWidth + 'px';
        bookFlip.style.maxWidth = bookWidth + 'px';
        bookFlip.style.height = bookHeight + 'px';
        bookFlip.style.margin = '0 auto';
        bookFlip.style.position = 'relative';
    }

    if (isMobile()) {
        initMobile();
    } else {
        initDesktop();
        if (isTablet()) initTablet();
    }
}

function initDesktop() {
    leaves.forEach((leaf, index) => {
        leaf.style.zIndex = leaves.length - index;
        leaf.style.transform = '';
        leaf.classList.remove('mobile-active', 'mobile-prev');
        const front = leaf.querySelector('.page-front');
        if (front && !front.querySelector('.corner-hint')) {
            const hint = document.createElement('div');
            hint.className = 'corner-hint';
            front.appendChild(hint);
        }
        
        // 添加點擊翻頁功能
        leaf.style.cursor = 'pointer';
        leaf.addEventListener('click', function(e) {
            // 如果點擊到互動元素（按鈕、連結等），不觸發翻頁
            if (e.target.closest('button, a, input, select, [onclick], .lineage-btn, .artifact-btn, .monk-node')) return;
            const rect = leaf.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const relX = clickX / rect.width;
            // 只在最左 20% 或最右 20% 才觸發翻頁（兩側熱區）
            if (relX <= 0.2) {
                prevPage();
            } else if (relX >= 0.8) {
                nextPage();
            }
        });
    });
    const book = document.getElementById('bookFlip');
    if (book && !book.querySelector('.spine-shadow')) {
        const spine = document.createElement('div');
        spine.className = 'spine-shadow';
        book.appendChild(spine);
    }
    // 移除手機 / 平板 UI
    ['mobileNavBar', 'tabletArrowLeft', 'tabletArrowRight', 'swipeHintBar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

function initTablet() {
    const book = document.getElementById('bookFlip');
    if (!book) return;

    // 注入左右翻頁箭頭
    if (!document.getElementById('tabletArrowLeft')) {
        const left = document.createElement('div');
        left.className = 'tablet-arrow tablet-arrow-left';
        left.id = 'tabletArrowLeft';
        left.innerHTML = '&#8592;';
        left.onclick = prevPage;
        book.appendChild(left);

        const right = document.createElement('div');
        right.className = 'tablet-arrow tablet-arrow-right';
        right.id = 'tabletArrowRight';
        right.innerHTML = '&#8594;';
        right.onclick = nextPage;
        book.appendChild(right);
    }

    // 注入底部滑動提示
    if (!document.getElementById('swipeHintBar')) {
        const hint = document.createElement('div');
        hint.className = 'swipe-hint-bar';
        hint.id = 'swipeHintBar';
        hint.textContent = '← 左右滑動翻頁 →';
        book.appendChild(hint);
    }

    updateTabletArrows();
}

function updateTabletArrows() {
    const left  = document.getElementById('tabletArrowLeft');
    const right = document.getElementById('tabletArrowRight');
    if (!left || !right) return;
    left.classList.toggle('disabled',  currentLeaf === 0);
    right.classList.toggle('disabled', currentLeaf === leaves.length - 1);
}

function initMobile() {
    // 清除舊狀態
    leaves.forEach((leaf, index) => {
        leaf.classList.remove('flipped', 'flipping', 'mobile-active', 'mobile-prev');
        leaf.style.zIndex = '';
        leaf.style.transform = '';
        leaf.style.transition = '';
    });
    
    // 第一頁設為 active
    if (leaves[0]) leaves[0].classList.add('mobile-active');

    // 移除舊的底部導航（如果有）
    const oldBar = document.getElementById('mobileNavBar');
    if (oldBar) oldBar.remove();
    
    // 添加觸摸和滑輪事件監聽
    const bookContainer = document.querySelector('.book-container');
    if (bookContainer && !bookContainer.dataset.touchInitialized) {
        bookContainer.dataset.touchInitialized = 'true';
        
        let touchStartY = 0;
        const touchSensitivity = 50;
        
        // 觸摸事件
        bookContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        bookContainer.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (diff > touchSensitivity) {
                // 上滑 — 下一頁
                nextPage();
            } else if (diff < -touchSensitivity) {
                // 下滑 — 上一頁
                prevPage();
            }
        });
        
        // 滑輪事件（桌機模擬手機版本時用）
        bookContainer.addEventListener('wheel', (e) => {
            if (isMobile()) {
                e.preventDefault();
                if (e.deltaY > 0) {
                    nextPage();
                } else {
                    prevPage();
                }
            }
        }, { passive: false });
    }

    updateMobileNavBar();
}

function updateMobileNavBar() {
    // 手機版本不需要底部導航列，信息由標題列提供
    const nav = document.querySelector('nav');
    if (nav) {
        const pageInfo = nav.querySelector('.page-info');
        if (!pageInfo) {
            const info = document.createElement('span');
            info.className = 'page-info';
            info.style.marginLeft = 'auto';
            info.style.color = 'rgba(255,252,245,0.8)';
            info.style.fontSize = '0.85rem';
            nav.appendChild(info);
        }
        const info = nav.querySelector('.page-info');
        if (info) {
            info.textContent = `${currentLeaf + 1} / ${leaves.length}`;
        }
    }
}

// 翻頁（桌機 3D / 手機橫滑 自動切換）
function flipToPage(targetLeafIndex) {
    if (isFlipping || targetLeafIndex === currentLeaf ||
        targetLeafIndex < 0 || targetLeafIndex >= leaves.length) return;

    isFlipping = true;
    updateNavActive(targetLeafIndex);

    if (isMobile()) {
        // 手機：淡出淡入動畫（上下滑動效果）
        const outLeaf = leaves[currentLeaf];
        const inLeaf  = leaves[targetLeafIndex];

        // 準備：新頁先設為不可見
        inLeaf.style.transition = 'none';
        inLeaf.style.opacity = '0';
        inLeaf.classList.remove('mobile-active', 'mobile-prev');
        inLeaf.style.display = 'block';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 開始動畫
                inLeaf.style.transition = 'opacity 0.4s ease';
                inLeaf.style.opacity = '1';
                inLeaf.classList.add('mobile-active');

                outLeaf.style.transition = 'opacity 0.4s ease';
                outLeaf.style.opacity = '0';
                outLeaf.classList.remove('mobile-active');
                outLeaf.classList.add('mobile-prev');
            });
        });

        currentLeaf = targetLeafIndex;
        updateMobileNavBar();
        updatePageTablet(targetLeafIndex);
        setTimeout(() => { isFlipping = false; }, 420);

    } else {
        // 桌機 / 平板：3D 翻頁
        const isForward = targetLeafIndex > currentLeaf;
        let delay = 0;
        if (isForward) {
            for (let i = currentLeaf; i < targetLeafIndex; i++) {
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
            for (let i = currentLeaf - 1; i >= targetLeafIndex; i--) {
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
        currentLeaf = targetLeafIndex;
        setTimeout(() => {
            isFlipping = false;
            if (isTablet()) updateTabletArrows();
        }, Math.abs(targetLeafIndex - currentLeaf) * 150 + 400);
    }
}

function nextPage() { if (currentLeaf < leaves.length - 1) flipToPage(currentLeaf + 1); }
function prevPage() { if (currentLeaf > 0) flipToPage(currentLeaf - 1); }

function updateNavActive(index) {
    navButtons.forEach(btn => btn.classList.remove('active-nav'));
    if (navButtons[index]) navButtons[index].classList.add('active-nav');
}

// 8. 觸控滑動手勢（手機橫滑 + 平板3D翻頁，共用同一套偵測）
(function initSwipe() {
    let startX = 0, startY = 0;
    const vp = document.getElementById('viewport');
    if (!vp) return;

    vp.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    vp.addEventListener('touchend', e => {
        if (!isTouchDevice()) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        // 水平滑動距離 > 垂直 且 > 50px 才觸發翻頁
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            dx < 0 ? nextPage() : prevPage();
        }
    }, { passive: true });
})();

// 9. 觸控裝置僧侶資訊（手機 + 平板共用底部滑入欄）
(function initMonkInfoSheet() {
    const sheet = document.createElement('div');
    sheet.className = 'monk-info-sheet';
    sheet.id = 'monkInfoSheet';
    sheet.innerHTML = `
        <img id="sheetImg" src="" alt="" style="display:none">
        <div class="monk-sheet-text">
            <span class="monk-sheet-name" id="sheetName"></span>
            <span class="monk-sheet-short" id="sheetShort"></span>
            <span class="monk-sheet-hint" id="sheetHint"></span>
        </div>
        <button class="monk-sheet-close" onclick="closeMonkSheet()">✕</button>`;
    document.body.appendChild(sheet);

    // 單擊顯示資訊，雙擊開modal（手機 + 平板都適用）
    let tapTimer = null;
    document.addEventListener('touchend', function(e) {
        if (!isTouchDevice()) return;
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
                showMonkSheet(name);
            }, 280);
        }
    }, { passive: false });
})();

function showMonkSheet(name) {
    const data = getMonkData(name);
    document.getElementById('sheetName').textContent = name;
    document.getElementById('sheetShort').textContent = data ? data.short : '資料整理中...';
    document.getElementById('sheetHint').textContent = (data && data.full) ? '點兩下查看完整傳記' : '';
    const img = document.getElementById('sheetImg');
    if (data && data.image) { img.src = data.image; img.style.display = 'block'; }
    else { img.style.display = 'none'; }
    document.getElementById('monkInfoSheet').classList.add('show');
}

function closeMonkSheet() {
    document.getElementById('monkInfoSheet').classList.remove('show');
}

// 視窗縮放時重新初始化
window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(() => {
        currentLeaf = 0;
        isFlipping = false;
        initBook();
        updateNavActive(0);
    }, 300);
});

// 啟動
document.addEventListener('DOMContentLoaded', () => {
    // 歡迎頁初始化
    buildWelcomeInstructions();

    // 注入右下角說明按鈕
    const helpBtn = document.createElement('button');
    helpBtn.className = 'help-btn';
    helpBtn.title = '操作說明';
    helpBtn.innerHTML = '？';
    helpBtn.onclick = showHelp;
    document.body.appendChild(helpBtn);

    // 書本初始化
    initBook();
});
// 章節配置
const chapterConfig = {
    0: { name: '封面', submenu: [] },
    1: { name: '扉頁', submenu: [] },
    2: { name: '簡介', submenu: [] },
    3: { name: '法脈傳承', submenu: [
        { label: '直系傳承', action: "switchLineage('direct')" },
        { label: '曹洞宗全圖', action: "switchLineage('caodong')" },
        { label: '通法寺法脈', action: "switchLineage('full')" },
        { label: '壽昌法派', action: "switchLineage('shouchang')" },
        { label: '祖師傳記', action: "switchLineage('biographies')" }
    ]},
    5: { name: '文物典藏', submenu: [
        { label: '院外', action: "flipToPage(5)" },
        { label: '一樓大殿', action: "flipToPage(5)" },
        { label: '三樓地藏殿', action: "flipToPage(5)" },
        { label: '四樓文殊殿', action: "flipToPage(5)" }
    ]},
    6: { name: '現任執事', submenu: [] },
    7: { name: '寺務活動', submenu: [] },
    8: { name: '聯絡我們', submenu: [] }
};

// 更新右側章節標籤
function updatePageTablet(pageIndex) {
    const chapter = chapterConfig[pageIndex] || chapterConfig[0];
    const tabletLabel = document.getElementById('tabletLabel');
    const tabletSubmenu = document.getElementById('tabletSubmenu');
    
    if (tabletLabel) {
        tabletLabel.textContent = chapter.name;
    }
    
    if (tabletSubmenu) {
        tabletSubmenu.innerHTML = '';
        if (chapter.submenu && chapter.submenu.length > 0) {
            chapter.submenu.forEach(item => {
                const div = document.createElement('div');
                div.className = 'tablet-item';
                div.textContent = item.label;
                div.onclick = () => eval(item.action);
                tabletSubmenu.appendChild(div);
            });
        }
    }
}

// 改進原有的 flipToPage 函式（保存原有邏輯，添加標籤更新）
const originalFlipToPage = window.flipToPage;
window.flipToPage = function(idx) {
    if (originalFlipToPage) {
        originalFlipToPage(idx);
    }
    updatePageTablet(idx);
};

// 初始化右側標籤
document.addEventListener('DOMContentLoaded', () => {
    updatePageTablet(currentLeaf || 0);
});