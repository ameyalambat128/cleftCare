import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import { getRecordByUserId, updateRecord } from "@/lib/api";
import PrimaryButton from "@/components/PrimaryButton";
import { getRecordingProgress } from "@/lib/recordingProgress";

export default function Screen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { t } = useTranslation();

  const [name, setName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] =
    useState<boolean>(false);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">();
  const [isGenderPickerVisible, setIsGenderPickerVisible] =
    useState<boolean>(false);
  const [hearingLoss, setHearingLoss] = useState<"Yes" | "No">();
  const [isHearingPickerVisible, setIsHearingPickerVisible] =
    useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [photo, setPhoto] = useState<string>(""); // Placeholder for photo
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const data = await getRecordByUserId(userId);
        setName(data.name);
        setBirthDate(data.birthDate ? new Date(data.birthDate) : null);
        setGender(data.gender);
        setHearingLoss(data.hearingLossStatus);
        setAddress(data.address);
        setContactNumber(data.contactNumber);
        setPhoto(data.photo || "");
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        Alert.alert("Error", "Unable to load user data.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is missing.");
      return;
    }

    const updatedUser = {
      name,
      birthDate: birthDate ? birthDate : null,
      gender,
      hearingLossStatus: hearingLoss,
      address,
      contactNumber,
      photo,
    };

    setIsSubmitting(true);

    try {
      await updateRecord(userId, updatedUser);
      Alert.alert("Success", "User record updated successfully!");
      router.back();
    } catch (error: any) {
      console.error("Failed to update user record:", error);
      Alert.alert("Error", error.error || "Failed to update user record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecordings = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID is required to access recordings");
      return;
    }

    try {
      const progress = await getRecordingProgress(userId);

      console.log("Recording progress:", progress);
      // Check if prompt 1 is completed
      if (progress[1]?.completed && progress[25]?.completed) {
        // If prompt 1 is done, go to prompt 25
        Alert.alert(
          "Recordings Complete",
          "All voice recordings have been completed for this patient. You can re-record if needed.",
          [
            { text: "Cancel", style: "cancel", onPress: () => router.back() },
            {
              text: "Re-Record",
            },
          ]
        );
        router.push(`/record/${userId}/`);
      } else if (progress[1]?.completed) {
        // Otherwise start at prompt 1
        router.push(`/record/${userId}/twentyfive`);
      } else {
        // If prompt 1 is not done, go to prompt 1
        router.push(`/record/${userId}/`);
      }
    } catch (error) {
      console.error("Error checking recording progress:", error);
      // If there's an error, default to the first prompt
      router.push(`/record/${userId}/`);
    }
  };

  const getInputStyle = (inputValue: string) => ({
    borderColor: inputValue ? Colors.tint : "#E5E7EB",
  });

  const getIconColor = (inputValue: string): string => {
    return inputValue ? Colors.tint : Colors.secondaryText;
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setBirthDate(currentDate);
    if (Platform.OS === "android") {
      setIsDatePickerVisible(false);
    }
  };

  const handlePickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Sorry",
        "We need camera roll permissions to make this work!"
      );
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Do something with the image URI
      console.log(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sorry", "We need camera permissions to make this work!");
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Do something with the photo URI
      console.log(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return (
      <Page
        style={{ flex: 1, backgroundColor: Colors.background }}
        headerShown={true}
      >
        <Stack.Screen options={{ title: "Edit Record" }} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </Page>
    );
  }

  return (
    <Page
      style={{ flex: 1, backgroundColor: Colors.background }}
      headerShown={true}
    >
      <Stack.Screen options={{ title: name || "Edit Record" }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 100 })}
      >
        <ScrollView style={styles.container}>
          <Text style={styles.headerText}>
            {t("editRecordScreen.headerText")}
          </Text>

          {/* Name Input */}
          <View style={[styles.inputField, getInputStyle(name)]}>
            <Feather
              name="user"
              size={20}
              color={getIconColor(name)}
              style={styles.icon}
            />
            <TextInput
              placeholder={t("editRecordScreen.namePlaceholder")}
              placeholderTextColor={Colors.secondaryText}
              value={name}
              onChangeText={setName}
              style={styles.inputText}
            />
          </View>

          {/* Birth Date Picker */}
          <TouchableOpacity
            style={[styles.inputField, getInputStyle(birthDate ? "1" : "")]}
            onPress={() => {
              setIsDatePickerVisible(true);
            }}
          >
            <Feather
              name="calendar"
              size={20}
              color={getIconColor(birthDate ? "1" : "")}
              style={styles.icon}
            />
            {birthDate ? (
              <Text style={styles.inputText}>
                {birthDate.getDate().toString().padStart(2, "0") +
                  "/" +
                  (birthDate.getMonth() + 1).toString().padStart(2, "0") +
                  "/" +
                  birthDate.getFullYear()}
              </Text>
            ) : (
              <Text style={{ color: Colors.secondaryText }}>
                {t("editRecordScreen.birthDatePlaceholder")}
              </Text>
            )}
          </TouchableOpacity>

          {Platform.OS === "ios" && isDatePickerVisible && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={isDatePickerVisible}
              onRequestClose={() => {
                setIsDatePickerVisible(false);
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={birthDate ? birthDate : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "calendar"}
                    onChange={onDateChange}
                    style={styles.dateTimePicker}
                  />
                  <View style={styles.dateTimePickerFooter}>
                    <TouchableOpacity
                      onPress={() => {
                        setIsDatePickerVisible(false);
                      }}
                      style={{ padding: 10 }}
                    >
                      <Text style={styles.dateTimePickerFooterText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsDatePickerVisible(false);
                      }}
                      style={{ padding: 10 }}
                    >
                      <Text style={styles.dateTimePickerFooterText}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {Platform.OS === "android" && isDatePickerVisible && (
            <DateTimePicker
              testID="dateTimePicker"
              value={birthDate ? birthDate : new Date()}
              mode="date"
              display="calendar"
              onChange={onDateChange}
            />
          )}

          {/* Gender Picker */}
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={[
                styles.androidInputField,
                getInputStyle(gender ? "gender" : ""),
              ]}
              onPress={() => setIsGenderPickerVisible(!isGenderPickerVisible)}
            >
              <Feather
                name="users"
                size={20}
                color={getIconColor(gender ? "gender" : "")}
              />

              <Picker
                selectedValue={gender}
                mode="dropdown"
                onValueChange={(itemValue, itemIndex) => {
                  setGender(itemValue);
                  setIsGenderPickerVisible(!isGenderPickerVisible);
                }}
                style={styles.picker}
              >
                <Picker.Item
                  label={t("editRecordScreen.genderPlaceholder")}
                  style={{ color: Colors.secondaryText }}
                  value=""
                />
                <Picker.Item
                  label={t("editRecordScreen.genderMale")}
                  value="Male"
                />
                <Picker.Item
                  label={t("editRecordScreen.genderFemale")}
                  value="Female"
                />
                <Picker.Item
                  label={t("editRecordScreen.genderOther")}
                  value="Other"
                />
              </Picker>
            </TouchableOpacity>
          )}

          {Platform.OS === "ios" && (
            <>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  getInputStyle(gender ? "gender" : ""),
                ]}
                onPress={() => setIsGenderPickerVisible(!isGenderPickerVisible)}
              >
                <Feather
                  name="users"
                  size={20}
                  color={getIconColor(gender ? "gender" : "")}
                  style={styles.icon}
                />
                {gender ? (
                  <Text style={styles.inputText}>{gender}</Text>
                ) : (
                  <Text style={{ color: Colors.secondaryText }}>
                    {t("editRecordScreen.genderPlaceholder")}
                  </Text>
                )}
              </TouchableOpacity>
              <Modal
                visible={isGenderPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() =>
                  setIsGenderPickerVisible(!isGenderPickerVisible)
                }
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue, itemIndex) => {
                        setGender(itemValue);
                        setIsGenderPickerVisible(!isGenderPickerVisible);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item
                        label={t("editRecordScreen.genderPlaceholder")}
                        value=""
                      />
                      <Picker.Item
                        label={t("editRecordScreen.genderMale")}
                        value="Male"
                      />
                      <Picker.Item
                        label={t("editRecordScreen.genderFemale")}
                        value="Female"
                      />
                      <Picker.Item
                        label={t("editRecordScreen.genderOther")}
                        value="Other"
                      />
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {/* Hearing Status Picker */}
          {Platform.OS === "android" && (
            <TouchableOpacity
              style={[
                styles.androidInputField,
                getInputStyle(hearingLoss ? "hearingStatus" : ""),
              ]}
              onPress={() => setIsHearingPickerVisible(!isHearingPickerVisible)}
            >
              <Feather
                name="users"
                size={20}
                color={getIconColor(hearingLoss ? "hearingStatus" : "")}
              />

              <Picker
                selectedValue={hearingLoss}
                mode="dropdown"
                onValueChange={(itemValue, itemIndex) => {
                  setHearingLoss(itemValue);
                  setIsHearingPickerVisible(!isHearingPickerVisible);
                }}
                style={styles.picker}
              >
                <Picker.Item
                  label={t("editRecordScreen.hearingStatusPlaceholder")}
                  style={{ color: Colors.secondaryText }}
                  value=""
                />
                <Picker.Item
                  label={t("editRecordScreen.hearingYes")}
                  value="Yes, I have hearing loss"
                />
                <Picker.Item
                  label={t("editRecordScreen.hearingNo")}
                  value="No, I have no hearing loss"
                />
              </Picker>
            </TouchableOpacity>
          )}

          {Platform.OS === "ios" && (
            <>
              <TouchableOpacity
                style={[
                  styles.inputField,
                  getInputStyle(hearingLoss ? "hearingStatus" : ""),
                ]}
                onPress={() =>
                  setIsHearingPickerVisible(!isHearingPickerVisible)
                }
              >
                <Feather
                  name="smile"
                  size={20}
                  color={getIconColor(hearingLoss ? "hearingStatus" : "")}
                  style={styles.icon}
                />
                {hearingLoss ? (
                  <Text style={styles.inputText}>{hearingLoss}</Text>
                ) : (
                  <Text style={{ color: Colors.secondaryText }}>
                    {t("editRecordScreen.hearingStatusPlaceholder")}
                  </Text>
                )}
              </TouchableOpacity>
              <Modal
                visible={isHearingPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() =>
                  setIsHearingPickerVisible(!isHearingPickerVisible)
                }
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={hearingLoss}
                      onValueChange={(itemValue, itemIndex) => {
                        setHearingLoss(itemValue);
                        setIsHearingPickerVisible(!isHearingPickerVisible);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item
                        label={t("editRecordScreen.hearingStatusPlaceholder")}
                        style={{ color: Colors.secondaryText }}
                        value=""
                      />
                      <Picker.Item
                        label={t("editRecordScreen.hearingYes")}
                        value="Yes, I have hearing loss"
                      />
                      <Picker.Item
                        label={t("editRecordScreen.hearingNo")}
                        value="No, I have no hearing loss"
                      />
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {/* Address Input */}
          <View style={[styles.inputField, getInputStyle(address)]}>
            <Feather
              name="map-pin"
              size={20}
              color={getIconColor(address)}
              style={styles.icon}
            />
            <TextInput
              placeholder={t("editRecordScreen.addressPlaceholder")}
              placeholderTextColor={Colors.secondaryText}
              value={address}
              onChangeText={setAddress}
              style={styles.inputText}
              autoComplete="off"
              autoCorrect={false}
            />
          </View>

          {/* Contact Number Input */}
          <View style={[styles.inputField, getInputStyle(contactNumber)]}>
            <Feather
              name="phone"
              size={20}
              color={getIconColor(contactNumber)}
              style={styles.icon}
            />
            <TextInput
              placeholder={t("editRecordScreen.contactNumberPlaceholder")}
              placeholderTextColor={Colors.secondaryText}
              value={contactNumber}
              onChangeText={setContactNumber}
              maxLength={10}
              style={styles.inputText}
              keyboardType="phone-pad"
            />
          </View>

          {/* Attachment Input */}
          <TouchableOpacity
            style={[styles.inputField, getInputStyle(photo)]}
            onPress={() => {
              Alert.alert(
                "Upload Photo",
                "Choose an option",
                [
                  { text: "Take Photo", onPress: handleTakePhoto },
                  { text: "Choose from Gallery", onPress: handlePickImage },
                  { text: "Cancel", style: "cancel" },
                ],
                { cancelable: true }
              );
            }}
          >
            <Feather
              name="camera"
              size={22}
              color={Colors.secondaryText}
              style={styles.icon}
            />
            <Text style={{ color: Colors.secondaryText }}>
              {t("addRecordScreen.takePhotoButton")}
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            style={{ marginTop: 20 }}
            type="large"
            onPress={handleEditRecordings}
          >
            {t("editRecordScreen.editRecordingsButton")}
          </PrimaryButton>
          {/* Submit Button */}
          <PrimaryButton
            style={{ marginTop: 20 }}
            type="large"
            onPress={handleSave}
          >
            {t("editRecordScreen.updateButton")}
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
    color: Colors.secondaryText,
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
  androidInputField: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    height: 56,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    color: "#000",
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
