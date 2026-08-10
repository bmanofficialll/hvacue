export type Readings = Record<string, number | undefined>;
export type Metrics = Record<string, number | undefined>;

export interface ChannelDef {
  key: string;
  label: string;
  unit: string;
  lo: number;
  hi: number;
  expected: string;
  why: { beginner: string; tech: string };
  how: string;
  teach: string;
}

export interface CauseInfo {
  name: string;
  why: string;
}

export interface HandsOnTest {
  title: string;
  rows: [string, string][];
  teach: string;
}

export interface DerivedItem {
  label: string;
  value: string;
  tag: string;
  bad: boolean;
}

export interface VerifyResult {
  tag: string;
  line: string;
  reportLine: string;
  status: 'pending' | 'recorded-unverified' | 'verified' | 'failed';
}

export interface Equipment {
  manufacturer: string;
  model: string;
  serial: string;
  equipmentType: string;
  capacityTons: number;
  refrigerant: string;
  meteringDevice: string;
  compressor: string;
  circuits: number;
  voltage: string;
  phase: string;
}

export interface DiagnosticTree {
  id: string;
  /** Short label for the equipment/alarm context shown in headers. */
  order: string[];
  defs: Record<string, ChannelDef>;
  verifyId: string;
  verifyExpectedText: string;
  defaultCauseKey: string;
  repairOptions: string[];
  alarmText: string;
  alarmSource: string;
  jobNo: string;
  siteName: string;
  complaintText: string;

  metrics(readings: Readings, refrigerant: string): Metrics;
  weights(readings: Readings, metrics: Metrics): Record<string, number>;
  causeMeta(metrics: Metrics, readings: Readings): Record<string, CauseInfo>;
  flags(readings: Readings, metrics: Metrics, refrigerant: string, equipment: Equipment): string[];
  derived(metrics: Metrics, refrigerant: string): DerivedItem[];
  badChannel(id: string, readings: Readings, metrics: Metrics): boolean;
  handsOnTests: Record<string, HandsOnTest>;
  verify(verifyValue: number, readings: Readings, refrigerant: string): VerifyResult;
}
