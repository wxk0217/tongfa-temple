/**
 * 裝置版本切換系統
 * 允許用戶在 Desktop / Tablet / Mobile 間切換
 */

class DeviceSwitcher {
    constructor() {
        this.userPreference = localStorage.getItem('devicePreference');
        this.actualDevice = this.detectActualDevice();
        this.currentMode = this.userPreference || this.actualDevice;
        this.init();
    }

    detectActualDevice() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1200) return 'tablet';
        return 'desktop';
    }

    init() {
        document.documentElement.setAttribute('data-device', this.currentMode);
        this.createSwitcher();
        window.addEventListener('resize', () => this.onResize());
    }

    createSwitcher() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const switcherHTML = `
            <div class="device-switcher">
                <button class="device-btn" data-device="desktop" title="電腦版">
                    <i class="fas fa-desktop"></i>
                </button>
                <button class="device-btn" data-device="tablet" title="平板版">
                    <i class="fas fa-tablet-alt"></i>
                </button>
                <button class="device-btn" data-device="mobile" title="手機版">
                    <i class="fas fa-mobile-alt"></i>
                </button>
            </div>
        `;

        nav.insertAdjacentHTML('beforeend', switcherHTML);

        // 設置活動按鈕
        this.updateSwitcherUI();

        // 添加事件監聽
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const device = e.currentTarget.dataset.device;
                this.switchToDevice(device);
            });
        });
    }

    switchToDevice(device) {
        this.currentMode = device;
        localStorage.setItem('devicePreference', device);
        document.documentElement.setAttribute('data-device', device);
        this.updateSwitcherUI();
        this.onDeviceSwitch();
    }

    updateSwitcherUI() {
        document.querySelectorAll('.device-btn').forEach(btn => {
            if (btn.dataset.device === this.currentMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    onResize() {
        // 只有在用戶沒有手動選擇時才自動調整
        if (!this.userPreference) {
            const newDevice = this.detectActualDevice();
            if (newDevice !== this.currentMode) {
                this.currentMode = newDevice;
                document.documentElement.setAttribute('data-device', newDevice);
                this.updateSwitcherUI();
                this.onDeviceSwitch();
            }
        }
    }

    onDeviceSwitch() {
        // 重新初始化書籍
        if (window.initBook) {
            window.initBook();
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new DeviceSwitcher();
});
