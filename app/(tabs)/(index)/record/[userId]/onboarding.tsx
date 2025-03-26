import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";

const promptNumber: number = 1;

export default function Screen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [isOnboarding, setIsOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const onboardingSteps = [
    {
      title: "Start-Stop Audio",
      message:
        "Press the Audio icon to start recording children’s voice. make sure to record audio in quite place",
      position: { bottom: 70, left: "10%", right: "10%" }, // Box position
      arrowPosition: {
        top: -10,
        left: "50%",
        transform: [{ translateX: 10 }, { rotate: "180deg" }],
      },
    },
    {
      title: "Predefined Statement",
      message:
        "First, carefully speak predefined sentence in front of children",
      position: { top: 260, left: "10%", right: "10%" },
      arrowPosition: {
        top: -10,
        left: "50%",
        transform: [{ translateX: 10 }, { rotate: "180deg" }],
      },
    },
    {
      title: "Next Button",
      message:
        "Next button will be enable once you record the audio in current screen",
      position: { top: "3%", left: "20%", right: "2%" },
      arrowPosition: {
        top: -10,
        right: 30,
        transform: [{ translateX: 10 }, { rotate: "180deg" }],
      },
    },
    {
      title: "Success",
      message: "Great! let's begin recording audio now",
      position: {
        top: "30%",
        left: "10%",
        right: "10%",
        height: "40%",
        gap: 40,
      },
      arrowPosition: null, // No arrow for the success message
    },
  ];

  const handleNextOnboardingStep = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await AsyncStorage.setItem("onboarded", "true");
      router.replace(`/record/${userId}/`);
    }
  };

  return (
    <Page
      style={{ flex: 1, backgroundColor: Colors.background }}
      headerShown={false}
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View>
              <TouchableOpacity onPress={() => {}} disabled={!completed}>
                <Text
                  style={[
                    styles.headerRightText,
                    completed ? { color: Colors.tint } : { color: "gray" },
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      {isOnboarding && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.overlayContent,
              // @ts-ignore
              onboardingSteps[currentStep].position,
            ]}
          >
            <Text
              style={[
                styles.helpText,
                { fontWeight: "bold", fontSize: 18, marginBottom: 2 },
                currentStep === onboardingSteps.length - 1 && {
                  fontWeight: "bold",
                  fontSize: 24,
                  marginBottom: 2,
                },
              ]}
            >
              {onboardingSteps[currentStep].title}
            </Text>
            <Text style={styles.helpText}>
              {onboardingSteps[currentStep].message}
            </Text>
            {onboardingSteps[currentStep].arrowPosition && (
              <View
                style={[
                  styles.arrow,
                  // @ts-ignore
                  onboardingSteps[currentStep].arrowPosition,
                ]}
              />
            )}
            <TouchableOpacity
              style={[
                styles.nextButton,
                currentStep === onboardingSteps.length - 1 && {
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                },
              ]}
              onPress={handleNextOnboardingStep}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1
                  ? "Get Started"
                  : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.container}>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>Prompt: Speak predefined sentence</Text>
          <TouchableOpacity onPress={() => {}} style={styles.recordButton}>
            <Feather name="mic" size={40} color="black" />
          </TouchableOpacity>
          <Text style={styles.instructions}>Press the mic to record</Text>
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{`${promptNumber}/`}</Text>
          <Text style={styles.finalProgressText}>25</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerRightText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  overlayContent: {
    position: "absolute",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.tint, // Teal border
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  helpText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: Colors.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  nextButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  bodyContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "90%",
  },
  bodyText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  recordButton: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0E5E5",
  },
  instructions: {
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: "center",
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.tint,
  },
  finalProgressText: {
    fontSize: 18,
    color: Colors.secondaryText,
  },
});
