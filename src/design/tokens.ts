export const Colors = {
  // Primary
  primary: '#1A56DB',
  primaryDark: '#003FB1',
  onPrimary: '#FFFFFF',
  // Semantic — Balance
  success: '#065F46',
  successSurface: '#D1FAE5',
  danger: '#991B1B',
  dangerSurface: '#FEE2E2',
  // Neutral
  neutral: '#374151',
  neutralSurface: '#E5E7EB',
  // Surface layers
  surface: '#F9F9FF',
  surfaceCard: '#FFFFFF',
  surfaceContainerLow: '#EFF3FF',
  surfaceContainer: '#E6EEFF',
  surfaceContainerHigh: '#DEE9FD',
  // Text
  onSurface: '#121C2A',
  onSurfaceVariant: '#434654',
  outline: '#737686',
  outlineVariant: '#C3C5D7',
  // Error
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
} as const;

export const Typography = {
  displayBal: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.64,
    fontFamily: 'Inter_700Bold',
  },
  headlineLg: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 28,
  },
  headlineMd: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 24,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  labelCaps: {
    fontSize: 12,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.6,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  numericMd: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'] as any,
  },
} as const;

export const Spacing = {
  base: 8,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  containerPadding: 16,
  cardGap: 12,
  sectionMargin: 24,
} as const;

export const Radius = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
