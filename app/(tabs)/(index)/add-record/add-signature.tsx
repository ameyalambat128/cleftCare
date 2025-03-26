import { useState } from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import PrimaryButton from "@/components/PrimaryButton";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { UserInfo, useUserStore } from "@/lib/store";
import { addRecord } from "@/lib/api";
import SignatureBox from "@/components/SignatureBox";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getUser, updateUser } = useUserStore();

  const [consentSignedBy, setConsentSignedBy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signatureBase64String, setSignatureBase64String] = useState("");

  const user = getUser();
  console.log("User data:", user);
  if (user) {
    Object.entries(user).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  } else {
    console.log("No user data available");
  }

  const handleNext = async () => {
    if (!user) {
      console.error("No user data available");
      return;
    }

    // Prepare user data for API
    const userData = {
      name: user.name,
      birthDate: user.birthDate ? user.birthDate : null,
      gender: user.gender,
      hearingStatus: user.hearingStatus,
      address: user.address,
      contactNumber: user.contactNumber,
      photo: user.photo,
      parentConsent: user.parentConsent,
      signedConsent: true, // Explicitly set as signed
      consentSignedBy: consentSignedBy,
      communityWorkerId: user.communityWorkerId,
    };

    setIsLoading(true);
    setError("");

    try {
      const apiResponse = await addRecord(userData);

      console.log("API Response:", apiResponse);

      if (apiResponse && apiResponse.id) {
        updateUser({
          userId: apiResponse.id,
          signedConsent: true,
          consentSignedBy: consentSignedBy,
          currentPromptNumber: 1,
        });
        const currentChildUser = {
          ...user,
          userId: apiResponse.id,
          signedConsent: true,
          consentSignedBy: consentSignedBy,
          currentPromptNumber: 1,
        };
        await AsyncStorage.setItem(
          "currentChildUser",
          JSON.stringify(currentChildUser)
        );
        console.log("Success", "User added successfully!", apiResponse.id);
        router.push(`/record/${apiResponse.id}/`);
      } else {
        throw new Error("Invalid API response. Missing `id`.");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      setError(error.error || "Failed to add user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (inputValue: string) => ({
    borderColor: inputValue ? Colors.tint : "#E5E7EB",
  });

  const getIconColor = (inputValue: string): string => {
    return inputValue ? Colors.tint : Colors.secondaryText;
  };

  const checkIfInputsAreFilled = !consentSignedBy || !signatureBase64String;

  return (
    <Page
      style={{ flex: 1, backgroundColor: Colors.background }}
      headerShown={true}
    >
      <View style={styles.container}>
        <Text style={styles.headerText}>
          {t("addSignatureScreen.headerText")}
        </Text>

        <View style={[styles.inputField, getInputStyle(consentSignedBy)]}>
          <Feather
            name="user"
            size={20}
            color={getIconColor(consentSignedBy)}
            style={styles.icon}
          />
          <TextInput
            placeholder={t("addSignatureScreen.namePlaceholder")}
            placeholderTextColor={Colors.secondaryText}
            value={consentSignedBy}
            onChangeText={setConsentSignedBy}
          />
        </View>
        <View
          style={{
            height: "65%",
            width: "100%",
          }}
        >
          {/* <Text style={styles.formText}>Signature Box here</Text> */}
          <SignatureBox
            onOK={(signature) => setSignatureBase64String(signature)}
          />
        </View>

        {/* Submit Button */}
        <PrimaryButton
          style={{ marginTop: 20 }}
          type="large"
          onPress={handleNext}
          disabled={checkIfInputsAreFilled}
        >
          {t("addSignatureScreen.addSignatureButton")}
        </PrimaryButton>
      </View>
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
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F9FAFB",
    height: 56,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  formText: {
    fontSize: 16,
    textAlign: "center",
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
