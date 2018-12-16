const onPageDone = (details) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {pageUpdated: true});
        }
    });
};
chrome.webNavigation.onCompleted.addListener(onPageDone);
chrome.webNavigation.onHistoryStateUpdated.addListener(onPageDone);