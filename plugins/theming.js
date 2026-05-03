var theme = "";
var initialTheme = `/* Edit, but don't delete or rename this. This is a Luduvo theme declaration. */
/* This declaration is always applied as the class .customTheme, and will break if you rename it. */
/* You can add any custom CSS declarations you'd like after this theme declaration. */
.customTheme {
  --background: #0a0a0a;
  --background-rgb: 14, 10, 18;
  --foreground: #f9f9f9;
  --card: #111111;
  --card-foreground: #f9f9f9;
  --popover: #111111;
  --popover-foreground: #f9f9f9;
  --primary: #d20a2e;
  --primary-foreground: #ffffff;
  --secondary: #d3425c;
  --secondary-foreground: #000000;
  --muted: #232323;
  --muted-foreground: #acacac;
  --accent: #393939;
  --accent-foreground: #f9f9f9;
  --destructive: #e53e3e;
  --warning: #f97316;
  --success: #34d399;
  --border: #1d1d1d;
  --input: #474747;
  --ring: #868685;
  --chart-1: #2a7fff;
  --chart-2: #5f9ea0;
  --chart-3: #34d399;
  --chart-4: #f97316;
  --chart-5: #a855f7;
  --sidebar: #2d3748;
  --sidebar-foreground: #f7fafc;
  --sidebar-primary: #2a7fff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #4a5568;
  --sidebar-accent-foreground: #f7fafc;
  --sidebar-border: #4a5568;
  --sidebar-ring: #2a7fff;
  --destructive-foreground: #ffffff;
  --warning-foreground: #ffffff;
  --success-foreground: #ffffff;
  --radius: 0.85rem;
  --font-sans: Titillium Web;
  --font-serif: Instrument Serif, ui-serif, serif;
  --font-mono: IBM Plex Mono, ui-monospace, monospace;
  --shadow-color: #000000;
  --shadow-opacity: 0;
  --shadow-blur: 0px;
  --shadow-spread: 0px;
  --shadow-offset-x: 0px;
  --shadow-offset-y: 5px;
  --letter-spacing: normal;
  --spacing: 0.24rem;
  --shadow-2xs: 0px 5px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-xs: 0px 5px 0px 0px hsl(0 0% 0% / 0.00);
  --shadow-sm: 0px 5px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow: 0px 5px 0px 0px hsl(0 0% 0% / 0.00), 0px 1px 2px -1px hsl(0 0% 0% / 0.00);
  --shadow-md: 0px 5px 0px 0px hsl(0 0% 0% / 0.00), 0px 2px 4px -1px hsl(0 0% 0% / 0.00);
  --shadow-lg: 0px 5px 0px 0px hsl(0 0% 0% / 0.00), 0px 4px 6px -1px hsl(0 0% 0% / 0.00);
  --shadow-xl: 0px 5px 0px 0px hsl(0 0% 0% / 0.00), 0px 8px 10px -1px hsl(0 0% 0% / 0.00);
  --shadow-2xl: 0px 5px 0px 0px hsl(0 0% 0% / 0.00);
  --color-studio: #55ff55;
  --color-studio-foreground: #1a1a1a;
}`;

// load the saved theme orrrrr initialize it
if (!localStorage.getItem("theming.customTheme")) {
    localStorage.setItem("theming.customTheme", initialTheme);
    theme = initialTheme;
} else {
    theme = localStorage.getItem("theming.customTheme");
}

let currentPreviewPresetId = null;
let unsavedChanges = false;
let themeShakeTimeout = null;
let themePathWatcher = null;
const itemsToLock = 'header, footer, [data-slot="dropdown-menu-trigger"]';

function handleUnload(event) {
    if (!unsavedChanges) {
        return;
    }

    event.preventDefault();
    event.returnValue = "";
}

function leaveWarning() {
    window.addEventListener("beforeunload", handleUnload);
}

function noMoreLeaveWarning() {
    window.removeEventListener("beforeunload", handleUnload);
}

function shakeDatThang() {
    const saveButton = document.getElementById("save-theme");
    if (!saveButton) {
        return;
    }

    saveButton.classList.remove("shakedatthang");
    void saveButton.offsetWidth;
    saveButton.classList.add("shakedatthang");

    if (themeShakeTimeout) {
        clearTimeout(themeShakeTimeout);
    }

    themeShakeTimeout = setTimeout(() => {
        saveButton.classList.remove("shakedatthang");
        themeShakeTimeout = null;
    }, 450);
}

function setThemeLock(isLocked) {
    document.querySelectorAll(itemsToLock).forEach(element => {
        element.classList.toggle("themelocked", isLocked);
    });
}

function handleThemeChromeInteraction(event) {
    if (!unsavedChanges) {
        return;
    }

    const blockedElement = event.target.closest(itemsToLock);
    if (!blockedElement) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
    }

    shakeDatThang();
}

function enableThemeLock() {
    document.addEventListener("pointerdown", handleThemeChromeInteraction, true);
    document.addEventListener("click", handleThemeChromeInteraction, true);
}

function disableThemeLock() {
    document.removeEventListener("pointerdown", handleThemeChromeInteraction, true);
    document.removeEventListener("click", handleThemeChromeInteraction, true);
    setThemeLock(false);
}

function cleanupFx() {
    noMoreLeaveWarning();
    disableThemeLock();
    setThemePageDirty(false);
    removeLiveThemeStyle();
    removePreviewThemeStyle();
    savedThemeStyle(theme);
}

function pathWatcher() {
    if (themePathWatcher) {
        clearInterval(themePathWatcher);
    }

    themePathWatcher = setInterval(() => {
        if (location.pathname !== "/theme") {
            stopPathWatcher();
            cleanupFx();
        }
    }, 100);
}

function stopPathWatcher() {
    if (themePathWatcher) {
        clearInterval(themePathWatcher);
        themePathWatcher = null;
    }
}

function setThemePageDirty(isDirty) {
    unsavedChanges = isDirty;
    setThemeLock(isDirty);
}

// ** boring math thanks stackoverflow **
const multiplyMatrices = (A, B) => {
    return [
        A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
        A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
        A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
    ];
};

const oklch2oklab = ([l, c, h]) => [
    l,
    isNaN(h) ? 0 : c * Math.cos(h * Math.PI / 180),
    isNaN(h) ? 0 : c * Math.sin(h * Math.PI / 180)
];

const rgb2srgbLinear = rgb => rgb.map(c =>
    Math.abs(c) <= 0.04045
        ? c / 12.92
        : (c < 0 ? -1 : 1) * (((Math.abs(c) + 0.055) / 1.055) ** 2.4)
);

const srgbLinear2rgb = rgb => rgb.map(c =>
    Math.abs(c) > 0.0031308
        ? (c < 0 ? -1 : 1) * (1.055 * (Math.abs(c) ** (1 / 2.4)) - 0.055)
        : 12.92 * c
);

const oklab2xyz = lab => {
    const LMSg = multiplyMatrices([
        1, 0.3963377773761749, 0.2158037573099136,
        1, -0.1055613458156586, -0.0638541728258133,
        1, -0.0894841775298119, -1.2914855480194092,
    ], lab);

    const LMS = LMSg.map(val => val ** 3);

    return multiplyMatrices([
        1.2268798758459243, -0.5578149944602171, 0.2813910456659647,
        -0.0405757452148008, 1.1122868032803170, -0.0717110580655164,
        -0.0763729366746601, -0.4214933324022432, 1.5869240198367816
    ], LMS);
};

const xyz2rgbLinear = xyz => multiplyMatrices([
    3.2409699419045226, -1.537383177570094, -0.4986107602930034,
    -0.9692436362808796, 1.8759675015077202, 0.04155505740717559,
    0.05563007969699366, -0.20397695888897652, 1.0569715142428786
], xyz);

const oklch2rgb = lch =>
    srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(oklch2oklab(lch))));


function oklchToRgbGamutMapped(l, c, h) {
    let low = 0;
    let high = c;
    let mid, rgb;

    for (let i = 0; i < 20; i++) {
        mid = (low + high) / 2;
        rgb = oklch2rgb([l, mid, h]);

        if (rgb.every(v => v >= 0 && v <= 1)) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return oklch2rgb([l, low, h]);
}

function oklchToRgb(l, c, h) {
    const rgb = oklchToRgbGamutMapped(l, c, h);

    return rgb.map(v =>
        Math.round(Math.max(0, Math.min(1, v)) * 255)
    );
}

function oklchToHex(oklchStr) {
    const match = oklchStr.match(/oklch\(([^ ]+) ([^ ]+) ([^ )]+)\)/);
    if (!match) return oklchStr;

    let l = parseFloat(match[1]);
    if (match[1].includes('%')) l /= 100;

    let c = parseFloat(match[2]);

    let h = parseFloat(match[3]);

    const [r, g, b] = oklchToRgb(l, c, h);

    return (
        "#" +
        ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}
// ** end of boring math **

function ensureClass() {
    const html = document.documentElement;
    for (const cls of Array.from(html.classList)) {
        if (cls !== "customTheme" && cls.startsWith("customTheme")) {
            html.classList.remove(cls);
        }
    }
    html.classList.add("customTheme");
}

function themeStyle(id, css) {
    let style = document.getElementById(id);
    if (!style) {
        style = document.createElement("style");
        style.id = id;
        (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = css;
    return style;
}

function removeThemeStyle(id) {
    const style = document.getElementById(id);
    if (style) {
        style.remove();
    }
}

function savedThemeStyle(css) {
    ensureClass();
    themeStyle("saved-theme", css);
}

function liveThemeStyle(css) {
    ensureClass();
    themeStyle("live-theme", css);
}

function removeLiveThemeStyle() {
    removeThemeStyle("live-theme");
}

function previewThemeStyle(css) {
    ensureClass();
    themeStyle("preview-theme", css);
}

function removePreviewThemeStyle() {
    removeThemeStyle("preview-theme");
}

function getLuduvoThemes() {
    const themes = [];
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule.selectorText && rule.selectorText.startsWith('.') && rule.style && rule.style.getPropertyValue('--primary-foreground')) {
                    const selector = rule.selectorText.trim();
                    if (selector !== '.customTheme') { // skip customTheme
                        themes.push({
                            name: selector.slice(1).replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                            selector: selector,
                            css: rule.cssText
                        });
                    }
                }
            }
        } catch (e) {
            // stylesheet can't be accessed
        }
    }
    return themes;
}

const presets = [
    {
        id: "no-roundness",
        name: "Remove roundness",
        description: "Forces 0px radius across the interface.",
        css: `@supports (corner-shape:superellipse(1.2)) {
  .rounded-3xl,
  .rounded-2xl,
  .rounded-xl,
  .rounded-lg,
  .rounded-md {
    corner-shape: square !important;
    border-radius: 0px !important;
  }
}

*, .luduvoButton {
  border-radius: 0px !important;
}`
    }
];

const constantStyle = `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');
    
    .jetbrains {
        font-family: 'JetBrains Mono', monospace !important;
    }

    .theme-page-container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 40px);
        box-sizing: border-box;
    }

    #editorcontainer { 
        flex-grow: 1;
        border: 1px solid #444; 
        border-radius: 8px;
        overflow: hidden;
        background-color: #282c34;
        font-family: 'JetBrains Mono', monospace; 
    }

    .cm-editor { 
        height: 100% !important; 
    }
    .cm-scroller { overflow: auto; }

    .themeeditor {
        display: flex;
        gap: 1rem;
        flex: 1;
        min-height: 0;
    }
    .presetpanel {
        width: 18rem;
        min-width: 16rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid #444;
        border-radius: 0.75rem;
        padding: 1rem;
        overflow: auto;
        max-height: calc(100vh - 100px);
    }
    .presetpanel h3 {
        margin: 0 0 0.75rem;
    }
    .presetcard {
        border: 1px solid #555;
        border-radius: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        background: rgba(0,0,0,0.15);
    }
    .presetcard:last-child {
        margin-bottom: 0;
    }
    .preset-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }
    .presetcard pre {
        white-space: pre-wrap;
        background: rgba(0,0,0,0.2);
        padding: 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        overflow-x: auto;
        max-height: 8rem;
    }
    .editorpanel {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
    .buttoncontainer {
        display: flex;
        gap: 0.75rem;
        padding: 10px 0;
        flex-shrink: 0;
    }
    .buttoncontainer button {
        flex: 1;
    }

    header.themelocked,
    footer.themelocked,
    [data-slot="dropdown-menu-trigger"].themelocked,
    header.themelocked *,
    footer.themelocked *,
    [data-slot="dropdown-menu-trigger"].themelocked * {
        cursor: not-allowed !important;
    }

    .shakedatthang {
        animation: shakedatthang 0.4s ease;
    }

    @keyframes shakedatthang {
        0% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-8px); }
        80% { transform: translateX(8px); }
        100% { transform: translateX(0); }
    }
    </style>
`;

async function initEditor(startingText) {
    const modulePath = chrome.runtime.getURL('common/codemirror/main.js');
    const bundle = await import(modulePath);
    const CM = bundle.default || bundle;

    const jetbrainsTheme = CM.EditorView.theme({
        "&": {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px"
        },
        ".cm-scroller": {
            fontFamily: "'JetBrains Mono', monospace"
        },
        ".cm-gutters": {
            fontFamily: "'JetBrains Mono', monospace"
        }
    });

    const startState = CM.EditorState.create({
        doc: startingText,
        extensions: [
            CM.basicSetup,
            CM.css ? CM.css() : [],
            CM.oneDark,
            CM.color,
            jetbrainsTheme,
            CM.EditorView.updateListener.of(update => {
                if (update.docChanged) {
                    const currentCss = update.state.doc.toString();
                    liveThemeStyle(currentCss);
                    setThemePageDirty(currentCss !== theme);

                    if (currentPreviewPresetId) {
                        const preset = presets.find(p => p.id === currentPreviewPresetId);
                        if (preset) {
                            previewThemeStyle(preset.css);
                        }
                    }
                }
            })
        ]
    });

    const view = new CM.EditorView({
        state: startState,
        parent: document.getElementById("editorcontainer")
    });

    return view;
}

if (addons.addonIsEnabled("theming")) {
    addons.registerSettings("theming", () => {
        location.href = "/theme";
    });

    savedThemeStyle(theme);

    setTimeout(() => {
        addons.navigationAddon("/theme", () => {
            savedThemeStyle(theme);
            liveThemeStyle(theme);
            removePreviewThemeStyle();
            currentPreviewPresetId = null;
            setThemePageDirty(false);
            leaveWarning();
            enableThemeLock();
            pathWatcher();

            ui.setPageContent(constantStyle + `
                <div class="p-4 themepage">
                    <h2 class="text-xl font-bold mb-2">Theme Editor</h2>

                    <div class="themeeditor">
                        <div class="presetpanel">
                            <h3 class="text-lg font-bold">Presets</h3>
                            <div id="preset-list"></div>                            <h3 class=\"text-lg font-bold mt-4\">Luduvo Themes</h3>
                            <div id=\"theme-list\"></div>                        </div>

                        <div class="editorpanel">
                            <div id="editorcontainer"></div>
                            <div class="buttoncontainer">
                                <button class="luduvoButton" id="reset-theme">reset</button>
                                <button class="luduvoButton red" id="save-theme">save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            const saveButton = document.getElementById("save-theme");
            const resetButton = document.getElementById("reset-theme");
            const presetList = document.getElementById("preset-list");
            const themeList = document.getElementById("theme-list");

            function renderPresets(view) {
                presets.forEach(preset => {
                    const card = document.createElement("div");
                    card.className = "presetcard";
                    card.innerHTML = `
                        <div class="font-semibold">${preset.name}</div>
                        <div class="text-xs opacity-70">${preset.description}</div>
                        <pre>${preset.css}</pre>
                        <div class="preset-actions">
                            <button class="luduvoButton" data-action="insert" data-preset-id="${preset.id}">insert</button>
                            <button class="luduvoButton red" data-action="preview" data-preset-id="${preset.id}">preview</button>
                        </div>
                    `;
                    presetList.appendChild(card);
                });

                const luduvoThemes = getLuduvoThemes();
                luduvoThemes.forEach(theme => {
                    const card = document.createElement("div");
                    card.className = "presetcard";
                    card.innerHTML = `
                        <div class="font-semibold">${theme.name}</div>
                        <div class="text-xs opacity-70">Luduvo built-in theme</div>
                        <div class="preset-actions">
                            <button class="luduvoButton" data-action="load-theme" data-theme-selector="${theme.selector}">use as base</button>
                        </div>
                    `;
                    themeList.appendChild(card);
                });

                presetList.addEventListener("click", event => {
                    const button = event.target.closest("button");
                    if (!button) return;
                    const action = button.dataset.action;
                    const presetId = button.dataset.presetId;
                    const preset = presets.find(p => p.id === presetId);
                    if (!preset) return;

                    if (action === "insert") {
                        view.dispatch({
                            changes: {
                                from: view.state.doc.length,
                                to: view.state.doc.length,
                                insert: `\n\n${preset.css}`
                            }
                        });

                        removePreviewThemeStyle();
                        currentPreviewPresetId = null;
                        presetList.querySelectorAll('[data-action="preview"]').forEach(btn => {
                            btn.textContent = "preview";
                        });
                    } else if (action === "preview") {
                        const allPreviewButtons = presetList.querySelectorAll('[data-action="preview"]');

                        allPreviewButtons.forEach(btn => {
                            btn.textContent = "preview";
                        });

                        if (currentPreviewPresetId === presetId) {
                            removePreviewThemeStyle();
                            currentPreviewPresetId = null;
                        } else {
                            previewThemeStyle(preset.css);
                            currentPreviewPresetId = presetId;
                            button.textContent = "stop previewing";
                        }
                    }
                });

                themeList.addEventListener("click", event => {
                    const button = event.target.closest("button");
                    if (!button || button.dataset.action !== "load-theme") return;
                    const themeSelector = button.dataset.themeSelector;
                    const theme = luduvoThemes.find(t => t.selector === themeSelector);
                    if (!theme) return;

                    let newCss = theme.css.replace(new RegExp(`^${theme.selector}`, 'm'), '.customTheme');

                    const selectorMatch = newCss.match(/^[^{]+/);
                    const propertiesMatch = newCss.match(/{[^}]+}/);
                    if (selectorMatch && propertiesMatch) {
                        const selector = selectorMatch[0];
                        const properties = propertiesMatch[0].slice(1, -1).split(';').filter(p => p.trim()).map(p => {
                            const [key, ...valParts] = p.split(':');
                            let value = valParts.join(':').trim();
                            if (value.startsWith('oklch(')) {
                                value = oklchToHex(value);
                            }
                            return key.trim() + ': ' + value;
                        });
                        newCss = selector + ' {\n' + properties.map(p => '  ' + p + ';').join('\n') + '\n}';
                    }
                    view.dispatch({
                        changes: {
                            from: 0,
                            to: view.state.doc.length,
                            insert: newCss
                        }
                    });
                });
            }

            initEditor(theme).then(view => {
                renderPresets(view);

                saveButton.addEventListener("click", () => {
                    const updatedTheme = view.state.doc.toString();
                    localStorage.setItem("theming.customTheme", updatedTheme);
                    theme = updatedTheme;
                    savedThemeStyle(updatedTheme);
                    liveThemeStyle(updatedTheme);
                    removePreviewThemeStyle();
                    currentPreviewPresetId = null;
                    setThemePageDirty(false);

                    presetList.querySelectorAll('[data-action="preview"]').forEach(btn => {
                        btn.textContent = "preview";
                    });

                    saveButton.textContent = "saved";
                    setTimeout(() => {
                        if (document.body.contains(saveButton)) {
                            saveButton.textContent = "save changes";
                        }
                    }, 1200);
                });

                resetButton.addEventListener("click", () => {
                    localStorage.setItem("theming.customTheme", initialTheme);
                    theme = initialTheme;
                    savedThemeStyle(initialTheme);
                    liveThemeStyle(initialTheme);
                    removePreviewThemeStyle();
                    currentPreviewPresetId = null;
                    setThemePageDirty(false);

                    view.dispatch({
                        changes: {
                            from: 0,
                            to: view.state.doc.length,
                            insert: initialTheme
                        }
                    });

                    resetButton.textContent = "reset";
                });

            }).catch(err => {
                console.error("init failed:", err);
            });
        }, () => {
            stopPathWatcher();
            cleanupFx();
        });
    }, 500);
}
