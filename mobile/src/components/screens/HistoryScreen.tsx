import { ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

const PLANT = [
  { n: 'Chiller plant', s: '2 UNITS', indent: 14, dot: color.amber, colorText: color.text },
  { n: 'CH-1 · 30HXC-186', s: 'ALARM', indent: 30, dot: color.red, colorText: color.redSoft },
  { n: 'CH-2 · 30HXC-186', s: 'RUN', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'CT-1 cooling tower', s: 'RUN', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'CWP-1 / CWP-2', s: 'RUN / OFF', indent: 30, dot: color.green, colorText: color.textRow },
  { n: 'Boiler plant', s: '2 UNITS', indent: 14, dot: color.textDim, colorText: color.text },
  { n: 'AHU-1 … AHU-4', s: 'BAS', indent: 14, dot: color.textDim, colorText: color.textRow },
];

const HISTORY = [
  { d: '2026-03-11', tag: 'CLEARED', t: 'High discharge pressure', b: 'Approach 13.8 °F at design flow. Condenser tubes brush-cleaned; approach returned to 4.2 °F.' },
  { d: '2025-08-02', tag: 'CLEARED', t: 'High discharge pressure', b: 'Tower sump low, entering water 91 °F. Makeup valve rebuilt. No refrigerant work performed.' },
  { d: '2025-04-19', tag: 'PM', t: 'Annual maintenance', b: 'Baseline approach 3.1 °F recorded, oil analysis normal, no refrigerant added.' },
];

export function HistoryScreen({ actions }: { actions: HvacueActions }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Bay Tower" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18 }}>
        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginBottom: 10 }]}>PLANT TREE</Text>
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
          {PLANT.map((e, i) => (
            <View key={e.n} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingRight: 14, paddingLeft: e.indent, borderBottomWidth: i === PLANT.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: e.dot }} />
              <Text style={[heading({ weight: 500, size: 12.5, lineHeight: 15, color: e.colorText }), { flex: 1 }]}>{e.n}</Text>
              <Text style={mono({ weight: 500, size: 9.5, color: color.textDim })}>{e.s}</Text>
            </View>
          ))}
        </View>
        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 20, marginBottom: 10 }]}>CH-1 SERVICE HISTORY</Text>
        <View style={{ gap: 9 }}>
          {HISTORY.map((h) => (
            <View key={h.d} style={{ borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={mono({ weight: 500, size: 9.5, color: color.textDim })}>{h.d}</Text>
                <Text style={mono({ weight: 500, size: 9.5, color: color.green })}>{h.tag}</Text>
              </View>
              <Text style={[heading({ weight: 600, size: 13, lineHeight: 16 }), { marginTop: 8 }]}>{h.t}</Text>
              <Text style={[heading({ weight: 500, size: 11, lineHeight: 16, color: color.textMuted }), { marginTop: 6 }]}>{h.b}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: color.amberBg08, borderWidth: 1, borderColor: color.amberBorder30, padding: 14 }}>
          <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.4, color: color.amber })}>RECURRENCE DETECTED</Text>
          <Text style={[heading({ weight: 500, size: 12, lineHeight: 17, color: '#E0C79A' }), { marginTop: 8 }]}>
            Third high-discharge event in 14 months, each cleared by cleaning. Condenser approach is trending up between cleanings — look upstream at condenser-water treatment, not the chiller.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
