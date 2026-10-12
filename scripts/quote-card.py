"""Quote cards: one line of somebody else's words, in the brand serif.

Built for Andrea's workshop posts and reusable for Testimonial Friday. The
quote sizes itself to the canvas, so a short line fills the card and a long
one still fits.

    python3 scripts/quote-card.py
"""
import os, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "scratchpad", "cards")

GREEN = (28, 74, 46)
GREEN_DEEP = (10, 42, 38)
PAPER = (237, 231, 218)
AMBER = (214, 150, 33)
RULE = (237, 231, 218, 46)

ARROW = [(10, 66), (28, 84), (62, 50), (62, 75), (86, 75), (86, 10), (21, 10), (21, 34), (46, 34)]
FIELD = [(8, 136, 12), (42, 149, 11), (77, 132, 11), (27, 107, 11), (61, 117, 10), (96, 100, 10),
         (45, 80, 10), (78, 90, 10), (109, 71, 10), (64, 54, 9), (93, 62, 9), (123, 44, 9),
         (84, 30, 9), (112, 36, 8), (136, 20, 8), (103, 8, 8), (127, 12, 7)]


def _fonts():
    from fontTools.ttLib import TTFont
    tmp = tempfile.mkdtemp(prefix="ecp-quote-")
    out = {}
    for name, file in (("display", "roboto-condensed-700"), ("body", "inter"),
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
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + track
    return x


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


def card(W, H, out, quote, name, role, footer, kicker="FROM THE WORKSHOP"):
    img = Image.new("RGBA", (W, H), GREEN + (255,))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = (y / H) ** 1.2
        d.line([(0, y), (W, y)],
               fill=tuple(round(GREEN[i] + (GREEN_DEEP[i] - GREEN[i]) * t) for i in range(3)) + (255,))

    s = W / 1200
    pad = round(78 * s)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    fx, fy, fs = W - round(300 * s), H - round(300 * s), s * 1.4
    for px, py, sq in FIELD:
        ld.rectangle([fx + px * fs, fy + py * fs, fx + (px + sq) * fs, fy + (py + sq) * fs],
                     fill=(237, 231, 218, 24))
    img.alpha_composite(layer)
    d = ImageDraw.Draw(img)

    ss = 4
    a = Image.new("RGBA", (round(46 * s) * ss, round(46 * s) * ss), (0, 0, 0, 0))
    ImageDraw.Draw(a).polygon([(px / 96 * round(46 * s) * ss, py / 96 * round(46 * s) * ss)
                               for px, py in ARROW], fill=PAPER + (255,))
    img.alpha_composite(a.resize((round(46 * s), round(46 * s)), Image.LANCZOS),
                        (W - pad - round(46 * s), pad - round(6 * s)))

    y = pad
    tracked(d, (pad, y), kicker, font("display", round(18 * s)), AMBER, round(3.2 * s))
    y += round(32 * s)
    d.line([(pad, y), (W - pad, y)], fill=RULE, width=max(1, round(s)))

    # The quote fills the space it has: size down until it fits the block.
    measure = W - 2 * pad
    block_top = y + round(54 * s)
    block_bottom = H - pad - round(132 * s)
    size = round(76 * s)
    while size > round(24 * s):
        f = font("serif", size)
        lines = wrap(d, f'“{quote}”', f, measure)
        if len(lines) * size * 1.26 <= (block_bottom - block_top):
            break
        size -= 2
    f = font("serif", size)
    lines = wrap(d, f'“{quote}”', f, measure)
    qy = block_top + ((block_bottom - block_top) - len(lines) * size * 1.26) / 2
    for line in lines:
        d.text((pad, qy), line, font=f, fill=PAPER)
        qy += size * 1.26

    # Attribution, under an amber rule.
    ay = H - pad - round(108 * s)
    d.line([(pad, ay), (pad + round(64 * s), ay)], fill=AMBER + (255,), width=max(2, round(2.5 * s)))
    ay += round(22 * s)
    d.text((pad, ay), name, font=font("display", round(30 * s)), fill=PAPER)
    ay += round(36 * s)
    d.text((pad, ay), role, font=font("body", round(18 * s)), fill=(237, 231, 218, 190))

    d.text((pad, H - round(30 * s)), footer, font=font("body", round(18 * s)),
           fill=(237, 231, 218, 200), anchor="ls")
    img.convert("RGB").save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    QUOTE = "If people just sit and listen at your event, it could have been done online."
    NAME = "Andrea Bittnerová"
    ROLE = "Event strategist. Eight years of policy events at CEPS, including Ideas Lab."
    FOOT = "Organising EU policy events, level 1  ·  20 October  ·  campaignplaybook.eu"
    print(card(1200, 630, os.path.join(OUTDIR, "andrea-quote-1200x630.png"), QUOTE, NAME, ROLE, FOOT))
    print(card(1200, 1200, os.path.join(OUTDIR, "andrea-quote-1200x1200.png"), QUOTE, NAME, ROLE, FOOT))
