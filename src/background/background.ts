const MENU_IDS = {
  page: 'qr_generate_from_page',
  link: 'qr_generate_from_link',
  image: 'qr_generate_from_image'
} as const;

type MenuId = (typeof MENU_IDS)[keyof typeof MENU_IDS];

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_IDS.page,
      title: 'Generate QR from this page',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: MENU_IDS.link,
      title: 'Generate QR from this link',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      id: MENU_IDS.image,
      title: 'Generate QR from this image',
      contexts: ['image']
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createMenus();
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  const menuItemId = info.menuItemId as MenuId;
  const tabId = tab?.id;
  if (!tabId) return;

  let payload: string | undefined;
  let sourceType: string | undefined;

  if (menuItemId === MENU_IDS.page) {
    payload = info.pageUrl;
    sourceType = 'contextPage';
  } else if (menuItemId === MENU_IDS.link) {
    payload = info.linkUrl;
    sourceType = 'contextLink';
  } else if (menuItemId === MENU_IDS.image) {
    payload = info.srcUrl;
    sourceType = 'contextImage';
  }

  if (!payload || !sourceType) return;

  await chrome.storage.local.set({
    pendingContext: {
      payload,
      sourceType,
      at: Date.now()
    }
  });

  await chrome.action.openPopup();
});
