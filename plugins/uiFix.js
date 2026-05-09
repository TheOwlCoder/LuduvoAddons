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
            // convertNavPrice()
            document.querySelectorAll('[data-slot="card"]').forEach(convertPrice);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }, () => { observer.disconnect() }, false)
}