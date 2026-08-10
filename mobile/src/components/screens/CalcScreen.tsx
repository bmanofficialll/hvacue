import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

const GLYCOL_CONSTANT = 485;

const OTHER_CALCS = [
  ['Superheat', 'PT + line temp'],
  ['Subcooling', 'Liquid line'],
  ['Pump head', 'Curve solver'],
  ['Static pressure', 'ESP + drops'],
  ['Duct sizing', 'Velocity method'],
  ['Three-phase kW', 'V · A · PF · √3'],
];

export function CalcScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const gpm = state.calc.dt > 0 ? state.calc.btu / (GLYCOL_CONSTANT * state.calc.dt) : 0;
  const fields: { label: string; value: string; unit: string; onEdit: () => void }[] = [
    { label: 'Load', value: state.calc.btu.toLocaleString('en-US'), unit: 'BTU/HR', onEdit: () => actions.openKeypad('calc_btu') },
    { label: 'Design ΔT', value: String(state.calc.dt), unit: '°F', onEdit: () => actions.openKeypad('calc_dt') },
    { label: 'Fluid', value: '30% PG', unit: '', onEdit: () => {} },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Hydronic flow" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ borderRadius: 14, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 18, alignItems: 'center' }}>
          <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim })}>GPM = BTU/HR ÷ (500 × ΔT)</Text>
          <Text style={[mono({ weight: 600, size: 46, color: color.amber }), { marginTop: 16 }]}>{gpm.toFixed(1)}</Text>
          <Text style={[mono({ weight: 500, size: 11, letterSpacing: 1.4, color: color.textDim }), { marginTop: 9 }]}>GALLONS PER MINUTE</Text>
        </View>
        <View style={{ marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
          {fields.map((f, i) => (
            <Pressable
              key={f.label}
              onPress={f.onEdit}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i === fields.length - 1 ? 0 : 1, borderColor: color.borderSoft }}
            >
              <Text style={[heading({ weight: 500, size: 12, color: color.textRow }), { flex: 1 }]}>{f.label}</Text>
              <Text style={mono({ weight: 600, size: 16, color: color.text })}>{f.value}</Text>
              <Text style={[mono({ weight: 500, size: 10, color: color.textDim }), { width: 36, textAlign: 'right' }]}>{f.unit}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[mono({ weight: 500, size: 10.5, lineHeight: 16, color: color.textDimmer }), { marginTop: 12 }]}>
          FLUID: 30% PROPYLENE GLYCOL — 500 CONSTANT REPLACED WITH FLUID-CORRECTED VALUE. WATER MODE AVAILABLE.
        </Text>
        <Text style={[mono({ weight: 600, size: 9.5, letterSpacing: 1.6, color: color.textDim }), { marginTop: 22, marginBottom: 10 }]}>OTHER CALCULATORS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {OTHER_CALCS.map(([n, s]) => (
            <View key={n} style={{ width: '47.5%', height: 58, borderRadius: 11, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, padding: 12, justifyContent: 'space-between' }}>
              <Text style={heading({ weight: 600, size: 12, lineHeight: 14 })}>{n}</Text>
              <Text style={mono({ weight: 500, size: 9.5, color: color.textDim })}>{s}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
