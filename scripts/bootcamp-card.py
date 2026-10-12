"""The digital bootcamp card: the ten-day programme as ten boxes.

Each day is a box with its number, a drawn icon and a short title. Three
sizes from one layout: 1200x630 for LinkedIn and link previews, 1080x1080
for the Instagram feed, 1080x1350 for portrait.

Icons are drawn from primitives rather than loaded, so there is no icon font
to license and every glyph sits on the same stroke weight.

    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/bootcamp-card.py
"""
import os, tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "scratchpad", "cards")

GREEN = (43, 95, 41)          # #2B5F29, the brand green
GREEN_DEEP = (15, 64, 61)     # #0F403D
PAPER = (237, 231, 218)       # #EDE7DA
AMBER = (199, 136, 25)        # #C78819
BOX = (255, 255, 255, 22)

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]

HEADLINE_WIDE = ["Ten days of AI training for EU affairs, free"]
HEADLINE_TALL = ["Ten days of AI training", "for EU affairs, free"]
KICKER = "and day 1 is the audit nobody does"

DAYS = [
    ("01", "Your baseline", "baseline"),
    ("02", "The AI dictionary", "speech"),
    ("03", "Which model to pick", "nodes"),
    ("04", "Start building", "blocks"),
    ("05", "Campaign craft", "flag"),
    ("06", "Choosing your tools", "compare"),
    ("07", "Better images", "image"),
    ("08", "Prompts to agents", "agent"),
    ("09", "Projects first", "folder"),
    ("10", "Build the agent", "arrow"),
]


def _fonts():
    from fontTools.ttLib import TTFont
    tmp = tempfile.mkdtemp(prefix="ecp-card-")
    out = {}
    for name, file in (("display", "roboto-condensed-700"), ("body", "inter")):
        dst = os.path.join(tmp, f"{file}.ttf")
        f = TTFont(os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2"))
        f.flavor = None
        f.save(dst)
        out[name] = dst
    return out


FONTS = _fonts()


def font(kind, size):
    return ImageFont.truetype(FONTS[kind], size)


def icon(name, size, colour=PAPER):
    """One glyph, drawn at 4x and reduced, so every curve stays clean."""
    ss = 4
    S = size * ss
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w = max(2, round(S * 0.07))         # one stroke weight across the whole set
    c = colour + (255,)
    m = S * 0.16

    if name == "baseline":              # the audit: a sheet with things ticked off
        d.rounded_rectangle([S * 0.2, m, S * 0.8, S - m], radius=S * 0.08, outline=c, width=w)
        for i in range(3):
            yy = S * 0.33 + i * S * 0.19
            d.line([(S * 0.3, yy), (S * 0.36, yy + S * 0.05)], fill=c, width=w)
            d.line([(S * 0.36, yy + S * 0.05), (S * 0.45, yy - S * 0.06)], fill=c, width=w)
            d.line([(S * 0.53, yy), (S * 0.7, yy)], fill=c, width=w)
    elif name == "speech":              # the words, defined
        d.rounded_rectangle([m, m, S - m, S * 0.66], radius=S * 0.12, outline=c, width=w)
        d.polygon([(S * 0.32, S * 0.64), (S * 0.32, S * 0.88), (S * 0.54, S * 0.64)], fill=c)
        d.line([(S * 0.3, S * 0.32), (S * 0.7, S * 0.32)], fill=c, width=w)
        d.line([(S * 0.3, S * 0.47), (S * 0.58, S * 0.47)], fill=c, width=w)
    elif name == "nodes":               # choosing between models
        r = S * 0.11
        pts = [(S * 0.26, S * 0.28), (S * 0.74, S * 0.28), (S * 0.5, S * 0.74)]
        d.line([pts[0], pts[2]], fill=c, width=w)
        d.line([pts[1], pts[2]], fill=c, width=w)
        for i, (x, y) in enumerate(pts):
            if i == 2:
                d.ellipse([x - r, y - r, x + r, y + r], fill=c)
            else:
                d.ellipse([x - r, y - r, x + r, y + r], outline=c, width=w)
    elif name == "blocks":              # building something
        d.rectangle([m, S * 0.56, S * 0.52, S - m], outline=c, width=w)
        d.rectangle([S * 0.52, S * 0.56, S - m, S - m], outline=c, width=w)
        d.rectangle([S * 0.26, S * 0.16, S * 0.78, S * 0.56], outline=c, width=w)
    elif name == "flag":                # a campaign
        d.line([(S * 0.3, m), (S * 0.3, S - m)], fill=c, width=w)
        d.polygon([(S * 0.33, m), (S * 0.84, S * 0.27), (S * 0.33, S * 0.54)], fill=c)
    elif name == "compare":             # weighing the options
        d.rectangle([m, S * 0.48, S * 0.42, S - m], outline=c, width=w)
        d.rectangle([S * 0.58, S * 0.26, S - m, S - m], fill=c)
    elif name == "image":               # pictures
        d.rounded_rectangle([m, S * 0.22, S - m, S * 0.78], radius=S * 0.08, outline=c, width=w)
        d.ellipse([S * 0.28, S * 0.33, S * 0.41, S * 0.46], fill=c)
        d.polygon([(S * 0.28, S * 0.7), (S * 0.52, S * 0.44), (S * 0.76, S * 0.7)], fill=c)
    elif name == "agent":               # something that acts on its own
        d.rounded_rectangle([m, m, S * 0.6, S * 0.6], radius=S * 0.1, outline=c, width=w)
        d.line([(S * 0.5, S * 0.7), (S * 0.8, S * 0.84)], fill=c, width=w)
        d.polygon([(S * 0.86, S * 0.87), (S * 0.62, S * 0.84), (S * 0.76, S * 0.63)], fill=c)
    elif name == "folder":              # a project holds the context
        d.polygon([(m, S * 0.3), (S * 0.42, S * 0.3), (S * 0.5, S * 0.4), (S - m, S * 0.4),
                   (S - m, S * 0.76), (m, S * 0.76)], outline=c, width=w)
        d.line([(m, S * 0.52), (S - m, S * 0.52)], fill=c, width=w)
    elif name == "arrow":               # the mark itself, for the last day
        d.polygon([(px / 96 * (S - 2 * m) + m, py / 96 * (S - 2 * m) + m) for px, py in ARROW], fill=c)

    return im.resize((size, size), Image.LANCZOS)


def wrap(d, text, f, max_w):
    out, line = [], ""
    for word in text.split():
        t = f"{line} {word}".strip()
        if d.textlength(t, font=f) <= max_w:
            line = t
        else:
            out.append(line)
            line = word
    if line:
        out.append(line)
    return out


def card(W, H, out, cols):
    img = Image.new("RGB", (W, H), GREEN)
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = (y / H) ** 1.4
        d.line([(0, y), (W, y)],
               fill=tuple(round(GREEN[i] + (GREEN_DEEP[i] - GREEN[i]) * t) for i in range(3)))

    pad = round(W * 0.055)
    scale = W / 1200
    wide = cols >= 5
    head_lines = HEADLINE_WIDE if wide else HEADLINE_TALL

    g = icon("arrow", round(64 * scale), PAPER)
    img.paste(g, (W - pad - round(64 * scale), pad - round(2 * scale)), g)

    y = pad
    d.text((pad, y), "european campaign playbook",
           font=font("display", round(22 * scale)), fill=PAPER)
    y += round(40 * scale)

    f_head = font("display", round(52 * scale) if wide else round(60 * scale))
    for line in head_lines:
        d.text((pad, y), line, font=f_head, fill=PAPER)
        y += round(56 * scale) if wide else round(64 * scale)

    y += round(2 * scale)
    d.text((pad, y), KICKER, font=font("body", round(21 * scale)), fill=AMBER)
    y += round(42 * scale)

    # The programme: one box per day, number, icon, title.
    rows = -(-len(DAYS) // cols)
    gap = round(14 * scale)
    bw = (W - 2 * pad - gap * (cols - 1)) // cols
    bh = (H - pad - round(40 * scale) - y - gap * (rows - 1)) // rows
    f_num = font("display", round(19 * scale))
    f_title = font("body", round(17 * scale))
    gsize = round(min(bw, bh) * (0.34 if wide else 0.42))

    for i, (num, title, glyph) in enumerate(DAYS):
        r, cx = divmod(i, cols)
        x = pad + cx * (bw + gap)
        yy = y + r * (bh + gap)
        last = i == len(DAYS) - 1

        tile = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        ImageDraw.Draw(tile).rounded_rectangle(
            [0, 0, bw - 1, bh - 1], radius=round(10 * scale),
            fill=(199, 136, 25, 38) if last else BOX,
            outline=(199, 136, 25, 255) if last else (237, 231, 218, 46),
            width=max(1, round(1.4 * scale)))
        img.paste(tile, (x, yy), tile)

        d.text((x + round(13 * scale), yy + round(9 * scale)), num,
               font=f_num, fill=AMBER if last else PAPER)

        gi = icon(glyph, gsize, AMBER if last else PAPER)
        img.paste(gi, (x + (bw - gsize) // 2, yy + round(bh * (0.26 if wide else 0.2))), gi)

        lines = wrap(d, title, f_title, bw - round(18 * scale))[:2]
        ty = yy + bh - round(12 * scale) - len(lines) * round(20 * scale)
        for line in lines:
            d.text((x + bw / 2, ty), line, font=f_title, fill=PAPER, anchor="ma")
            ty += round(20 * scale)

    foot = font("body", round(18 * scale))
    d.text((pad, H - round(22 * scale)), "campaignplaybook.eu/digital-bootcamp",
           font=foot, fill=PAPER, anchor="ls")
    d.text((W - pad, H - round(22 * scale)), "free with an account",
           font=foot, fill=(255, 255, 255), anchor="rs")

    img.save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    print(card(1200, 630, os.path.join(OUTDIR, "bootcamp-ten-days-1200x630.png"), cols=5))
    print(card(1080, 1080, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1080.png"), cols=2))
    print(card(1080, 1350, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1350.png"), cols=2))
