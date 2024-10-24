// src/js/background-worker.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Market Research Bookmarker extension installed.");
    initializeStorage();
});

function initializeStorage() {
    chrome.storage.local.set({ requirements: [] }, () => {
        console.log("Storage initialized");
    });
}

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "saveRequirement":
            handleSaveRequirement(request.data, sendResponse);
            break;
        case "getRequirements":
            handleGetRequirements(sendResponse);
            break;
        default:
            console.warn("Unknown action:", request.action);
            sendResponse({ error: "Unknown action" });
    }
    return true; // Will respond asynchronously
});

// Storage handlers
async function handleSaveRequirement(data, sendResponse) {
    try {
        const requirements = await getStorageData('requirements') || [];
        requirements.push({
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString()
        });

        await chrome.storage.local.set({ requirements });
        sendResponse({ success: true, data: requirements });
    } catch (error) {
        console.error('Error saving requirement:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleGetRequirements(sendResponse) {
    try {
        const requirements = await getStorageData('requirements');
        sendResponse({ success: true, data: requirements || [] });
    } catch (error) {
        console.error('Error getting requirements:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Utility functions
function generateId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getStorageData(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    });
}

// Tab handling
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Handle tab updates if needed
    }
});