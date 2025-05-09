import { Stack } from "expo-router";

export default function Layout() {
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
