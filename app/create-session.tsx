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



export default function Sessions() {
  const navigation = useNavigation();

  const [title, setTitle] = React.useState("New Session Title")
  const [patientId, setPatientId] = React.useState("Patient id")
  const route: RouteProp<{params: {sessionId: number}}> = useRoute();


  useEffect(() => {
      handleLoadSessions()
      }, [])

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
    async function handleCreate(){
        const emptySession = {
            sessionId: route.params.sessionId,
            patientId: '',
            title: title,
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
    <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Debug Page</ThemedText>
      </ThemedView>
        <TextInput
            style={styles.editField}
            onChangeText={setTitle}
            value={title}
        />
        <TextInput
            style={styles.editField}
            onChangeText={setPatientId}
            value={patientId}
        />

        <TouchableOpacity style={[styles.button, styles.submitButton]}>
          <Text style={styles.buttonText} onPress={handleCreate}>Create New Session</Text>
        </TouchableOpacity>
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
