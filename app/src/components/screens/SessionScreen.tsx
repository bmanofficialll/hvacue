import { useState } from 'react';
import { color, font } from '../../theme';
import { deriveSession } from '../../state/derive';
import { AI_OFF_MESSAGE, AI_GUIDANCE_OFF_MESSAGE, askGuidance, isAiConfigured, runDiagnosis, type AiDiagnosis } from '../../engine/ai';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, Card, Chip, ProgressBar, SectionLabel } from '../ui/primitives';
import { PhotoCapture } from '../ui/PhotoCapture';
import { AiPlaceholder } from '../ui/AiPlaceholder';

function sessionContext(d: ReturnType<typeof deriveSession>, eqLabel: string): string {
  const readings = d.readingRows.filter((r) => r.display !== '——').map((r) => `${r.label}: ${r.display}`).join('; ');
  const top = d.causes[0] ? `${d.causes[0].name} (${d.causes[0].pctText})` : 'not yet ranked';
  return `Equipment: ${eqLabel}. Alarm: ${d.tree.alarmText}. Readings: ${readings || 'none yet'}. Top ranked cause: ${top}.`;
}
import type { RankedCause } from '../../engine/engine';

function causeColor(rank: RankedCause['rank']) {
  if (rank === 'top') return color.amber;
  if (rank === 'mid') return color.cyan;
  return color.textDim;
}
function causeBorder(rank: RankedCause['rank']) {
  return rank === 'top' ? color.amberBorder30 : color.border;
}

export function SessionScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const d = deriveSession(state);
  const { tree, causes, nextStep } = d;
  const [showPhoto, setShowPhoto] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [askBusy, setAskBusy] = useState(false);
  const [askErr, setAskErr] = useState<string | null>(null);
  const [diag, setDiag] = useState<AiDiagnosis | null>(null);
  const [diagBusy, setDiagBusy] = useState(false);
  const [diagErr, setDiagErr] = useState<string | null>(null);
  const aiOn = isAiConfigured(state.ai);

  async function runAiDiag() {
    setDiagBusy(true);
    setDiagErr(null);
    try {
      setDiag(await runDiagnosis(state.ai, d.aiContext));
    } catch (e) {
      setDiagErr(e instanceof Error ? e.message : 'AI diagnosis failed.');
    } finally {
      setDiagBusy(false);
    }
  }

  async function ask() {
    if (!question.trim()) return;
    setAskBusy(true);
    setAskErr(null);
    setAnswer(null);
    try {
      const reply = await askGuidance(state.ai, question.trim(), sessionContext(d, `${state.equipment.manufacturer} ${state.equipment.model} ${state.equipment.equipmentType}`));
      setAnswer(reply);
    } catch (e) {
      setAskErr(e instanceof Error ? e.message : 'AI request failed.');
    } finally {
      setAskBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 96px' }}>
        <div style={{ padding: '8px 18px 14px', borderBottom: `1px solid ${color.borderMed}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton onClick={() => actions.go('home')} />
          <div style={{ flex: 1 }}>
            <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.amber, letterSpacing: '.12em' }}>{tree.jobNo} · SESSION LIVE</div>
            <div style={{ font: `600 15px/1.1 ${font.heading}`, marginTop: 5 }}>{d.unitTitle}</div>
          </div>
          <button
            onClick={actions.openVoice}
            style={{ width: 34, height: 34, borderRadius: 9, background: color.cyanBg1, border: `1px solid ${color.cyanBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: color.cyan }} />
          </button>
        </div>

        <div style={{ padding: '12px 18px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: `1px solid ${color.borderMed}` }}>
          {d.chips.map((c, i) => <Chip key={i} text={c.t} bg={c.bg} fg={c.fg} />)}
        </div>

        {/* Guided walkthrough — plain-language "where you are / what to do now" */}
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ borderRadius: 12, background: color.cyanBg07, border: `1px solid ${color.cyanBorder25}`, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ font: `600 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.14em', flex: 1 }}>GUIDED WALKTHROUGH · {d.walkthrough.phase}</div>
              <div onClick={() => setShowGuide((s) => !s)} style={{ font: `600 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.08em', cursor: 'pointer' }}>{showGuide ? 'HIDE AI' : 'ASK AI ›'}</div>
            </div>
            <div style={{ font: `600 14px/1.3 ${font.heading}`, marginTop: 9 }}>{d.walkthrough.headline}</div>
            <div style={{ font: `500 12px/1.55 ${font.heading}`, color: color.textBody, marginTop: 7 }}>{d.walkthrough.body}</div>
            {showGuide && (
              <div style={{ marginTop: 12 }}>
                {aiOn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
                        placeholder="Ask HVACue about this unit…"
                        style={{ flex: 1, height: 44, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`, color: color.text, font: `500 12.5px/1 ${font.heading}`, padding: '0 12px' }}
                      />
                      <div onClick={askBusy ? undefined : ask} style={{ height: 44, padding: '0 16px', borderRadius: 10, background: color.cyan, color: color.cyanOn, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11px/1 ${font.mono}`, letterSpacing: '.08em', cursor: askBusy ? 'default' : 'pointer', opacity: askBusy ? 0.7 : 1 }}>
                        {askBusy ? '…' : 'ASK'}
                      </div>
                    </div>
                    {answer && <div style={{ borderRadius: 10, background: color.card, border: `1px solid ${color.border}`, padding: 13, font: `400 12.5px/1.6 ${font.heading}`, color: color.textBody, whiteSpace: 'pre-wrap' }}>{answer}</div>}
                    {askErr && <div style={{ borderRadius: 10, background: color.redBg09, border: `1px solid ${color.redBorder35}`, padding: 12, font: `500 11.5px/1.5 ${font.heading}`, color: color.redSoft }}>{askErr}</div>}
                  </div>
                ) : (
                  <AiPlaceholder message={AI_GUIDANCE_OFF_MESSAGE} compact onConnect={() => actions.openSettings('session')} />
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>EQUIPMENT PROFILE</SectionLabel>
            <div onClick={() => actions.openEquipmentSetup('session')} style={{ font: `500 9.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.08em', cursor: 'pointer' }}>RESCAN ›</div>
          </div>
          <Card>
            {d.equipRows.map((e, i) => (
              <div key={e.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderBottom: i === d.equipRows.length - 1 ? 'none' : `1px solid ${color.borderSoft}` }}>
                <div style={{ flex: 1, font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em' }}>{e.k}</div>
                <div style={{ font: `600 12px/1 ${font.mono}`, color: e.bad ? color.redSoft : color.text, textAlign: 'right' }}>{e.v}</div>
              </div>
            ))}
          </Card>
          <div style={{ font: `500 9.5px/1.5 ${font.mono}`, color: color.textDim, marginTop: 10 }}>{d.brandNote}</div>

          <div
            onClick={() => setShowPhoto((s) => !s)}
            style={{ marginTop: 12, height: 44, borderRadius: 11, border: `1px solid ${color.cyanBorder}`, background: color.cyanBg07, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, letterSpacing: '.08em', color: color.cyan, cursor: 'pointer' }}
          >
            {showPhoto ? 'HIDE PHOTO' : '＋  ADD PHOTO OF EQUIPMENT / GAUGES'}
          </div>
          {showPhoto && (
            <div style={{ marginTop: 12 }}>
              <PhotoCapture
                title="EQUIPMENT / GAUGE PHOTO"
                hint="Photograph the unit, wiring, board, or gauge set for your records"
                aiMessage={AI_OFF_MESSAGE}
                aiConfigured={aiOn}
                onConnect={() => actions.openSettings('session')}
              />
            </div>
          )}
        </div>

        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>FIELD READINGS</SectionLabel>
            <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim }}>{d.loggedCount}/{tree.order.length} LOGGED</div>
          </div>
          <Card>
            {d.readingRows.map((r, i) => (
              <div
                key={r.id}
                onClick={() => actions.openKeypad(r.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 13px', borderBottom: i === d.readingRows.length - 1 ? 'none' : `1px solid ${color.borderSoft}`, background: r.bg, cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ font: `500 11.5px/1.2 ${font.heading}`, color: color.textRow }}>{r.label}</div>
                  <div style={{ font: `500 9.5px/1 ${font.mono}`, color: r.noteColor, marginTop: 5 }}>{r.note}</div>
                </div>
                <div style={{ font: `600 17px/1 ${font.mono}`, color: r.valColor, textAlign: 'right' }}>{r.display}</div>
              </div>
            ))}
          </Card>

          {d.derivedMetrics.length > 0 && (
            <div style={{ marginTop: 14, borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 14 }}>
              <SectionLabel style={{ marginBottom: 12 }}>DERIVED — ANALYZED TOGETHER</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {d.derivedMetrics.map((m, i) => (
                  <div key={i}>
                    <div style={{ font: `600 19px/1 ${font.mono}`, color: m.bad ? color.redSoft : color.green }}>{m.value}</div>
                    <div style={{ font: `500 9.5px/1.3 ${font.heading}`, color: color.textDim, marginTop: 6 }}>{m.label}</div>
                    <div style={{ font: `500 8.5px/1 ${font.mono}`, color: color.textFaint, marginTop: 4 }}>{m.tag}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {d.hasFlag && (
            <div style={{ marginTop: 14, borderRadius: 12, background: color.redBg09, border: `1px solid ${color.redBorder35}`, padding: 14 }}>
              <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.redSoft, letterSpacing: '.14em' }}>DATA CHECK</div>
              <div style={{ font: `500 12px/1.45 ${font.heading}`, color: color.redSofter, marginTop: 8 }}>{d.flagText}</div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
            <SectionLabel>PROBABLE CAUSES</SectionLabel>
            <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textFaint }}>{d.evidenceTag}</div>
          </div>

          {causes.length === 0 ? (
            <div style={{ borderRadius: 12, background: color.cardAlt, border: `1px dashed ${color.borderDashed}`, padding: 16 }}>
              <div style={{ font: `600 13px/1.3 ${font.heading}`, color: color.text }}>Insufficient information to rank causes.</div>
              <div style={{ font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 8 }}>I will not guess a confidence number. Log the field readings and I will rank from your data.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {causes.map((c) => (
                <div key={c.key} style={{ borderRadius: 12, background: color.card, border: `1px solid ${causeBorder(c.rank)}`, padding: '13px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
                    <div style={{ font: `600 8.5px/1 ${font.mono}`, color: causeColor(c.rank), letterSpacing: '.12em', flex: 1 }}>{c.tier}</div>
                    <div style={{ font: `600 16px/1 ${font.mono}`, color: causeColor(c.rank) }}>{c.pctText}</div>
                  </div>
                  <div style={{ font: `600 13.5px/1.25 ${font.heading}`, marginTop: 7 }}>{c.name}</div>
                  <div style={{ marginTop: 10 }}>
                    <ProgressBar pct={c.pct} fillColor={causeColor(c.rank)} />
                  </div>
                  <div style={{ font: `500 11px/1.5 ${font.heading}`, color: color.textMuted, marginTop: 9 }}>{c.why}</div>
                </div>
              ))}
            </div>
          )}

          {/* AI second-opinion diagnosis on the whole picture */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 10px' }}>
            <SectionLabel color={color.cyan}>AI DIAGNOSIS</SectionLabel>
            {aiOn && d.loggedCount >= 2 && (
              <div onClick={diagBusy ? undefined : runAiDiag} style={{ font: `700 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.1em', cursor: diagBusy ? 'default' : 'pointer' }}>
                {diagBusy ? 'THINKING…' : diag ? 'RE-RUN ↻' : 'RUN AI DIAGNOSIS ›'}
              </div>
            )}
          </div>
          {!aiOn ? (
            <AiPlaceholder message="Connect an AI provider and HVACue will give a second-opinion diagnosis on your whole reading set — agreeing with or challenging the rule engine." compact onConnect={() => actions.openSettings('session')} />
          ) : d.loggedCount < 2 ? (
            <div style={{ borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 14, font: `500 11.5px/1.5 ${font.heading}`, color: color.textMuted }}>
              Log at least two readings and I'll run an AI diagnosis across the whole picture.
            </div>
          ) : diagErr ? (
            <div style={{ borderRadius: 12, background: color.redBg09, border: `1px solid ${color.redBorder35}`, padding: 14, font: `500 11.5px/1.5 ${font.heading}`, color: color.redSoft }}>{diagErr}</div>
          ) : diag ? (
            <div style={{ borderRadius: 12, background: color.cyanBg07, border: `1px solid ${color.cyanBorder}`, padding: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ font: `600 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.12em', flex: 1 }}>AI SECOND OPINION</div>
                {diag.agreesWithEngine !== null && (
                  <div style={{ font: `700 8px/1 ${font.mono}`, letterSpacing: '.08em', padding: '4px 6px', borderRadius: 5, color: diag.agreesWithEngine ? color.green : color.amber, border: `1px solid ${diag.agreesWithEngine ? color.greenBorder4 : color.amberBorder35}` }}>
                    {diag.agreesWithEngine ? 'AGREES WITH ENGINE' : 'CHALLENGES ENGINE'}
                  </div>
                )}
              </div>
              <div style={{ font: `600 16px/1.25 ${font.heading}`, marginTop: 10 }}>{diag.mostLikely}</div>
              {diag.why && <div style={{ font: `400 12.5px/1.6 ${font.heading}`, color: color.textBody, marginTop: 9 }}>{diag.why}</div>}
              {diag.nextStep && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${color.borderMed}`, paddingTop: 11 }}>
                  <div style={{ font: `600 8.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.1em' }}>AI SUGGESTS NEXT</div>
                  <div style={{ font: `500 12px/1.55 ${font.heading}`, color: color.textBody, marginTop: 7 }}>{diag.nextStep}</div>
                </div>
              )}
              {diag.cautions && (
                <div style={{ marginTop: 11, font: `500 11px/1.5 ${font.heading}`, color: color.redSoft }}>⚠ {diag.cautions}</div>
              )}
              <div style={{ font: `500 9px/1.5 ${font.mono}`, color: color.textDimmer, marginTop: 12 }}>AI OPINION — CROSS-CHECK AGAINST THE RULE ENGINE AND MANUFACTURER DATA.</div>
            </div>
          ) : (
            <div
              onClick={runAiDiag}
              style={{ height: 50, borderRadius: 12, border: `1px solid ${color.cyanBorder}`, background: color.cyanBg07, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 11.5px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.1em', cursor: 'pointer' }}
            >
              ✨&nbsp;&nbsp;RUN AI DIAGNOSIS
            </div>
          )}

          <div style={{ margin: '22px 0 10px', font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.16em' }}>
            {nextStep.kind === 'measure' ? 'CHECK THIS NEXT' : 'NEXT TEST'}
          </div>
          <div style={{ borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.amberBorder30}`, overflow: 'hidden' }}>
            <div style={{ padding: 15, borderBottom: `1px solid ${color.borderMed}` }}>
              <div style={{ font: `600 15px/1.25 ${font.heading}`, color: color.amber }}>{nextStep.title}</div>
              <div style={{ font: `500 9.5px/1 ${font.mono}`, color: color.textDim, marginTop: 8 }}>{nextStep.tag}</div>
            </div>
            {nextStep.rows.map(([k, v]) => (
              <div key={k} style={{ padding: '13px 15px', borderBottom: `1px solid ${color.borderSoft}`, display: 'flex', gap: 12 }}>
                <div style={{ width: 74, flex: 'none', font: `600 8.5px/1.4 ${font.mono}`, color: k === 'IF ABNORMAL' ? color.redSoft : k === 'IF NORMAL' ? color.green : color.textDim, letterSpacing: '.1em' }}>{k}</div>
                <div style={{ flex: 1, font: `500 11.5px/1.5 ${font.heading}`, color: color.textBody }}>{v}</div>
              </div>
            ))}
            <div style={{ padding: '13px 15px', display: 'flex', gap: 9 }}>
              <button
                onClick={() => nextStep.kind === 'measure' ? actions.openKeypad(nextStep.id, nextStep.verify) : actions.openRepair()}
                style={{ flex: 1, height: 46, borderRadius: 10, background: color.amber, color: color.amberOn, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 12px/1 ${font.mono}`, letterSpacing: '.1em', cursor: 'pointer' }}
              >
                {nextStep.action}
              </button>
              <button
                onClick={actions.toggleTeach}
                style={{ height: 46, padding: '0 15px', borderRadius: 10, border: `1px solid ${color.borderStrong2}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: color.textRow, letterSpacing: '.08em', cursor: 'pointer' }}
              >
                {state.mode === 'tech' ? 'TECH MODE' : state.teach ? 'HIDE' : 'TEACH ME'}
              </button>
            </div>
            {state.teach && state.mode === 'beginner' && (
              <div style={{ padding: '0 15px 15px' }}>
                <div style={{ borderRadius: 10, background: color.cyanBg07, border: `1px solid ${color.cyanBorder25}`, padding: 13 }}>
                  <div style={{ font: `600 9px/1 ${font.mono}`, color: color.cyan, letterSpacing: '.14em' }}>TEACH ME</div>
                  <div style={{ font: `500 12px/1.55 ${font.heading}`, color: color.textBody, marginTop: 9 }}>{nextStep.teach}</div>
                </div>
              </div>
            )}
          </div>

          {d.canRepair && (
            <div
              onClick={actions.openRepair}
              style={{ marginTop: 12, height: 50, borderRadius: 12, border: `1px solid ${color.greenBorder4}`, background: color.greenBg08, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11.5px/1 ${font.mono}`, color: color.green, letterSpacing: '.1em', cursor: 'pointer' }}
            >
              LOG REPAIR &amp; VERIFY
            </div>
          )}

          <div style={{ marginTop: 16, font: `500 10px/1.6 ${font.mono}`, color: color.textDimmer }}>
            SOURCES · MFR SPEC: {state.equipment.model} IOM · GUIDELINE: ASHRAE / industry reference · PT DATA: cached refrigerant table · INFERRED: HVACue engine · MEASURED: this session
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 18px 30px', background: 'linear-gradient(180deg,rgba(10,12,14,0),#0A0C0E 34%)', zIndex: 20 }}>
        <div
          onClick={() => nextStep.kind === 'measure' ? actions.openKeypad(nextStep.id, nextStep.verify) : actions.openRepair()}
          style={{ height: 54, borderRadius: 14, background: '#1B2126', border: `1px solid ${color.borderStrong2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{ font: `700 12px/1 ${font.mono}`, color: color.text, letterSpacing: '.1em' }}>WHAT SHOULD I CHECK NEXT?</div>
        </div>
      </div>
    </div>
  );
}
