"""Add 44 missing API items to cheatsheet.json"""
import json

with open('src/data/reference/cheatsheet.json') as f:
    data = json.load(f)

topics_map = {t['id']: t for t in data['topics']}

def get_api_section(topic_id, section_idx=0):
    topic = topics_map[topic_id]
    apis = [s for s in topic['sections'] if s['type'] == 'api-table']
    return apis[section_idx] if apis else None

def add(topic_id, item, section_idx=0):
    sec = get_api_section(topic_id, section_idx)
    if sec:
        sec['items'].append(item)

# === MULTIINDEX ===
add('multiindex', {
    "name": "MultiIndex.from_product()",
    "desc": {"zh": "从多个列表的笛卡尔积创建 MultiIndex", "en": "Create MultiIndex from cartesian product of iterables"},
    "signature": "pd.MultiIndex.from_product(iterables, names=None)",
    "example": "import pandas as pd\n\nidx = pd.MultiIndex.from_product(\n    [['2023', '2024'], ['Q1', 'Q2', 'Q3', 'Q4']],\n    names=['year', 'quarter']\n)\nprint(idx)\nprint(f'共 {len(idx)} 个组合')",
    "output": "MultiIndex([('2023', 'Q1'), ('2023', 'Q2'), ('2023', 'Q3'), ('2023', 'Q4'),\n            ('2024', 'Q1'), ('2024', 'Q2'), ('2024', 'Q3'), ('2024', 'Q4')],\n           names=['year', 'quarter'])\n共 8 个组合",
    "params": [
        {"name": "iterables", "type": "list[list]", "default": "required", "desc": {"zh": "每个列表对应一个层级，取笛卡尔积", "en": "Each list becomes one level, cartesian product taken"}},
        {"name": "names", "type": "list[str]", "default": "None", "desc": {"zh": "每个层级的名称", "en": "Names for each level"}}
    ],
    "tags": ["multiindex", "from_product", "cartesian", "create"]
})

add('multiindex', {
    "name": "MultiIndex.from_arrays()",
    "desc": {"zh": "从多个等长数组创建 MultiIndex", "en": "Create MultiIndex from arrays of equal length"},
    "signature": "pd.MultiIndex.from_arrays(arrays, names=None)",
    "example": "import pandas as pd\n\nidx = pd.MultiIndex.from_arrays(\n    [['Eng', 'Eng', 'Sales', 'Sales'],\n     ['Alice', 'Bob', 'Charlie', 'Diana']],\n    names=['dept', 'name']\n)\nprint(idx)",
    "output": "MultiIndex([('Eng', 'Alice'), ('Eng', 'Bob'), ('Sales', 'Charlie'), ('Sales', 'Diana')],\n           names=['dept', 'name'])",
    "params": [
        {"name": "arrays", "type": "list[array-like]", "default": "required", "desc": {"zh": "等长数组列表，每个数组对应一个层级", "en": "List of equal-length arrays, each becomes one level"}},
        {"name": "names", "type": "list[str]", "default": "None", "desc": {"zh": "每个层级的名称", "en": "Names for each level"}}
    ],
    "tags": ["multiindex", "from_arrays", "create"]
})

add('multiindex', {
    "name": "MultiIndex.from_tuples()",
    "desc": {"zh": "从元组列表创建 MultiIndex", "en": "Create MultiIndex from list of tuples"},
    "signature": "pd.MultiIndex.from_tuples(tuples, names=None)",
    "example": "import pandas as pd\n\nidx = pd.MultiIndex.from_tuples(\n    [('A', 1), ('A', 2), ('B', 1), ('B', 2)],\n    names=['letter', 'number']\n)\nprint(idx)",
    "output": "MultiIndex([('A', 1), ('A', 2), ('B', 1), ('B', 2)],\n           names=['letter', 'number'])",
    "params": [
        {"name": "tuples", "type": "list[tuple]", "default": "required", "desc": {"zh": "元组列表，每个元组是一个索引项", "en": "List of tuples, each tuple is one index entry"}},
        {"name": "names", "type": "list[str]", "default": "None", "desc": {"zh": "每个层级的名称", "en": "Names for each level"}}
    ],
    "tags": ["multiindex", "from_tuples", "create"]
})

add('multiindex', {
    "name": "MultiIndex.from_frame()",
    "desc": {"zh": "从 DataFrame 的列创建 MultiIndex", "en": "Create MultiIndex from DataFrame columns"},
    "signature": "pd.MultiIndex.from_frame(df, names=None)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'dept': ['Eng', 'Sales'], 'year': [2023, 2024]})\nidx = pd.MultiIndex.from_frame(df)\nprint(idx)",
    "output": "MultiIndex([('Eng', 2023), ('Sales', 2024)],\n           names=['dept', 'year'])",
    "params": [
        {"name": "df", "type": "DataFrame", "default": "required", "desc": {"zh": "每列对应一个层级", "en": "Each column becomes one level"}},
        {"name": "names", "type": "list[str]", "default": "None", "desc": {"zh": "覆盖列名作为层级名", "en": "Override column names as level names"}}
    ],
    "tags": ["multiindex", "from_frame", "create"]
})

add('multiindex', {
    "name": "pd.Index()",
    "desc": {"zh": "创建普通索引对象", "en": "Create an Index object"},
    "signature": "pd.Index(data, dtype=None, name=None)",
    "example": "import pandas as pd\n\nidx = pd.Index(['a', 'b', 'c'], name='letter')\nprint(idx)\nprint(idx.dtype)",
    "output": "Index(['a', 'b', 'c'], dtype='object', name='letter')\nobject",
    "params": [
        {"name": "data", "type": "array-like", "default": "required", "desc": {"zh": "索引数据", "en": "Index data"}},
        {"name": "dtype", "type": "str | type", "default": "None", "desc": {"zh": "数据类型", "en": "Data type"}},
        {"name": "name", "type": "str", "default": "None", "desc": {"zh": "索引名称", "en": "Index name"}}
    ],
    "tags": ["index", "create"]
})

add('multiindex', {
    "name": "idx.intersection() / union() / difference()",
    "desc": {"zh": "索引集合运算：交集/并集/差集", "en": "Index set operations: intersection/union/difference"},
    "signature": "idx1.intersection(idx2)\nidx1.union(idx2)\nidx1.difference(idx2)",
    "example": "import pandas as pd\n\na = pd.Index([1, 2, 3, 4])\nb = pd.Index([3, 4, 5, 6])\nprint('交集:', a.intersection(b).tolist())\nprint('并集:', a.union(b).tolist())\nprint('差集:', a.difference(b).tolist())",
    "output": "交集: [3, 4]\n并集: [1, 2, 3, 4, 5, 6]\n差集: [1, 2]",
    "params": [
        {"name": "other", "type": "Index", "default": "required", "desc": {"zh": "另一个索引", "en": "The other Index"}}
    ],
    "tags": ["index", "intersection", "union", "difference", "set"]
})

# === STATS ===
add('stats', {
    "name": "df.all() / df.any()",
    "desc": {"zh": "检查是否全部/任一为 True", "en": "Check if all/any values are True"},
    "signature": "df.all(axis=0, skipna=True) / df.any(axis=0, skipna=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [True, True, False], 'B': [True, False, False]})\nprint('all:', df.all().tolist())\nprint('any:', df.any().tolist())",
    "output": "all: [False, False]\nany: [True, True]",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=按列检查，1=按行检查", "en": "0=check per column, 1=per row"}},
        {"name": "skipna", "type": "bool", "default": "True", "desc": {"zh": "是否跳过 NaN", "en": "Whether to skip NaN"}}
    ],
    "tags": ["all", "any", "boolean", "check"]
})

add('stats', {
    "name": "df.abs()",
    "desc": {"zh": "取绝对值", "en": "Return absolute values"},
    "signature": "df.abs()",
    "example": "import pandas as pd\n\ns = pd.Series([-3, -1, 0, 2, 5])\nprint(s.abs())",
    "output": "0    3\n1    1\n2    0\n3    2\n4    5\ndtype: int64",
    "params": [],
    "tags": ["abs", "absolute", "math"]
})

add('stats', {
    "name": "df.round()",
    "desc": {"zh": "四舍五入到指定小数位", "en": "Round values to given number of decimals"},
    "signature": "df.round(decimals=0)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1.234, 5.678], 'B': [9.1, 2.99]})\nprint(df.round(1))\nprint('---')\nprint(df.round({'A': 0, 'B': 2}))",
    "output": "     A    B\n0  1.2  9.1\n1  5.7  3.0\n---\n     A     B\n0  1.0  9.10\n1  6.0  2.99",
    "params": [
        {"name": "decimals", "type": "int | dict", "default": "0", "desc": {"zh": "小数位数；字典可指定每列不同位数", "en": "Decimal places; dict for per-column precision"}}
    ],
    "tags": ["round", "decimal", "precision"]
})

add('stats', {
    "name": "df.mode()",
    "desc": {"zh": "返回众数（出现次数最多的值）", "en": "Return mode (most frequent value)"},
    "signature": "df.mode(axis=0, numeric_only=False, dropna=True)",
    "example": "import pandas as pd\n\ns = pd.Series([1, 2, 2, 3, 3, 3])\nprint(s.mode())",
    "output": "0    3\ndtype: int64",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=每列众数，1=每行众数", "en": "0=mode per column, 1=per row"}},
        {"name": "dropna", "type": "bool", "default": "True", "desc": {"zh": "是否排除 NaN", "en": "Whether to exclude NaN"}}
    ],
    "tags": ["mode", "frequent", "statistics"]
})

add('stats', {
    "name": "df.skew() / df.kurt()",
    "desc": {"zh": "计算偏度（分布不对称性）/ 峰度（尾部厚度）", "en": "Skewness (asymmetry) / Kurtosis (tail heaviness)"},
    "signature": "df.skew(axis=0, skipna=True, numeric_only=False)\ndf.kurt(axis=0, skipna=True, numeric_only=False)",
    "example": "import pandas as pd\nimport numpy as np\n\nnp.random.seed(42)\ns = pd.Series(np.random.exponential(1, 1000))\nprint(f'skew: {s.skew():.2f}')  # 正偏=右偏\nprint(f'kurt: {s.kurt():.2f}')  # >0=厚尾",
    "output": "skew: 2.03\nkurt: 5.80",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=按列，1=按行", "en": "0=per column, 1=per row"}},
        {"name": "skipna", "type": "bool", "default": "True", "desc": {"zh": "是否跳过 NaN", "en": "Whether to skip NaN"}}
    ],
    "tags": ["skew", "kurtosis", "distribution", "statistics"]
})

# === IO ===
add('io', {
    "name": "pd.read_parquet()",
    "desc": {"zh": "读取 Parquet 文件（列式存储，比 CSV 快且小）", "en": "Read Parquet file (columnar, faster and smaller than CSV)"},
    "signature": "pd.read_parquet(path, engine='auto', columns=None)",
    "example": "import pandas as pd\n\n# df = pd.read_parquet('data.parquet')\n# 只读取特定列（Parquet 支持列裁剪，不读无关列）\n# df = pd.read_parquet('data.parquet', columns=['name', 'age'])",
    "output": "# Parquet 比 CSV 快 5-10x，文件小 50-80%",
    "params": [
        {"name": "path", "type": "str | Path", "default": "required", "desc": {"zh": "文件路径或 URL", "en": "File path or URL"}},
        {"name": "engine", "type": "str", "default": "'auto'", "desc": {"zh": "'pyarrow'(推荐) 或 'fastparquet'", "en": "'pyarrow'(recommended) or 'fastparquet'"}},
        {"name": "columns", "type": "list[str]", "default": "None", "desc": {"zh": "只读取指定列（列裁剪，大幅加速）", "en": "Only read specified columns (column pruning, much faster)"}}
    ],
    "tags": ["parquet", "read", "columnar", "fast"]
})

add('io', {
    "name": "df.to_json()",
    "desc": {"zh": "导出为 JSON 格式", "en": "Export to JSON format"},
    "signature": "df.to_json(path=None, orient='columns', lines=False, indent=None)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30]})\nprint(df.to_json(orient='records', indent=2))",
    "output": "[\n  {\"name\": \"Alice\", \"age\": 25},\n  {\"name\": \"Bob\", \"age\": 30}\n]",
    "params": [
        {"name": "orient", "type": "str", "default": "'columns'", "desc": {"zh": "'records'=行列表, 'columns'=列字典, 'index'=行字典, 'split'=分离", "en": "'records'=row list, 'columns'=col dict, 'index'=row dict, 'split'=separated"}},
        {"name": "lines", "type": "bool", "default": "False", "desc": {"zh": "True=每行一个 JSON 对象（JSONL 格式）", "en": "True=one JSON object per line (JSONL format)"}},
        {"name": "indent", "type": "int", "default": "None", "desc": {"zh": "缩进空格数，美化输出", "en": "Indentation spaces for pretty printing"}}
    ],
    "tags": ["json", "export", "write", "serialize"]
})

add('io', {
    "name": "df.to_dict()",
    "desc": {"zh": "转为 Python 字典", "en": "Convert to Python dictionary"},
    "signature": "df.to_dict(orient='dict')",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30]})\nprint(df.to_dict('records'))\nprint(df.to_dict('list'))",
    "output": "[{'name': 'Alice', 'age': 25}, {'name': 'Bob', 'age': 30}]\n{'name': ['Alice', 'Bob'], 'age': [25, 30]}",
    "params": [
        {"name": "orient", "type": "str", "default": "'dict'", "desc": {"zh": "'dict'=嵌套字典, 'list'=列:值列表, 'records'=行字典列表, 'index'=行索引字典", "en": "'dict'=nested, 'list'=col:values, 'records'=row dicts, 'index'=row index dict"}}
    ],
    "tags": ["dict", "convert", "export", "python"]
})

add('io', {
    "name": "pd.read_html()",
    "desc": {"zh": "从 HTML 网页中读取表格", "en": "Read tables from HTML page"},
    "signature": "pd.read_html(io, match=None, header=None, index_col=None)",
    "example": "import pandas as pd\n\n# 读取网页中所有表格，返回 DataFrame 列表\n# tables = pd.read_html('https://example.com/page')\n# df = tables[0]  # 取第一个表格\n\n# 用 match 筛选包含特定文本的表格\n# tables = pd.read_html(url, match='Revenue')",
    "output": "# 返回 list[DataFrame]，每个 <table> 一个",
    "params": [
        {"name": "io", "type": "str | Path", "default": "required", "desc": {"zh": "URL、文件路径或 HTML 字符串", "en": "URL, file path, or HTML string"}},
        {"name": "match", "type": "str | regex", "default": "None", "desc": {"zh": "只返回包含匹配文本的表格", "en": "Only return tables containing matching text"}},
        {"name": "header", "type": "int | list", "default": "None", "desc": {"zh": "用第几行做列名", "en": "Row(s) to use as column header"}}
    ],
    "tags": ["html", "web", "scrape", "table", "read"]
})

# === DATETIME ===
add('datetime', {
    "name": "pd.offsets (BDay, MonthEnd, etc.)",
    "desc": {"zh": "日期偏移量：工作日、月末、季末等", "en": "Date offsets: business day, month end, quarter end, etc."},
    "signature": "pd.offsets.BDay(n)\npd.offsets.MonthEnd(n)\npd.offsets.YearEnd(n)",
    "example": "import pandas as pd\n\nts = pd.Timestamp('2024-01-15')\nprint(ts + pd.offsets.BDay(5))     # +5 个工作日\nprint(ts + pd.offsets.MonthEnd(0)) # 当月月末\nprint(ts + pd.offsets.MonthEnd(1)) # 下月月末",
    "output": "2024-01-22 00:00:00\n2024-01-31 00:00:00\n2024-02-29 00:00:00",
    "params": [
        {"name": "n", "type": "int", "default": "1", "desc": {"zh": "偏移量个数，0=当前周期末", "en": "Number of offsets, 0=end of current period"}}
    ],
    "tags": ["offsets", "bday", "monthend", "yearend", "business"]
})

add('datetime', {
    "name": "pd.Period()",
    "desc": {"zh": "表示一个时间段（月/季/年）", "en": "Represents a time span (month/quarter/year)"},
    "signature": "pd.Period(value, freq=None)",
    "example": "import pandas as pd\n\np = pd.Period('2024-03', freq='M')\nprint(p)\nprint(f'起始: {p.start_time}')\nprint(f'结束: {p.end_time}')\nprint(f'下一期: {p + 1}')",
    "output": "2024-03\n起始: 2024-03-01 00:00:00\n结束: 2024-03-31 23:59:59.999999999\n下一期: 2024-04",
    "params": [
        {"name": "value", "type": "str | int", "default": "required", "desc": {"zh": "时间段字符串，如 '2024-Q1'、'2024-03'", "en": "Period string, e.g. '2024-Q1', '2024-03'"}},
        {"name": "freq", "type": "str", "default": "None", "desc": {"zh": "'D'=日, 'M'=月, 'Q'=季, 'Y'=年", "en": "'D'=day, 'M'=month, 'Q'=quarter, 'Y'=year"}}
    ],
    "tags": ["period", "timespan", "month", "quarter", "year"]
})

# === INSPECTION ===
add('inspection', {
    "name": "df.T / df.transpose()",
    "desc": {"zh": "转置 DataFrame（行列互换）", "en": "Transpose DataFrame (swap rows and columns)"},
    "signature": "df.T / df.transpose()",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30], 'city': ['BJ', 'SH']})\nprint(df.T)",
    "output": "         0    1\nname  Alice  Bob\nage      25   30\ncity     BJ   SH",
    "params": [],
    "tags": ["transpose", "T", "swap", "rows", "columns"]
})

add('inspection', {
    "name": "df.equals()",
    "desc": {"zh": "精确比较两个 DataFrame 是否完全相同（包括 NaN）", "en": "Test if two DataFrames are exactly equal (NaN-safe)"},
    "signature": "df.equals(other)",
    "example": "import pandas as pd\nimport numpy as np\n\ndf1 = pd.DataFrame({'A': [1, np.nan]})\ndf2 = pd.DataFrame({'A': [1, np.nan]})\nprint(df1.equals(df2))  # True，NaN == NaN\nprint((df1 == df2).all().all())  # False，NaN != NaN",
    "output": "True\nFalse",
    "params": [
        {"name": "other", "type": "DataFrame", "default": "required", "desc": {"zh": "要比较的另一个 DataFrame", "en": "The other DataFrame to compare with"}}
    ],
    "tags": ["equals", "compare", "identical", "nan"]
})

add('inspection', {
    "name": "df.compare()",
    "desc": {"zh": "显示两个 DataFrame 之间的差异", "en": "Show differences between two DataFrames"},
    "signature": "df.compare(other, align_axis=1, keep_shape=False, keep_equal=False)",
    "example": "import pandas as pd\n\ndf1 = pd.DataFrame({'A': [1, 2, 3], 'B': ['x', 'y', 'z']})\ndf2 = pd.DataFrame({'A': [1, 20, 3], 'B': ['x', 'y', 'w']})\nprint(df1.compare(df2))",
    "output": "     A          B\n  self other self other\n1  2.0  20.0  NaN   NaN\n2  NaN   NaN    z     w",
    "params": [
        {"name": "other", "type": "DataFrame", "default": "required", "desc": {"zh": "要比较的 DataFrame", "en": "DataFrame to compare against"}},
        {"name": "keep_shape", "type": "bool", "default": "False", "desc": {"zh": "True=保持原始形状（不省略相同行）", "en": "True=keep original shape (don't omit equal rows)"}},
        {"name": "keep_equal", "type": "bool", "default": "False", "desc": {"zh": "True=也显示相同的值", "en": "True=also show equal values"}}
    ],
    "tags": ["compare", "diff", "difference", "debug"]
})

# === PERFORMANCE ===
add('performance', {
    "name": "df.iterrows() / itertuples() / items()",
    "desc": {"zh": "遍历行/列的三种方式（性能差异巨大）", "en": "Three ways to iterate rows/cols (huge performance difference)"},
    "signature": "df.iterrows()   # 慢，返回 (index, Series)\ndf.itertuples() # 快 10-100x，返回 namedtuple\ndf.items()      # 按列遍历，返回 (col_name, Series)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30]})\n\n# itertuples 比 iterrows 快 10-100x\nfor row in df.itertuples():\n    print(f'{row.name}: {row.age}')\n\n# 但向量化比两者都快 100-1000x\n# df['age'] * 2  ← 优先用这个",
    "output": "Alice: 25\nBob: 30",
    "params": [
        {"name": "index", "type": "bool", "default": "True", "desc": {"zh": "itertuples: 是否包含索引", "en": "itertuples: whether to include index"}},
        {"name": "name", "type": "str", "default": "'Pandas'", "desc": {"zh": "itertuples: namedtuple 的名字", "en": "itertuples: name of the namedtuple"}}
    ],
    "tags": ["iterrows", "itertuples", "items", "iterate", "loop", "slow"]
})

add('performance', {
    "name": "pd.set_option() / pd.get_option()",
    "desc": {"zh": "设置/获取 pandas 全局显示选项", "en": "Set/get pandas global display options"},
    "signature": "pd.set_option(key, value)\npd.get_option(key)\npd.reset_option(key)",
    "example": "import pandas as pd\n\npd.set_option('display.max_rows', 100)\npd.set_option('display.max_columns', 20)\npd.set_option('display.float_format', '{:.2f}'.format)\nprint(pd.get_option('display.max_rows'))",
    "output": "100",
    "params": [
        {"name": "key", "type": "str", "default": "required", "desc": {"zh": "'display.max_rows/max_columns/float_format/max_colwidth/precision' 等", "en": "'display.max_rows/max_columns/float_format/max_colwidth/precision' etc."}}
    ],
    "tags": ["set_option", "get_option", "display", "config", "settings"]
})

add('performance', {
    "name": "pd.option_context()",
    "desc": {"zh": "临时修改选项（with 语句结束后自动恢复）", "en": "Temporarily change options (auto-restores after with block)"},
    "signature": "pd.option_context(key, value, ...)",
    "example": "import pandas as pd\n\nwith pd.option_context('display.max_rows', 5, 'display.float_format', '{:.1f}'.format):\n    print(pd.get_option('display.max_rows'))  # 5\nprint(pd.get_option('display.max_rows'))  # 恢复默认",
    "output": "5\n60",
    "params": [
        {"name": "key, value, ...", "type": "str, any, ...", "default": "required", "desc": {"zh": "成对传入 key-value，可同时设多个", "en": "Pass key-value pairs, can set multiple at once"}}
    ],
    "tags": ["option_context", "temporary", "with", "context"]
})

# === PIVOT-RESHAPE ===
add('pivot-reshape', {
    "name": "pd.get_dummies()",
    "desc": {"zh": "独热编码：将分类列展开为 0/1 列", "en": "One-hot encoding: expand categorical column into 0/1 columns"},
    "signature": "pd.get_dummies(data, columns=None, prefix=None, drop_first=False, dtype=float)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'color': ['red', 'blue', 'red', 'green'], 'size': [1, 2, 3, 1]})\nprint(pd.get_dummies(df, columns=['color'], drop_first=True))",
    "output": "   size  color_green  color_red\n0     1        False       True\n1     2        False      False\n2     3        False       True\n3     1         True      False",
    "params": [
        {"name": "columns", "type": "list[str]", "default": "None", "desc": {"zh": "要编码的列，None=所有 object/category 列", "en": "Columns to encode, None=all object/category"}},
        {"name": "prefix", "type": "str | list", "default": "None", "desc": {"zh": "新列名前缀", "en": "Prefix for new column names"}},
        {"name": "drop_first", "type": "bool", "default": "False", "desc": {"zh": "True=删除第一个类别（避免多重共线性）", "en": "True=drop first category (avoid multicollinearity)"}},
        {"name": "dtype", "type": "type", "default": "float", "desc": {"zh": "输出类型，bool 更省内存", "en": "Output dtype, bool saves memory"}}
    ],
    "tags": ["get_dummies", "one-hot", "encoding", "categorical", "dummy"]
})

add('pivot-reshape', {
    "name": "pd.factorize()",
    "desc": {"zh": "将值编码为整数 + 唯一值数组", "en": "Encode values as integers + unique values array"},
    "signature": "pd.factorize(values, sort=False, na_sentinel=-1)",
    "example": "import pandas as pd\n\ncodes, uniques = pd.factorize(['cat', 'dog', 'cat', 'bird', 'dog'])\nprint(f'codes: {codes}')\nprint(f'uniques: {uniques}')",
    "output": "codes: [0 1 0 2 1]\nuniques: ['cat' 'dog' 'bird']",
    "params": [
        {"name": "values", "type": "array-like", "default": "required", "desc": {"zh": "要编码的值", "en": "Values to encode"}},
        {"name": "sort", "type": "bool", "default": "False", "desc": {"zh": "True=按值排序编码", "en": "True=sort unique values before encoding"}}
    ],
    "tags": ["factorize", "encode", "integer", "label"]
})

# === CREATION ===
add('creation', {
    "name": "df.to_numpy() / df.values",
    "desc": {"zh": "转为 NumPy 数组", "en": "Convert to NumPy array"},
    "signature": "df.to_numpy(dtype=None, copy=False, na_value=None)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})\narr = df.to_numpy()\nprint(arr)\nprint(type(arr))",
    "output": "[[1 3]\n [2 4]]\n<class 'numpy.ndarray'>",
    "params": [
        {"name": "dtype", "type": "type", "default": "None", "desc": {"zh": "强制转换类型", "en": "Force output dtype"}},
        {"name": "copy", "type": "bool", "default": "False", "desc": {"zh": "True=返回副本，False=可能共享内存", "en": "True=return copy, False=may share memory"}},
        {"name": "na_value", "type": "scalar", "default": "None", "desc": {"zh": "NaN 的替换值", "en": "Value to replace NaN with"}}
    ],
    "tags": ["to_numpy", "values", "numpy", "array", "convert"]
})

# === MISSING-DATA ===
add('missing-data', {
    "name": "pd.NA / pd.NaT / np.nan",
    "desc": {"zh": "三种缺失值的区别和适用场景", "en": "Three types of missing values and their use cases"},
    "signature": "np.nan   # float NaN，传统方式\npd.NA    # pandas 2.0+ 的统一缺失值\npd.NaT   # 日期时间专用缺失值",
    "example": "import pandas as pd\nimport numpy as np\n\nprint(type(np.nan))    # float\nprint(type(pd.NA))     # NAType\nprint(type(pd.NaT))    # NaTType\n\n# np.nan 会让 int 列变 float\ns1 = pd.Series([1, np.nan])  # float64\n# pd.NA 保持 nullable int\ns2 = pd.Series([1, pd.NA], dtype='Int64')  # Int64",
    "output": "<class 'float'>\n<class 'pandas._libs.missing.NAType'>\n<class 'pandas._libs.tslibs.nattype.NaTType'>",
    "params": [],
    "tags": ["nan", "na", "nat", "missing", "null", "none"]
})

# === DUPLICATES ===
add('duplicates', {
    "name": "df.nunique()",
    "desc": {"zh": "统计每列的唯一值个数", "en": "Count unique values per column"},
    "signature": "df.nunique(axis=0, dropna=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1, 1, 2, 3], 'B': ['x', 'y', 'x', None]})\nprint(df.nunique())\nprint('---')\nprint(df.nunique(dropna=False))",
    "output": "A    3\nB    2\ndtype: int64\n---\nA    3\nB    3\ndtype: int64",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=每列计数，1=每行计数", "en": "0=per column, 1=per row"}},
        {"name": "dropna", "type": "bool", "default": "True", "desc": {"zh": "True=不把 NaN 算作唯一值", "en": "True=don't count NaN as unique"}}
    ],
    "tags": ["nunique", "unique", "count", "cardinality"]
})

# === RENAME-REINDEX ===
add('rename-reindex', {
    "name": "df.set_axis()",
    "desc": {"zh": "直接设置轴标签（行或列名）", "en": "Set axis labels (row or column names) directly"},
    "signature": "df.set_axis(labels, axis=0)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})\nprint(df.set_axis(['row1', 'row2']))\nprint('---')\nprint(df.set_axis(['col1', 'col2'], axis=1))",
    "output": "      A  B\nrow1  1  3\nrow2  2  4\n---\n   col1  col2\n0     1     3\n1     2     4",
    "params": [
        {"name": "labels", "type": "list", "default": "required", "desc": {"zh": "新的标签列表", "en": "New labels"}},
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=设置行标签，1=设置列标签", "en": "0=set row labels, 1=set column labels"}}
    ],
    "tags": ["set_axis", "labels", "rename", "index", "columns"]
})

# === STRING-METHODS ===
add('string-methods', {
    "name": "str.removeprefix() / str.removesuffix()",
    "desc": {"zh": "移除固定前缀/后缀", "en": "Remove fixed prefix/suffix"},
    "signature": "Series.str.removeprefix(prefix)\nSeries.str.removesuffix(suffix)",
    "example": "import pandas as pd\n\ns = pd.Series(['col_name', 'col_age', 'col_city'])\nprint(s.str.removeprefix('col_'))",
    "output": "0    name\n1     age\n2    city\ndtype: object",
    "params": [
        {"name": "prefix / suffix", "type": "str", "default": "required", "desc": {"zh": "要移除的前缀/后缀字符串", "en": "Prefix/suffix string to remove"}}
    ],
    "tags": ["removeprefix", "removesuffix", "strip", "clean"]
})

# === WINDOW ===
sec = get_api_section('window')
# Check if cummax/cummin already exists
has_cummax = any('cummax' in item['name'].lower() for item in sec['items'])
if not has_cummax:
    add('window', {
        "name": "cummax() / cummin()",
        "desc": {"zh": "累积最大值 / 累积最小值", "en": "Cumulative maximum / minimum"},
        "signature": "df.cummax(axis=0, skipna=True)\ndf.cummin(axis=0, skipna=True)",
        "example": "import pandas as pd\n\ns = pd.Series([3, 1, 4, 1, 5, 9, 2])\nprint('cummax:', s.cummax().tolist())\nprint('cummin:', s.cummin().tolist())",
        "output": "cummax: [3, 3, 4, 4, 5, 9, 9]\ncummin: [3, 1, 1, 1, 1, 1, 1]",
        "params": [
            {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=沿行方向累积", "en": "0=accumulate along rows"}},
            {"name": "skipna", "type": "bool", "default": "True", "desc": {"zh": "是否跳过 NaN", "en": "Whether to skip NaN"}}
        ],
        "tags": ["cummax", "cummin", "cumulative", "running"]
    })

# Final count
total = sum(len(s['items']) for t in data['topics'] for s in t['sections'])
apis = sum(len(s['items']) for t in data['topics'] for s in t['sections'] if s['type'] == 'api-table')
print(f"Final: {len(data['topics'])} topics, {total} items, {apis} APIs")

with open('src/data/reference/cheatsheet.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved.")
