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

    const hamburgerObs = new MutationObserver((mutations, obs) => {
        try {
            const hamburger = document.querySelector(".h-full.overflow-y-auto.overscroll-contain>.flex.flex-col.gap-2.px-4.pb-6");
            if (hamburger) {
                if (!hamburger.getAttribute("addonsAdded")) {
                    hamburger.setAttribute("addonsAdded", "true")
                    const addonsItem = document.createElement("a");
                    addonsItem.href = "/addons";
                    addonsItem.classList = "flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors hover:text-accent-foreground"
                    addonsItem.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-user h-5 w-5"> <path d="M 15.822 4.664 C 17.757 3.823 18.726 3.403 19.322 3.592 C 19.838 3.755 20.244 4.161 20.408 4.678 C 20.598 5.275 20.177 6.243 19.336 8.178 L 18.138 10.936 C 17.968 11.328 17.883 11.525 17.849 11.728 C 17.819 11.908 17.819 12.093 17.849 12.273 C 17.883 12.477 17.968 12.673 18.138 13.065 L 19.336 15.823 C 20.177 17.758 20.598 18.727 20.408 19.323 C 20.244 19.839 19.838 20.245 19.322 20.409 C 18.726 20.598 17.757 20.178 15.822 19.337 L 13.064 18.139 C 12.672 17.969 12.476 17.884 12.272 17.85 C 12.092 17.82 11.907 17.82 11.727 17.85 C 11.524 17.884 11.327 17.969 10.935 18.139 L 8.177 19.337 C 6.242 20.178 5.274 20.598 4.677 20.409 C 4.16 20.245 3.754 19.839 3.591 19.323 C 3.401 18.727 3.822 17.758 4.663 15.823 L 5.861 13.065 C 6.031 12.673 6.116 12.477 6.15 12.273 C 6.179 12.093 6.179 11.908 6.15 11.728 C 6.116 11.525 6.031 11.328 5.861 10.936 L 4.663 8.178 C 3.822 6.243 3.402 5.275 3.591 4.678 C 3.754 4.161 4.16 3.755 4.677 3.592 C 5.274 3.403 6.242 3.823 8.177 4.664 L 10.935 5.862 C 11.327 6.032 11.524 6.117 11.727 6.151 C 11.907 6.18 12.092 6.18 12.272 6.151 C 12.476 6.117 12.672 6.032 13.064 5.862 L 15.822 4.664 Z" <path="" fill-rule="evenodd" clip-rule="evenodd" style="stroke-width: 2; transform-origin: 12px 12px;"></path> <g transform="matrix(1, 0, 0, 1, -0.716243, -0.728091)"> <g style="" transform="matrix(0.911248, 0, 0, 0.911248, 1.128592, 1.129644)"> <g transform="matrix(1, 0, 0, 1, 0.721433, 0.743799)"> <path d="M 12.717 7.707 C 12.219 7.707 11.97 7.707 11.781 7.813 C 11.615 7.907 11.479 8.055 11.394 8.242 C 11.296 8.45 11.296 8.726 11.296 9.276 L 11.296 9.733 C 11.296 10.283 11.323 10.547 11.394 10.767 C 11.448 10.932 11.644 11.136 11.742 11.19 C 11.781 11.212 12.719 11.202 12.719 11.202" <path="" fill-rule="evenodd" clip-rule="evenodd" style="transform-box: fill-box; transform-origin: 50% 50%; stroke-width: 1.53635px;" transform="matrix(0, 1, -1, 0, 0.000001, 0)"></path> <path d="M 10.222 10.271 C 9.724 10.271 9.475 10.271 9.286 10.377 C 9.12 10.471 8.984 10.619 8.899 10.806 C 8.801 11.014 8.801 11.29 8.801 11.84 L 8.801 12.297 C 8.801 12.847 8.828 13.111 8.899 13.331 C 8.953 13.496 9.149 13.7 9.247 13.754 C 9.286 13.776 10.224 13.766 10.224 13.766" <path="" fill-rule="evenodd" clip-rule="evenodd" style="transform-origin: 9.512px 12.02px; stroke-width: 1.53635px;"></path> </g> <g transform="matrix(-1, 0, 0, -1, 24.711054, 24.712383)" style=""> <path d="M 12.717 7.707 C 12.219 7.707 11.97 7.707 11.781 7.813 C 11.615 7.907 11.479 8.055 11.394 8.242 C 11.296 8.45 11.296 8.726 11.296 9.276 L 11.296 9.733 C 11.296 10.283 11.323 10.547 11.394 10.767 C 11.448 10.932 11.644 11.136 11.742 11.19 C 11.781 11.212 12.719 11.202 12.719 11.202" <path="" fill-rule="evenodd" clip-rule="evenodd" style="transform-box: fill-box; transform-origin: 50% 50%; stroke-width: 1.53635px;" transform="matrix(0, 1, -1, 0, 0.000001, 0)"></path> <path d="M 10.222 10.271 C 9.724 10.271 9.475 10.271 9.286 10.377 C 9.12 10.471 8.984 10.619 8.899 10.806 C 8.801 11.014 8.801 11.29 8.801 11.84 L 8.801 12.297 C 8.801 12.847 8.828 13.111 8.899 13.331 C 8.953 13.496 9.149 13.7 9.247 13.754 C 9.286 13.776 10.224 13.766 10.224 13.766" <path="" fill-rule="evenodd" clip-rule="evenodd" style="transform-origin: 9.512px 12.02px; stroke-width: 1.53635px;"></path> </g> </g> </g> <g transform="matrix(1, 0, 0, 1, 0.283757, -6.728091)"> <g style="" transform="matrix(0.911248, 0, 0, 0.911248, 1.128592, 1.129644)"> <g transform="matrix(1, 0, 0, 1, 0.721433, 0.743799)"> <path d="M 12.717 7.707 C 12.219 7.707 10.606 7.707 10.417 7.813 C 10.251 7.907 10.115 8.055 10.03 8.242 C 9.932 8.45 9.932 8.726 9.932 9.276 L 9.932 9.733 C 9.932 10.283 9.959 10.547 10.03 10.767 C 10.084 10.932 10.28 11.136 10.378 11.19 C 10.417 11.212 12.719 11.202 12.719 11.202" <path="" fill-rule="evenodd" clip-rule="evenodd" style="stroke-width: 1.53635px;" transform="matrix(0, 1, -1, 0, 20.46313386, -1.55186653)"></path> <path d="M 21.065 16.82 C 20.567 16.82 18.954 16.82 18.765 16.926 C 18.599 17.02 18.463 17.168 18.378 17.355 C 18.28 17.563 18.28 17.839 18.28 18.389 L 18.28 18.846 C 18.28 19.396 18.307 19.66 18.378 19.88 C 18.432 20.045 18.628 20.249 18.726 20.303 C 18.765 20.325 21.067 20.315 21.067 20.315" <path="" fill-rule="evenodd" clip-rule="evenodd" style="stroke-width: 1.536; transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(-1, 0, 0, -1, 0.000002, -0.000001)"></path> </g> <g transform="matrix(-1, 0, 0, -1, 24.711054, 24.712383)" style=""></g> </g> </g> </svg>
                        <span>Addons</span>
                    `;
                    hamburger.insertBefore(addonsItem, hamburger.children[3]);
                    addonsItem.onclick = (e) => {
                        e.preventDefault();
                        hamburger.children[5].click()
                        setTimeout(() => {
                            history.pushState({}, "", "/addons");
                        }, 100);
                    }
                }
            }
        } catch (e) { console.error(e) }
    });

    hamburgerObs.observe(document, {
        childList: true,
        subtree: true
    });

    async function loadAddonsUI() {
        if (topNavButtons) Array.from(topNavButtons.children).forEach(e => {
            e.classList.remove("bg-black/20")
        })
        addonsButton.classList.add("bg-black/20");
        document.title = "Addons - Luduvo";
        await ui.setPageContentAsync(`
            <div class="container xl:px-16 px-4 md:mx-auto py-12 flex flex-col gap-8">
                <h1 style="display: flex; align-items: center;" class="text-3xl md:text-5xl font-bold">Luduvo Addons Beta <button id="loadExternal" class="luduvoButton red" style="margin-left: 25px; margin-top: 8px;">Load External</button></h1>
                <p>You are using the <b>CHROME</b> version of Luduvo Addons. Version 1.2</p>
                <div id="addonsContainer">
                </div>
                <p style="color: var(--muted-foreground);">Addon created with &#10084;&#65039; by <a class="btLink" href="/profile/47">owl</a> and the community. Join the <a class="btLink" href="https://discord.gg/TBZacaR2Hd">Discord server</a>! Look at the <a class="btLink" href="https://github.com/TheOwlCoder/LuduvoAddons">GitHub repo</a>!</p>
            </div>
            <style> a.btLink{text-decoration: underline; transition: 200ms; cursor: pointer;} a.btLink:hover{color: var(--foreground) !important; opacity: 100% !important;}</style>
            <style>
            @media (max-width: 500px) {
                .addonBtns {
                    display: flex;
                    flex-direction: column;
                    float: right;
                    margin-left: auto;
                }
            }
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
        addons.registerAddon("Lunes to Money [BETA]", "lunes2USD", "Displays how much an item costs in your currency.", false, true);
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