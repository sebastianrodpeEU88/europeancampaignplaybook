"""Branded PDF worksheets for the AI bootcamp.

Uses the site's own fonts (src/app/fonts/*.woff2, decompressed to TTF at run
time via fontTools) and colour tokens, so the downloads match the website.

    python3 scripts/bootcamp-day1-pdfs.py
"""
import os, tempfile
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "public", "downloads")

def hexc(h, a=1.0):
    h = h.lstrip("#")
    return Color(*(int(h[i:i+2],16)/255 for i in (0,2,4)), alpha=a)

PAPER=hexc("EDE7DA"); NAVY=hexc("0A1D2B"); ORANGE=hexc("dd3c13"); INK=hexc("111111")
RULE=hexc("33312D",0.22); MUTED=hexc("111111",0.62); GHOST=hexc("33312D",0.13)

W,H = A4
M   = 52                      # page margin
CW  = W - 2*M                 # content width

def _fonts():
    from fontTools.ttLib import TTFont as FT
    tmp = tempfile.mkdtemp(prefix="ecp-fonts-")
    reg = {}
    for name, file in (("RC","roboto-condensed-700"), ("IN","inter")):
        src = os.path.join(ROOT, "src", "app", "fonts", f"{file}.woff2")
        dst = os.path.join(tmp, f"{file}.ttf")
        f = FT(src); f.flavor = None; f.save(dst)
        pdfmetrics.registerFont(TTFont(name, dst)); reg[name]=dst
    return reg
_fonts()

ARROW = [(10,66),(28,84),(62,50),(62,75),(86,75),(86,10),(21,10),(21,34),(46,34)]

class Doc:
    def __init__(self, path, kicker, title, intro):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.c.setTitle(title); self.c.setAuthor("european campaign playbook")
        self.kicker = kicker
        self.page = 0
        self._new_page()
        self.h1(title)
        if intro: self.body(intro, size=10.5, leading=15.5, gap=6)

    # ---------- chrome ----------
    def _arrow(self, x, y, size, col):
        s = size/96
        p = self.c.beginPath()
        p.moveTo(x+ARROW[0][0]*s, y+size-ARROW[0][1]*s)
        for px,py in ARROW[1:]: p.lineTo(x+px*s, y+size-py*s)
        p.close(); self.c.setFillColor(col); self.c.drawPath(p, fill=1, stroke=0)

    def _new_page(self):
        if self.page: self.c.showPage()
        self.page += 1
        c = self.c
        c.setFillColor(NAVY); c.rect(0, H-64, W, 64, fill=1, stroke=0)
        self._arrow(M, H-64+22, 15, PAPER)
        c.setFont("RC", 15); c.setFillColor(PAPER)
        c.drawString(M+22, H-64+23, "european campaign")
        wpx = c.stringWidth("european campaign ", "RC", 15)
        c.setFillColor(hexc("EDE7DA",0.6)); c.drawString(M+22+wpx, H-64+23, "playbook")
        c.setFont("IN", 9); c.setFillColor(hexc("EDE7DA",0.75))
        c.drawRightString(W-M, H-64+24, self.kicker)
        # footer
        c.setFont("IN", 8); c.setFillColor(MUTED)
        c.drawString(M, 30, "campaignplaybook.eu")
        c.drawRightString(W-M, 30, f"{self.page}")
        self.y = H - 64 - 40

    def _space(self, need):
        if self.y - need < 56: self._new_page()

    # ---------- text ----------
    def _wrap(self, text, font, size, width):
        out, line = [], ""
        for word in text.split():
            t = (line+" "+word).strip()
            if self.c.stringWidth(t, font, size) <= width: line = t
            else: out.append(line); line = word
        if line: out.append(line)
        return out

    def h1(self, text):
        self._space(52)
        for ln in self._wrap(text, "RC", 26, CW):
            self.c.setFont("RC", 26); self.c.setFillColor(ORANGE)
            self.c.drawString(M, self.y, ln); self.y -= 30
        self.y -= 6

    def h2(self, text):
        self._space(40)
        self.y -= 10
        self.c.setStrokeColor(RULE); self.c.setLineWidth(0.7)
        self.c.line(M, self.y+16, W-M, self.y+16)
        self.c.setFont("RC", 15); self.c.setFillColor(NAVY)
        self.c.drawString(M, self.y, text); self.y -= 22

    def body(self, text, size=10.5, leading=15.5, col=INK, indent=0, gap=10):
        for ln in self._wrap(text, "IN", size, CW-indent):
            self._space(leading)
            self.c.setFont("IN", size); self.c.setFillColor(col)
            self.c.drawString(M+indent, self.y, ln); self.y -= leading
        self.y -= gap

    def bullets(self, items, size=10, col=MUTED, indent=0):
        for it in items:
            for i, ln in enumerate(self._wrap(it, "IN", size, CW-18-indent)):
                self._space(14.5)
                self.c.setFont("IN", size); self.c.setFillColor(col)
                if i==0:
                    self.c.setFillColor(ORANGE); self.c.drawString(M+indent+3, self.y, "•")
                    self.c.setFillColor(col)
                self.c.drawString(M+indent+18, self.y, ln); self.y -= 14.5
        self.y -= 8

    def question(self, n, text, hint=None):
        self._space(56)
        self.y -= 4
        self.c.setFont("RC", 22); self.c.setFillColor(hexc("dd3c13",0.30))
        self.c.drawString(M, self.y-3, f"{n:02d}")
        for i, ln in enumerate(self._wrap(text, "RC", 14.5, CW-40)):
            self.c.setFont("RC", 14.5); self.c.setFillColor(NAVY)
            self.c.drawString(M+40, self.y, ln); self.y -= 19
        if hint:
            for ln in self._wrap(hint, "IN", 9.5, CW-40):
                self._space(13)
                self.c.setFont("IN", 9.5); self.c.setFillColor(MUTED)
                self.c.drawString(M+40, self.y, ln); self.y -= 13
        self.y -= 6

    def lines(self, n, indent=40):
        for _ in range(n):
            self._space(24)
            self.c.setStrokeColor(GHOST); self.c.setLineWidth(0.8)
            self.c.line(M+indent, self.y, W-M, self.y); self.y -= 24
        self.y -= 6

    def prompt(self, label, text):
        """copy-paste prompt in a tinted box with an orange spine"""
        lines = []
        for para in text.split("\n"):
            lines += self._wrap(para, "IN", 10, CW-40) or [""]
        h = 20 + len(lines)*14.2 + (16 if label else 0)
        self._space(h+10)
        top = self.y + 12
        self.c.setFillColor(PAPER); self.c.rect(M, top-h, CW, h, fill=1, stroke=0)
        self.c.setFillColor(ORANGE); self.c.rect(M, top-h, 3, h, fill=1, stroke=0)
        yy = top - 20
        if label:
            self.c.setFont("RC", 10); self.c.setFillColor(ORANGE)
            self.c.drawString(M+18, yy, label.upper()); yy -= 16
        for ln in lines:
            self.c.setFont("IN", 10); self.c.setFillColor(INK)
            self.c.drawString(M+18, yy, ln); yy -= 14.2
        self.y = top - h - 16

    def note(self, text):
        lines = self._wrap(text, "IN", 10.5, CW-36)
        h = 22 + len(lines)*15
        self._space(h+10)
        top = self.y + 10
        self.c.setFillColor(NAVY); self.c.rect(M, top-h, CW, h, fill=1, stroke=0)
        yy = top - 20
        for ln in lines:
            self.c.setFont("IN", 10.5); self.c.setFillColor(hexc("EDE7DA",0.95))
            self.c.drawString(M+18, yy, ln); yy -= 15
        self.y = top - h - 16

    def save(self): self.c.save()


# ============================ 1. BASELINE SURVEY ============================
def survey():
    d = Doc(os.path.join(OUT, "ai-bootcamp-day-1-baseline.pdf"),
            "AI bootcamp for EU affairs · day 1",
            "Your baseline",
            "This is the starting point. Answer these four questions honestly and keep the sheet "
            "somewhere you can find it, because on the last day of the bootcamp you answer exactly "
            "the same questions again and compare. There are no right answers. The only wrong move "
            "is being vague.")

    d.question(1, "How would you describe your current understanding of AI?",
               "Be specific. Somewhere on this range, or nowhere near it:")
    d.bullets([
        "Completely new. I still do not really understand what it does.",
        "I have tried ChatGPT a few times. Everyone seems excited and I am still working out why.",
        "I have tried a few tools and I am still working out how to apply them to my actual work.",
        "I use AI regularly for quite a few tasks. Give me the advanced material.",
        "I am already building automations, connecting tools and creating my own workflows.",
    ], indent=40)
    d.lines(4)

    d.question(2, "When was the last time AI actually helped you with your work?",
               "Actually helped. What did it help you do? If that moment has not happened yet, "
               "write down what you wish AI could help you with.")
    d.lines(4)

    d.question(3, "What type of task takes most of your time?",
               "Pick the big one, the thing that eats your week. For example: writing or editing "
               "reports, research, creating content or campaigns, planning projects, preparing "
               "meetings, monitoring EU policy, admin, bureaucracy, or something else entirely.")
    d.lines(3)

    d.question(4, "If you got some of that time back, what would you spend it on?",
               "One, two, at most three. For example: developing new ideas, thinking strategically, "
               "talking to more people, reaching decision-makers, learning something new, or "
               "actually leaving work on time.")
    d.lines(3)

    d.h2("The friction log")
    d.body("For the next few days, every time you catch yourself doing something repetitive, slow or "
           "unnecessarily manual, write it down here. Do not try to solve any of it yet. Just notice. "
           "Some of these become very interesting later in the bootcamp.")
    d.bullets([
        "Writing the same type of email for the tenth time.",
        "Moving information from one document into another.",
        "Spending an hour turning a long document into a briefing.",
        "Preparing the same kind of report every week.",
        "Searching through fifteen documents to find one piece of information.",
    ])
    d.lines(9, indent=0)
    d.note("Keep this sheet. On the final day you answer the same four questions again, and the "
           "difference between the two sheets is the actual result of the bootcamp.")
    d.save()
    return d


# ========================== 2. EXERCISE 1 WORKSHEET ==========================
def worksheet():
    d = Doc(os.path.join(OUT, "ai-bootcamp-day-1-exercise-1.pdf"),
            "AI bootcamp for EU affairs · day 1",
            "Exercise 1: role, context and what the machine fills in",
            "Pick one tool and stay with it for the whole bootcamp: ChatGPT, Claude, Gemini, Le Chat, "
            "whichever you prefer. Work through these steps in order and keep every answer, because "
            "the comparisons are the point of the exercise.")

    d.h2("Part 1 · The same question, three different ways")
    d.body("Start a new conversation and run the plainest possible version first. This is your control.")
    d.prompt("Step 1 · baseline", "explain how the EU makes laws.")
    d.body("Read it. Keep it. Now give the model a role, and change nothing else.")
    d.prompt("Step 2 · role A", "you are an excellent communications trainer.\n"
             "you're known for explaining complicated political processes in language that ordinary "
             "people can understand and remember.\n"
             "explain how the EU makes laws.\n"
             "keep it clear, conversational and under 120 words.")
    d.prompt("Step 3 · role B", "you are an EU civil servant with 30 years of experience working with "
             "EU institutions.\n"
             "you know the legislative process in great detail, you value technical precision, and you "
             "love institutional terminology and acronyms.\n"
             "explain how the EU makes laws.\n"
             "keep it under 120 words.")
    d.body("Same model. Same question. Different role. Put the two answers side by side and look at the "
           "vocabulary, the level of detail, the acronyms, what the model decided was important, and "
           "the way it speaks to you.")
    d.question(1, "Write down three differences.")
    d.lines(3)

    d.h2("Part 2 · What the model assumes when you do not tell it")
    d.body("Start a new conversation. Two words are about to do a lot of work.")
    d.prompt("Step 4", "explain how the EU makes laws to my grandmother.")
    d.body("Read it carefully, then interrogate it. Paste this into the same conversation.")
    d.prompt("Step 5 · the assumption audit",
             "analyse the answer you just gave me.\n"
             "what did you assume about my grandmother even though i never told you?\n"
             "look for assumptions about her age, education, literacy, profession, political knowledge, "
             "knowledge of the EU, digital literacy, where she lives, nationality, cultural background, "
             "socioeconomic background, interests, cognitive ability and the type of language she needs.\n"
             "for every assumption, show me what in your answer suggests you made it.\n"
             "separate reasonable inferences from unsupported assumptions.\n"
             "be specific.")
    d.body("Sit with that answer. All you gave it was the word grandmother. Yours might be a professor, "
           "or have left school at 14, or have worked in EU affairs for thirty years, or run a company, "
           "or live in Indonesia, or Kenya, or a rural town near Cordoba, or understand the legislative "
           "process better than you do. The word carries almost no information, and the system filled "
           "the gap anyway.")
    d.question(2, "Which assumption surprised you most, and why?")
    d.lines(3)

    d.h2("Part 3 · Replace the assumptions with information")
    d.prompt("Step 6", "explain how the EU makes laws to my grandmother.\n"
             "she is 76, lives in a rural town near Cordoba, Spain, has a university education, reads "
             "the newspaper every morning and follows Spanish politics closely.\n"
             "she has very little knowledge of how EU institutions work.\n"
             "keep it warm and respectful.\n"
             "use familiar comparisons only when they genuinely make the process clearer.\n"
             "simplify based on her knowledge of the EU.\n"
             "keep it under 120 words.")
    d.question(3, "Compare the two grandmother answers.",
               "What changed? What disappeared? What became more specific? What did the model stop "
               "assuming once you gave it real information?")
    d.lines(4)

    d.note("The takeaway: the role you give a model shapes the answer, and the context you give it "
           "about a real human being shapes it further. Where you leave a gap, the system fills it "
           "with an assumption, and it will not tell you it did.")
    d.save()
    return d

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (survey, worksheet):
        d = fn(); print("wrote", d.c._filename, f"({d.page} pages)")
