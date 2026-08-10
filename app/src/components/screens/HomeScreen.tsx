import { color, font } from '../../theme';
import { deriveSession } from '../../state/derive';
import { isAiConfigured } from '../../engine/ai';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';

const TILES: { n: string; title: string; sub: string; target: 'scan' | 'fault' | 'calc' | 'history' | 'training' }[] = [
  { n: '02', title: 'Scan\nequipment', sub: 'Nameplate OCR', target: 'scan' },
  { n: '03', title: 'Fault\ncode', sub: 'Photo or type', target: 'fault' },
  { n: '04', title: 'Photo\ndiagnosis', sub: 'Board, wiring, gauges', target: 'scan' },
  { n: '05', title: 'Calculators', sub: '42 tools', target: 'calc' },
  { n: '06', title: 'My jobs', sub: 'Buildings & history', target: 'history' },
  { n: '07', title: 'Training', sub: '9 levels · skill map', target: 'training' },
];

export function HomeScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const derived = state.equipmentConfirmed ? deriveSession(state) : null;
  const hasOpenSession = !!derived && derived.loggedCount > 0;
  const aiOn = isAiConfigured(state.ai);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 18px 34px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, border: `2px solid ${color.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 16px/1 ${font.heading}`, color: color.amber }}>Q</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: `700 21px/1 ${font.heading}`, letterSpacing: '-.02em' }}>HVACue</div>
          <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.18em', marginTop: 5 }}>DIAGNOSE. VERIFY. FIX.</div>
        </div>
        <div style={{ display: 'flex', padding: 3, background: '#15191D', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9 }}>
          <div
            onClick={() => actions.setMode('beginner')}
            style={{ padding: '8px 10px', borderRadius: 6, font: `600 10px/1 ${font.mono}`, letterSpacing: '.08em', cursor: 'pointer', background: state.mode === 'beginner' ? color.amber : 'transparent', color: state.mode === 'beginner' ? color.amberOn : color.textDim }}
          >
            BEGIN
          </div>
          <div
            onClick={() => actions.setMode('tech')}
            style={{ padding: '8px 10px', borderRadius: 6, font: `600 10px/1 ${font.mono}`, letterSpacing: '.08em', cursor: 'pointer', background: state.mode === 'tech' ? color.amber : 'transparent', color: state.mode === 'tech' ? color.amberOn : color.textDim }}
          >
            TECH
          </div>
        </div>
        <div
          onClick={() => actions.openSettings('home')}
          title="Connect AI"
          style={{ width: 34, height: 34, borderRadius: 9, background: '#15191D', border: `1px solid ${aiOn ? color.cyanBorder : 'rgba(255,255,255,.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', font: `700 11px/1 ${font.mono}`, color: aiOn ? color.cyan : color.textDim }}
        >
          AI
        </div>
      </div>

      <div
        onClick={() => actions.openEquipmentSetup('session')}
        style={{
          height: 104, borderRadius: 14, background: 'linear-gradient(180deg,#FFC04A,#FFB020)', color: color.amberOn,
          padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 11, cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ font: `700 25px/1 ${font.heading}`, letterSpacing: '-.02em' }}>DIAGNOSE</div>
          <div style={{ font: `600 9.5px/1 ${font.mono}`, letterSpacing: '.12em', opacity: 0.6 }}>01</div>
        </div>
        <div style={{ font: `500 11.5px/1.3 ${font.heading}`, opacity: 0.72 }}>Start a guided session — symptom, measurements, ranked causes</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
        {TILES.map((t) => (
          <div
            key={t.n}
            onClick={() => actions.go(t.target)}
            style={{ height: 92, borderRadius: 13, background: color.card, border: `1px solid ${color.borderStrong}`, padding: '13px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.12em' }}>{t.n}</div>
            <div>
              <div style={{ font: `600 14px/1.15 ${font.heading}`, whiteSpace: 'pre-line' }}>{t.title}</div>
              <div style={{ font: `500 10px/1 ${font.heading}`, color: color.textDim, marginTop: 5 }}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 11, borderRadius: 13, background: color.card, border: `1px solid ${color.borderStrong}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.12em' }}>08</div>
        <div style={{ font: `600 13px/1 ${font.heading}`, flex: 1 }}>References &amp; manual library</div>
        <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim }}>142 DOCS</div>
      </div>

      {hasOpenSession && derived && (
        <>
          <div style={{ marginTop: 22, font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em', marginBottom: 9 }}>OPEN SESSION</div>
          <div
            onClick={() => actions.go('session')}
            style={{ borderRadius: 13, background: color.cardAlt, border: `1px solid ${color.amberBorder32}`, padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: 6, height: 38, borderRadius: 3, background: color.amber }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: `500 10px/1 ${font.mono}`, color: color.amber, letterSpacing: '.1em' }}>{derived.tree.jobNo} · IN PROGRESS</div>
              <div style={{ font: `600 14px/1.2 ${font.heading}`, marginTop: 6 }}>{state.equipment.model} · {state.equipment.equipmentType}</div>
              <div style={{ font: `500 11px/1 ${font.heading}`, color: color.textDim, marginTop: 4 }}>{derived.tree.alarmText.replace('ALM: ', '')} · {derived.tree.siteName}</div>
            </div>
            <div style={{ font: `600 12px/1 ${font.heading}`, color: color.textDim }}>›</div>
          </div>
        </>
      )}

      <div
        onClick={actions.openVoice}
        style={{ marginTop: 20, height: 52, borderRadius: 26, border: `1px solid ${color.cyanBorder4}`, background: color.cyanBg07, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{ width: 9, height: 9, borderRadius: 5, background: color.cyan, animation: 'hvq-blip 1.6s infinite' }} />
        <div style={{ font: `600 12px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.14em' }}>VOICE MODE — HANDS FREE</div>
      </div>
    </div>
  );
}
