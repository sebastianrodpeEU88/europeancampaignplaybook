"""The digital bootcamp card: ten days on one image, in the brand green.

For LinkedIn, Instagram and the WhatsApp channel. Three sizes from one layout:
1200x630 for LinkedIn and link previews, 1080x1080 for Instagram, and
1080x1350 for the portrait feed.

Uses the site's own fonts, decompressed from src/app/fonts/*.woff2, so the
card matches the website.

    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/bootcamp-card.py
"""
import os, tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "scratchpad", "cards")

GREEN = (43, 95, 41)          # #2B5F29, the brand green
GREEN_DEEP = (15, 64, 61)     # #0F403D, for the gradient floor
PAPER = (237, 231, 218)       # #EDE7DA
PAPER_DIM = (237, 231, 218, 150)
AMBER = (199, 136, 25)        # #C78819, for the day numbers

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]

DAYS = [
    ("01", "Your baseline and your first prompts"),
    ("02", "Your AI dictionary"),
    ("03", "How AI reasons, and which model to pick"),
    ("04", "Stop theorising and start building"),
    ("05", "Bring your campaign to life"),
    ("06", "Which AI tool is best for your team"),
    ("07", "Create better images with AI"),
    ("08", "From prompts to agents"),
    ("09", "Projects before agents"),
    ("10", "Build the agent, block by block"),
]

# Broken by hand: auto-wrapping stranded "free" on a line of its own.
HEADLINE = ["Ten days of AI training", "for EU affairs, free"]
KICKER = "and day 1 is the audit nobody does"


def _fonts():
    from fontTools.ttLib import TTFont
    tmp = tempfile.mkdtemp(prefix="ecp-card-")
    paths = {}
    for name, file in (("display", "roboto-condensed-700"), ("body", "inter")):
        dst = os.path.join(tmp, f"{file}.ttf")
        f = TTFont(os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2"))
        f.flavor = None
        f.save(dst)
        paths[name] = dst
    return paths


FONTS = _fonts()


def font(kind, size):
    return ImageFont.truetype(FONTS[kind], size)


def wrap(d, text, f, max_w):
    out, line = [], ""
    for w in text.split():
        t = f"{line} {w}".strip()
        if d.textlength(t, font=f) <= max_w:
            line = t
        else:
            out.append(line)
            line = w
    if line:
        out.append(line)
    return out


def arrow(img, x, y, size, colour):
    """Drawn supersampled, so the diagonal stays clean at any size."""
    ss = 6
    a = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    ImageDraw.Draw(a).polygon(
        [(px / 96 * size * ss, py / 96 * size * ss) for px, py in ARROW], fill=colour
    )
    img.paste(a.resize((size, size), Image.LANCZOS), (x, y), a.resize((size, size), Image.LANCZOS))


def card(W, H, out, columns=2):
    img = Image.new("RGB", (W, H), GREEN)
    d = ImageDraw.Draw(img)

    # A soft vertical gradient, deeper at the foot, so the block is not flat.
    for y in range(H):
        t = (y / H) ** 1.4
        d.line([(0, y), (W, y)],
               fill=tuple(round(GREEN[i] + (GREEN_DEEP[i] - GREEN[i]) * t) for i in range(3)))

    pad = round(W * 0.063)
    scale = W / 1200

    arrow(img, W - pad - round(74 * scale), pad - round(6 * scale), round(74 * scale), PAPER)

    y = pad
    f_mark = font("display", round(23 * scale))
    d.text((pad, y), "european campaign playbook", font=f_mark, fill=PAPER)
    y += round(42 * scale)

    f_head = font("display", round(62 * scale))
    for line in HEADLINE:
        d.text((pad, y), line, font=f_head, fill=PAPER)
        y += round(66 * scale)

    y += round(6 * scale)
    f_kick = font("body", round(22 * scale))
    d.text((pad, y), KICKER, font=f_kick, fill=AMBER)
    y += round(46 * scale)

    d.line([(pad, y), (W - pad, y)], fill=(255, 255, 255, 60), width=1)
    y += round(26 * scale)

    # The ten days, in columns.
    per = -(-len(DAYS) // columns)
    col_w = (W - 2 * pad - round(34 * scale) * (columns - 1)) // columns
    # The rows stretch to fill whatever is left above the footer, so a tall
    # canvas does not leave the list stranded at the top.
    available = (H - pad - round(52 * scale)) - y
    row_h = max(round(30 * scale), min(round(76 * scale), available // per))
    size = max(round(17 * scale), min(round(30 * scale), round(row_h * 0.52)))
    f_num = font("display", round(size * 1.08))
    f_day = font("body", size)
    for i, (num, label) in enumerate(DAYS):
        col, row = divmod(i, per) if columns > 1 else (0, i)
        x = pad + col * (col_w + round(34 * scale))
        yy = y + row * row_h
        d.text((x, yy), num, font=f_num, fill=AMBER)
        lines = wrap(d, label, f_day, col_w - round(46 * scale))
        d.text((x + round(42 * scale), yy), lines[0], font=f_day, fill=PAPER)

    foot = font("body", round(19 * scale))
    d.text((pad, H - pad - round(12 * scale)), "campaignplaybook.eu/digital-bootcamp",
           font=foot, fill=PAPER)
    d.text((W - pad, H - pad - round(12 * scale)), "free with an account",
           font=foot, fill=(255, 255, 255), anchor="ra")

    img.save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    print(card(1200, 630, os.path.join(OUTDIR, "bootcamp-ten-days-1200x630.png"), columns=2))
    print(card(1080, 1080, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1080.png"), columns=1))
    print(card(1080, 1350, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1350.png"), columns=1))
