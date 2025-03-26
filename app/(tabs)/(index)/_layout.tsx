import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function Layout() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    async function checkOnboardingStatus() {
      // TODO: For Testing ONLY - Remove this line in production
      // await AsyncStorage.removeItem("home-onboarded");

      const status = await AsyncStorage.getItem("home-onboarded");
      if (!status) {
        router.replace("/(tabs)/(index)/onboarding"); // Redirect to the first onboarding screen
      } else {
        setOnboarded(true);
      }
      setIsLoading(false);
    }

    const checkUserLoggedIn = async () => {
      const userId = await AsyncStorage.getItem("user-id");
      if (!userId) {
        router.replace("/login");
        return;
      }

      // Only check onboarding if user is logged in
      checkOnboardingStatus();
    };

    checkUserLoggedIn();
  }, []);

  if (isLoading) return null;
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-record"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="search-record"
        options={{
          title: "Search",
          animation: "fade",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="edit-record/[userId]"
        options={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="record"
        options={{
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
