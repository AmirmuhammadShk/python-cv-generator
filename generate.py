import json
import argparse
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
def calculate_duration(start, end):
    start_date = datetime(int(start["year"]), int(start["month"]), 1)
    if isinstance(end, dict):
        end_date = datetime(int(end["year"]), int(end["month"]), 1)
    else:
        end_date = datetime.today()

    delta_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
    years = delta_months // 12
    months = delta_months % 12

    parts = []
    if years:
        parts.append(f"{years} yr{'s' if years > 1 else ''}")
    if months:
        parts.append(f"{months} mo{'s' if months > 1 else ''}")
    return " ".join(parts) if parts else "0 mos"
def load_cv_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def format_date_range(start, end):
    start_str = f"{start['year']}/{start['month']}"
    end_str = f"{end['year']}/{end['month']}" if isinstance(end, dict) else end
    return f"{start_str} - {end_str}"

def create_cv_pdf(data, output_path="cv_output.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=LETTER,
                            rightMargin=50, leftMargin=50,
                            topMargin=60, bottomMargin=40)
    styles = getSampleStyleSheet()
    content = []

    # Custom Styles
    header_style = ParagraphStyle('Header', parent=styles['Heading1'], fontSize=22, alignment=TA_CENTER, spaceAfter=6)
    role_style = ParagraphStyle('Role', parent=styles['Heading2'], fontSize=14, alignment=TA_CENTER, textColor="grey", spaceAfter=12)
    contact_style = ParagraphStyle('Contact', fontSize=9, alignment=TA_CENTER, textColor="blue", spaceAfter=4)

    section_header = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontSize=14, spaceBefore=12, spaceAfter=6, fontName="Helvetica-Bold")

    normal = styles['Normal']
    bold = ParagraphStyle('Bold', parent=normal, fontName='Helvetica-Bold')

  # === Header: Name, Role, Contact ===
    content.append(Paragraph(data['name'], header_style))
    content.append(Paragraph(data['role'], role_style))

    # Contact info inline and clickable
    contact = data.get('contact', {})
    contact_parts = []
    for label, value in contact.items():
        if value:
            href = f"mailto:{value}" if label.lower() == "email" else value
            contact_parts.append(f'<link href="{href}">{label.capitalize()}</link>')

    if contact_parts:
        contact_line = " | ".join(contact_parts)
        content.append(Paragraph(contact_line, contact_style))

    content.append(Spacer(1, 0.2 * inch))

    # === Summary ===
    content.append(Paragraph("Professional Summary", section_header))
    content.append(Paragraph(data.get("summary", ""), normal))

    # === Experience Section ===
    content.append(Paragraph("Professional Experience", section_header))
    for exp in data.get("experiences", []):
        date_range = format_date_range(exp['start'], exp['end'])
        duration = calculate_duration(exp['start'], exp['end'])
        role_date_line = f"<b>{exp['role']}</b> .............................................................. <b>{date_range} ({duration})</b>"
        content.append(Paragraph(role_date_line, normal))

        details_line = f"{exp['company']}, {exp['location']} | {exp['type']} | {exp['workType']}"
        content.append(Paragraph(details_line, normal))

        content.append(Paragraph(exp['detail'], normal))
        content.append(Spacer(1, 0.15 * inch))


    # === Core Skills (Grid View with 3 Columns) ===
    content.append(Paragraph("Core Skills", section_header))
    skills_data = data.get("coreSkills", [])

    # Divide into rows of 3 categories
    rows = []
    for i in range(0, len(skills_data), 3):
        group = skills_data[i:i+3]

        # Headers (Category titles)
        row_titles = [Paragraph(f"<b>{col['category']}</b>", normal) for col in group]
        while len(row_titles) < 3:
            row_titles.append("")
        rows.append(row_titles)

        # Max number of skills in these 3 categories
        max_len = max(len(col['skills']) for col in group)

        # Skills per row
        for j in range(max_len):
            row = []
            for col in group:
                skill = col['skills'][j] if j < len(col['skills']) else ""
                row.append(Paragraph(skill, normal))
            while len(row) < 3:
                row.append("")
            rows.append(row)

    # Create the table
    table = Table(rows, colWidths=[doc.width / 3.0] * 3)
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
    ]))
    content.append(table)
    content.append(Spacer(1, 0.2 * inch))

    

    # === Education ===
    content.append(Paragraph("Education", section_header))
    edu = data.get("education", {})
    content.append(Paragraph(edu.get('grade', ''), normal))
    content.append(Paragraph(edu.get('university', ''), normal))
    content.append(Spacer(1, 0.15 * inch))

    # === Languages ===
    content.append(Paragraph("Languages", section_header))
    for lang in data.get("languages", []):
        content.append(Paragraph(f"{lang['language']}: {lang['level']}", normal))
    # === Build PDF ===
    doc.build(content)
    print(f"✅ PDF created at: {output_path}")

# Entry point with CLI
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert JSON CV to ATS+HR Friendly PDF")
    parser.add_argument("--input", "-i", required=True, help="Path to JSON file")
    parser.add_argument("--output", "-o", default="cv_output.pdf", help="Output PDF file name")

    args = parser.parse_args()
    cv_data = load_cv_data(args.input)
    create_cv_pdf(cv_data, args.output)
