import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Screen() {
  const router = useRouter();

  const [completed, setCompleted] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [metering, setMetering] = useState(0);
  const [status, setStatus] = useState<Audio.RecordingStatus | null>(null);
  const [meter, setMeter] = useState(0);

  const startRecording = async () => {
    try {
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync();
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          // Android-specific settings
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          onRecordingStatusUpdate
        );

        recordingRef.current = newRecording;
        await newRecording.startAsync();
        console.log("Recording started");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const onRecordingStatusUpdate = async (newStatus: Audio.RecordingStatus) => {
    setStatus(newStatus);
    console.log("Recording status:", newStatus);
    if (newStatus.isRecording && newStatus.metering) {
      setMetering(newStatus.metering);
    }
  };

  const stopRecording = async () => {
    const currentRecording = recordingRef.current;
    if (!currentRecording) return;
    await currentRecording.stopAndUnloadAsync();
    console.log("Recording stopped");
    const uri = currentRecording.getURI();
    console.log("Recording URI:", uri);
  };

  const handleRecording = () => {
    // Implement recording logic here
  };

  return (
    <Page
      style={{ flex: 1, backgroundColor: Colors.background }}
      headerShown={false}
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={30} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View>
              <TouchableOpacity
                onPress={() => {
                  router.push("/record/two");
                }}
              >
                <Text
                  style={[
                    styles.headerRightText,
                    completed ? { color: Colors.tint } : { color: "gray" },
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.bodyContainer}>
          <Text style={styles.bodyText}>Hello! How are you?</Text>
          <TouchableOpacity
            onPress={handleRecording}
            style={styles.recordButton}
          >
            <Feather name="mic" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.instructions}>
            Press the audio icon to start recording
          </Text>
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>1/</Text>
          <Text style={styles.finalProgressText}>25</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerRightText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "90%",
  },
  bodyText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  recordButton: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0E5E5",
  },
  instructions: {
    fontSize: 16,
    marginTop: 30,
    color: Colors.secondaryText,
    textAlign: "center",
  },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
  progressText: {
    fontSize: 18,
    color: Colors.tint,
  },
  finalProgressText: {
    fontSize: 18,
    color: Colors.secondaryText,
  },
});
