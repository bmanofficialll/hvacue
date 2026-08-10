import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { color, heading, mono } from '../../theme';
import { hasPtTable } from '../../engine/ptTables';
import {
  COMPRESSORS, EQUIPMENT_TYPES, MANUFACTURERS, METERING_DEVICES, PHASES, REFRIGERANTS, VOLTAGES, usesSplitTree,
} from '../../engine/equipment';
import type { Equipment } from '../../engine/types';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, PrimaryButton, SectionLabel } from '../ui/primitives';

function fieldLabel(text: string) {
  return <Text style={[mono({ weight: 500, size: 10, letterSpacing: 0.8, color: color.textDim }), { marginBottom: 7 }]}>{text.toUpperCase()}</Text>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <View>
      {fieldLabel(label)}
      <View style={{ borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, overflow: 'hidden' }}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
          style={{ color: color.text, height: Platform.OS === 'ios' ? 120 : 46 }}
          itemStyle={{ color: color.text, fontSize: 17 }}
          dropdownIconColor={color.textDim}
        >
          {options.map((o) => <Picker.Item key={o} label={o} value={o} color={Platform.OS === 'android' ? color.text : undefined} />)}
        </Picker>
      </View>
    </View>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View>
      {fieldLabel(label)}
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor={color.textDimmer}
        onChangeText={onChange}
        style={[heading({ weight: 600, size: 13, color: color.text }), {
          height: 46, borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, paddingHorizontal: 12,
        }]}
      />
    </View>
  );
}

function NumberField({ label, value, onChange, unit, min, max }: { label: string; value: number; onChange: (v: number) => void; unit: string; min: number; max: number }) {
  return (
    <View>
      {fieldLabel(label + (unit ? ' · ' + unit : ''))}
      <TextInput
        value={String(value)}
        keyboardType="number-pad"
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          else if (t === '') onChange(min);
        }}
        style={[mono({ weight: 600, size: 13, color: color.text }), {
          height: 46, borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, paddingHorizontal: 12,
        }]}
      />
    </View>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22, gap: 14 }}>
      <SectionLabel style={{ marginBottom: -2 }}>{title}</SectionLabel>
      {children}
    </View>
  );
}

export function EquipmentSetupScreen({ state, actions }: { state: AppState; actions: HvacueActions }) {
  const [draft, setDraft] = useState<Equipment>(state.equipment);
  const [symptom, setSymptom] = useState(state.symptom);
  const patch = (p: Partial<Equipment>) => setDraft((d) => ({ ...d, ...p }));

  const willUseSplitFlow = usesSplitTree(draft);
  const willUseGenericChiller = !willUseSplitFlow && draft.equipmentType.toLowerCase().indexOf('chiller') < 0;
  const ptMissing = !hasPtTable(draft.refrigerant);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BackButton onPress={() => actions.go(state.equipmentConfirmed ? state.setupReturnScreen : 'home')} />
        <View style={{ flex: 1 }}>
          <Text style={heading({ weight: 600, size: 15 })}>Equipment profile</Text>
          <Text style={[heading({ weight: 500, size: 11, lineHeight: 15, color: color.textDim }), { marginTop: 4 }]}>
            Tell me what I'm diagnosing before we start pulling readings.
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 22 }}>
        <FieldGroup title="REPORTED PROBLEM">
          <View>
            <Text style={[mono({ weight: 500, size: 10, letterSpacing: 0.8, color: color.textDim }), { marginBottom: 7 }]}>WHAT'S THE CALL? (TYPE THE ALARM OR COMPLAINT)</Text>
            <TextInput
              value={symptom}
              onChangeText={setSymptom}
              placeholder="e.g. No cooling, runs but warm · or an alarm like HI PRESS"
              placeholderTextColor={color.textDimmer}
              multiline
              style={[heading({ weight: 500, size: 13, color: color.text }), { minHeight: 60, borderRadius: 10, backgroundColor: color.card, borderWidth: 1, borderColor: color.borderStrong, padding: 12, textAlignVertical: 'top' }]}
            />
          </View>
        </FieldGroup>

        <FieldGroup title="EQUIPMENT">
          <SelectField label="Manufacturer" value={draft.manufacturer} options={MANUFACTURERS} onChange={(v) => patch({ manufacturer: v })} />
          <TextField label="Model" value={draft.model} onChange={(v) => patch({ model: v })} placeholder="e.g. 30HXC-186" />
          <TextField label="Serial" value={draft.serial} onChange={(v) => patch({ serial: v })} placeholder="Optional" />
          <SelectField label="Equipment type" value={draft.equipmentType} options={EQUIPMENT_TYPES} onChange={(v) => patch({ equipmentType: v })} />
          <NumberField label="Capacity" value={draft.capacityTons} onChange={(v) => patch({ capacityTons: v })} unit="TONS" min={1} max={2000} />
        </FieldGroup>

        <FieldGroup title="REFRIGERANT CIRCUIT">
          <SelectField label="Refrigerant" value={draft.refrigerant} options={REFRIGERANTS} onChange={(v) => patch({ refrigerant: v })} />
          <SelectField label="Metering device" value={draft.meteringDevice} options={METERING_DEVICES} onChange={(v) => patch({ meteringDevice: v })} />
          <SelectField label="Compressor" value={draft.compressor} options={COMPRESSORS} onChange={(v) => patch({ compressor: v })} />
          <NumberField label="Circuits" value={draft.circuits} onChange={(v) => patch({ circuits: v })} unit="" min={1} max={4} />
        </FieldGroup>

        <FieldGroup title="ELECTRICAL">
          <SelectField label="Voltage" value={draft.voltage} options={VOLTAGES} onChange={(v) => patch({ voltage: v })} />
          <SelectField label="Phase" value={draft.phase} options={PHASES} onChange={(v) => patch({ phase: v })} />
        </FieldGroup>

        {(willUseSplitFlow || willUseGenericChiller || ptMissing || draft.manufacturer === 'Generic / unknown') && (
          <View style={{ marginTop: 18, borderRadius: 12, backgroundColor: color.cardAlt, borderWidth: 1, borderColor: color.border, padding: 13 }}>
            <SectionLabel>WHAT THIS DRIVES</SectionLabel>
            <Text style={[heading({ weight: 500, size: 11.5, lineHeight: 17, color: color.textMuted }), { marginTop: 8 }]}>
              {willUseSplitFlow && 'This runs the R-410A/R-454B split-system sequence — outdoor ambient, air split, superheat and subcooling. '}
              {willUseGenericChiller && 'The built-in decision tree is a water-cooled chiller sequence — I will flag the condenser-water steps as generic for this equipment type. '}
              {ptMissing && `I don't have a verified pressure–temperature table cached for ${draft.refrigerant} — I will refuse the saturation conversion and tell you to pull the manufacturer PT chart. `}
              {draft.manufacturer === 'Generic / unknown' && 'With no manufacturer selected, every procedure will be flagged generic, not brand-specific.'}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 22 }}>
          <PrimaryButton onPress={() => actions.confirmEquipment(draft, symptom)}>CONFIRM & DIAGNOSE</PrimaryButton>
        </View>
      </ScrollView>
    </View>
  );
}
