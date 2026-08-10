import { hasPtTable, saturationTemp } from './ptTables';
import type { DiagnosticTree, Readings, Metrics, Equipment } from './types';

const defs: DiagnosticTree['defs'] = {
  ecwt: {
    key: 'ecwt', label: 'Entering condenser water', unit: '°F', lo: 35, hi: 105,
    expected: 'Tower water is typically 65–85 °F depending on wet-bulb.',
    why: {
      beginner: 'Everything on the condenser side is judged against the water coming in. Without it, a high pressure reading means nothing.',
      tech: 'Baseline for approach and tower performance.',
    },
    how: 'Read the controller ECW sensor, then confirm with a clamp probe on the entering pipe.',
    teach: 'The chiller rejects heat into this water. If the water arriving is already hot, the refrigerant has to condense at a higher temperature — and pressure follows temperature. So we start here before touching the refrigerant circuit.',
  },
  lcwt: {
    key: 'lcwt', label: 'Leaving condenser water', unit: '°F', lo: 35, hi: 125,
    expected: '8–12 °F above entering at design flow and full load.',
    why: {
      beginner: 'Entering and leaving together give condenser ΔT, which tells us whether water is moving through the barrel.',
      tech: 'ΔT separates a flow problem from a heat-transfer problem.',
    },
    how: 'Same sensor pair, leaving side. Take both within a minute of each other at steady load.',
    teach: 'Water carries heat away. If only a little water flows, each gallon picks up more heat and ΔT climbs. If plenty of water flows but pressure is still high, the heat is not getting into the water at all — that is fouling or non-condensables.',
  },
  gpm: {
    key: 'gpm', label: 'Condenser water flow', unit: 'GPM', lo: 0, hi: 2500,
    expected: 'Design for this machine is about 1200 GPM.',
    why: {
      beginner: 'ΔT is only a clue. Actual flow confirms it, so we do not clean clean tubes.',
      tech: 'Confirms the ΔT inference before committing to a cause.',
    },
    how: 'Read the plant flow meter, or take pump differential pressure and read GPM off the pump curve.',
    teach: 'A high ΔT can come from low flow or from high load. Measuring flow removes the ambiguity — this is the "test before you replace" step.',
  },
  dp: {
    key: 'dp', label: 'Discharge pressure', unit: 'PSIG', lo: 40, hi: 320,
    expected: 'Compared against saturation for the refrigerant on the nameplate, not a memorized number.',
    why: {
      beginner: 'Converted to saturation temperature, this gives condensing temperature — the number that actually matters.',
      tech: 'Condensing temp vs LCWT = approach.',
    },
    how: 'Read the controller transducer. Verify against a calibrated gauge on the discharge service port before trusting it.',
    teach: 'Pressure by itself is not a diagnosis. Convert it to the temperature the refrigerant is condensing at, then compare that to the leaving water. The gap between them is the approach, and the approach is what tells you the condenser is dirty.',
  },
  amps: {
    key: 'amps', label: 'Compressor A current', unit: 'A', lo: 0, hi: 700,
    expected: 'Should rise with lift; compare to nameplate RLA.',
    why: {
      beginner: 'High current confirms the compressor really is working against high head, rather than a bad transducer reading.',
      tech: 'Corroborates real lift vs sensor error.',
    },
    how: 'Clamp each leg at the starter. Note phase imbalance while you are there.',
    teach: 'If pressure reads high but the compressor draws normal current, the machine may not actually be under high head — suspect the pressure sensor before condemning the condenser.',
  },
};

function metrics(readings: Readings, refrigerant: string): Metrics {
  const m: Metrics = {};
  if (readings.ecwt != null && readings.lcwt != null) m.dt = readings.lcwt - readings.ecwt;
  if (readings.dp != null) {
    const c = saturationTemp(refrigerant, readings.dp);
    if (c != null) m.condT = c;
  }
  if (m.condT != null && readings.lcwt != null) m.approach = m.condT - readings.lcwt;
  return m;
}

function weights(readings: Readings, m: Metrics): Record<string, number> {
  const w = { flow: 20, foul: 20, ncg: 14, over: 14, tower: 12, sensor: 10 };
  if (m.dt != null) {
    if (m.dt > 13) { w.flow += 46; w.foul -= 4; }
    else if (m.dt < 7) { w.flow -= 14; w.foul += 6; w.over += 4; }
    else { w.flow -= 12; w.foul += 6; }
  }
  if (readings.ecwt != null && readings.ecwt > 87) w.tower += 34;
  if (readings.gpm != null) {
    if (readings.gpm < 950) w.flow += 42;
    else { w.flow -= 26; w.foul += 12; w.ncg += 8; }
  }
  if (m.approach != null) {
    if (m.approach > 12) { w.foul += 40; w.ncg += 22; w.sensor -= 4; }
    else if (m.approach > 7) { w.foul += 18; w.ncg += 8; }
    else { w.foul -= 16; w.ncg -= 8; w.over += 6; w.sensor += 10; }
  }
  if (readings.amps != null) {
    if (readings.amps > 380) w.sensor -= 8;
    else if (readings.dp != null && readings.dp > 170) w.sensor += 30;
  }
  return w;
}

function causeMeta(m: Metrics) {
  return {
    flow: { name: 'Low condenser-water flow', why: 'Condenser ΔT of ' + (m.dt != null ? m.dt.toFixed(0) + ' °F' : 'unknown') + ' against a design 10 °F points at water side, not refrigerant side. Strainer, valve position, or pump.' },
    foul: { name: 'Fouled condenser tubes', why: 'Approach of ' + (m.approach != null ? m.approach.toFixed(1) + ' °F' : 'unknown') + ' with adequate flow means heat is not crossing the tube wall. Scale, biofilm, or mud.' },
    ncg: { name: 'Non-condensables in condenser', why: 'Air or nitrogen raises condensing pressure above saturation for the water temperature. Purge history and a standing pressure test separate this from fouling.' },
    over: { name: 'Refrigerant overcharge', why: 'Excess charge floods condenser surface and raises head. Only credible after flow and fouling are cleared, and requires charge records.' },
    tower: { name: 'Cooling tower / high entering water', why: 'Entering water above design shifts the whole circuit up. Tower fan, sump level, fill condition, wet-bulb — the chiller may be a victim here.' },
    sensor: { name: 'Pressure transducer or control fault', why: 'A reading that disagrees with compressor current and water temperatures may be the sensor, not the system. Verify against a calibrated gauge before any repair.' },
  };
}

function flags(readings: Readings, m: Metrics, refrigerant: string, equipment: Equipment): string[] {
  const f: string[] = [];
  if (!hasPtTable(refrigerant)) {
    f.push('I do not have a verified pressure–temperature table cached for ' + refrigerant + ' on this device, so I will not convert your discharge pressure to a saturation temperature — I would be guessing. Pull the manufacturer PT chart for ' + refrigerant + ' and I will keep ranking on everything else.');
  }
  if (equipment.equipmentType.toLowerCase().indexOf('chiller') < 0) {
    f.push('This session was built around a water-cooled chiller sequence. You have identified a ' + equipment.equipmentType.toLowerCase() + ', so treat the condenser-water steps as generic until the ' + equipment.manufacturer + ' procedure for this equipment is loaded.');
  }
  if (m.dt != null && m.dt < 0) f.push('Leaving condenser water reads colder than entering. On a running chiller that is not physically possible — verify probe placement or sensor calibration before I use these numbers.');
  if (m.approach != null && m.approach < 0) f.push('Discharge pressure converts to a condensing temperature below the leaving water temperature. One of the two is wrong; check the transducer against a calibrated gauge.');
  if (readings.dp != null && readings.dp > 260) f.push('That discharge pressure is above the relief setting for this machine — confirm the gauge and confirm the machine is actually running.');
  if (readings.amps != null && readings.dp != null && readings.amps < 120 && readings.dp > 170) f.push('High head with low compressor current is contradictory. Confirm which compressor is running and re-read current on all three legs.');
  return f;
}

function derived(m: Metrics, refrigerant: string) {
  const out: ReturnType<DiagnosticTree['derived']> = [];
  if (m.dt != null) out.push({ label: 'Condenser ΔT', value: m.dt.toFixed(1) + '°', tag: m.dt > 13 ? 'ABOVE DESIGN' : m.dt < 7 ? 'BELOW DESIGN' : 'IN RANGE', bad: m.dt > 13 || m.dt < 7 });
  if (m.condT != null) out.push({ label: 'Condensing temp · ' + refrigerant, value: m.condT.toFixed(0) + '°', tag: 'FROM PT CHART', bad: false });
  if (m.approach != null) out.push({ label: 'Condenser approach', value: m.approach.toFixed(1) + '°', tag: m.approach > 12 ? 'FAR HIGH' : m.approach > 7 ? 'HIGH' : 'NORMAL', bad: m.approach > 7 });
  return out;
}

function badChannel(id: string, readings: Readings, m: Metrics): boolean {
  if (id === 'lcwt') return m.dt != null && m.dt < 0;
  if (id === 'dp') return (m.approach != null && m.approach < 0) || (readings.dp != null && readings.dp > 260);
  return false;
}

const handsOnTests: DiagnosticTree['handsOnTests'] = {
  flow: { title: 'Prove condenser-water flow at the pump', teach: 'The pump curve turns two pressure readings into a flow number without a flow meter.', rows: [
    ['WHY', 'Flow is the top-ranked cause from your ΔT and meter reading. Confirm it before opening the condenser.'],
    ['HOW', 'Take pump suction and discharge pressure, convert to head, read GPM off the curve. Then check strainer differential and isolation valve position.'],
    ['EXPECTED', 'Head and GPM on the curve near design; strainer drop under a few PSI.'],
    ['IF NORMAL', 'Flow is fine — I move fouling to the top and we look at tube condition.'],
    ['IF ABNORMAL', 'Clean strainer, verify valve, check pump impeller and rotation.'],
  ] },
  foul: { title: 'Assess condenser tube condition', teach: 'Approach is the condenser report card: refrigerant condensing temperature minus leaving water temperature.', rows: [
    ['WHY', 'Flow is adequate and approach is high — heat is not crossing the tube wall.'],
    ['HOW', 'Log approach at steady load, then pull heads and inspect or borescope the tubes. Compare against the approach recorded at the last cleaning.'],
    ['EXPECTED', 'Approach within about 2 °F of the post-cleaning baseline.'],
    ['IF NORMAL', 'Tubes are clean — test for non-condensables next.'],
    ['IF ABNORMAL', 'Brush or chemically clean, then re-baseline approach and look at water treatment.'],
  ] },
  ncg: { title: 'Standing pressure test for non-condensables', teach: 'Air does not condense, so it takes up condenser volume and adds its own partial pressure on top of the refrigerant.', rows: [
    ['WHY', 'Pressure sits above saturation for the water temperature with clean tubes and good flow.'],
    ['HOW', 'Shut down, let refrigerant equalize to condenser water temperature, compare standing pressure to the saturation value for that temperature.'],
    ['EXPECTED', 'Standing pressure equals saturation for the measured temperature.'],
    ['IF NORMAL', 'No air present — reconsider charge and controls.'],
    ['IF ABNORMAL', 'Purge, then find the leak or service practice that let air in.'],
  ] },
  tower: { title: 'Verify tower capacity and wet-bulb approach', teach: 'A chiller alarm frequently originates outside the chiller. Diagnose the plant, not the box.', rows: [
    ['WHY', 'Entering condenser water is above design — the chiller may be reacting to a tower problem.'],
    ['HOW', 'Measure outdoor wet-bulb, compare to entering water; verify fan operation and speed, sump level, spray distribution, fill and basin condition.'],
    ['EXPECTED', 'Tower approach to wet-bulb near design, typically single digits.'],
    ['IF NORMAL', 'Tower is fine — return to the condenser side.'],
    ['IF ABNORMAL', 'Correct tower capacity first; do not chase the chiller.'],
  ] },
  over: { title: 'Review charge records before adjusting charge', teach: 'Never adjust charge from pressure alone on a chiller — use the manufacturer method.', rows: [
    ['WHY', 'Overcharge is only credible once flow, fouling and air are cleared.'],
    ['HOW', 'Pull charge history and refrigerant added on past calls; verify level in the sight glass at the manufacturer condition.'],
    ['EXPECTED', 'Charge matching nameplate and documented additions.'],
    ['IF NORMAL', 'Charge is not the cause.'],
    ['IF ABNORMAL', 'Recover to the specified charge and weigh what you remove.'],
  ] },
  sensor: { title: 'Verify the transducer against a calibrated gauge', teach: 'Confirm the instrument before condemning the machine — a bad sensor can look exactly like a bad condenser.', rows: [
    ['WHY', 'Your readings disagree with each other, so the sensor is a live suspect.'],
    ['HOW', 'Install a calibrated gauge on the discharge port, compare to the controller value at steady state.'],
    ['EXPECTED', 'Agreement within the controller tolerance.'],
    ['IF NORMAL', 'Sensor is good — the pressure is real; continue on the system side.'],
    ['IF ABNORMAL', 'Replace or recalibrate the transducer and re-evaluate before any mechanical work.'],
  ] },
};

function verify(vDp: number, readings: Readings, refrigerant: string): ReturnType<DiagnosticTree['verify']> {
  const cT = saturationTemp(refrigerant, vDp);
  const ap = cT != null && readings.lcwt != null ? cT - readings.lcwt : null;
  if (ap == null) {
    return {
      tag: 'RECORDED · NOT VERIFIED', status: 'recorded-unverified',
      line: 'Final discharge pressure ' + vDp + ' PSIG recorded. ' + (cT == null ? 'No verified PT table for ' + refrigerant + ' on this device, so I will not estimate the saturation conversion.' : 'I need a matching leaving-water temperature before I can call the approach restored.'),
      reportLine: 'Final pressure recorded but the approach could not be computed from verified data — this job should not be closed as verified.',
    };
  }
  if (ap <= 7) {
    return {
      tag: 'VERIFIED · APPROACH RESTORED', status: 'verified',
      line: 'Discharge pressure ' + vDp + ' PSIG → condensing ' + cT!.toFixed(0) + ' °F, approach ' + ap.toFixed(1) + ' °F at the same entering water — back inside the normal band.',
      reportLine: 'Final discharge pressure ' + vDp + ' PSIG at matched entering water; approach ' + ap.toFixed(1) + ' °F, within the normal band. Problem → diagnosis → repair → verification documented.',
    };
  }
  return {
    tag: 'NOT VERIFIED · STILL OUT OF RANGE', status: 'failed',
    line: 'Discharge pressure ' + vDp + ' PSIG → condensing ' + cT!.toFixed(0) + ' °F, approach ' + ap.toFixed(1) + ' °F. That is still ' + (ap > 12 ? 'far above' : 'above') + ' the normal band, so the root cause was not addressed. Go back to the ranking with this new data.',
    reportLine: 'Final discharge pressure ' + vDp + ' PSIG; approach ' + ap.toFixed(1) + ' °F — still out of range. Repair performed did not correct the root cause; job left open.',
  };
}

export const chillerTree: DiagnosticTree = {
  id: 'chiller',
  order: ['ecwt', 'lcwt', 'gpm', 'dp', 'amps'],
  defs,
  verifyId: 'dp',
  verifyExpectedText: 'Approach back under about 5 °F at design flow.',
  defaultCauseKey: 'foul',
  repairOptions: ['Cleaned condenser tubes', 'Purged non-condensables', 'Cleared strainer / restored flow', 'Replaced discharge transducer'],
  alarmText: 'ALM: HI DISCH PRESS',
  alarmSource: 'IOM p.42',
  jobNo: 'JOB #10482',
  siteName: 'Bay Tower',
  complaintText: 'Machine tripping on high discharge pressure, repeated lockouts through the afternoon peak.',
  metrics,
  weights,
  causeMeta,
  flags,
  derived,
  badChannel,
  handsOnTests,
  verify,
};
