"""The digital bootcamp card, as a programme prospectus.

Serif headline, a numbered curriculum on hairline rules, and the brand's
pixel field rising behind it. Three sizes from one layout: 1200x630 for
LinkedIn and link previews, 1080x1080 for the Instagram feed, 1080x1350
for portrait.

    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/bootcamp-card.py
"""
import os, tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "scratchpad", "cards")

GREEN = (28, 74, 46)          # the field, a shade deeper than the brand green
GREEN_DEEP = (10, 42, 38)
PAPER = (237, 231, 218)       # #EDE7DA
AMBER = (214, 150, 33)        # #C78819, lifted for contrast on dark green
RULE = (237, 231, 218, 46)

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]

# The brand pixel field (BRAND-SYSTEM.md): squares climbing north-east. Used
# here at low opacity, so the card has depth without another graphic.
FIELD = [(8, 136, 12), (42, 149, 11), (77, 132, 11), (27, 107, 11), (61, 117, 10), (96, 100, 10),
         (45, 80, 10), (78, 90, 10), (109, 71, 10), (64, 54, 9), (93, 62, 9), (123, 44, 9),
         (84, 30, 9), (112, 36, 8), (136, 20, 8), (103, 8, 8), (127, 12, 7)]

KICKER = "THE DIGITAL BOOTCAMP"
HEADLINE_WIDE = ["Ten days of AI training for EU affairs"]
HEADLINE_TALL = ["Ten days of AI", "training for EU affairs"]
STANDFIRST = "Free, and day 1 is the audit nobody does."
FACTS = ["10 days", "self-paced", "practitioner level", "free with an account"]

DAYS = [
    ("01", "Your baseline and your first prompts"),
    ("02", "The AI dictionary"),
    ("03", "How AI reasons, and which model to pick"),
    ("04", "Stop theorising and start building"),
    ("05", "Bring your campaign to life"),
    ("06", "Which AI tool is best for your team"),
    ("07", "Create better images with AI"),
    ("08", "From prompts to agents"),
    ("09", "Projects before agents"),
    ("10", "Build the agent, block by block"),
]


def _fonts():
    from fontTools.ttLib import TTFont
    tmp = tempfile.mkdtemp(prefix="ecp-card-")
    out = {}
    for name, file in (("display", "roboto-condensed-700"),
                       ("body", "inter"),
                       ("serif", "source-serif-4-400")):
        dst = os.path.join(tmp, f"{file}.ttf")
        f = TTFont(os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2"))
        f.flavor = None
        f.save(dst)
        out[name] = dst
    return out


FONTS = _fonts()


def font(kind, size):
    return ImageFont.truetype(FONTS[kind], size)


def tracked(d, xy, text, f, fill, track):
    """Letter-spaced capitals. PIL has no tracking, so the glyphs are placed
    one at a time; this is what makes a label read as a label."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + track
    return x


def arrow_glyph(size, colour, alpha=255):
    ss = 4
    im = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    ImageDraw.Draw(im).polygon(
        [(px / 96 * size * ss, py / 96 * size * ss) for px, py in ARROW], fill=colour + (alpha,))
    return im.resize((size, size), Image.LANCZOS)


def pixel_field(img, x, y, scale, alpha):
    """The brand's momentum motif, rising north-east behind the type."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for px, py, s in FIELD:
        d.rectangle([x + px * scale, y + py * scale,
                     x + (px + s) * scale, y + (py + s) * scale],
                    fill=(237, 231, 218, alpha))
    img.alpha_composite(layer)


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
    img = Image.new("RGBA", (W, H), GREEN + (255,))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = (y / H) ** 1.2
        d.line([(0, y), (W, y)],
               fill=tuple(round(GREEN[i] + (GREEN_DEEP[i] - GREEN[i]) * t) for i in range(3)) + (255,))

    s = W / 1200
    pad = round(72 * s)
    wide = cols == 2

    pixel_field(img, W - round(300 * s), H - round(330 * s), s * 1.5, 26)
    d = ImageDraw.Draw(img)

    # Masthead: label, hairline, arrow.
    y = pad
    tracked(d, (pad, y), KICKER, font("display", round(19 * s)), AMBER, round(3.4 * s))
    g = arrow_glyph(round(46 * s), PAPER)
    img.alpha_composite(g, (W - pad - round(46 * s), y - round(8 * s)))
    y += round(34 * s)
    d.line([(pad, y), (W - pad, y)], fill=RULE, width=max(1, round(s)))
    y += round(40 * s)

    # The headline, in the brand serif. This is the whole difference in feel.
    head = HEADLINE_WIDE if wide else HEADLINE_TALL
    # Fit the serif to the measure rather than trusting a fixed size: the
    # headline ran past the right margin at 1200 wide.
    measure = W - 2 * pad
    size = round(64 * s) if wide else round(58 * s)
    while size > round(26 * s):
        f_head = font("serif", size)
        if max(d.textlength(line, font=f_head) for line in head) <= measure:
            break
        size -= 1
    f_head = font("serif", size)
    for line in head:
        d.text((pad, y), line, font=f_head, fill=PAPER)
        y += round(size * 1.16)

    y += round(6 * s)
    d.text((pad, y), STANDFIRST, font=font("serif", round(26 * s)), fill=AMBER)
    y += round(46 * s)

    # Facts, in small capitals, separated by rules.
    f_fact = font("display", round(16 * s))
    fx = pad
    for i, fact in enumerate(FACTS):
        if i:
            d.line([(fx - round(13 * s), y + round(2 * s)), (fx - round(13 * s), y + round(15 * s))],
                   fill=RULE, width=max(1, round(s)))
        fx = tracked(d, (fx, y), fact.upper(), f_fact, (237, 231, 218, 190), round(2.2 * s))
        fx += round(26 * s)
    y += round(40 * s)
    d.line([(pad, y), (W - pad, y)], fill=RULE, width=max(1, round(s)))
    y += round(24 * s)

    # The curriculum: number, title, hairline under each.
    rows = -(-len(DAYS) // cols)
    gutter = round(54 * s)
    colw = (W - 2 * pad - gutter * (cols - 1)) // cols
    avail = H - round(78 * s) - y
    # Cap the row height, then centre the block: a tall canvas was stretching
    # the rows until each rule floated away from the item it belongs to.
    rowh = min(avail // rows, round(74 * s))
    y += (avail - rowh * rows) // 2
    f_num = font("display", round(23 * s))
    f_day = font("body", round(19 * s))

    for i, (num, title) in enumerate(DAYS):
        c, r = (i // rows, i % rows) if cols == 2 else (0, i)
        x = pad + c * (colw + gutter)
        yy = y + r * rowh
        last = i == len(DAYS) - 1
        d.text((x, yy + round(3 * s)), num, font=f_num, fill=AMBER)
        line = wrap(d, title, f_day, colw - round(52 * s))[0]
        d.text((x + round(46 * s), yy + round(5 * s)), line, font=f_day,
               fill=PAPER if not last else AMBER)
        rule_y = yy + round(36 * s)          # hugs its own item, not the next one
        d.line([(x, rule_y), (x + colw, rule_y)],
               fill=(214, 150, 33, 120) if last else RULE, width=max(1, round(s)))

    foot = font("body", round(18 * s))
    d.text((pad, H - round(30 * s)), "campaignplaybook.eu/digital-bootcamp",
           font=foot, fill=(237, 231, 218, 200), anchor="ls")
    tracked(d, (W - pad - round(176 * s), H - round(42 * s)), "START ANY TIME",
            font("display", round(16 * s)), AMBER, round(2.6 * s))

    img.convert("RGB").save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    print(card(1200, 630, os.path.join(OUTDIR, "bootcamp-ten-days-1200x630.png"), cols=2))
    print(card(1080, 1080, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1080.png"), cols=1))
    print(card(1080, 1350, os.path.join(OUTDIR, "bootcamp-ten-days-1080x1350.png"), cols=1))
