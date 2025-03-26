// Add these imports
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper functions to manage recording progress
const getRecordingProgressKey = (userId: string) => {
  return `recording-progress-${userId}`;
};

const saveRecordingProgress = async (
  userId: string,
  promptNumber: number,
  recordingCount: number,
  isCompleted: boolean
) => {
  try {
    // Get existing progress
    const progressKey = getRecordingProgressKey(userId);
    const existingProgressJSON = await AsyncStorage.getItem(progressKey);
    const existingProgress = existingProgressJSON
      ? JSON.parse(existingProgressJSON)
      : {};

    // Update progress for the current prompt
    existingProgress[promptNumber] = {
      recordingCount,
      completed: isCompleted,
      lastUpdated: new Date().toISOString(),
    };

    // Save updated progress
    await AsyncStorage.setItem(progressKey, JSON.stringify(existingProgress));
    console.log(
      `Recording progress saved for user ${userId}, prompt ${promptNumber}`
    );
  } catch (error) {
    console.error("Error saving recording progress:", error);
  }
};

const getRecordingProgress = async (userId: string) => {
  try {
    const progressKey = getRecordingProgressKey(userId);
    const progressJSON = await AsyncStorage.getItem(progressKey);
    return progressJSON ? JSON.parse(progressJSON) : {};
  } catch (error) {
    console.error("Error getting recording progress:", error);
    return {};
  }
};

export { getRecordingProgressKey, saveRecordingProgress, getRecordingProgress };
