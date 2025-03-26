import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { TouchableOpacity } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: 0 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.tint,
      }}
    >
      <Tabs.Screen
        name="(index)"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tutorials"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "reader" : "reader-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
