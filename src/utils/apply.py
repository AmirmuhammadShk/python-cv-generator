#!/usr/bin/env python3
# src/cli/apply.py
# Description:
# 1. Ask for company name, role, and job description.
# 2. Read data from src/data/{prompt.txt, career.json, schema.json}.
# 3. Replace placeholders and save prompt.txt in applies/YYYY_MM_DD/apl_<company_name>.
# 4. Update config.yaml.

import os
import sys
import yaml
import json
from datetime import datetime
from pathlib import Path

def main():
    # --- Setup paths ---
    root_dir = Path(__file__).resolve().parents[2]  # project root
    config_file = root_dir / "config.yaml"
    data_dir = root_dir / "src" / "data"
    prompt_file = data_dir / "prompt.txt"
    career_file = data_dir / "career.json"
    schema_file = data_dir / "schema.json"

    # --- Read config and applies_dir ---
    if config_file.exists():
        with open(config_file, "r") as f:
            try:
                config = yaml.safe_load(f) or {}
            except yaml.YAMLError:
                config = {}
        applies_dir = Path(config.get("applies_dir", root_dir / "applies"))
    else:
        applies_dir = root_dir / "applies"
        config = {}
    # --- User input ---
    company_name = input("🏢 Enter company name: ").strip()
    if not company_name:
        print("❌ Company name cannot be empty.")
        sys.exit(1)

    role = input("💼 Enter role title: ").strip()
    if not role:
        print("❌ Role cannot be empty.")
        sys.exit(1)

    print("📝 Paste the job description below (press Ctrl+D to finish on macOS/Linux, or Ctrl+Z then Enter on Windows):")
    print("──────────────────────────────────────────────────────────────")
    job_description = sys.stdin.read().strip()
    print("──────────────────────────────────────────────────────────────")

    if not job_description:
        print("❌ Job description cannot be empty.")
        sys.exit(1)

    # --- Add role at the beginning of the job description ---
    job_description = f"role : {role}\n\n{job_description}"

    # --- Create apply directory ---
    today_dir = datetime.now().strftime("%Y_%m_%d")
    date_dir = applies_dir / today_dir
    final_dir = date_dir / f"apl_{company_name.replace(' ', '_')}"
    final_dir.mkdir(parents=True, exist_ok=True)

    # --- Read data files ---
    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            prompt_template = f.read()
        with open(career_file, "r", encoding="utf-8") as f:
            career_json = json.dumps(json.load(f), indent=2, ensure_ascii=False)
        with open(schema_file, "r", encoding="utf-8") as f:
            output_schema = json.dumps(json.load(f), indent=2, ensure_ascii=False)
    except FileNotFoundError as e:
        print(f"❌ Missing data file: {e.filename}")
        sys.exit(1)

    # --- Replace placeholders in prompt.txt ---
    filled_prompt = (
        prompt_template
        .replace("{career_json}", career_json)
        .replace("{job_description}", job_description)
        .replace("{date_and_time}", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        .replace("{company_name}", company_name)
        .replace("{output_schema}", output_schema)
    )

    # --- Save final prompt.txt ---
    prompt_output_path = final_dir / "prompt.txt"
    with open(prompt_output_path, "w", encoding="utf-8") as f:
        f.write(filled_prompt)
    print(f"✅ Generated prompt.txt → {prompt_output_path}")

    cv_data_path = final_dir/ "cv_data.json"
    with open(cv_data_path, "w", encoding="utf-8") as f:
        f.write("{}")
    print(f"✅ Generated cv_data.json → {cv_data_path}")
    

    # --- Update config.yaml ---
    config["current_apply_dir"] = str(final_dir)
    with open(config_file, "w", encoding="utf-8") as f:
        yaml.safe_dump(config, f, sort_keys=False)
    print(f"📝 Updated config.yaml → current_apply_dir: {final_dir}")

    print("🎉 Apply directory successfully created!")
    print(f"📁 {final_dir}")

if __name__ == "__main__":
    main()
