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

# One word per day. The card shows the shape of the ten days, and the article
# titles stay on the page where somebody can actually read them.
DAYS = [
    ("01", "baseline"),
    ("02", "language"),
    ("03", "models"),
    ("04", "building"),
    ("05", "campaigns"),
    ("06", "tools"),
    ("07", "images"),
    ("08", "agents"),
    ("09", "projects"),
    ("10", "assistants"),
]

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


def card(W, H, out, steps_h=0.46):
    """Headline, then ten steps rising left to right, in the arrow's direction."""
    img = Image.new("RGB", (W, H), GREEN)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = (y / H) ** 1.4
        d.line([(0, y), (W, y)],
               fill=tuple(round(GREEN[i] + (GREEN_DEEP[i] - GREEN[i]) * t) for i in range(3)))

    pad = round(W * 0.063)
    scale = W / 1200

    arrow(img, W - pad - round(76 * scale), pad - round(4 * scale), round(76 * scale), PAPER)

    y = pad
    d.text((pad, y), "european campaign playbook", font=font("display", round(23 * scale)), fill=PAPER)
    y += round(44 * scale)

    f_head = font("display", round(66 * scale))
    for line in HEADLINE:
        d.text((pad, y), line, font=f_head, fill=PAPER)
        y += round(70 * scale)

    y += round(4 * scale)
    d.text((pad, y), KICKER, font=font("body", round(23 * scale)), fill=AMBER)

    # The staircase. Each step is a block whose height grows with the day, so
    # the ten days read as a climb rather than a list.
    floor = H - pad - round(46 * scale)
    band = round(H * steps_h)
    top = floor - band
    gap = round(10 * scale)
    bw = (W - 2 * pad - gap * (len(DAYS) - 1)) // len(DAYS)
    f_num = font("display", round(26 * scale))
    f_word = font("body", round(15 * scale))

    for i, (num, word) in enumerate(DAYS):
        x = pad + i * (bw + gap)
        h = round(band * (0.26 + 0.74 * (i / (len(DAYS) - 1))))
        last = i == len(DAYS) - 1
        fill = AMBER if last else (255, 255, 255, 255)
        block = Image.new("RGBA", (bw, h), (0, 0, 0, 0))
        ImageDraw.Draw(block).rectangle([0, 0, bw, h],
                                        fill=AMBER + (255,) if last else (237, 231, 218, 46 + round(i * 14)))
        img.paste(block, (x, floor - h), block)
        d.text((x + bw / 2, floor - h - round(30 * scale)), num,
               font=f_num, fill=AMBER if last else PAPER, anchor="ma")
        d.text((x + bw / 2, floor + round(12 * scale)), word,
               font=f_word, fill=PAPER_DIM[:3], anchor="ma")

    foot = font("body", round(19 * scale))
    d.text((pad, H - round(26 * scale)), "campaignplaybook.eu/digital-bootcamp",
           font=foot, fill=PAPER, anchor="ls")
    d.text((W - pad, H - round(26 * scale)), "free with an account",
           font=foot, fill=(255, 255, 255), anchor="rs")

    img.save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    print(card(1200, 630, os.path.join(OUTDIR, "bootcamp-ten-days-1200x630.png"), steps_h=0.40))
    print(card(1080, 1080, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1080.png"), steps_h=0.62))
    print(card(1080, 1350, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1350.png"), steps_h=0.66))
