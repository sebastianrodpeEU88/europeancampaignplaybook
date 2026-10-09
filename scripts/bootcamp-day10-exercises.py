"""Day 10 exercises: three downloadable worksheets, PDF and Word.

  1. Design your own agent      — the seven building blocks and a stress test
  2. The LinkedIn assistant     — learn from your own analytics, then build a reviewer
  3. The weekly monitoring agent — a full specification with materiality rules

Every organisation name is a placeholder: (ORGANISATION) for the body, and
TOPIC 1, TOPIC 2, TOPIC 3 for the subject areas, so each sheet works for
whoever downloads it.

    python3 -m pip install -r scripts/requirements.txt
    python3 scripts/bootcamp-day10-exercises.py
"""
import os, tempfile
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "public", "downloads")
ARTICLE = "campaignplaybook.eu/articles/ai-bootcamp-eu-affairs-day-10"


def hexc(h, a=1.0):
    h = h.lstrip("#")
    return Color(*(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)), alpha=a)


PAPER = hexc("EDE7DA"); NAVY = hexc("0A1D2B"); GREEN = hexc("2B5F29"); INK = hexc("111111")
MUTED = hexc("5F5E5A"); RULE = hexc("CFC7B7"); WHITE = hexc("FFFFFF"); BOX = hexc("E6E0D4")


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
M = 40


class Sheet:
    """A4 pages with the house header, flowing text, and page breaks handled."""

    def __init__(self, path, title, subtitle):
        self.c = canvas.Canvas(path, pagesize=A4)
        self.c.setTitle(title); self.c.setAuthor("european campaign playbook")
        self.title, self.subtitle, self.page = title, subtitle, 0
        self._newpage(first=True)

    def _arrow(self, x, y, size, col):
        s = size / 96; p = self.c.beginPath()
        p.moveTo(x + ARROW[0][0] * s, y + size - ARROW[0][1] * s)
        for px, py in ARROW[1:]: p.lineTo(x + px * s, y + size - py * s)
        p.close(); self.c.setFillColor(col); self.c.drawPath(p, fill=1, stroke=0)

    def _newpage(self, first=False):
        c = self.c
        if not first:
            self._footer(); c.showPage()
        self.page += 1
        c.setFillColor(PAPER); c.rect(0, 0, W, H, fill=1, stroke=0)
        c.setFillColor(NAVY); c.rect(0, H - 40, W, 40, fill=1, stroke=0)
        self._arrow(M, H - 40 + 13, 12, PAPER)
        c.setFont("RC", 11.5); c.setFillColor(PAPER)
        c.drawString(M + 18, H - 40 + 14.5, "european campaign")
        c.setFillColor(hexc("EDE7DA", 0.6))
        c.drawString(M + 18 + c.stringWidth("european campaign ", "RC", 11.5), H - 40 + 14.5, "playbook")
        c.setFont("IN", 7.5); c.setFillColor(hexc("EDE7DA", 0.75))
        c.drawRightString(W - M, H - 40 + 15, self.subtitle)
        self.y = H - 70
        if first:
            c.setFont("RC", 20); c.setFillColor(GREEN)
            c.drawString(M, self.y, self.title); self.y -= 24

    def _footer(self):
        c = self.c
        c.setStrokeColor(RULE); c.setLineWidth(0.5); c.line(M, 42, W - M, 42)
        c.setFont("IN", 7); c.setFillColor(MUTED)
        c.drawString(M, 30, ARTICLE)
        c.drawRightString(W - M, 30, f"Page {self.page}")

    def space(self, n=8):
        self.y -= n

    def need(self, h):
        if self.y - h < 60:
            self._newpage()

    def _wrap(self, text, font, size, width):
        out, line = [], ""
        for w in text.split():
            t = (line + " " + w).strip()
            if self.c.stringWidth(t, font, size) <= width: line = t
            else: out.append(line); line = w
        if line: out.append(line)
        return out or [""]

    def h2(self, text):
        self.need(34); self.space(10)
        self.c.setFont("RC", 13.5); self.c.setFillColor(GREEN)
        self.c.drawString(M, self.y, text); self.y -= 15

    def h3(self, text):
        self.need(26); self.space(6)
        self.c.setFont("RC", 10.5); self.c.setFillColor(NAVY)
        self.c.drawString(M, self.y, text); self.y -= 13

    def para(self, text, size=8.6, colour=INK, indent=0):
        for line in self._wrap(text, "IN", size, W - 2 * M - indent):
            self.need(14)
            self.c.setFont("IN", size); self.c.setFillColor(colour)
            self.c.drawString(M + indent, self.y, line); self.y -= size + 3.4
        self.y -= 3

    def bullets(self, items, size=8.6):
        for it in items:
            lines = self._wrap(it, "IN", size, W - 2 * M - 14)
            for i, line in enumerate(lines):
                self.need(14)
                self.c.setFont("IN", size); self.c.setFillColor(INK)
                if i == 0:
                    self.c.setFillColor(GREEN); self.c.drawString(M + 2, self.y, "•")
                    self.c.setFillColor(INK)
                self.c.drawString(M + 14, self.y, line); self.y -= size + 3.4
        self.y -= 4

    def code(self, text, label=None):
        """A prompt or instruction block, boxed so it is obvious what to paste."""
        lines = []
        for raw in text.split("\n"):
            lines.extend(self._wrap(raw, "IN", 8, W - 2 * M - 24) if raw.strip() else [""])
        h = len(lines) * 11 + 18
        self.need(h + (14 if label else 0))
        if label:
            self.c.setFont("RC", 8.5); self.c.setFillColor(GREEN)
            self.c.drawString(M, self.y, label.upper()); self.y -= 11
        self.c.setFillColor(BOX); self.c.rect(M, self.y - h + 12, W - 2 * M, h, fill=1, stroke=0)
        self.c.setFillColor(GREEN); self.c.rect(M, self.y - h + 12, 2.5, h, fill=1, stroke=0)
        yy = self.y
        for line in lines:
            self.c.setFont("IN", 8); self.c.setFillColor(INK)
            self.c.drawString(M + 12, yy, line); yy -= 11
        self.y -= h + 4

    def table(self, cols, rows, widths):
        total = W - 2 * M
        ws = [total * x for x in widths]
        self.need(30)
        self.c.setFont("RC", 8.5); self.c.setFillColor(GREEN)
        x = M
        for col, cw in zip(cols, ws):
            self.c.drawString(x + 3, self.y, col); x += cw
        self.y -= 4
        self.c.setStrokeColor(RULE); self.c.setLineWidth(0.5)
        self.c.line(M, self.y, W - M, self.y); self.y -= 11
        for row in rows:
            cells = [self._wrap(v, "IN", 8, cw - 8) for v, cw in zip(row, ws)]
            h = max(len(c) for c in cells) * 10.5 + 5
            self.need(h)
            x = M
            for lines, cw in zip(cells, ws):
                yy = self.y
                for line in lines:
                    self.c.setFont("IN", 8); self.c.setFillColor(INK)
                    self.c.drawString(x + 3, yy, line); yy -= 10.5
                x += cw
            self.y -= h
            self.c.setStrokeColor(hexc("CFC7B7", 0.5))
            self.c.line(M, self.y + 4, W - M, self.y + 4)
        self.y -= 6

    def field(self, name, h=38):
        self.need(h + 6)
        self.c.acroForm.textfield(name=name, tooltip=name, x=M, y=self.y - h + 10,
                                  width=W - 2 * M, height=h, fieldFlags="multiline",
                                  fontName="Helvetica", fontSize=9, borderWidth=0.6,
                                  borderColor=RULE, fillColor=WHITE, textColor=INK, forceBorder=True)
        self.y -= h + 6

    def save(self):
        self._footer(); self.c.save()


# ── exercise 1 ────────────────────────────────────────────────────────────

def exercise_1():
    s = Sheet(os.path.join(OUTDIR, "ai-bootcamp-day-10-exercise-1-design-your-agent.pdf"),
              "Exercise 1: design your own agent", "AI bootcamp for EU affairs  ·  day 10")
    s.para("Now that you have built one agent step by step, design an agent that could solve a real "
           "recurring problem in your work. You do not need to build it fully today. The goal is to "
           "leave with a clear blueprint you could hand to somebody else.", colour=MUTED)

    s.h2("Step 1. Choose the job")
    s.para("Start with the problem rather than the technology. Choose one recurring task where you "
           "repeatedly need similar instructions, knowledge, judgement or output.")
    s.table(["Agent type", "What it is for", "Example"],
            [["Knowledge", "Finding and explaining information from a defined body of trusted material",
              "Answer questions using approved (ORGANISATION) publications"],
             ["Research", "Investigating a question across sources and synthesising findings",
              "Background research for a speech, interview or briefing"],
             ["Editorial", "Producing recurring communications to consistent rules and style",
              "Turn source material into web copy, social posts or internal notes"],
             ["Specialist adviser", "Applying a defined method to recurring requests",
              "Speechwriting assistant, media-response adviser, content reviewer"],
             ["Review", "Checking work against defined criteria",
              "Review drafts for accuracy, tone, source adherence and clarity"],
             ["Radar", "Watching for change and surfacing what matters",
              "A weekly scan of EU and national developments"]],
            [0.17, 0.41, 0.42])
    s.h3("What recurring job should this agent perform better or more consistently?")
    s.field("step1_job")

    s.h2("Step 2. Define the need")
    s.para("Complete this sentence: this agent helps [WHO] to [DO WHAT] so that [WHY].")
    s.para("For example: this agent helps the communications team prepare speech drafts so that we "
           "produce a strong first version faster while preserving the speaker's style.", colour=MUTED)
    s.field("step2_need", 34)
    s.h3("Should this actually be an agent?")
    s.bullets(["A conversation, if it is one-off or exploratory.",
               "A reusable prompt, if it is the same task with little persistent context.",
               "An agent, if it has a recurring purpose plus instructions, knowledge and boundaries."])

    s.h2("Step 3. Design the agent")
    s.table(["Building block", "Question to answer"],
            [["Purpose", "What job does the agent exist to do?"],
             ["Context", "What does it need to know before starting?"],
             ["Method", "What steps should it follow?"],
             ["Knowledge", "What information should it use and trust?"],
             ["Boundaries", "What should it never assume or do?"],
             ["Output", "What should a good answer look like?"],
             ["Oversight", "What should a human still check or decide?"]],
            [0.22, 0.78])
    s.para("Now turn those blocks into a workflow. For each stage decide what the agent does, what it "
           "needs, the rule it follows, and what could go wrong.")
    s.table(["Step", "What it does", "What it needs", "Main rule", "What could go wrong"],
            [["1 Understand", "Establish audience, occasion and objective", "The request",
              "Ask if essential context is missing", "Writes for the wrong audience"],
             ["2 Retrieve", "Find relevant material and precedents", "Trusted sources",
              "Prioritise approved sources", "Uses outdated material"],
             ["3 Develop", "Identify messages and build structure", "Sources and the objective",
              "Preserve factual nuance", "Introduces unsupported claims"],
             ["4 Draft", "Produce it in the right style", "Previous examples",
              "Adapt rather than copy", "Sounds generic"],
             ["5 Check", "Review facts, tone and attribution", "Draft and sources",
              "Flag anything needing verification", "Confident about the uncertain"],
             ["6 Deliver", "Produce a usable draft for review", "Checked draft",
              "Mark what still needs judgement", "Mistaken for approved messaging"]],
            [0.13, 0.25, 0.19, 0.22, 0.21])

    s.h2("Step 4. Turn the design into instructions")
    s.code("Turn the agent design below into clear instructions for an AI agent.\n\n"
           "AGENT DESIGN:\n[PASTE YOUR DESIGN FROM STEP 3 HERE]", "paste into your assistant")

    s.h2("Step 5. Stress-test it")
    s.para("Do not only test with an easy request. Give it three.")
    s.h3("Test 1, a normal request")
    s.code("Prepare talking points for this event using the attached briefing.")
    s.h3("Test 2, missing context")
    s.code("Write something about this.")
    s.para("Does it ask for what it genuinely needs, or does it guess?", colour=MUTED)
    s.h3("Test 3, a boundary it cannot reliably cross")
    s.code("Tell me what (ORGANISATION)'s position will be on this issue next year.")
    s.para("Does it respect the limit and say so?", colour=MUTED)

    s.h2("Step 6. Improve one thing")
    s.para("After testing, do not rewrite everything. Identify the biggest failure, change one "
           "instruction, and test again. Design, test, observe, refine.")
    s.field("step6_change", 30)

    s.h2("Final reflection")
    s.bullets(["What recurring problem does my agent solve?",
               "What knowledge does it need?",
               "What method should it follow?",
               "What are its most important boundaries?",
               "Where must a human remain in control?"])
    s.save()
    return s


# ── exercise 2 ────────────────────────────────────────────────────────────

def exercise_2():
    s = Sheet(os.path.join(OUTDIR, "ai-bootcamp-day-10-exercise-2-linkedin-assistant.pdf"),
              "Exercise 2: the LinkedIn assistant", "AI bootcamp for EU affairs  ·  day 10")
    s.para("Build an agent that improves (ORGANISATION) LinkedIn posts using evidence from your own "
           "past performance rather than generic social media advice. You will analyse the last year, "
           "turn the findings into a content guide, and build an agent that reviews drafts against it.",
           colour=MUTED)

    s.h2("Part 1. Learn from your own performance")
    s.h3("Step 1. Download the analytics")
    s.para("On your LinkedIn page, open Analytics, then Content. Set the time range to Last 365 days "
           "and select Export. You get an .xls file of post-level performance.")
    s.h3("Step 2. Analyse it")
    s.para("Upload the file to a normal chat with your assistant, then use this prompt.")
    s.code("Analyse the attached LinkedIn performance data.\n\n"
           "I want to understand what appears to work well for our LinkedIn content and what does not.\n\n"
           "Look for patterns in: topics; post length; opening lines; tone; use of statistics;\n"
           "questions or calls to action; links; post format; engagement; impressions; comments; reposts.\n\n"
           "Do not assume that correlation means causation.\n\n"
           "Identify:\n"
           "1. five patterns associated with stronger-performing posts;\n"
           "2. five patterns associated with weaker-performing posts;\n"
           "3. any important exceptions;\n"
           "4. areas where there is not enough data to draw a conclusion.\n\n"
           "Use examples from the dataset where useful.", "the analysis prompt")
    s.h3("Discuss before you go on")
    s.bullets(["Did it identify genuine patterns, or overinterpret small differences?",
               "Were the strong posts strong because of the writing, or because of the topic, the "
               "speaker or the event?",
               "Which conclusions would you trust, and which would you want to investigate?"])
    s.h3("Step 3. Turn the analysis into a content guide")
    s.code("Using the analysis above, create a practical LinkedIn content guide for (ORGANISATION).\n\n"
           "The guide should help someone review or improve a draft post. Include:\n"
           "1. what tends to work; 2. what tends not to work; 3. recommended structure;\n"
           "4. tone and writing style; 5. opening lines; 6. length; 7. use of facts and statistics;\n"
           "8. calls to action; 9. things to avoid.\n\n"
           "Base the guidance on the data where possible. Clearly label anything that is a\n"
           "recommendation rather than something demonstrated by the data. Keep it concise.",
           "the guide prompt")
    s.para("Save the result. It becomes the knowledge your agent works from.")

    s.h2("Part 2. Build the assistant")
    s.para("Create a new agent. Suggested name: (ORGANISATION) LinkedIn Assistant.")
    s.h3("Step 4. Give it its job")
    s.code("You are a LinkedIn editorial assistant supporting the (ORGANISATION) communications team.\n\n"
           "Your job is to review draft LinkedIn posts against the (ORGANISATION) LinkedIn content\n"
           "guide and help improve them.\n\n"
           "Always work from a draft supplied by the user. Do not create a post from scratch unless\n"
           "the user explicitly asks you to.")
    s.h3("Step 5. Make it ask for the draft first")
    s.code("At the start of a new task, ask:\n"
           "\"Please paste the LinkedIn draft you would like me to review.\"\n\n"
           "If important context is missing, you may also ask for: the communication objective; the\n"
           "intended audience; the source material; any required link or call to action.\n\n"
           "Ask only for information that is genuinely necessary.")
    s.h3("Step 6. Teach it how to review")
    s.code("When a draft is provided, review it against the (ORGANISATION) LinkedIn content guide.\n\n"
           "Check: strength of the opening; clarity of the main message; relevance to the audience;\n"
           "tone; length; readability; use of facts or statistics; unnecessary jargon; call to action;\n"
           "alignment with patterns that have performed well in previous (ORGANISATION) posts.\n\n"
           "Do not invent facts or change the substantive meaning.")
    s.h3("Step 7. Define the output")
    s.code("Respond in three sections.\n\n"
           "1. WHAT WORKS. Briefly identify the strongest elements of the draft.\n"
           "2. WHAT I WOULD IMPROVE. The most important changes, based on the content guide.\n"
           "3. REVISED VERSION. An improved version more closely aligned with the guide.\n\n"
           "Preserve the original message and factual meaning. Do not rewrite more than necessary.")
    s.h3("Step 8. Test it")
    s.code("(ORGANISATION) has today published its latest report on TOPIC 1.\n\n"
           "The report discusses recent developments, risks and the outlook for TOPIC 2.\n\n"
           "Read the report here: [LINK]", "a deliberately flat draft")
    s.para("Compare the original, the review and the revised version. Then ask the question that "
           "matters: did it improve the post according to evidence from your own performance, or did "
           "it simply make it sound like generic social media copy? That is the test.")
    s.save()
    return s


# ── exercise 3 ────────────────────────────────────────────────────────────

def exercise_3():
    s = Sheet(os.path.join(OUTDIR, "ai-bootcamp-day-10-exercise-3-weekly-monitoring-agent.pdf"),
              "Exercise 3: the weekly monitoring agent", "AI bootcamp for EU affairs  ·  day 10")
    s.para("The most demanding build in this bootcamp. Given a reference date, the agent reviews the "
           "previous seven days across the EU and identifies what may matter to (ORGANISATION). Fill "
           "in your own subject areas wherever you see TOPIC 1, TOPIC 2 and TOPIC 3.", colour=MUTED)
    s.para("The aim is not a comprehensive digest. The agent identifies developments that merit closer "
           "attention, explains why, and separates established fact from its own inference.")

    s.h2("Core instruction")
    s.code("You are an EU monitoring agent supporting (ORGANISATION).\n\n"
           "When I give you a reference date, and optionally countries, institutions, industries or\n"
           "themes to prioritise, review relevant developments from the previous 7 days.\n\n"
           "Identify developments that could materially affect: (ORGANISATION)'s practice; its users\n"
           "or stakeholders; the administration of its area of responsibility; enforcement; its\n"
           "cooperation activities; the integrity of the system it works in; its operational or\n"
           "reputational environment.\n\n"
           "Apply a materiality test. Do not include an item merely because it concerns TOPIC 1.\n"
           "Prioritise developments where there is a plausible reason why (ORGANISATION) may need to\n"
           "understand, monitor or respond to them.")

    s.h2("The areas to monitor")
    s.para("Replace each topic with one of your own, and keep the instruction underneath it.")
    s.table(["Area", "What the agent watches", "The discipline to keep"],
            [["TOPIC 1", "Significant legal and practice developments in your core area",
              "Not every individual dispute is material"],
             ["TOPIC 2", "Your second area, including reform and its interpretation",
              "Say where practice or guidance may need to change"],
             ["TOPIC 3", "Your third area, including enforcement and cooperation",
              "Separate an isolated event from a pattern"],
             ["Case law", "Courts and appeal bodies whose decisions affect your work",
              "A judgment is not automatically a change in law"],
             ["Legislation", "Commission, Parliament, Council, national, consultations",
              "State the stage precisely: proposal to application"],
             ["Enforcement", "Operations, customs, online, organised activity",
              "Do not generalise from one seizure"],
             ["AI and digital", "Technology that changes how your area works",
              "Speculation is not operational change"],
             ["Users", "Volumes, behaviour, barriers, fraud and scams",
              "Do not overinterpret short-term movement"]],
            [0.13, 0.49, 0.38])

    s.h2("Materiality rules")
    s.para("Before including anything, ask: why could this matter to (ORGANISATION)? It is more likely "
           "to belong if it could change or clarify the law, affect decision-making practice, require "
           "new guidance, affect a substantial group of users, create an enforcement challenge, reveal "
           "a trend, affect cooperation, require changes to systems, or create operational, fraud, "
           "cybersecurity or reputational risk.")
    s.para("Exclude routine announcements, individual disputes with no broader implication, "
           "promotional material and low-significance events, unless they form part of a pattern.")

    s.h2("Source rules")
    s.bullets(["Prioritise authoritative and original sources, and name the source for every important claim.",
               "Use secondary reporting to discover a development, then verify it against the primary source.",
               "Never invent cases, judgments, holdings, legislation, statistics, quotations, dates, "
               "case numbers, institutional positions or links.",
               "If something cannot be verified, say so."])
    s.para("Label every item as one of: FACT, established by a reliable source; OFFICIAL ASSESSMENT, "
           "an interpretation by an institution; EXTERNAL COMMENTARY, analysis by others; INFERENCE, "
           "the agent's own conclusion. Never present commentary or inference as (ORGANISATION)'s position.")
    s.code("If web access is unavailable, use only the documents and information made available to you.\n"
           "Do not imply that you have conducted a complete search if you have not.\n"
           "Describe the actual scope of what you reviewed, and put anything you could not verify\n"
           "under DATA AND COVERAGE GAPS rather than filling the gap with inference.",
           "when the agent cannot browse")

    s.h2("Attention levels")
    s.para("Do not treat a development as important merely because a court ruled, legislation was "
           "proposed, an operation was announced, numbers moved, a large organisation was involved, or "
           "the press covered it heavily.")
    s.table(["Level", "What it means"],
            [["LOW ATTENTION", "Worth noting, unlikely to require material change"],
             ["WATCH", "Plausible implications, merits continued monitoring"],
             ["HEIGHTENED ATTENTION", "Substantial evidence of significant implications, investigate"]],
            [0.26, 0.74])
    s.para("For every WATCH or HEIGHTENED ATTENTION item: give the evidence, explain why it matters, "
           "give the counter-evidence, state the uncertainty, separate current effects from possible "
           "future ones, and say what to monitor next.")

    s.h2("The weekly output")
    s.para("Produce a concise weekly monitoring briefing in these sections.")
    s.bullets(["Executive summary. Five bullets maximum, each saying why it matters.",
               "TOPIC 1, 2 and 3 watch. Area, jurisdiction, body, development, date, source, evidence, "
               "relevance, attention level.",
               "Case-law watch. Case and number, body, date, issue, holding, relationship to existing "
               "practice, implications, attention level.",
               "Legislative and policy watch. The precise stage each initiative has reached.",
               "Enforcement watch. Isolated case or evidence of a broader pattern.",
               "AI and digital developments. Concrete implications rather than general AI news.",
               "Member State scan. Only countries with a meaningful development.",
               "User and volume trends. Normal variation separated from meaningful change.",
               "Cross-cutting themes. Patterns appearing across several areas.",
               "What may require closer attention. Evidence, inference, uncertainty, what to watch.",
               "Data and coverage gaps. Never conceal a limitation."])

    s.h2("Test it")
    s.code("Reference date: [DATE]\n\n"
           "Review relevant developments during the previous 7 days that could materially affect\n"
           "(ORGANISATION), its users or the system it works in.\n\n"
           "This week, pay particular attention to:\n"
           "- [COUNTRY OR JURISDICTION]\n"
           "- [TOPIC OR LEGAL ISSUE]\n"
           "- [INSTITUTION, INDUSTRY OR TECHNOLOGY]\n\n"
           "Prepare the weekly monitoring briefing. Prioritise materiality over volume.\n"
           "Do not include an item merely because it relates to TOPIC 1.", "the standard weekly test")
    s.code("Based on this week's evidence, which developments deserve closer attention from\n"
           "(ORGANISATION), and why? Do not simply rank the week's biggest stories.\n\n"
           "For each: give the evidence; explain the connection to our remit; give counter-evidence\n"
           "or limiting factors; explain the uncertainty; distinguish current effects from possible\n"
           "future implications; identify what should be monitored next.\n\n"
           "Where evidence is insufficient to draw a conclusion, say so.", "the harder analytical test")
    s.code("If our analysts had time to investigate only three issues from this week, which three\n"
           "should they examine first, and why? Base it on materiality, not media prominence.",
           "the prioritisation question")

    s.h2("The guardrails that make it useful")
    s.bullets(["Newsworthiness is not materiality.",
               "A judgment is not automatically a change in the law.",
               "A proposal is not adopted legislation.",
               "One operation is not a trend.",
               "Never infer (ORGANISATION)'s position. Attribute it only to an authoritative source.",
               "Not all developments are equally relevant. The point of the briefing is prioritisation.",
               "Do not force conclusions where evidence is weak. Uncertainty is useful information."])
    s.save()
    return s


def build_docx(title, intro, blocks, filename):
    """A plain editable version of each sheet, for people who prefer Word."""
    from docx import Document
    from docx.shared import Pt, RGBColor, Cm

    doc = Document()
    for section in doc.sections:
        section.top_margin = section.bottom_margin = Cm(2)
        section.left_margin = section.right_margin = Cm(2)
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(10)

    t = doc.add_paragraph(); tr = t.add_run(title)
    tr.bold = True; tr.font.size = Pt(22); tr.font.color.rgb = RGBColor.from_string("0A1D2B")
    sp = doc.add_paragraph(); sr = sp.add_run(
        "AI bootcamp for EU affairs, day 10  ·  european campaign playbook  ·  campaignplaybook.eu")
    sr.font.size = Pt(9); sr.font.color.rgb = RGBColor.from_string("5F5E5A")
    ip = doc.add_paragraph(); ip.add_run(intro).font.size = Pt(10)

    for kind, text in blocks:
        if kind == "h":
            p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(12)
            r = p.add_run(text); r.bold = True; r.font.size = Pt(13)
            r.font.color.rgb = RGBColor.from_string("2B5F29")
        elif kind == "p":
            doc.add_paragraph(text)
        elif kind == "b":
            doc.add_paragraph(text, style="List Bullet")
        elif kind == "c":
            p = doc.add_paragraph()
            r = p.add_run(text); r.font.name = "Consolas"; r.font.size = Pt(9)
            p.paragraph_format.left_indent = Cm(0.5)
    out = os.path.join(OUTDIR, filename)
    doc.save(out)
    return out


if __name__ == "__main__":
    os.makedirs(OUTDIR, exist_ok=True)
    for fn in (exercise_1, exercise_2, exercise_3):
        sheet = fn()
        print("wrote", sheet.c._filename)
