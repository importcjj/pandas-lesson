"""Fix checkCode fields that have indentation/syntax errors from previous fix attempt.
Strategy: For any checkCode that fails to compile, wrap the core comparison in a safe equals() pattern."""
import json
import glob
import sys
import io
import ast
import re

import pandas as pd
import numpy as np


def run_and_verify(ex):
    """Run setup + solution + checkCode, return (passed, error)."""
    setup_code = ex.get('setupCode', '')
    solution_code = ex.get('solutionCode', '')
    check_code = ex.get('checkCode', '')
    validation_type = ex.get('validationType', '')
    expected_output = ex.get('expectedOutput', '')

    if not solution_code:
        return False, "No solutionCode"

    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()
    ns = {}
    try:
        if setup_code:
            exec(setup_code, ns)
        exec(solution_code, ns)
    except Exception as e:
        sys.stdout = old_stdout
        return False, f"exec error: {e}"
    finally:
        sys.stdout = old_stdout

    output = captured.getvalue()

    if validation_type == 'exact-output':
        expected = (expected_output or '').strip()
        actual = output.strip()
        return actual == expected, None if actual == expected else "output mismatch"
    elif validation_type in ('custom-check', 'dataframe-equals'):
        if not check_code:
            return False, "no checkCode"
        try:
            ns['_output'] = output
            exec(check_code, ns)
            result = ns.get('result', False)
            return bool(result), None if result else "checkCode returned False"
        except Exception as e:
            return False, f"checkCode error: {e}"
    return False, f"unknown type: {validation_type}"


def make_safe_checkcode(original_checkcode):
    """Given a potentially broken checkCode, produce a working version.

    Strategy:
    1. If it already works (compiles and uses .equals), return as-is
    2. If it has try/except with indentation issues, rebuild it
    3. If it uses == comparison, replace with .equals()
    """
    # First try to compile as-is
    try:
        compile(original_checkcode, '<check>', 'exec')
        # It compiles. Check if it has truth-value issues by looking for patterns
        if '.equals(' in original_checkcode:
            return original_checkcode  # Already safe
        # Has == but compiles - might still have truth value issues
        # Only fix if it actually uses == to assign to result
        if '==' in original_checkcode and 'result' in original_checkcode:
            pass  # Fall through to fix
        else:
            return original_checkcode
    except SyntaxError:
        pass  # Needs fixing

    # Extract the original intent: find what variables are being compared
    # Look for lines like: result = expected.equals(actual) or result = (A == B)
    # The broken code often looks like multi-line try/except that got mangled

    # Strategy: find the core comparison and rebuild
    # Look for .equals( calls
    equals_match = re.search(r'\(([^)]+)\)\.equals\(([^)]+)\)', original_checkcode)
    if equals_match:
        lhs = equals_match.group(1).strip()
        rhs = equals_match.group(2).strip()
        return f"try:\n    result = ({lhs}).equals({rhs})\nexcept:\n    result = False"

    # Look for == comparisons
    eq_match = re.search(r'result\s*=\s*\(?\s*(.+?)\s*==\s*(.+?)[\s\)]*$',
                         original_checkcode, re.MULTILINE)
    if eq_match:
        lhs = eq_match.group(1).strip()
        rhs = eq_match.group(2).strip()
        # Clean up
        if rhs.endswith(')') and rhs.count(')') > rhs.count('('):
            rhs = rhs[:-1].strip()
        return f"try:\n    result = ({lhs}).equals({rhs})\nexcept:\n    result = False"

    # Look for the original check pattern before our mangling
    # Pattern: expected_xxx = ...\nresult = expected_xxx == xxx
    lines = original_checkcode.replace('\\n', '\n').split('\n')
    setup_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('try:') and not stripped.startswith('except:') and not stripped.startswith('result'):
            if 'expected' in stripped or '=' in stripped:
                setup_lines.append(stripped)

    if setup_lines:
        setup = '\n'.join(setup_lines)
        return f"{setup}\ntry:\n    result = expected.equals(result_var) if hasattr(expected, 'equals') else expected == result_var\nexcept:\n    result = False"

    # Can't fix automatically
    return original_checkcode


def main():
    files_modified = set()
    fix_count = 0

    all_files = {}
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            all_files[f] = json.load(fh)

    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue

            check_code = ex.get('checkCode', '')
            if not check_code:
                continue

            # Test if this exercise currently passes
            passed, err = run_and_verify(ex)
            if passed:
                continue

            # Try to fix
            if 'checkCode error' in str(err) or 'SyntaxError' in str(err) or 'IndentationError' in str(err) or 'truth value' in str(err):
                fixed = make_safe_checkcode(check_code)
                if fixed != check_code:
                    ex['checkCode'] = fixed
                    # Test again
                    passed2, err2 = run_and_verify(ex)
                    if passed2:
                        files_modified.add(f)
                        fix_count += 1
                        print(f"  FIXED: {ex['id']}")
                    else:
                        print(f"  STILL FAILING: {ex['id']} — {err2}")
                else:
                    print(f"  CANT FIX: {ex['id']} — {err}")

    # Write modified files
    for f in files_modified:
        with open(f, 'w') as fh:
            json.dump(all_files[f], fh, ensure_ascii=False, indent=2)
            fh.write('\n')

    print(f"\nFixed {fix_count} exercises across {len(files_modified)} files")


if __name__ == '__main__':
    main()
