import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, heading, mono } from '../../theme';
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
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderColor: color.borderMed, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BackButton onPress={() => actions.go('home')} />
          <View style={{ flex: 1 }}>
            <Text style={mono({ weight: 500, size: 9.5, letterSpacing: 1, color: color.amber })}>{tree.jobNo} · SESSION LIVE</Text>
            <Text style={[heading({ weight: 600, size: 15, lineHeight: 17 }), { marginTop: 5 }]}>{d.unitTitle}</Text>
          </View>
          <Pressable
            onPress={actions.openVoice}
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: color.cyanBg1, borderWidth: 1, borderColor: color.cyanBorder, alignItems: 'center', justifyContent: 'center' }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color.cyan }} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6, borderBottomWidth: 1, borderColor: color.borderMed }}>
          {d.chips.map((c, i) => <Chip key={i} text={c.t} bg={c.bg} fg={c.fg} />)}
        </View>

        {/* Guided walkthrough — plain-language "where you are / what to do now" */}
        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <View style={{ borderRadius: 12, backgroundColor: color.cyanBg07, borderWidth: 1, borderColor: color.cyanBorder25, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[mono({ weight: 600, size: 9, letterSpacing: 1.3, color: color.cyan }), { flex: 1 }]}>GUIDED WALKTHROUGH · {d.walkthrough.phase}</Text>
              <Pressable onPress={() => setShowGuide((s) => !s)}>
                <Text style={mono({ weight: 600, size: 9, letterSpacing: 0.8, color: color.cyan })}>{showGuide ? 'HIDE AI' : 'ASK AI ›'}</Text>
              </Pressable>
            </View>
            <Text style={[heading({ weight: 600, size: 14, lineHeight: 18 }), { marginTop: 9 }]}>{d.walkthrough.headline}</Text>
            <Text style={[heading({ weight: 500, size: 12, lineHeight: 18, color: color.textBody }), { marginTop: 7 }]}>{d.walkthrough.body}</Text>
            {showGuide && (
              <View style={{ marginTop: 12 }}>
                {aiOn ? (
                  <View style={{ gap: 9 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        value={question}
                        onChangeText={setQuestion}
                        onSubmitEditing={ask}
                        placeholder="Ask HVACue about this unit…"
                        placeholderTextColor={color.textDimmer}
                        style={[heading({ weight: 500, size: 12.5, color: color.text }), { flex: 1, height: 44, borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, paddingHorizontal: 12 }]}
                      />
                      <Pressable onPress={askBusy ? undefined : ask} style={{ height: 44, paddingHorizontal: 16, borderRadius: 10, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center', opacity: askBusy ? 0.7 : 1 }}>
                        <Text style={mono({ weight: 700, size: 11, letterSpacing: 0.8, color: color.cyanOn })}>{askBusy ? '…' : 'ASK'}</Text>
                      </Pressable>
                    </View>
                    {answer && (
                      <View style={{ borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, padding: 13 }}>
                        <Text style={heading({ weight: 400, size: 12.5, lineHeight: 20, color: color.textBody })}>{answer}</Text>
                      </View>
                    )}
                    {askErr && (
                      <View style={{ borderRadius: 10, backgroundColor: color.redBg09, borderWidth: 1, borderColor: color.redBorder35, padding: 12 }}>
                        <Text style={heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.redSoft })}>{askErr}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <AiPlaceholder message={AI_GUIDANCE_OFF_MESSAGE} compact onConnect={() => actions.openSettings('session')} />
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ padding: 18, paddingBottom: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>EQUIPMENT PROFILE</SectionLabel>
            <Pressable onPress={() => actions.openEquipmentSetup('session')}>
              <Text style={mono({ weight: 500, size: 9.5, letterSpacing: 0.8, color: color.cyan })}>RESCAN ›</Text>
            </Pressable>
          </View>
          <Card>
            {d.equipRows.map((e, i) => (
              <View key={e.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, paddingVertical: 11, borderBottomWidth: i === d.equipRows.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
                <Text style={[mono({ weight: 500, size: 10, letterSpacing: 0.8, color: color.textDim }), { flex: 1 }]}>{e.k}</Text>
                <Text style={mono({ weight: 600, size: 12, color: e.bad ? color.redSoft : color.text })}>{e.v}</Text>
              </View>
            ))}
          </Card>
          <Text style={[mono({ weight: 500, size: 9.5, lineHeight: 14, color: color.textDim }), { marginTop: 10 }]}>{d.brandNote}</Text>

          <Pressable
            onPress={() => setShowPhoto((s) => !s)}
            style={{ marginTop: 12, height: 44, borderRadius: 11, borderWidth: 1, borderColor: color.cyanBorder, backgroundColor: color.cyanBg07, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={mono({ weight: 600, size: 11, letterSpacing: 0.8, color: color.cyan })}>{showPhoto ? 'HIDE PHOTO' : '＋  ADD PHOTO OF EQUIPMENT / GAUGES'}</Text>
          </Pressable>
          {showPhoto && (
            <View style={{ marginTop: 12 }}>
              <PhotoCapture
                title="EQUIPMENT / GAUGE PHOTO"
                hint="Photograph the unit, wiring, board, or gauge set for your records"
                aiMessage={AI_OFF_MESSAGE}
                aiConfigured={aiOn}
                onConnect={() => actions.openSettings('session')}
              />
            </View>
          )}
        </View>

        <View style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <SectionLabel>FIELD READINGS</SectionLabel>
            <Text style={mono({ weight: 500, size: 9.5, color: color.textDim })}>{d.loggedCount}/{tree.order.length} LOGGED</Text>
          </View>
          <Card>
            {d.readingRows.map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => actions.openKeypad(r.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 13, borderBottomWidth: i === d.readingRows.length - 1 ? 0 : 1, borderColor: color.borderSoft, backgroundColor: r.bg }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={heading({ weight: 500, size: 11.5, lineHeight: 14, color: color.textRow })}>{r.label}</Text>
                  <Text style={[mono({ weight: 500, size: 9.5, color: r.noteColor }), { marginTop: 5 }]}>{r.note}</Text>
                </View>
                <Text style={mono({ weight: 600, size: 17, color: r.valColor })}>{r.display}</Text>
              </Pressable>
            ))}
          </Card>

          {d.derivedMetrics.length > 0 && (
            <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 14 }}>
              <SectionLabel style={{ marginBottom: 12 }}>DERIVED — ANALYZED TOGETHER</SectionLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {d.derivedMetrics.map((m, i) => (
                  <View key={i} style={{ width: '30%' }}>
                    <Text style={mono({ weight: 600, size: 19, color: m.bad ? color.redSoft : color.green })}>{m.value}</Text>
                    <Text style={[heading({ weight: 500, size: 9.5, lineHeight: 12, color: color.textDim }), { marginTop: 6 }]}>{m.label}</Text>
                    <Text style={[mono({ weight: 500, size: 8.5, color: color.textFaint }), { marginTop: 4 }]}>{m.tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {d.hasFlag && (
            <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: color.redBg09, borderWidth: 1, borderColor: color.redBorder35, padding: 14 }}>
              <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.2, color: color.redSoft })}>DATA CHECK</Text>
              <Text style={[heading({ weight: 500, size: 12, lineHeight: 17, color: color.redSofter }), { marginTop: 8 }]}>{d.flagText}</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <SectionLabel>PROBABLE CAUSES</SectionLabel>
            <Text style={mono({ weight: 500, size: 9.5, color: color.textFaint })}>{d.evidenceTag}</Text>
          </View>

          {causes.length === 0 ? (
            <View style={{ borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderStyle: 'dashed', borderColor: color.borderDashed, padding: 16 }}>
              <Text style={heading({ weight: 600, size: 13, lineHeight: 17, color: color.text })}>Insufficient information to rank causes.</Text>
              <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>
                I will not guess a confidence number. Log the field readings and I will rank from your data.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 9 }}>
              {causes.map((c) => (
                <View key={c.key} style={{ borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: causeBorder(c.rank), padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 9 }}>
                    <Text style={[mono({ weight: 600, size: 8.5, letterSpacing: 1, color: causeColor(c.rank) }), { flex: 1 }]}>{c.tier}</Text>
                    <Text style={mono({ weight: 600, size: 16, color: causeColor(c.rank) })}>{c.pctText}</Text>
                  </View>
                  <Text style={[heading({ weight: 600, size: 13.5, lineHeight: 17 }), { marginTop: 7 }]}>{c.name}</Text>
                  <View style={{ marginTop: 10 }}>
                    <ProgressBar pct={c.pct} fillColor={causeColor(c.rank)} />
                  </View>
                  <Text style={[heading({ weight: 500, size: 11, lineHeight: 16, color: color.textMuted }), { marginTop: 9 }]}>{c.why}</Text>
                </View>
              ))}
            </View>
          )}

          {/* AI second-opinion diagnosis on the whole picture */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
            <SectionLabel color={color.cyan}>AI DIAGNOSIS</SectionLabel>
            {aiOn && d.loggedCount >= 2 && (
              <Pressable onPress={diagBusy ? undefined : runAiDiag}>
                <Text style={mono({ weight: 700, size: 9, letterSpacing: 1, color: color.cyan })}>{diagBusy ? 'THINKING…' : diag ? 'RE-RUN ↻' : 'RUN AI DIAGNOSIS ›'}</Text>
              </Pressable>
            )}
          </View>
          {!aiOn ? (
            <AiPlaceholder message="Connect an AI provider and HVACue will give a second-opinion diagnosis on your whole reading set — agreeing with or challenging the rule engine." compact onConnect={() => actions.openSettings('session')} />
          ) : d.loggedCount < 2 ? (
            <View style={{ borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 14 }}>
              <Text style={heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted })}>Log at least two readings and I'll run an AI diagnosis across the whole picture.</Text>
            </View>
          ) : diagErr ? (
            <View style={{ borderRadius: 12, backgroundColor: color.redBg09, borderWidth: 1, borderColor: color.redBorder35, padding: 14 }}>
              <Text style={heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.redSoft })}>{diagErr}</Text>
            </View>
          ) : diag ? (
            <View style={{ borderRadius: 12, backgroundColor: color.cyanBg07, borderWidth: 1, borderColor: color.cyanBorder, padding: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[mono({ weight: 600, size: 9, letterSpacing: 1.2, color: color.cyan }), { flex: 1 }]}>AI SECOND OPINION</Text>
                {diag.agreesWithEngine !== null && (
                  <View style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: diag.agreesWithEngine ? color.greenBorder4 : color.amberBorder35 }}>
                    <Text style={mono({ weight: 700, size: 8, letterSpacing: 0.8, color: diag.agreesWithEngine ? color.green : color.amber })}>{diag.agreesWithEngine ? 'AGREES WITH ENGINE' : 'CHALLENGES ENGINE'}</Text>
                  </View>
                )}
              </View>
              <Text style={[heading({ weight: 600, size: 16, lineHeight: 20 }), { marginTop: 10 }]}>{diag.mostLikely}</Text>
              {!!diag.why && <Text style={[heading({ weight: 400, size: 12.5, lineHeight: 20, color: color.textBody }), { marginTop: 9 }]}>{diag.why}</Text>}
              {!!diag.nextStep && (
                <View style={{ marginTop: 12, borderTopWidth: 1, borderColor: color.borderMed, paddingTop: 11 }}>
                  <Text style={mono({ weight: 600, size: 8.5, letterSpacing: 1, color: color.cyan })}>AI SUGGESTS NEXT</Text>
                  <Text style={[heading({ weight: 500, size: 12, lineHeight: 18, color: color.textBody }), { marginTop: 7 }]}>{diag.nextStep}</Text>
                </View>
              )}
              {!!diag.cautions && <Text style={[heading({ weight: 500, size: 11, lineHeight: 16, color: color.redSoft }), { marginTop: 11 }]}>⚠ {diag.cautions}</Text>}
              <Text style={[mono({ weight: 500, size: 9, lineHeight: 14, color: color.textDimmer }), { marginTop: 12 }]}>AI OPINION — CROSS-CHECK AGAINST THE RULE ENGINE AND MANUFACTURER DATA.</Text>
            </View>
          ) : (
            <Pressable onPress={runAiDiag} style={{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: color.cyanBorder, backgroundColor: color.cyanBg07, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.cyan })}>✨  RUN AI DIAGNOSIS</Text>
            </Pressable>
          )}

          <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 22, marginBottom: 10 }]}>
            {nextStep.kind === 'measure' ? 'CHECK THIS NEXT' : 'NEXT TEST'}
          </Text>
          <View style={{ borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.amberBorder30, overflow: 'hidden' }}>
            <View style={{ padding: 15, borderBottomWidth: 1, borderColor: color.borderMed }}>
              <Text style={heading({ weight: 600, size: 15, lineHeight: 19, color: color.amber })}>{nextStep.title}</Text>
              <Text style={[mono({ weight: 500, size: 9.5, color: color.textDim }), { marginTop: 8 }]}>{nextStep.tag}</Text>
            </View>
            {nextStep.rows.map(([k, v]) => (
              <View key={k} style={{ padding: 15, borderBottomWidth: 1, borderColor: color.borderSoft, flexDirection: 'row', gap: 12 }}>
                <Text style={mono({ weight: 600, size: 8.5, lineHeight: 12, letterSpacing: 0.9, color: k === 'IF ABNORMAL' ? color.redSoft : k === 'IF NORMAL' ? color.green : color.textDim })} numberOfLines={3}>
                  {k}
                </Text>
                <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 16, color: color.textBody }), { flex: 1 }]}>{v}</Text>
              </View>
            ))}
            <View style={{ padding: 15, flexDirection: 'row', gap: 9 }}>
              <Pressable
                onPress={() => (nextStep.kind === 'measure' ? actions.openKeypad(nextStep.id, nextStep.verify) : actions.openRepair())}
                style={{ flex: 1, height: 46, borderRadius: 10, backgroundColor: color.amber, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={mono({ weight: 700, size: 12, letterSpacing: 1, color: color.amberOn })}>{nextStep.action}</Text>
              </Pressable>
              <Pressable
                onPress={actions.toggleTeach}
                style={{ height: 46, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: color.borderStrong2, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={mono({ weight: 600, size: 11, letterSpacing: 0.8, color: color.textRow })}>
                  {state.mode === 'tech' ? 'TECH MODE' : state.teach ? 'HIDE' : 'TEACH ME'}
                </Text>
              </Pressable>
            </View>
            {state.teach && state.mode === 'beginner' && (
              <View style={{ padding: 15, paddingTop: 0 }}>
                <View style={{ borderRadius: 10, backgroundColor: color.cyanBg07, borderWidth: 1, borderColor: color.cyanBorder25, padding: 13 }}>
                  <Text style={mono({ weight: 600, size: 9, letterSpacing: 1.2, color: color.cyan })}>TEACH ME</Text>
                  <Text style={[heading({ weight: 500, size: 12, lineHeight: 18, color: color.textBody }), { marginTop: 9 }]}>{nextStep.teach}</Text>
                </View>
              </View>
            )}
          </View>

          {d.canRepair && (
            <Pressable
              onPress={actions.openRepair}
              style={{ marginTop: 12, height: 50, borderRadius: 12, borderWidth: 1, borderColor: color.greenBorder4, backgroundColor: color.greenBg08, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={mono({ weight: 600, size: 11.5, letterSpacing: 1, color: color.green })}>LOG REPAIR & VERIFY</Text>
            </Pressable>
          )}

          <Text style={[mono({ weight: 500, size: 10, lineHeight: 15, color: color.textDimmer }), { marginTop: 16 }]}>
            SOURCES · MFR SPEC: {state.equipment.model} IOM · GUIDELINE: ASHRAE / industry reference · PT DATA: cached refrigerant table · INFERRED: HVACue engine · MEASURED: this session
          </Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 22 }}>
        <LinearGradient colors={['rgba(10,12,14,0)', '#0A0C0E']} locations={[0, 0.34]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: -20 }} />
        <Pressable
          onPress={() => (nextStep.kind === 'measure' ? actions.openKeypad(nextStep.id, nextStep.verify) : actions.openRepair())}
          style={{ height: 54, borderRadius: 14, backgroundColor: '#1B2126', borderWidth: 1, borderColor: color.borderStrong2, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 12, letterSpacing: 1, color: color.text })}>WHAT SHOULD I CHECK NEXT?</Text>
        </Pressable>
      </View>
    </View>
  );
}
