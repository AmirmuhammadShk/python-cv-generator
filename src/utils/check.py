# cli/check.py
import openpyxl
import argparse
from pathlib import Path
from core.config import get_store_file

def search_in_excel(file_path: Path, search_string: str) -> bool:
    """
    Search for a string in all sheets and cells of an Excel file.
    Returns True if found, otherwise False.
    """
    workbook = openpyxl.load_workbook(file_path, data_only=True)
    for sheet in workbook.worksheets:
        for row in sheet.iter_rows(values_only=True):
            for cell in row:
                if cell and search_string.lower() in str(cell).lower():
                    return True
    return False

def main():
    parser = argparse.ArgumentParser(description="Search for a string in the Excel file located under 'data/'.")
    parser.add_argument("--search", required=True, help="String to search for in the Excel file.")
    args = parser.parse_args()

    # file_path = Path(__file__).resolve().parent.parent / "data" / "All_applyDetail.xlsx"

    file_path = get_store_file()

    if not file_path.exists():
        print(f"❌ Excel file not found: {file_path}")
        return

    found = search_in_excel(file_path, args.search)
    print("✅ Found!" if found else "❌ Not found.")

if __name__ == "__main__":
    main()
