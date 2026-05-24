import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../design/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.7, 0],
  });

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.dragIndicatorContainer}>
            <View style={styles.dragIndicator} />
          </View>
          {title && (
            <View style={styles.header}>
              <Text style={styles.titleText}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: Colors.surfaceCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: 180,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.outlineVariant,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  titleText: {
    ...Typography.headlineLg,
    color: Colors.onSurface,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
});
