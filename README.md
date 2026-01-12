# 视频网站标签状态记录插件

浏览器插件，用于记录和恢复 ntdm8.com 视频网站的周标签状态。当你切换到某个星期的标签后刷新页面，插件会自动恢复到你之前选择的标签。

## 安装方法

### Microsoft Edge
1. 打开 Edge 浏览器
2. 访问 `edge://extensions/`
3. 开启右上角的"开发人员模式"
4. 点击"加载解压缩的扩展"
5. 选择项目文件夹 `ntdm_addon`

### Firefox
1. 打开 Firefox 浏览器
2. 访问 `about:debugging#/runtime/this-firefox`
3. 点击"临时加载附加组件"
4. 选择项目中的 `manifest.json` 文件

## 项目结构

```
ntdm_addon/
├── manifest.json              # 插件配置文件
├── src/                       # 源代码目录
│   ├── background.js         # 后台脚本，处理存储逻辑
│   ├── content.js            # 内容脚本主入口
│   ├── utils.js              # 工具函数（日志、防抖等）
│   ├── state-manager.js      # 状态管理（与 background 通信）
│   └── dom-handler.js        # DOM 处理逻辑（已实现）
├── icons/                     # 图标文件夹（可选）
└── README.md
```

## 功能说明

### 已实现功能

插件针对 ntdm8.com 首页的周标签（周一~周日）实现了以下功能：

- **状态记录**：自动记录当前选中的周标签
- **状态恢复**：页面刷新后自动恢复之前的选择
- **多种监听**：支持点击切换、DOM 变化和 SPA 路由切换
- **会话存储**：关闭浏览器后自动清除数据

### 核心实现

在 `src/dom-handler.js` 中已实现的五个核心函数：

#### 1. `extractTabState()` - 提取标签状态
查找 `#new_anime_btns` 容器下带 `new_anime_btn_current` class 的 `<li>` 元素，记录其索引和文本内容（周一~周日）。

**实现逻辑：**
- 遍历所有 `#new_anime_btns > li` 元素
- 找到包含 `new_anime_btn_current` class 的标签
- 记录索引和文本用于状态恢复

#### 2. `applyTabState(state)` - 应用标签状态
根据保存的索引恢复标签状态，包括按钮激活状态和内容区域显示。

**实现逻辑：**
- 移除所有 `<li>` 的 `new_anime_btn_current` class
- 给目标 `<li>` 添加 `new_anime_btn_current` class
- 设置 `#content` 下对应索引的 div 为 `display: block`，其他为 `none`

#### 3. `isTabElement(element)` - 判断是否是标签元素
检查点击的元素是否是 `#new_anime_btns > li` 或其子元素。

#### 4. `getTabContainer()` - 获取标签容器
返回 `#new_anime_btns` 容器，用于优化 MutationObserver 的监听范围。

#### 5. `isTabStateChange(mutation)` - 判断 DOM 变化是否相关
监听两种变化：
- `#new_anime_btns > li` 的 class 属性变化
- `#content > div` 的 style 属性变化

### 扩展到其他网站

如果要适配其他网站，需要：

1. 在 `manifest.json` 中修改目标网站的匹配规则
2. 在 `src/dom-handler.js` 中修改五个函数的实现逻辑

当前配置针对 `https://www.ntdm8.com/*`

## 调试方法

1. 在页面中查看控制台输出（F12 打开开发者工具）
   - 所有带 `[标签状态记录]` 前缀的日志来自插件
2. 在 Service Worker 中查看后台脚本日志
   - Edge: `edge://extensions/` → 找到插件 → 点击"Service Worker"
3. 修改代码后需要在扩展管理页面点击刷新图标重新加载插件

## 测试使用

1. 访问 https://www.ntdm8.com/
2. 点击切换不同的周标签（周一、周二等）
3. 刷新页面，观察是否自动恢复到之前的标签
4. 打开控制台（F12）查看插件日志输出
5. 关闭浏览器重新打开，确认状态已清除

## 常见问题

**Q: 刷新后没有恢复状态？**
- 检查控制台是否有错误日志
- 确认切换标签时有看到 `[标签状态记录] 状态已保存` 日志
- 在 `edge://extensions/` 刷新插件重试

**Q: 如何查看存储的状态？**
- 打开 `edge://extensions/`，找到插件
- 点击 "Service Worker" 查看后台日志
- 在后台控制台输入：`chrome.storage.session.get(null, console.log)`

## 注意事项

- 插件使用 `chrome.storage.session`，关闭浏览器后数据会自动清除
- 状态保存带有 500ms 的防抖延迟，避免频繁保存
- MutationObserver 监听特定容器，性能已优化
- 支持 SPA（单页应用）路由变化的自动状态恢复

### 配置目标网站
        "utils.js",
        "state-manager.js",
        "dom-handler.js",
        "content.js"
      ],
      "run_at": "document_idle"
    }
  ]
}页面中查看控制台输出（F12 打开开发者工具）
   - 所有带 `[标签状态记录]` 前缀的日志来自插件
2. 在 background.js 中查看 Service Worker 控制台
   - Edge: `edge://extensions/` → 找到插件 → 点击"Service Worker"
3. 修改代码后需要在扩展管理页面点击刷新图标重新加载插件的模块先加载。
  "host_permissions": [
    "https://你的目标网站.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://你的目标网站.com/*"],
      "js": ["content/content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

**注意**：
- `js` 数组中的文件顺序很重要，确保依赖的模块先加载
- 所有实际代码文件都在 `src/` 目录中

## 调试方法

1. 在页面中查看控制台输出（F12 打开开发者工具）
   - 所有带 `[标签状态记录]` 前缀的日志来自插件
2. 在 Service Worker 中查看后台脚本日志
   - Edge: `edge://extensions/` → 找到插件 → 点击"Service Worker"
3. 修改代码后需要在扩展管理页面点击刷新图标重新加载插件

## 注意事项

- 插件使用 `chrome.storage.session`，关闭浏览器后数据会自动清除
- 状态保存带有 500ms 的防抖延迟，避免频繁保存
- MutationObserver 默认监听整个 body，后续可以优化为特定容器以提升性能
- 支持 SPA（单页应用）路由变化的自动状态恢复

## 下一步

1. 分析目标视频网站的 HTML 结构
2. 在开发者工具中测试选择器是否正确
3. 实现上述三个核心函数
4. 测试状态保存和恢复功能
