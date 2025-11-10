# src/cli/__main__.py
import argparse
import subprocess
import sys
from pathlib import Path

# Compute project root (Jobuine directory)
CLI_DIR = Path(__file__).resolve().parent
ROOT_DIR = CLI_DIR.parent.parent  # src/ → project root

def run_script(script_name, args):
    """Run a Python script in cli/ with passthrough arguments."""
    script_path = CLI_DIR / f"{script_name}.py"
    if not script_path.exists():
        print(f"❌ {script_name}.py not found in cli/")
        sys.exit(1)
    subprocess.run([sys.executable, str(script_path)] + args)

def run_shell(script_name, args):
    """Run a shell script in cli/ with passthrough arguments."""
    script_path = CLI_DIR / f"{script_name}.sh"
    if not script_path.exists():
        print(f"❌ {script_name}.sh not found in cli/")
        sys.exit(1)
    subprocess.run(["bash", str(script_path)] + args)

def main():
    parser = argparse.ArgumentParser(prog="jobuine", description="Jobuine CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # apply
    apply_parser = subparsers.add_parser("apply", help="Create a new apply directory")
    apply_parser.add_argument("--name", required=True, help="Directory name to create")

    # check
    check_parser = subparsers.add_parser("check", help="Search in Excel file")
    check_parser.add_argument("--search", required=True, help="Search term")

    # generate
    gen_parser = subparsers.add_parser("generate", help="Generate PDFs and update Excel")
    # ⛔ removed --dir argument because directory is now stored as JOBUINE_APPLY_DIR
    # gen_parser.add_argument("--dir", required=True, help="Directory with JSON files")
    gen_parser.add_argument("--excel-name", default="All_applyDetail.xlsx", help="Excel filename (ignored if store_file is set in config.yaml)")

    args, extra = parser.parse_known_args()

    if args.command == "apply":
        run_shell("apply", ["--name", args.name])
    elif args.command == "check":
        run_script("check", ["--search", args.search])
    elif args.command == "generate":
        # 🧠 No longer pass directory arguments — generate.py uses JOBUINE_APPLY_DIR automatically
        run_script("generate", [])
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
