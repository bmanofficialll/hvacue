import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { PROVIDERS, isAiConfigured, providerDef, testConnection, type AiSettings, type ProviderId } from '../../engine/ai';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton } from '../ui/primitives';

const input = {
  height: 46, borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, paddingHorizontal: 12,
} as const;

export function SettingsScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const [draft, setDraft] = useState<AiSettings>(state.ai);
  const [test, setTest] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'err'; msg: string }>({ kind: 'idle', msg: '' });
  const def = providerDef(draft.provider);

  function pickProvider(id: ProviderId) {
    const p = providerDef(id);
    setDraft((d) => ({ ...d, provider: id, model: p.defaultModel, baseUrl: p.defaultBaseUrl ?? '' }));
    setTest({ kind: 'idle', msg: '' });
  }
  function save() {
    actions.setAiSettings(draft);
    actions.go(state.settingsReturnScreen);
  }
  function disconnect() {
    const cleared = { ...draft, apiKey: '' };
    setDraft(cleared);
    actions.setAiSettings(cleared);
    setTest({ kind: 'idle', msg: '' });
  }
  async function runTest() {
    setTest({ kind: 'busy', msg: 'Contacting provider…' });
    try {
      const reply = await testConnection(draft);
      setTest({ kind: 'ok', msg: 'Connected. Reply: ' + reply.slice(0, 60) });
    } catch (e) {
      setTest({ kind: 'err', msg: e instanceof Error ? e.message : 'Test failed.' });
    }
  }

  const configured = isAiConfigured(draft);
  const label = (t: string) => <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginBottom: 8 }]}>{t}</Text>;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => actions.go(state.settingsReturnScreen)} />
        <View style={{ flex: 1 }}>
          <Text style={heading({ weight: 600, size: 15 })}>Connect AI</Text>
          <Text style={[heading({ weight: 500, size: 11, lineHeight: 15, color: color.textDim }), { marginTop: 4 }]}>Bring your own provider key — Google Gemini is free</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 13, marginBottom: 18 }}>
          <Text style={heading({ weight: 500, size: 11, lineHeight: 18, color: color.textMuted })}>
            There is no “sign in with a free ChatGPT or Claude account” — those logins don’t let an app use the model. Each provider gives a personal API key instead. Paste one below. Your key is stored only on this device.
          </Text>
        </View>

        {label('PROVIDER')}
        <View style={{ gap: 9 }}>
          {PROVIDERS.map((p) => {
            const on = p.id === draft.provider;
            return (
              <Pressable
                key={p.id}
                onPress={() => pickProvider(p.id)}
                style={{ borderRadius: 12, backgroundColor: on ? color.cardAlt : color.card, borderWidth: 1, borderColor: on ? color.amberBorder35 : color.borderStrong, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 }}
              >
                <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: on ? color.amber : color.textDim, alignItems: 'center', justifyContent: 'center' }}>
                  {on && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color.amber }} />}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={heading({ weight: 600, size: 13 })}>{p.label}</Text>
                    {p.free && (
                      <View style={{ borderWidth: 1, borderColor: color.greenBorder4, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 3 }}>
                        <Text style={mono({ weight: 600, size: 8, letterSpacing: 1, color: color.green })}>FREE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[heading({ weight: 500, size: 10.5, lineHeight: 15, color: color.textDim }), { marginTop: 5 }]}>{p.keyHint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {def.needsBaseUrl && (
          <View style={{ marginTop: 18 }}>
            {label('BASE URL')}
            <TextInput value={draft.baseUrl} onChangeText={(t) => setDraft((d) => ({ ...d, baseUrl: t }))} placeholder="https://api.example.com/v1" placeholderTextColor={color.textDimmer} autoCapitalize="none" style={[input, mono({ weight: 600, size: 12, color: color.text })]} />
          </View>
        )}

        <View style={{ marginTop: 18 }}>
          {label('API KEY')}
          <TextInput value={draft.apiKey} onChangeText={(t) => setDraft((d) => ({ ...d, apiKey: t }))} placeholder="Paste your key" placeholderTextColor={color.textDimmer} secureTextEntry autoCapitalize="none" autoCorrect={false} style={[input, mono({ weight: 600, size: 12, color: color.text })]} />
          {!!def.keyUrl && (
            <Pressable onPress={() => Linking.openURL(def.keyUrl)}>
              <Text style={[mono({ weight: 600, size: 10.5, letterSpacing: 0.6, color: color.cyan }), { marginTop: 9 }]}>GET A KEY FROM {def.label.toUpperCase()} ↗</Text>
            </Pressable>
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          {label('MODEL')}
          <TextInput value={draft.model} onChangeText={(t) => setDraft((d) => ({ ...d, model: t }))} placeholder={def.defaultModel || 'model name'} placeholderTextColor={color.textDimmer} autoCapitalize="none" autoCorrect={false} style={[input, mono({ weight: 600, size: 12, color: color.text })]} />
        </View>

        {test.kind !== 'idle' && (
          <View style={{ marginTop: 16, borderRadius: 10, padding: 12, backgroundColor: test.kind === 'ok' ? color.greenBg08 : test.kind === 'err' ? color.redBg09 : color.cardAlt, borderWidth: 1, borderColor: test.kind === 'ok' ? color.greenBorder35 : test.kind === 'err' ? color.redBorder35 : color.border }}>
            <Text style={heading({ weight: 500, size: 11.5, lineHeight: 17, color: test.kind === 'ok' ? color.green : test.kind === 'err' ? color.redSoft : color.textMuted })}>{test.msg}</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
          <Pressable onPress={configured ? runTest : undefined} style={{ flex: 1, height: 48, borderRadius: 11, borderWidth: 1, borderColor: color.borderStrong2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 600, size: 11, letterSpacing: 0.8, color: configured ? color.textRow : color.textDimmer })}>{test.kind === 'busy' ? 'TESTING…' : 'TEST CONNECTION'}</Text>
          </Pressable>
          <Pressable onPress={configured ? save : undefined} style={{ flex: 1, height: 48, borderRadius: 11, backgroundColor: configured ? color.amber : color.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 700, size: 11, letterSpacing: 0.8, color: configured ? color.amberOn : color.textDimmer })}>SAVE & CONNECT</Text>
          </Pressable>
        </View>
        {isAiConfigured(state.ai) && (
          <Pressable onPress={disconnect} style={{ marginTop: 10, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 600, size: 10.5, letterSpacing: 0.8, color: color.redSoft })}>DISCONNECT & REMOVE KEY</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
