"""Fix starterCode that leaks the answer by moving data setup to setupCode."""
import json
import glob
import re

def should_be_setup(line):
    """Check if a line is data setup (not the actual exercise)."""
    stripped = line.strip()
    if not stripped or stripped.startswith('#'):
        return None  # comments/blank - ambiguous
    # Import statements
    if stripped.startswith(('import ', 'from ')):
        return True
    # Variable assignments that create data (not the answer)
    if re.match(r'^(df|data|s|csv_|csv_text|csv_data|csv_string|csv_bytes|arr|idx|matrix|values|scores|prices|dates|names|ages|cities)\s*=', stripped):
        return True
    # DataFrame/Series creation
    if 'pd.DataFrame(' in stripped or 'pd.Series(' in stripped or 'StringIO(' in stripped:
        return True
    # Numpy operations for data creation
    if 'np.random' in stripped or 'np.array(' in stripped or 'np.nan' in stripped:
        return True
    # Multi-line continuation
    if stripped in ('})', '])', '})'):
        return True
    # Dict/list lines inside data creation
    if re.match(r"^\s*'[^']+'\s*:", stripped) or re.match(r'^\s*"[^"]+"\s*:', stripped):
        return True
    # List items
    if stripped.startswith(('[', '{', "'", '"')) and stripped.endswith((',', ']', '}', '],')):
        return True
    return False

def fix_exercise(ex):
    """Move data setup from starterCode to setupCode. Return True if fixed."""
    starter = ex.get('starterCode', '')
    solution = ex.get('solutionCode', '')
    existing_setup = ex.get('setupCode', '')

    if not starter or not solution:
        return False

    # Parse starter lines
    starter_lines = starter.split('\n')
    solution_lines = solution.split('\n')

    # Find lines in starter that are data setup AND appear in solution
    setup_lines = []
    exercise_lines = []
    in_multiline = False

    for line in starter_lines:
        stripped = line.strip()

        # Track multi-line constructs (DataFrame creation etc)
        if in_multiline:
            setup_lines.append(line)
            if stripped.endswith('))') or stripped == ')' or stripped == '})':
                in_multiline = False
            continue

        is_setup = should_be_setup(line)

        # Check if this exact line (stripped) appears in solution
        in_solution = stripped in [sl.strip() for sl in solution_lines]

        if is_setup and in_solution:
            setup_lines.append(line)
            # Check if this starts a multi-line construct
            if ('pd.DataFrame({' in stripped or 'pd.Series([' in stripped or
                'pd.DataFrame([' in stripped or 'StringIO(' in stripped) and ')' not in stripped.split('(', 1)[-1]:
                in_multiline = True
        else:
            exercise_lines.append(line)

    # Only fix if we found substantial setup code to move
    if len(setup_lines) < 2:
        return False

    # Don't fix if exercise_lines would be empty
    remaining = [l for l in exercise_lines if l.strip() and not l.strip().startswith('#')]
    if not remaining:
        # All non-comment lines are setup - keep some comments as starter
        comment_lines = [l for l in exercise_lines if l.strip().startswith('#')]
        if not comment_lines:
            return False

    # Build new setupCode (merge with existing)
    new_setup_parts = []
    if existing_setup:
        new_setup_parts.append(existing_setup.rstrip())
    new_setup = '\n'.join(setup_lines).strip()
    if new_setup and new_setup not in (existing_setup or ''):
        new_setup_parts.append(new_setup)

    new_setup_code = '\n\n'.join(new_setup_parts)
    new_starter_code = '\n'.join(exercise_lines).strip()

    # Ensure starter has at least a comment hint
    if not new_starter_code or not any(l.strip() for l in exercise_lines if not l.strip().startswith('#')):
        # Add placeholder
        if not new_starter_code:
            new_starter_code = '# Write your code here\n'

    # Verify the fix makes sense
    if len(new_setup_code) < len(existing_setup or ''):
        return False  # Don't shrink existing setup

    if new_setup_code == (existing_setup or '') and new_starter_code == starter:
        return False  # Nothing changed

    ex['setupCode'] = new_setup_code
    ex['starterCode'] = new_starter_code
    return True


def main():
    fixed_count = 0
    files_modified = set()

    all_files = {}
    for f in sorted(glob.glob('src/data/exercises/**/*.json', recursive=True)):
        with open(f) as fh:
            all_files[f] = json.load(fh)

    for f, data in all_files.items():
        for ex in data.get('exercises', []):
            if ex.get('type') != 'coding':
                continue
            if fix_exercise(ex):
                fixed_count += 1
                files_modified.add(f)
                # Show what we did
                print(f"  FIXED: {ex['id']}")

    for f in files_modified:
        with open(f, 'w') as fh:
            json.dump(all_files[f], fh, ensure_ascii=False, indent=2)
            fh.write('\n')

    print(f"\nFixed {fixed_count} exercises across {len(files_modified)} files")


if __name__ == '__main__':
    main()
