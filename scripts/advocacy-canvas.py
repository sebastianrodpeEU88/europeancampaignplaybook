"""The advocacy canvas: a one-page, fillable, printable PDF (A4 landscape).

Uses the site's own fonts (decompressed from src/app/fonts/*.woff2 at run time)
and colour tokens, so the download matches the website and the bootcamp.

    python3 scripts/advocacy-canvas.py
"""
import os, tempfile
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "downloads", "advocacy-canvas.pdf")

def hexc(h, a=1.0):
    h = h.lstrip("#")
    return Color(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), alpha=a)

PAPER = hexc("EDE7DA"); NAVY = hexc("0A1D2B"); ORANGE = hexc("dd3c13"); INK = hexc("111111")
MUTED = hexc("5F5E5A"); BOX = hexc("E6E0D4"); FIELD_BORDER = hexc("CFC7B7"); WHITE = hexc("FFFFFF")
ORANGE_ON_NAVY = hexc("F0A48F")

def _fonts():
    from fontTools.ttLib import TTFont as FT
    tmp = tempfile.mkdtemp(prefix="ecp-fonts-")
    for name, file in (("RC", "roboto-condensed-700"), ("IN", "inter")):
        dst = os.path.join(tmp, f"{file}.ttf")
        f = FT(os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2")); f.flavor = None; f.save(dst)
        pdfmetrics.registerFont(TTFont(name, dst))
_fonts()

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]
W, H = landscape(A4)
M = 28

def arrow(c, x, y, size, col):
    s = size / 96; p = c.beginPath()
    p.moveTo(x + ARROW[0][0] * s, y + size - ARROW[0][1] * s)
    for px, py in ARROW[1:]: p.lineTo(x + px * s, y + size - py * s)
    p.close(); c.setFillColor(col); c.drawPath(p, fill=1, stroke=0)

def wrap(c, text, font, size, width):
    out, line = [], ""
    for w in text.split():
        t = (line + " " + w).strip()
        if c.stringWidth(t, font, size) <= width: line = t
        else: out.append(line); line = w
    if line: out.append(line)
    return out

def field(c, name, tip, x, y, w, h, multiline=True):
    c.acroForm.textfield(name=name, tooltip=tip, x=x, y=y, width=w, height=h,
                         fieldFlags="multiline" if multiline else "", fontName="Helvetica", fontSize=8,
                         borderWidth=0.6, borderColor=FIELD_BORDER, fillColor=WHITE, textColor=INK, forceBorder=True)

COLUMNS = [
    ("Why we exist", "Prompts 3 to 3.2", [
        "The spark: what made this organisation necessary?",
        "The people: who came together, and what do they believe?",
        "The fight: what’s at stake, and what happens if we win?",
        "The invitation: what do we ask people to do?"]),
    ("Who we’re reaching", "Prompts 4 to 4.2", [
        "Which stakeholders hold power or influence?",
        "Rank them by influence, likely support and alignment.",
        "Who are the people we want to reach?",
        "Who did we leave out?"]),
    ("What we want to say", "Prompt 5", [
        "Our slogan, in under ten words",
        "The core message for social, poster and email",
        "Would it make sense to someone new to us?"]),
    ("How, when and where", "Prompts 6 to 10", [
        "Visuals and video that carry the message",
        "A seven-day rollout, channel by channel",
        "What we’ll measure, and what we do if it’s low",
        "Which languages, reviewed by fluent speakers"]),
]
BASE = [
    ("Our organisation", "Who we are, mission and values, recent activity (1.1)"),
    ("Our assistant’s brief", "Custom instructions saved in our AI tool (1.2)"),
    ("The issue", "Research, perspectives, statistics, what’s missing (2)"),
]
CHECKS = ["Facts checked against the source", "Stakeholders and links verified",
          "Messages tested on a newcomer", "We asked who we left out"]

def build():
    c = canvas.Canvas(OUT, pagesize=(W, H))
    c.setTitle("The advocacy canvas"); c.setAuthor("european campaign playbook")
    c.setSubject("From the AI bootcamp for EU affairs")

    # brand band
    c.setFillColor(NAVY); c.rect(0, H - 40, W, 40, fill=1, stroke=0)
    arrow(c, M, H - 40 + 13.5, 13, PAPER)
    c.setFont("RC", 12.5); c.setFillColor(PAPER); c.drawString(M + 19, H - 40 + 15, "european campaign")
    c.setFillColor(hexc("EDE7DA", 0.6)); c.drawString(M + 19 + c.stringWidth("european campaign ", "RC", 12.5), H - 40 + 15, "playbook")
    c.setFont("IN", 7.5); c.setFillColor(hexc("EDE7DA", 0.75))
    c.drawRightString(W - M, H - 40 + 15.5, "AI bootcamp for EU affairs  ·  the advocacy canvas")

    # title + campaign fields
    c.setFont("RC", 21); c.setFillColor(ORANGE); c.drawString(M, H - 70, "The advocacy canvas")
    c.setFont("IN", 7.5); c.setFillColor(MUTED)
    c.drawString(M, H - 83, "Fill it in on screen or print it. The numbers show which bootcamp prompts help.")
    fx = W - M; specs = [("Date", 70), ("Team", 110), ("Campaign", 170)]
    for label, fw in specs:
        fx -= fw; field(c, label.lower(), label, fx, H - 80, fw, 17, multiline=False)
        lw = c.stringWidth(label, "IN", 7.5); fx -= lw + 5
        c.setFont("IN", 7.5); c.setFillColor(MUTED); c.drawString(fx, H - 74, label); fx -= 14

    # the four campaign questions
    top, bottom = H - 98, 172
    colw = (W - 2 * M - 3 * 8) / 4
    for i, (title, prompts, qs) in enumerate(COLUMNS):
        x = M + i * (colw + 8)
        c.setFillColor(BOX); c.roundRect(x, bottom, colw, top - bottom, 4, fill=1, stroke=0)
        c.setFont("RC", 12.5); c.setFillColor(NAVY); c.drawString(x + 10, top - 18, title)
        c.setFont("IN", 6.6); c.setFillColor(ORANGE); c.drawString(x + 10, top - 29, prompts.upper())
        y = top - 43
        for q in qs:
            lines = wrap(c, q, "IN", 7.2, colw - 30)
            c.setFillColor(ORANGE); c.setFont("IN", 7.2); c.drawString(x + 10, y, "•")
            c.setFillColor(INK)
            for ln in lines: c.drawString(x + 19, y, ln); y -= 9.2
            y -= 2.5
        field(c, f"box_{i + 1}", title, x + 8, bottom + 8, colw - 16, y - bottom - 10)

    # foundation
    ftop, fbot = 162, 80
    c.setFillColor(NAVY); c.roundRect(M, fbot, 134, ftop - fbot, 4, fill=1, stroke=0)
    c.setFont("RC", 12.5); c.setFillColor(PAPER); c.drawString(M + 10, ftop - 19, "Know your base")
    c.setFont("IN", 6.6); c.setFillColor(ORANGE_ON_NAVY); c.drawString(M + 10, ftop - 30, "PROMPTS 1.1, 1.2 AND 2")
    c.setFont("IN", 7.2); c.setFillColor(hexc("EDE7DA", 0.85)); y = ftop - 46
    for ln in wrap(c, "Everything above rests on this research.", "IN", 7.2, 114): c.drawString(M + 10, y, ln); y -= 9.2
    bx0 = M + 134 + 8; bw = (W - M - bx0 - 2 * 8) / 3
    for i, (title, hint) in enumerate(BASE):
        x = bx0 + i * (bw + 8)
        c.setFillColor(BOX); c.roundRect(x, fbot, bw, ftop - fbot, 4, fill=1, stroke=0)
        c.setFont("RC", 10.5); c.setFillColor(NAVY); c.drawString(x + 10, ftop - 15, title)
        c.setFont("IN", 6.8); c.setFillColor(MUTED); c.drawString(x + 10, ftop - 26, hint)
        field(c, f"base_{i + 1}", title, x + 8, fbot + 7, bw - 16, ftop - fbot - 40)

    # before you launch
    cy = 56
    c.setFont("RC", 11); c.setFillColor(NAVY); c.drawString(M, cy, "Before you launch")
    x = M + 104; step = (W - M - x) / 4
    for i, label in enumerate(CHECKS):
        c.acroForm.checkbox(name=f"check_{i + 1}", tooltip=label, x=x, y=cy - 2.5, size=10, buttonStyle="check",
                            borderColor=NAVY, fillColor=WHITE, textColor=NAVY, forceBorder=True, borderWidth=0.8)
        c.setFont("IN", 7.6); c.setFillColor(INK); c.drawString(x + 15, cy, label)
        x += step

    # footer
    c.setStrokeColor(FIELD_BORDER); c.setLineWidth(0.5); c.line(M, 40, W - M, 40)
    c.setFont("IN", 7); c.setFillColor(MUTED); c.drawString(M, 25, "campaignplaybook.eu/digital-bootcamp")
    c.setFont("RC", 10); c.setFillColor(ORANGE); c.drawRightString(W - M, 25, "You lead the campaign. The AI supports you.")
    c.save()

if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUT), exist_ok=True); build(); print("wrote", OUT)
