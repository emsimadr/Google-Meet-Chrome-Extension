
//Setting the Google Meets URL to start a new session
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({"meetStartUrl": "https://meet.google.com/new?hs=190"})
});

//Can not write directly to clipboard, so I had to use a workaround.
//This copies a text from a dummy textarea DOM element to the clipboard.
//The text is set to the Google Meet Session URL.
function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

var sessionTabId = null

chrome.browserAction.onClicked.addListener(function(tab) {

  // Wait for the page to load before copying the URL to the clipboard.

  chrome.tabs.onUpdated.addListener(function listener(tabId, changedInfo, tab) {

    if (tabId != sessionTabId || changedInfo.status != "complete")
      return;

    chrome.storage.sync.set({"meetSessionUrl": tab.url})
    copyToClipboard(tab.url)

    chrome.tabs.onUpdated.removeListener(listener)
  });

  // Remove the session information when the tab closed.
  chrome.tabs.onRemoved.addListener(function listener(tabId, removeInfo) {
    if (tabId == sessionTabId) {
      chrome.storage.sync.remove(["meetSessionUrl"])
      sessionTabId = null;
    }
  });

  // If there is not active Google Meets Session, then create a new session.
  // Otherwise change to the active session tab.
  if (sessionTabId == null) {
    // Create a new Google Meet session
    chrome.storage.sync.get(["meetStartUrl"], function(result) {
      chrome.tabs.create({"url": result.meetStartUrl}, function(tab) {
        sessionTabId = tab.id
      });
    });
  } else {
    // Focus on the active Google Meet session tab.
    chrome.tabs.update(sessionTabId, {selected: true})
  }
});
