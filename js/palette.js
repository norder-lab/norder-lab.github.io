/**
 * ==========================================================================
 * palette.js
 * Nord Theme 全16色のカラーデータ定義、およびクリップボードコピー処理を担当。
 * ==========================================================================
 */

window.NordPalette = (() => {
    const colors = [
        // Polar Night
        { name: 'nord0', hex: '#2e3440' },
        { name: 'nord1', hex: '#3b4252' },
        { name: 'nord2', hex: '#434c5e' },
        { name: 'nord3', hex: '#4c566a' },
        // Snow Storm
        { name: 'nord4', hex: '#d8dee9' },
        { name: 'nord5', hex: '#e5e9f0' },
        { name: 'nord6', hex: '#eceff4' },
        // Frost
        { name: 'nord7', hex: '#8fbcbb' },
        { name: 'nord8', hex: '#88c0d0' },
        { name: 'nord9', hex: '#81a1c1' },
        { name: 'nord10', hex: '#5e81ac' },
        // Aurora
        { name: 'nord11', hex: '#bf616a' },
        { name: 'nord12', hex: '#d08770' },
        { name: 'nord13', hex: '#ebcb8b' },
        { name: 'nord14', hex: '#a3be8c' },
        { name: 'nord15', hex: '#b48ead' },
    ];

    async function copy(hex) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(hex);
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = hex;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    return { colors, copy };
})();
