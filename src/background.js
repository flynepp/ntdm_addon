/**
 * 后台脚本 - 负责状态存储和管理
 */

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveState') {
    saveTabState(request.url, request.state)
      .then(() => {
        console.log('状态已保存:', request.url);
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('保存状态失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.action === 'loadState') {
    loadTabState(request.url)
      .then(state => {
        console.log('状态已加载:', request.url, state);
        sendResponse({ success: true, state: state });
      })
      .catch(error => {
        console.error('加载状态失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.action === 'clearState') {
    clearTabState(request.url)
      .then(() => {
        console.log('状态已清除:', request.url);
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('清除状态失败:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

/**
 * 保存标签状态
 */
async function saveTabState(url, state) {
  const key = generateStorageKey(url);
  const data = {
    url: url,
    state: state,
    timestamp: Date.now()
  };
  
  await chrome.storage.session.set({ [key]: data });
}

/**
 * 加载标签状态
 */
async function loadTabState(url) {
  const key = generateStorageKey(url);
  const result = await chrome.storage.session.get(key);
  
  if (result[key]) {
    return result[key].state;
  }
  return null;
}

/**
 * 清除标签状态
 */
async function clearTabState(url) {
  const key = generateStorageKey(url);
  await chrome.storage.session.remove(key);
}

/**
 * 生成存储键名
 */
function generateStorageKey(url) {
  try {
    const urlObj = new URL(url);
    return `tab_state_${urlObj.origin}${urlObj.pathname}`;
  } catch (e) {
    return `tab_state_${url}`;
  }
}

// 插件安装或更新时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('插件已安装');
  } else if (details.reason === 'update') {
    console.log('插件已更新');
  }
});
