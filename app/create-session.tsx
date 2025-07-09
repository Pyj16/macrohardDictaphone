import { StyleSheet, Text, TextInput, TouchableOpacity, View, BackHandler } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {RouteProp, useRoute} from "@react-navigation/core";
import { useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import React from "react";

import { Picker } from '@react-native-picker/picker';
//import { AuthProvider, useAuth } from './services/authContext';

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
      fetch('https://mediphone-backend-854458745933.europe-west8.run.app/fetch-patients', {
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    position: "sticky",
    top: 6,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 0,
    paddingHorizontal: 8,
  },
  createButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 24,
  },
  createButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
});

