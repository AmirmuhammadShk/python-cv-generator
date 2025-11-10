import openpyxl
import argparse

def search_in_excel(file_path, search_string):
    """
    Search for a string in all sheets and cells of an Excel file.
    Returns True if found, otherwise False.
    """
    workbook = openpyxl.load_workbook(file_path, data_only=True)

    for sheet in workbook.worksheets:
        for row in sheet.iter_rows(values_only=True):
            for cell in row:
                if cell is not None and search_string.lower() in str(cell).lower():
                    return True
    return False

def main():
    parser = argparse.ArgumentParser(description="Search for a string in a fixed Excel file.")
    parser.add_argument("--search", required=True, help="String to search for")
    args = parser.parse_args()

    file_path = "All_applyDetail.xlsx"  # 🔧 Change this to your actual Excel file name
    found = search_in_excel(file_path, args.search)

    print(found)

if __name__ == "__main__":
    main()
