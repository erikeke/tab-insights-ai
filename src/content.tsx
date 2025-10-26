import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import { shadowDOMStyles } from './utils/cssLoader';

let extensionRoot: any = null;
let triggerCloseAnimation: (() => void) | null = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "toggle_extension") {
    const existingExtension = document.getElementById("wordxplain");

    if (existingExtension) {
      // If we have a close animation trigger, use it
      if (triggerCloseAnimation) {
        triggerCloseAnimation();
        // Don't remove immediately, let React handle the animation
        setTimeout(() => {
          if (existingExtension && existingExtension.parentNode) {
            existingExtension.remove();
            extensionRoot = null;
            triggerCloseAnimation = null;
          }
        }, 300); // Wait for animation to complete
        sendResponse({ success: true, action: 'closed' });
        return;
      } else {
        // Fallback: direct removal
        existingExtension.remove();
        extensionRoot = null;
        sendResponse({ success: true, action: 'closed' });
        return;
      }
    }

    const extension = document.createElement("div") as HTMLElement;
    extension.id = "wordxplain";
    document.body.appendChild(extension);

    // Create shadow root with mode: closed to prevent external access
    const shadow = extension.attachShadow({ mode: 'closed' });

    // Create a container for our React app inside the shadow DOM
    const container = document.createElement('div');
    shadow.appendChild(container);

    // Add a style element to reset inherited styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        box-sizing: border-box;
      }

      body {
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }
      
      p, div {
        margin: 0;
        padding: 0;
        color: black;
        line-height: normal;
        font-size: 14px;
        text-wrap: pretty;
      }

      input, button, textarea, select {
        font: inherit;  
      }

      p, h1, h2, h3, h4, h5, h6 {
        overflow-wrap: break-word;
      }

      #root, #__next {
        isolation: isolate;
      }

      /* Scrollbar styles */
      ::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
      }

      ::-webkit-scrollbar-track {
        background: transparent !important;
        margin: 8px !important;
      }

      ::-webkit-scrollbar-thumb {
        background: #8888884d !important;
        border-radius: 3px !important;
        margin: 8px !important;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #88888880 !important;
      }

      ::placeholder {
        color: #B6BBC4;
      }
      
      ${shadowDOMStyles}
    `;
    shadow.appendChild(style);

    extensionRoot = createRoot(container);

    // Store the close function for external triggering
    const handleClose = () => {
      extension.remove();
      extensionRoot = null;
      triggerCloseAnimation = null;
    };

    // Create a function to trigger close animation from outside
    const createCloseTrigger = () => {
      triggerCloseAnimation = () => {
        // This will be set by the React component
      };
    };

    createCloseTrigger();

    extensionRoot.render(
      <React.StrictMode>
        <App onClose={handleClose} onSetCloseTrigger={(fn) => { triggerCloseAnimation = fn; }} />
      </React.StrictMode>,
    );

    sendResponse({ success: true, action: 'opened' });
  }

  // Return true to indicate we will send a response asynchronously
  return true;
});
