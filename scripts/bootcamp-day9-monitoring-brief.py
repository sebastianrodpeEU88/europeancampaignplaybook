"""The weekly monitoring brief: a fillable, printable A4 worksheet (one page).

Day 9 of the AI bootcamp opens with a nine-row brief to fill in before you
open any tool, on any of the four platforms. Filling it in a browser is the
wrong place for it, so it lives here as a form people can type into or print.

Built on the brand green, since the brand colour moved to green in October
2026. The day 8 worksheet keeps the old orange until it is next rebuilt.

Uses the site's own fonts (decompressed from src/app/fonts/*.woff2 at run
time), so the download matches the website.

    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/bootcamp-day9-monitoring-brief.py
"""
import os, tempfile
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "downloads", "ai-bootcamp-day-9-monitoring-brief.pdf")
ARTICLE = "campaignplaybook.eu/articles/ai-bootcamp-eu-affairs-day-9"


def hexc(h, a=1.0):
    h = h.lstrip("#")
    return Color(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), alpha=a)


PAPER = hexc("EDE7DA"); NAVY = hexc("0A1D2B"); GREEN = hexc("2B5F29"); INK = hexc("111111")
MUTED = hexc("5F5E5A"); FIELD_BORDER = hexc("CFC7B7"); WHITE = hexc("FFFFFF")
RULE = hexc("CFC7B7")


def _fonts():
    from fontTools.ttLib import TTFont as FT
    tmp = tempfile.mkdtemp(prefix="ecp-fonts-")
    for name, file in (("RC", "roboto-condensed-700"), ("IN", "inter")):
        dst = os.path.join(tmp, f"{file}.ttf")
        f = FT(os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2")); f.flavor = None; f.save(dst)
        pdfmetrics.registerFont(TTFont(name, dst))


_fonts()

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]
W, H = A4
M = 36

# The nine rows, with the article's own examples as the hint under each label.
# The last two carry a mark, because they are the two people skip.
ROWS = [
    ("Mission", "Monitor our priority EU issue, weekly", False),
    ("Keywords", "Democracy Shield, electoral integrity, political advertising", False),
    ("Organisations", "Commission, Parliament, the relevant committees", False),
    ("Knowledge", "Organisation brief and approved positions", False),
    ("Sources", "EU primary sources plus an approved media list", False),
    ("Output", "One page, same shape every week", False),
    ("Frequency", "Monday morning, where scheduling exists", False),
    ("Boundary", "Internal draft only", True),
    ("Human owner", "A named person, not the team", True),
]


def arrow(c, x, y, size, col):
    s = size / 96; p = c.beginPath()
    p.moveTo(x + ARROW[0][0] * s, y + size - ARROW[0][1] * s)
    for px, py in ARROW[1:]: p.lineTo(x + px * s, y + size - py * s)
    p.close(); c.setFillColor(col); c.drawPath(p, fill=1, stroke=0)


def field(c, name, tip, x, y, w, h, multiline=True):
    c.acroForm.textfield(name=name, tooltip=tip, x=x, y=y, width=w, height=h,
                         fieldFlags="multiline" if multiline else "", fontName="Helvetica", fontSize=9,
                         borderWidth=0.6, borderColor=FIELD_BORDER, fillColor=WHITE, textColor=INK,
                         forceBorder=True)


def header(c, subtitle):
    c.setFillColor(NAVY); c.rect(0, H - 44, W, 44, fill=1, stroke=0)
    arrow(c, M, H - 44 + 15, 13, PAPER)
    c.setFont("RC", 12.5); c.setFillColor(PAPER); c.drawString(M + 19, H - 44 + 16.5, "european campaign")
    c.setFillColor(hexc("EDE7DA", 0.6))
    c.drawString(M + 19 + c.stringWidth("european campaign ", "RC", 12.5), H - 44 + 16.5, "playbook")
    c.setFont("IN", 7.5); c.setFillColor(hexc("EDE7DA", 0.75))
    c.drawRightString(W - M, H - 44 + 17, subtitle)


def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("The weekly monitoring brief")
    c.setAuthor("european campaign playbook")
    c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
    header(c, "AI bootcamp for EU affairs  ·  day 9")

    c.setFont("RC", 21); c.setFillColor(GREEN)
    c.drawString(M, H - 76, "The weekly monitoring brief")
    c.setFont("IN", 7.8); c.setFillColor(MUTED)
    c.drawString(M, H - 91, "Fill this in before you open any tool. Ten minutes here saves an afternoon inside a configuration")
    c.drawString(M, H - 101, "screen, and the same page works on Microsoft 365 Copilot, Claude, Mistral and ChatGPT.")

    # Who is filling it in, and for which platform.
    fx = M
    for label, fw in (("Built on", 130), ("Owner", 120), ("Date", 78)):
        c.setFont("IN", 7.5); c.setFillColor(MUTED); c.drawString(fx, H - 126, label)
        lw = c.stringWidth(label, "IN", 7.5)
        field(c, label.lower().replace(" ", "_"), label, fx + lw + 6, H - 130, fw, 15, multiline=False)
        fx += lw + 6 + fw + 16

    # The nine rows: label and example on the left, the box to fill on the
    # right. Uniform heights, sized to fill the page down to the closing note,
    # so the labels line up with their boxes and nothing floats.
    label_w = 150
    box_x = M + label_w
    box_w = W - M - box_x
    top = H - 176                      # clear of the meta row above
    bottom = 152                       # leaves room for the note and footer
    gap = 10
    h = (top - bottom - gap * (len(ROWS) - 1)) / len(ROWS)

    y = top - h
    for label, example, flagged in ROWS:
        c.setFont("RC", 11.5); c.setFillColor(GREEN if flagged else NAVY)
        c.drawString(M, y + h - 12, label)
        c.setFont("IN", 7); c.setFillColor(MUTED)
        for i, line in enumerate(_wrap(c, example, "IN", 7, label_w - 12)):
            c.drawString(M, y + h - 24 - i * 8.5, line)
        field(c, label.lower().replace(" ", "_"), example, box_x, y, box_w, h)
        y -= h + gap
    y += gap                           # back to the bottom of the last box

    # The closing note, in the same green as the two flagged rows.
    # The note and the footer sit at fixed heights, clear of each other.
    c.setStrokeColor(RULE); c.setLineWidth(0.5); c.line(M, 112, W - M, 112)
    c.setFont("IN", 8); c.setFillColor(GREEN)
    lead = "The last two rows matter more than the first seven."
    c.drawString(M, 94, lead)
    c.setFillColor(MUTED)
    c.drawString(M + c.stringWidth(lead + " ", "IN", 8), 94,
                 "A boundary nobody wrote down is a boundary")
    c.drawString(M, 82, "nobody set, and a team is not an owner.")

    c.setStrokeColor(FIELD_BORDER); c.setLineWidth(0.5); c.line(M, 46, W - M, 46)
    c.setFont("IN", 7); c.setFillColor(MUTED)
    c.drawString(M, 32, ARTICLE)
    c.drawRightString(W - M, 32, "Day 9  ·  projects before agents")
    c.showPage(); c.save()


def _wrap(c, text, font, size, width):
    out, line = [], ""
    for w in text.split():
        t = (line + " " + w).strip()
        if c.stringWidth(t, font, size) <= width: line = t
        else: out.append(line); line = w
    if line: out.append(line)
    return out


def build_docx():
    """The same brief as an editable Word file, for people who would rather
    type into it than use a PDF form."""
    from docx import Document
    from docx.shared import Pt, RGBColor, Cm

    doc = Document()
    for section in doc.sections:
        section.top_margin = section.bottom_margin = Cm(2)
        section.left_margin = section.right_margin = Cm(2)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10)

    title = doc.add_paragraph()
    tr = title.add_run("The weekly monitoring brief")
    tr.bold = True
    tr.font.size = Pt(24)
    tr.font.color.rgb = RGBColor.from_string("0A1D2B")

    sub = doc.add_paragraph()
    sub.paragraph_format.space_after = Pt(12)
    sr = sub.add_run("AI bootcamp for EU affairs, day 9  ·  european campaign playbook  ·  campaignplaybook.eu")
    sr.font.size = Pt(9)
    sr.font.color.rgb = RGBColor.from_string("5F5E5A")

    intro = doc.add_paragraph()
    intro.paragraph_format.space_after = Pt(12)
    ir = intro.add_run(
        "Fill this in before you open any tool. Ten minutes here saves an afternoon inside a "
        "configuration screen, and the same page works on Microsoft 365 Copilot, Claude, Mistral "
        "and ChatGPT."
    )
    ir.font.size = Pt(10)

    meta = doc.add_table(rows=1, cols=3)
    meta.style = "Table Grid"
    for cell, label in zip(meta.rows[0].cells, ("Built on", "Owner", "Date")):
        cell.text = f"{label}: "

    doc.add_paragraph()

    table = doc.add_table(rows=1, cols=3)
    table.style = "Table Grid"
    for cell, label in zip(table.rows[0].cells, ("Element", "Example", "Yours")):
        run = cell.paragraphs[0].add_run(label)
        run.bold = True
        run.font.color.rgb = RGBColor.from_string("2B5F29")
    for label, example, _flagged in ROWS:
        cells = table.add_row().cells
        r = cells[0].paragraphs[0].add_run(label)
        r.bold = True
        e = cells[1].paragraphs[0].add_run(example)
        e.font.size = Pt(9)
        e.font.color.rgb = RGBColor.from_string("5F5E5A")
        cells[2].text = ""

    close = doc.add_paragraph()
    close.paragraph_format.space_before = Pt(12)
    cr = close.add_run("The last two rows matter more than the first seven. ")
    cr.bold = True
    cr.font.color.rgb = RGBColor.from_string("2B5F29")
    rest = close.add_run(
        "A boundary nobody wrote down is a boundary nobody set, and a team is not an owner."
    )
    rest.font.color.rgb = RGBColor.from_string("5F5E5A")

    out = OUT.replace(".pdf", ".docx")
    doc.save(out)
    return out


if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    build(); print("wrote", OUT)
    print("wrote", build_docx())
