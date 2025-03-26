import React from "react";
import { Stack } from "expo-router";

export default function RecordsLayout() {
  return (
    <Stack>
      <Stack.Screen name="[userId]" options={{ headerShown: false }} />
    </Stack>
  );
}
