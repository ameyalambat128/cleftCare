import { useState } from "react";
import {
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import PrimaryButton from "@/components/PrimaryButton";
import { useRouter } from "expo-router";

export default function Screen() {
  const router = useRouter();

  return (
    <Page
      style={{ flex: 1, backgroundColor: Colors.background }}
      headerShown={true}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 100 })}
      >
        <ScrollView style={styles.container}>
          <Text style={styles.headerText}>
            Please carefully read and review the consent form to ensure the best
            care for your child.
          </Text>

          <Text style={styles.formText}>
            Here we will show the parent consent form details.Here we will show
            the parent consent form details.Here we will show the parent consent
            form details.Here we will show the parent consent form details.Here
            we will show the parent consent form details.Here we will show the
            parent consent form details.{`\n\n`}
            Here we will show the parent consent form details.Here we will show
            the parent consent form details.Here we will show the parent consent
            form details.Here we will show the parent consent form details.Here
            we will show the parent consent form details.
            {`\n\n`}
            Here we will show the parent consent form details.Here we will show
            the parent consent form details.Here we will show the parent consent
            form details.
            {`\n\n`}
            Here we will show the parent consent form details.Here we will show
            the parent consent form details.Here we will show the parent consent
            form details.
          </Text>

          {/* Submit Button */}
          <PrimaryButton
            style={{ marginTop: 20 }}
            type="large"
            onPress={() => router.push("/addRecord/addSignature")}
          >
            Add Signature
          </PrimaryButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerText: {
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
    color: Colors.tint,
  },
  icon: {
    marginRight: 10,
  },
  formText: {
    fontSize: 16,
    marginVertical: 15,
    textAlign: "left",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dim the background for modal
  },
  pickerContainer: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  picker: {
    width: "100%",
  },
  dateTimePicker: {
    width: "100%",
    backgroundColor: "white",
  },
  dateTimePickerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  dateTimePickerFooterText: {
    fontSize: 18,
    fontWeight: "normal",
    color: "#006ee6",
  },
});
