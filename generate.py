import json
import argparse
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
from reportlab.lib import colors

def thin_divider():
    return HRFlowable(
        width="100%", thickness=0.5, lineCap='round',
        color=colors.HexColor("#DDDDDD"),
        spaceBefore=6, spaceAfter=6
    )

def calculate_duration(start, end):
    start_date = datetime(int(start["year"]), int(start["month"]), 1)
    if isinstance(end, dict) and "present" not in str(end).lower():
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
    def fmt(part):
        if isinstance(part, dict):
            y = str(part.get('year', '')).strip()
            m = str(part.get('month', '')).strip()
            return f"{y}/{m}" if y and m else y or m or ""
        return str(part).strip()
    s = fmt(start)
    e = fmt(end)
    return f"{s} - {e}" if s or e else ""

def section_rule():
    return HRFlowable(width="100%", thickness=0.8, lineCap='round',
                      color=colors.HexColor("#DDDDDD"), spaceBefore=10, spaceAfter=10)

# ---------- NEW: detail rendering helpers ----------
def is_bullet_line(line: str) -> bool:
    l = line.strip()
    return l.startswith("- ") or l.startswith("• ")

def make_bullet_list(text: str, para_style: ParagraphStyle):
    """
    Convert lines starting with '- ' or '• ' into a ListFlowable.
    Ignores empty lines. Single-level bullets are supported (simple and clean for CVs).
    """
    items = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if is_bullet_line(line):
            # remove leading bullet symbol
            if line.startswith("- "):
                line = line[2:].strip()
            elif line.startswith("• "):
                line = line[2:].strip()
            items.append(ListItem(Paragraph(line, para_style), leftIndent=6))
    if not items:
        return None
    return ListFlowable(
        items,
        bulletType='bullet',
        bulletFontName='Helvetica',
        bulletFontSize=9,
        bulletColor=colors.HexColor("#333333"),
        start=None,
        leftIndent=10,
        spaceBefore=2,
        spaceAfter=2
    )

def render_detail(text: str, para_style: ParagraphStyle):
    """
    If the detail looks like a bullet list, return a ListFlowable.
    Otherwise, return a list of small paragraphs (split on double newlines / single newlines).
    """
    # Heuristic: any line starting with '- ' or '• ' -> bullets
    if any(is_bullet_line(l) for l in text.splitlines()):
        lf = make_bullet_list(text, para_style)
        return [lf] if lf else []

    # Otherwise, split into tidy paragraphs
    blocks = [b.strip() for b in text.replace("\r\n", "\n").split("\n\n") if b.strip()]
    if not blocks:
        # fallback: split single newlines
        blocks = [b.strip() for b in text.split("\n") if b.strip()]
    return [Paragraph(b, para_style) for b in blocks]
# ---------------------------------------------------

def create_cv_pdf(data, output_path="cv_output.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=LETTER,
                            rightMargin=50, leftMargin=50,
                            topMargin=60, bottomMargin=40)
    styles = getSampleStyleSheet()
    content = []

    # Custom Styles
    header_style = ParagraphStyle('Header', parent=styles['Heading1'], fontSize=22,
                                  alignment=TA_CENTER, spaceAfter=6)
    role_style = ParagraphStyle('Role', parent=styles['Heading2'], fontSize=12,
                                alignment=TA_CENTER, textColor="grey", spaceAfter=12)
    contact_style = ParagraphStyle('Contact', fontSize=9, alignment=TA_CENTER,
                                   textColor="blue", spaceAfter=4)
    section_header = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontSize=14,
                                    spaceBefore=6, spaceAfter=6, fontName="Helvetica-Bold")
    normal = styles['Normal']

    # Slightly looser style for body text
    normal.leading = normal.fontSize + 2

    # Experience text: a bit more leading + spacing for readability
    exp_text = ParagraphStyle(
        'ExpText',
        parent=normal,
        leading=normal.fontSize + 3,
        spaceBefore=1,
        spaceAfter=3
    )

    # Bullet paragraph style (used inside ListFlowable)
    bullet_text = ParagraphStyle(
        'BulletText',
        parent=normal,
        leftIndent=0,
        leading=normal.fontSize + 2,
        spaceAfter=1
    )

    # === Header: Name, Role, Contact ===
    content.append(Paragraph(data['name'], header_style))
    content.append(Paragraph(data['role'], role_style))

    contact_text_style = ParagraphStyle(
        'ContactText',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor="black",
        spaceAfter=2
    )
    contact_link_style = ParagraphStyle(
        'ContactLink',
        parent=contact_text_style,
        textColor="blue"   # only links are blue
    )

    # === Contact ===
    raw_contact = data.get('contact', {}) or {}
    contact = { (k.lower() if isinstance(k, str) else k): v for k, v in raw_contact.items() }

    def as_url(v, prefix=""):
        v = (v or "").strip()
        if not v:
            return ""
        if v.startswith("http://") or v.startswith("https://"):
            return v
        return prefix + v

    # --- Line 1: Email + Links ---
    line1_parts = []
    email = (contact.get("email") or "").strip()
    if email:
        line1_parts.append(f"<link href='mailto:{email}'>{email}</link>")
    li = as_url(contact.get("linkedin"), "https://www.linkedin.com/in/")
    gh = as_url(contact.get("github"), "https://github.com/")
    pw = as_url(contact.get("personalwebsite"), "")
    if li: line1_parts.append(f"<link href='{li}'>LinkedIn</link>")
    if gh: line1_parts.append(f"<link href='{gh}'>GitHub</link>")
    if pw: line1_parts.append(f"<link href='{pw}'>Website</link>")
    if line1_parts:
        content.append(Paragraph(" . ".join(line1_parts), contact_link_style))

    # --- Line 2: Address + Phone ---
    line2_parts = []
    addr = contact.get("address")
    if isinstance(addr, dict):
        addr_text = ", ".join([x for x in [addr.get("country", ""), addr.get("city", "")] if x])
    else:
        addr_text = (addr or "").strip()
    if addr_text:
        line2_parts.append(f"{addr_text}")
    phone = (contact.get("phone") or "").strip()
    if phone:
        line2_parts.append(f"{phone}")
    if line2_parts:
        content.append(Paragraph(" . ".join(line2_parts), contact_text_style))

    content.append(Spacer(1, 0.18 * inch))

    # === Summary ===
    content.append(section_rule())
    content.append(Paragraph("Professional Summary", section_header))
    content.append(Paragraph(data.get("summary", ""), normal))

    # === Core Skills (text) ===
    content.append(section_rule())
    content.append(Paragraph("Core Skills", section_header))
    skills_data = data.get("coreSkills", [])
    for group in skills_data:
        cat = group.get("category", "")
        skills = group.get("skills", [])
        skills_line = ", ".join(skills)
        content.append(Paragraph(f"<b>{cat}:</b> {skills_line}", normal))
    content.append(Spacer(1, 0.12 * inch))

    # === Professional Experience ===
    content.append(section_rule())
    content.append(Paragraph("Professional Experience", section_header))

    experiences = data.get("experiences", [])
    for i, exp in enumerate(experiences):
        date_range = format_date_range(exp['start'], exp['end'])
        duration = calculate_duration(exp['start'], exp['end'])

        # Top line: Role (left) ... date range + duration (right)
        left = f"<b>{exp['role']}</b>"
        right = f"<b>{date_range} ({duration})</b>"

        t = Table(
            [[Paragraph(left, normal), Paragraph(right, normal)]],
            colWidths=["*", 2.6 * inch],   # left flexes, right fixed
            hAlign="LEFT"
        )
        t.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('LEFTPADDING',  (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING',   (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 0),
        ]))

        # Company line
        details_line = f"<b>{exp['company']}</b>, {exp['location']} | {exp['type']} | {exp['workType']}"
        company_para = Paragraph(details_line, exp_text)

        # Detail rendering (bullets or paragraphs)
        detail_text = exp.get('detail', '') or ''
        detail_flowables = render_detail(detail_text, bullet_text)

        # Group experience block together so it doesn't break awkwardly
        block = [t, company_para] + detail_flowables
        content.append(KeepTogether(block))

        # Divider between experiences (not after the last)
        if i < len(experiences) - 1:
            content.append(thin_divider())

    # === Education ===
    content.append(section_rule())
    content.append(Paragraph("Education", section_header))
    edu = data.get("education", {}) or {}

    edu_left  = f"<b>{edu.get('grade','')}</b>"
    edu_range = ""
    if edu.get("start") or edu.get("end"):
        edu_range = format_date_range(edu.get('start'), edu.get('end'))

    if edu_range:
        edu_table = Table(
            [[Paragraph(edu_left, normal), Paragraph(f"<b>{edu_range}</b>", normal)]],
            colWidths=["*", 2.6 * inch],
            hAlign="LEFT"
        )
        edu_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('LEFTPADDING',  (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING',   (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 0),
        ]))
        content.append(edu_table)
    else:
        content.append(Paragraph(edu_left, normal))

    content.append(Paragraph(edu.get('university', ''), normal))
    content.append(Spacer(1, 0.10 * inch))

    # === Languages ===
    content.append(section_rule())
    content.append(Paragraph("Languages", section_header))
    for lang in data.get("languages", []):
        content.append(Paragraph(f"{lang['language']}: {lang['level']}", normal))

    # Final rule for clean finish
    content.append(section_rule())

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

