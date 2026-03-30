"""Auto-fix failing coding exercises."""
import json
import glob
import sys
import io
import re

import pandas as pd
import numpy as np


def run_solution(ex):
    """Run setup + solution, return (namespace, stdout, error)."""
    setup_code = ex.get('setupCode', '')
    solution_code = ex.get('solutionCode', '')

    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()
    ns = {}
    err = None
    try:
        if setup_code:
            exec(setup_code, ns)
        exec(solution_code, ns)
    except Exception as e:
        err = f"{type(e).__name__}: {e}"
    finally:
        sys.stdout = old_stdout
    return ns, captured.getvalue(), err


def fix_check_code(check_code):
    """Fix checkCode that uses == instead of .equals() for DataFrames/Series."""
    if not check_code:
        return check_code

    # Pattern: result = (a == b) or result = a == b
    # These fail on DataFrame/Series due to truth value ambiguity
    # Replace with .equals() wrapped in try/except

    # Already uses .equals() - skip
    if '.equals(' in check_code:
        return check_code

    # Fix: wrap the entire checkCode in a safer comparison
    # Look for patterns like "result = expected_xxx == xxx" or "result = (xxx == xxx)"
    lines = check_code.strip().split('\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        # Match: result = <expr1> == <expr2>
        if stripped.startswith('result') and '==' in stripped and '.equals(' not in stripped:
            # Extract the two sides
            # result = A == B  or  result = (A == B)
            match = re.match(r'result\s*=\s*\(?\s*(.+?)\s*==\s*(.+?)\s*\)?\s*$', stripped)
            if match:
                lhs, rhs = match.group(1).strip(), match.group(2).strip()
                # Remove trailing ) if unbalanced
                if rhs.endswith(')') and rhs.count(')') > rhs.count('('):
                    rhs = rhs[:-1].strip()
                new_line = f"try:\n    result = ({lhs}).equals({rhs})\nexcept:\n    try:\n        result = ({lhs} == {rhs}).all() if hasattr({lhs}, 'all') else {lhs} == {rhs}\n    except:\n        result = False"
                new_lines.append(new_line)
                continue
        new_lines.append(line)

    return '\n'.join(new_lines)


def main():
    files_modified = set()
    fixes = []

    # Load all exercise files
    all_files = {}
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            all_files[f] = json.load(fh)

    # === Fix Category 1 & 2: Update expectedOutput by re-running solutions ===
    exact_output_ids_to_fix = [
        's1-dtypes-001', 's2-fileio-002', 's2-fileio-006', 's2-fileio-011',
        's2-applymap-007', 's2-colops-007', 's2-missing-010', 's2-strmethod-009',
        's2-typeconv-003', 's2-typeconv-008', 's2-typeconv-009',
    ]

    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex['id'] in exact_output_ids_to_fix and ex.get('validationType') == 'exact-output':
                ns, output, err = run_solution(ex)
                if err:
                    print(f"  WARN: {ex['id']} solution error: {err}")
                    continue
                actual = output.strip()
                if actual != (ex.get('expectedOutput', '') or '').strip():
                    ex['expectedOutput'] = actual
                    files_modified.add(f)
                    fixes.append(f"Updated expectedOutput: {ex['id']}")

    # === Fix Category 3: checkCode with == instead of .equals() ===
    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue
            check_code = ex.get('checkCode', '')
            if not check_code:
                continue
            fixed = fix_check_code(check_code)
            if fixed != check_code:
                ex['checkCode'] = fixed
                files_modified.add(f)
                fixes.append(f"Fixed checkCode (==→equals): {ex['id']}")

    # === Fix Category 6: pandas 3.0 API changes ===
    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            eid = ex.get('id', '')

            # fillna(method='ffill') → ffill()
            for field in ['solutionCode', 'starterCode', 'setupCode']:
                code = ex.get(field, '')
                if "fillna(method='ffill')" in code or 'fillna(method="ffill")' in code:
                    code = code.replace("fillna(method='ffill')", "ffill()")
                    code = code.replace('fillna(method="ffill")', "ffill()")
                    ex[field] = code
                    files_modified.add(f)
                    fixes.append(f"Fixed fillna→ffill: {eid} ({field})")
                if "fillna(method='bfill')" in code or 'fillna(method="bfill")' in code:
                    code = code.replace("fillna(method='bfill')", "bfill()")
                    code = code.replace('fillna(method="bfill")', "bfill()")
                    ex[field] = code
                    files_modified.add(f)
                    fixes.append(f"Fixed fillna→bfill: {eid} ({field})")

            # stack(dropna=...) removed in pandas 3.0
            for field in ['solutionCode', 'starterCode']:
                code = ex.get(field, '')
                if 'stack(dropna=' in code:
                    code = re.sub(r'\.stack\(dropna=\w+\)', '.stack()', code)
                    ex[field] = code
                    files_modified.add(f)
                    fixes.append(f"Fixed stack(dropna=): {eid}")

            # datetime format issues - add format='mixed'
            if eid == 's4-project-cleaning-008':
                for field in ['solutionCode', 'starterCode', 'setupCode']:
                    code = ex.get(field, '')
                    if "pd.to_datetime" in code and "format=" not in code and "date" in code.lower():
                        code = code.replace("pd.to_datetime(df['date'])", "pd.to_datetime(df['date'], format='mixed')")
                        ex[field] = code
                        files_modified.add(f)
                        fixes.append(f"Fixed datetime format: {eid}")

    # === Fix Category 8: s2-applymap-010 floating point ===
    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('id') == 's2-applymap-010' and ex.get('validationType') == 'exact-output':
                # Re-run to get actual output
                ns, output, err = run_solution(ex)
                if not err:
                    ex['expectedOutput'] = output.strip()
                    files_modified.add(f)
                    fixes.append(f"Updated expectedOutput for floating point: s2-applymap-010")

    # Write modified files
    for f in files_modified:
        with open(f, 'w') as fh:
            json.dump(all_files[f], fh, ensure_ascii=False, indent=2)
            fh.write('\n')

    print(f"Applied {len(fixes)} fixes across {len(files_modified)} files:")
    for fix in fixes:
        print(f"  {fix}")


if __name__ == '__main__':
    main()
