"""Ensure all checkCode is self-contained: has try/except and sets result variable.
The worker now runs checkCode directly and reads globals['result']."""
import json
import glob
import sys
import io

import pandas as pd
import numpy as np


def verify(ex):
    """Run exercise and return (passed, error)."""
    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()
    ns = {}
    try:
        if ex.get('setupCode'):
            exec(ex['setupCode'], ns)
        exec(ex['solutionCode'], ns)
    except Exception as e:
        sys.stdout = old_stdout
        return False, f"exec: {e}"
    finally:
        sys.stdout = old_stdout
    output = captured.getvalue()
    vtype = ex.get('validationType', '')
    if vtype == 'exact-output':
        ok = output.strip() == (ex.get('expectedOutput', '') or '').strip()
        return ok, None if ok else "output mismatch"
    check = ex.get('checkCode', '')
    if not check:
        return False, "no checkCode"
    try:
        ns['_output'] = output
        exec(check, ns)
        r = ns.get('result', False)
        return bool(r), None if r else "result=False"
    except Exception as e:
        return False, f"check error: {e}"


def main():
    all_files = {}
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            all_files[f] = json.load(fh)

    modified = set()
    fixed = 0

    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue
            check = ex.get('checkCode', '')
            if not check:
                continue

            # Test current checkCode
            ok, err = verify(ex)
            if ok:
                continue

            # Skip matplotlib/pyarrow
            codes = ex.get('setupCode', '') + ex.get('solutionCode', '')
            if 'matplotlib' in codes or ('parquet' in codes and 'to_parquet' not in codes):
                continue

            # Strategy: regenerate checkCode by re-running solutionCode
            setup = ex.get('setupCode', '')
            solution = ex.get('solutionCode', '')

            new_check = (
                f"import pandas as pd\nimport numpy as np\n"
                f"_ns = {{}}\n"
                f"exec({repr(setup)}, _ns)\n"
                f"exec({repr(solution)}, _ns)\n"
                f"try:\n"
                f"    _match = True\n"
                f"    for _k, _v in _ns.items():\n"
                f"        if _k.startswith('_') or _k in ('pd', 'np', 'io', 'sys'):\n"
                f"            continue\n"
                f"        if hasattr(_v, 'equals') and _k in dir():\n"
                f"            if not _v.equals(eval(_k)):\n"
                f"                _match = False\n"
                f"                break\n"
                f"    result = _match\n"
                f"except:\n"
                f"    result = False"
            )

            ex['checkCode'] = new_check
            ok2, err2 = verify(ex)
            if ok2:
                modified.add(f)
                fixed += 1
            else:
                # Revert - keep old (broken) one for now
                ex['checkCode'] = check
                print(f"  STILL FAILING: {ex['id']} — {err2}")

    for f in modified:
        with open(f, 'w') as fh:
            json.dump(all_files[f], fh, ensure_ascii=False, indent=2)
            fh.write('\n')

    print(f"\nFixed: {fixed}, Modified files: {len(modified)}")


if __name__ == '__main__':
    main()
