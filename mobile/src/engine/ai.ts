// ─────────────────────────────────────────────────────────────────────────
// AI integration layer — CURRENTLY SWITCHED OFF.
//
// The photo-reading (nameplate + fault code) and conversational-diagnosis
// features are wired through here but disabled until a real AI key is added.
// To turn them on later:
//   1. Set AI_ENABLED = true below.
//   2. Provide an API key (see connectKey) — ideally via a small backend proxy
//      rather than shipping the key in the app.
//   3. Implement the three functions to call your model of choice
//      (e.g. Anthropic's Claude vision + messages API).
//
// Everything else in the app works without this. When AI is off, the UI shows
// a clear "Connect AI" placeholder instead of pretending to analyze.
// ─────────────────────────────────────────────────────────────────────────

import type { Equipment } from './types';

export const AI_ENABLED = false;

export const AI_OFF_MESSAGE =
  'AI photo-reading is not connected yet. Enter the details by hand for now — or connect an AI key to have HVACue read them from the photo automatically.';

export const AI_GUIDANCE_OFF_MESSAGE =
  'Live AI guidance is not connected yet. HVACue is still walking you through the built-in diagnostic sequence step by step. Connect an AI key to ask free-form questions and get equipment-specific coaching.';

export interface NameplateResult {
  fields: Partial<Equipment>;
  lowConfidence: string[];
}

/** Read equipment identity from a nameplate photo. Stubbed until AI is connected. */
export async function analyzeNameplate(_photoUri: string): Promise<NameplateResult> {
  throw new Error(AI_OFF_MESSAGE);
}

/** Read a controller fault code from a photo. Stubbed until AI is connected. */
export async function analyzeFaultCode(_photoUri: string): Promise<{ code: string; meaning: string }> {
  throw new Error(AI_OFF_MESSAGE);
}

/** Free-form diagnostic coaching. Stubbed until AI is connected. */
export async function askGuidance(_question: string, _context: unknown): Promise<string> {
  throw new Error(AI_GUIDANCE_OFF_MESSAGE);
}
