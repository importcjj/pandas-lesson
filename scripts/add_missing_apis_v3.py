"""Add 16 remaining missing APIs"""
import json

with open('src/data/reference/cheatsheet.json') as f:
    data = json.load(f)

topics_map = {t['id']: t for t in data['topics']}

def add(topic_id, item, idx=0):
    apis = [s for s in topics_map[topic_id]['sections'] if s['type'] == 'api-table']
    if apis:
        apis[idx]['items'].append(item)

# === apply-map: df.transform() ===
add('apply-map', {
    "name": "df.transform(func)",
    "desc": {"zh": "逐列应用函数，返回与原 DataFrame 同形状", "en": "Apply function per column, return same shape as input"},
    "signature": "df.transform(func, axis=0, *args, **kwargs)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1, 2, 3], 'B': [10, 20, 30]})\n# 每列标准化\nprint(df.transform(lambda x: (x - x.mean()) / x.std()))",
    "output": "     A    B\n0 -1.0 -1.0\n1  0.0  0.0\n2  1.0  1.0",
    "params": [
        {"name": "func", "type": "callable | str | list | dict", "default": "required", "desc": {"zh": "函数、函数名字符串、列表或字典", "en": "Function, function name string, list, or dict"}},
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=按列，1=按行", "en": "0=per column, 1=per row"}}
    ],
    "tags": ["transform", "same-shape", "normalize", "standardize"]
})

# === inspection: assert_frame_equal ===
add('inspection', {
    "name": "pd.testing.assert_frame_equal()",
    "desc": {"zh": "断言两个 DataFrame 相等（测试用，不等时抛异常）", "en": "Assert two DataFrames are equal (raises exception if not)"},
    "signature": "pd.testing.assert_frame_equal(left, right, check_dtype=True, check_exact=False, atol=1e-5)",
    "example": "import pandas as pd\n\ndf1 = pd.DataFrame({'A': [1.0, 2.0]})\ndf2 = pd.DataFrame({'A': [1.0, 2.0]})\npd.testing.assert_frame_equal(df1, df2)  # 通过，无输出\n\n# 近似比较（浮点数）\npd.testing.assert_frame_equal(df1, df2, check_exact=False, atol=0.01)",
    "params": [
        {"name": "check_dtype", "type": "bool", "default": "True", "desc": {"zh": "True=也检查列类型是否一致", "en": "True=also check column dtypes match"}},
        {"name": "check_exact", "type": "bool", "default": "False", "desc": {"zh": "True=精确比较，False=允许浮点误差", "en": "True=exact comparison, False=allow float tolerance"}},
        {"name": "atol", "type": "float", "default": "1e-5", "desc": {"zh": "允许的绝对误差（check_exact=False 时）", "en": "Absolute tolerance (when check_exact=False)"}}
    ],
    "tags": ["assert", "test", "compare", "equal", "debug"]
})

# === creation: to_records ===
add('creation', {
    "name": "df.to_records()",
    "desc": {"zh": "转为 NumPy record array（带列名的结构化数组）", "en": "Convert to NumPy record array (structured array with column names)"},
    "signature": "df.to_records(index=True, column_dtypes=None)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30]})\nrec = df.to_records(index=False)\nprint(rec)\nprint(rec['name'])",
    "output": "[('Alice', 25) ('Bob', 30)]\n['Alice' 'Bob']",
    "params": [
        {"name": "index", "type": "bool", "default": "True", "desc": {"zh": "True=包含索引列", "en": "True=include index column"}}
    ],
    "tags": ["to_records", "numpy", "structured", "array"]
})

# === groupby: pd.Grouper ===
add('groupby', {
    "name": "pd.Grouper()",
    "desc": {"zh": "灵活指定分组方式（按时间频率、按列等）", "en": "Flexible grouping specification (by time freq, by column, etc.)"},
    "signature": "pd.Grouper(key=None, freq=None, axis=0, sort=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({\n    'date': pd.date_range('2024-01-01', periods=6, freq='M'),\n    'sales': [100, 120, 90, 150, 130, 110]\n})\n# 按季度分组\nprint(df.groupby(pd.Grouper(key='date', freq='QE')).sum())",
    "output": "            sales\ndate             \n2024-03-31    310\n2024-06-30    390",
    "params": [
        {"name": "key", "type": "str", "default": "None", "desc": {"zh": "要分组的列名", "en": "Column to group by"}},
        {"name": "freq", "type": "str", "default": "None", "desc": {"zh": "时间频率：'D'=日,'W'=周,'ME'=月末,'QE'=季末,'YE'=年末", "en": "Time frequency: 'D'=day,'W'=week,'ME'=month end,'QE'=quarter end,'YE'=year end"}}
    ],
    "tags": ["grouper", "groupby", "time", "frequency", "resample"]
})

# === multiindex: pd.IndexSlice ===
add('multiindex', {
    "name": "pd.IndexSlice",
    "desc": {"zh": "MultiIndex 切片辅助工具", "en": "Helper for MultiIndex slicing"},
    "signature": "idx = pd.IndexSlice\ndf.loc[idx['A':'B', 1:3], :]",
    "example": "import pandas as pd\n\nidx = pd.MultiIndex.from_product([['A','B','C'], [1,2,3]], names=['letter','num'])\ndf = pd.DataFrame({'val': range(9)}, index=idx)\n\nslc = pd.IndexSlice\nprint(df.loc[slc['A':'B', 2:], :])",
    "output": "            val\nletter num     \nA      2      1\n       3      2\nB      1      3\n       2      4\n       3      5",
    "params": [],
    "tags": ["indexslice", "multiindex", "slice", "loc"]
})

# === column-ops: df.replace (DataFrame level) ===
add('column-ops', {
    "name": "df.replace()",
    "desc": {"zh": "批量替换 DataFrame 中的值", "en": "Replace values in DataFrame"},
    "signature": "df.replace(to_replace, value=None, method=None, regex=False)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [0, 1, 2], 'B': ['yes', 'no', 'yes']})\n# 字典批量替换\nprint(df.replace({'yes': True, 'no': False, 0: None}))",
    "output": "      A      B\n0  None   True\n1     1  False\n2     2   True",
    "params": [
        {"name": "to_replace", "type": "str | dict | list | regex", "default": "required", "desc": {"zh": "要替换的值、字典映射或正则", "en": "Values to replace: scalar, dict, list, or regex"}},
        {"name": "value", "type": "scalar | dict", "default": "None", "desc": {"zh": "替换为的值", "en": "Replacement value"}},
        {"name": "regex", "type": "bool", "default": "False", "desc": {"zh": "True=to_replace 作为正则", "en": "True=treat to_replace as regex"}}
    ],
    "tags": ["replace", "substitute", "batch", "remap"]
})

# === datetime extras ===
add('datetime', {
    "name": "pd.bdate_range()",
    "desc": {"zh": "生成工作日日期范围（跳过周末）", "en": "Generate business day date range (skip weekends)"},
    "signature": "pd.bdate_range(start, end=None, periods=None, freq='B')",
    "example": "import pandas as pd\n\nprint(pd.bdate_range('2024-01-01', periods=5))",
    "output": "DatetimeIndex(['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'], dtype='datetime64[ns]', freq='B')",
    "params": [
        {"name": "start", "type": "str", "default": "required", "desc": {"zh": "起始日期", "en": "Start date"}},
        {"name": "periods", "type": "int", "default": "None", "desc": {"zh": "生成的工作日数量", "en": "Number of business days to generate"}}
    ],
    "tags": ["bdate_range", "business", "workday", "weekday"]
})

add('datetime', {
    "name": "df.between_time()",
    "desc": {"zh": "按时间段筛选行（需要 DatetimeIndex）", "en": "Select rows between times (requires DatetimeIndex)"},
    "signature": "df.between_time(start_time, end_time, inclusive='both')",
    "example": "import pandas as pd\n\nidx = pd.date_range('2024-01-01', periods=24, freq='h')\ndf = pd.DataFrame({'val': range(24)}, index=idx)\n# 只取 9:00-17:00 的数据\nprint(df.between_time('09:00', '17:00').head())",
    "output": "                     val\n2024-01-01 09:00:00    9\n2024-01-01 10:00:00   10\n2024-01-01 11:00:00   11\n2024-01-01 12:00:00   12\n2024-01-01 13:00:00   13",
    "params": [
        {"name": "start_time", "type": "str | time", "default": "required", "desc": {"zh": "起始时间，如 '09:00'", "en": "Start time, e.g. '09:00'"}},
        {"name": "end_time", "type": "str | time", "default": "required", "desc": {"zh": "结束时间，如 '17:00'", "en": "End time, e.g. '17:00'"}},
        {"name": "inclusive", "type": "str", "default": "'both'", "desc": {"zh": "'both'/'left'/'right'/'neither' 边界包含", "en": "'both'/'left'/'right'/'neither' boundary inclusion"}}
    ],
    "tags": ["between_time", "time", "filter", "hours"]
})

# === stats: idxmax/idxmin (DataFrame level) ===
add('stats', {
    "name": "df.idxmax() / df.idxmin()",
    "desc": {"zh": "返回每列最大/最小值对应的索引标签", "en": "Return index labels of max/min values per column"},
    "signature": "df.idxmax(axis=0, skipna=True)\ndf.idxmin(axis=0, skipna=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'math': [85, 92, 78], 'english': [90, 75, 88]}, index=['Alice', 'Bob', 'Charlie'])\nprint('最高分:', df.idxmax().to_dict())\nprint('最低分:', df.idxmin().to_dict())",
    "output": "最高分: {'math': 'Bob', 'english': 'Alice'}\n最低分: {'math': 'Charlie', 'english': 'Bob'}",
    "params": [
        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=每列找，1=每行找", "en": "0=per column, 1=per row"}},
        {"name": "skipna", "type": "bool", "default": "True", "desc": {"zh": "是否跳过 NaN", "en": "Whether to skip NaN"}}
    ],
    "tags": ["idxmax", "idxmin", "argmax", "argmin", "index"]
})

# Final
total = sum(len(s['items']) for t in data['topics'] for s in t['sections'])
apis = sum(len(s['items']) for t in data['topics'] for s in t['sections'] if s['type'] == 'api-table')
print(f"Final: {len(data['topics'])} topics, {total} items, {apis} APIs")

with open('src/data/reference/cheatsheet.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved.")
