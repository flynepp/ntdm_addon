/**
 * Content Script 主入口
 */

(function() {
  'use strict';
  
  log('插件已加载');
  
  const currentUrl = window.location.href;
  const SAVE_DEBOUNCE_DELAY = 500;
  let mutationObserver = null; // 全局观察器引用
  
  // 创建防抖保存函数
  const saveStateDebounced = debounce(async (state) => {
    await saveState(currentUrl, state);
  }, SAVE_DEBOUNCE_DELAY);
  
  /**
   * 初始化插件
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onPageReady);
    } else {
      onPageReady();
    }
  }
  
  /**
   * 页面准备就绪
   */
  async function onPageReady() {
    log('页面已加载，开始初始化');
    
    let domReplaced = false;
    
    // 检查是否为主页
    if (isHomePage()) {
      // 更新追番列表数据
      domReplaced = await replaceHomePageContent();
    }
    
    // 恢复状态
    await restoreTabState();
    
    // 开始监听（如果替换了 DOM，需要重新绑定监听器）
    startMonitoring();
  }
  
  /**
   * 恢复保存的标签状态
   */
  async function restoreTabState() {
    const state = await loadState(currentUrl);
    if (state) {
      log('找到已保存的状态，准备恢复');
      applyTabState(state);
    }
  }
  
  /**
   * 开始监听标签状态变化
   */
  function startMonitoring() {
    log('开始监听标签状态变化');
    
    // 监听点击事件
    document.addEventListener('click', handleClick, true);
    
    // 监听 DOM 变化
    setupMutationObserver();
    
    // 监听路由变化
    setupRouteChangeListener();
  }
  
  /**
   * 处理点击事件
   */
  function handleClick(event) {
    const target = event.target;
    
    if (isTabElement(target)) {
      // 延迟提取状态，等待 DOM 更新
      setTimeout(() => {
        const currentState = extractTabState();
        saveStateDebounced(currentState);
      }, 100);
    }
  }
  
  /**
   * 设置 MutationObserver
   */
  function setupMutationObserver() {
    // 清理旧的观察器
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
    
    const targetNode = getTabContainer();
    if (!targetNode) {
      log('未找到标签容器，跳过 MutationObserver 设置');
      return;
    }
    
    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (isTabStateChange(mutation)) {
          const currentState = extractTabState();
          saveStateDebounced(currentState);
          break;
        }
      }
    });
    
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'aria-selected', 'data-active']
    };
    
    mutationObserver.observe(targetNode, config);
    log('MutationObserver 已设置');
  }
  
  /**
   * 监听路由变化
   */
  function setupRouteChangeListener() {
    window.addEventListener('popstate', handleRouteChange);
    
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };
  }
  
  /**
   * 处理路由变化
   */
  function handleRouteChange() {
    log('路由变化检测');
    setTimeout(() => {
      restoreTabState();
    }, 300);
  }
  
  // 启动
  init();
  
})();
