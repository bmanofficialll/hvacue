// ─────────────────────────────────────────────────────────────────────────
// Bring-your-own-AI layer.
//
// Users connect whatever provider they like by pasting their own API key
// (there is no "sign in with a free ChatGPT/Claude account" — those consumer
// logins do not grant API access; every provider gates model use behind a
// key). Google Gemini offers a genuinely free key, so it is the default.
//
// This module is provider-agnostic: it builds the right request shape for
// OpenAI-compatible APIs (OpenAI, OpenRouter, Groq, custom), Anthropic, and
// Google Gemini, for both plain chat and image (vision) analysis.
// ─────────────────────────────────────────────────────────────────────────

import type { Equipment } from './types';

export type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom';

export interface ProviderDef {
  id: ProviderId;
  label: string;
  /** OpenAI-compatible chat/completions shape vs Anthropic vs Gemini. */
  kind: 'openai' | 'anthropic' | 'gemini';
  defaultModel: string;
  free: boolean;
  keyUrl: string;
  keyHint: string;
  /** For 'custom' the user supplies the base URL. */
  needsBaseUrl?: boolean;
  defaultBaseUrl?: string;
}

export const PROVIDERS: ProviderDef[] = [
  {
    id: 'gemini', label: 'Google Gemini', kind: 'gemini', defaultModel: 'gemini-2.0-flash',
    free: true, keyUrl: 'https://aistudio.google.com/apikey',
    keyHint: 'Free key from Google AI Studio — no card required.',
  },
  {
    id: 'openai', label: 'OpenAI (ChatGPT)', kind: 'openai', defaultModel: 'gpt-4o-mini',
    free: false, keyUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'Pay-as-you-go API key from the OpenAI platform (not your ChatGPT login).',
    defaultBaseUrl: 'https://api.openai.com/v1',
  },
  {
    id: 'anthropic', label: 'Anthropic (Claude)', kind: 'anthropic', defaultModel: 'claude-3-5-sonnet-latest',
    free: false, keyUrl: 'https://console.anthropic.com/settings/keys',
    keyHint: 'API key from the Anthropic console (not your Claude.ai login).',
  },
  {
    id: 'openrouter', label: 'OpenRouter', kind: 'openai', defaultModel: 'google/gemini-2.0-flash-exp:free',
    free: true, keyUrl: 'https://openrouter.ai/keys',
    keyHint: 'One key, many models — several are free-tier.',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
  },
  {
    id: 'custom', label: 'Custom (OpenAI-compatible)', kind: 'openai', defaultModel: '',
    free: false, keyUrl: '', keyHint: 'Any OpenAI-compatible endpoint (Groq, LM Studio, self-hosted).',
    needsBaseUrl: true, defaultBaseUrl: '',
  },
];

export function providerDef(id: ProviderId): ProviderDef {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

export interface AiSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: 'gemini',
  apiKey: '',
  model: providerDef('gemini').defaultModel,
  baseUrl: '',
};

export function isAiConfigured(s: AiSettings | null | undefined): boolean {
  if (!s || !s.apiKey.trim() || !s.model.trim()) return false;
  if (providerDef(s.provider).needsBaseUrl && !s.baseUrl.trim()) return false;
  return true;
}

export const AI_OFF_MESSAGE =
  'AI photo-reading is not connected yet. Tap Connect AI to add a provider key (Google Gemini is free), or enter the details by hand.';

export const AI_GUIDANCE_OFF_MESSAGE =
  'Live AI guidance is not connected yet. HVACue is still walking you through the built-in sequence. Tap Connect AI to add a provider key (Google Gemini is free) and ask free-form questions.';

export interface ImageInput {
  /** base64 WITHOUT the data: prefix. */
  base64: string;
  mimeType: string;
}

// ── Low-level calls ────────────────────────────────────────────────────────

async function openAiChat(s: AiSettings, system: string, userText: string, image?: ImageInput): Promise<string> {
  const base = (s.baseUrl || providerDef(s.provider).defaultBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  const content: unknown[] = [{ type: 'text', text: userText }];
  if (image) content.push({ type: 'image_url', image_url: { url: `data:${image.mimeType};base64,${image.base64}` } });
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.apiKey}` },
    body: JSON.stringify({
      model: s.model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: image ? content : userText }],
      max_tokens: 900,
    }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

async function anthropicChat(s: AiSettings, system: string, userText: string, image?: ImageInput): Promise<string> {
  const content: unknown[] = [];
  if (image) content.push({ type: 'image', source: { type: 'base64', media_type: image.mimeType, data: image.base64 } });
  content.push({ type: 'text', text: userText });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': s.apiKey,
      'anthropic-version': '2023-06-01',
      // Allows direct browser calls (web build); harmless on native.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: s.model, max_tokens: 900, system, messages: [{ role: 'user', content }] }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const json = await res.json();
  return (json.content ?? []).map((c: { text?: string }) => c.text ?? '').join('').trim();
}

async function geminiChat(s: AiSettings, system: string, userText: string, image?: ImageInput): Promise<string> {
  const parts: unknown[] = [{ text: userText }];
  if (image) parts.push({ inline_data: { mime_type: image.mimeType, data: image.base64 } });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(s.model)}:generateContent?key=${encodeURIComponent(s.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { maxOutputTokens: 900 },
    }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const json = await res.json();
  return (json.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('').trim();
}

async function describeError(res: Response): Promise<string> {
  let detail = '';
  try {
    const j = await res.json();
    detail = j.error?.message || j.error?.type || JSON.stringify(j).slice(0, 200);
  } catch {
    detail = await res.text().catch(() => '');
  }
  if (res.status === 401 || res.status === 403) return 'The API key was rejected. Check the key and the selected provider.';
  if (res.status === 404) return 'Model not found for this provider. Check the model name in AI settings.';
  if (res.status === 429) return 'Rate limit or quota reached on your account. Try again shortly.';
  return `AI request failed (${res.status}). ${detail}`.trim();
}

function dispatch(s: AiSettings, system: string, userText: string, image?: ImageInput): Promise<string> {
  switch (providerDef(s.provider).kind) {
    case 'anthropic': return anthropicChat(s, system, userText, image);
    case 'gemini': return geminiChat(s, system, userText, image);
    default: return openAiChat(s, system, userText, image);
  }
}

// ── High-level features ─────────────────────────────────────────────────────

export async function chatComplete(s: AiSettings, system: string, userText: string): Promise<string> {
  return dispatch(s, system, userText);
}

export async function testConnection(s: AiSettings): Promise<string> {
  const out = await dispatch(s, 'You are a connection test.', 'Reply with exactly: HVACue connected.');
  return out || '(empty reply)';
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('The AI did not return readable data. Try a clearer photo.');
  return JSON.parse(body.slice(start, end + 1));
}

export interface NameplateResult {
  fields: Partial<Equipment>;
  lowConfidence: string[];
  raw: string;
}

const NAMEPLATE_SYSTEM =
  'You are an HVAC service assistant reading an equipment data plate from a photo. ' +
  'Return ONLY a JSON object with these string keys when visible: manufacturer, model, serial, equipmentType, ' +
  'capacityTons (number), refrigerant, meteringDevice, compressor, circuits (number), voltage, phase. ' +
  'Omit any field you cannot read. Add a "lowConfidence" array listing the keys you are unsure about. No prose.';

export async function analyzeNameplate(s: AiSettings, image: ImageInput): Promise<NameplateResult> {
  const raw = await dispatch(s, NAMEPLATE_SYSTEM, 'Read this equipment nameplate and return the JSON.', image);
  const parsed = extractJson(raw) as Record<string, unknown>;
  const fields: Partial<Equipment> = {};
  const str = (k: string) => (typeof parsed[k] === 'string' ? (parsed[k] as string) : undefined);
  const num = (k: string) => (typeof parsed[k] === 'number' ? (parsed[k] as number) : typeof parsed[k] === 'string' ? parseFloat(parsed[k] as string) : undefined);
  if (str('manufacturer')) fields.manufacturer = str('manufacturer');
  if (str('model')) fields.model = str('model');
  if (str('serial')) fields.serial = str('serial');
  if (str('equipmentType')) fields.equipmentType = str('equipmentType');
  if (num('capacityTons') != null && !isNaN(num('capacityTons')!)) fields.capacityTons = num('capacityTons');
  if (str('refrigerant')) fields.refrigerant = str('refrigerant');
  if (str('meteringDevice')) fields.meteringDevice = str('meteringDevice');
  if (str('compressor')) fields.compressor = str('compressor');
  if (num('circuits') != null && !isNaN(num('circuits')!)) fields.circuits = num('circuits');
  if (str('voltage')) fields.voltage = str('voltage');
  if (str('phase')) fields.phase = str('phase');
  const lowConfidence = Array.isArray(parsed.lowConfidence) ? (parsed.lowConfidence as unknown[]).map(String) : [];
  return { fields, lowConfidence, raw };
}

const FAULT_SYSTEM =
  'You are an HVAC assistant reading a controller display in a photo. Return ONLY JSON: ' +
  '{"code": string, "meaning": string}. "meaning" is one or two plain sentences of likely cause and first checks. No prose outside JSON.';

export async function analyzeFaultCode(s: AiSettings, image: ImageInput): Promise<{ code: string; meaning: string }> {
  const raw = await dispatch(s, FAULT_SYSTEM, 'Read the fault code on this controller and return the JSON.', image);
  const parsed = extractJson(raw) as { code?: string; meaning?: string };
  return { code: parsed.code || 'Unreadable', meaning: parsed.meaning || 'Could not read a meaning from the photo.' };
}

const GUIDANCE_SYSTEM =
  'You are HVACue, a calm, senior HVAC field mentor. Answer the technician concisely and safely. ' +
  'Prefer measurements over guesses, never invent manufacturer specs, and say when something needs the manufacturer procedure. ' +
  'Keep it to a few short paragraphs a tech can act on at the unit.';

export async function askGuidance(s: AiSettings, question: string, context: string): Promise<string> {
  return dispatch(s, GUIDANCE_SYSTEM, `Current session context:\n${context}\n\nTechnician asks: ${question}`);
}

export interface AiDiagnosis {
  mostLikely: string;
  why: string;
  nextStep: string;
  cautions: string;
  agreesWithEngine: boolean | null;
  raw: string;
}

const DIAGNOSIS_SYSTEM =
  'You are HVACue, a senior HVAC diagnostician giving an independent read on a live service call. ' +
  'You are given structured field data plus the app\'s own rule-based ranking. Weigh the measured numbers, ' +
  'agree or challenge the rule engine, and be concrete. Never invent manufacturer specifications; if a value ' +
  'is missing or a refrigerant has no cached PT data, say what to measure or pull. If there is not enough data ' +
  'to commit, set mostLikely to "Insufficient data" and say what to measure next. ' +
  'Return ONLY JSON: {"mostLikely": string, "why": string, "nextStep": string, "cautions": string, "agreesWithEngine": boolean}. No prose outside JSON.';

export async function runDiagnosis(s: AiSettings, context: string): Promise<AiDiagnosis> {
  const raw = await dispatch(s, DIAGNOSIS_SYSTEM, `Diagnose this service call and return the JSON.\n\n${context}`);
  const parsed = extractJson(raw) as Record<string, unknown>;
  const str = (k: string) => (typeof parsed[k] === 'string' ? (parsed[k] as string) : '');
  return {
    mostLikely: str('mostLikely') || 'No assessment returned',
    why: str('why'),
    nextStep: str('nextStep'),
    cautions: str('cautions'),
    agreesWithEngine: typeof parsed.agreesWithEngine === 'boolean' ? (parsed.agreesWithEngine as boolean) : null,
    raw,
  };
}
