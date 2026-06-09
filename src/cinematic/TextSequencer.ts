export interface TypewriterLine {
  text: string;
  speed: number; // ms per char
  delayBefore: number; // ms to wait before starting
  pulseColor?: string; // e.g. green for '[OK]' markers
  id: string;
}

export class TextSequencer {
  lines: TypewriterLine[] = [];
  currentIndex: number = 0;
  visibleChars: number = 0;
  charsRendered: Record<string, string> = {};
  isComplete: boolean = false;
  
  private lastUpdateTime: number = 0;
  private accumTime: number = 0;
  private delayAccum: number = 0;
  private currentLineStarted: boolean = false;

  constructor(lines: TypewriterLine[]) {
    this.lines = lines;
    this.reset();
  }

  reset() {
    this.currentIndex = 0;
    this.visibleChars = 0;
    this.isComplete = false;
    this.charsRendered = {};
    for (const l of this.lines) {
      this.charsRendered[l.id] = '';
    }
    this.lastUpdateTime = Date.now();
    this.accumTime = 0;
    this.delayAccum = 0;
    this.currentLineStarted = false;
  }

  update() {
    if (this.isComplete) return;

    const now = Date.now();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    if (this.currentIndex >= this.lines.length) {
      this.isComplete = true;
      return;
    }

    const currentLine = this.lines[this.currentIndex];

    // Handle delay before line start
    if (!this.currentLineStarted) {
      this.delayAccum += dt;
      if (this.delayAccum >= currentLine.delayBefore) {
        this.currentLineStarted = true;
        this.delayAccum = 0;
        this.accumTime = 0;
        this.visibleChars = 0;
      } else {
        return; // still waiting
      }
    }

    // Typeout characters
    this.accumTime += dt;
    const charsToType = Math.floor(this.accumTime / currentLine.speed);
    if (charsToType > 0) {
      this.accumTime -= charsToType * currentLine.speed;
      this.visibleChars += charsToType;

      if (this.visibleChars >= currentLine.text.length) {
        // Complete current line
        this.charsRendered[currentLine.id] = currentLine.text;
        this.currentIndex++;
        this.currentLineStarted = false;
      } else {
        // Partial text
        this.charsRendered[currentLine.id] = currentLine.text.substring(0, this.visibleChars);
      }
    }
  }

  getRenderedText(id: string): string {
    return this.charsRendered[id] || '';
  }
}
