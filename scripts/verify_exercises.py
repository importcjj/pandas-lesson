"""Batch verify all coding exercises by running solutionCode and checking validation."""
import json
import glob
import sys
import io
import traceback

import pandas as pd
import numpy as np

def verify_exercise(ex):
    """Run an exercise's solutionCode and verify it passes validation.
    Returns (passed: bool, error: str | None)
    """
    setup_code = ex.get('setupCode', '')
    solution_code = ex.get('solutionCode', '')
    validation_type = ex.get('validationType', '')
    expected_output = ex.get('expectedOutput', '')
    check_code = ex.get('checkCode', '')

    if not solution_code:
        return False, "No solutionCode"

    # Capture stdout
    old_stdout = sys.stdout
    sys.stdout = captured = io.StringIO()

    local_ns = {}
    try:
        # Run setup
        if setup_code:
            exec(setup_code, local_ns)
        # Run solution
        exec(solution_code, local_ns)
    except Exception as e:
        sys.stdout = old_stdout
        return False, f"Execution error: {type(e).__name__}: {e}"
    finally:
        sys.stdout = old_stdout

    output = captured.getvalue()

    # Validate
    if validation_type == 'exact-output':
        expected = (expected_output or '').strip()
        actual = output.strip()
        if actual == expected:
            return True, None
        else:
            # Show first difference
            exp_lines = expected.split('\n')
            act_lines = actual.split('\n')
            for i, (e, a) in enumerate(zip(exp_lines, act_lines)):
                if e != a:
                    return False, f"Output mismatch at line {i+1}:\n  expected: {repr(e[:80])}\n  actual:   {repr(a[:80])}"
            if len(exp_lines) != len(act_lines):
                return False, f"Output line count mismatch: expected {len(exp_lines)}, got {len(act_lines)}"
            return False, f"Output mismatch (unknown diff)"

    elif validation_type == 'custom-check':
        if not check_code:
            return False, "No checkCode for custom-check"
        try:
            local_ns['_output'] = output
            exec(check_code, local_ns)
            result = local_ns.get('result', False)
            if result:
                return True, None
            else:
                return False, "checkCode returned False"
        except Exception as e:
            return False, f"checkCode error: {type(e).__name__}: {e}"

    elif validation_type == 'dataframe-equals':
        if not check_code:
            return False, "No checkCode for dataframe-equals"
        try:
            exec(check_code, local_ns)
            result = local_ns.get('result', False)
            if result:
                return True, None
            else:
                return False, "checkCode returned False"
        except Exception as e:
            return False, f"checkCode error: {type(e).__name__}: {e}"

    else:
        return False, f"Unknown validationType: {validation_type}"


def main():
    exercises = []
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            data = json.load(fh)
        for ex in data.get('exercises', []):
            if ex.get('type') == 'coding':
                ex['_file'] = f
                exercises.append(ex)

    print(f"Testing {len(exercises)} coding exercises...\n")

    passed = []
    failed = []

    for ex in exercises:
        ok, err = verify_exercise(ex)
        if ok:
            passed.append(ex['id'])
        else:
            failed.append((ex['id'], ex['_file'], err))

    print(f"=== Results ===")
    print(f"PASSED: {len(passed)}/{len(exercises)}")
    print(f"FAILED: {len(failed)}/{len(exercises)}")

    if failed:
        print(f"\n=== Failed exercises ===")
        for eid, efile, err in failed:
            print(f"\n  {eid} ({efile})")
            print(f"    {err}")

    return len(failed)


if __name__ == '__main__':
    sys.exit(main())
