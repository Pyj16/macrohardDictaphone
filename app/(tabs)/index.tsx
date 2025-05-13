import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React from "react";
import {Recording} from "expo-av/build/Audio/Recording";
import {Audio} from "expo-av";
import {useNavigation} from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [recording, setRecording] = React.useState<Recording>();
  const [recordings, setRecordings] = React.useState([]);

  async function startRecording(){

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted"){
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
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 60000
    const seconds = Math.round(minutes - Math.floor(minutes) * 60);
    return seconds < 10 ? `${Math.floor(minutes)}"0${seconds}` : `${Math.floor(minutes)}:${seconds}`;
  }

  function playLastRecording() {
    // @ts-ignore
    if (recordings.length > 0) {
      // @ts-ignore
      recordings.at(recordings.length - 1).sound.replayAsync();
    }
  }

  function clearRecordings() {
    setRecordings([]);
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
        <ThemedText type="title">Medicinski diktafon</ThemedText>
      </ThemedView>

      {/* Audio Interface UI */}
      <ThemedView style={styles.audioContainer}>
        <Text style={styles.statusText}>Status: Idle</Text>

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

        <TouchableOpacity style={styles.button} onPress={playLastRecording}>
          <Text style={styles.buttonText}>Play Last</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.submitButton]}>
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
