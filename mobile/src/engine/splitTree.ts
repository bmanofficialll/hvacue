import { hasPtTable, saturationTemp } from './ptTables';
import type { DiagnosticTree, Readings, Metrics } from './types';

const defs: DiagnosticTree['defs'] = {
  oat: {
    key: 'oat', label: 'Outdoor ambient', unit: '°F', lo: -20, hi: 130,
    expected: 'Everything on the condenser side scales with this.',
    why: { beginner: 'Condensing pressure is supposed to ride above outdoor air. I need the baseline before I call a pressure high.', tech: 'Baseline for condenser approach.' },
    how: 'Shaded dry-bulb reading near the unit, not in direct sun off the coil.',
    teach: 'A pressure that looks high on a 70° day is normal on a 100° day. Ambient first, always.',
  },
  rat: {
    key: 'rat', label: 'Return air DB', unit: '°F', lo: 40, hi: 110,
    expected: 'Typically 70–80 °F in the return plenum.',
    why: { beginner: 'Return and supply give the air-side split, and the split tells me whether the coil is doing work.', tech: 'Air ΔT baseline.' },
    how: 'In the return plenum ahead of the coil, away from any leaks pulling attic air.',
    teach: 'This is the air going in. Everything about the evaporator gets measured against it.',
  },
  sat: {
    key: 'sat', label: 'Supply air DB', unit: '°F', lo: 30, hi: 110,
    expected: 'Should land 16–22 °F below return at typical indoor humidity.',
    why: { beginner: 'A weak split with normal refrigerant numbers is an airflow story, not a charge story.', tech: 'Air ΔT vs refrigerant-side numbers.' },
    how: 'First supply takeoff past the coil, out of line-of-sight of the coil face.',
    teach: 'The split is your quickest honest read on capacity. Low split with high superheat is charge or restriction. Big split with low airflow is a coil about to freeze.',
  },
  sp: {
    key: 'sp', label: 'Suction pressure', unit: 'PSIG', lo: 20, hi: 250,
    expected: 'Compared against saturation for the refrigerant on the nameplate — pressure by itself proves nothing.',
    why: { beginner: 'Low suction has at least six causes. This is one input, not an answer.', tech: 'Evaporator saturation input.' },
    how: 'Suction service port with the system stabilized at least 15 minutes.',
    teach: 'Low suction does not mean add refrigerant. It can be low charge, a restriction, low airflow, low load, or the metering device. Superheat is what separates them.',
  },
  slt: {
    key: 'slt', label: 'Suction line temp', unit: '°F', lo: 0, hi: 140,
    expected: 'With suction pressure this gives superheat.',
    why: { beginner: 'Superheat is how I tell an underfed evaporator from an overfed one.', tech: 'Superheat calculation.' },
    how: 'Clamp probe 6 in from the service valve, insulated, on clean copper.',
    teach: 'Superheat is how many degrees the vapour picked up after the last drop of liquid boiled off. High means the coil is starved. Near zero means liquid is heading for your compressor.',
  },
  lp: {
    key: 'lp', label: 'Liquid pressure', unit: 'PSIG', lo: 80, hi: 700,
    expected: 'Converted to condensing temperature for approach and subcooling.',
    why: { beginner: 'With liquid line temperature this gives subcooling — the other half of the charge picture.', tech: 'Condensing saturation input.' },
    how: 'Liquid port at the condenser, same stabilized run.',
    teach: 'Superheat tells you about the evaporator. Subcooling tells you whether the condenser is actually making solid liquid. You need both before you touch the charge.',
  },
  llt: {
    key: 'llt', label: 'Liquid line temp', unit: '°F', lo: 20, hi: 180,
    expected: 'Subcooling of 8–12 °F is typical on a TXV system.',
    why: { beginner: 'Low subcooling with high superheat is undercharge. High subcooling with high superheat is a restriction. Same low suction, different repair.', tech: 'Subcooling calculation.' },
    how: 'Clamp probe on the liquid line at the condenser outlet, insulated.',
    teach: "Two systems can show the same low suction pressure. One needs refrigerant, the other needs a filter-drier. Subcooling is the number that tells them apart — that's why I won't skip it.",
  },
};

function metrics(readings: Readings, refrigerant: string): Metrics {
  const m: Metrics = {};
  if (readings.rat != null && readings.sat != null) m.airDt = readings.rat - readings.sat;
  if (readings.sp != null) {
    const s = saturationTemp(refrigerant, readings.sp);
    if (s != null) m.evapSat = s;
  }
  if (m.evapSat != null && readings.slt != null) m.sh = readings.slt - m.evapSat;
  if (readings.lp != null) {
    const c = saturationTemp(refrigerant, readings.lp);
    if (c != null) m.condT = c;
  }
  if (m.condT != null && readings.llt != null) m.sc = m.condT - readings.llt;
  if (m.condT != null && readings.oat != null) m.approach = m.condT - readings.oat;
  return m;
}

function weights(_readings: Readings, m: Metrics): Record<string, number> {
  const w = { charge: 18, restrict: 16, airflow: 18, meter: 14, over: 12, cond: 14, sensor: 6 };
  if (m.sh != null) {
    if (m.sh > 20) { w.charge += 38; w.restrict += 18; w.airflow -= 8; w.over -= 8; }
    else if (m.sh < 5) { w.over += 26; w.meter += 20; w.charge -= 14; w.airflow += 10; }
    else { w.charge -= 12; w.restrict -= 6; }
  }
  if (m.sc != null) {
    if (m.sc < 4) { w.charge += 30; w.restrict -= 12; w.over -= 8; }
    else if (m.sc > 15) { w.over += 24; w.restrict += 20; w.charge -= 14; }
    else { w.charge -= 12; }
  }
  if (m.sh != null && m.sc != null && m.sh > 18 && m.sc > 14) w.restrict += 30;
  if (m.airDt != null) {
    if (m.airDt > 22) { w.airflow += 32; }
    else if (m.airDt < 12) { w.airflow -= 6; w.charge += 8; }
    else { w.airflow -= 10; }
  }
  if (m.approach != null) {
    if (m.approach > 30) { w.cond += 30; }
    else if (m.approach < 22) { w.cond -= 10; }
  }
  return w;
}

function causeMeta(m: Metrics, readings: Readings) {
  const n = (x: number | undefined, d: number) => (x != null ? x.toFixed(d) : '—');
  return {
    charge: { name: 'Undercharge / refrigerant leak', why: 'Superheat ' + n(m.sh, 1) + ' °F with subcooling ' + n(m.sc, 1) + ' °F is the classic starved-coil signature. Find the leak — do not just top it off.' },
    restrict: { name: 'Liquid-line restriction', why: 'High superheat with subcooling holding at ' + n(m.sc, 1) + ' °F says the liquid is stacking up before the metering device. Filter-drier first.' },
    airflow: { name: 'Low evaporator airflow', why: 'Air split of ' + n(m.airDt, 1) + ' °F points at the air side. Filter, coil face, blower speed, or duct.' },
    meter: { name: 'Metering device / TXV', why: 'Superheat that will not respond the way charge and subcooling say it should. Check bulb mounting and contact before condemning the valve.' },
    over: { name: 'Overcharge or non-condensables', why: 'Low superheat with high subcooling floods the coil and risks liquid at the compressor. Recover to the specified charge, by weight.' },
    cond: { name: 'Dirty condenser / high approach', why: 'Condensing ' + n(m.condT, 0) + ' °F against ' + n(readings.oat, 0) + ' °F ambient is too much lift for the coil to be clean.' },
    sensor: { name: 'Instrument or probe error', why: 'One of these readings contradicts the others. Confirm the tool before you chase the system.' },
  };
}

function flags(readings: Readings, m: Metrics, refrigerant: string): string[] {
  const f: string[] = [];
  if (!hasPtTable(refrigerant)) {
    f.push('I do not have a verified pressure–temperature table cached for ' + refrigerant + ' on this device, so I will not convert suction or liquid pressure to a saturation temperature — I would be guessing. Pull the manufacturer PT chart for ' + refrigerant + ' and I will keep ranking on everything else.');
  }
  if (m.airDt != null && m.airDt < 0) f.push('Supply air warmer than return air. Either the probes are swapped or that coil is not cooling at all — verify before I rank anything.');
  if (m.sh != null && m.sh < 0) f.push('Negative superheat. Liquid is leaving the evaporator, or the suction probe is not making contact. Sort that out before adding or removing anything.');
  if (m.airDt != null && m.airDt > 30) f.push('A 30-plus degree air split is not a healthy reading — suspect very low airflow or a probe in the wrong place.');
  if (readings.sp != null && readings.oat != null && readings.sp > 180) f.push('Suction pressure that high on a call for no cooling usually means the compressor is not pumping. Verify it is running and loaded.');
  return f;
}

function derived(m: Metrics, refrigerant: string) {
  const out: ReturnType<DiagnosticTree['derived']> = [];
  if (m.airDt != null) out.push({ label: 'Air split', value: m.airDt.toFixed(1) + '°', tag: m.airDt > 22 ? 'WIDE — SUSPECT AIRFLOW' : m.airDt < 14 ? 'NARROW — LOW CAPACITY' : 'IN RANGE · 16–22 °F', bad: m.airDt > 22 || m.airDt < 14 });
  if (m.evapSat != null) out.push({ label: 'Evaporator saturation · ' + refrigerant, value: m.evapSat.toFixed(0) + '°', tag: 'FROM PT CHART', bad: false });
  if (m.sh != null) out.push({ label: 'Superheat', value: m.sh.toFixed(1) + '°', tag: m.sh > 20 ? 'HIGH — STARVED COIL' : m.sh < 5 ? 'LOW — FLOODING RISK' : 'IN RANGE', bad: m.sh > 20 || m.sh < 5 });
  if (m.sc != null) out.push({ label: 'Subcooling', value: m.sc.toFixed(1) + '°', tag: m.sc < 4 ? 'LOW' : m.sc > 15 ? 'HIGH — SUSPECT RESTRICTION' : 'IN RANGE · 8–12 °F', bad: m.sc < 4 || m.sc > 15 });
  if (m.approach != null) out.push({ label: 'Condenser lift over ambient', value: m.approach.toFixed(0) + '°', tag: m.approach > 30 ? 'HIGH' : 'NORMAL', bad: m.approach > 30 });
  return out;
}

function badChannel(id: string, _readings: Readings, m: Metrics): boolean {
  if (id === 'sat') return m.airDt != null && m.airDt < 0;
  if (id === 'slt') return m.sh != null && m.sh < 0;
  if (id === 'sp') return m.airDt != null ? false : !!(_readings.sp != null && _readings.oat != null && _readings.sp > 180);
  return false;
}

const handsOnTests: DiagnosticTree['handsOnTests'] = {
  charge: { title: 'Leak search before any refrigerant goes in', teach: 'Topping off a leak is a callback with a date on it. Find it, fix it, weigh the charge in.', rows: [
    ['WHY', 'The numbers say starved coil, and a system that leaked once will leak again.'],
    ['HOW', 'Electronic detector on the coil, service valves, line set and brazed joints; bubbles on anything suspect. Then weigh in to nameplate.'],
    ['EXPECTED', 'A findable leak on an aging system.'],
    ['IF NORMAL', 'No leak found — recheck for a restriction before adding refrigerant.'],
    ['IF ABNORMAL', 'Repair, evacuate, weigh in the specified charge, then verify superheat and subcooling.'],
  ] },
  restrict: { title: 'Temperature drop across the filter-drier', teach: 'A restriction starves the evaporator the same way a low charge does. The difference is the subcooling, which stacks up behind the blockage.', rows: [
    ['WHY', 'High superheat with subcooling holding is the restriction signature, not an undercharge.'],
    ['HOW', 'Clamp probes each side of the drier, or feel for a temperature difference and sweating on the outlet.'],
    ['EXPECTED', 'Almost no temperature drop across a healthy drier.'],
    ['IF NORMAL', 'Look further downstream — the metering device is next.'],
    ['IF ABNORMAL', 'Replace the drier, then recheck superheat and subcooling before deciding on charge.'],
  ] },
  airflow: { title: 'Measure static pressure across the air handler', teach: 'Low airflow drags suction pressure down and mimics a low charge. Adding refrigerant to a dirty coil freezes it.', rows: [
    ['WHY', 'The air split says the air side is the limiting factor.'],
    ['HOW', 'Static pressure taps before and after the coil, filter drop separately, then compare total external static to the blower table.'],
    ['EXPECTED', 'Total external static at or below the rated value for the selected speed.'],
    ['IF NORMAL', 'Airflow is fine — back to the refrigerant side.'],
    ['IF ABNORMAL', 'Filter, coil face, blower speed, duct restriction — in that order.'],
  ] },
  meter: { title: 'Check TXV bulb mounting and response', teach: 'Most valves condemned in the field were only badly mounted bulbs.', rows: [
    ['WHY', 'Charge and subcooling say the valve should be feeding more than it is.'],
    ['HOW', 'Verify bulb position and contact, insulation, then watch superheat respond to a load change.'],
    ['EXPECTED', 'Superheat settling toward the valve setting as load changes.'],
    ['IF NORMAL', 'Valve is doing its job — re-examine airflow and load.'],
    ['IF ABNORMAL', 'Correct the bulb first. Replace the valve only if it still will not respond.'],
  ] },
  over: { title: 'Recover to specified charge, by weight', teach: 'Low superheat with high subcooling floods the coil and risks slugging the compressor — this is not a "let a little out" fix.', rows: [
    ['WHY', 'Low superheat with high subcooling points at overcharge or non-condensables, not a starved coil.'],
    ['HOW', 'Recover the full charge, evacuate to spec, weigh in the nameplate charge from empty.'],
    ['EXPECTED', 'Superheat and subcooling both settle into range once charge is exact.'],
    ['IF NORMAL', 'Charge was the cause — verify with a final reading.'],
    ['IF ABNORMAL', 'Non-condensables in the system — evacuate deeper and recheck for air ingress.'],
  ] },
  cond: { title: 'Condenser coil and fan check', teach: 'A dirty condenser raises head pressure, cuts capacity and shortens compressor life — and it looks like an overcharge on the gauges.', rows: [
    ['WHY', 'Condensing temperature is riding too far above ambient for a clean coil.'],
    ['HOW', 'Inspect the coil both sides, verify fan rotation, speed and blade condition, check for recirculation around the unit.'],
    ['EXPECTED', 'Condensing temperature roughly 20–30 °F over ambient on this equipment class.'],
    ['IF NORMAL', 'Coil is clear — reconsider charge and non-condensables.'],
    ['IF ABNORMAL', 'Wash the coil properly, then re-read every channel before judging charge.'],
  ] },
  sensor: { title: 'Cross-check the gauge set against a second instrument', teach: 'Confirm the instrument before you chase the system. A bad probe reads exactly like a real fault.', rows: [
    ['WHY', 'Your readings disagree with each other, so an instrument is a live suspect.'],
    ['HOW', 'Second calibrated gauge or clamp probe on the same point, compare directly.'],
    ['EXPECTED', 'Agreement within instrument tolerance.'],
    ['IF NORMAL', 'Readings are real — continue on the system side.'],
    ['IF ABNORMAL', 'Replace or recalibrate, then re-evaluate before any mechanical work.'],
  ] },
};

function verify(vSp: number, readings: Readings, refrigerant: string): ReturnType<DiagnosticTree['verify']> {
  const evapSat = saturationTemp(refrigerant, vSp);
  const sh = evapSat != null && readings.slt != null ? readings.slt - evapSat : null;
  if (sh == null) {
    return {
      tag: 'RECORDED · NOT VERIFIED', status: 'recorded-unverified',
      line: 'Final suction pressure ' + vSp + ' PSIG recorded. ' + (evapSat == null ? 'No verified PT table for ' + refrigerant + ' on this device, so I will not estimate the saturation conversion.' : 'I need a matching suction line temperature before I can call superheat restored.'),
      reportLine: 'Final pressure recorded but superheat could not be computed from verified data — this job should not be closed as verified.',
    };
  }
  if (sh >= 5 && sh <= 20) {
    return {
      tag: 'VERIFIED · SUPERHEAT RESTORED', status: 'verified',
      line: 'Suction pressure ' + vSp + ' PSIG → evaporator saturation ' + evapSat!.toFixed(0) + ' °F, superheat ' + sh.toFixed(1) + ' °F at the same conditions — back inside the normal band.',
      reportLine: 'Final suction pressure ' + vSp + ' PSIG at matched conditions; superheat ' + sh.toFixed(1) + ' °F, within the normal band. Complaint → diagnosis → repair → verification documented.',
    };
  }
  return {
    tag: 'NOT VERIFIED · STILL OUT OF RANGE', status: 'failed',
    line: 'Suction pressure ' + vSp + ' PSIG → evaporator saturation ' + evapSat!.toFixed(0) + ' °F, superheat ' + sh.toFixed(1) + ' °F. That is still ' + (sh > 20 ? 'far above' : 'below') + ' the normal band, so the root cause was not addressed. Go back to the ranking with this new data.',
    reportLine: 'Final suction pressure ' + vSp + ' PSIG; superheat ' + sh.toFixed(1) + ' °F — still out of range. Repair performed did not correct the root cause; job left open.',
  };
}

export const splitTree: DiagnosticTree = {
  id: 'split',
  order: ['oat', 'rat', 'sat', 'sp', 'slt', 'lp', 'llt'],
  defs,
  verifyId: 'sp',
  verifyExpectedText: 'Superheat and subcooling both back in range with a normal air split.',
  defaultCauseKey: 'charge',
  repairOptions: ['Found and repaired leak, weighed in charge', 'Replaced restricted filter-drier', 'Cleaned evaporator coil, restored airflow', 'Replaced TXV'],
  alarmText: 'ALM: NO COOLING · RUNS BUT WARM',
  alarmSource: 'CUSTOMER REPORT',
  jobNo: 'JOB #10517',
  siteName: 'Ridge Lane',
  complaintText: 'Customer reports the system runs continuously but never gets the space cold — supply air feels barely cool.',
  metrics,
  weights,
  causeMeta,
  flags,
  derived,
  badChannel,
  handsOnTests,
  verify,
};
