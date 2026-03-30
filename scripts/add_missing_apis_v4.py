"""Final round: add truly missing APIs. Skip things already covered in combined entries."""
import json

with open('src/data/reference/cheatsheet.json') as f:
    data = json.load(f)

topics_map = {t['id']: t for t in data['topics']}

def add(topic_id, item, idx=0):
    apis = [s for s in topics_map[topic_id]['sections'] if s['type'] == 'api-table']
    if apis:
        apis[idx]['items'].append(item)

# === RESHAPE: wide_to_long (important, unique functionality) ===
add('pivot-reshape', {
    "name": "pd.wide_to_long()",
    "desc": {"zh": "宽表转长表（按列名前缀+数字后缀拆分）", "en": "Wide to long format (split columns by prefix + numeric suffix)"},
    "signature": "pd.wide_to_long(df, stubnames, i, j, sep='', suffix='\\d+')",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({\n    'id': [1, 2],\n    'score_2022': [80, 90],\n    'score_2023': [85, 95],\n    'rank_2022': [3, 1],\n    'rank_2023': [2, 1]\n})\nresult = pd.wide_to_long(df, stubnames=['score', 'rank'], i='id', j='year', sep='_')\nprint(result.reset_index())",
    "output": "   id  year  score  rank\n0   1  2022     80     3\n1   1  2023     85     2\n2   2  2022     90     1\n3   2  2023     95     1",
    "params": [
        {"name": "stubnames", "type": "list[str]", "default": "required", "desc": {"zh": "列名前缀列表，如 ['score', 'rank']", "en": "Column name prefixes, e.g. ['score', 'rank']"}},
        {"name": "i", "type": "str | list", "default": "required", "desc": {"zh": "行标识列（不参与转换）", "en": "ID column(s) (not transformed)"}},
        {"name": "j", "type": "str", "default": "required", "desc": {"zh": "新列名，存放后缀值（如年份）", "en": "New column name for suffix values (e.g. year)"}},
        {"name": "sep", "type": "str", "default": "''", "desc": {"zh": "前缀和后缀之间的分隔符", "en": "Separator between prefix and suffix"}},
        {"name": "suffix", "type": "str", "default": "'\\\\d+'", "desc": {"zh": "后缀的正则匹配模式", "en": "Regex pattern for suffix matching"}}
    ],
    "tags": ["wide_to_long", "reshape", "unpivot", "panel", "longitudinal"]
})

# === MERGE: merge_ordered ===
add('merge-concat', {
    "name": "pd.merge_ordered()",
    "desc": {"zh": "有序合并（适合时间序列，自动填充缺失）", "en": "Ordered merge (for time series, with fill methods)"},
    "signature": "pd.merge_ordered(left, right, on=None, fill_method=None, suffixes=('_x', '_y'))",
    "example": "import pandas as pd\n\ndf1 = pd.DataFrame({'date': ['2024-01', '2024-03'], 'A': [1, 3]})\ndf2 = pd.DataFrame({'date': ['2024-01', '2024-02', '2024-03'], 'B': [10, 20, 30]})\nprint(pd.merge_ordered(df1, df2, on='date', fill_method='ffill'))",
    "output": "      date    A   B\n0  2024-01  1.0  10\n1  2024-02  1.0  20\n2  2024-03  3.0  30",
    "params": [
        {"name": "on", "type": "str | list", "default": "None", "desc": {"zh": "合并键", "en": "Join key(s)"}},
        {"name": "fill_method", "type": "str", "default": "None", "desc": {"zh": "'ffill'=向前填充缺失值", "en": "'ffill'=forward fill missing values"}}
    ],
    "tags": ["merge_ordered", "time_series", "ordered", "fill"]
})

# === GROUPBY extras ===
add('groupby', {
    "name": "GroupBy.rank() / shift() / diff() / pct_change()",
    "desc": {"zh": "组内排名/移位/差分/变化率", "en": "Within-group rank/shift/diff/pct_change"},
    "signature": "GroupBy.rank(method='average', ascending=True)\nGroupBy.shift(periods=1)\nGroupBy.diff(periods=1)\nGroupBy.pct_change(periods=1)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'g': ['A','A','A','B','B','B'], 'v': [10,20,30,100,200,300]})\ndf['rank'] = df.groupby('g')['v'].rank()\ndf['prev'] = df.groupby('g')['v'].shift(1)\ndf['change'] = df.groupby('g')['v'].pct_change()\nprint(df)",
    "output": "   g    v  rank   prev    change\n0  A   10   1.0    NaN       NaN\n1  A   20   2.0   10.0  1.000000\n2  A   30   3.0   20.0  0.500000\n3  B  100   1.0    NaN       NaN\n4  B  200   2.0  100.0  1.000000\n5  B  300   3.0  200.0  0.500000",
    "params": [
        {"name": "method", "type": "str", "default": "'average'", "desc": {"zh": "rank: 'average'/'min'/'max'/'first'/'dense'", "en": "rank: 'average'/'min'/'max'/'first'/'dense'"}},
        {"name": "periods", "type": "int", "default": "1", "desc": {"zh": "shift/diff/pct_change 的步长", "en": "Number of periods for shift/diff/pct_change"}}
    ],
    "tags": ["groupby", "rank", "shift", "diff", "pct_change", "window"]
})

add('groupby', {
    "name": "GroupBy.rolling() / expanding()",
    "desc": {"zh": "组内滚动/扩展窗口计算", "en": "Within-group rolling/expanding window calculations"},
    "signature": "GroupBy.rolling(window).mean()\nGroupBy.expanding().sum()",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'g': ['A','A','A','B','B','B'], 'v': [1,2,3,10,20,30]})\n# 每组内的累积求和\ndf['cumsum'] = df.groupby('g')['v'].expanding().sum().reset_index(drop=True)\n# 每组内的 2 期滚动均值\ndf['ma2'] = df.groupby('g')['v'].rolling(2).mean().reset_index(drop=True)\nprint(df)",
    "output": "   g   v  cumsum   ma2\n0  A   1     1.0   NaN\n1  A   2     3.0   1.5\n2  A   3     6.0   2.5\n3  B  10    10.0   NaN\n4  B  20    30.0  15.0\n5  B  30    60.0  25.0",
    "params": [
        {"name": "window", "type": "int", "default": "required", "desc": {"zh": "rolling 窗口大小", "en": "Rolling window size"}}
    ],
    "tags": ["groupby", "rolling", "expanding", "window", "cumulative"]
})

# === MISSING: ffill/bfill (standalone methods, pandas 2.0+) ===
add('missing-data', {
    "name": "df.ffill() / df.bfill()",
    "desc": {"zh": "向前填充 / 向后填充缺失值（替代 fillna(method=)）", "en": "Forward fill / backward fill NaN (replaces fillna(method=))"},
    "signature": "df.ffill(axis=0, limit=None)\ndf.bfill(axis=0, limit=None)",
    "example": "import pandas as pd\nimport numpy as np\n\ns = pd.Series([1, np.nan, np.nan, 4, np.nan])\nprint('ffill:', s.ffill().tolist())\nprint('bfill:', s.bfill().tolist())\nprint('ffill limit=1:', s.ffill(limit=1).tolist())",
    "output": "ffill: [1.0, 1.0, 1.0, 4.0, 4.0]\nbfill: [1.0, 1.0, 4.0, 4.0, nan]\nffill limit=1: [1.0, 1.0, nan, 4.0, 4.0]",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=沿行方向填充，1=沿列方向", "en": "0=fill along rows, 1=along columns"}},
        {"name": "limit", "type": "int", "default": "None", "desc": {"zh": "最多连续填充几个 NaN", "en": "Max consecutive NaN to fill"}}
    ],
    "tags": ["ffill", "bfill", "forward", "backward", "fill", "missing"]
})

# === DATETIME: period_range, timedelta_range ===
add('datetime', {
    "name": "pd.period_range() / pd.timedelta_range()",
    "desc": {"zh": "生成 Period 序列 / Timedelta 序列", "en": "Generate Period range / Timedelta range"},
    "signature": "pd.period_range(start, end=None, periods=None, freq='M')\npd.timedelta_range(start, end=None, periods=None, freq='h')",
    "example": "import pandas as pd\n\nprint(pd.period_range('2024-01', periods=4, freq='Q'))\nprint('---')\nprint(pd.timedelta_range('0h', periods=5, freq='6h'))",
    "output": "PeriodIndex(['2024Q1', '2024Q2', '2024Q3', '2024Q4'], dtype='period[Q-DEC]')\n---\nTimedeltaIndex(['0 days 00:00:00', '0 days 06:00:00', '0 days 12:00:00',\n                '0 days 18:00:00', '1 days 00:00:00'], dtype='timedelta64[ns]', freq='6h')",
    "params": [
        {"name": "start", "type": "str", "default": "required", "desc": {"zh": "起始值", "en": "Start value"}},
        {"name": "periods", "type": "int", "default": "None", "desc": {"zh": "生成个数", "en": "Number of periods"}},
        {"name": "freq", "type": "str", "default": "required", "desc": {"zh": "频率：'M'=月,'Q'=季,'h'=时,'min'=分", "en": "Frequency: 'M'=month,'Q'=quarter,'h'=hour,'min'=minute"}}
    ],
    "tags": ["period_range", "timedelta_range", "generate", "sequence"]
})

# Final
total = sum(len(s['items']) for t in data['topics'] for s in t['sections'])
apis = sum(len(s['items']) for t in data['topics'] for s in t['sections'] if s['type'] == 'api-table')
print(f"Final: {len(data['topics'])} topics, {total} items, {apis} APIs")

with open('src/data/reference/cheatsheet.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved.")
