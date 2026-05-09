/**
 * lineage.js — 法脈傳承 iframe 切換
 */
const LINEAGE_TABS = ['direct', 'caodong', 'full', 'shouchang', 'biographies'];

function switchLineage(type) {
    LINEAGE_TABS.forEach(t => document.getElementById('btn-' + t)?.classList.remove('active'));
    document.getElementById('btn-' + type)?.classList.add('active');
    const frame = document.getElementById('lineage-frame');
    if (frame) frame.src = `assets/lineage/${type}.html`;
}
