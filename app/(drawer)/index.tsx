import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React from "react";
// import {Recording, RecordingStatus} from "expo-av/build/Audio/Recording";
// import {Audio} from "expo-av";
import { useAudioRecorder, RecordingOptions, AudioModule, RecordingPresets } from 'expo-audio';
import {useNavigation} from '@react-navigation/native';
import { signIn} from '../services/authService.ts';
import * as FileSystem from 'expo-file-system';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {RouteProp, useRoute} from "@react-navigation/core";
import {setParams} from "expo-router/build/global-state/routing";

export default function HomeScreen() {
  const navigation = useNavigation();

  // Button logic
  enum Status {
    idle,
    recording,
    replaying,
  }

  const [status, setStatus] = React.useState(Status.idle);
  const [buttonText, setButtonText] = React.useState('Record');
  const [buttonStyle, setButtonStyle] = React.useState([styles.recordButton, styles.recordButtonIdle]);
  // Button logic

  // Debug status
  const [statusText, setStatusText] = React.useState<string>("Idle");


  // old implementation
//   const [recording, setRecording] = React.useState<Recording>();
//   const [recordings, setRecordings] = React.useState([]);

  // New Implementation
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = React.useState(false);
  const route: RouteProp<{params: {recordings: []}}> = useRoute();
  const [recordings, setRecordings] = React.useState([]);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
//     console.log(audioRecorder.uri)
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setIsRecording(false);

    let fileName = 'recording-' + Date.now()
    let filePath = FileSystem.documentDirectory + 'recordings/' + fileName

    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', {intermediates: true})
    await FileSystem.moveAsync({
            from: audioRecorder.uri,
            to: filePath
        })

    console.log(filePath)


    let newRecording = {
        file: filePath
        }
    let newRecordings = [...recordings]
    newRecordings.push(newRecording)
    setRecordings(newRecordings)
  };

  React.useEffect(() => {
      if(route?.params?.recordings !== undefined){
        setRecordings(route.params.recordings)
          }
      }, [route.params])

  React.useEffect(() => {
    (async () => {
      const stat = await AudioModule.requestRecordingPermissionsAsync();
      if (!stat.granted) {
        alert('Permission to access microphone was denied');
      }
    })();
  }, []);

//  Old implementation
//   async function startRecording(){
//
//     try {
//       const perm = await Audio.requestPermissionsAsync();
//       if (perm.status === "granted"){
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: true,
//           playsInSilentModeIOS: true,
//         });
//         const { recording } = await Audio.Recording.createAsync(
//               Audio.RecordingOptionsPresets.HIGH_QUALITY
//             // (status: RecordingStatus) => {
//             //   // @ts-ignore
//             //   let loudness = isNaN(status.metering + 160) ? 10 : Math.max(status.metering + 160, 10);
//             //   ((waves: any) => [loudness, ...waves]);
//             // }
//             );
//         setRecording(recording);
//       }
//     }
//     catch (e){
//       console.error(e);
//     }
//   }
//
//   // TO-DO: Figure out how to make this prettier for TypeScript, remove all the ts-ignores.
//   async function stopRecording(){
//     if (!recording){
//         return;
//     }
//     setRecording(undefined);
//     await recording.stopAndUnloadAsync();
//     let allRecordings = [...recordings];
//     const { sound, status } = await recording.createNewLoadedSoundAsync();
//
//     console.log(sound);
//
//     // TODO: Add functionality to not save audio shorter than 1 second
//     // @ts-ignore
//     // if(status.durationMillis > 1500){
//     // }
//       allRecordings.push({
//         sound: sound,
//         file: recording.getURI(),
//       });
//
//       console.log(allRecordings);
//
//       setRecordings(allRecordings);
//   }
//
//   function getDurationFormatted(milliseconds: number) {
//     const minutes = milliseconds / 60000
//     const seconds = Math.round(minutes - Math.floor(minutes) * 60);
//     return seconds < 10 ? `${Math.floor(minutes)}"0${seconds}` : `${Math.floor(minutes)}:${seconds}`;
//   }
//
//   function playLastRecording() {
//     setStatusText("Replaying...")
//     // @ts-ignore
//     if (recordings.length > 0) {
//       // @ts-ignore
//       recordings.at(recordings.length - 1).sound.replayAsync();
//     }
//   }



  function handleButtonUpdate(){
    if(status == Status.idle){
      setStatus(Status.recording);
      startRecording();
      setButtonStyle([styles.recordButton, styles.recordButtonActive])
      setButtonText('Stop')
      setStatusText("Recording...")
    }
    if(status == Status.recording){
      setStatus(Status.idle);
      stopRecording();
      setButtonStyle([styles.recordButton, styles.recordButtonIdle]);
      setButtonText('Record')
      setStatusText("Idle");
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          style={styles.background}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Medicinski diktafon</ThemedText>
      </ThemedView>

      {/* Audio Interface UI */}
      <ThemedView style={styles.audioContainer}>
        <Text style={styles.statusText}>Status: {statusText}</Text>

        <TouchableOpacity style={buttonStyle} onPress={handleButtonUpdate}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={
            // @ts-ignore
            () => navigation.navigate("recordings", {
              recordings: recordings,
            })}>Recordings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText} onPress={() =>{
                    console.log(route.params)
                      }
                    }>Params</Text>
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
  recordButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4a90e2',
    borderRadius: 100,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#EEEEEE',
    width: 100,
    height: 100,
    alignItems: 'center',
  },
  recordButtonIdle: {
    backgroundColor: '#34c759',
  },
  recordButtonActive: {
    backgroundColor: '#ff0000',
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
