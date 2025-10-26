/// <reference path="../src/types/chrome-ai.d.ts" />

chrome.action.onClicked.addListener(function (tab) {
  // Send a message to the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "toggle_extension",
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready:', chrome.runtime.lastError.message);
        } else {
          console.log('Extension toggled:', response);
        }
      });
    }
  });
});

type MessageResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Handle storage messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message, ...payload } = request;

  // Handle different message types
  switch (message) {
    case 'saveToStorage':
      handleSaveToStorage(payload, sendResponse);
      break;
    case 'getFromStorage':
      handleGetFromStorage(payload, sendResponse);
      break;
    case 'removeFromStorage':
      handleRemoveFromStorage(payload, sendResponse);
      break;
    case 'get_ai_stream':
    case 'get_summary_stream':
    case 'get_writer_stream':
    case 'get_rewrite_stream':
      // These are now handled directly in content script
      sendResponse({ success: false, error: 'This feature is now handled directly in the content script' });
      break;
    default:
      // Ignore unknown messages to prevent connection errors
      return false;
  }

  // Return true to indicate we will send a response asynchronously
  return true;
});

async function handleSaveToStorage(
  payload: { key: string; data: any },
  sendResponse: (response: MessageResponse<void>) => void
) {
  try {
    await chrome.storage.local.set({ [payload.key]: payload.data });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetFromStorage(
  payload: { key: string },
  sendResponse: (response: MessageResponse<any>) => void
) {
  try {
    const result = await chrome.storage.local.get(payload.key);
    sendResponse({
      success: true,
      data: result[payload.key] || null
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleRemoveFromStorage(
  payload: { key: string },
  sendResponse: (response: MessageResponse<void>) => void
) {
  try {
    await chrome.storage.local.remove(payload.key);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
