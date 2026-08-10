import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import type { HvacueActions } from '../../state/useHvacueState';
import { ProgressBar, ScreenHeader } from '../ui/primitives';

const SKILLS = [
  { n: 'Refrigeration fundamentals', p: 92, c: color.green },
  { n: 'Chiller diagnostics', p: 78, c: color.green },
  { n: 'Electrical troubleshooting', p: 64, c: color.amber },
  { n: 'Controls & BAS', p: 55, c: color.amber },
  { n: 'Airside / ductwork', p: 47, c: color.amber },
  { n: 'VRF', p: 22, c: color.red },
];

export function TrainingScreen({ actions }: { actions: HvacueActions }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader title="Skill map" onBack={() => actions.go('home')} />
      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 16 }}>
          {SKILLS.map((s) => (
            <View key={s.n} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={heading({ weight: 500, size: 12, color: color.textBody })}>{s.n}</Text>
                <Text style={mono({ weight: 600, size: 12, color: s.c })}>{s.p}%</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <ProgressBar pct={s.p} fillColor={s.c} height={5} />
              </View>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 14, borderRadius: 12, backgroundColor: color.card, borderWidth: 1, borderColor: color.border, padding: 15 }}>
          <Text style={heading({ weight: 600, size: 14 })}>Weakest area: VRF</Text>
          <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>
            Level 7 covers branch controllers, addressing and EEV faults — and manufacturer procedures are not interchangeable here.
          </Text>
          <Pressable style={{ marginTop: 14, height: 48, borderRadius: 11, backgroundColor: color.cyan, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 700, size: 11.5, letterSpacing: 1, color: color.cyanOn })}>GIVE ME A SERVICE CALL</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
