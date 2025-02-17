document.addEventListener("DOMContentLoaded", () => {
    const siteInput = document.getElementById("siteInput");
    const addSiteButton = document.getElementById("addSite");
    const siteList = document.getElementById("siteList");
    const counterDisplay = document.createElement("div");
    counterDisplay.classList.add("counter");
    document.body.appendChild(counterDisplay);

    // Stocker l'intervalle global pour le compteur
    let globalTimerInterval;

    function loadBlockedSites() {
        chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
            siteList.innerHTML = "";
            const blockedSites = data.blockedSites || [];
            const blockedTimes = data.blockedTimes || {};

            blockedSites.forEach(site => {
                addSiteToList(site, blockedTimes[site]);
            });

            // Mettre à jour le compteur global
            updateGlobalTimer(blockedTimes);
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
                blockedTimes[site] = Date.now(); // Enregistrer l'heure de blocage
                chrome.storage.sync.set({ blockedSites, blockedTimes });
                addSiteToList(site, blockedTimes[site]);
            }
        });

        siteInput.value = "";
    });

    function addSiteToList(site, blockedTime) {
        const li = document.createElement("li");
        li.classList.add("site-item");
        li.textContent = `${site} (bloqué depuis : ${formatTimeElapsed(blockedTime)})`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "🚀";
        removeButton.addEventListener("click", () => {
            chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
                let blockedSites = data.blockedSites.filter(s => s !== site);
                let blockedTimes = data.blockedTimes;
                delete blockedTimes[site];

                // Animation avant suppression
                li.classList.add("removing");
                setTimeout(() => {
                    chrome.storage.sync.set({ blockedSites, blockedTimes });
                    li.remove();
                }, 500); // Durée de l'animation
            });
        });

        li.appendChild(removeButton);
        siteList.appendChild(li);

        // Mettre à jour l'affichage de l'heure écoulée toutes les secondes
        updateSiteTimer(site, blockedTime);
    }

    function formatTimeElapsed(timestamp) {
        if (!timestamp) return "0s";
        let elapsed = Math.floor((Date.now() - timestamp) / 1000);
        let minutes = Math.floor(elapsed / 60);
        let seconds = elapsed % 60;
        return `${minutes}m ${seconds}s`;
    }

    function updateGlobalTimer(blockedTimes) {
        let totalTime = 0;
        for (let site in blockedTimes) {
            totalTime += Math.floor((Date.now() - blockedTimes[site]) / 1000);
        }

        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;

        counterDisplay.textContent = `Total bloqué : ${minutes}m ${seconds}s`;

        // Mettre à jour le compteur toutes les secondes
        clearInterval(globalTimerInterval);
        globalTimerInterval = setInterval(() => {
            updateGlobalTimer(blockedTimes);
        }, 1000);
    }

    function updateSiteTimer(site, blockedTime) {
        const siteItem = [...siteList.children].find(item => item.textContent.includes(site));
        if (siteItem) {
            const timeElement = siteItem.querySelector(".time-elapsed");
            setInterval(() => {
                if (timeElement) {
                    timeElement.textContent = formatTimeElapsed(blockedTime);
                }
            }, 1000); // Mise à jour chaque seconde
        }
    }

    loadBlockedSites();
});
