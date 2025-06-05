import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, BackHandler } from 'react-native';

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
import Entypo from '@expo/vector-icons/Entypo';

import axios from 'axios';

import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import React from "react";



export default function Sessions() {
  const navigation = useNavigation();

  const [sessions, setSessions] = React.useState([])
  const route: RouteProp<{}> = useRoute();
  const [newSessionId, setNewSessionId] = React.useState(1)

  useEffect(() => {
      handleLoadSessions()
      }, [])

  async function handleLoadSessions (){
        console.log('loading sessions')
        let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions');
        if(files.length === 0)
            return
        let loadedSessions = await Promise.all(
              files.map(async (f) => {
                const filePath = FileSystem.documentDirectory + 'sessions/' + f;
                const data = await FileSystem.readAsStringAsync(filePath);
                return JSON.parse(data);
              })
            );

            setSessions(loadedSessions);
            setNewSessionId(parseInt(loadedSessions.at(-1).sessionId) + 1)
  }

  function handleNewSession(){
    navigation.navigate("create-session", {
            sessionId: newSessionId,
          })
  }


  async function editSession(i: number){


  }

  return (
  <View className="flex-1 bg-white">
    {/* Header */}
    <ThemedView className="sticky top-6 z-10 bg-white border-b border-gray-300 px-5 py-4">
      <ThemedText type="title" className="text-center">
        Sessions
      </ThemedText>
    </ThemedView>

    <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#FFFFFF' }} contentContainerStyle={{ paddingBottom: 100 }}>
      <ThemedView className="px-5 pt-4">
        {
          sessions.length === 0 ?
          <Text className="flex-1 text-center text-2xl text-gray-800 text-base">
             No sessions
           </Text>
           :
           <></>
        }
        {sessions.map((session, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row mb-3 p-4 bg-gray-200 rounded-lg items-center"
            onPress={() =>
              navigation.navigate('(drawer)', {
                sessionId: session.sessionId,
              })
            }
          >
            <View className="flex-1">
                <Text className="text-gray-800">{session.title}</Text>
              </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ParallaxScrollView>

    {/* Sticky New Session button at bottom */}
    <View className="absolute bottom-10 w-full px-5 py-4 bg-white ">
      <TouchableOpacity
        className="w-full p-4 bg-green-600 rounded-lg"
        onPress={handleNewSession}
      >
        <Text className="text-white text-center font-semibold">New Session</Text>
      </TouchableOpacity>
    </View>
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
