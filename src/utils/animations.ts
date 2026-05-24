/**
 * src/utils/animations.ts
 * Reusable animation presets for PayTrace.
 * All animations use the native Animated API with `useNativeDriver: true`
 * for 60 fps GPU-accelerated rendering.
 */
import { Animated, Easing } from 'react-native';

// ─── Timing presets ──────────────────────────────────────────────────────────

/** Standard fast micro-animation (100 ms). */
export const DURATION_FAST = 100;
/** Standard medium animation (220 ms). */
export const DURATION_MEDIUM = 220;
/** Standard slow animation (380 ms). */
export const DURATION_SLOW = 380;

// ─── Easing presets ──────────────────────────────────────────────────────────

export const EASE_OUT_CUBIC = Easing.out(Easing.cubic);
export const EASE_IN_OUT_CUBIC = Easing.inOut(Easing.cubic);
export const EASE_SPRING = Easing.elastic(0.9);

// ─── Fade helpers ─────────────────────────────────────────────────────────────

/**
 * Fade an animated value to `toValue`.
 * Returns the Animated.CompositeAnimation so the caller can `.start()` / chain.
 */
export function fade(
  value: Animated.Value,
  toValue: number,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASE_OUT_CUBIC,
    useNativeDriver: true,
  });
}

/** Convenience: fade in from 0 → 1. */
export function fadeIn(
  value: Animated.Value,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return fade(value, 1, duration);
}

/** Convenience: fade out from current → 0. */
export function fadeOut(
  value: Animated.Value,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return fade(value, 0, duration);
}

// ─── Slide helpers ────────────────────────────────────────────────────────────

/**
 * Slide a translateY/X animated value.
 * Typically used with `useNativeDriver: true`.
 */
export function slide(
  value: Animated.Value,
  toValue: number,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: EASE_OUT_CUBIC,
    useNativeDriver: true,
  });
}

// ─── Scale helpers ────────────────────────────────────────────────────────────

/**
 * Spring-scale into view from `from` → 1.
 * Great for card entrance / modal pop-in.
 */
export function scaleIn(
  value: Animated.Value,
  from = 0.85,
): Animated.CompositeAnimation {
  value.setValue(from);
  return Animated.spring(value, {
    toValue: 1,
    tension: 80,
    friction: 9,
    useNativeDriver: true,
  });
}

/**
 * Spring-scale out 1 → `to`.
 */
export function scaleOut(
  value: Animated.Value,
  to = 0.9,
  duration = DURATION_FAST,
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue: to,
    duration,
    easing: EASE_OUT_CUBIC,
    useNativeDriver: true,
  });
}

// ─── Staggered list entrance ──────────────────────────────────────────────────

/**
 * Stagger a list of {opacity, translateY} animated values for list items.
 * Each item slides up from `offsetY` while fading in, staggered by `delayStep` ms.
 *
 * @param items     Array of { opacity, translateY } refs per list item
 * @param offsetY   Starting vertical offset (default 24 px)
 * @param delayStep Delay between each item (default 50 ms)
 */
export function staggerList(
  items: Array<{ opacity: Animated.Value; translateY: Animated.Value }>,
  offsetY = 24,
  delayStep = 50,
): Animated.CompositeAnimation {
  const animations = items.map(({ opacity, translateY }, i) => {
    opacity.setValue(0);
    translateY.setValue(offsetY);
    return Animated.delay(
      i * delayStep,
    );
    // real animations follow:
  });

  // Build properly: each item → parallel(fade in + slide up), all staggered
  const realAnims = items.map(({ opacity, translateY }, i) => {
    opacity.setValue(0);
    translateY.setValue(offsetY);
    return Animated.sequence([
      Animated.delay(i * delayStep),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: DURATION_MEDIUM,
          easing: EASE_OUT_CUBIC,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: DURATION_MEDIUM,
          easing: EASE_OUT_CUBIC,
          useNativeDriver: true,
        }),
      ]),
    ]);
  });

  return Animated.parallel(realAnims);
}

// ─── Press feedback ───────────────────────────────────────────────────────────

/**
 * Tactile press-in / press-out scale animation pair.
 * Usage:
 *   const scale = useRef(new Animated.Value(1)).current;
 *   <Animated.View style={{ transform: [{ scale }] }}>
 *     <TouchableWithoutFeedback
 *       onPressIn={() => pressIn(scale).start()}
 *       onPressOut={() => pressOut(scale).start()}
 *     >
 */
export function pressIn(
  scale: Animated.Value,
  toValue = 0.95,
  duration = DURATION_FAST,
): Animated.CompositeAnimation {
  return Animated.timing(scale, {
    toValue,
    duration,
    easing: EASE_OUT_CUBIC,
    useNativeDriver: true,
  });
}

export function pressOut(
  scale: Animated.Value,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return Animated.spring(scale, {
    toValue: 1,
    tension: 120,
    friction: 8,
    useNativeDriver: true,
  });
}

// ─── Shake (validation error) ─────────────────────────────────────────────────

/**
 * Horizontal shake animation — call on form validation failure.
 * @param translateX  Animated.Value initialized to 0
 */
export function shake(translateX: Animated.Value): Animated.CompositeAnimation {
  translateX.setValue(0);
  return Animated.sequence([
    Animated.timing(translateX, { toValue: -8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    Animated.timing(translateX, { toValue: 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    Animated.timing(translateX, { toValue: -6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    Animated.timing(translateX, { toValue: 6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    Animated.timing(translateX, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
  ]);
}

// ─── Bottom sheet slide ───────────────────────────────────────────────────────

/**
 * Slide a bottom sheet translateY from off-screen to 0.
 * @param translateY  Animated.Value (initial value = sheetHeight)
 */
export function slideSheetIn(
  translateY: Animated.Value,
  duration = DURATION_SLOW,
): Animated.CompositeAnimation {
  return Animated.timing(translateY, {
    toValue: 0,
    duration,
    easing: EASE_OUT_CUBIC,
    useNativeDriver: true,
  });
}

export function slideSheetOut(
  translateY: Animated.Value,
  sheetHeight: number,
  duration = DURATION_MEDIUM,
): Animated.CompositeAnimation {
  return Animated.timing(translateY, {
    toValue: sheetHeight,
    duration,
    easing: EASE_IN_OUT_CUBIC,
    useNativeDriver: true,
  });
}
