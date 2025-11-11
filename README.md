# 🐧 Jobuine — Smart Penguin-Powered Career Companion

**Jobuine** is a smart and friendly command-line (CLI)  designed to simplify and supercharge your career workflow.  
Whether you're applying for jobs, tracking your progress, generating documents, or running statistics — Jobuine helps you stay productive, all with a dash of penguin charm.

---

## 🧭 Features

- 📝 **Apply** — Create and organize new job application directories interactively.  
- 🔍 **Check** — Search inside Excel job-tracking files for matching terms.  
- 🧠 **Generate** — Automatically generate application PDFs and update Excel logs.  
- 📊 **Stats** — View daily job application statistics.

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AmirmuhammadShk/Jobuine.git
cd Jobuine
```

### 2. Create and Activate a Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
pip install -e .
```

### 4. Setup Configuration

Copy example files and edit as needed:

```bash
cp config.yaml.example config.yaml
cp src/data/career.json.example src/data/career.json
```

---

## 🧩 Configuration Guide

### 🧠 Step 1 — Create and Edit `career.json`

The `career.json` file holds your personal career profile, following the structure defined in `src/data/schema.json`.  
You should update this file with your own career details such as **name**, **skills**, **experience**, and **education**.
Make sure your `career.json` matches the structure in `schema.json` for compatibility.

---

### ⚙️ Step 2 — Edit `config.yaml`

The `config.yaml` file contains runtime configuration for Jobuine.  
After copying the example file (`config.yaml.example`), edit it with your own paths and settings.

Example configuration:

```yaml
applies_dir: /home/amir/Work/applies
store_file: /home/amir/Work/applies/job_applications.xlsx
current_apply_dir: 
```

**Field Descriptions:**
- `applies_dir`: Path to the directory where Jobuine will create and manage job applications.  
- `store_file`: Path to the Excel (`.xlsx`) file used to store job application data.  
- `current_apply_dir`: Leave this empty — it will be updated automatically when new applications are created.

---

## 🧰 Usage

After installation, the main CLI entry point is **`jobuine`**.

### 1. Create a New Job Application Folder

```bash
jobuine apply
```

This starts an interactive prompt to create a structured job application directory.

---
### 2. Prepare cv.json
now in  `applies_dir/TODAY_DATE/apl_COMPANY_NAME`
you can see 2 file :
- `cv.json`
- `prompt.txt`
First Copy Content Of prompt.txt and paste in your Own LLM
Second Copy LLM Output Json and pase to cv.json

---

### 3. Generate Application PDFs

```bash
jobuine generate
```

Automatically builds your optimized Resume as PDF according to `cv.json` in `applies_dir/TODAY_DATE/apl_COMPANY_NAME` and update your excel file.

---
### 4. Search in Excel File

```bash
jobuine check --search "Company Name"
```

Find job listings or past applications in your Excel log.

### 5. View Application Statistics

```bash
jobuine stats
```

Displays daily job application statistics to track your progress.

---

## 📂 Project Structure

```
.
├── config.yaml.example
├── pyproject.toml
├── README.md
├── requirements.txt
└── src
    ├── cli
    │   └── __main__.py
    ├── core
    │   └── config.py
    ├── data
    │   ├── career.json.example
    │   ├── prompt.txt
    │   └── schema.json
    ├── extension
    └── utils
        ├── apply.py
        ├── check.py
        ├── generate.py
        ├── __init__.py
        └── statistics.py
```

---

## 📄 License

**Jobuine** is **open-source** and **free software**, released under the **MIT License**.  
It is developed in the spirit of the **Free Software Foundation (FSF)** — ensuring that anyone can use, modify, and distribute it freely.

You are encouraged to:
- 🧠 Study how the program works and adapt it to your needs.  
- 🛠️ Share copies of Jobuine to help others.  
- 🪶 Improve the software and publish your improvements for the community.


---

**Made with Power of 🐧 by the Amir Shakeri**