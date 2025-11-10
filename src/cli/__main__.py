# src/cli/__main__.py
import argparse
import sys
from pathlib import Path
import uvicorn
# Import command logic from utils
from utils import apply, check, generate


def main():
    parser = argparse.ArgumentParser(prog="jobuine", description="Jobuine CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # apply
    subparsers.add_parser("apply", help="Create a new apply directory interactively")
    subparsers.add_parser("serve", help="Run FastAPI server")

    # check
    check_parser = subparsers.add_parser("check", help="Search in Excel file")
    check_parser.add_argument("--search", required=True, help="Search term")

    # generate
    gen_parser = subparsers.add_parser("generate", help="Generate PDFs and update Excel")
    gen_parser.add_argument(
        "--excel-name",
        default="All_applyDetail.xlsx",
        help="Excel filename (ignored if store_file is set in config.yaml)"
    )

    args = parser.parse_args()

    # Dispatch commands
    if args.command == "apply":
        apply.main()
    elif args.command == "check":
        check.main(args.search)
    elif args.command == "generate":
        generate.main(args.excel_name)
    elif args.command == "serve":
        uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)
    else:
        parser.print_help()



if __name__ == "__main__":
    main()
