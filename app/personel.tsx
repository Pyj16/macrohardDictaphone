import { Image } from 'expo-image';
import {Platform, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, {useEffect} from "react";
import {Recording} from "expo-av/build/Audio/Recording";
import {Audio} from "expo-av";
import {useNavigation} from '@react-navigation/native';
import {RouteProp, useRoute} from "@react-navigation/core";

export default function Personel() {
  const navigation = useNavigation();

  const route: RouteProp<{params: {transcriptions: string[], debug: boolean}}> = useRoute();


  const [transcriptions, setTranscriptions] = React.useState(route.params.transcriptions);

  // Essentially gets called whenever redirect is sent to this page.
  useEffect(() => {
    setTranscriptions(route.params.transcriptions);

  }, [route.params.transcriptions, transcriptions]);

  function emptyFunction() {
    setTranscriptions(route.params.transcriptions)
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}
      headerImage={
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.background}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Personel Page</ThemedText>
      </ThemedView>

      {/* Audio Interface UI */}
      <ThemedView style={styles.audioContainer}>
        <Text style={styles.statusText}>Status: Idle</Text>

        <TouchableOpacity style={styles.button} onPress={emptyFunction}>
          <Text style={styles.buttonText}>Read From DB</Text>
        </TouchableOpacity>

        {
          transcriptions.map((t, index) => {
            return(
                <>
                  <TouchableOpacity style={styles.button} onPress={emptyFunction}>
                    <Text style={styles.buttonText}>{t}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={emptyFunction}>
                    <Text style={styles.buttonText} onPress={
                      // @ts-ignore
                      () => navigation.navigate("anamnesis-edit", {
                        id: index,
                        transcriptions: transcriptions,
                      })}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.stopButton} onPress={emptyFunction}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.submitButton]}>
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>
                </>
            )
          })
        }
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
