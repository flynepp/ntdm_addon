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

/**
 * 获取首页页面 html 内容
 * @returns {Promise<string>} 首页页面 html 内容
 */
async function fetchHomePageHtml() {
  const response = await fetch('https://www.ntdm8.com/');

  if (!response.ok) {
    throw new Error(`网络请求失败，状态码：${response.status}`);
  }

  return await response.text();
}

/**
 * 解析首页页面 html，提取追番列表新番数据整体dom
 * @param {string} html - 首页页面 html 内容
 * @returns {string|null} 提取到的内容 HTML 字符串，未找到则返回 null
 */
function parseHomePageHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const contentDiv = doc.querySelector('#content');
  return contentDiv ? contentDiv.innerHTML : null;
}

/**
 * 获取当前显示的 tab 索引
 * @returns {number} 当前显示的 .mod div 的索引，未找到则返回 -1
 */
function getCurrentTabIndex() {
  const contentContainer = document.getElementById('content');
  if (!contentContainer) return -1;
  
  const modDivs = contentContainer.querySelectorAll('.mod');
  for (let i = 0; i < modDivs.length; i++) {
    if (modDivs[i].style.display === 'block') {
      return i;
    }
  }
  return -1;
}

/**
 * 恢复指定索引的 tab 显示状态
 * @param {number} tabIndex - 要显示的 tab 索引
 */
function restoreTabDisplay(tabIndex) {
  const contentContainer = document.getElementById('content');
  if (!contentContainer) return;
  
  const modDivs = contentContainer.querySelectorAll('.mod');
  if (tabIndex >= 0 && tabIndex < modDivs.length) {
    modDivs.forEach((div, index) => {
      div.style.display = index === tabIndex ? 'block' : 'none';
    });
    console.log(`已恢复第 ${tabIndex + 1} 个 tab 的显示状态`);
  }
}

/**
 * 检查当前是否为主页
 * @returns {boolean} 是否为主页
 */
function isHomePage() {
  const url = window.location.href;
  const pathname = window.location.pathname;
  // 主页是 https://www.ntdm8.com/ 或 https://www.ntdm8.com
  return pathname === '/' || pathname === '';
}

/**
 * 替换现有追番列表新番数据整体dom
 * @returns {Promise<boolean>} 是否成功替换了 DOM
 */
async function replaceHomePageContent() {
  console.log('开始替换追番列表新番数据整体dom');

  const contentContainer = document.getElementById('content');
  if (!contentContainer) {
    console.error('未找到内容容器 #content');
    return false;
  }

  // 记录当前显示的 tab 索引
  const currentTabIndex = getCurrentTabIndex();
  console.log(`当前显示的 tab 索引: ${currentTabIndex}`);

  try {
    const html = await fetchHomePageHtml();
    const newContentHtml = parseHomePageHtml(html);
    if (newContentHtml) {
      // 替换整个 #content 的内容
      contentContainer.innerHTML = newContentHtml;
      console.log('追番列表新番数据整体dom替换完成');
      
      // 恢复之前的 tab 显示状态
      restoreTabDisplay(currentTabIndex);
      
      return true; // 返回成功标志
    } else {
      console.error('未能从首页 HTML 中提取到追番列表新番数据整体dom');
      return false;
    }
  } catch (error) {
    console.error('替换追番列表新番数据整体dom时发生错误:', error);
    return false;
  }
}
