document.addEventListener("DOMContentLoaded", () => {
    const siteInput = document.getElementById("siteInput");
    const addSiteButton = document.getElementById("addSite");
    const siteList = document.getElementById("siteList");

    function loadBlockedSites() {
        chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
            siteList.innerHTML = "";
            const blockedSites = data.blockedSites || [];
            const blockedTimes = data.blockedTimes || {};

            blockedSites.forEach(site => {
                addSiteToList(site, blockedTimes[site]);
            });
        });
    }

    addSiteButton.addEventListener("click", () => {
        const site = siteInput.value.trim();
        if (site === "") return;

        chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
            let blockedSites = data.blockedSites || [];
            let blockedTimes = data.blockedTimes || {};

            if (!blockedSites.includes(site)) {
                blockedSites.push(site);
                blockedTimes[site] = Date.now(); // Sauvegarde l'heure de blocage
                chrome.storage.sync.set({ blockedSites, blockedTimes });
                addSiteToList(site, blockedTimes[site]);
            }
        });

        siteInput.value = "";
    });

    function addSiteToList(site, blockedTime) {
        const li = document.createElement("li");
        li.textContent = site + " (bloqué depuis : " + formatTimeElapsed(blockedTime) + ")";

        const removeButton = document.createElement("button");
        removeButton.textContent = "X";
        removeButton.addEventListener("click", () => {
            chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
                let blockedSites = data.blockedSites.filter(s => s !== site);
                let blockedTimes = data.blockedTimes;
                delete blockedTimes[site];

                chrome.storage.sync.set({ blockedSites, blockedTimes });
                li.remove();
            });
        });

        li.appendChild(removeButton);
        siteList.appendChild(li);
    }

    function formatTimeElapsed(timestamp) {
        if (!timestamp) return "0s";
        let elapsed = Math.floor((Date.now() - timestamp) / 1000);
        let minutes = Math.floor(elapsed / 60);
        let seconds = elapsed % 60;
        return `${minutes}m ${seconds}s`;
    }

    loadBlockedSites();
    setInterval(loadBlockedSites, 1000); // Met à jour le timer toutes les secondes
});
function addSiteToList(site, blockedTime) {
    const li = document.createElement("li");
    li.classList.add("site-item");
    li.textContent = site + " (bloqué depuis : " + formatTimeElapsed(blockedTime) + ")";

    const removeButton = document.createElement("button");
    removeButton.textContent = "🚀"; // Remplacé par une icône rigolote
    removeButton.addEventListener("click", () => {
        chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
            let blockedSites = data.blockedSites.filter(s => s !== site);
            let blockedTimes = data.blockedTimes;
            delete blockedTimes[site];

            // Animation cartoon avant suppression
            li.classList.add("removing");
            setTimeout(() => {
                chrome.storage.sync.set({ blockedSites, blockedTimes });
                li.remove();
            }, 500); // Temps de l'animation
        });
    });

    li.appendChild(removeButton);
    siteList.appendChild(li);
}
