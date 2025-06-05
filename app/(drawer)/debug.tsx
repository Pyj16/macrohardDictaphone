import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {useNavigation} from "@react-navigation/native";
import React from "react";
import {Recording} from "expo-av/build/Audio/Recording";
import {Audio} from "expo-av";
import {GoogleSigninButton} from "@react-native-google-signin/google-signin";
import {signIn} from "@/app/services/authContext";

import RNRsa from 'react-native-rsa-native';
import AesGcmCrypto from 'react-native-aes-gcm-crypto';
import { Buffer } from 'buffer';
import { useEffect } from 'react';
import 'react-native-get-random-values';
import { public_key } from '@/app/key.ts'

export default function Debug() {
  const navigation = useNavigation();

  const [recording, setRecording] = React.useState<Recording>();
  const [recordings, setRecordings] = React.useState([]);

  const [statusText, setStatusText] = React.useState<string>("Idle");

  useEffect(() => {
      (async () => {
//         const RSAencrypted = await RNRsa.encrypt('hello RSA', public_key);
//         console.log("RSA: ",RSAencrypted)
//
//         const array = new Uint8Array(32);
//         console.log("array: ", array)
//         crypto.getRandomValues(array);
//         console.log("array: ", array)
//         const aesKeyBase64 = Buffer.from(array).toString('base64');
//         console.log("aesKeyBase64: ", aesKeyBase64)
//         let AESEncrypted = await encryptAesGcm('hello AES', aesKeyBase64);
//         console.log("AES: ", AESEncrypted)

      })();
    }, []);


  async function startRecording(){

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted"){
        setStatusText("Recording...")
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
            {
              ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
              // @ts-ignore
              outputFormat: ".mp3",
              uri: '',
            });
        setRecording(recording);
      }
    }
    catch (e){
      console.error(e);
    }
  }

  // TO-DO: Figure out how to make this prettier for TypeScript, remove all the ts-ignores.
  async function stopRecording(){
    setRecording(undefined);

    setStatusText("Saving")
    // @ts-ignore
    await recording.stopAndUnloadAsync();
    // @ts-ignore
    let allRecordings = [...recordings];
    // @ts-ignore
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    // @ts-ignore
    allRecordings.push({
      sound: sound,
      // @ts-ignore
      duration: getDurationFormatted(status.durationMillis),
      // @ts-ignore
      file: recording.getURI(),
    });


    // @ts-ignore
    setRecordings(allRecordings);

    setStatusText("Idle")
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 60000
    const seconds = Math.round(minutes - Math.floor(minutes) * 60);
    return seconds < 10 ? `${Math.floor(minutes)}"0${seconds}` : `${Math.floor(minutes)}:${seconds}`;
  }

  function playLastRecording() {
    setStatusText("Replaying...")
    // @ts-ignore
    if (recordings.length > 0) {
      // @ts-ignore
      recordings.at(recordings.length - 1).sound.replayAsync();
    }
  }

  function clearRecordings() {
    setRecordings([]);
  }

  function sendEncrypted(){
      }

  return (
      <ParallaxScrollView
          headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
          headerImage={
            <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.background}
            />
          }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Debug Page</ThemedText>
        </ThemedView>

        {/* Audio Interface UI */}
        <ThemedView style={styles.audioContainer}>
          <Text style={styles.statusText}>Status: {statusText}</Text>

          <TouchableOpacity style={styles.button} onPress={startRecording}>
            <Text style={styles.buttonText}>Record</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={
              // @ts-ignore
              () => navigation.navigate("recordings", {
                recordings: recordings,
              })}>Recordings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={
              // @ts-ignore
              () => navigation.navigate("personel")}>Personel Page</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={playLastRecording}>
            <Text style={styles.buttonText}>Play Last</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={sendEncrypted}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  background: {
    width: '100%',
    height: '100%',
    contentFit: 'cover',
  },
  audioContainer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    width: 160,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#34c759',
  },
  stopButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: 160,
      alignItems: 'center',
      backgroundColor: '#ff0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
