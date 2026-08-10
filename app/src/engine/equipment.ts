import type { Equipment } from './types';

export const MANUFACTURERS = ['Carrier', 'Trane', 'York', 'Daikin', 'Mitsubishi', 'Lennox', 'Goodman', 'Rheem', 'LG', 'Generic / unknown'];
export const EQUIPMENT_TYPES = ['Water-cooled chiller', 'Air-cooled chiller', 'Rooftop unit', 'Split system', 'Heat pump', 'Walk-in refrigeration', 'VRF outdoor unit', 'Condensing boiler'];
export const REFRIGERANTS = ['R-134a', 'R-410A', 'R-404A', 'R-22', 'R-454B', 'R-32', 'R-448A', 'R-290'];
export const METERING_DEVICES = ['EEV', 'TXV', 'Fixed orifice', 'Capillary', 'Float'];
export const COMPRESSORS = ['Scroll', 'Screw', 'Reciprocating', 'Centrifugal', 'Rotary'];
export const VOLTAGES = ['120 V', '208 V', '230 V', '240 V', '277 V', '460 V', '480 V'];
export const PHASES = ['1Ø', '3Ø'];

export const DEFAULT_EQUIPMENT: Equipment = {
  manufacturer: 'Goodman',
  model: '30HXC-186',
  serial: '',
  equipmentType: 'Split system',
  capacityTons: 186,
  refrigerant: 'R-454B',
  meteringDevice: 'TXV',
  compressor: 'Scroll',
  circuits: 2,
  voltage: '230 V',
  phase: '1Ø',
};

export function usesSplitTree(equipment: Equipment): boolean {
  return equipment.equipmentType === 'Split system';
}

export function usesGenericChillerSequence(equipment: Equipment): boolean {
  return equipment.equipmentType.toLowerCase().indexOf('chiller') < 0 && !usesSplitTree(equipment);
}
