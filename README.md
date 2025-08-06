# 📄 python-cv-generator

**python-cv-generator** is a CLI-based tool that converts structured JSON resume data into a clean, professional PDF using the ReportLab library. It is optimized for both ATS parsing and human readability.

---

## ✨ Features

- Convert JSON CVs into ATS-compliant PDFs
- Auto-formatted sections: Contact, Summary, Experience, Skills, Education, and Languages
- 3-column skill grid with auto-layout
- Interactive email and link support
- Duration and date range formatting

---

## 🚀 Getting Started

### 📥 Clone the Repository

```bash
git clone https://github.com/Amirmuhammadshk/python-cv-generator.git
cd python-cv-generator
```

🧪 Set Up Virtual Environment

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```
macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```
📦 Install Requirements
```bash
pip install -r requirements.txt
```
🛠️ Usage (CLI)

Once everything is set up, run the tool like this:
```bash
python generate.py --input path/to/input.json
```
Optional:
```bash
python generate.py --input path/to/input.json --output path/to/output.pdf
```
If --output is not specified, it defaults to cv_output.pdf.

📂 Input JSON Format

    The input JSON file must contain fields like:

        name, role, contact, summary

        experiences[], coreSkills[]

        education, languages[]

A sample template is recommended for structure guidance (not included in this repo).
