import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

type PendingAnamnesisItem = {
  id_anamnesis: number;
  p_name:       string;
  p_surname:    string;
  title:        string;
  contents:     string;
  d_name:       string;
  d_surname:    string;
};

type RootStackParamList = {
  PendingAnamnesisEdit: { anamnesis: PendingAnamnesisItem };
};

export default function PendingAnamnesisEdit() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<RootStackParamList, "PendingAnamnesisEdit">>();
  const { anamnesis } = route.params!;
  const [text, setText] = useState(anamnesis.contents);
  const [saving, setSaving] = useState(false);

  async function handleSaveAndApprove() {
    if (!text.trim()) {
      Alert.alert("Validation", "Contents cannot be empty.");
      return;
    }
    setSaving(true);

    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("Error", "Not authenticated. Please log in again.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        "https://mediphone-backend-854458745933.europe-west8.run.app/update-personel-anamnesis",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            anamnesis_id: anamnesis.id_anamnesis,
            contents: text.trim(),
          }),
        }
      );

      if (res.status !== 200) {
        const errJson = await res.json();
        console.warn("Server error:", errJson);
        Alert.alert("Error", errJson.error || "Could not save changes.");
      } else {
        Alert.alert("Success", "Anamnesis approved.");
        navigation.goBack(); // Back to pending list
      }
    } catch (e) {
      console.error("Network error updating:", e);
      Alert.alert("Error", "Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {anamnesis.p_name} {anamnesis.p_surname} — “{anamnesis.title}”
      </Text>
      <Text style={styles.subHeader}>
        Doctor: {anamnesis.d_name} {anamnesis.d_surname}
      </Text>

      <TextInput
        style={styles.textArea}
        multiline
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSaveAndApprove}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save &amp; Approve</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  subHeader: { fontSize: 14, color: "#555", marginBottom: 12 },
  textArea: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#34c759",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
