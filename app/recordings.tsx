import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useAudioPlayer } from "expo-audio";
import { sha256 } from "react-native-sha256";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
//import { useAuth } from "./services/authContext"; // adjust path if needed
import {Platform } from "react-native";

type RecordingSession = {
  sessionId: number;
  patientId: number;
  patientName: string;
  patientSurname: string;
  title: string;
  creationTime: number;
  recordings: string[];
};

type RootStackParamList = {
  Recordings: { recordingSession: RecordingSession };
  Index: undefined;
};

export default function Recordings() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "Recordings">>();
  const { jwt } = useAuth();
  const player = useAudioPlayer();

  const [recordingSession, setRecordingSession] = useState<RecordingSession>(
    route.params.recordingSession
  );
  const [statusText, setStatusText] = useState("Idle");
  const [playingAt, setPlayingAt] = useState(-1);

  useEffect(() => {
    const backAction = () => {
      navigation.popToTop();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    async function saveSessionLocally() {
      const sessionName = `session-${recordingSession.sessionId}`;
      const sessionPath =
        FileSystem.documentDirectory + "sessions/" + sessionName;
      await FileSystem.makeDirectoryAsync(
        FileSystem.documentDirectory + "sessions/",
        { intermediates: true }
      );
      try {
        await FileSystem.writeAsStringAsync(
          sessionPath,
          JSON.stringify(recordingSession)
        );
      } catch (e) {
        console.error("Failed to save session locally:", e);
      }
    }

    saveSessionLocally();
  }, [recordingSession]);

  async function ensureM4A(rawUri: string): Promise<string> {
    if (rawUri.endsWith(".m4a")) {
      return rawUri;
    }
    const renamed = rawUri + ".m4a";
    try {
      await FileSystem.moveAsync({ from: rawUri, to: renamed });
      setRecordingSession((prev) => ({
        ...prev,
        recordings: prev.recordings.map((u) => (u === rawUri ? renamed : u)),
      }));
      return renamed;
    } catch (e) {
      console.error("Failed to rename file to .m4a:", e);
      throw e;
    }
  }

  function playRecordingAt(i: number) {
    const uri = recordingSession.recordings[i];
    player.replace(uri);
    player.play();
    setPlayingAt(i);
    setStatusText(`Playing segment #${i + 1}`);
  }
  function pauseRecordingAt(i: number) {
    player.pause();
    player.remove();
    setPlayingAt(-1);
    setStatusText("Paused");
  }

  async function deleteRecordingAt(i: number) {
    const uri = recordingSession.recordings[i];
    try {
      await FileSystem.deleteAsync(uri);
    } catch (e) {
      console.error("Failed to delete file:", e);
    }
    setRecordingSession((prev) => ({
      ...prev,
      recordings: prev.recordings.filter((_, idx) => idx !== i),
    }));
  }

 async function handleUpload() {
   if (!recordingSession.recordings.length) {
     setStatusText("No recordings found");
     return;
   }

   const form = new FormData();
   setStatusText("Preparing files…");

   try {
     await Promise.all(
       recordingSession.recordings.map(async (rawUri, i) => {
         const fileUri = await ensureM4A(rawUri);
         form.append("audio_files", {
           uri: fileUri,
           name: `segment-${i + 1}.m4a`,
           type: "audio/m4a",
         });
       })
     );
   } catch {
     setStatusText("Rename failed");
     return;
   }

   const hashedId = await sha256(recordingSession.patientId.toString());
   form.append("id_", hashedId);
   form.append("title", recordingSession.title);

   setStatusText("Uploading…");
   try {
     const response = await fetch(
       "https://mediphone-backend-854458745933.europe-west8.run.app/multiple-recordings",
       {
         method: "POST",
         headers: {
           Accept: "application/json",
           Authorization: "Bearer " + jwt,
         },
         body: form,
       }
     );

     const text = await response.text();
     console.log("Raw /test-multiple-recordings response:", text);

     try {
       const json = JSON.parse(text);
       if (json.error) {
         setStatusText("Error: " + json.error);
       } else {
         setStatusText("Transcription: " + json.message);
       }
     } catch {
       setStatusText("Unexpected server response");
     }
   } catch (e) {
     console.error("Network error:", e);
     setStatusText("Upload failed");
   }
 }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Recordings (Session #{recordingSession.sessionId})
      </Text>
      <Text style={styles.status}>Status: {statusText}</Text>

      <View style={styles.listContainer}>
        {recordingSession.recordings.length === 0 ? (
          <Text style={styles.noRec}>No recordings</Text>
        ) : (
          recordingSession.recordings.map((uri, idx) => (
            <View key={idx} style={styles.recordingRow}>
              <Text style={styles.recordingText}>Segment #{idx + 1}</Text>
              <View style={styles.buttonsRow}>
                {playingAt === idx ? (
                  <TouchableOpacity onPress={() => pauseRecordingAt(idx)}>
                    <Text style={styles.buttonIcon}>❚❚</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => playRecordingAt(idx)}>
                    <Text style={styles.buttonIcon}>▶</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => deleteRecordingAt(idx)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.uploadButtonText}>Submit Recording</Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECEFF1",
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#37474F",
    marginVertical: 16,
  },

  status: {
    fontSize: 14,
    textAlign: "center",
    color: "#607D8B",
    marginBottom: 12,
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  noRec: {
    fontSize: 16,
    color: "#78909C",
    textAlign: "center",
    marginTop: 40,
  },

  recordingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    elevation: 2,
  },

  recordingText: {
    fontSize: 16,
    color: "#37474F",
    fontWeight: "500",
  },

  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  buttonIcon: {
    fontSize: 20,
    color: "#37474F",
    marginHorizontal: 8,
  },

  deleteIcon: {
    fontSize: 20,
    color: "#E53935",
    marginHorizontal: 8,
  },

  uploadButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    marginHorizontal: 32,
    marginVertical: 20,
    borderRadius: 8,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
