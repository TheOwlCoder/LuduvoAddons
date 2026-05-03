if (addons.addonIsEnabled("ibCat")) {
    // console.log("load3wesknfnvwuj")
    const observer = new MutationObserver(() => {
        const popover = document.querySelector('[data-slot="popover-content"]');

        if (!popover || popover.getAttribute("loaded")) return;

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