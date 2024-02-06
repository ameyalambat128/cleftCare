import Page from "@/components/Page";
import { StyleSheet, Text, View } from "react-native";

export default function Screen() {
  return (
    <Page style={styles.container}>
      <Text style={styles.title}>Record Audio</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    margin: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
});
