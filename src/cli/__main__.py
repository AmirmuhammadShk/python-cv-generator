import argparse
import sys
from utils import apply, check, generate, statistics  # 👈 added import


def main():
    parser = argparse.ArgumentParser(prog="jobuine", description="Jobuine CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # apply
    subparsers.add_parser("apply", help="Create a new apply directory interactively")

    # check
    check_parser = subparsers.add_parser("check", help="Search in Excel file")
    check_parser.add_argument("--search", required=True, help="Search term")

    # generate
    subparsers.add_parser("generate", help="Generate PDFs and update Excel (path from config.yaml)")

    # stats
    subparsers.add_parser("stats", help="Show today's application statistics") 

    args = parser.parse_args()

    # Dispatch commands
    if args.command == "apply":
        apply.main()

    elif args.command == "check":
        check.main(args.search)

    elif args.command == "generate":
        generate.main()

    elif args.command == "stats":  
        statistics.main()

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
