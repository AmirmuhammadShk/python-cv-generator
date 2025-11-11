
#!/usr/bin/env python3
# src/utils/statistics.py
# Description:
#   Display statistics from the Excel store file defined in config.yaml.
#   Specifically:
#     - Count of today's applications (overall)
#     - Count of today's applications grouped by location

import pandas as pd
from datetime import datetime
from pathlib import Path
from core.config import get_store_file, get_current_apply_dir


def main():
    # --- Load Excel path from config ---
    try:
        excel_path: Path = get_store_file()
    except (FileNotFoundError, KeyError) as e:
        print(f"❌ {e}")
        return

    if not excel_path.exists():
        print(f"❌ Excel file not found at {excel_path}")
        return

    print(f"📘 Using Excel file: {excel_path}")

    # --- Read Excel file ---
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"❌ Failed to read Excel file: {e}")
        return

    # --- Validate expected columns ---
    required_cols = {"applyDateTime", "location"}
    missing = required_cols - set(df.columns)
    if missing:
        print(f"⚠️ Missing required columns: {', '.join(missing)}")
        print(f"Available columns: {list(df.columns)}")
        return

    # --- Convert and normalize date ---
    df["applyDateTime"] = pd.to_datetime(df["applyDateTime"], errors="coerce")
    df = df.dropna(subset=["applyDateTime"])

    today = datetime.now().date()
    today_df = df[df["applyDateTime"].dt.date == today]

    # --- Count applications ---
    total_count = len(today_df)
    print(f"\n📅 Date: {today}")
    print(f"🧾 Total applications today: {total_count}")

    if total_count == 0:
        print("No applications found for today.")
        return

    # --- Group by location ---
    grouped = (
        today_df.groupby("location")
        .size()
        .reset_index(name="count")
        .sort_values(by="count", ascending=False)
    )

    print("\n🌍 Applications by location:")
    for _, row in grouped.iterrows():
        print(f"  - {row['location']}: {row['count']}")

    print("\n✅ Statistics generated successfully.")


if __name__ == "__main__":
    main()
