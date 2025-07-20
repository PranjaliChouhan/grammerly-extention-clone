/// <reference path="../types/chrome.d.ts" />

// Background script for the grammar extension
function onInstalled() {
  console.log('Grammar Extension installed');
}

function onCheckGrammar(text: string, sendResponse: Function) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'YOUR_API_ENDPOINT/grammar-check', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var result = JSON.parse(xhr.responseText);
        sendResponse({ success: true, result: result });
      } catch (error) {
        sendResponse({ success: false, error: 'Failed to parse response' });
      }
    } else {
      sendResponse({ success: false, error: 'Grammar check failed' });
    }
  };
  
  xhr.onerror = function() {
    sendResponse({ success: false, error: 'Network error' });
  };
  
  xhr.send(JSON.stringify({ text: text }));
}

function onGetUserData(sendResponse: Function) {
  chrome.storage.local.get(['user', 'preferences'], function(result) {
    sendResponse(result);
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INITIALIZE_GRAMMAR_CHECKER') {
    chrome.storage.local.set({
      // Persist the selected purpose under a simple key so the content
      // script can pick it up immediately on page load without needing
      // a message from the background script.
      writingPurpose: request.writingPurpose,
      grammarCheckerSettings: {
        writingPurpose: request.writingPurpose,
        enabled: true
      }
    }, async () => {
      // Get all tabs
      const tabs = await chrome.tabs.query({});
      
      // Initialize grammar checking in all tabs
      for (const tab of tabs) {
        if (tab.id && tab.url && tab.url.startsWith('http')) {
          try {
            // Try to send message to existing content script
            await chrome.tabs.sendMessage(tab.id, {
              type: 'START_GRAMMAR_CHECK',
              writingPurpose: request.writingPurpose
            });
          } catch (error) {
            // If content script is not loaded, inject it
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            // After injection, send the message again
            await chrome.tabs.sendMessage(tab.id, {
              type: 'START_GRAMMAR_CHECK',
              writingPurpose: request.writingPurpose
            });
          }
        }
      }
      sendResponse({ success: true });
    });
    return true;
  }
  return false;
});

function handleInstalled(details: chrome.runtime.InstalledDetails): void {
  if (details.reason === 'install') {
    // Open the popup for initial setup
    chrome.action.openPopup();
  }
}

function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if writing purpose is already set
    chrome.storage.local.get(['writingPurpose'], (result) => {
      if (result.writingPurpose) {
        // Initialize grammar checking on the tab
        chrome.tabs.sendMessage(tabId, {
          type: 'START_GRAMMAR_CHECK',
          writingPurpose: result.writingPurpose
        }).catch(() => {
          // Ignore errors when content script is not ready
        });
      }
    });
  }
}

// Type definitions for the event listeners
type InstalledEvent = (details: chrome.runtime.InstalledDetails) => void;
type TabUpdatedEvent = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => void;

// Initialize extension
chrome.runtime.onInstalled.addListener(function() {
  console.log('Extension installed');
});

// Check for writing purpose when a tab is updated
chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    const result = await chrome.storage.local.get(['writingPurpose']);

    if (result.writingPurpose) {
      try {
        // Attempt to notify existing content script
        await chrome.tabs.sendMessage(tabId, {
          type: 'START_GRAMMAR_CHECK',
          writingPurpose: result.writingPurpose
        });
      } catch (error) {
        try {
          // If the content script isn't loaded yet, inject it and try again
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
          });

          await chrome.tabs.sendMessage(tabId, {
            type: 'START_GRAMMAR_CHECK',
            writingPurpose: result.writingPurpose
          });
        } catch (injectErr) {
          // Log so any issues surface during development
          console.error('Failed to inject content script:', injectErr);
        }
      }
    }
  }
}); 