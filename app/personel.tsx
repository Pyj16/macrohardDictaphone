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

import { RSA } from 'react-native-rsa-native';

import AesGcmCrypto from 'react-native-aes-gcm-crypto';
import { Buffer } from 'buffer';
import { public_key } from '@/app/key.ts'
import RNRsa from 'react-native-rsa-native';
import 'react-native-get-random-values';
import { sha256, sha256Bytes } from 'react-native-sha256';


export default function Personel() {
  const navigation = useNavigation();

  const [transcriptions, setTranscriptions] = React.useState([]);
  const [anamnesisList, setAnamnesisList] = React.useState([]);
  const approvedTranscriptions = [];
  const rejectedTranscriptions = [];



  async function updateAnamnesis() {

    const array = new Uint8Array(32);
//     console.log("array: ", array)
    crypto.getRandomValues(array);
//     console.log("array: ", array)
    const aesKeyBase64 = Buffer.from(array).toString('base64');
//     console.log("aesKeyBase64: ", aesKeyBase64)
//     console.log("aesKeyBase64: ",typeof aesKeyBase64)
//     console.log("public_key: ", public_key)
//     console.log("public_key: ",typeof public_key)
    let encrypted_text = ''
    try {
        AesGcmCrypto.encrypt('Slightly less placeholder text', false, aesKeyBase64).then(async (result) => {
//           console.log(result)
          const encrypted_key = await RSA.encrypt(aesKeyBase64, public_key);
//           console.log(typeof encrypted_key)
//           console.log("encrypted_key: ",encrypted_key)

//           console.log(result);
          const ivBytes = Buffer.from(result['iv'], 'hex')
          const contentBytes = Buffer.from(result['content'], 'base64')
          const tagBytes = Buffer.from(result['tag'], 'hex')

          const combined = Buffer.concat([ivBytes, contentBytes, tagBytes])
//           console.log(combined)
//           console.log(ivBytes)
//           console.log(contentBytes)
//           console.log(tagBytes)
//           console.log(typeof combined)

          encrypted_text = combined.toString('base64')
//           console.log(encrypted_key.length)
//           console.log(encrypted_text)

          console.log(anamnesisList.at(1).id_patient.toString())
          const hashedId = await sha256(anamnesisList.at(1).id_patient.toString()).then( hash => {
                  console.log("hash",hash);
                  return hash
              }).catch((e) => {console.log(e)})
          console.log(hashedId)

          console.log('attempting send')
          fetch('http://192.168.1.177:5000/test-rsa-update', {
             method: 'POST',
             headers: {Accept: 'application/json','Content-Type': 'application/json'},
             body: JSON.stringify({
                 "encrypted_key": encrypted_key,
                 "encrypted_text": encrypted_text,
                 "patient_id": hashedId,
                 "anamnesis_id": anamnesisList.at(1).id_anamnesis,
                 })
             }).then( async (res) => res.json()).then(async (r)=>{
                 console.log(r);
                 console.log('send finished')
                 return;
                 }).catch((err) => console.log(err));

        });
      }
      catch (err) {
        console.error('AES-GCM encryption failed:', err);
      }
    }

    function emptyFunction() {
    }

    async function decryptAesGcm(encryptedBase64, binaryKey) {

      const raw = Buffer.from(encryptedBase64, 'base64');
      const keyHex = Buffer.from(binaryKey, 'base64').toString('hex');
      console.log(binaryKey)
      console.log("keyHex:", keyHex)

      const keyBase64 = Buffer.from(keyHex, 'hex').toString('base64')
      console.log('kayBase64 key:', keyBase64);

      const keyBytes = Buffer.from(keyBase64, 'base64');
      console.log(keyBytes.length);

        const nonce = raw.slice(0, 12);
        const tag = raw.slice(-16);
        const ciphertext = raw.slice(12, raw.length - 16);

        const nonceBase64 = nonce.toString('hex');
        const tagBase64 = tag.toString('hex');
        const ciphertextBase64 = ciphertext.toString('base64');

        console.log('Nonce length:', Buffer.from(nonceBase64, 'base64').length);    // Must be 12
        console.log('Tag length:', Buffer.from(tagBase64, 'base64').length);        // Must be 16

      console.log("Nonce: ", nonce.toString('hex'))
      console.log("ciphertext: ", ciphertext.toString('hex'))
      console.log("ciphertext: ", ciphertext.toString('base64'))
      console.log("tag: ", tag.toString('hex'))

      try {
        const decrypted = await AesGcmCrypto.decrypt(
          ciphertextBase64,
          keyBase64,
          nonceBase64,
          tagBase64,
          false
        );
        console.log('Decrypted:', decrypted);
        return decrypted;
      } catch (err) {
        console.error('AES-GCM decryption failed:', err);
      }
    }

  async function readFromDB() {
      const keyPair = await RSA.generateKeys(2048);

         let res = await fetch('http://192.168.1.177:5000/fetch-anamnesis', {
                   method: 'POST',
                   headers: {Accept: 'application/json','Content-Type': 'application/json'},
                   body: JSON.stringify({
                       "public_key": keyPair.public,
                       })
                   }).then( async (res) => res.json()).then(async (data) => {
                          console.log(data.encrypted_key)
                          await RSA.decrypt64(data.encrypted_key, keyPair.private).then(async (dcKey) => {
                               console.log('Decrypted key:', dcKey);

                               const newAnamnesisList = []
                               const newTranscriptions = [...transcriptions]
                               for(let a of data.anamnesis){
                                   let decrypted = await decryptAesGcm(a.contents, dcKey);
                                   console.log(decrypted)
                                   a.contents = decrypted
                                   newTranscriptions.push(decrypted)
                                   newAnamnesisList.push(a)
                               }
                               setTranscriptions(newTranscriptions)
                               setAnamnesisList(newAnamnesisList)
                               console.log('done everything')
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


        <TouchableOpacity style={styles.button} onPress={updateAnamnesis}>
          <Text style={styles.buttonText}>Update DB</Text>
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
