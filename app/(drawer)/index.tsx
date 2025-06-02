import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import Entypo from '@expo/vector-icons/Entypo';
import { styled } from 'nativewind';
import { Pressable } from 'react-native';

import '@/global.css';

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
//
// const StyledView = styled(View);
// const StyledTouchableOpacity = styled(TouchableOpacity);

export default function HomeScreen() {
  const navigation = useNavigation();
  const route: RouteProp<{params: {sessionId: number}}> = useRoute();
  const [recordingSession, setRecordingSession] = React.useState(testSession2);

  // Button logic
  enum Status {
    idle,
    recording,
    replaying,
    inactive,
  }

  const [status, setStatus] = React.useState(Status.inactive);
  const [buttonStyle, setButtonStyle] = React.useState("bg-green-500");
  // Button logic

  // Session status
  const [sessionText, setSessionText] = React.useState()

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
      const id = route.params.sessionId
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
            let objectData = JSON.parse(data)
            setRecordingSession(objectData)
            setStatus(Status.idle)
            setSessionText("Session: " + objectData.title)
           }
       ).catch((e) => console.log(e))
  }


  function handleButtonUpdate(){
    if(status == Status.idle){
      setStatus(Status.recording);
      startRecording();
      setButtonStyle("bg-red-500");
      setStatusText("Recording...")
    }
    if(status == Status.recording){
      setStatus(Status.idle);
      stopRecording();
      setButtonStyle("bg-green-500")
      setStatusText("Idle");
    }
    if(status == Status.inactive){
//       setStatus(Status.idle);
      setSessionText("No session active. Select or create one.")
      setButtonStyle("bg-gray-500");
      setStatusText("Idle");
    }
  }

  return (
    <View className="flex-1">
        <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}>
          {/* Audio Interface UI */}
          <ThemedView className="flex-1 items-center space-y-4 pb-40">
            <Text>{sessionText}</Text>
            <TouchableOpacity className="py-3 px-4 bg-blue-500 rounded-lg w-40 items-center"
                onPress={() => navigation.navigate('sessions') }
            >
              <Text>Sessions</Text>
            </TouchableOpacity>

            { status == Status.inactive ?
                <></>
                  :
                <TouchableOpacity className="py-3 px-4 bg-blue-500 rounded-lg w-40 items-center">
                  <Text
                    onPress={() =>
                      // @ts-ignore
                      navigation.navigate('recordings', {
                        recordingSession: recordingSession,
                      })
                    }
                  >
                    Recordings
                  </Text>
                </TouchableOpacity>
            }

          </ThemedView>
        </ParallaxScrollView>

        {/* Sticky Bottom Button */}
        <TouchableOpacity
          className="absolute bottom-20 left-1/2 -translate-x-1/2 items-center"
          onPress={handleButtonUpdate}
        >
          <View className={'w-36 h-36 rounded-full items-center justify-center shadow-md ' + buttonStyle}>
            <Entypo name="mic" size={48} color="black" />
          </View>
        </TouchableOpacity>
      </View>
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
    flex: 1,
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
