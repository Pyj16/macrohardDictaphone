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
import {setParams} from "expo-router/build/global-state/routing";

import RNRsa from 'react-native-rsa-native';

export default function Personel() {
  const navigation = useNavigation();

  const route: RouteProp<{params: {transcriptions: string[], debug: boolean}}> = useRoute();

  const originalTransactions = route.params.transcriptions;
  const [transcriptions, setTranscriptions] = React.useState(route.params.transcriptions);
  const approvedTranscriptions = [];
  const rejectedTranscriptions = [];

  // Essentially gets called whenever redirect is sent to this page.
  useEffect(() => {
    setTranscriptions(route.params.transcriptions);

  }, [route.params.transcriptions]);



  function emptyFunction() {
  }



  async function readFromDB() {
      const keyPair = await RNRsa.generateKeys(2048);

//       fetch('http://192.168.1.177:5000/test-rsa', {
//           method: 'POST',
//           headers: {Accept: 'application/json','Content-Type': 'application/json'},
//           body: JSON.stringify({
//               "public_key": keyPair.public,
//               })
//           }).then( async (res) => res.json()).then(async (data) => {
//                  console.log(typeof data.encrypted_key)
//
//                   const dcKey = await RNRsa.decrypt(data.encrypted_key, keyPair.private);
//                   console.log('Decrypted key:', dcKey);
// //                   const dcText = await AES.decrypt(data.encrypted_text, dcKey);
// //                   console.log('Decrypted text:', dcText);
//                   return;
//                   }).catch( (err) => console.log(err));


         let res = await fetch('http://192.168.1.177:5000/test-rsa', {
                   method: 'POST',
                   headers: {Accept: 'application/json','Content-Type': 'application/json'},
                   body: JSON.stringify({
                       "public_key": keyPair.public,
                       })
                   }).then( async (res) => res.json()).then(async (data) => {
                          console.log(data.encrypted_key)
                          await RNRsa.decrypt(data.encrypted_key, keyPair.private).then(dcKey => {
                               console.log('Decrypted key:', dcKey);
                              })
                           return;
                           }).catch( (err) => console.log(err));
  }



  function deleteTranscription(i: number){
    console.log("Rejecting transcription at" + i);
    rejectedTranscriptions.push(transcriptions[i])

    let newTranscriptions = [...transcriptions];
    newTranscriptions.splice(i, 1);

    setTranscriptions(newTranscriptions)
  }

  function approveTranscription(i: number){
    console.log("Approving transcription at" + i);
    approvedTranscriptions.push(transcriptions[i])

    let newTranscriptions = [...transcriptions];
    newTranscriptions.splice(i, 1);

    setTranscriptions(newTranscriptions)
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

        <TouchableOpacity style={styles.button} onPress={readFromDB}>
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
                  <TouchableOpacity style={styles.stopButton} onPress={() => deleteTranscription(index)}>
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={() => approveTranscription(index)}>
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
