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