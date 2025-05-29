import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React from "react";
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

const testSession1 = {
    sessionId: '0',
    patientId: '1',
    title: 'AnaTitle',
    recordings: []
    }

const testSession2 = {
    sessionId: '1337',
    patientId: '2',
    title: 'TitleAna',
    recordings: []
    }

export default function HomeScreen() {
  const navigation = useNavigation();
  const route: RouteProp<{params: {sessionId: number}}> = useRoute();
  const [recordingSession, setRecordingSession] = React.useState(testSession2);

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

  // New Implementation
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = React.useState(false);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
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

    let newRecording = filePath
    let newRecordings = [...recordingSession.recordings]
    newRecordings.push(newRecording)

    setRecordingSession({
        ...recordingSession,
        recordings: newRecordings,
        })


    console.log(filePath)
    console.log(recordingSession.recordings)

  };

  React.useEffect(() => {
        saveSession()
  }, [recordingSession]);

  React.useEffect(() => {
      const id = route.params.sessionId ? route.params.sessionId : 1337
      loadSession(id)
  }, [route])

  async function saveSession(){
      let sessionName = 'session-' + recordingSession.sessionId
              let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
              FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', {intermediates: true})
              const data = JSON.stringify(recordingSession)
              console.log("new session data for", sessionName, ":", data)
              await FileSystem.writeAsStringAsync(sessionPath, data)
      }
  React.useEffect(() => {
    (async () => {
      const stat = await AudioModule.requestRecordingPermissionsAsync();
      if (!stat.granted) {
        alert('Permission to access microphone was denied');
      }
    })();
  }, []);

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

  async function loadSession(i: number){
       let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions');
       console.log(files);
       let sessionPath = ''
       files.map(async (f) => {
           filePath = FileSystem.documentDirectory + 'sessions/' + f
           const checkSesh = 'session-' + i
           console.log('comparing', checkSesh, "with", f)
           if(checkSesh === f)
             sessionPath = filePath
           })
       FileSystem.readAsStringAsync(sessionPath).then((data) => {
            console.log(data)
            setRecordingSession(JSON.parse(data))
           }
       ).catch((e) => console.log(e))
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

        <TouchableOpacity style={styles.button} onPress={() => loadSession(0)}>
                  <Text style={styles.buttonText}>Load session 0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={
            // @ts-ignore
            () => navigation.navigate("recordings", {
                    recordingSession: recordingSession,
                })}>Recordings</Text>
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
