import { useState } from "react";
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
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { randomUUID } from "expo-crypto";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import PrimaryButton from "@/components/PrimaryButton";
import { useUserStore } from "@/lib/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Screen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setUser } = useUserStore();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] =
    useState<boolean>(false);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">();
  const [isGenderPickerVisible, setIsGenderPickerVisible] =
    useState<boolean>(false);
  const [hearingStatus, setHearingStatus] = useState<
    "Yes, I have hearing loss" | "No, I have no hearing loss"
  >();
  const [isHearingPickerVisible, setIsHearingPickerVisible] =
    useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [photo, setPhoto] = useState<string>(""); // TODO: change photo to Image type if needed

  const handleNext = () => {
    updateUserStore();
    router.push("/add-record/parent-consent");
  };

  const updateUserStore = async () => {
    try {
      const workerId = await AsyncStorage.getItem("user-id");
      if (workerId !== null) {
        setUser({
          userId: "",
          name,
          birthDate,
          gender,
          hearingStatus,
          address,
          contactNumber,
          photo,
          communityWorkerId: workerId,
          consentSignedBy: "",
          parentConsent: false,
          signedConsent: false,
        });
      }
    } catch (error) {
      console.error("Error retrieving user ID:", error);
    }
  };

  // Write a function that disables the submit button if any of the fields are empty except the photo field
  const isSubmitDisabled = () => {
    return (
      !name ||
      !birthDate ||
      !gender ||
      !hearingStatus ||
      !address ||
      !contactNumber
    );
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
            {t("addRecordScreen.headerText")}
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
              placeholder={t("addRecordScreen.namePlaceholder")}
              placeholderTextColor={Colors.secondaryText}
              value={name}
              onChangeText={setName}
              style={styles.inputText}
              autoComplete="name"
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
                {t("addRecordScreen.birthDatePlaceholder")}
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
                  label={t("addRecordScreen.genderPlaceholder")}
                  style={{ color: Colors.secondaryText }}
                  value=""
                />
                <Picker.Item
                  label={t("addRecordScreen.genderMale")}
                  value="Male"
                />
                <Picker.Item
                  label={t("addRecordScreen.genderFemale")}
                  value="Female"
                />
                <Picker.Item
                  label={t("addRecordScreen.genderOther")}
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
                    {t("addRecordScreen.genderPlaceholder")}
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
                        label={t("addRecordScreen.genderPlaceholder")}
                        value=""
                      />
                      <Picker.Item
                        label={t("addRecordScreen.genderMale")}
                        value="Male"
                      />
                      <Picker.Item
                        label={t("addRecordScreen.genderFemale")}
                        value="Female"
                      />
                      <Picker.Item
                        label={t("addRecordScreen.genderOther")}
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
                getInputStyle(hearingStatus ? "hearingStatus" : ""),
              ]}
              onPress={() => setIsHearingPickerVisible(!isHearingPickerVisible)}
            >
              <Feather
                name="smile"
                size={20}
                color={getIconColor(hearingStatus ? "hearingStatus" : "")}
              />

              <Picker
                selectedValue={hearingStatus}
                mode="dropdown"
                onValueChange={(itemValue, itemIndex) => {
                  setHearingStatus(itemValue);
                  setIsHearingPickerVisible(!isHearingPickerVisible);
                }}
                style={styles.picker}
              >
                <Picker.Item
                  label={t("addRecordScreen.hearingStatusPlaceholder")}
                  style={{ color: Colors.secondaryText }}
                  value=""
                />
                <Picker.Item
                  label={t("addRecordScreen.hearingYes")}
                  value="Yes, I have hearing loss"
                />
                <Picker.Item
                  label={t("addRecordScreen.hearingNo")}
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
                  getInputStyle(hearingStatus ? "hearingStatus" : ""),
                ]}
                onPress={() =>
                  setIsHearingPickerVisible(!isHearingPickerVisible)
                }
              >
                <Feather
                  name="smile"
                  size={20}
                  color={getIconColor(hearingStatus ? "hearingStatus" : "")}
                  style={styles.icon}
                />
                {hearingStatus ? (
                  <Text style={styles.inputText}>{hearingStatus}</Text>
                ) : (
                  <Text style={{ color: Colors.secondaryText }}>
                    {t("addRecordScreen.hearingStatusPlaceholder")}
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
                      selectedValue={hearingStatus}
                      onValueChange={(itemValue, itemIndex) => {
                        setHearingStatus(itemValue);
                        setIsHearingPickerVisible(!isHearingPickerVisible);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item
                        label={t("addRecordScreen.hearingStatusPlaceholder")}
                        style={{ color: Colors.secondaryText }}
                        value=""
                      />
                      <Picker.Item
                        label={t("addRecordScreen.hearingYes")}
                        value="Yes, I have hearing loss"
                      />
                      <Picker.Item
                        label={t("addRecordScreen.hearingNo")}
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
              placeholder={t("addRecordScreen.addressPlaceholder")}
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
              placeholder={t("addRecordScreen.contactNumberPlaceholder")}
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

          {/* Submit Button */}
          <PrimaryButton
            style={{ marginTop: 20 }}
            type="large"
            disabled={isSubmitDisabled()}
            onPress={handleNext}
          >
            {t("addRecordScreen.nextButton")}
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
