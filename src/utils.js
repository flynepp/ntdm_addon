/**
 * 工具函数模块
 */

/**
 * 生成存储键名
 * @param {string} url - 页面 URL
 * @returns {string} 存储键名
 */
function generateStorageKey(url) {
  try {
    const urlObj = new URL(url);
    return `tab_state_${urlObj.origin}${urlObj.pathname}`;
  } catch (e) {
    return `tab_state_${url}`;
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 延迟执行
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 日志输出（带前缀）
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
function log(message, ...args) {
  console.log(`[标签状态记录] ${message}`, ...args);
}

/**
 * 错误日志输出
 * @param {string} message - 错误消息
 * @param {...any} args - 额外参数
 */
function logError(message, ...args) {
  console.error(`[标签状态记录] ${message}`, ...args);
}
