chrome.runtime.onInstalled.addListener(() => {
  captureTabsAndGroup();
  chrome.alarms.create('tabTamerCapture', { periodInMinutes: 5 });
// Auto-update when tabs change
chrome.tabs.onCreated.addListener(() => captureTabsAndGroup());
chrome.tabs.onRemoved.addListener(() => captureTabsAndGroup());
chrome.tabs.onUpdated.addListener(() => captureTabsAndGroup());

});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm && alarm.name === 'tabTamerCapture') captureTabsAndGroup();
});

async function captureTabsAndGroup() {
  try {
    const tabs = await chrome.tabs.query({});
    const tabInfos = tabs.map(t => ({
      id: t.id,
      title: t.title || '',
      url: t.url || '',
      favIconUrl: t.favIconUrl || ''
    }));

    await chrome.storage.local.set({ lastCapturedTabs: tabInfos, lastCapturedAt: Date.now() });

    // Simple offline grouping by keyword
    const map = {};
    tabInfos.forEach((t, i) => {
      const text = (t.title + ' ' + t.url).toLowerCase();
      const group = text.includes('youtube') ? 'Media' :
                    text.includes('github') ? 'Development' :
                    text.includes('mail') ? 'Email' :
                    text.includes('news') ? 'News' :
                    text.includes('shop') ? 'Shopping' : 'Other';
      map[group] = map[group] || [];
      map[group].push(i);
    });

    const groups = Object.keys(map).map(k => ({ name: k, tabIndices: map[k] }));
    await chrome.storage.local.set({ lastGroups: groups, lastTabInfos: tabInfos });
  } catch (err) {
    console.error('captureTabsAndGroup error', err);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'captureNow') {
    captureTabsAndGroup().then(() => sendResponse({ ok: true }));
    return true;
  }
});
