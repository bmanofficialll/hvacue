import { Pressable, ScrollView, Text, View } from 'react-native';
import { color, heading, mono } from '../../theme';
import { deriveSession } from '../../state/derive';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, PrimaryButton } from '../ui/primitives';
import type { VerifyResult } from '../../engine/types';

const DEFAULT_VERIFY = {
  tag: 'VERIFICATION PENDING', line: 'Log the final reading to close this job.',
  color: color.textMuted, bg: color.cardAlt, border: color.border,
};

function verifyStyle(status: VerifyResult['status'] | undefined) {
  switch (status) {
    case 'verified': return { color: color.green, bg: color.greenBg08, border: color.greenBorder35 };
    case 'recorded-unverified': return { color: color.amber, bg: color.amberBg08, border: color.amberBorder35 };
    case 'failed': return { color: color.red, bg: color.redBg09, border: color.redBorder35 };
    default: return { color: DEFAULT_VERIFY.color, bg: DEFAULT_VERIFY.bg, border: DEFAULT_VERIFY.border };
  }
}

export function ReportScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const d = deriveSession(state);
  const { tree, readings, causes, verify } = d;
  const E = state.equipment;

  const vf = verify ? { tag: verify.tag, line: verify.line, ...verifyStyle(verify.status) } : DEFAULT_VERIFY;

  const measurementsText = tree.order
    .filter((k) => readings[k] != null)
    .map((k) => tree.defs[k].label + ' ' + readings[k] + ' ' + tree.defs[k].unit)
    .join(' · ') || '—';

  const derivedText = d.derivedMetrics.map((m) => m.label + ' ' + m.value).join(' · ') || '—';

  const report: [string, string][] = [
    ['EQUIPMENT', E.manufacturer + ' ' + E.model + ' ' + E.equipmentType.toLowerCase() + ', S/N ' + (E.serial || 'unrecorded') + ', ' + E.refrigerant + ', ' + E.capacityTons + ' tons, ' + E.voltage + '/' + E.phase + ', ' + E.meteringDevice + ' metering — ' + tree.siteName + '.'],
    ['COMPLAINT', d.symptom || tree.complaintText],
    ['MEASUREMENTS', measurementsText],
    ['DERIVED', derivedText],
    ['ROOT CAUSE', causes[0] ? causes[0].name + ' — ' + causes[0].pct + '% at close of diagnosis. ' + causes[0].why : '—'],
    ['REPAIR', state.repair || '—'],
    ['VERIFICATION', verify ? verify.reportLine : 'Pending final readings.'],
    ['SOURCES', 'Manufacturer literature for code meaning and design approach; industry guideline for typical ranges; PT table for saturation; remaining reasoning inferred by HVACue from this session’s measurements.'],
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => actions.go('session')} />
        <Text style={[heading({ weight: 600, size: 15 }), { flex: 1 }]}>Service report</Text>
      </View>
      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ borderRadius: 12, backgroundColor: vf.bg, borderWidth: 1, borderColor: vf.border, padding: 15 }}>
          <Text style={mono({ weight: 600, size: 9.5, letterSpacing: 1.4, color: vf.color })}>{vf.tag}</Text>
          <Text style={[heading({ weight: 600, size: 15, lineHeight: 19 }), { marginTop: 9 }]}>{vf.line}</Text>
          {verify?.status === 'failed' && (
            <Pressable
              onPress={actions.backToRanking}
              style={{ marginTop: 13, height: 44, borderRadius: 10, borderWidth: 1, borderColor: color.redBorder5, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={mono({ weight: 600, size: 11, letterSpacing: 1, color: color.redSoft })}>BACK TO RANKED CAUSES</Text>
            </Pressable>
          )}
        </View>
        <View style={{ marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: color.border, overflow: 'hidden' }}>
          {report.map(([k, v], i) => (
            <View key={k} style={{ padding: 14, borderBottomWidth: i === report.length - 1 ? 0 : 1, borderColor: color.borderSoft }}>
              <Text style={mono({ weight: 600, size: 9, letterSpacing: 1.4, color: color.textDim })}>{k}</Text>
              <Text style={[heading({ weight: 500, size: 12.5, lineHeight: 18, color: color.textBody }), { marginTop: 7 }]}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 9, marginTop: 16 }}>
          <PrimaryButton style={{ flex: 1, height: 50 }}>EXPORT PDF</PrimaryButton>
          <View style={{ width: 88, height: 50, borderRadius: 11, borderWidth: 1, borderColor: color.borderStrong2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={mono({ weight: 600, size: 11, color: color.textRow })}>EMAIL</Text>
          </View>
        </View>
        <Pressable
          onPress={() => actions.go('home')}
          style={{ marginTop: 10, height: 46, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={mono({ weight: 600, size: 11, letterSpacing: 1, color: color.textDim })}>CLOSE {tree.jobNo}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
