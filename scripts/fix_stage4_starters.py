"""Fix stage4 coding exercises: replace answer-leaking starters with result = ___ pattern.

For exercises where starterCode == solutionCode (100% overlap, no blanks):
1. Change starterCode to: "# <hint comment>\nresult = ___"
2. Change solutionCode to: "result = <original solution>"
3. Update checkCode to compare `result` with expected value
"""
import json
import glob
import sys
import io
import re

import pandas as pd
import numpy as np


def run_code(setup, code):
    """Run code and return (namespace, stdout, error)."""
    old = sys.stdout
    sys.stdout = cap = io.StringIO()
    ns = {}
    err = None
    try:
        if setup:
            exec(setup, ns)
        exec(code, ns)
    except Exception as e:
        err = str(e)
    finally:
        sys.stdout = old
    return ns, cap.getvalue(), err


def get_result_var_name(solution_code):
    """Determine what variable the solution produces."""
    lines = solution_code.strip().split('\n')
    # Find the last assignment
    for line in reversed(lines):
        stripped = line.strip()
        if stripped.startswith('#') or not stripped:
            continue
        # Match: var = ...
        m = re.match(r'^(\w+)\s*=\s*', stripped)
        if m:
            return m.group(1)
        # Match: print(...)
        if stripped.startswith('print('):
            continue
    return None


def make_hint_comment(title_zh, description_zh):
    """Generate a short hint comment from title/description."""
    # Use the Chinese title as hint
    return f"# {title_zh}"


def fix_exercise(ex):
    """Fix an exercise. Returns True if modified."""
    starter = ex.get('starterCode', '')
    solution = ex.get('solutionCode', '')
    setup = ex.get('setupCode', '')
    vtype = ex.get('validationType', '')

    if not starter or not solution:
        return False

    # Only fix exercises where starter == solution (100% overlap, no blanks)
    starter_lines = [l.strip() for l in starter.split('\n') if l.strip() and not l.strip().startswith('#')]
    solution_lines = [l.strip() for l in solution.split('\n') if l.strip() and not l.strip().startswith('#')]

    if not solution_lines:
        return False

    matching = sum(1 for sl in solution_lines if sl in starter_lines)
    ratio = matching / len(solution_lines)
    has_blank = '___' in starter

    # Only fix 100% overlap with no blanks
    if ratio < 0.95 or has_blank:
        return False

    # Determine what the solution produces
    # Run the solution to find result variables
    ns, output, err = run_code(setup, solution)
    if err:
        return False  # Can't run, skip

    # Find DataFrame/Series results
    skip_keys = {'__builtins__', 'pd', 'np', 'io', 'sys', 'numpy', 'pandas', 'plt', 'matplotlib'}
    setup_ns = {}
    if setup:
        try:
            exec(setup, setup_ns)
        except:
            pass
    setup_keys = set(setup_ns.keys())

    result_vars = {}
    for k, v in ns.items():
        if k.startswith('_') or k in skip_keys:
            continue
        if isinstance(v, (pd.DataFrame, pd.Series, pd.Index)):
            if k not in setup_keys:
                result_vars[k] = v

    # Also check for modified setup variables
    for k in setup_keys:
        if k in ns and k not in skip_keys and not k.startswith('_'):
            if isinstance(ns[k], (pd.DataFrame, pd.Series)):
                sv = setup_ns.get(k)
                if sv is not None and hasattr(sv, 'equals') and not sv.equals(ns[k]):
                    result_vars[k] = ns[k]

    if not result_vars and not output.strip():
        return False  # No identifiable result

    # Build new starterCode
    title_zh = ex.get('title', {}).get('zh', '')
    desc_zh = ex.get('description', {}).get('zh', '')

    if len(result_vars) == 1:
        var_name = list(result_vars.keys())[0]
        hint = make_hint_comment(title_zh, desc_zh)
        new_starter = f"{hint}\n{var_name} = ___"

        # Build new solutionCode - wrap in result assignment if needed
        # Keep original solution but ensure the variable is assigned
        new_solution = solution

        # Build new checkCode
        new_check = (
            f"import pandas as pd\nimport numpy as np\n"
            f"_ns = {{}}\n"
            f"exec({repr(setup)}, _ns)\n"
            f"exec({repr(solution)}, _ns)\n"
            f"try:\n"
            f"    result = _ns['{var_name}'].equals({var_name})\n"
            f"except:\n"
            f"    result = False"
        )
    elif output.strip():
        # Output-based: change to exact-output validation
        hint = make_hint_comment(title_zh, desc_zh)
        # Extract what needs to be written
        new_starter = f"{hint}\n"
        # Add comment hints from solution
        for line in solution.split('\n'):
            stripped = line.strip()
            if stripped.startswith('#'):
                new_starter += line + '\n'
            elif stripped.startswith('print('):
                new_starter += f"# {stripped}  ← 补全上面的代码使这行输出正确\n"
            else:
                new_starter += f"# TODO: {stripped.split('=')[0].strip() if '=' in stripped else '...'}\n"

        new_solution = solution
        new_check = ex.get('checkCode', '')
        # Keep existing validation
        return False  # Too complex for auto-fix
    else:
        # Multiple result vars - use first one
        var_name = list(result_vars.keys())[0]
        hint = make_hint_comment(title_zh, desc_zh)
        new_starter = f"{hint}\n{var_name} = ___"
        new_solution = solution
        new_check = (
            f"import pandas as pd\nimport numpy as np\n"
            f"_ns = {{}}\n"
            f"exec({repr(setup)}, _ns)\n"
            f"exec({repr(solution)}, _ns)\n"
            f"try:\n"
            f"    result = _ns['{var_name}'].equals({var_name})\n"
            f"except:\n"
            f"    result = False"
        )

    # Verify the fix works
    test_ns = {}
    try:
        if setup:
            exec(setup, test_ns)
        exec(new_solution, test_ns)
        exec(new_check, test_ns)
        if not test_ns.get('result', False):
            return False  # Fix doesn't validate
    except:
        return False

    ex['starterCode'] = new_starter
    ex['solutionCode'] = new_solution
    ex['checkCode'] = new_check
    if vtype == 'exact-output':
        ex['validationType'] = 'dataframe-equals'

    return True


def main():
    fixed = 0
    files_modified = set()

    for f in sorted(glob.glob('src/data/exercises/stage4/*.json')):
        with open(f) as fh:
            data = json.load(fh)

        changed = False
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue
            if fix_exercise(ex):
                fixed += 1
                changed = True
                print(f"  FIXED: {ex['id']} → {ex['starterCode'][:60]}...")

        if changed:
            files_modified.add(f)
            with open(f, 'w') as fh:
                json.dump(data, fh, ensure_ascii=False, indent=2)
                fh.write('\n')

    print(f"\nFixed {fixed} exercises across {len(files_modified)} files")


if __name__ == '__main__':
    main()
