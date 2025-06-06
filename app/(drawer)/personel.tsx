// app/Personel.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

//
// Type for each pending anamnesis entry:
//
type PendingAnamnesisItem = {
  id_anamnesis: number;
  p_name:       string;
  p_surname:    string;
  title:        string;
  contents:     string;
  d_name:       string;
  d_surname:    string;
};

export default function Personel() {
  const navigation = useNavigation();
  const [pendingList, setPendingList] = useState<PendingAnamnesisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAnamnesis();
  }, []);

  async function fetchPendingAnamnesis() {
    setLoading(true);
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("Error", "No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://mediphone-backend-854458745933.europe-west8.run.app/fetch-pending-anamnesis-all",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status !== 200) {
        const err = await res.json();
        console.warn("Server error:", err);
        Alert.alert("Error", err.error || "Could not fetch pending anamnesis.");
        setLoading(false);
        return;
      }

      const json: PendingAnamnesisItem[] = await res.json();
      setPendingList(json);
    } catch (e) {
      console.error("Network error:", e);
      Alert.alert("Network Error", "Unable to fetch pending anamnesis.");
    } finally {
      setLoading(false);
    }
  }

  // 2) Render each card
  function renderItem({ item }: { item: PendingAnamnesisItem }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("PendingAnamnesisEdit", { anamnesis: item })
        }
      >
        <Text style={styles.titleText}>
          {item.p_name} {item.p_surname} — “{item.title}”
        </Text>
        <Text numberOfLines={2} style={styles.previewText}>
          {item.contents}
        </Text>
        <Text style={styles.footerText}>
          Doctor: {item.d_name} {item.d_surname}
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (pendingList.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noDataText}>No pending anamnesis</Text>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFFFFF", dark: "#000000" }}
      headerImage={
        <></> /* You can keep your existing header image or remove */
      }
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">Pending Anamnesis</ThemedText>
      </ThemedView>

      <FlatList
        data={pendingList}
        keyExtractor={(item) => item.id_anamnesis.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  noDataText: { fontSize: 18, color: "#666" },

  headerContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleText: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  previewText: { color: "#333", marginBottom: 6 },
  footerText: { fontSize: 12, color: "#555" },
});
