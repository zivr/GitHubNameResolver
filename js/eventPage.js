chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {pageUpdated: true});
        }
    });
});