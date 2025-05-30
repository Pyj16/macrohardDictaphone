import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL = 'http://192.168.64.30:5000';

export default function Statistics() {
  const [doctorStats, setDoctorStats] = useState([]);
  const [hospitalStats, setHospitalStats] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const [docRes, hospRes] = await Promise.all([
        fetch(`${SERVER_URL}/stats/doctors`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${SERVER_URL}/stats/hospitals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      const [docData, hospData] = await Promise.all([
        docRes.json(),
        hospRes.json(),
      ]);

      if (!Array.isArray(docData)) {
        throw new Error('Doctor stats response is not an array');
      }

      setDoctorStats(docData);
      setHospitalStats(hospData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading statistics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Doctor Statistics</Text>
        {doctorStats.map((item, index) => (
          <View key={`doc-${index}`} style={styles.card}>
            <Text style={styles.title}>{item.name} {item.surname}</Text>
            <Text style={styles.text}>Email: {item.email}</Text>
            <Text style={styles.text}>Patients: {item.n_patients}</Text>
            <Text style={styles.text}>Anamnesis: {item.n_anamnesis}</Text>
          </View>
        ))}

        <Text style={styles.heading}>Hospital Statistics</Text>
        {hospitalStats.map((item, index) => (
          <View key={`hosp-${index}`} style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.text}>Patients: {item.n_patients}</Text>
            <Text style={styles.text}>Doctors: {item.n_doctors}</Text>
            <Text style={styles.text}>Anamnesis: {item.n_anamnesis}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4'
  },
  scrollContent: {
    padding: 16
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  text: {
    fontSize: 14,
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
