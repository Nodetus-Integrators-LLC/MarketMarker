chrome.action.onClicked.addListener((tab) => {
    chrome.action.setPopup({ popup: "popup.html" });
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Market Research Bookmarker extension installed.");
    // Initialize empty bookmarks array in storage
    chrome.storage.local.set({ bookmarks: [] }, function () {
        console.log('Bookmarks storage initialized');
    });
});