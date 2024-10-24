// src/js/background.js
import { BackgroundService } from './services/BackgroundService.js';

// Initialize background service
chrome.runtime.onInstalled.addListener(() => {
    console.log("Market Research Bookmarker extension installed.");
    BackgroundService.init();
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveRequirement") {
        BackgroundService.handleSaveRequirement(request.data, sendResponse);
        return true; // Will respond asynchronously
    } else if (request.action === "getRequirements") {
        BackgroundService.handleGetRequirements(sendResponse);
        return true; // Will respond asynchronously
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Implementation for tab updates if needed
    }
});