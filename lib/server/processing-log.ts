export type ProcessingLogEntry = {
  step: string;
  at: string;
  detail?: string;
};

export class ProcessingLog {
  private entries: ProcessingLogEntry[] = [];

  add(step: string, detail?: string) {
    const entry = { step, detail, at: new Date().toISOString() };
    this.entries.push(entry);
    const line = detail ? `[pdf-pipeline] ${step} — ${detail}` : `[pdf-pipeline] ${step}`;
    console.log(line);
  }

  getEntries() {
    return this.entries;
  }
}
