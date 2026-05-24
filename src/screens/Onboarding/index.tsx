import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  SafeAreaView,
} from "react-native";
import { Colors, Typography, Spacing, Radius } from "../../design/tokens";
import { onboardingSlides } from "../../data/mockData";
import { Button } from "../../components/Button";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    console.log("NEXT", currentIndex, onboardingSlides.length - 1);
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace("Login");
    }
  };

  const handleSkip = () => {
    navigation.replace("Login");
  };

  const renderSlide = ({ item }: { item: (typeof onboardingSlides)[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentIndex < onboardingSlides.length - 1 ? (
          <Button
            label="Skip"
            variant="outline"
            style={styles.skipBtn}
            labelStyle={styles.skipLabel}
            onPress={handleSkip}
          />
        ) : (
          <View style={styles.skipBtnPlaceholder} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <Button
          label={
            currentIndex === onboardingSlides.length - 1
              ? "Get Started"
              : "Next"
          }
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  skipBtn: {
    height: 36,
    borderWidth: 0,
    paddingHorizontal: Spacing.md,
  },
  skipLabel: {
    color: Colors.outline,
    ...Typography.bodySm,
    fontWeight: "600",
  },
  skipBtnPlaceholder: {
    height: 36,
  },
  list: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl * 1.5,
  },
  emoji: {
    fontSize: 100,
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.displayBal,
    color: Colors.onSurface,
    fontSize: 28,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 36,
  },
  subtitle: {
    ...Typography.bodyLg,
    color: Colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  actionBtn: {
    width: "100%",
  },
});
