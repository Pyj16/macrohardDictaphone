import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {Recording} from "expo-av/build/Audio/Recording";
import {RouteProp, useRoute} from "@react-navigation/core";
import {setParams} from "expo-router/build/global-state/routing";

import * as FileSystem from 'expo-file-system';
import React from "react";

export default function Recordings() {
  const [statusText, setStatusText] = React.useState("Idle")
  const route: RouteProp<{params: {recordings: []}}> = useRoute();
  const {recordings} = route.params;

  function playRecordingAt(i: number){
      // @ts-ignore
      recordings.at(i).sound.replayAsync();
  }

  function deleteRecordingAt(i: number){
    let newRecordings = recordings.splice(i, 1);
    // @ts-ignore
    setParams(newRecordings)
  }

  function rearrangeRecordings(i: number, j: number){
    if (i == 0 || j > recordings.length - 1)
      return;
    let newRecordings = recordings;
    let swapped = newRecordings[i];
    newRecordings[i] = newRecordings[j];
    newRecordings[j] = swapped;
    // @ts-ignore
    setParams(newRecordings)
  }

  const handleUpload = async () => {

    let body = new FormData();

    recordings.map(async (recording) => {
      // @ts-ignore
      let contentUri = await FileSystem.getContentUriAsync(recording.file)
      setStatusText(contentUri)

      // @ts-ignore
      body.append("audio_file", {
        // @ts-ignore
        uri: contentUri,
        name: 'audio.mp3',
        type: 'audio/mpeg',
      });
    })

    console.log(body)

    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5000/transcribe', true);
    xhr.setRequestHeader("Accept", "*");
    xhr.send(body);

    // Working
    // let xhr = new XMLHttpRequest();
    // xhr.open('POST', 'https://154b-46-122-66-48.ngrok-free.app/transcribe', true);
    // xhr.setRequestHeader("Accept", "*");
    // xhr.send(body);

  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}
      headerImage={
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.background}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Debug Page</ThemedText>
      </ThemedView>

      <ThemedView style={styles.audioContainer}>
        <Text style={styles.statusText}>Status: {statusText}</Text>


        {
          recordings.map((recording, index) => {
            return (
                <>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={() =>
                        //@ts-ignore
                        recording.sound.replayAsync()
                    }>Play #{index}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.stopButton} onPress={() =>
                        deleteRecordingAt(index)
                    }>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}>
                    <Text disabled={(index == 0)} style={styles.stopButton} onPress={() =>
                        rearrangeRecordings(index, index - 1)
                    }>↑</Text>
                  </TouchableOpacity>
                </>
            )
          })
        }

        <TouchableOpacity style={[styles.button, styles.submitButton]}>
          <Text style={styles.buttonText} onPress={handleUpload}>Submit</Text>
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
