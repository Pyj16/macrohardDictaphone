import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {Recording} from "expo-av/build/Audio/Recording";
import {RouteProp, useRoute} from "@react-navigation/core";
import {setParams} from "expo-router/build/global-state/routing";
import { useEffect, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';
import {useNavigation} from '@react-navigation/native';
import { Stack, usePathname, Redirect, Slot } from 'expo-router';

import axios from 'axios';

import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import React from "react";

import { sha256, sha256Bytes } from 'react-native-sha256';

export default function Recordings() {
  const navigation = useNavigation();

  const [statusText, setStatusText] = React.useState("Idle")
  const route: RouteProp<{params: {recordingSession}}> = useRoute();
  const [recordingSession, setRecordingSession] = React.useState(route.params.recordingSession)
  const [recordings, setRecordings]= React.useState(recordingSession.recordings);

  const player = useAudioPlayer();

  const recordingsDir = FileSystem.documentDirectory + 'recordings/'

    function playRecordingAt(i: number){
        const audioPath = recordings.at(i)
        console.log("Playing: ", recordings.at(i))
        player.replace(audioPath);
        player.play();
    }

    useEffect(() => {
        handleLocalRead()
        }, [route])

    useEffect(() => {
    const backAction = () => {
      console.log("Sending recordings session", recordingSession)
      navigation.navigate("(drawer)", {
        sessionId: recordingSession.sessionId,
      })
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  async function saveSession(){
    let sessionName = 'session-' + recordingSession.sessionId
    let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', {intermediates: true})
    const data = JSON.stringify(recordingSession)
    console.log("new session data for", sessionName, ":", data)
    await FileSystem.writeAsStringAsync(sessionPath, data)
  }

  React.useEffect(() => {
      saveSession()
    }, [recordingSession]);

  async function deleteRecordingAt(i: number){
        await FileSystem.deleteAsync(recordings.at(i))
        handleLocalRead()
  }

  function rearrangeRecordings(i: number, j: number){
    if (i == 0 || j > recordings.length - 1)
      return;
    let newRecordings = [...recordings];
    let swapped = newRecordings[i];
    newRecordings[i] = newRecordings[j];
    newRecordings[j] = swapped;
    // @ts-ignore
    setRecordings(newRecordings)
    setRecordingSession({
        ...recordingSession,
        recordings: newRecordings,
        })
  }

    async function handleLocalRead (){

      console.log('fetching files');
      let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'recordings');
      console.log('fetched files');
      console.log(files);
      recordingPaths = []
      files.map((f) => {
          filePath = FileSystem.documentDirectory + 'recordings/' + f
          if(route.params.recordingSession.recordings.includes(filePath))
            recordingPaths.push(filePath)
          })
      console.log(recordingPaths)
      setRecordings(recordingPaths)
      setRecordingSession({
          ...recordingSession,
          recordings: recordingPaths,
          })
    }

  const handleUpload = async () => {
    console.log('starting handle')
    let audioSegments = []
    let form = new FormData()
    let i = 1
    for(let recording of recordingSession.recordings)
    {
        console.log('processing recording: ', recording)
        const uri = await FileSystem.getContentUriAsync(recording)
        console.log(uri)
        setStatusText('content uri: ',uri)
        form.append("audio_files", {
            uri: uri,
            name: 'audio' + i + '.m4a', // TO-DO: Use library to determine file type
            type: 'audio/mpeg',
          })
        i++;
    }

    const hashedId = await sha256(recordingSession.patientId).then( hash => {
        console.log("hash",hash);
        return hash
    })
    console.log(hashedId)
    form.append("id_", hashedId)
    form.append("title", recordingSession.title)

    console.log(form)


    console.log('attempting send')
//     const {data} = await axios.post('http://192.168.1.177:5000/test-multiple-recordings', {
//         id_: hashedId,
//         title: recordingSession.title,
//         audio_files: form
//       }, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       }
//     )
    fetch('http://192.168.1.177:5000/test-multiple-recordings', {
              method: 'POST',
              headers: {Accept: '*'},
              body: form,
              }).then( async (res) => res.json()).then((data)=>{
                      console.log(data)
                      return;
                      }).catch((err) => console.log(err));
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}
      headerImage={
        <Image
//           source={require('@/assets/images/react-logo.png')}
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
                        playRecordingAt(index)
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
