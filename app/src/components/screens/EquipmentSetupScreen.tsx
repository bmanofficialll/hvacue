import { useState } from 'react';
import { color, font } from '../../theme';
import { hasPtTable } from '../../engine/ptTables';
import {
  COMPRESSORS, EQUIPMENT_TYPES, MANUFACTURERS, METERING_DEVICES, PHASES, REFRIGERANTS, VOLTAGES, usesSplitTree,
} from '../../engine/equipment';
import type { Equipment } from '../../engine/types';
import type { AppState } from '../../state/types';
import type { HvacueActions } from '../../state/useHvacueState';
import { BackButton, PrimaryButton, SectionLabel } from '../ui/primitives';

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em', marginBottom: 7 }}>{label.toUpperCase()}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`,
          color: color.text, font: `600 13px/1 ${font.heading}`, padding: '0 12px', appearance: 'none',
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em', marginBottom: 7 }}>{label.toUpperCase()}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`,
          color: color.text, font: `600 13px/1 ${font.heading}`, padding: '0 12px',
        }}
      />
    </label>
  );
}

function NumberField({ label, value, onChange, unit, min, max }: { label: string; value: number; onChange: (v: number) => void; unit: string; min: number; max: number }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em', marginBottom: 7 }}>{label.toUpperCase()} · {unit}</div>
      <input
        type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 46, borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`,
          color: color.text, font: `600 13px/1 ${font.mono}`, padding: '0 12px',
        }}
      />
    </label>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22 }}>
      <SectionLabel style={{ marginBottom: 12 }}>{title}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
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
    <div style={{ flex: 1, overflow: 'auto', padding: '32px 0 40px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton onClick={() => actions.go(state.equipmentConfirmed ? state.setupReturnScreen : 'home')} />
        <div style={{ flex: 1 }}>
          <div style={{ font: `600 15px/1 ${font.heading}` }}>Equipment profile</div>
          <div style={{ font: `500 11px/1.3 ${font.heading}`, color: color.textDim, marginTop: 4 }}>Tell me what I'm diagnosing before we start pulling readings.</div>
        </div>
      </div>

      <div style={{ padding: '0 18px', flex: 1 }}>
        <FieldGroup title="REPORTED PROBLEM">
          <div>
            <div style={{ font: `500 10px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.08em', marginBottom: 7 }}>WHAT'S THE CALL? (TYPE THE ALARM OR COMPLAINT)</div>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g. No cooling, runs but warm · or a controller alarm like HI PRESS"
              rows={2}
              style={{ width: '100%', borderRadius: 10, background: color.card, border: `1px solid ${color.borderStrong}`, color: color.text, font: `500 13px/1.4 ${font.heading}`, padding: 12, resize: 'vertical' }}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="EQUIPMENT">
          <Select label="Manufacturer" value={draft.manufacturer} options={MANUFACTURERS} onChange={(v) => patch({ manufacturer: v })} />
          <TextField label="Model" value={draft.model} onChange={(v) => patch({ model: v })} placeholder="e.g. 30HXC-186" />
          <TextField label="Serial" value={draft.serial} onChange={(v) => patch({ serial: v })} placeholder="Optional" />
          <Select label="Equipment type" value={draft.equipmentType} options={EQUIPMENT_TYPES} onChange={(v) => patch({ equipmentType: v })} />
          <NumberField label="Capacity" value={draft.capacityTons} onChange={(v) => patch({ capacityTons: v })} unit="TONS" min={1} max={2000} />
        </FieldGroup>

        <FieldGroup title="REFRIGERANT CIRCUIT">
          <Select label="Refrigerant" value={draft.refrigerant} options={REFRIGERANTS} onChange={(v) => patch({ refrigerant: v })} />
          <Select label="Metering device" value={draft.meteringDevice} options={METERING_DEVICES} onChange={(v) => patch({ meteringDevice: v })} />
          <Select label="Compressor" value={draft.compressor} options={COMPRESSORS} onChange={(v) => patch({ compressor: v })} />
          <NumberField label="Circuits" value={draft.circuits} onChange={(v) => patch({ circuits: v })} unit="" min={1} max={4} />
        </FieldGroup>

        <FieldGroup title="ELECTRICAL">
          <Select label="Voltage" value={draft.voltage} options={VOLTAGES} onChange={(v) => patch({ voltage: v })} />
          <Select label="Phase" value={draft.phase} options={PHASES} onChange={(v) => patch({ phase: v })} />
        </FieldGroup>

        {(willUseSplitFlow || willUseGenericChiller || ptMissing || draft.manufacturer === 'Generic / unknown') && (
          <div style={{ marginTop: 18, borderRadius: 12, background: color.cardAlt, border: `1px solid ${color.border}`, padding: 13 }}>
            <div style={{ font: `600 9.5px/1 ${font.mono}`, color: color.textDim, letterSpacing: '.14em' }}>WHAT THIS DRIVES</div>
            <div style={{ font: `500 11.5px/1.55 ${font.heading}`, color: color.textMuted, marginTop: 8 }}>
              {willUseSplitFlow && 'This runs the R-410A/R-454B split-system sequence — outdoor ambient, air split, superheat and subcooling. '}
              {willUseGenericChiller && 'The built-in decision tree is a water-cooled chiller sequence — I will flag the condenser-water steps as generic for this equipment type. '}
              {ptMissing && `I don't have a verified pressure–temperature table cached for ${draft.refrigerant} — I will refuse the saturation conversion and tell you to pull the manufacturer PT chart. `}
              {draft.manufacturer === 'Generic / unknown' && 'With no manufacturer selected, every procedure will be flagged generic, not brand-specific.'}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '22px 18px 0' }}>
        <PrimaryButton onClick={() => actions.confirmEquipment(draft, symptom)}>CONFIRM &amp; DIAGNOSE</PrimaryButton>
      </div>
    </div>
  );
}
