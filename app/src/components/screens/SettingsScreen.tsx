import { useState } from 'react';
import { color, font } from '../../theme';
import { PROVIDERS, isAiConfigured, providerDef, testConnection, type AiSettings, type ProviderId } from '../../engine/ai';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton } from '../ui/primitives';

export function SettingsScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const [draft, setDraft] = useState<AiSettings>(state.ai);
  const [testState, setTestState] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'err'; msg: string }>({ kind: 'idle', msg: '' });
  const def = providerDef(draft.provider);

  function pickProvider(id: ProviderId) {
    const p = providerDef(id);
    setDraft((d) => ({ ...d, provider: id, model: p.defaultModel, baseUrl: p.defaultBaseUrl ?? '' }));
    setTestState({ kind: 'idle', msg: '' });
  }

  function save() {
    actions.setAiSettings(draft);
    actions.go(state.settingsReturnScreen);
  }

  function disconnect() {
    const cleared = { ...draft, apiKey: '' };
    setDraft(cleared);
    actions.setAiSettings(cleared);
    setTestState({ kind: 'idle', msg: '' });
  }

  async function runTest() {
    setTestState({ kind: 'busy', msg: 'Contacting provider…' });
    try {
      const reply = await testConnection(draft);
      setTestState({ kind: 'ok', msg: 'Connected. Reply: ' + reply.slice(0, 60) });
    } catch (e) {
      setTestState({ kind: 'err', msg: e instanceof Error ? e.message : 'Test failed.' });
    }
  }

  const configured = isAiConfigured(draft);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => actions.go(state.settingsReturnScreen)} />
        <div style={{ flex: 1 }}>
          <div style={{ font: `600 15px/1 ${font.heading}` }}>Connect AI</div>
          <div style={{ font: `500 11px/1.3 ${font.heading}`, color: color.textDim, marginTop: 4 }}>Bring your own provider key — Google Gemini is free</div>
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        <div style={{ borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 13, marginBottom: 18 }}>
          <div style={{ font: `500 11px/1.6 ${font.heading}`, color: color.textMuted }}>
            There is no "sign in with a free ChatGPT or Claude account" — those logins don't let an app use the model. Each provider gives a personal <b style={{ color: color.textBody }}>API key</b> instead. Paste one below. Your key is stored only on this device.
          </div>
        </div>

        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', marginBottom: 10 }}>PROVIDER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {PROVIDERS.map((p) => {
            const on = p.id === draft.provider;
            return (
              <div
                key={p.id}
                onClick={() => pickProvider(p.id)}
                style={{ borderRadius: 12, background: on ? color.cardAlt : color.card, border: `1px solid ${on ? color.amberBorder35 : color.borderStrong}`, padding: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11 }}
              >
                <div style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid ${on ? color.amber : color.textDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <div style={{ width: 7, height: 7, borderRadius: 4, background: color.amber }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ font: `600 13px/1 ${font.heading}` }}>{p.label}</div>
                    {p.free && <div style={{ font: `600 8px/1 ${font.mono}`, color: color.green, letterSpacing: '.1em', border: `1px solid ${color.greenBorder4}`, borderRadius: 4, padding: '3px 5px' }}>FREE</div>}
                  </div>
                  <div style={{ font: `500 10.5px/1.4 ${font.heading}`, color: color.textDim, marginTop: 5 }}>{p.keyHint}</div>
                </div>
              </div>
            );
          })}
        </div>

        {def.needsBaseUrl && (
          <>
            <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', margin: '18px 0 8px' }}>BASE URL</div>
            <input
              value={draft.baseUrl}
              onChange={(e) => setDraft((d) => ({ ...d, baseUrl: e.target.value }))}
              placeholder="https://api.example.com/v1"
              style={{ width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`, color: color.text, font: `600 12px/1 ${font.mono}`, padding: '0 12px' }}
            />
          </>
        )}

        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', margin: '18px 0 8px' }}>API KEY</div>
        <input
          value={draft.apiKey}
          onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
          placeholder="Paste your key"
          type="password"
          autoComplete="off"
          style={{ width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`, color: color.text, font: `600 12px/1 ${font.mono}`, padding: '0 12px' }}
        />
        {def.keyUrl && (
          <a href={def.keyUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 9, font: `600 10.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.06em' }}>
            GET A KEY FROM {def.label.toUpperCase()} ↗
          </a>
        )}

        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', margin: '18px 0 8px' }}>MODEL</div>
        <input
          value={draft.model}
          onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
          placeholder={def.defaultModel || 'model name'}
          style={{ width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`, color: color.text, font: `600 12px/1 ${font.mono}`, padding: '0 12px' }}
        />

        {testState.kind !== 'idle' && (
          <div style={{ marginTop: 16, borderRadius: 10, padding: 12, background: testState.kind === 'ok' ? color.greenBg08 : testState.kind === 'err' ? color.redBg09 : color.cardAlt, border: `1px solid ${testState.kind === 'ok' ? color.greenBorder35 : testState.kind === 'err' ? color.redBorder35 : color.border}` }}>
            <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: testState.kind === 'ok' ? color.green : testState.kind === 'err' ? color.redSoft : color.textMuted }}>{testState.msg}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
          <div
            onClick={configured ? runTest : undefined}
            style={{ flex: 1, height: 48, borderRadius: 11, border: `1px solid ${color.borderStrong2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: configured ? color.textRow : color.textDimmer, letterSpacing: '.08em', cursor: configured ? 'pointer' : 'default' }}
          >
            {testState.kind === 'busy' ? 'TESTING…' : 'TEST CONNECTION'}
          </div>
          <div
            onClick={configured ? save : undefined}
            style={{ flex: 1, height: 48, borderRadius: 11, background: configured ? color.amber : color.card, color: configured ? color.amberOn : color.textDimmer, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11px/1 ${font.mono}`, letterSpacing: '.08em', cursor: configured ? 'pointer' : 'default' }}
          >
            SAVE &amp; CONNECT
          </div>
        </div>
        {isAiConfigured(state.ai) && (
          <div onClick={disconnect} style={{ marginTop: 10, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 10.5px/1 ${font.mono}`, color: color.redSoft, letterSpacing: '.08em', cursor: 'pointer' }}>
            DISCONNECT &amp; REMOVE KEY
          </div>
        )}
      </div>
    </div>
  );
}
