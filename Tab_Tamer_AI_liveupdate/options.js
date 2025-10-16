document.addEventListener('DOMContentLoaded', async () => {
  const useOnline = document.getElementById('useOnline');
  const apiKey = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');

  const data = await chrome.storage.local.get({ useOnline: false, apiKey: '' });
  useOnline.checked = data.useOnline;
  apiKey.value = data.apiKey;

  saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({ useOnline: useOnline.checked, apiKey: apiKey.value }, () => {
      alert('Options saved');
    });
  });
});
