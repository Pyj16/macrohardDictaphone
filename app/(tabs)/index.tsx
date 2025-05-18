import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React from "react";
import {Recording} from "expo-av/build/Audio/Recording";
import {Audio} from "expo-av";
import {useNavigation} from '@react-navigation/native';
import { signIn} from '../services/authService.ts';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '461690677221-m30b4qeutola3j0od96acbd2n3o2u50s.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '461690677221-iiubqglurpquo77jp35cir0q47lcat4p.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

const tempTransc = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Pellentesque sed risus luctus, lobortis ante rhoncus, porta purus.",
  "Aliquam elit eros, viverra sed tempor vitae, rhoncus tempor turpis."
]

export default function HomeScreen() {
  const navigation = useNavigation();

  const [recording, setRecording] = React.useState<Recording>();
  const [recordings, setRecordings] = React.useState([]);

  const [statusText, setStatusText] = React.useState<string>("Idle");

  async function startRecording(){

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted"){
        setStatusText("Recording...")
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
            {
              ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
              // @ts-ignore
              outputFormat: ".mp3",
              uri: '',
            });
        setRecording(recording);
      }
    }
    catch (e){
      console.error(e);
    }
  }

  // TO-DO: Figure out how to make this prettier for TypeScript, remove all the ts-ignores.
  async function stopRecording(){
    setRecording(undefined);

    setStatusText("Saving")
    // @ts-ignore
    await recording.stopAndUnloadAsync();
    // @ts-ignore
    let allRecordings = [...recordings];
    // @ts-ignore
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    // @ts-ignore
    allRecordings.push({
      sound: sound,
      // @ts-ignore
      duration: getDurationFormatted(status.durationMillis),
      // @ts-ignore
      file: recording.getURI(),
    });


    // @ts-ignore
    setRecordings(allRecordings);

    setStatusText("Idle")
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = milliseconds / 60000
    const seconds = Math.round(minutes - Math.floor(minutes) * 60);
    return seconds < 10 ? `${Math.floor(minutes)}"0${seconds}` : `${Math.floor(minutes)}:${seconds}`;
  }

  function playLastRecording() {
    setStatusText("Replaying...")
    // @ts-ignore
    if (recordings.length > 0) {
      // @ts-ignore
      recordings.at(recordings.length - 1).sound.replayAsync();
    }
  }

  function clearRecordings() {
    setRecordings([]);
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
        <ThemedText type="title">Medicinski diktafon</ThemedText>
      </ThemedView>

      {/* Audio Interface UI */}
      <ThemedView style={styles.audioContainer}>
        <Text style={styles.statusText}>Status: {statusText}</Text>

        <TouchableOpacity style={styles.button} onPress={startRecording}>
          <Text style={styles.buttonText}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={
            // @ts-ignore
            () => navigation.navigate("recordings", {
              recordings: recordings,
            })}>Recordings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText} onPress={
            // @ts-ignore
            () => navigation.navigate("personel", {
              transcriptions: tempTransc
            })}>Personel Page</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={playLastRecording}>
          <Text style={styles.buttonText}>Play Last</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.submitButton]}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ThemedView>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
              />
          </View>
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
