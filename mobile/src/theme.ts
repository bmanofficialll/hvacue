// Design tokens for the "dark instrument" aesthetic — ported from the web app's theme.ts.
export const color = {
  appBg: '#0A0C0E',
  text: '#E8EBED',
  textDim: '#7E888F',
  textDimmer: '#4F585E',
  textFaint: '#5F696F',
  textMuted: '#8B959C',
  textBody: '#CDD4D8',
  textRow: '#B9C1C6',

  card: '#15191D',
  cardAlt: '#12171B',
  cardFlush: '#101418',
  sheet: '#111518',
  chipBg: '#1B2126',

  border: 'rgba(255,255,255,.08)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderMed: 'rgba(255,255,255,.07)',
  borderStrong: 'rgba(255,255,255,.09)',
  borderStrong2: 'rgba(255,255,255,.14)',
  borderDashed: 'rgba(255,255,255,.16)',

  amber: '#FFB020',
  amberHi: '#FFC85E',
  amberSoft: '#FFC04A',
  amberOn: '#171203',
  amberBorder30: 'rgba(255,176,32,.3)',
  amberBorder32: 'rgba(255,176,32,.32)',
  amberBorder35: 'rgba(255,176,32,.35)',
  amberBg07: 'rgba(255,176,32,.07)',
  amberBg08: 'rgba(255,176,32,.08)',
  amberBg12: 'rgba(255,176,32,.12)',

  cyan: '#4FD1E0',
  cyanOn: '#08181B',
  cyanBorder: 'rgba(79,209,224,.35)',
  cyanBorder25: 'rgba(79,209,224,.25)',
  cyanBorder28: 'rgba(79,209,224,.28)',
  cyanBorder4: 'rgba(79,209,224,.4)',
  cyanBorder55: 'rgba(79,209,224,.55)',
  cyanBg07: 'rgba(79,209,224,.07)',
  cyanBg08: 'rgba(79,209,224,.08)',
  cyanBg1: 'rgba(79,209,224,.1)',

  red: '#FF5A47',
  redSoft: '#FF8A7A',
  redSofter: '#FFC2B8',
  redBorder35: 'rgba(255,90,71,.35)',
  redBorder4: 'rgba(255,90,71,.4)',
  redBorder5: 'rgba(255,90,71,.5)',
  redBg09: 'rgba(255,90,71,.09)',
  redBg12: 'rgba(255,90,71,.12)',

  green: '#4ADE9A',
  greenBorder4: 'rgba(74,222,154,.4)',
  greenBorder35: 'rgba(74,222,154,.35)',
  greenBg08: 'rgba(74,222,154,.08)',
} as const;

type Weight = 400 | 500 | 600 | 700;

const ARCHIVO: Record<Weight, string> = {
  400: 'Archivo_400Regular',
  500: 'Archivo_500Medium',
  600: 'Archivo_600SemiBold',
  700: 'Archivo_700Bold',
};

const MONO: Record<Weight, string> = {
  400: 'IBMPlexMono_400Regular',
  500: 'IBMPlexMono_500Medium',
  600: 'IBMPlexMono_600SemiBold',
  700: 'IBMPlexMono_600SemiBold', // no bold weight loaded — fall back to semibold
};

export interface TextStyleOpts {
  weight?: Weight;
  size: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
}

/** Archivo text style — the app's heading/body face. */
export function heading(opts: TextStyleOpts) {
  return {
    fontFamily: ARCHIVO[opts.weight ?? 400],
    fontSize: opts.size,
    lineHeight: opts.lineHeight ?? Math.round(opts.size * 1.2),
    letterSpacing: opts.letterSpacing,
    color: opts.color,
  };
}

/** IBM Plex Mono text style — used for labels, tags, numeric readouts. */
export function mono(opts: TextStyleOpts) {
  return {
    fontFamily: MONO[opts.weight ?? 400],
    fontSize: opts.size,
    lineHeight: opts.lineHeight ?? Math.round(opts.size * 1.2),
    letterSpacing: opts.letterSpacing,
    color: opts.color,
  };
}

export const fontAssets = {
  Archivo_400Regular: require('@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf'),
  Archivo_500Medium: require('@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf'),
  Archivo_600SemiBold: require('@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf'),
  Archivo_700Bold: require('@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf'),
  IBMPlexMono_400Regular: require('@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf'),
  IBMPlexMono_500Medium: require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf'),
  IBMPlexMono_600SemiBold: require('@expo-google-fonts/ibm-plex-mono/600SemiBold/IBMPlexMono_600SemiBold.ttf'),
};
