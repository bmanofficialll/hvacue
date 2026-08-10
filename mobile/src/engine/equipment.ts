import type { Equipment } from './types';

export const MANUFACTURERS = [
  'Carrier', 'Trane', 'York', 'Daikin', 'Mitsubishi Electric', 'Lennox', 'Goodman', 'Rheem', 'Ruud',
  'LG', 'Samsung', 'Fujitsu', 'Bosch', 'Bryant', 'Payne', 'Amana', 'Bard', 'AAON', 'Johnson Controls',
  'Nortek', 'Tempstar', 'Heil', 'Comfortmaker', 'Gree', 'Midea', 'Panasonic', 'Hitachi', 'Toshiba',
  'ClimateMaster', 'WaterFurnace', 'Friedrich', 'Reznor', 'Modine', 'Copeland', 'Generic / unknown',
];

export const EQUIPMENT_TYPES = [
  'Water-cooled chiller', 'Air-cooled chiller', 'Rooftop unit', 'Split system', 'Mini-split / ductless',
  'Heat pump', 'Packaged unit', 'Walk-in refrigeration', 'Reach-in refrigeration', 'Ice machine',
  'VRF outdoor unit', 'Condensing boiler', 'Furnace', 'Air handler', 'Make-up air unit',
];

export const REFRIGERANTS = [
  'R-134a', 'R-410A', 'R-404A', 'R-22', 'R-407C', 'R-454B', 'R-32', 'R-448A', 'R-449A', 'R-452A',
  'R-513A', 'R-1234yf', 'R-1234ze', 'R-290', 'R-600a', 'R-744 (CO₂)', 'R-717 (NH₃)', 'R-407A',
  'R-455A', 'R-12', 'R-502', 'R-123', 'R-514A',
];

export const METERING_DEVICES = ['EEV', 'TXV', 'Fixed orifice', 'Capillary', 'Float', 'Balanced port TXV', 'Hand expansion valve'];
export const COMPRESSORS = ['Scroll', 'Screw', 'Reciprocating', 'Centrifugal', 'Rotary', 'Digital scroll', 'Variable-speed / inverter'];
export const VOLTAGES = ['115 V', '120 V', '208 V', '230 V', '240 V', '277 V', '460 V', '480 V', '575 V'];
export const PHASES = ['1Ø', '3Ø'];

export const DEFAULT_EQUIPMENT: Equipment = {
  manufacturer: 'Goodman',
  model: '30HXC-186',
  serial: '',
  equipmentType: 'Split system',
  capacityTons: 4,
  refrigerant: 'R-454B',
  meteringDevice: 'TXV',
  compressor: 'Scroll',
  circuits: 1,
  voltage: '230 V',
  phase: '1Ø',
};

export function usesSplitTree(equipment: Equipment): boolean {
  const t = equipment.equipmentType;
  return t === 'Split system' || t === 'Mini-split / ductless' || t === 'Heat pump' || t === 'Packaged unit' || t === 'Rooftop unit';
}

export function usesGenericChillerSequence(equipment: Equipment): boolean {
  return equipment.equipmentType.toLowerCase().indexOf('chiller') < 0 && !usesSplitTree(equipment);
}
