# Pandas 习题库管理指南（LLM 专用）

本文档是为 LLM（如 Claude）编写的操作手册。通过读写 JSON 文件即可增删改习题，无需理解项目代码。

---

## 目录结构

```
src/data/exercises/
├── _schema.json          # JSON Schema（字段验证规则）
├── README.md             # 本文件
├── stage1/               # 阶段1：基础入门（难度 1-3）
│   ├── intro.json
│   ├── series-basics.json
│   ├── dataframe-creation.json
│   ├── data-inspection.json
│   ├── selection.json
│   ├── loc-iloc.json
│   ├── dtypes.json
│   └── sorting.json
├── stage2/               # 阶段2：数据清洗（难度 2-3）
│   ├── file-io.json
│   ├── missing-data.json
│   ├── boolean-indexing.json
│   ├── columns-ops.json
│   ├── string-methods.json
│   ├── type-conversion.json
│   ├── rename-reindex.json
│   └── apply-map.json
├── stage3/               # 阶段3：分析与聚合（难度 3-4）
│   ├── groupby.json
│   ├── pivot.json
│   ├── merge-join.json
│   ├── window.json
│   ├── datetime.json
│   ├── categorical.json
│   ├── multiindex.json
│   └── visualization.json
└── stage4/               # 阶段4：高级技巧（难度 3-5）
    ├── performance.json
    ├── large-datasets.json
    ├── advanced-groupby.json
    ├── reshaping.json
    ├── text-processing.json
    ├── project-cleaning.json
    ├── project-eda.json
    └── best-practices.json
```

---

## 操作流程

### 向已有课程添加习题

1. 打开对应的 JSON 文件（如 `stage1/intro.json`）
2. 在 `exercises` 数组末尾追加新的习题对象
3. 确保 `id` 全局唯一
4. **必须**：在 `src/lib/exercises.ts` 中确认该文件已被 import（已有文件无需改动）

### 创建新的习题文件（为已有课程）

1. 在对应 `stage{N}/` 目录下创建新 JSON 文件
2. 设置正确的 `module`、`stageId`、`lessonId`
3. **必须**：在 `src/lib/exercises.ts` 中添加 import 和注册：
   ```typescript
   // 添加 import
   import s1NewTopic from "@/data/exercises/stage1/new-topic.json";

   // 在 allModules 数组中添加
   asModule(s1NewTopic),
   ```

### 创建全新课程模块（新知识点）

1. 创建习题 JSON 文件（同上）
2. 在 `src/lib/exercises.ts` 中注册（同上）
3. 在 `src/data/curriculum.json` 中添加 lesson 条目：
   ```json
   {
     "id": "new-topic",
     "order": 9,
     "title": { "zh": "新知识点", "en": "New Topic" },
     "description": { "zh": "...", "en": "..." },
     "exerciseModules": ["stage1/new-topic"],
     "estimatedMinutes": 20
   }
   ```

### 删除习题

- 删除单道题：从 JSON 文件的 `exercises` 数组中移除对应对象
- 删除整个文件：删除 JSON 文件 + 移除 `src/lib/exercises.ts` 中的 import 和数组条目

### 修改习题

直接编辑 JSON 文件中对应 `id` 的题目对象，不需要改动其他文件。

---

## JSON 文件格式

### 文件顶层结构

```json
{
  "module": "series-basics",
  "stageId": "stage1",
  "lessonId": "series-basics",
  "tags": ["Series", "creation", "indexing"],
  "exercises": [ ... ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `module` | string | 模块标识符，通常与文件名相同 |
| `stageId` | string | `stage1` / `stage2` / `stage3` / `stage4` |
| `lessonId` | string | 对应 curriculum.json 中的课程 id |
| `tags` | string[] | 知识点标签，用于习题库页面的筛选 |
| `exercises` | array | 习题数组，无数量上限 |

### 有效的 lessonId 列表

| stageId | lessonId 值 |
|---------|-------------|
| stage1 | `intro`, `series-basics`, `dataframe-creation`, `data-inspection`, `selection`, `loc-iloc`, `dtypes`, `sorting` |
| stage2 | `file-io`, `missing-data`, `boolean-indexing`, `columns-ops`, `string-methods`, `type-conversion`, `rename-reindex`, `apply-map` |
| stage3 | `groupby`, `pivot`, `merge-join`, `window`, `datetime`, `categorical`, `multiindex`, `visualization` |
| stage4 | `performance`, `large-datasets`, `advanced-groupby`, `reshaping`, `text-processing`, `project-cleaning`, `project-eda`, `best-practices` |

---

## 习题 ID 规则

格式：`s{阶段号}-{知识点缩写}-{三位序号}`

示例：`s1-intro-001`, `s2-missing-003`, `s3-groupby-005`, `s4-reshape-002`

**确认唯一性**：在创建新 ID 前，搜索已有文件确认不存在重复。可用命令：
```bash
grep -r '"id":' src/data/exercises/stage*/ | grep "s1-intro"
```

---

## 5 种题型完整示例

### 1. 选择题 (multiple-choice)

```json
{
  "id": "s1-intro-001",
  "type": "multiple-choice",
  "difficulty": 1,
  "title": {
    "zh": "pandas 的导入方式",
    "en": "Importing pandas"
  },
  "description": {
    "zh": "以下哪种是 pandas 最常用的导入方式？",
    "en": "Which is the most common way to import pandas?"
  },
  "options": {
    "zh": ["import pandas as pd", "import pandas", "from pandas import *", "import pd"],
    "en": ["import pandas as pd", "import pandas", "from pandas import *", "import pd"]
  },
  "correctIndex": 0,
  "hints": {
    "zh": ["pandas 社区有一个广泛认可的缩写约定"],
    "en": ["The pandas community has a widely accepted abbreviation convention"]
  },
  "explanation": {
    "zh": "import pandas as pd 是社区标准约定。",
    "en": "import pandas as pd is the standard convention."
  }
}
```

**必填字段**：`options`（2-4 个选项）、`correctIndex`（0-based 索引）

### 2. 判断题 (true-false)

```json
{
  "id": "s1-intro-002",
  "type": "true-false",
  "difficulty": 1,
  "title": {
    "zh": "pandas 与 NumPy 的关系",
    "en": "pandas and NumPy Relationship"
  },
  "description": {
    "zh": "pandas 是基于 NumPy 构建的。",
    "en": "pandas is built on top of NumPy."
  },
  "correctAnswer": true,
  "explanation": {
    "zh": "pandas 底层使用 NumPy 数组来存储数据。",
    "en": "pandas uses NumPy arrays internally to store data."
  }
}
```

**必填字段**：`correctAnswer`（`true` 或 `false`）

### 3. 填空题 (fill-blank)

```json
{
  "id": "s1-series-004",
  "type": "fill-blank",
  "difficulty": 2,
  "title": {
    "zh": "Series 的基本运算",
    "en": "Basic Series Operations"
  },
  "description": {
    "zh": "补全代码，计算 Series 中所有元素的平均值。",
    "en": "Complete the code to calculate the mean of all elements."
  },
  "codeTemplate": "import pandas as pd\ns = pd.Series([10, 20, 30, 40, 50])\navg = s._____()\nprint(avg)",
  "blanks": [
    {
      "placeholder": "_____",
      "answer": "mean",
      "alternatives": []
    }
  ],
  "hints": {
    "zh": ["pandas 提供了内置的统计方法"],
    "en": ["pandas provides built-in statistical methods"]
  },
  "explanation": {
    "zh": "mean() 方法计算算术平均值。",
    "en": "The mean() method calculates the arithmetic mean."
  }
}
```

**必填字段**：`codeTemplate`（含占位符的代码）、`blanks`（占位符 → 答案映射数组）
**注意**：`placeholder` 的值必须在 `codeTemplate` 中出现。多个空使用不同占位符（如 `_____1`、`_____2`）。`alternatives` 是可接受的替代答案数组。

### 4. 编程题 (coding)

```json
{
  "id": "s1-series-001",
  "type": "coding",
  "difficulty": 1,
  "title": {
    "zh": "创建一个简单的 Series",
    "en": "Create a Simple Series"
  },
  "description": {
    "zh": "使用列表 [10, 20, 30, 40, 50] 创建一个 pandas Series 并打印。",
    "en": "Create a pandas Series from [10, 20, 30, 40, 50] and print it."
  },
  "starterCode": "import pandas as pd\n\n# Create a Series from the list [10, 20, 30, 40, 50]\n",
  "solutionCode": "import pandas as pd\n\ns = pd.Series([10, 20, 30, 40, 50])\nprint(s)",
  "setupCode": "",
  "validationType": "exact-output",
  "expectedOutput": "0    10\n1    20\n2    30\n3    40\n4    50\ndtype: int64",
  "hints": {
    "zh": ["使用 pd.Series() 函数", "传入列表：pd.Series([10, 20, 30, 40, 50])"],
    "en": ["Use pd.Series()", "Pass a list: pd.Series([10, 20, 30, 40, 50])"]
  }
}
```

**必填字段**：`starterCode`、`solutionCode`、`validationType`

**三种验证方式**：

| validationType | 用法 | 额外必填字段 |
|----------------|------|-------------|
| `exact-output` | 对比 print 的 stdout 输出（去首尾空白后精确匹配） | `expectedOutput` |
| `dataframe-equals` | 比较用户代码生成的 DataFrame 和答案 | `checkCode` |
| `custom-check` | 运行自定义 Python 代码验证，返回 True/False | `checkCode` |

**custom-check 示例**（验证变量而非输出）：
```json
{
  "validationType": "custom-check",
  "checkCode": "import pandas as pd\ntry:\n    expected = pd.Series([85, 90, 78], index=['A', 'B', 'C'])\n    result = scores.equals(expected)\nexcept:\n    result = False\nresult"
}
```

**setupCode 用法**（为编程题预加载数据，用户看不到这段代码）：
```json
{
  "setupCode": "import pandas as pd\nimport numpy as np\ndf = pd.DataFrame({'name': ['Alice', 'Bob', 'Charlie'], 'age': [25, 30, 35], 'score': [85, 92, 78]})",
  "starterCode": "# df is already loaded with columns: name, age, score\n# Filter rows where age > 25\n"
}
```

### 5. 输出预测题 (output-matching)

```json
{
  "id": "s1-series-005",
  "type": "output-matching",
  "difficulty": 2,
  "title": {
    "zh": "Series 的切片操作",
    "en": "Series Slicing"
  },
  "description": {
    "zh": "以下代码的输出是什么？",
    "en": "What is the output of the following code?"
  },
  "code": "import pandas as pd\ns = pd.Series([10, 20, 30, 40, 50])\nprint(s[1:3])",
  "options": {
    "zh": [
      "1    20\n2    30\ndtype: int64",
      "0    10\n1    20\n2    30\ndtype: int64",
      "20\n30",
      "1    20\n2    30\n3    40\ndtype: int64"
    ],
    "en": [
      "1    20\n2    30\ndtype: int64",
      "0    10\n1    20\n2    30\ndtype: int64",
      "20\n30",
      "1    20\n2    30\n3    40\ndtype: int64"
    ]
  },
  "correctIndex": 0,
  "explanation": {
    "zh": "s[1:3] 遵循左闭右开原则，包含索引 1 和 2 的元素。",
    "en": "s[1:3] follows half-open interval, including elements at positions 1 and 2."
  }
}
```

**必填字段**：`code`（展示给用户的代码片段）、`options`、`correctIndex`

---

## 通用字段参考

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `id` | 是 | string | 格式 `s{1-4}-{topic}-{001-999}`，全局唯一 |
| `type` | 是 | string | `multiple-choice` / `true-false` / `fill-blank` / `coding` / `output-matching` |
| `difficulty` | 是 | int | 1（入门）到 5（挑战） |
| `title` | 是 | `{ "zh": "...", "en": "..." }` | 习题标题 |
| `description` | 是 | `{ "zh": "...", "en": "..." }` | 习题描述/题目 |
| `hints` | 推荐 | `{ "zh": ["..."], "en": ["..."] }` | 渐进式提示，1-3 条 |
| `explanation` | 推荐 | `{ "zh": "...", "en": "..." }` | 答对后显示的解析 |

---

## 编写习题的最佳实践

### 难度分级标准

| 难度 | 标签 | 适用场景 |
|------|------|---------|
| 1 | 入门 | 直接调用一个 API，一步完成 |
| 2 | 简单 | 需要知道正确的参数或小变化 |
| 3 | 中等 | 组合 2-3 个操作，需要理解概念 |
| 4 | 困难 | 多步骤，需要深入理解，边界情况 |
| 5 | 挑战 | 综合应用，性能优化，实战场景 |

### 编程题注意事项

1. **starterCode 必须包含 `import pandas as pd`**（除非 setupCode 已导入）
2. **使用 setupCode 预加载数据**，让学生专注于要学习的 API，而不是数据构造
3. **exact-output 验证注意空白**：pandas 输出格式（对齐空格）必须精确匹配。建议先在 Python 中运行一次确认
4. **优先使用 exact-output**，其次 custom-check，避免 dataframe-equals（因为列顺序和索引可能不同）
5. **solutionCode 必须是可直接运行的完整代码**（包含 import 语句）

### 选择题注意事项

1. 提供 3-4 个选项
2. 干扰项应该是常见的错误理解，而不是明显不合理的选项
3. 代码相关的选项中英文通常相同（代码不需要翻译）

### 双语规则

- 所有用户可见文本必须提供 `zh` 和 `en`
- 代码（`starterCode`、`solutionCode`、`setupCode`、`code`、`codeTemplate`、`checkCode`）语言无关，只写一份
- 代码中的注释建议用英文（Python 社区惯例）
- `options` 中如果是纯代码，中英文内容相同

### 每课习题建议

- 每课 4-6 道题
- 至少 1 道选择/判断 + 1 道编程/填空 + 1 道输出预测
- 难度在课内递增（第一题最简单，最后一题最难）
- 覆盖该课的核心知识点

---

## 批量操作示例

### 为某课程追加 3 道题

读取现有文件 → 在 `exercises` 数组末尾追加 3 个对象 → 确认 id 唯一 → 写入文件。

### 调整某题难度

搜索 `id` → 修改 `difficulty` 字段 → 写入文件。

### 查看当前题库统计

```bash
# 各阶段题目数
for stage in stage1 stage2 stage3 stage4; do
  count=$(grep -r '"id":' src/data/exercises/$stage/ | wc -l)
  echo "$stage: $count exercises"
done

# 各题型分布
for type in multiple-choice true-false fill-blank coding output-matching; do
  count=$(grep -rc "\"type\": \"$type\"" src/data/exercises/stage*/ | awk -F: '{sum+=$2}END{print sum}')
  echo "$type: $count"
done
```

---

## 关键文件路径

| 文件 | 作用 | 何时需要改动 |
|------|------|-------------|
| `src/data/exercises/stage{N}/*.json` | 习题内容 | 增删改习题时 |
| `src/data/exercises/_schema.json` | JSON Schema | 极少改动，仅当新增字段时 |
| `src/lib/exercises.ts` | 习题加载器（import 注册） | **新增/删除 JSON 文件时必须同步修改** |
| `src/data/curriculum.json` | 课程结构（阶段、课程定义） | 新增课程模块时 |

**最容易遗忘的步骤**：新建 JSON 文件后，必须在 `src/lib/exercises.ts` 中添加 import 和数组条目，否则新文件不会被加载。
