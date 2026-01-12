/**
 * DOM 处理模块 - 具体的标签状态提取和应用逻辑
 */

/**
 * 提取当前标签状态
 * @returns {Object} 状态数据
 */
function extractTabState() {
  const state = {
    selectedTabIndex: null,
    selectedDay: null
  };
  
  // 查找标签按钮容器
  const tabsContainer = document.getElementById('new_anime_btns');
  if (!tabsContainer) {
    log('未找到标签容器 #new_anime_btns');
    return state;
  }
  
  // 查找所有标签
  const tabs = tabsContainer.querySelectorAll('li');
  tabs.forEach((tab, index) => {
    if (tab.classList.contains('new_anime_btn_current')) {
      state.selectedTabIndex = index;
      state.selectedDay = tab.textContent.trim(); // 保存标签文本，如"周一"
      log('提取的状态:', `索引=${index}, 文本=${state.selectedDay}`);
    }
  });
  
  return state;
}

/**
 * 应用标签状态到页面
 * @param {Object} state - 状态数据
 */
function applyTabState(state) {
  if (state.selectedTabIndex === null) {
    log('状态无效，跳过恢复');
    return;
  }
  
  log('开始应用状态:', state);
  
  // 查找标签按钮容器
  const tabsContainer = document.getElementById('new_anime_btns');
  if (!tabsContainer) {
    logError('未找到标签容器 #new_anime_btns');
    return;
  }
  
  // 查找所有标签
  const tabs = tabsContainer.querySelectorAll('li');
  if (state.selectedTabIndex >= tabs.length) {
    logError('标签索引超出范围:', state.selectedTabIndex);
    return;
  }
  
  const targetTab = tabs[state.selectedTabIndex];
  
  // 移除所有标签的激活状态
  tabs.forEach(tab => tab.classList.remove('new_anime_btn_current'));
  
  // 激活目标标签
  targetTab.classList.add('new_anime_btn_current');
  
  // 处理内容区域的显示
  const contentContainer = document.getElementById('content');
  if (contentContainer) {
    const contentDivs = contentContainer.querySelectorAll(':scope > div');
    contentDivs.forEach((div, index) => {
      if (index === state.selectedTabIndex) {
        div.style.display = 'block';
      } else {
        div.style.display = 'none';
      }
    });
  }
  
  // 方式2: 模拟点击（更保险，会触发网站自己的事件处理）
  // targetTab.click();
  
  log('状态已应用');
}

/**
 * 判断点击的元素是否是标签
 * @param {Element} element - 被点击的元素
 * @returns {boolean}
 */
function isTabElement(element) {
  // 检查是否是 #new_anime_btns 下的 li 元素
  const tabsContainer = document.getElementById('new_anime_btns');
  if (!tabsContainer) return false;
  
  // 检查元素本身是否是标签 li
  if (element.tagName === 'LI' && element.parentElement === tabsContainer) {
    return true;
  }
  
  // 检查是否点击了标签内的子元素
  const closestTab = element.closest('#new_anime_btns > li');
  return closestTab !== null;
}

/**
 * 获取需要监听的容器元素
 * @returns {Element} 容器元素
 */
function getTabContainer() {
  // 返回标签按钮容器，优化监听范围
  const container = document.getElementById('new_anime_btns');
  
  // 如果找不到容器，返回 body 作为后备
  return container || document.body;
}

/**
 * 判断 DOM 变化是否与标签状态相关
 * @param {MutationRecord} mutation - DOM 变化记录
 * @returns {boolean}
 */
function isTabStateChange(mutation) {
  const element = mutation.target;
  
  // 检查 class 属性变化（标签按钮的激活状态）
  if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
    // 检查是否是 #new_anime_btns 下的 li 元素
    const tabsContainer = document.getElementById('new_anime_btns');
    if (tabsContainer && element.tagName === 'LI' && element.parentElement === tabsContainer) {
      return true;
    }
  }
  
  // 检查 style 属性变化（内容区域的显示/隐藏）
  if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
    // 检查是否是 #content 下的直接子 div
    const contentContainer = document.getElementById('content');
    if (contentContainer && element.parentElement === contentContainer && element.tagName === 'DIV') {
      return true;
    }
  }
  
  return false;
}
