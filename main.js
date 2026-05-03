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

    function loadAddonsUI() {
        if (topNavButtons) Array.from(topNavButtons.children).forEach(e => {
            e.classList.remove("bg-black/20")
        })
        addonsButton.classList.add("bg-black/20");
        document.title = "Addons - Luduvo";
        ui.setPageContent(`
            <div class="container xl:px-16 px-4 md:mx-auto py-12 flex flex-col gap-8">
                <h1 style="display: flex; align-items: center;" class="text-3xl md:text-5xl font-bold">Luduvo Addons <button id="loadExternal" class="luduvoButton red" style="margin-left: 25px; margin-top: 8px;">Load External</button></h1>
                <div id="addonsContainer">
                </div>
            </div>
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
        addons.registerAddon("Lunes to USD [BETA]", "lunes2USD", "Displays how much an item costs in USD.");
        addons.registerAddon("Theming", "theming", "Allows advanced customization of the website's appearance.", false, true);
        // FOR DEVELOPERS: It is recommended you clone this repo and develop your addon ins /plugins/test.js instead of loading it each update.
        // addons.registerAddon("My addon", "test", "my description");

        const customAddons = JSON.parse(localStorage.getItem("customAddons"));
        Object.keys(customAddons).forEach(id => {
            const addonData = customAddons[id];
            addons.registerAddon(addonData.name, id, addonData.description, true, addonData.settings, addonData.authors);
        })

    }
    addons.navigationAddon("/addons", loadAddonsUI, () => { addonsButton.classList.remove("bg-black/20") })
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