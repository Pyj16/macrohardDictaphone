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

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';

import axios from 'axios';

import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import React from "react";

import { sha256, sha256Bytes } from 'react-native-sha256';

import { AuthProvider, useAuth } from './services/authContext';

export default function Recordings() {
  const navigation = useNavigation();

  const [statusText, setStatusText] = React.useState("Idle")
  const route: RouteProp<{params: {recordingSession}}> = useRoute();
  const [recordingSession, setRecordingSession] = React.useState(route.params.recordingSession)
  const [recordings, setRecordings]= React.useState(recordingSession.recordings);
  const [playingAt, setPlayingAt] = React.useState(-1);
  const [remainingTime, setRemainingTime] = React.useState(1);

  const player = useAudioPlayer();
  const { userInfo, jwt } = useAuth();

  const recordingsDir = FileSystem.documentDirectory + 'recordings/'

    function playRecordingAt(i: number){
        const audioPath = recordings.at(i)
        console.log("Playing: ", recordings.at(i))
        player.replace(audioPath);
        setPlayingAt(i)
        player.play();
        setRemainingTime(remainingTime * -1)
    }

    function pauseRecordingAt(i: number){
            console.log("Pausing: ", recordings.at(i))
            player.pause();
            player.remove();
            setPlayingAt(-1)
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

   useEffect(() => {
       if(player.playing){
         setTimeout(() => setRemainingTime(remainingTime * -1), 1);
       }
       else{
           setPlayingAt(-1)
       }
   }, [remainingTime]);

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
    const token = "Bearer " + jwt
    fetch('http://192.168.1.177:5000/test-multiple-recordings', {
              method: 'POST',
              headers: {Accept: '*', Authorization: token},
              body: form,
              }).then( async (res) => res.json()).then((data)=>{
                      console.log(data)
                      return;
                      }).catch((err) => console.log(err));
  };

  return (
      <View className="flex-1 bg-white">
         <ThemedView className="sticky top-6 z-10 bg-white border-b border-gray-300 px-5 py-4">
            <ThemedText type="title" className="text-center">
              Recordings
            </ThemedText>
          </ThemedView>
         <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}>

           <ThemedView className="py-4 space-y-4">
             {/*<Text className="text-gray-700 text-base">Status: {statusText}</Text>*/}
             {
                recordings.length === 0 ?
                <Text className="flex-1 text-center text-2xl text-gray-800 text-base">
                   No recordings
                 </Text>
                 :
                 <></>
             }

             {recordings.map((recording, index) => (
               <View
                 key={index}
                 className="flex-row items-center justify-between bg-gray-200 rounded-md p-4 mb-3"
               >
                 {/*Title*/}
                 <Text className="flex-1 text-gray-800 text-base">
                   Recording #{index + 1}
                 </Text>

                 {/*Buttons*/}
                 <View className="flex-row space-x-2">
                    <TouchableOpacity>
                      <View className="mr-2 w-10 h-10 flex items-center justify-center">
                        {
                           playingAt === index ?
                           <AntDesign onPress={() => pauseRecordingAt(index)} name="pausecircleo" size={24} color="black" />
                            :
                           <AntDesign onPress={() => playRecordingAt(index)} name="play" size={24} color="black" />
                        }
                      </View>
                    </TouchableOpacity>

                   {/*Up button*/}
                   <TouchableOpacity
                     disabled={index === 0}
                     onPress={() => index > 0 && rearrangeRecordings(index, index - 1)}
                   >
                     <View className={`mr-1 w-10 h-10 rounded-md flex items-center justify-center bg-gray-300 ${index === 0 ? 'opacity-50' : ''}`}>
                       <AntDesign name="caretup" size={20} color="black" />
                     </View>
                   </TouchableOpacity>

                   {/*Down button*/}
                   <TouchableOpacity
                     disabled={index === recordings.length - 1}
                     onPress={() => rearrangeRecordings(index, index + 1)}
                   >
                     <View className={`mr-2 w-10 h-10 rounded-md flex items-center justify-center bg-gray-300 ${index === recordings.length - 1 ? 'opacity-50' : ''}`}>
                       <AntDesign name="caretdown" size={20} color="black" />
                     </View>
                   </TouchableOpacity>
                   {/* Delete button*/}
                   <TouchableOpacity onPress={() => deleteRecordingAt(index)}>
                     <View className="w-10 h-10 bg-red-500 rounded-md flex items-center justify-center">
                       <FontAwesome5 name="trash" size={20} color="white" />
                     </View>
                   </TouchableOpacity>
                 </View>
               </View>
             ))}

           </ThemedView>
         </ParallaxScrollView>

         <TouchableOpacity
          style={{ width: '75%', alignSelf: 'center' }}
          className="bottom-10  bg-green-600 rounded-md p-4 mb-3"
           onPress={handleUpload}
         >
           <Text className="text-white text-center font-semibold">Submit</Text>
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
