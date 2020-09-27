function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    // to avoid breaking orgain page when copying more words
    // cant copy when adding below this code
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({"meetStartUrl": "https://meet.google.com/new?hs=190"})
});

var targetId = null

chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.tabs.onUpdated.addListener(function listener(tabId, changedInfo, tab) {

    if (tabId != targetId || changedInfo.status != "complete")
      return;

    chrome.storage.sync.set({"meetCurrentUrl": tab.url})
    copyToClipboard(tab.url)

    chrome.tabs.onUpdated.removeListener(listener)
  });

  chrome.tabs.onRemoved.addListener(function listener(tabId, removeInfo) {
    if (tabId == targetId) {
      chrome.storage.sync.remove(["meetCurrentUrl"])
      targetId = null;
    }
  });

  if (targetId == null) {
    // Create a new Meet session
    chrome.storage.sync.get(["meetStartUrl"], function(result) {
      chrome.tabs.create({"url": result.meetStartUrl}, function(tab) {
        targetId = tab.id
      });
    });
  } else {
    // Focus on existing Meet session
    chrome.tabs.update(targetId, {highlighted: true})
  }
});
