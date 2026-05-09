/**
 * device-switcher.js
 * 裝置切換（桌機 / 平板 / 手機）
 * 不重複建立 UI — index.html 已有按鈕，這裡只負責邏輯
 */
(function () {
    'use strict';

    function detectDevice() {
        const saved = localStorage.getItem('devicePreference');
        if (saved) return saved;
        const w = window.innerWidth;
        if (w <= 767)  return 'mobile';
        if (w <= 1100) return 'tablet';
        return 'desktop';
    }

    function applyDevice(device) {
        document.documentElement.setAttribute('data-device', device);

        // 更新按鈕 active 狀態
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === device);
        });

        // 重新初始化書本
        if (typeof initBook === 'function') initBook();
    }

    // 全域切換函數（供 onclick 呼叫）
    window.setDevice = function (device) {
        localStorage.setItem('devicePreference', device);
        applyDevice(device);
    };

    // 初始化
    document.addEventListener('DOMContentLoaded', function () {
        // 綁定 index.html 裡已有的按鈕
        document.querySelectorAll('.device-btn[data-device]').forEach(btn => {
            btn.addEventListener('click', function () {
                window.setDevice(this.dataset.device);
            });
        });

        // 套用初始裝置
        applyDevice(detectDevice());
    });

    // resize 自動偵測（僅在無手動偏好時生效）
    let resizeTimer;
    window.addEventListener('resize', function () {
        if (localStorage.getItem('devicePreference')) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            applyDevice(detectDevice());
        }, 300);
    });
})();
