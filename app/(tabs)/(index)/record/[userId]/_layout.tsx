import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function Layout() {
  // const { userId: userIdLocalParam } = useLocalSearchParams<{
  //   userId: string;
  // }>();
  // const router = useRouter();

  // const [isLoading, setIsLoading] = useState(true);
  // const [onboarded, setOnboarded] = useState(false);

  // useEffect(() => {
  //   async function checkOnboardingStatus() {
  //     const status = await AsyncStorage.getItem("onboarded");
  //     if (!status) {
  //       router.replace(`/record/${userIdLocalParam}/onboarding`); // Redirect to the first onboarding screen
  //     } else {
  //       setOnboarded(true);
  //     }
  //     setIsLoading(false);
  //   }
  //   checkOnboardingStatus();
  // }, []);

  // if (isLoading) return null;
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Record Audio",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Record Audio",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
      <Stack.Screen
        name="two"
        options={{
          title: "Record Audio",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
      <Stack.Screen
        name="three"
        options={{
          title: "Record Audio",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
      <Stack.Screen
        name="twentyfive"
        options={{
          title: "Record Audio",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "white" },
        }}
      />
    </Stack>
  );
}
