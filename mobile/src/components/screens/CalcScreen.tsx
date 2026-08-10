import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { CALCULATORS } from '../../engine/calculators';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { ScreenHeader } from '../ui/primitives';

export function CalcScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const calc = CALCULATORS.find((c) => c.id === state.activeCalc) ?? CALCULATORS[0];
  const values = state.calcValues[calc.id] ?? {};
  const result = calc.compute(values);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Calculators" subtitle="Pick a tool, tap a value to edit" onBack={() => actions.go('home')} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 18, paddingBottom: 4 }}>
        {CALCULATORS.map((c) => {
          const on = c.id === calc.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => actions.selectCalc(c.id)}
              style={{ paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, backgroundColor: on ? color.amber : color.card, borderWidth: 1, borderColor: on ? color.amber : color.borderStrong }}
            >
              <Text style={heading({ weight: 600, size: 11, color: on ? color.amberOn : color.text })}>{c.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
        <View style={{ borderRadius: 14, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 18, alignItems: 'center' }}>
          <Text style={[mono({ weight: 600, size: 9.5, lineHeight: 15, letterSpacing: 1.2, color: color.textDim }), { textAlign: 'center' }]}>{calc.formula}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
            <Text style={mono({ weight: 600, size: 44, color: color.amber })}>{result.value}</Text>
            <Text style={mono({ weight: 600, size: 14, color: color.textDim })}>{result.unit}</Text>
          </View>
          {result.note && <Text style={[heading({ weight: 500, size: 10.5, lineHeight: 16, color: color.textMuted }), { marginTop: 12, textAlign: 'center' }]}>{result.note}</Text>}
        </View>

        <View style={{ marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
          {calc.inputs.map((inp, i) => (
            <Pressable
              key={inp.key}
              onPress={() => actions.openKeypad(`calc:${calc.id}:${inp.key}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: i === calc.inputs.length - 1 ? 0 : 1, borderColor: color.borderSoft }}
            >
              <Text style={[heading({ weight: 500, size: 12, color: color.textRow }), { flex: 1 }]}>{inp.label}</Text>
              <Text style={mono({ weight: 600, size: 16, color: color.text })}>{values[inp.key]}</Text>
              <Text style={[mono({ weight: 500, size: 10, color: color.textDim }), { minWidth: 44, textAlign: 'right' }]}>{inp.unit}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[mono({ weight: 500, size: 10, lineHeight: 16, color: color.textDimmer }), { marginTop: 12 }]}>
          {calc.sub.toUpperCase()} · FIELD ESTIMATE — VERIFY AGAINST MANUFACTURER DATA BEFORE ACTING.
        </Text>
      </View>
    </ScrollView>
  );
}
