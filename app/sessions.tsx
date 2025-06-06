
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";

export default function Sessions() {
  const router = useRouter();

  const [sessions, setSessions] = React.useState<
    { sessionId: number; title: string }[]
  >([]);
  const [newSessionId, setNewSessionId] = React.useState(1);

  React.useEffect(() => {
    handleLoadSessions();
  }, []);

  React.useEffect(() => {
    const backAction = () => {
      handleLoadSessions();
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  async function handleLoadSessions() {
    try {
      const folderUri = FileSystem.documentDirectory + "sessions";
      const files = await FileSystem.readDirectoryAsync(folderUri);

      if (files.length === 0) {
        setSessions([]);
        setNewSessionId(1);
        return;
      }

      const loadedSessions = await Promise.all(
        files.map(async (filename) => {
          const filePath = folderUri + "/" + filename;
          const data = await FileSystem.readAsStringAsync(filePath);
          const obj = JSON.parse(data) as {
            sessionId: number;
            title: string;
          };
          return { sessionId: obj.sessionId, title: obj.title };
        })
      );

      loadedSessions.sort((a, b) => a.sessionId - b.sessionId);

      setSessions(loadedSessions);
      setNewSessionId(loadedSessions[loadedSessions.length - 1].sessionId + 1);
    } catch (e) {
      console.error("Error loading sessions:", e);
      setSessions([]);
      setNewSessionId(1);
    }
  }

  function handleNewSession() {
    router.push({ pathname: "/create-session", params: { sessionId: newSessionId } });
  }

  function handleOpenSession(sessionId: number) {
    router.push({
      pathname: "/(drawer)",
      params: { sessionId },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sessions</Text>
      </View>

      <View style={styles.listContainer}>
        {sessions.length === 0 ? (
          <Text style={styles.noSessionsText}>No sessions</Text>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.sessionId}
              style={styles.sessionRow}
              onPress={() => handleOpenSession(session.sessionId)}
            >
              <Text style={styles.sessionTitle}>{session.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewSession}
        >
          <Text style={styles.newButtonText}>New Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ECEFF1",
  },
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#37474F",
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  noSessionsText: {
    textAlign: "center",
    color: "#607D8B",
    fontSize: 16,
    marginTop: 40,
  },
  sessionRow: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionTitle: {
    fontSize: 18,
    color: "#37474F",
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  newButton: {
    backgroundColor: "#34C759",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
