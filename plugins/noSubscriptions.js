if (addons.addonIsEnabled("noSub")) {
    setInterval(e => {
        let interval = null;
        addons.navigationAddon("/profile/*", () => {
            interval = setInterval(e => {
                if (document.querySelectorAll(".space-y-6.flex.flex-col>.flex.flex-col").length > 1) {
                    Array.from(document.querySelector(".space-y-6.flex.flex-col").children).forEach((e, i) => {
                        if (i <= 3) {
                            e.remove();
                        }
                    })
                }
            }, 20)
        }, () => { clearInterval(interval) })
    }, 20)
}