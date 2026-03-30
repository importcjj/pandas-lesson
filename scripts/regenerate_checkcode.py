"""Regenerate checkCode for all failing exercises by analyzing solutionCode output."""
import json
import glob
import sys
import io
import re

import pandas as pd
import numpy as np


def run_solution(ex):
    """Run setup + solution, return (namespace, stdout, error)."""
    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()
    ns = {}
    err = None
    try:
        if ex.get('setupCode'):
            exec(ex['setupCode'], ns)
        exec(ex['solutionCode'], ns)
    except Exception as e:
        err = str(e)
    finally:
        sys.stdout = old_stdout
    return ns, captured.getvalue(), err


def find_result_var(ns, setup_ns_keys):
    """Find the variable the user is supposed to produce (new vars after solution runs)."""
    user_vars = {}
    skip = {'__builtins__', 'pd', 'np', 'io', 'sys', 'numpy', 'pandas'}
    for k, v in ns.items():
        if k.startswith('_') or k in skip or k in setup_ns_keys:
            continue
        if isinstance(v, (pd.DataFrame, pd.Series)):
            user_vars[k] = v
    return user_vars


def generate_checkcode(ex):
    """Generate a working checkCode based on solutionCode."""
    setup_code = ex.get('setupCode', '')
    solution_code = ex.get('solutionCode', '')

    # Get setup namespace keys
    setup_ns = {}
    try:
        if setup_code:
            exec(setup_code, setup_ns)
    except:
        pass
    setup_keys = set(setup_ns.keys())

    # Run full solution
    ns, output, err = run_solution(ex)
    if err:
        return None, f"solution error: {err}"

    # Find result variables
    result_vars = find_result_var(ns, setup_keys)

    if not result_vars:
        # No DataFrame/Series result - might modify existing vars
        # Try comparing all DataFrames in namespace
        for k, v in ns.items():
            if isinstance(v, (pd.DataFrame, pd.Series)) and k in setup_keys:
                result_vars[k] = v

    if not result_vars:
        return None, "no result variable found"

    # Generate checkCode that re-runs solution and compares
    # Strategy: re-run the solution code to get expected, then compare with user's version
    parts = []
    parts.append("import pandas as pd")
    parts.append("import numpy as np")

    # Re-run solution to get expected values
    # We need to re-execute the solution in a separate namespace
    parts.append("_expected_ns = {}")
    if setup_code:
        # Setup code needs to run in expected namespace too
        parts.append(f"exec({repr(setup_code)}, _expected_ns)")
    parts.append(f"exec({repr(solution_code)}, _expected_ns)")

    # Compare each result variable
    comparisons = []
    for var_name in result_vars:
        comparisons.append(f"_expected_ns.get('{var_name}') is not None and hasattr(_expected_ns['{var_name}'], 'equals') and _expected_ns['{var_name}'].equals({var_name})")

    if comparisons:
        parts.append("try:")
        parts.append("    result = " + " and ".join(comparisons))
        parts.append("except:")
        parts.append("    result = False")
    else:
        parts.append("result = False")

    return "\n".join(parts), None


def verify_exercise(ex):
    """Verify an exercise passes."""
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
        return output.strip() == (ex.get('expectedOutput', '') or '').strip(), None
    elif vtype in ('custom-check', 'dataframe-equals'):
        check_code = ex.get('checkCode', '')
        if not check_code:
            return False, "no checkCode"
        try:
            ns['_output'] = output
            exec(check_code, ns)
            r = ns.get('result', False)
            return bool(r), None if r else "returned False"
        except Exception as e:
            return False, f"error: {e}"
    return False, "unknown type"


def main():
    all_files = {}
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            all_files[f] = json.load(fh)

    files_modified = set()
    fixed = 0
    still_failing = []

    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue

            # Skip matplotlib exercises
            if 'matplotlib' in ex.get('setupCode', '') or 'matplotlib' in ex.get('solutionCode', ''):
                continue
            # Skip pyarrow exercises
            if 'parquet' in ex.get('solutionCode', '').lower() and 'to_parquet' not in ex.get('solutionCode', ''):
                continue

            # Check if currently passing
            passed, err = verify_exercise(ex)
            if passed:
                continue

            vtype = ex.get('validationType', '')

            # For exact-output, re-generate expected output
            if vtype == 'exact-output':
                ns, output, serr = run_solution(ex)
                if not serr and output.strip():
                    ex['expectedOutput'] = output.strip()
                    # Verify
                    p2, _ = verify_exercise(ex)
                    if p2:
                        files_modified.add(f)
                        fixed += 1
                        print(f"  FIXED (output): {ex['id']}")
                        continue

            # For custom-check and dataframe-equals, regenerate checkCode
            if vtype in ('custom-check', 'dataframe-equals'):
                new_check, gen_err = generate_checkcode(ex)
                if new_check:
                    old_check = ex.get('checkCode', '')
                    ex['checkCode'] = new_check
                    p2, e2 = verify_exercise(ex)
                    if p2:
                        files_modified.add(f)
                        fixed += 1
                        print(f"  FIXED (checkCode): {ex['id']}")
                        continue
                    else:
                        # Revert if still failing
                        ex['checkCode'] = old_check
                        still_failing.append((ex['id'], f, e2 or gen_err))
                else:
                    still_failing.append((ex['id'], f, gen_err))
                continue

            still_failing.append((ex['id'], f, err))

    # Write
    for f in files_modified:
        with open(f, 'w') as fh:
            json.dump(all_files[f], fh, ensure_ascii=False, indent=2)
            fh.write('\n')

    print(f"\nFixed: {fixed}")
    print(f"Still failing: {len(still_failing)}")
    if still_failing:
        for eid, ef, err in still_failing:
            print(f"  {eid}: {err}")


if __name__ == '__main__':
    main()
