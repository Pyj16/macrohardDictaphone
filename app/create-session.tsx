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

import { Picker } from '@react-native-picker/picker';
import { AuthProvider, useAuth } from './services/authContext';

const dummyPatients=[
    {
        id: 1,
        name: 'John',
        surname: 'Doe'
    },
    {
        id: 2,
        name: 'Jane',
        surname: 'Doe'
    },
    {
        id: 3,
        name: 'Jeb',
        surname: 'Doe'
    },
]

export default function CreateSession() {
  const navigation = useNavigation();

  const [title, setTitle] = React.useState("")
  const [patientId, setPatientId] = React.useState("")
  const route: RouteProp<{params: {sessionId: number}}> = useRoute();
  const [selectedPatient, setSelectedPatient] = React.useState({})
  const [allPatients, setAllPatients] = React.useState([])

  const { userInfo, jwt } = useAuth();


  useEffect(() => {
      handleLoadSessions()
      getAllPatients()
      }, [])

  useEffect(() => {
      console.log(selectedPatient)
      }, [selectedPatient])

  async function handleLoadSessions (){
        console.log('loading sessions')
        let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions');
        let loadedSessions = await Promise.all(
              files.map(async (f) => {
                const filePath = FileSystem.documentDirectory + 'sessions/' + f;
                const data = await FileSystem.readAsStringAsync(filePath);
                return JSON.parse(data);
              })
            );

            setSessions(loadedSessions);
  }

  async function getAllPatients(){
      console.log('fetching all patients')
      const token = "Bearer " + jwt
      fetch('http://192.168.1.177:5000/fetch-patients', {
                    method: 'POST',
                    headers: {Accept: '*', 'Content-Type': 'application/json', Authorization: token},
                    body: JSON.stringify({"doctor_email": userInfo.email})
                    }).then( async (res) => res.json()).then((data) => {
                            console.log(data.patients)
                            setAllPatients(data.patients)
                            return;
                            }).catch((err) => console.log(err));
  }

    async function handleCreate(){
        const emptySession = {
            sessionId: route.params.sessionId,
            patientId: selectedPatient.patient_id,
            patientName: selectedPatient.name,
            patientSurname: selectedPatient.surname,
            title: title,
            creationTime: Date.now(),
            recordings: []
        }

      let sessionName = 'session-' + emptySession.sessionId
      let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
      FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', {intermediates: true})
      const data = JSON.stringify(emptySession)
      console.log("new session data for", sessionName, ":", data)
      await FileSystem.writeAsStringAsync(sessionPath, data)
      navigation.navigate("(drawer)", {sessionId: route.params.sessionId,})
    }

  return (
    <View className="flex-1 bg-white">
        <ThemedView className="sticky top-6 z-10 bg-white border-b border-gray-300 px-5 py-4">
          <ThemedText type="title" className="text-2xl font-bold text-center">
            New Session
          </ThemedText>
        </ThemedView>

      <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}>
        {/* Title Container */}

        {/* Input fields */}
        <TextInput
          className="border border-gray-300 rounded-md px-4 py-2 m-4"
          onChangeText={setTitle}
          value={title}
          placeholder="Title"
        />
        <View className="border text-gray border-gray-300 rounded-md m-4 px-2">
            <Picker
              selectedValue={selectedPatient}
              onValueChange={(v)=>{setSelectedPatient(v)}}
            >
              <Picker.Item label="Select Patient" value="" />
              {
                  allPatients.map((p, index) => {
                      return(
                          <Picker.Item label={p.name + " " + p.surname} value={p}/>
                      );
                  })
              }
            </Picker>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-md py-3 mx-4 mt-6"
          onPress={handleCreate}
        >
          <Text className="text-white text-center font-semibold">
            Create New Session
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
