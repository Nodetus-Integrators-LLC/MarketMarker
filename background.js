// Initialize storage structure on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ requirements: [] }, () => {
        console.log("Market Research Bookmarker extension installed. Storage initialized.");
    });
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveRequirement") {
        saveRequirement(request.data);
    } else if (request.action === "getRequirements") {
        getRequirements(sendResponse);
        return true; // Indicates that the response is asynchronous
    }
});

// Function to save a new requirement
function saveRequirement(requirementData) {
    chrome.storage.local.get('requirements', (result) => {
        const requirements = result.requirements || [];
        requirements.push(requirementData);
        chrome.storage.local.set({ requirements }, () => {
            console.log("Requirement saved:", requirementData);
        });
    });
}

// Function to retrieve all requirements
function getRequirements(sendResponse) {
    chrome.storage.local.get('requirements', (result) => {
        sendResponse(result.requirements || []);
    });
}

// Listen for tab updates to check if we're on a relevant page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Here you can implement logic to check if the current page is relevant for market research
        // and update the extension icon or badge accordingly
    }
});