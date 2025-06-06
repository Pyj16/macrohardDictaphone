// app/AnamnesisDetail.tsx

import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RSA } from 'react-native-rsa-native';
import AesGcmCrypto from 'react-native-aes-gcm-crypto';
import { Buffer } from 'buffer';
import { sha256 } from 'react-native-sha256';

type RootStackParamList = {
  AnamnesisDetail: {
    patientId: number;
    anamnesisId: number;
    contents: string;
  };
};

export default function AnamnesisDetail() {
  const route = useRoute<RouteProp<RootStackParamList, 'AnamnesisDetail'>>();
  const { patientId, anamnesisId, contents: decryptedContents } = route.params!;

  const [anamnesisText, setAnamnesisText] = React.useState<string>(decryptedContents);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  async function saveAnamnesis() {
    try {
      setIsSaving(true);

      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const aesKeyBase64 = Buffer.from(array).toString('base64');

      const result = await AesGcmCrypto.encrypt(anamnesisText, false, aesKeyBase64);

      const rsaPair = await RSA.generateKeys(2048);
      const encrypted_key = await RSA.encrypt(aesKeyBase64, rsaPair.public);

      const ivBytes = Buffer.from(result.iv, 'hex');
      const contentBytes = Buffer.from(result.content, 'base64');
      const tagBytes = Buffer.from(result.tag, 'hex');
      const combined = Buffer.concat([ivBytes, contentBytes, tagBytes]);
      const encrypted_text = combined.toString('base64');

      const hashedId = await sha256(patientId.toString());

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found. Please log in.');
        setIsSaving(false);
        return;
      }

      const response = await fetch('http://192.168.64.30:5000/test-rsa-update', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          encrypted_key,
          encrypted_text,
          patient_id: hashedId,
          anamnesis_id: anamnesisId,
        }),
      });

      const resJson = await response.json();
      console.log('Save response:', resJson);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Anamnesis for Patient #{patientId}</Text>

      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Enter anamnesis…"
          value={anamnesisText}
          onChangeText={setAnamnesisText}
        />
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={saveAnamnesis}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving…' : 'Save Anamnesis'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fdfdfd' },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  editorContainer: {
    flex: 1,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  textInput: {
    minHeight: 200,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#34c759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#aaa',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
