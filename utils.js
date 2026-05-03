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
            const a = setInterval(() => {
                const button = ui.main.querySelector(`[role="settingsButton ${id}"]`);
                if (button) {
                    button.addEventListener("click", async e => {
                        const settingsDialog = new Dialog("Addon Settings", "", "Save");
                        await callback(settingsDialog);
                        settingsDialog.show();
                    });
                    clearInterval(a);
                }
            }, 20);
        });
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
                        addons.pageLoadAddon(async () => { await onNavigate({ url: location.pathname.split("/") }); })
                    } else {
                        await onNavigate({ url: location.pathname.split("/") });
                    }
                }
            } else if (location.pathname == path) {
                if (waitForMainLoad && !document.querySelector("main")) {
                    addons.pageLoadAddon(async () => { await onNavigate({ url: location.pathname.split("/") }); })
                } else {
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
            return document.querySelector("main");
        }
    },
    setPageContentAsync: async html => { // this is probably useful idk
        await ui.waitForElement("main");
        ui.main = document.querySelector(selector);
        ui.main.innerHTML = html;
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

(async () => {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
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
