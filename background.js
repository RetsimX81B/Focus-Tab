function updateBlockingRules() {
    chrome.storage.sync.get(["blockedSites", "blockedTimes"], (data) => {
        let blockedSites = data.blockedSites || [];
        let blockedTimes = data.blockedTimes || {}; // Stocke l'heure de blocage
        let ruleIds = Array.from({ length: blockedSites.length + 1 }, (_, i) => i + 1);

        // Ajouter une date de blocage si ce n'est pas déjà fait
        let now = Date.now();
        blockedSites.forEach(site => {
            if (!blockedTimes[site]) {
                blockedTimes[site] = now;
            }
        });

        chrome.storage.sync.set({ blockedTimes });

        // Supprimer et recréer les règles de blocage
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds,
            addRules: blockedSites.map((site, i) => ({
                id: i + 1,
                priority: 1,
                action: { type: "block" },
                condition: { urlFilter: site, resourceTypes: ["main_frame"] }
            }))
        }, () => {
            console.log("Règles mises à jour :", blockedSites);
            reloadTabs();
        });
    });
}

// Fonction pour recharger les onglets ouverts
function reloadTabs() {
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            chrome.tabs.reload(tab.id);
        }
    });
}

// Appliquer les règles au démarrage
chrome.runtime.onInstalled.addListener(updateBlockingRules);

// Mettre à jour les règles dès qu'un site est ajouté ou retiré
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && (changes.blockedSites || changes.blockedTimes)) {
        updateBlockingRules();
    }
});
