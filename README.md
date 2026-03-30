# Pandas 学堂 | Pandas Academy

由浅入深，系统学习 pandas 数据分析。交互式练习 + 速查表 + 每日练习 + Raycast 集成。

**在线体验**: [https://importcjj.github.io/pandas-lesson/](https://importcjj.github.io/pandas-lesson/)

## 特性

### 系统化课程体系

4 个阶段、32 节课、429 道交互式习题，覆盖 pandas 从入门到高级的完整知识体系。

| 阶段 | 内容 | 课程数 | 题目数 |
|------|------|--------|--------|
| 基础入门 | Series、DataFrame、索引、排序、数据类型 | 8 | 102 |
| 数据清洗 | 读写文件、缺失值、布尔索引、字符串、类型转换 | 8 | 104 |
| 分析与聚合 | GroupBy、透视表、合并、窗口函数、时间序列 | 8 | 110 |
| 高级技巧 | 性能优化、大数据集、数据重塑、实战项目 | 8 | 113 |

### 5 种题型

- **编程题** (273) — 浏览器内运行 Python (Pyodide)，实时验证
- **选择题** (83) — 单选，答错可重试
- **填空题** (33) — 代码模板填写关键部分
- **判断题** (24) — 正误判断
- **输出预测** (16) — 预测代码输出结果

### 速查表

25 个主题、310 条内容、174 个 API，按主题组织：

- **常用 API** — 签名、参数表（类型+默认值+说明）、代码示例+输出
- **惯用写法** — 最佳实践和常见模式
- **踩坑指南** — 错误写法 vs 正确写法并排对比

主题覆盖：创建数据、检查、筛选、索引、排序、统计、缺失值、去重、类型转换、分箱、字符串(str.*)、日期(dt.*)、分类(cat.*)、列操作、重命名、分组聚合、透视重塑、窗口函数、合并拼接、MultiIndex、apply/map/transform、读写文件、性能优化、易混淆 API 对比、inplace/copy 与赋值。

全局搜索 + 右下角浮动面板（任何页面按 `Ctrl+Shift+K` 呼出）。

### 每日练习

每天从各阶段随机抽取 12 道题，基于日期种子确定性生成，次日自动刷新。答题数据与课程练习独立存储。

### 答案持久化

所有答题状态（选项、填空、代码）通过 localStorage 持久化，刷新页面不丢失。使用题目内容 hash 作为 key，题目更新后自动重置。

### Raycast 集成

本地 Raycast 插件，快速查阅 pandas API：

- `pd` + Enter → 浏览 25 个主题目录
- `pd` + Tab + `resample` + Enter → 直接搜索
- 右侧详情面板展示签名、参数表、代码示例
- `Cmd+C` 复制代码 / `Cmd+Shift+Enter` 直接粘贴到编辑器
- 支持中英文切换（Raycast 插件设置）

### 中英双语

全部内容支持中文/英文切换。

## 技术栈

- **Next.js 16** — App Router，静态导出 (SSG)
- **Tailwind CSS 4** — 样式
- **Pyodide** — 浏览器端 Python 运行时（含 pandas、scipy）
- **CodeMirror** — Python 代码编辑器
- **IndexedDB** — 学习进度、错题复习 (SM-2 算法)
- **localStorage** — 答题状态持久化
- **react-markdown** — Markdown 渲染

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

### Raycast 插件

```bash
cd raycast-pandas-cheatsheet
npm install
npm run dev
```

启动后在 Raycast 中搜索 `pd` 或 `Pandas Cheat Sheet` 即可使用。

### 编程题验证

```bash
# 安装 Python 依赖
uv add pandas numpy scipy

# 批量验证所有编程题
uv run python scripts/verify_exercises.py
```

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages：

- 推送到 `main` 分支自动触发构建
- 部署地址：`https://importcjj.github.io/pandas-lesson/`

## 项目结构

```
src/
├── app/[locale]/          # 页面路由 (zh/en)
│   ├── learn/             # 课程页面
│   ├── daily/             # 每日练习
│   ├── reference/         # 速查表
│   ├── exercises/         # 习题库
│   ├── review/            # 错题复习
│   └── progress/          # 学习进度
├── components/
│   ├── exercise/          # 5 种题型组件
│   ├── reference/         # 速查表组件
│   ├── layout/            # 布局（Header、Sidebar、AppShell）
│   └── ui/                # 通用 UI 组件
├── data/
│   ├── curriculum.json    # 课程大纲
│   ├── exercises/         # 习题数据 (stage1-4)
│   └── reference/         # 速查表数据
├── lib/
│   ├── daily/             # 每日练习选题逻辑
│   ├── storage/           # IndexedDB + localStorage
│   ├── i18n/              # 国际化
│   └── pyodide/           # Python 运行时
└── types/                 # TypeScript 类型

raycast-pandas-cheatsheet/ # Raycast 插件
messages/                  # 中英文翻译
scripts/                   # 验证脚本
```

## License

MIT
