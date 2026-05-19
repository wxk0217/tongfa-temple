// ==========================================================================
// 曹洞正宗通法禪寺志 | 祖師資料庫 v3
// 結構：
//   short   — 法脈圖 hover 懸浮簡介
//   image   — 肖像路徑
//   mdFile  — 完整傳記 md 檔案路徑（null = 不開彈窗）
//   full    — 備援：若 mdFile 讀取失敗才使用
// ==========================================================================

const monkDatabase = {
    "洞山良价": {
        short: "【唐】(807-869) 曹洞宗創始人，提倡「偏正五位」之說，禪風綿密，強調於日常生活中體悟佛法。",
        image: "assets/img/monks/monk_01.jpg",
        mdFile: "docs/monk/洞山良价.md",
        full: null
    },
    "曹山本寂": {
        short: "【唐】(840-901) 與洞山良價共創曹洞宗，將師法加以發揮，詮釋「五位君臣」義理，著述豐富。",
        image: "assets/img/monks/monk_03.webp",
        mdFile: null,
        full: null
    },
    "雲居道膺": {
        short: "【唐】(848-902) 洞山良價之重要法嗣，於江西雲居山真如寺弘法三十餘年，為曹洞宗唐末五代繁衍的關鍵推手。",
        image: "assets/img/monks/monk_02.webp",
        mdFile: "docs/monk/雲居道膺.md",
        full: null
    },
    "芙蓉道楷": {
        short: "【北宋】(1043-1118) 曹洞宗中興之祖，風骨卓絕，曾拒絕宋徽宗賜紫衣而遭貶，使曹洞法脈重振紀律。",
        image: "assets/img/monks/芙蓉道楷.jpg",
        mdFile: "docs/monk/芙蓉道楷.md",
        full: null
    },
    "萬松行秀": {
        short: "【金/元】(1166-1246) 曹洞大宗師，著有《從容錄》，將「默照禪」心法系統化，對後世禪修影響深遠。",
        image: "assets/img/monks/萬松行秀.jpg",
        mdFile: "docs/monk/萬松行秀.md",
        full: null
    },
    "雪庭福裕": {
        short: "【元】(1203-1275) 少林寺曹洞宗初祖，奉詔入主嵩山少林寺，定下「七十字輩」傳承。",
        image: "assets/img/monks/雪庭福裕.jpg",
        mdFile: "docs/monk/雪庭福裕.md",
        full: null
    },
    "無明慧經": {
        short: "【明】(1548-1618) 主持江西壽昌寺，史稱「壽昌中興」，提倡參究話頭與嚴持戒律，重整明末禪風。",
        image: "assets/img/monks/monk_05.webp",
        mdFile: "docs/monk/無明慧經.md",
        full: null
    },
    "永覺元賢": {
        short: "【明/清】(1578-1657) 住持福建鼓山湧泉寺，訂立清規並開創「鼓山法派」，此法脈近代對台灣佛教有深遠影響。",
        image: "assets/img/monks/monk_04.webp",
        mdFile: "docs/monk/永覺元賢.md",
        full: null
    },
    "妙蓮法師": {
        short: "【清】(1824-1907) 曹洞鼓山法派向海外播種的先驅，開創馬來西亞檳城極樂寺，1904年入宮面見光緒皇帝，外號欽命方丈。",
        image: "assets/img/monks/妙蓮法師.jpg",
        mdFile: "docs/monk/妙蓮法師.md",
        full: null
    },
    "本忠和尚": {
        short: "【清/民】(1866-1936) 繼任檳城極樂寺住持，創立「念佛蓮社」，致力於南洋的弘化護教。",
        image: "assets/img/monks/本忠和尚.jpg",
        mdFile: "docs/monk/本忠和尚.md",
        full: null
    },
    "圓瑛大師": {
        short: "【清/民】(1878-1953) 近代高僧，曾任中國佛教會會長，倡導「禪淨雙修」，一生致力講經弘法與培育僧才。",
        image: "assets/img/monks/monk_07.jpg",
        mdFile: "docs/monk/圓瑛大師.md",
        full: null
    },
    "白聖長老": {
        short: "【民】(1904-1989) 來台後創辦佛學院，對台灣佛教傳戒、制度化與國際化貢獻卓著，為台灣當代佛教領袖。",
        image: "assets/img/monks/monk_06.jpg",
        mdFile: "docs/monk/白聖長老.md",
        full: null
    },
    "覺力禪師": {
        short: "【清/民】(1881-1933) 1909年渡海來台，開創「大湖法雲寺派」，為台灣曹洞宗傳承奠定堅實基礎。",
        image: "assets/img/monks/覺力禪師.jpg",
        mdFile: "docs/monk/覺力禪師.md",
        full: null
    },
    "妙振老和尚": {
        short: "【民】通法禪寺首任住持，承覺力禪師法脈，長年持誦法華經，以謙和慈悲著稱，1945年應邀主持通法寺。",
        image: "assets/img/monks/妙振和尚.jpg",
        mdFile: "docs/monk/妙振老和尚.md",
        full: null
    },
    "達能和尚": {
        short: "通法禪寺第二代住持，為妙振老和尚剃度弟子，亦為白聖長老法子，融匯曹洞與臨濟二宗法脈，弘法足跡遍及東南亞。",
        image: "assets/img/monks/達能和尚.jpg",
        mdFile: "docs/monk/達能和尚.md",
        full: null
    },
    "林貴圓居士": {
        short: "【民】(1902-1996) 開山護法居士，購置通法禪寺寺產，邀請妙振老和尚開山主持，親自捐資改建，功德無量。",
        image: "assets/img/monks/林貴圓居士.jpg",
        mdFile: "docs/monk/林貴圓居士.md",
        full: null
    },
    "林和睦居士": {
        short: "通法禪寺第二代監院。",
        image: null,
        mdFile: "docs/monk/林和睦居士.md",
        full: null
    }
};

// ─── 查詢函數（供外部呼叫）────────────────────────────────────────────────
function getMonkData(name) {
    if (!name) return null;

    // 1. 完全符合
    if (monkDatabase[name]) return monkDatabase[name];

    // 2. 移除空格、【】標記、前後綴後比對
    const clean = name.replace(/\s+/g, '').replace(/【[^】]*】/g, '').replace(/(老師|長老|法師|禪師|大師|和尚|居士|老和尚)$/, '');
    for (const key of Object.keys(monkDatabase)) {
        const keyClean = key.replace(/\s+/g, '').replace(/(老師|長老|法師|禪師|大師|和尚|居士|老和尚)$/, '');
        if (keyClean === clean) return monkDatabase[key];
    }

    // 3. 繁簡轉換後比對（价↔價 等常見字）
    const simplify = s => s.replace(/價/g,'价').replace(/師/g,'师').replace(/傳/g,'传');
    const cleanSimp = simplify(clean);
    for (const key of Object.keys(monkDatabase)) {
        const keySimp = simplify(key.replace(/\s+/g, ''));
        if (keySimp === cleanSimp) return monkDatabase[key];
    }

    // 4. 包含匹配（節點名含 key 的核心字）
    for (const key of Object.keys(monkDatabase)) {
        const core = key.replace(/\s+/g, '').replace(/(老師|長老|法師|禪師|大師|和尚|居士|老和尚)$/, '');
        if (core.length >= 2 && clean.includes(core)) return monkDatabase[key];
    }

    return null;
}

// 聯絡地址
const contactAddress = {
    plusCode:  "2GG8+CR",
    region:    "臺北市中正區螢圃里",
    fullLabel: "2GG8+CR 螢圃里 臺北市中正區"
};