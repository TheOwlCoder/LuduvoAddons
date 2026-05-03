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