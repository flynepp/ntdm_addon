/**
 * 状态管理模块 - 负责与 background script 通信
 */

/**
 * 保存标签状态
 * @param {string} url - 页面 URL
 * @param {Object} state - 状态数据
 * @returns {Promise<boolean>}
 */
async function saveState(url, state) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'saveState', url, state },
      (response) => {
        if (response && response.success) {
          log('状态已保存');
          resolve(true);
        } else {
          logError('保存状态失败');
          resolve(false);
        }
      }
    );
  });
}

/**
 * 加载标签状态
 * @param {string} url - 页面 URL
 * @returns {Promise<Object|null>}
 */
async function loadState(url) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'loadState', url },
      (response) => {
        if (response && response.success && response.state) {
          log('状态已加载', response.state);
          resolve(response.state);
        } else {
          log('没有找到已保存的状态');
          resolve(null);
        }
      }
    );
  });
}

/**
 * 清除标签状态
 * @param {string} url - 页面 URL
 * @returns {Promise<boolean>}
 */
async function clearState(url) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'clearState', url },
      (response) => {
        if (response && response.success) {
          log('状态已清除');
          resolve(true);
        } else {
          logError('清除状态失败');
          resolve(false);
        }
      }
    );
  });
}
