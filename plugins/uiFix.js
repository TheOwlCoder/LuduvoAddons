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
    let observer;
    addons.navigationAddon("/marketplace", () => {
        function convertPrice(card, index) {
            if (index == 0 || card.getAttribute("priced")) return 0;
            try {
                const span = document.createElement("span");
                const dot = document.createElement("span");
                dot.classList = "mx-1";
                dot.innerHTML = "•";
                span.innerText = "$" + (Number(card.children[1].children[1].children[3].innerText) * .01).toFixed(2) // more currencies to come, eventually
                card.children[1].children[1].appendChild(dot)
                card.children[1].children[1].appendChild(span);
                card.setAttribute("priced", "true")
            } catch (e) {

            }
        }
        observer = new MutationObserver((e) => {
            document.querySelectorAll('[data-slot="card"]').forEach(convertPrice);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }, ()=>{observer.disconnect()}, false)
}