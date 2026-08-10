import type { CSSProperties, ReactNode } from 'react';
import { color, font } from '../../theme';

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      style={{
        width: 34, height: 34, borderRadius: 9, background: color.card, border: `1px solid ${color.borderStrong}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: `600 15px/1 ${font.heading}`, color: color.textRow, flex: 'none', cursor: 'pointer',
      }}
    >
      ‹
    </button>
  );
}

export function ScreenHeader({ title, subtitle, onBack, trailing }: { title: string; subtitle?: string; onBack: () => void; trailing?: ReactNode }) {
  return (
    <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <BackButton onClick={onBack} />
      <div style={{ flex: 1 }}>
        <div style={{ font: `600 15px/1 ${font.heading}` }}>{title}</div>
        {subtitle && <div style={{ font: `500 11px/1.3 ${font.heading}`, color: color.textDim, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
}

export function SectionLabel({ children, style, color: c }: { children: ReactNode; style?: CSSProperties; color?: string }) {
  return (
    <div style={{ font: `600 9.5px/1 ${font.mono}`, color: c ?? color.textDim, letterSpacing: '.16em', ...style }}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, style, disabled }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 52, borderRadius: 12, background: color.amber, color: color.amberOn, border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: `700 12px/1 ${font.mono}`, letterSpacing: '.1em', cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1, width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 46, padding: '0 15px', borderRadius: 10, border: `1px solid ${color.borderStrong2}`, background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: `600 11px/1 ${font.mono}`, color: color.textRow, letterSpacing: '.08em', cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${color.border}`, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

export function Chip({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <div style={{ padding: '5px 8px', borderRadius: 6, background: bg, font: `500 9.5px/1 ${font.mono}`, color: fg }}>
      {text}
    </div>
  );
}

export function ProgressBar({ pct, trackColor = 'rgba(255,255,255,.07)', fillColor, height = 4 }: { pct: number; trackColor?: string; fillColor: string; height?: number }) {
  return (
    <div style={{ height, borderRadius: height / 2, background: trackColor, overflow: 'hidden' }}>
      <div style={{ height, borderRadius: height / 2, background: fillColor, width: `${pct}%` }} />
    </div>
  );
}
