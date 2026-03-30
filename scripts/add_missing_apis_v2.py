"""Add missing APIs v2: plot, styler, groupby extras, io extras, dt extras"""
import json

with open('src/data/reference/cheatsheet.json') as f:
    data = json.load(f)

topics_map = {t['id']: t for t in data['topics']}

def get_api_section(topic_id, idx=0):
    apis = [s for s in topics_map[topic_id]['sections'] if s['type'] == 'api-table']
    return apis[idx] if apis else None

def add(topic_id, item, idx=0):
    sec = get_api_section(topic_id, idx)
    if sec:
        sec['items'].append(item)

# ============================================================
# NEW TOPIC: 可视化 (Plot)
# ============================================================
plot_topic = {
    "id": "plot",
    "title": {"zh": "可视化 (plot)", "en": "Visualization (plot)"},
    "icon": "📊",
    "sections": [
        {
            "type": "api-table",
            "title": {"zh": "绘图 API", "en": "Plot APIs"},
            "items": [
                {
                    "name": "df.plot() / Series.plot()",
                    "desc": {"zh": "通用绘图入口，默认折线图", "en": "General plot method, defaults to line chart"},
                    "signature": "df.plot(x=None, y=None, kind='line', ax=None, figsize=None, title=None, legend=True, xlabel=None, ylabel=None)",
                    "example": "import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.DataFrame({'month': range(1,13), 'sales': [100,120,140,130,150,180,200,190,170,160,180,220]})\ndf.plot(x='month', y='sales', title='Monthly Sales')\nplt.show()",
                    "params": [
                        {"name": "kind", "type": "str", "default": "'line'", "desc": {"zh": "'line'/'bar'/'barh'/'hist'/'box'/'scatter'/'pie'/'area'/'kde'", "en": "'line'/'bar'/'barh'/'hist'/'box'/'scatter'/'pie'/'area'/'kde'"}},
                        {"name": "x, y", "type": "str", "default": "None", "desc": {"zh": "x/y 轴对应的列名", "en": "Column names for x/y axis"}},
                        {"name": "figsize", "type": "tuple", "default": "None", "desc": {"zh": "图片大小 (宽, 高) 英寸", "en": "Figure size (width, height) in inches"}},
                        {"name": "title", "type": "str", "default": "None", "desc": {"zh": "图表标题", "en": "Chart title"}},
                        {"name": "subplots", "type": "bool", "default": "False", "desc": {"zh": "True=每列单独画子图", "en": "True=separate subplot for each column"}},
                        {"name": "ax", "type": "Axes", "default": "None", "desc": {"zh": "在指定的 matplotlib Axes 上画图", "en": "Draw on specified matplotlib Axes"}}
                    ],
                    "tags": ["plot", "chart", "line", "visualization"]
                },
                {
                    "name": "df.plot.bar() / df.plot.barh()",
                    "desc": {"zh": "柱状图 / 水平柱状图", "en": "Bar chart / horizontal bar chart"},
                    "signature": "df.plot.bar(x=None, y=None, stacked=False)\ndf.plot.barh(x=None, y=None, stacked=False)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'city': ['BJ','SH','GZ'], 'sales': [300,450,280]})\ndf.plot.bar(x='city', y='sales', title='Sales by City')",
                    "params": [
                        {"name": "stacked", "type": "bool", "default": "False", "desc": {"zh": "True=堆叠柱状图", "en": "True=stacked bar chart"}},
                        {"name": "color", "type": "str | list", "default": "None", "desc": {"zh": "柱子颜色", "en": "Bar color(s)"}}
                    ],
                    "tags": ["plot", "bar", "barh", "chart"]
                },
                {
                    "name": "df.plot.hist()",
                    "desc": {"zh": "直方图（查看分布）", "en": "Histogram (view distribution)"},
                    "signature": "df.plot.hist(bins=10, alpha=0.5, stacked=False)",
                    "example": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({'score': np.random.normal(75, 10, 200)})\ndf.plot.hist(bins=20, title='Score Distribution')",
                    "params": [
                        {"name": "bins", "type": "int", "default": "10", "desc": {"zh": "分箱数量", "en": "Number of bins"}},
                        {"name": "alpha", "type": "float", "default": "0.5", "desc": {"zh": "透明度 0-1", "en": "Transparency 0-1"}},
                        {"name": "stacked", "type": "bool", "default": "False", "desc": {"zh": "True=堆叠", "en": "True=stacked"}}
                    ],
                    "tags": ["plot", "hist", "histogram", "distribution"]
                },
                {
                    "name": "df.plot.scatter()",
                    "desc": {"zh": "散点图（查看两变量关系）", "en": "Scatter plot (view relationship between two variables)"},
                    "signature": "df.plot.scatter(x, y, c=None, s=None, colormap=None)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'height': [160,165,170,175,180], 'weight': [50,55,65,70,80]})\ndf.plot.scatter(x='height', y='weight', title='Height vs Weight')",
                    "params": [
                        {"name": "x, y", "type": "str", "default": "required", "desc": {"zh": "x/y 轴列名", "en": "Column names for x/y axes"}},
                        {"name": "c", "type": "str | array", "default": "None", "desc": {"zh": "颜色列名或颜色数组", "en": "Column for color or color array"}},
                        {"name": "s", "type": "str | array", "default": "None", "desc": {"zh": "点大小列名或大小数组", "en": "Column for point size or size array"}}
                    ],
                    "tags": ["plot", "scatter", "correlation"]
                },
                {
                    "name": "df.plot.box()",
                    "desc": {"zh": "箱线图（查看分布和异常值）", "en": "Box plot (view distribution and outliers)"},
                    "signature": "df.plot.box(by=None, vert=True)",
                    "example": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({'A': np.random.normal(0,1,100), 'B': np.random.normal(2,1.5,100)})\ndf.plot.box(title='Distribution Comparison')",
                    "params": [
                        {"name": "by", "type": "str", "default": "None", "desc": {"zh": "按此列分组画箱线图", "en": "Column to group by"}},
                        {"name": "vert", "type": "bool", "default": "True", "desc": {"zh": "True=垂直，False=水平", "en": "True=vertical, False=horizontal"}}
                    ],
                    "tags": ["plot", "box", "boxplot", "outlier"]
                },
                {
                    "name": "df.plot.pie()",
                    "desc": {"zh": "饼图（查看比例）", "en": "Pie chart (view proportions)"},
                    "signature": "df.plot.pie(y, autopct='%1.1f%%', startangle=90)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'share': [40,30,20,10]}, index=['A','B','C','D'])\ndf.plot.pie(y='share', autopct='%1.0f%%', title='Market Share')",
                    "params": [
                        {"name": "y", "type": "str", "default": "required", "desc": {"zh": "数值列名", "en": "Column with values"}},
                        {"name": "autopct", "type": "str", "default": "None", "desc": {"zh": "百分比格式，如 '%1.1f%%'", "en": "Percentage format, e.g. '%1.1f%%'"}},
                        {"name": "startangle", "type": "int", "default": "0", "desc": {"zh": "起始角度", "en": "Start angle"}}
                    ],
                    "tags": ["plot", "pie", "proportion"]
                },
                {
                    "name": "df.plot.area()",
                    "desc": {"zh": "面积图（堆叠的折线图）", "en": "Area chart (stacked line chart)"},
                    "signature": "df.plot.area(stacked=True, alpha=0.5)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'Q1': [10,20,30], 'Q2': [15,25,35], 'Q3': [20,30,40]})\ndf.plot.area(stacked=True, title='Quarterly Revenue')",
                    "params": [
                        {"name": "stacked", "type": "bool", "default": "True", "desc": {"zh": "True=堆叠，False=重叠", "en": "True=stacked, False=overlapping"}}
                    ],
                    "tags": ["plot", "area", "stacked"]
                },
                {
                    "name": "df.plot.kde() / df.plot.density()",
                    "desc": {"zh": "核密度估计图（平滑的直方图）", "en": "Kernel density estimation (smoothed histogram)"},
                    "signature": "df.plot.kde(bw_method=None)",
                    "example": "import pandas as pd\nimport numpy as np\n\ns = pd.Series(np.random.normal(0, 1, 1000))\ns.plot.kde(title='Normal Distribution')",
                    "params": [
                        {"name": "bw_method", "type": "str | float", "default": "None", "desc": {"zh": "带宽方法，越小越贴合数据", "en": "Bandwidth method, smaller = fits data more closely"}}
                    ],
                    "tags": ["plot", "kde", "density", "distribution"]
                }
            ]
        },
        {
            "type": "patterns",
            "title": {"zh": "惯用写法", "en": "Common Patterns"},
            "items": [
                {"title": {"zh": "多图并排 (subplots)", "en": "Multiple subplots"}, "code": "import matplotlib.pyplot as plt\n\nfig, axes = plt.subplots(1, 3, figsize=(15, 4))\ndf['A'].plot.hist(ax=axes[0], title='Distribution A')\ndf.plot.scatter(x='A', y='B', ax=axes[1], title='A vs B')\ndf[['A','B']].plot.box(ax=axes[2], title='Box Plot')\nplt.tight_layout()\nplt.show()", "note": {"zh": "用 matplotlib 的 subplots + ax 参数组合多图", "en": "Use matplotlib subplots + ax parameter to combine multiple plots"}},
                {"title": {"zh": "保存图片", "en": "Save figure"}, "code": "ax = df.plot(title='My Chart')\nfig = ax.get_figure()\nfig.savefig('chart.png', dpi=150, bbox_inches='tight')\n\n# 或直接用 plt\nimport matplotlib.pyplot as plt\ndf.plot()\nplt.savefig('chart.pdf')", "note": {"zh": "savefig 支持 png/pdf/svg，bbox_inches='tight' 去掉多余白边", "en": "savefig supports png/pdf/svg, bbox_inches='tight' removes whitespace"}},
                {"title": {"zh": "中文显示", "en": "Chinese font support"}, "code": "import matplotlib.pyplot as plt\nplt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS']  # 黑体\nplt.rcParams['axes.unicode_minus'] = False  # 负号显示", "note": {"zh": "macOS 用 'Arial Unicode MS'，Windows 用 'SimHei' 或 'Microsoft YaHei'", "en": "macOS: 'Arial Unicode MS', Windows: 'SimHei' or 'Microsoft YaHei'"}}
            ]
        },
        {
            "type": "pitfalls",
            "title": {"zh": "踩坑提醒", "en": "Pitfalls"},
            "items": [
                {"title": {"zh": "Jupyter 中图片不显示", "en": "Plot not showing in Jupyter"}, "wrong": {"code": "df.plot()  # 什么都没显示", "note": {"zh": "某些环境需要显式调用 plt.show() 或设置 magic", "en": "Some environments need explicit plt.show() or magic command"}}, "right": {"code": "%matplotlib inline  # Jupyter magic\ndf.plot()\n# 或\nimport matplotlib.pyplot as plt\ndf.plot()\nplt.show()", "note": {"zh": "Jupyter 中加 %matplotlib inline，脚本中加 plt.show()", "en": "Add %matplotlib inline in Jupyter, plt.show() in scripts"}}},
                {"title": {"zh": "plot 返回 Axes 不是 Figure", "en": "plot returns Axes, not Figure"}, "wrong": {"code": "fig = df.plot()  # 这是 Axes，不是 Figure！\nfig.savefig('x.png')  # AttributeError", "note": {"zh": "plot() 返回 matplotlib Axes 对象", "en": "plot() returns matplotlib Axes object"}}, "right": {"code": "ax = df.plot()\nfig = ax.get_figure()  # 从 Axes 获取 Figure\nfig.savefig('x.png')", "note": {"zh": "通过 ax.get_figure() 获取 Figure 对象再保存", "en": "Get Figure from Axes via ax.get_figure(), then save"}}}
            ]
        }
    ]
}

# ============================================================
# NEW TOPIC: 样式 (Styler)
# ============================================================
styler_topic = {
    "id": "styler",
    "title": {"zh": "表格样式 (Styler)", "en": "Table Styling (Styler)"},
    "icon": "🎨",
    "sections": [
        {
            "type": "api-table",
            "title": {"zh": "Styler API", "en": "Styler APIs"},
            "items": [
                {
                    "name": "df.style.format()",
                    "desc": {"zh": "格式化显示值（不改变数据）", "en": "Format display values (doesn't change data)"},
                    "signature": "df.style.format(formatter=None, subset=None, precision=None)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'price': [1234.5, 678.9], 'change': [0.1234, -0.0567]})\ndf.style.format({'price': '${:,.0f}', 'change': '{:+.1%}'})",
                    "output": "price: $1,235 / $679\nchange: +12.3% / -5.7%",
                    "params": [
                        {"name": "formatter", "type": "str | dict | callable", "default": "None", "desc": {"zh": "格式字符串、字典（每列不同）或函数", "en": "Format string, dict (per column), or callable"}},
                        {"name": "precision", "type": "int", "default": "None", "desc": {"zh": "浮点数小数位数", "en": "Decimal places for floats"}},
                        {"name": "subset", "type": "IndexSlice", "default": "None", "desc": {"zh": "只格式化指定的行/列", "en": "Only format specified rows/columns"}}
                    ],
                    "tags": ["style", "format", "display", "currency", "percent"]
                },
                {
                    "name": "df.style.highlight_max() / highlight_min()",
                    "desc": {"zh": "高亮最大/最小值单元格", "en": "Highlight cells with max/min values"},
                    "signature": "df.style.highlight_max(color='yellow', axis=0, subset=None)\ndf.style.highlight_min(color='yellow', axis=0, subset=None)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'A': [1, 5, 3], 'B': [4, 2, 6]})\ndf.style.highlight_max(color='lightgreen').highlight_min(color='lightcoral')",
                    "params": [
                        {"name": "color", "type": "str", "default": "'yellow'", "desc": {"zh": "高亮颜色", "en": "Highlight color"}},
                        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=每列找最大/小，1=每行", "en": "0=per column, 1=per row"}}
                    ],
                    "tags": ["style", "highlight", "max", "min", "color"]
                },
                {
                    "name": "df.style.background_gradient()",
                    "desc": {"zh": "按值大小渐变背景色（热力图效果）", "en": "Gradient background color by value (heatmap effect)"},
                    "signature": "df.style.background_gradient(cmap='RdYlGn', axis=0, subset=None, vmin=None, vmax=None)",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'Q1': [80,60,90], 'Q2': [70,85,75]}, index=['A','B','C'])\ndf.style.background_gradient(cmap='RdYlGn')",
                    "params": [
                        {"name": "cmap", "type": "str", "default": "'PuBu'", "desc": {"zh": "颜色映射：'RdYlGn'(红黄绿)/'Blues'/'coolwarm'等", "en": "Colormap: 'RdYlGn'/'Blues'/'coolwarm' etc."}},
                        {"name": "axis", "type": "int", "default": "0", "desc": {"zh": "0=每列渐变，1=每行渐变，None=全局", "en": "0=per column, 1=per row, None=global"}}
                    ],
                    "tags": ["style", "gradient", "heatmap", "color"]
                },
                {
                    "name": "df.style.bar()",
                    "desc": {"zh": "在单元格内画条形图", "en": "Draw bar charts within cells"},
                    "signature": "df.style.bar(subset=None, color='#d65f5f', width=100, align='left')",
                    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['A','B','C'], 'score': [85, 92, 78]})\ndf.style.bar(subset='score', color='lightblue')",
                    "params": [
                        {"name": "color", "type": "str | list", "default": "'#d65f5f'", "desc": {"zh": "条形颜色，传列表=[负值色, 正值色]", "en": "Bar color, list=[negative, positive]"}},
                        {"name": "align", "type": "str", "default": "'left'", "desc": {"zh": "'left'=从左开始, 'mid'=从中间(0)开始, 'zero'=从零开始", "en": "'left'=from left, 'mid'=from center, 'zero'=from zero"}}
                    ],
                    "tags": ["style", "bar", "inline", "chart"]
                },
                {
                    "name": "df.style.to_html() / to_excel()",
                    "desc": {"zh": "导出样式化的表格为 HTML/Excel", "en": "Export styled table to HTML/Excel"},
                    "signature": "df.style.to_html()\ndf.style.to_excel(excel_writer, sheet_name='Sheet1')",
                    "example": "import pandas as pd\n\nstyled = df.style.format(precision=2).highlight_max()\n\n# 导出 HTML\nhtml = styled.to_html()\n\n# 导出 Excel（保留样式）\nstyled.to_excel('styled.xlsx', engine='openpyxl')",
                    "params": [],
                    "tags": ["style", "export", "html", "excel"]
                }
            ]
        },
        {
            "type": "patterns",
            "title": {"zh": "惯用写法", "en": "Common Patterns"},
            "items": [
                {"title": {"zh": "链式样式", "en": "Chained styling"}, "code": "(df.style\n    .format(precision=1)\n    .highlight_max(color='lightgreen')\n    .highlight_min(color='lightcoral')\n    .background_gradient(subset=['score'], cmap='Blues')\n    .bar(subset=['revenue'], color='lightblue')\n    .set_caption('Sales Report')\n)", "note": {"zh": "Styler 支持链式调用，从左到右依次应用", "en": "Styler supports chaining, applied left to right"}}
            ]
        }
    ]
}

# Insert plot and styler before confusing-apis
idx = next(i for i, t in enumerate(data['topics']) if t['id'] == 'confusing-apis')
data['topics'].insert(idx, styler_topic)
data['topics'].insert(idx, plot_topic)

# ============================================================
# GROUPBY EXTRAS
# ============================================================
add('groupby', {
    "name": "GroupBy.first() / last() / nth()",
    "desc": {"zh": "取每组的第一个/最后一个/第 N 个值", "en": "Get first/last/nth value per group"},
    "signature": "GroupBy.first()\nGroupBy.last()\nGroupBy.nth(n)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'g': ['A','A','B','B','B'], 'v': [1,2,3,4,5]})\nprint(df.groupby('g').first())\nprint('---')\nprint(df.groupby('g').nth(1))",
    "output": "   v\ng   \nA  1\nB  3\n---\n   v\ng   \nA  2\nB  4",
    "params": [
        {"name": "n", "type": "int | list", "default": "required", "desc": {"zh": "nth: 第几行（0-based），可传列表", "en": "nth: row position (0-based), can pass list"}}
    ],
    "tags": ["groupby", "first", "last", "nth"]
})

add('groupby', {
    "name": "GroupBy.cumcount() / ngroup()",
    "desc": {"zh": "组内行号 / 组编号", "en": "Row number within group / group number"},
    "signature": "GroupBy.cumcount(ascending=True)\nGroupBy.ngroup(ascending=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'g': ['A','A','B','B','B'], 'v': [1,2,3,4,5]})\ndf['row_in_group'] = df.groupby('g').cumcount()\ndf['group_id'] = df.groupby('g').ngroup()\nprint(df)",
    "output": "   g  v  row_in_group  group_id\n0  A  1             0         0\n1  A  2             1         0\n2  B  3             0         1\n3  B  4             1         1\n4  B  5             2         1",
    "params": [
        {"name": "ascending", "type": "bool", "default": "True", "desc": {"zh": "True=从0开始递增", "en": "True=ascending from 0"}}
    ],
    "tags": ["groupby", "cumcount", "ngroup", "row_number"]
})

add('groupby', {
    "name": "GroupBy.size() vs GroupBy.count()",
    "desc": {"zh": "size=每组总行数（含NaN），count=每列非NaN数", "en": "size=total rows per group (incl NaN), count=non-NaN per column"},
    "signature": "GroupBy.size()\nGroupBy.count()",
    "example": "import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({'g': ['A','A','B'], 'v': [1, np.nan, 3]})\nprint('size:', df.groupby('g').size().tolist())\nprint('count:')\nprint(df.groupby('g').count())",
    "output": "size: [2, 1]\ncount:\n   v\ng   \nA  1\nB  1",
    "params": [],
    "tags": ["groupby", "size", "count", "nan"]
})

# ============================================================
# DT ACCESSOR EXTRAS
# ============================================================
add('datetime', {
    "name": "dt.quarter / dt.weekday / dt.days_in_month",
    "desc": {"zh": "季度(1-4) / 星期几(0=周一) / 当月天数", "en": "Quarter(1-4) / weekday(0=Mon) / days in month"},
    "signature": "Series.dt.quarter\nSeries.dt.weekday\nSeries.dt.days_in_month",
    "example": "import pandas as pd\n\ns = pd.Series(pd.to_datetime(['2024-01-15', '2024-06-20', '2024-11-30']))\nprint('quarter:', s.dt.quarter.tolist())\nprint('weekday:', s.dt.weekday.tolist())  # 0=Mon\nprint('days_in_month:', s.dt.days_in_month.tolist())",
    "output": "quarter: [1, 2, 4]\nweekday: [0, 3, 5]\ndays_in_month: [31, 30, 30]",
    "params": [],
    "tags": ["dt", "quarter", "weekday", "days_in_month"]
})

add('datetime', {
    "name": "dt.is_leap_year",
    "desc": {"zh": "判断是否闰年", "en": "Check if leap year"},
    "signature": "Series.dt.is_leap_year",
    "example": "import pandas as pd\n\ns = pd.Series(pd.to_datetime(['2024-01-01', '2025-01-01']))\nprint(s.dt.is_leap_year.tolist())",
    "output": "[True, False]",
    "params": [],
    "tags": ["dt", "leap_year"]
})

# ============================================================
# IO EXTRAS
# ============================================================
add('io', {
    "name": "df.to_string() / df.to_html() / df.to_markdown()",
    "desc": {"zh": "转为文本/HTML/Markdown 格式字符串", "en": "Convert to text/HTML/Markdown string"},
    "signature": "df.to_string(index=True, max_rows=None)\ndf.to_html(index=True)\ndf.to_markdown(index=True)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice', 'Bob'], 'age': [25, 30]})\nprint(df.to_markdown(index=False))",
    "output": "| name   |   age |\n|:-------|------:|\n| Alice  |    25 |\n| Bob    |    30 |",
    "params": [
        {"name": "index", "type": "bool", "default": "True", "desc": {"zh": "是否包含索引", "en": "Whether to include index"}}
    ],
    "tags": ["to_string", "to_html", "to_markdown", "export", "display"]
})

add('io', {
    "name": "pd.read_pickle() / df.to_pickle()",
    "desc": {"zh": "读写 Python pickle 格式（保留所有类型信息）", "en": "Read/write Python pickle (preserves all type info)"},
    "signature": "pd.read_pickle(filepath)\ndf.to_pickle(filepath, compression='infer')",
    "example": "import pandas as pd\n\n# 保存（保留 category、datetime 等类型）\ndf.to_pickle('data.pkl')\n\n# 读取\ndf = pd.read_pickle('data.pkl')",
    "params": [
        {"name": "filepath", "type": "str | Path", "default": "required", "desc": {"zh": "文件路径", "en": "File path"}},
        {"name": "compression", "type": "str", "default": "'infer'", "desc": {"zh": "'gzip'/'bz2'/'zip'/'xz' 或 None", "en": "'gzip'/'bz2'/'zip'/'xz' or None"}}
    ],
    "tags": ["pickle", "serialize", "save", "load"]
})

add('io', {
    "name": "pd.ExcelWriter()",
    "desc": {"zh": "写入多个 Sheet 到同一个 Excel 文件", "en": "Write multiple sheets to a single Excel file"},
    "signature": "pd.ExcelWriter(path, engine=None, mode='w')",
    "example": "import pandas as pd\n\nwith pd.ExcelWriter('report.xlsx', engine='openpyxl') as writer:\n    df_sales.to_excel(writer, sheet_name='Sales', index=False)\n    df_costs.to_excel(writer, sheet_name='Costs', index=False)\n    df_summary.to_excel(writer, sheet_name='Summary', index=False)",
    "params": [
        {"name": "path", "type": "str", "default": "required", "desc": {"zh": "Excel 文件路径", "en": "Excel file path"}},
        {"name": "engine", "type": "str", "default": "None", "desc": {"zh": "'openpyxl'(xlsx) 或 'xlsxwriter'", "en": "'openpyxl'(xlsx) or 'xlsxwriter'"}},
        {"name": "mode", "type": "str", "default": "'w'", "desc": {"zh": "'w'=覆盖, 'a'=追加（需要 openpyxl）", "en": "'w'=overwrite, 'a'=append (requires openpyxl)"}}
    ],
    "tags": ["excel", "writer", "multi-sheet", "export"]
})

# ============================================================
# COLUMN-OPS EXTRAS
# ============================================================
add('column-ops', {
    "name": "df.add_prefix() / df.add_suffix()",
    "desc": {"zh": "批量给列名加前缀/后缀", "en": "Add prefix/suffix to all column names"},
    "signature": "df.add_prefix(prefix) / df.add_suffix(suffix)",
    "example": "import pandas as pd\n\ndf = pd.DataFrame({'name': ['Alice'], 'age': [25]})\nprint(df.add_prefix('user_').columns.tolist())\nprint(df.add_suffix('_raw').columns.tolist())",
    "output": "['user_name', 'user_age']\n['name_raw', 'age_raw']",
    "params": [
        {"name": "prefix / suffix", "type": "str", "default": "required", "desc": {"zh": "要添加的前缀/后缀", "en": "Prefix/suffix to add"}}
    ],
    "tags": ["add_prefix", "add_suffix", "column", "rename", "batch"]
})

# Final count
total = sum(len(s['items']) for t in data['topics'] for s in t['sections'])
apis = sum(len(s['items']) for t in data['topics'] for s in t['sections'] if s['type'] == 'api-table')
print(f"Final: {len(data['topics'])} topics, {total} items, {apis} APIs")

with open('src/data/reference/cheatsheet.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved.")
