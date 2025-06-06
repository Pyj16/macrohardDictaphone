// app/DoctorDetail.tsx

import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RSA } from 'react-native-rsa-native';
import AesGcmCrypto from 'react-native-aes-gcm-crypto';
import { Buffer } from 'buffer';

type RootStackParamList = {
  DoctorDetail: { doctorEmail: string };
};

export default function DoctorDetail() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DoctorDetail'>>();
  const { doctorEmail } = route.params!;

  const [patients, setPatients] = React.useState<any[]>([]);
  const [loadingPatientId, setLoadingPatientId] = React.useState<number | null>(null);

  async function fetchPatients() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No token found. Please log in.');
        return;
      }
      const res = await fetch('https://mediphone-backend-854458745933.europe-west8.run.app/fetch-patients', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctor_email: doctorEmail }),
      });
      const json = await res.json();
      setPatients(json.patients || []);
    } catch (e) {
      console.error('❌ Failed to fetch patients for doctor:', e);
    }
  }

  async function handlePatientPress(patientId: number) {
    setLoadingPatientId(patientId);

    try {
      const keyPair = await RSA.generateKeys(2048);
      const publicKeyPem = keyPair.public; // PKCS#1 PEM

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No token found. Please log in.');
        setLoadingPatientId(null);
        return;
      }

      const response = await fetch('https://mediphone-backend-854458745933.europe-west8.run.app/fetch-anamnesis', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ public_key: publicKeyPem }),
      });

      // 4) Read raw text for logging
      const rawText = await response.text();
      console.log('raw fetch-anamnesis response:', rawText.slice(0, 200));

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse JSON from /fetch-anamnesis:', parseErr);
        setLoadingPatientId(null);
        return;
      }

      if (!data.encrypted_key || !Array.isArray(data.anamnesis)) {
        console.error('Unexpected response structure:', data);
        setLoadingPatientId(null);
        return;
      }

      const dcKey = await RSA.decrypt64(data.encrypted_key, keyPair.private);
      console.log('Decrypted AES key:', dcKey);

      const matches = data.anamnesis.filter((item: any) => item.id_patient === patientId);
      if (matches.length === 0) {
        console.warn(`⚠No pending anamnesis found for patient ${patientId}`);
        setLoadingPatientId(null);
        return;
      }

      const one = matches[0];
      const decrypted = await decryptAesGcm(one.contents, dcKey);

      navigation.navigate('AnamnesisDetail', {
        patientId,
        anamnesisId: one.id_anamnesis,
        contents: decrypted,
      });
    } catch (err) {
      console.error('Error fetching/decrypting patient’s anamnesis:', err);
    } finally {
      setLoadingPatientId(null);
    }
  }

  /** AES‐GCM decrypt helper */
  async function decryptAesGcm(encryptedBase64: string, binaryKey: string) {
    const raw = Buffer.from(encryptedBase64, 'base64');
    const keyHex = Buffer.from(binaryKey, 'base64').toString('hex');
    const keyBase64 = Buffer.from(keyHex, 'hex').toString('base64');

    const nonce = raw.slice(0, 12);
    const tag = raw.slice(-16);
    const ciphertext = raw.slice(12, raw.length - 16);

    const nonceBase64 = nonce.toString('hex');
    const tagBase64 = tag.toString('hex');
    const ciphertextBase64 = ciphertext.toString('base64');

    try {
      const decrypted = await AesGcmCrypto.decrypt(
        ciphertextBase64,
        keyBase64,
        nonceBase64,
        tagBase64,
        false
      );
      return decrypted;
    } catch (err) {
      console.error('AES‐GCM decryption failed:', err);
      return '';
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patients of {doctorEmail}</Text>
      <ScrollView style={styles.scrollList}>
        {patients.map((pat, idx) => (
          <TouchableOpacity
            key={`pat-${idx}`}
            style={styles.card}
            onPress={() => handlePatientPress(pat.patient_id)}
          >
            <View style={styles.patientRow}>
              <Text style={styles.cardTitle}>{pat.name} {pat.surname}</Text>
              {loadingPatientId === pat.patient_id && (
                <ActivityIndicator size="small" color="#4a90e2" style={{ marginLeft: 8 }} />
              )}
            </View>
            <Text>ID: {pat.patient_id}</Text>
          </TouchableOpacity>
        ))}
        {patients.length === 0 && (
          <Text style={styles.noDataText}>No patients found for this doctor.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: '#f9f9f9' },
  header: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  scrollList: { paddingHorizontal: 12 },

  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#AAA',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});
