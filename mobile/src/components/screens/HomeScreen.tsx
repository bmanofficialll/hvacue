import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, heading, mono } from '../../theme';
import { isAiConfigured } from '../../engine/ai';
import { Blip } from '../ui/Blip';
import { deriveSession } from '../../state/derive';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import type { Screen } from '../../state/types';

const TILES: { n: string; title: string; sub: string; target: Screen }[] = [
  { n: '02', title: 'Scan equipment', sub: 'Nameplate OCR', target: 'scan' },
  { n: '03', title: 'Fault code', sub: 'Photo or type', target: 'fault' },
  { n: '04', title: 'Photo diagnosis', sub: 'Board, wiring, gauges', target: 'scan' },
  { n: '05', title: 'Calculators', sub: '42 tools', target: 'calc' },
  { n: '06', title: 'My jobs', sub: 'Buildings & history', target: 'history' },
  { n: '07', title: 'Training', sub: '9 levels · skill map', target: 'training' },
];

export function HomeScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const derived = state.equipmentConfirmed ? deriveSession(state) : null;
  const hasOpenSession = !!derived && derived.loggedCount > 0;
  const aiOn = isAiConfigured(state.ai);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 34 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, borderWidth: 2, borderColor: color.amber, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={heading({ weight: 700, size: 16, lineHeight: 16, color: color.amber })}>Q</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={heading({ weight: 700, size: 21, letterSpacing: -0.4 })}>HVACue</Text>
          <Text style={[mono({ weight: 500, size: 9.5, letterSpacing: 1.7, color: color.textDim }), { marginTop: 5 }]}>DIAGNOSE. VERIFY. FIX.</Text>
        </View>
        <View style={{ flexDirection: 'row', padding: 3, backgroundColor: '#15191D', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)', borderRadius: 9 }}>
          <Pressable onPress={() => actions.setMode('beginner')} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, backgroundColor: state.mode === 'beginner' ? color.amber : 'transparent' }}>
            <Text style={mono({ weight: 600, size: 10, letterSpacing: 0.8, color: state.mode === 'beginner' ? color.amberOn : color.textDim })}>BEGIN</Text>
          </Pressable>
          <Pressable onPress={() => actions.setMode('tech')} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, backgroundColor: state.mode === 'tech' ? color.amber : 'transparent' }}>
            <Text style={mono({ weight: 600, size: 10, letterSpacing: 0.8, color: state.mode === 'tech' ? color.amberOn : color.textDim })}>TECH</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => actions.openSettings('home')}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: '#15191D', borderWidth: 1, borderColor: aiOn ? color.cyanBorder : 'rgba(255,255,255,.08)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 700, size: 11, color: aiOn ? color.cyan : color.textDim })}>AI</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => actions.openEquipmentSetup('session')}>
        <LinearGradient
          colors={['#FFC04A', '#FFB020']}
          style={{ height: 104, borderRadius: 14, padding: 16, justifyContent: 'space-between', marginBottom: 11 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={heading({ weight: 700, size: 25, letterSpacing: -0.5, color: color.amberOn })}>DIAGNOSE</Text>
            <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1, color: 'rgba(23,18,3,.6)' })}>01</Text>
          </View>
          <Text style={heading({ weight: 500, size: 11.5, lineHeight: 15, color: 'rgba(23,18,3,.72)' })}>
            Start a guided session — symptom, measurements, ranked causes
          </Text>
        </LinearGradient>
      </Pressable>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 11 }}>
        {TILES.map((t) => (
          <Pressable
            key={t.n}
            onPress={() => actions.go(t.target)}
            style={{ width: '47.5%', height: 92, borderRadius: 13, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, padding: 13, justifyContent: 'space-between' }}
          >
            <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1, color: color.cyan })}>{t.n}</Text>
            <View>
              <Text style={heading({ weight: 600, size: 14, lineHeight: 16 })}>{t.title}</Text>
              <Text style={[heading({ weight: 500, size: 10, color: color.textDim }), { marginTop: 5 }]}>{t.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 11, borderRadius: 13, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1, color: color.cyan })}>08</Text>
        <Text style={[heading({ weight: 600, size: 13 }), { flex: 1 }]}>References & manual library</Text>
        <Text style={mono({ weight: 500, size: 10, color: color.textDim })}>142 DOCS</Text>
      </View>

      {hasOpenSession && derived && (
        <>
          <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 22, marginBottom: 9 }]}>OPEN SESSION</Text>
          <Pressable
            onPress={() => actions.go('session')}
            style={{ borderRadius: 13, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.amberBorder32, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}
          >
            <View style={{ width: 6, height: 38, borderRadius: 3, backgroundColor: color.amber }} />
            <View style={{ flex: 1 }}>
              <Text style={mono({ weight: 500, size: 10, letterSpacing: 1, color: color.amber })}>{derived.tree.jobNo} · IN PROGRESS</Text>
              <Text style={[heading({ weight: 600, size: 14, lineHeight: 17 }), { marginTop: 6 }]}>{state.equipment.model} · {state.equipment.equipmentType}</Text>
              <Text style={[heading({ weight: 500, size: 11, color: color.textDim }), { marginTop: 4 }]}>{derived.tree.alarmText.replace('ALM: ', '')} · {derived.tree.siteName}</Text>
            </View>
            <Text style={heading({ weight: 600, size: 12, color: color.textDim })}>›</Text>
          </Pressable>
        </>
      )}

      <Pressable
        onPress={actions.openVoice}
        style={{ marginTop: 20, height: 52, borderRadius: 26, borderWidth: 1, borderColor: color.cyanBorder4, backgroundColor: color.cyanBg07, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        <Blip color={color.cyan} />
        <Text style={mono({ weight: 600, size: 12, letterSpacing: 1.4, color: color.cyan })}>VOICE MODE — HANDS FREE</Text>
      </Pressable>
    </ScrollView>
  );
}
