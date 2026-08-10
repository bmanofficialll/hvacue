// Pressure (PSIG) -> saturation temperature (°F) tables.
// Only refrigerants with a verified table are cached — everything else must
// come from the manufacturer PT chart, so the engine refuses to guess.
export const PT_TABLES: Record<string, [number, number][]> = {
  'R-134a': [[71.2, 70], [86.8, 80], [104.3, 90], [124.2, 100], [146.4, 110], [171.2, 120], [198.7, 130], [229.2, 140]],
  'R-410A': [[42.5, 10], [58.8, 20], [78.3, 30], [101.6, 40], [129.2, 50], [161.5, 60], [199.0, 70], [242.1, 80], [291.4, 90], [347.4, 100], [410.7, 110], [482.0, 120]],
  'R-404A': [[24.3, 0], [45.5, 20], [75.0, 40], [114.5, 60], [166.4, 80], [232.7, 100], [315.9, 120]],
  'R-22': [[24.0, 0], [43.0, 20], [68.5, 40], [102.5, 60], [144.0, 80], [195.9, 100], [259.9, 120]],
};

export function hasPtTable(refrigerant: string): boolean {
  return !!PT_TABLES[refrigerant];
}

export function saturationTemp(refrigerant: string, psig: number): number | null {
  const t = PT_TABLES[refrigerant];
  if (!t) return null;
  if (psig <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    if (psig <= t[i][0]) {
      const [p0, t0] = t[i - 1];
      const [p1, t1] = t[i];
      return t0 + ((psig - p0) * (t1 - t0)) / (p1 - p0);
    }
  }
  return t[t.length - 1][1];
}
