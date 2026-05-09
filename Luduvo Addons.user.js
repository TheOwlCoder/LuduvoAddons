// ==UserScript==
// @name         Luduvo Addons
// @namespace    http://luduvo.com/
// @version      2026-05-09
// @description  Adds quality-of-life addons to the Luduvo website. You can use the built-in addons, or load/make your own!
// @author       OwlsssDev
// @match        https://*.luduvo.com/*
// @icon         https://luduvo-addons.owlsss.dev/Luduvo%20Addons.png
// @grant        none
// ==/UserScript==




/* COMPONENTS */
class Dialog {
    constructor(title, description = "", confirmText = "Confirm") {
        this.title = title, this.description = description, this.confirmText = confirmText;
    }
    content = "";
    onShow = async ()=>{};
    onClose = async ()=>{};
    onConfirm = async ()=>{};
    async show() {
        const dialog = document.createElement("div");
        this.dialog = dialog;
        const dialogCover = document.createElement("div");
        dialogCover.classList = "luduvoDialogCover"
        dialog.setAttribute("data-state", "open")
        dialog.setAttribute("role", "dialog")
        dialog.setAttribute("tabindex", "-1")
        dialog.classList = "luduvoDialog";
        dialog.innerHTML = `<div class="flex flex-col gap-2 text-center sm:text-left">
        <h2 role="title" class="text-lg leading-none font-semibold">${this.title}</h2>
        <p role="description" class="text-muted-foreground text-sm">${this.description}</p>
        </div>
        <div class="space-y-4">
            ${this.content}
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button role="cancelButton" class="luduvoButton" data-slot="dialog-close">${this.confirmText ? "Cancel" : "Okay"}</button>
            ${this.confirmText ? `<button role="confirmButton" class="luduvoButton red" data-slot="dialog-close">${this.confirmText}</button>` : ""}
        </div>
        <button type="button" data-slot="dialog-close" class="close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-x "><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg><span class="sr-only">Close</span></button>`;
        if (this.confirmText) dialog.querySelector(`[role="confirmButton"]`).addEventListener("click", this.onConfirm);
        dialog.querySelectorAll(`[data-slot="dialog-close"]`).forEach(i => {
            i.onclick = e => {
                dialog.setAttribute("data-state", "closed");
                this.onClose();
                setTimeout(e => {
                    dialogCover.remove();
                }, 220);
            }
        });
        this.onShow();
        document.body.appendChild(dialogCover);
        dialogCover.appendChild(dialog);
    }
};




const addons = {
    addonsList: JSON.parse(localStorage.getItem("addonSettings")),
    registerAddon: function (name, id, description = "", custom, settings, authors) {
        console.log(settings, id)
        if (!ui.inSandbox) { throw new Error("This function is only available to the extension."); return 0; }
        const pluginContainer = document.createElement("div");
        pluginContainer.className = "flex items-center justify-between";
        pluginContainer.innerHTML = `
            <div>
                <b>${name.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("[BETA]", `<span style="color: #ffad55; padding: 0 7px;">BETA</span>`)}${custom ? `<span style="color: #55FF55; padding: 0 7px;">EXT</span>` : ""}</b><br>
                <span class="opacity-60">
                    ${description.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}
                    ${authors ? "<br>Authors: " + authors.map(r => `<b>${r}</b>`).join(", ") : ""}
                </span>
            </div>
            <div>
                <button class="luduvoButton" role="settingsButton ${id}" ${settings && addons.addonIsEnabled(id) ? "" : "disabled"}>Settings</button>
                <button class="luduvoButton" role="addonButton" style="width: 5rem">${addons.addonsList[id] ? "Enabled" : "Disabled"}</button>
            </div>
        `;
        const btn = pluginContainer.querySelector(`[role="addonButton"]`);
        btn.addEventListener("click", e => {
            if (custom && e.shiftKey) {
                e.preventDefault();
                const customAddons = JSON.parse(localStorage.getItem("customAddons"));
                delete customAddons[id];
                delete localStorage[id + "JS"]
                localStorage.setItem("customAddons", JSON.stringify(customAddons));
                pluginContainer.remove();
                return 0;
            }
            addons.addonsList = JSON.parse(localStorage.getItem("addonSettings"));
            addons.addonsList[id] = !addons.addonsList[id];
            btn.innerText = addons.addonsList[id] ? "Enabled" : "Disabled";
            localStorage.setItem("addonSettings", JSON.stringify(addons.addonsList));
        });
        if (custom) {
            btn.addEventListener("mouseenter", e => {
                if (e.shiftKey) {
                    btn.classList.add("red");
                    btn.innerHTML = "Delete";
                }
            })
            btn.addEventListener("mouseleave", e => {
                btn.classList.remove("red");
                btn.innerText = addons.addonsList[id] ? "Enabled" : "Disabled";
            })
        }
        document.querySelector("#addonsContainer").appendChild(pluginContainer);
    },
    registerSettings: (id, callback) => {
        addons.navigationAddon("/addons", async e => {
            await ui.waitForElement(`[role="settingsButton ${id}"]`)
            const button = ui.main.querySelector(`[role="settingsButton ${id}"]`);
            console.log(button)
            button.addEventListener("click", async e => {
                const settingsDialog = new Dialog("Addon Settings", "", "Save");
                await callback(settingsDialog);
                settingsDialog.show();
            });
        })
    },
    addonIsEnabled: (id) => {
        return JSON.parse(localStorage.getItem("addonSettings"))[id]
    },
    navigationAddon: (path, onNavigate, onAway, waitForMainLoad = true, delay = 400) => {
        onAway = onAway || (() => { });
        let wasLoaded = false;
        async function check() {
            if (path.includes("*")) {
                const [start, end] = path.split("*");
                if (location.pathname.startsWith(start) && location.pathname.endsWith(end)) {
                    if (waitForMainLoad && !document.querySelector("main")) {
                        await ui.waitForElement("main");
                        ui.main = document.querySelector("main");
                        wasLoaded = true;
                        await onNavigate({ url: location.pathname.split("/") });
                    } else {
                        ui.main = document.querySelector("main");
                        wasLoaded = true;
                        await onNavigate({ url: location.pathname.split("/") });
                    }
                }
            } else if (location.pathname == path) {
                if (waitForMainLoad && !document.querySelector("main")) {
                    await ui.waitForElement("main")
                    ui.main = document.querySelector("main");
                    wasLoaded = true;
                    await onNavigate({ url: location.pathname.split("/") });
                } else {
                    ui.main = document.querySelector("main");
                    wasLoaded = true;
                    await onNavigate({ url: location.pathname.split("/") });
                }
            } else {
                if (wasLoaded) {
                    try {
                        await onAway({ url: location.pathname.split("/") });
                    } catch (e) { }
                    wasLoaded = false;
                }
            }
        }
        check();
        navigation.addEventListener("navigate", async (event) => {
            setTimeout(async () => {
                await check();
            }, delay || 400)
        });
    },
    pageLoadAddon: async (onLoad) => {
        (async () => {
            await ui.waitForElement("main");
            ui.main = document.querySelector(selector);
            ui.main.innerHTML = html;
            await onLoad({ url: location.pathname.split("/") });
        })
    }
}
const ui = {
    waitForElement: (selector) => {
        return new Promise(resolve => {
            if (document.querySelector(selector)) return resolve(document.querySelector(selector));
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    },
    setPageContent: function (html) {
        if (document.querySelector("main")) {
            ui.main = document.querySelector("main");
            document.querySelector("main").classList = "";
            document.querySelector("main").innerHTML = html;
            ui.main.classList = "relative w-full h-full overflow-hidden";
            return document.querySelector("main");
        }
    },
    setPageContentAsync: async html => { // this is probably useful idk
        await ui.waitForElement("main");
        ui.main = document.querySelector("main");
        ui.setPageContent(html)
        return ui.main
    }
}

const loadObserver = new MutationObserver((mutations, obs) => {
    if (!ui.main) {
        const main = document.querySelector("main");
        if (main) ui.main = main;
    }

    if (!ui.topNavButtons) {
        const tailwind = '.bg-transparent.border-none.shadow-none.h-full.hidden.sm\\:flex.items-center.gap-2.transition-all.duration-300.ease-in-out.opacity-100.pointer-events-auto.scale-100';
        const nav = document.querySelector(tailwind);
        if (nav) {
            ui.topNavButtons = nav
            ui.topNav = nav.parentElement.parentElement.parentElement;
        };
    }

    if (ui.main && ui.topNavButtons && ui.topNav) {
        obs.disconnect();
        console.log(`UI Elements loaded (${ui.inSandbox ? "sandboxed" : "web"})`);
    }
});

loadObserver.observe(document, {
    childList: true,
    subtree: true
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

(async () => {
    window.currentUserData = await fetch("https://api.luduvo.com/me/profile", {
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9,hy;q=0.8",
            "authorization": `Bearer ${getCookie("sessionToken")}`
        },
        method: "GET",
        mode: "cors",
    }).then(r => r.json())
})()
window.addons = addons;
window.ui = ui;




const buttonsCSS = document.createElement("style");
const dialogCSS = document.createElement("style");
const textareaCSS = document.createElement("style");
buttonsCSS.innerHTML = `/* Converted from dirty, disgusting, Taiwind */ @supports (corner-shape:superellipse(1.2)) { .luduvoButton { corner-shape: superellipse(1.7) !important; border-radius: 24px !important; } } .luduvoButton { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; height: 2rem; padding: 0 0.75rem; white-space: nowrap; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; background-color: var(--background); border: 1px solid var(--border); box-shadow: var(--shadow-xs); outline: none; transition: all 0.2s cubic-bezier(0.86, 0.05, 0.16, 0.97); } .luduvoButton:active { transform: scale(0.95); } .luduvoButton:hover { background-color: var(--accent); color: var(--accent-foreground); } .luduvoButton.red:hover { background-color: #b30c2b; color: rgb(203, 203, 203); } .luduvoButton:disabled { pointer-events: none; opacity: 0.5; } .luduvoButton:focus-visible { border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 50%, transparent); } .luduvoButton[aria-invalid="true"] { border-color: var(--destructive); box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive) 20%, transparent); } .luduvoButton.red { background: #D20A2E; border: 1px transparent; } @media (prefers-color-scheme: dark) { .luduvoButton { background-color: color-mix(in srgb, var(--input) 30%, transparent); border-color: var(--input); } .luduvoButton:hover { background-color: color-mix(in srgb, var(--input) 50%, transparent); } .luduvoButton[aria-invalid="true"] { box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive) 40%, transparent); } }`
dialogCSS.innerHTML = `.luduvoDialog { position: fixed; top: 50%; left: 50%; z-index: 50; display: grid; grid-template-columns: minmax(0, 1fr); width: calc(100% - 2rem); max-width: 32rem; transform: translate(-50%, -50%); gap: 1rem; border: 1px solid var(--border); background-color: var(--background); padding: 1.5rem; box-shadow: var(--shadow-lg); border-radius: var(--radius); transition-duration: 200ms; transition-timing-function: cubic-bezier(.86, .05, .16, .97); } .luduvoDialog[data-state='open'] { animation: luduvo-in 200ms cubic-bezier(.86, .05, .16, .97); } .luduvoDialog[data-state='closed'] { animation: luduvo-out 200ms cubic-bezier(.86, .05, .16, .97); } .luduvoDialog>.close { position: absolute; top: 1rem; right: 1rem; border-radius: 0.125rem; opacity: 0.7; transition: opacity 0.2s ease; outline: none; } .luduvoDialog>.close:hover { opacity: 1; } .luduvoDialog>.close:focus { outline: none; box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring); } .luduvoDialog>.close[data-state='open'] { background-color: var(--accent); color: var(--muted-foreground); } .luduvoDialog>.close:disabled { pointer-events: none; } .luduvoDialog>.close svg { pointer-events: none; flex-shrink: 0; } .luduvoDialog>.close svg:not([class*='size-']) { width: 1rem; height: 1rem; } .luduvoDialogCover { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.235); transition: 200ms; } @keyframes luduvo-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95) translateY(25%); } to { opacity: 1; transform: translate(-50%, -50%) scale(1) translateY(0); } } @keyframes luduvo-out { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(1.1); } }`
textareaCSS.innerHTML = `.luduvoTextarea { display: flex; width: 100%; max-width: 100%; box-sizing: border-box; min-width: 0; min-height: 4rem; field-sizing: content; border-radius: 0.375rem; border: 1px solid var(--input); background-color: transparent; padding: 0.5rem 0.75rem; font-size: 1rem; box-shadow: var(--shadow-xs); transition: color 0.2s, box-shadow 0.2s; outline: none; resize: vertical; } input.luduvoTextarea { min-height: 1rem; } .luduvoTextarea::placeholder { color: var(--muted-foreground); } .luduvoTextarea:focus-visible { border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring) 50%, transparent); } .luduvoTextarea:disabled { cursor: not-allowed; opacity: 0.5; } .luduvoTextarea[aria-invalid="true"] { border-color: var(--destructive); } .luduvoTextarea[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive) 20%, transparent); } @media (min-width: 768px) { .luduvoTextarea { font-size: 0.875rem; } } @media (prefers-color-scheme: dark) { .luduvoTextarea { background-color: color-mix(in srgb, var(--input) 30%, transparent); } .luduvoTextarea[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--destructive) 40%, transparent); } }`
document.body.appendChild(buttonsCSS);
document.body.appendChild(dialogCSS);
document.body.appendChild(textareaCSS);


async function onLoad() {
    const addonsButton = document.createElement("a");
    ui.inSandbox = true;
    try {
        addonsButton.href = "/addons";
        addonsButton.className = "flex items-center rounded-sm text-base font-medium outline-hidden select-none px-2 py-1";
        addonsButton.innerHTML = `<span class="hidden md:block">Addons</span>`;
        topNavButtons = ui.topNavButtons
        topNavButtons.appendChild(addonsButton);
        Array.from(topNavButtons.children).forEach(e => {
            e.addEventListener("click", e => {
                addonsButton.classList.remove("bg-black/20")
            })
        })
        addonsButton.onclick = (e) => {
            e.preventDefault();
            setTimeout(() => {
                history.pushState({}, "", "/addons");
            }, 100);
        }
    } catch (e) {
        console.error("Dargy hates me:", e);
        topNavButtons = null;
    }

    async function loadAddonsUI() {
        if (topNavButtons) Array.from(topNavButtons.children).forEach(e => {
            e.classList.remove("bg-black/20")
        })
        addonsButton.classList.add("bg-black/20");
        document.title = "Addons - Luduvo";
        await ui.setPageContentAsync(`
            <div class="container xl:px-16 px-4 md:mx-auto py-12 flex flex-col gap-8">
                <h1 style="display: flex; align-items: center;" class="text-3xl md:text-5xl font-bold">Luduvo Addons Beta <button id="loadExternal" class="luduvoButton red" style="margin-left: 25px; margin-top: 8px;">Load External</button></h1>
                <p>You are using the <b>USERSCRIPT</b> version of Luduvo Addons. Version 1.2</p>
                <div id="addonsContainer">
                </div>
                <p style="color: var(--muted-foreground);">Addon created with &#10084;&#65039; by <a class="btLink" href="/profile/47">owl</a> and the community. Join the <a class="btLink" href="https://discord.gg/TBZacaR2Hd">Discord server</a>! Look at the <a class="btLink" href="https://github.com/TheOwlCoder/LuduvoAddons">GitHub repo</a>!</p>
            </div>
            <style> a.btLink{text-decoration: underline; transition: 200ms; cursor: pointer;} a.btLink:hover{color: var(--foreground) !important; opacity: 100% !important;}
        `);
        ui.main.querySelector("#loadExternal").addEventListener("click", async e => {
            const leDialog = new Dialog("Load External Addon", "Insert the URL of an external addon's manifest.json", "Load");
            leDialog.content = `
                <p class="text-sm font-medium">Addon URL</p>
                <p class="text-xs text-muted-foreground">The URL to install the addon from. Does not have to start with "https://".</p>
                <input data-slot="textarea" class="luduvoTextarea" placeholder="https://example.com/plugin/"></input></div>
            `;
            leDialog.onConfirm = async () => {
                const confirmDialog = new Dialog("Are you sure?", "Do you trust this addon?");
                confirmDialog.content = `
                    <p>You are adding a custom addon that will execute arbritary code and may change how the website looks and acts.</p>
                    <p>Are you sure you want to install this addon?</p>
                `
                confirmDialog.onConfirm = async () => {
                    const value = leDialog.dialog.querySelector(".luduvoTextarea").value;
                    const url = (value.startsWith("https://") || value.startsWith("data:")) ? value : "https://" + value;
                    const manifest = await fetch(url + (!url.endsWith("/") ? "/" : "") + "manifest.json").then(r => r.json());
                    const js = await fetch(url + (!url.endsWith("/") ? "/" : "") + manifest.js).then(r => r.text());
                    const customAddons = JSON.parse(localStorage.getItem("customAddons"));
                    customAddons[manifest.id] = { name: manifest.name, authors: manifest.authors, description: manifest.description, settings: manifest.settings || false };
                    addons.registerAddon(manifest.name, manifest.id, manifest.description, true, manifest.settings, manifest.authors);
                    localStorage.setItem("customAddons", JSON.stringify(customAddons));
                    localStorage.setItem(manifest.id + "JS", js);
                    console.log(url, manifest);
                };
                confirmDialog.show();
            }
            leDialog.show();
        })

        addons.registerAddon("No Subscriptions", "noSub", "Removes annoying subscription-only menus and advertisements.");
        addons.registerAddon("UI Fixes", "uiFix", "Fixes broken or odd UI styling.");
        addons.registerAddon("Select Anything", "selAll", "Makes all text selectable.");
        addons.registerAddon("Inbox Categories", "ibCat", "Sorts your inbox notifications into categories.");
        addons.registerAddon("Lunes to Money", "lunes2USD", "Displays how much an item costs in your currency.", false, true);
        addons.registerAddon("Theming", "theming", "Allows advanced customization of the website's appearance.", false, true, ["matt"]);
        // FOR DEVELOPERS: It is recommended you clone this repo and develop your addon ins /plugins/test.js instead of loading it each update.
        // addons.registerAddon("My addon", "test", "my description");

        const customAddons = JSON.parse(localStorage.getItem("customAddons"));
        Object.keys(customAddons).forEach(id => {
            const addonData = customAddons[id];
            addons.registerAddon(addonData.name, id, addonData.description, true, addonData.settings, addonData.authors);
        })

    }
    addons.navigationAddon("/addons", loadAddonsUI, () => { addonsButton.classList.remove("bg-black/20") });

    if (localStorage.getItem("readLANotice") !== "1") {
        const laNotice = new Dialog("Luduvo Addons", "Thank you for trying Luduvo Addons", "");
        laNotice.content = "<p>Thank you for trying Luduvo Addons Beta.<br>Remember that this extension is still in beta, and was made in one week and as such you will likely encounter bugs. Report them in the Discord server or GitHub repo!</p>";
        localStorage.setItem("readLANotice", "1");
        laNotice.show();
    }
}
localStorage.setItem("addonSettings", localStorage.getItem("addonSettings") || "{}")
localStorage.setItem("customAddons", localStorage.getItem("customAddons") || "{}")


const observer = new MutationObserver((mutations, obs) => {
    if (document.querySelector("main")) {
        onLoad();
        observer.disconnect();
    }
})

observer.observe(document, {
    childList: true,
    subtree: true
});




/* CUSTOM */
(function () {
    const loadListener = setInterval(e => {
        if (document.querySelector("main")) {
            clearInterval(loadListener);
            // ui.main = document.querySelector("main");
            const customAddons = JSON.parse(localStorage.getItem("customAddons"));
            Object.keys(customAddons).forEach(id => {
                if (addons.addonIsEnabled(id)) {
                    Function(localStorage.getItem(`${id}JS`))();
                }
            })
        }
    }, 20)
})()




/* INBOX CATEGORIES */
if (addons.addonIsEnabled("ibCat")) {
    // console.log("load3wesknfnvwuj")
    const observer = new MutationObserver(() => {
        const popover = document.querySelector('[data-slot="popover-content"]');
        if (!popover || popover.getAttribute("loaded")) return;
        if (!popover.firstChild.firstChild.innerText.includes("Inbox")) return;

        const listCon = popover.querySelector('.space-y-2');
        if (!listCon || listCon.children.length === 0) return;

        popover.setAttribute("loaded", "true");
        popover.style.width = "22rem";

        const categories = { friendRequests: [], itemApproveds: [], others: [] };

        Array.from(listCon.children).forEach(card => {
            const title = card.querySelector('[data-slot="card-title"]')?.textContent || "";
            const desc = card.querySelector('[data-slot="card-description"]')?.textContent || "";

            if (title.includes("Item approved")) {
                categories.itemApproveds.push(card);
            } else if (desc.includes("sent you a friend request")) {
                categories.friendRequests.push(card);
            } else {
                categories.others.push(card);
            }
        });

        const uiWrapper = document.createElement('div');
        uiWrapper.innerHTML = `
            <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                <button class="luduvoButton" cat="fr">Friend Requests</button>
                <button class="luduvoButton" cat="ia">Item Approvals</button>
                <button class="luduvoButton" cat="ot">Other</button>
            </div>
        `;

        listCon.prepend(uiWrapper);

        const loadCat = (type) => {
            categories.friendRequests.forEach(el => el.style.display = (type === 'fr' ? 'flex' : 'none'));
            categories.itemApproveds.forEach(el => el.style.display = (type === 'ia' ? 'flex' : 'none'));
            categories.others.forEach(el => el.style.display = (type === 'ot' ? 'flex' : 'none'));
        };

        uiWrapper.addEventListener('click', (e) => {
            const cat = e.target.getAttribute('cat');
            if (cat) loadCat(cat);
        });

        loadCat('fr');
    });

    observer.observe(document.body, { childList: true, subtree: true });
}




/* NO SUBSCRIPTIONS */
if (addons.addonIsEnabled("noSub")) {
    addons.navigationAddon("/profile/*", () => {
        const obs = new MutationObserver((mutations, obs) => {
            if (document.querySelectorAll(".space-y-6.flex.flex-col>.flex.flex-col").length > 1) {
                Array.from(document.querySelector(".space-y-6.flex.flex-col").children).forEach((e, i) => {
                    if (i <= 3) {
                        e.remove();
                    }
                })
            }
        });

        obs.observe(document, {
            childList: true,
            subtree: true
        });
    }, () => { })
}




/* UI FIX */
if (addons.addonIsEnabled("uiFix")) {
    let interval = null;
    addons.navigationAddon("/groups/*", () => {
        interval = setInterval(e => {
            if (document.querySelector(".text-md.text-muted-foreground.mt-2")) {
                document.querySelector(".text-md.text-muted-foreground.mt-2").style.maxWidth = "55%";
            }
        }, 20)
    }, () => { clearInterval(interval) });
    addons.navigationAddon("/*", () => {

    })
    addons.navigationAddon("/studio", () => {
        document.querySelector(".hidden.md\\:block.py-2.h-full.w-auto.text-current").style.fill = "#1a1a1a";
    }, () => { try { document.querySelector(".hidden.md\\:block.py-2.h-full.w-auto.text-current").style.fill = "white"; } catch (e) { } }, false, 0)
}

if (addons.addonIsEnabled("selAll")) {
    const selAll = document.createElement("style");
    selAll.innerHTML = "* { user-select: text !important; }";
    document.body.appendChild(selAll)
}

if (addons.addonIsEnabled("lunes2USD")) {
    addons.registerSettings("lunes2USD", (dialog) => {
        dialog.content = `
            <p>Currency</p>
            <input name="currency" class="luduvoTextarea">
            <p style="color: red; display: none" name="warn">Invalid currency.</p>
        `;
        dialog.onShow = () => {
            dialog.dialog.querySelector(`[name="currency"]`).value = localStorage.getItem("l2currency") || "USD";
        }
        dialog.onConfirm = async () => {
            const currency = dialog.dialog.querySelector(`[name="currency"]`).value.toUpperCase();
            const conversion = await fetch(`https://api.frankfurter.dev/v2/rates?base=USD&quotes=${currency}`).then(r => r.json());
            if (conversion.status) {
                dialog.show();
                dialog.dialog.querySelector(`[name="warn"]`).style.display = "block";
                dialog.dialog.querySelector(`[name="currency"]`).value = currency;
            } else {
                localStorage.setItem("l2currency", currency)
            }
        }
    });
    let observer;
    let conversion;
    let symbol = "$";
    addons.navigationAddon("/marketplace", async () => {
        if ((localStorage.getItem("l2currency") || "USD") != "USD") {
            conversion = await fetch(`https://api.frankfurter.dev/v2/rates?base=USD&quotes=${localStorage.getItem("l2currency")}`).then(r => r.json());
            symbol = await fetch(`https://api.frankfurter.dev/v2/currency/${localStorage.getItem("l2currency")}`).then(r => r.json()).then(r=>r.symbol);
        }
        async function convertPrice(card, index) {
            if (index == 0 || card.getAttribute("priced")) return 0;
            try {
                const span = document.createElement("span");
                const dot = document.createElement("span");
                dot.classList = "mx-1";
                dot.innerHTML = "•";
                if ((localStorage.getItem("l2currency") || "USD") == "USD") {
                    console.log("usfd")
                    span.innerText = " $" + (Number(card.children[1].children[1].children[3].innerText) * 0.01).toFixed(2);
                } else {
                    span.innerText = " " + symbol  + (Number(card.children[1].children[1].children[3].innerText) * 0.01 * conversion[0].rate).toFixed(2);
                }
                card.children[1].children[1].appendChild(dot)
                card.children[1].children[1].appendChild(span);
                card.setAttribute("priced", "true")
            } catch (e) {

            }
        }
        async function convertNavPrice() {
            const nav = document.querySelector("nav");
            if (!nav) return;

            const lunesTextEl = Array.from(nav.querySelectorAll("span"))
                .find(span =>
                    Array.from(span.parentElement.querySelectorAll("div"))
                        .some(div => div.querySelector("svg"))
                );

            if (!lunesTextEl || lunesTextEl?.dataset.converted) return;
            lunesTextEl.dataset.converted = "true";

            const span = document.createElement("span");
            if (localStorage.getItem("l2currency") || "USD" == "USD") {
                span.innerText = " $" + (Number(lunesTextEl.textContent)).toFixed(2);
            } else {
                span.innerText = " " + symbol + (Number(lunesTextEl.textContent) * conversion[0].rate).toFixed(2);
            }

            lunesTextEl.appendChild(span);
        }
        observer = new MutationObserver((e) => {
            convertNavPrice()
            document.querySelectorAll('[data-slot="card"]').forEach(convertPrice);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }, () => { observer.disconnect() }, false)
}




/* THEMING */
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
    },
    {
        id: "compact-nav",
        name: "Compact navbar",
        description: "Reduces the size of the top navbar.",
        css: `header {
    height: auto;
    isolation: isolate;
}

nav {
    padding: 1px;
    padding-left: 8px;
    align-items: center;
}

nav div {
    align-items: center;
}

nav>div:first-child>div {
    min-width: 0;
}

nav>div:first-child a {
    min-width: 0;
}

[class="flex flex-row items-center gap-4"] {
    gap: 0;
}

@media (min-width: 768px) {
    nav a svg:first-of-type {
        min-width: 120px;
    }

    [class="flex flex-row items-center gap-4"] {
        gap: 10px;
    }
}

div[class*="h-16 w-full"] {
    height: 45px;
}`
    },
    {
        id: "compact-profile",
        name: "Compact profiles",
        description: "Reduces the size of profile cards.",
        css: `[class="rounded-lg profile-accent-bg p-8 flex flex-col justify-center items-start gap-2"] {
  padding: 0;
  overflow: hidden;
}

[class="cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ease-[cubic-bezier(.86,.05,.16,.97)] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 shrink-0"] {
  margin-right: 10px;
}

div.profile-accent-bg [data-slot="avatar"],
div.profile-accent-bg [data-slot="avatar-image"] {
    border-radius: 0 !important;
}`
    },
    {
        id: "compact-friends",
        name: "Compact friends",
        description: "Reduces the size of friend cards.",
        css: `@layer utilities {
  button[data-slot="button"].\\!p-4 {
    padding: 0 !important;
    overflow: hidden;
  }
}

button[data-slot="button"] [data-slot="avatar"],
button[data-slot="button"] [data-slot="avatar"] img {
  border-radius: 0px;
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
        min-width: 0;
    }

    #editorcontainer {
        flex-grow: 1;
        border: 1px solid #444;
        border-radius: 8px;
        overflow: hidden;
        background-color: #282c34;
        font-family: 'JetBrains Mono', monospace;
        min-width: 0;
    }

    .cm-editor {
        height: 100% !important;
        min-width: 0;
        max-width: 100%;
    }
    .cm-scroller { overflow: auto; }

    .themeeditor {
        display: flex;
        gap: 1rem;
        flex: 1;
        min-height: 0;
        min-width: 0;
    }
    .presetpanel {
        width: 18rem;
        min-width: 16rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid #444;
        border-radius: 0.75rem;
        padding: 1rem;
        box-sizing: border-box;
        height: 100%;
        min-height: 0;
        overflow: auto;
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
        min-width: 0;
        overflow: hidden;
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
    const bundle = await import("https://rawcdn.githack.com/TheOwlCoder/LuduvoAddons/refs/heads/main/common/codemirror/main.js");
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
}