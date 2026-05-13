"""
PDF Generator for Revision Notes.
Uses PyMuPDF (fitz) only — no reportlab or other dependencies.
"""
import logging
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

# ── PyMuPDF built-in font names ──────────────────────────
# Valid values: "helv"=Helvetica, "hebo"=Helvetica-Bold,
#               "cour"=Courier,   "cobo"=Courier-Bold
FONT_REGULAR = "helv"
FONT_BOLD    = "hebo"
FONT_MONO    = "cour"

# ── Colour palette (RGB 0–1 floats) ─────────────────────
BG         = (0.067, 0.067, 0.153)   # #111127
CYAN       = (0.400, 0.800, 1.000)   # #66CCFF
GREEN      = (0.533, 0.867, 0.533)   # #88DD88
YELLOW     = (1.000, 0.800, 0.267)   # #FFCC44
LIGHT_GREY = (0.910, 0.910, 0.910)   # #E8E8E8
RED_SOFT   = (1.000, 0.467, 0.467)   # #FF7777
DIM        = (0.533, 0.533, 0.533)   # #888888
WHITE      = (1.000, 1.000, 1.000)
DIVIDER    = (0.200, 0.267, 0.400)   # #334466

PAGE_W, PAGE_H = fitz.paper_size("a4")   # 595 x 842 pts
MARGIN_L = MARGIN_R = 50
MARGIN_T = 50
MARGIN_B = 40
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R


class PDFWriter:
    """
    Stateful writer that tracks vertical position across pages.
    Uses only PyMuPDF built-in fonts — no external font files needed.
    """

    def __init__(self, topic: str):
        self.doc = fitz.open()
        self.topic = topic
        self.page_num = 0
        self._new_page()

    def _new_page(self):
        self.page = self.doc.new_page(width=PAGE_W, height=PAGE_H)
        self.page_num += 1
        # Dark background rect
        self.page.draw_rect(
            fitz.Rect(0, 0, PAGE_W, PAGE_H),
            color=None,
            fill=BG,
            overlay=False,
        )
        self.y = MARGIN_T

    def _check_space(self, needed: float):
        """Open a new page if there is not enough vertical room."""
        if self.y + needed > PAGE_H - MARGIN_B - 20:
            self._draw_footer()
            self._new_page()

    def _draw_footer(self):
        footer = self._safe(f"AI CareerPrep  |  {self.topic}  |  Page {self.page_num}")
        self.page.insert_text(
            fitz.Point(MARGIN_L, PAGE_H - 20),
            footer,
            fontname=FONT_REGULAR,
            fontsize=8,
            color=DIM,
        )

    # ── Public drawing methods ───────────────────────────

    def text_block(self, txt: str, fontname=FONT_REGULAR, fontsize=10,
                   color=LIGHT_GREY, indent=0, line_gap=4):
        """
        Render a block of text with word-wrap.
        indent: extra left offset in pts.
        """
        txt = self._safe(txt)
        if not txt:
            return

        x = MARGIN_L + indent
        max_w = CONTENT_W - indent

        lines = self._wrap_text(txt, fontsize, max_w)
        for line in lines:
            self._check_space(fontsize + line_gap)
            self.page.insert_text(
                fitz.Point(x, self.y + fontsize),
                line,
                fontname=fontname,
                fontsize=fontsize,
                color=color,
            )
            self.y += fontsize + line_gap

    def divider(self, gap_before=2, gap_after=6):
        self.y += gap_before
        self._check_space(2)
        self.page.draw_line(
            fitz.Point(MARGIN_L, self.y),
            fitz.Point(PAGE_W - MARGIN_R, self.y),
            color=DIVIDER,
            width=0.5,
        )
        self.y += gap_after

    def spacer(self, pts=8):
        self.y += pts

    def build(self) -> bytes:
        """Finalize and return PDF bytes."""
        self._draw_footer()
        buf = self.doc.tobytes(deflate=True)
        self.doc.close()
        return buf

    # ── Helpers ──────────────────────────────────────────

    @staticmethod
    def _safe(text) -> str:
        """Strip characters that latin-1 / built-in fonts can't render."""
        return (str(text) if text else "").encode("latin-1", errors="replace").decode("latin-1")

    @staticmethod
    def _wrap_text(text: str, fontsize: float, max_width: float) -> list:
        """
        Simple word-wrap using an approximate char-width heuristic.
        PyMuPDF's insert_text doesn't expose per-string width easily,
        so we estimate: average glyph width ≈ fontsize * 0.52 for Helvetica.
        """
        avg_char_w = fontsize * 0.52
        max_chars = max(1, int(max_width / avg_char_w))

        words = text.split()
        lines = []
        current = ""

        for word in words:
            candidate = (current + " " + word).strip()
            if len(candidate) <= max_chars:
                current = candidate
            else:
                if current:
                    lines.append(current)
                # If a single word is longer than the line, just append it
                current = word

        if current:
            lines.append(current)

        return lines or [""]


# ── Public API ───────────────────────────────────────────

def generate_notes_pdf(notes: dict) -> bytes:
    """
    Build a styled dark-theme PDF from a structured notes dict.
    Uses only PyMuPDF (fitz) — no reportlab, no external fonts.
    Returns valid PDF bytes.
    """
    topic = notes.get("topic", "Revision Notes")
    w = PDFWriter(topic)

    # ── Title block ──────────────────────────────────────
    w.text_block(topic, fontname=FONT_BOLD, fontsize=22, color=CYAN)
    w.spacer(4)
    w.text_block(
        "Last-Minute Revision Notes  |  AI Generated",
        fontname=FONT_REGULAR, fontsize=9, color=LIGHT_GREY,
    )
    w.divider(gap_before=6, gap_after=8)

    # ── Summary ──────────────────────────────────────────
    summary = notes.get("summary", "")
    if summary:
        w.text_block("SUMMARY", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        w.text_block(summary, fontname=FONT_REGULAR, fontsize=10, color=LIGHT_GREY)
        w.spacer(10)

    # ── Key Concepts ─────────────────────────────────────
    key_concepts = notes.get("key_concepts", [])
    if key_concepts:
        w.text_block("KEY CONCEPTS", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        for concept in key_concepts:
            w.spacer(6)
            w.text_block(
                ">> " + concept.get("title", ""),
                fontname=FONT_BOLD, fontsize=11, color=YELLOW,
            )
            w.text_block(
                concept.get("explanation", ""),
                fontname=FONT_REGULAR, fontsize=10, color=LIGHT_GREY,
            )
            ex = (concept.get("example") or "").strip()
            if ex:
                w.text_block(
                    "Example: " + ex,
                    fontname=FONT_MONO, fontsize=9, color=YELLOW, indent=12,
                )
            w.spacer(4)

    # ── Important Points ─────────────────────────────────
    important_points = notes.get("important_points", [])
    if important_points:
        w.spacer(6)
        w.text_block("IMPORTANT POINTS", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        for pt in important_points:
            w.text_block(
                "*  " + pt,
                fontname=FONT_REGULAR, fontsize=10, color=LIGHT_GREY, indent=14,
            )
        w.spacer(6)

    # ── Common Mistakes ──────────────────────────────────
    common_mistakes = notes.get("common_mistakes", [])
    if common_mistakes:
        w.text_block("COMMON MISTAKES TO AVOID", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        for m in common_mistakes:
            w.text_block(
                "x  " + m,
                fontname=FONT_REGULAR, fontsize=10, color=RED_SOFT, indent=14,
            )
        w.spacer(6)

    # ── Interview Tips ───────────────────────────────────
    interview_tips = notes.get("interview_tips", [])
    if interview_tips:
        w.text_block("INTERVIEW TIPS", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        for tip in interview_tips:
            w.text_block(
                "->  " + tip,
                fontname=FONT_REGULAR, fontsize=10, color=YELLOW, indent=14,
            )
        w.spacer(6)

    # ── Quick Revision Cheat Sheet ───────────────────────
    quick_revision = notes.get("quick_revision", "")
    if quick_revision:
        w.text_block("QUICK REVISION CHEAT SHEET", fontname=FONT_BOLD, fontsize=13, color=GREEN)
        w.divider()
        w.text_block(quick_revision, fontname=FONT_REGULAR, fontsize=10, color=WHITE)

    pdf_bytes = w.build()
    logger.info(
        "PDF generated: %d bytes | header=%s",
        len(pdf_bytes),
        pdf_bytes[:8],
    )
    return pdf_bytes