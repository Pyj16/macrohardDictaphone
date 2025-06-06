import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, BackHandler } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {Recording} from "expo-av/build/Audio/Recording";
import {RouteProp, useRoute} from "@react-navigation/core";
import {setParams} from "expo-router/build/global-state/routing";
import { useEffect, useState} from 'react';
import { useAudioPlayer } from 'expo-audio';
import {useNavigation} from '@react-navigation/native';
import { Stack, usePathname, Redirect, Slot } from 'expo-router';

import axios from 'axios';

import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import React from "react";



export default function EditSession() {
  const navigation = useNavigation();

  const [title, setTitle] = React.useState("")
  const [patientId, setPatientId] = React.useState("")
  const route: RouteProp<{params: {sessionId: number}}> = useRoute();
  const [session, setSession] = React.useState({})


  useEffect(() => {
      loadSession(route.params.sessionId)
      }, [])

  async function loadSession(i: number){
         let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions');
         console.log(files);
         let sessionPath = ''
         if(files.length === 0)
              return
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
              setSession(objectData);
              setPatientId(objectData.patientId)
              setTitle(objectData.title);
             }
         ).catch((e) => console.log(e))
    }


    async function handleSave(){
        const editedSession = {
            sessionId: session.sessionId,
            patientId: session.patientId,
            patientName: session.patientName,
            patientSurname: session.patientSurname,
            title: title,
            creationTime: session.creationTime,
            recordings: session.recordings
        }

      let sessionName = 'session-' + session.sessionId
        let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
        FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', {intermediates: true})
        const data = JSON.stringify(editedSession)
        console.log("new session data for", sessionName, ":", data)
        await FileSystem.writeAsStringAsync(sessionPath, data)
        navigation.navigate('(drawer)', {sessionId: session.sessionId})
    }

    async function handleDelete(){
      for(let r of session.recordings){
          console.log('deleting: ', r)
          await FileSystem.deleteAsync(r)
      }

      let sessionName = 'session-' + session.sessionId
      let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
      console.log('deleting: ', sessionPath)
      await FileSystem.deleteAsync(sessionPath)
      navigation.navigate('(drawer)', {sessionId: session.sessionId})
    }

  return (
    <View className="flex-1 bg-white">
        <ThemedView className="sticky top-6 z-10 bg-white border-b border-gray-300 px-5 py-4">
          <ThemedText type="title" className="text-2xl font-bold text-center">
            Editing Session
          </ThemedText>
        </ThemedView>

      <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}>

        <TextInput
          className="border border-gray-300 rounded-md px-4 py-2 m-4"
          onChangeText={setTitle}
          value={title}
          placeholder="Title"
        />
        <Text
          className="border border-gray-300 rounded-md px-4 py-2 m-4"
        >
        {session.patientName + " " + session.patientSurname}
        </Text>

        {/* Save button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-md py-3 mx-4 mt-6"
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">
            Save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 rounded-md py-3 mx-4 mt-6"
          onPress={handleDelete}
        >
          <Text className="text-white text-center font-semibold">
            Delete
          </Text>
        </TouchableOpacity>
      </ParallaxScrollView>
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
