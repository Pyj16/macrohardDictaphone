import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const SERVER_URL = 'https://mediphone-backend-854458745933.europe-west8.run.app';

export default function Statistics() {
  const [doctorStats, setDoctorStats] = useState([]);
  const [hospitalStats, setHospitalStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'doctor' | 'hospital'>('doctor');

  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSort, setDoctorSort] = useState('name');
  const [hospitalSort, setHospitalSort] = useState('name');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');

        const [docRes, hospRes] = await Promise.all([
          fetch(`${SERVER_URL}/stats/doctors`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
          fetch(`${SERVER_URL}/stats/hospitals`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          }),
        ]);

        const [docData, hospData] = await Promise.all([docRes.json(), hospRes.json()]);

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

  const filteredDoctors = [...doctorStats]
    .filter(d =>
      `${d.name} ${d.surname}`.toLowerCase().includes(doctorSearch.toLowerCase())
    )
    .sort((a, b) => {
      switch (doctorSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'patients':
          return b.n_patients - a.n_patients;
        case 'anamnesis':
          return b.n_anamnesis - a.n_anamnesis;
        default:
          return 0;
      }
    });

  const sortedHospitals = [...hospitalStats].sort((a, b) => {
    switch (hospitalSort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'patients':
        return b.n_patients - a.n_patients;
      case 'doctors':
        return b.n_doctors - a.n_doctors;
      case 'anamnesis':
        return b.n_anamnesis - a.n_anamnesis;
      default:
        return 0;
    }
  });

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
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'doctor' && styles.activeTab]}
          onPress={() => setActiveTab('doctor')}
        >
          <Text style={styles.tabText}>Doctor Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'hospital' && styles.activeTab]}
          onPress={() => setActiveTab('hospital')}
        >
          <Text style={styles.tabText}>Hospital Stats</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'doctor' ? (
          <>
            <TextInput
              placeholder="Search doctors..."
              value={doctorSearch}
              onChangeText={setDoctorSearch}
              style={styles.searchInput}
            />
            <Picker
              selectedValue={doctorSort}
              onValueChange={setDoctorSort}
              style={styles.picker}
            >
              <Picker.Item label="Sort by Name" value="name" />
              <Picker.Item label="Sort by number of Patients" value="patients" />
              <Picker.Item label="Sort by number of Anamnesis" value="anamnesis" />
            </Picker>
            {filteredDoctors.map((item, index) => (
              <View key={`doc-${index}`} style={styles.card}>
                <Text style={styles.title}>{item.name} {item.surname}</Text>
                <Text style={styles.text}>Email: {item.email}</Text>
                <Text style={styles.text}>Patients: {item.n_patients}</Text>
                <Text style={styles.text}>Anamnesis: {item.n_anamnesis}</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <Picker
              selectedValue={hospitalSort}
              onValueChange={setHospitalSort}
              style={styles.picker}
            >
              <Picker.Item label="Sort by Name" value="name" />
              <Picker.Item label="Sort by number of Patients" value="patients" />
              <Picker.Item label="Sort by number of Doctors" value="doctors" />
              <Picker.Item label="Sort by number of Anamnesis" value="anamnesis" />
            </Picker>
            {sortedHospitals.map((item, index) => (
              <View key={`hosp-${index}`} style={styles.card}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.text}>Patients: {item.n_patients}</Text>
                <Text style={styles.text}>Doctors: {item.n_doctors}</Text>
                <Text style={styles.text}>Anamnesis: {item.n_anamnesis}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#eee',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  text: { fontSize: 14, color: '#333' },
});
