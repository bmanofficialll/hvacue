import { color, font } from '../../theme';
import { deriveSession } from '../../state/derive';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, PrimaryButton } from '../ui/primitives';
import type { VerifyResult } from '../../engine/types';

const DEFAULT_VERIFY: Pick<VerifyResult, 'tag' | 'line'> & { bg: string; border: string; color: string } = {
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

  const vf = verify
    ? { tag: verify.tag, line: verify.line, ...verifyStyle(verify.status) }
    : DEFAULT_VERIFY;

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
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px' }}>
      <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => actions.go('session')} />
        <div style={{ font: `600 15px/1 ${font.heading}`, flex: 1 }}>Service report</div>
      </div>
      <div style={{ padding: '0 18px' }}>
        <div style={{ borderRadius: 12, background: vf.bg, border: `1px solid ${vf.border}`, padding: 15 }}>
          <div style={{ font: `600 9.5px/1 ${font.mono}`, color: vf.color, letterSpacing: '.14em' }}>{vf.tag}</div>
          <div style={{ font: `600 15px/1.3 ${font.heading}`, marginTop: 9 }}>{vf.line}</div>
          {verify?.status === 'failed' && (
            <div
              onClick={actions.backToRanking}
              style={{ marginTop: 13, height: 44, borderRadius: 10, border: `1px solid ${color.redBorder5}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: color.redSoft, letterSpacing: '.1em', cursor: 'pointer' }}
            >
              BACK TO RANKED CAUSES
            </div>
          )}
        </div>
        <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${color.border}`, overflow: 'hidden' }}>
          {report.map(([k, v], i) => (
            <div key={k} style={{ padding: '13px 14px', borderBottom: i === report.length - 1 ? 'none' : `1px solid ${color.borderSoft}` }}>
              <div style={{ font: `600 9px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.14em' }}>{k}</div>
              <div style={{ font: `500 12.5px/1.5 ${font.heading}`, color: color.textBody, marginTop: 7 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
          <PrimaryButton style={{ height: 50 }}>EXPORT PDF</PrimaryButton>
          <div style={{ width: 88, height: 50, borderRadius: 11, border: `1px solid ${color.borderStrong2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: color.textRow, cursor: 'pointer' }}>
            EMAIL
          </div>
        </div>
        <div
          onClick={() => actions.go('home')}
          style={{ marginTop: 10, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 11px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.1em', cursor: 'pointer' }}
        >
          CLOSE {tree.jobNo}
        </div>
      </div>
    </div>
  );
}
