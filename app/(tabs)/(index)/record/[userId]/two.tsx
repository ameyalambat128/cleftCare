import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

import Page from "@/components/Page";
import Colors from "@/constants/Colors";
import { useUserStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import { s3Client } from "@/lib/aws";

const prompt: string = "ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಲು ಆಡಿಯೊ ಐಕಾನ್ ಅನ್ನು ಒತ್ತಿರಿ";
const promptNumber: number = 2;

export const InitialScreenState: React.FC<{
  onStartRecording: () => void;
}> = ({ onStartRecording }) => (
  <View style={styles.bodyContainer}>
    <Text style={styles.bodyText}>{prompt}</Text>
    <TouchableOpacity onPress={onStartRecording} style={styles.recordButton}>
      <Feather name="mic" size={40} color="black" />
    </TouchableOpacity>
    <Text style={styles.instructions}>
      Press the audio icon to start recording
    </Text>
  </View>
);

export const RecordingState: React.FC<{
  onStopRecording: () => void;
  timer: string;
}> = ({ onStopRecording, timer }) => {
  return (
    <View style={styles.bodyContainer}>
      <Text style={[styles.bodyText, { color: Colors.tint }]}>{prompt}</Text>
      <TouchableOpacity
        onPress={onStopRecording}
        style={[styles.recordButton, styles.recording]}
      >
        <Feather name="mic" size={40} color="white" />
      </TouchableOpacity>
      <Text style={[styles.timer, { color: Colors.tint }]}>{timer}</Text>
      <Text style={styles.boldInstructions}>Recording started...</Text>
    </View>
  );
};

// TODO: Edit the 2 components below
export const UploadingState: React.FC<{ timer: string }> = ({ timer }) => (
  <View style={styles.bodyContainer}>
    <Text style={styles.bodyText}>{prompt}</Text>
    <TouchableOpacity
      onPress={() => console.log("Uploading...")}
      style={[styles.recordButton]}
    >
      <Feather name="mic" size={40} color="black" />
    </TouchableOpacity>
    <Text style={[styles.timer]}>{timer}</Text>
    <Text style={styles.boldInstructions}>Audio is uploading...</Text>
  </View>
);

export const DoneState: React.FC<{
  onDone: () => void;
  onStartRecording: () => void;
}> = ({ onDone, onStartRecording }) => {
  useEffect(() => {
    onDone();
  }, []);
  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.bodyText}>{prompt}</Text>
      <TouchableOpacity
        onPress={onStartRecording}
        style={[styles.recordButton]}
      >
        <Feather name="mic" size={40} color="black" />
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 50,
        }}
      >
        <AntDesign name="checkcircle" size={20} color={Colors.tint} />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: Colors.text,
            textAlign: "center",
          }}
        >
          Done
        </Text>
      </View>
      <Text
        style={{
          marginTop: 10,
        }}
      >
        To Re-Record press the mic button.
      </Text>
    </View>
  );
};

export default function Screen() {
  const router = useRouter();
  const { getUser } = useUserStore();
  const user = getUser();
  console.log("User data:", user);
  if (user) {
    Object.entries(user).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
  } else {
    console.log("No user data available");
  }

  const recordingRef = useRef<Audio.Recording | null>(null);
  const [screenState, setScreenState] = useState<
    "initial" | "recording" | "uploading" | "done"
  >("initial");
  const [timer, setTimer] = useState<string>("00:00");
  const [completed, setCompleted] = useState(false);
  const [recordingCount, setRecordingCount] = useState<number>(0);
  const [status, setStatus] = useState<Audio.RecordingStatus | null>(null);
  const [meter, setMeter] = useState(0);

  const onStartRecording = async () => {
    try {
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
        // await newRecording.startAsync();
        setScreenState("recording");
        console.log("Recording started", newRecording);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const onRecordingStatusUpdate = async (newStatus: Audio.RecordingStatus) => {
    setStatus(newStatus);
    console.log("Recording status:", newStatus);
    if (newStatus.canRecord && newStatus.durationMillis != null) {
      const newFormattedTime = formatDuration(newStatus.durationMillis);
      setTimer(newFormattedTime); // Update the formatted time
    }
  };

  const onStopRecording = async () => {
    const currentRecording = recordingRef.current;
    if (!currentRecording) return;
    await currentRecording.stopAndUnloadAsync();
    setScreenState("uploading");
    console.log("Recording stopped");
    // const uri = currentRecording.getURI();
    // console.log("Recording URI:", uri);
    setTimeout(() => setScreenState("done"), 2000);
  };

  const onDone = async () => {
    setCompleted(true);
    setRecordingCount((prevCount) => prevCount + 1);

    const currentRecording = recordingRef.current;
    if (!currentRecording) return;

    try {
      const uri = currentRecording.getURI();
      const fileName = `${
        user?.userId
      }-${new Date().toISOString()}-${promptNumber}.m4a`;
      const localFileUri = `${FileSystem.documentDirectory}${fileName}`; // Path to store the recording locally

      // Copy the recording to local storage
      await FileSystem.copyAsync({
        from: uri!,
        to: localFileUri,
      });
      console.log("File saved locally at:", localFileUri);

      await uploadToS3(localFileUri, fileName);
    } catch (error) {
      console.error("Error during recording processing:", error);
    }
  };

  // Helper function to upload file to S3
  const uploadToS3 = async (localFileUri: string, fileName: string) => {
    try {
      // Read the file from the local storage
      const fileInfo = await FileSystem.getInfoAsync(localFileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      const fileBlob = await FileSystem.readAsStringAsync(localFileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert the Base64 string to a Blob or ArrayBuffer before uploading to S3
      const buffer = Buffer.from(fileBlob, "base64");

      // Create the parameters for the S3 upload
      const uploadParams = {
        Bucket: "cleftcare-test", // The name of the bucket
        Key: fileName, // The name of the file to be uploaded
        Body: buffer, // Upload the file content
        ContentType: "audio/mp4", // M4A files use this MIME type
      };

      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      const data = await s3Client.send(command);

      console.log("Successfully uploaded audio to S3:", data);

      // You can now delete the file locally if you no longer need it
      await FileSystem.deleteAsync(localFileUri);
      console.log("File deleted from local storage after successful upload");
    } catch (error) {
      console.error("Error uploading to S3:", error);
      // Handle the case where the file should remain locally for future upload retries
    }
  };

  let content;
  switch (screenState) {
    case "initial":
      content = <InitialScreenState onStartRecording={onStartRecording} />;
      break;
    case "recording":
      content = (
        <RecordingState onStopRecording={onStopRecording} timer={timer} />
      );
      break;
    case "uploading":
      content = <UploadingState timer={timer} />;
      break;
    case "done":
      // Choose the best file running each at once and compare the scores
      content = (
        <DoneState onDone={onDone} onStartRecording={onStartRecording} />
      );
      break;
  }

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
                  router.push("/record/twentyfive");
                }}
                disabled={!completed}
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
        {content}
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{promptNumber}/</Text>
          <Text style={styles.finalProgressText}>25</Text>
        </View>
        <View style={styles.recordingCountContainer}>
          <Text style={styles.recordingCountText}>
            Recordings: {recordingCount}
          </Text>
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
    marginVertical: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0E5E5",
  },
  recording: {
    backgroundColor: Colors.tint,
  },
  timer: {
    fontSize: 30,
    fontWeight: "500",
    color: Colors.text,
  },
  instructions: {
    fontSize: 16,
    marginTop: 50,
    color: Colors.secondaryText,
    textAlign: "center",
    width: "60%",
  },
  boldInstructions: {
    fontSize: 16,
    marginTop: 50,
    fontWeight: "bold",
    color: Colors.text,
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
    fontWeight: "500",
    color: Colors.tint,
  },
  finalProgressText: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.secondaryText,
  },
  recordingCountContainer: {
    position: "absolute",
    bottom: 0,
    right: 20,
    backgroundColor: Colors.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  recordingCountText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
});
