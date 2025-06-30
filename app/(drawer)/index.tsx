import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import Entypo from '@expo/vector-icons/Entypo';
import { styled } from 'nativewind';
import { Pressable } from 'react-native';

import '@/global.css';

import React from "react";
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

import { RouteProp, useRoute } from "@react-navigation/core";
import { setParams } from "expo-router/build/global-state/routing";

export default function HomeScreen() {
    const navigation = useNavigation();
    const route: RouteProp<{ params: { sessionId: number } }> = useRoute();
    const [recordingSession, setRecordingSession] = React.useState(undefined);
    const [detailsText, setDetailsText] = React.useState('');

    // Button logic
    enum Status {
        idle,
        recording,
        replaying,
        inactive,
    }

    const [status, setStatus] = React.useState(Status.inactive);
    const [buttonStyle, setButtonStyle] = React.useState("bg-gray-500");

    // Session status
    const [sessionText, setSessionText] = React.useState()

    // Debug status
    const [statusText, setStatusText] = React.useState<string>("Idle");

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = React.useState(false);

    const startRecording = async () => {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
    };

    const stopRecording = async () => {
        await audioRecorder.stop();
        setIsRecording(false);

        let fileName = 'recording-' + Date.now()
        let filePath = FileSystem.documentDirectory + 'recordings/' + fileName

        FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true })
        await FileSystem.moveAsync({
            from: audioRecorder.uri,
            to: filePath
        })

        let newRecording = filePath
        let newRecordings = [...recordingSession.recordings]
        newRecordings.push(newRecording)

        setRecordingSession({
            ...recordingSession,
            recordings: newRecordings,
        })

        console.log(filePath)
        console.log(recordingSession.recordings)
    };


    
    React.useEffect(() => {
        saveSession()
    }, [recordingSession]);

    React.useEffect(() => {
        const id = route.params.sessionId
        loadSession(id)
    }, [route])

    async function saveSession() {
        if (!recordingSession)
            return

        let sessionName = 'session-' + recordingSession.sessionId
        let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
        FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', { intermediates: true })
        const data = JSON.stringify(recordingSession)
        console.log("new session data for", sessionName, ":", data)
        await FileSystem.writeAsStringAsync(sessionPath, data)
    }

    async function deleteSession() {
        if (!recordingSession)
            return

        let sessionName = 'session-' + recordingSession.sessionId
        let sessionPath = FileSystem.documentDirectory + 'sessions/' + sessionName
        FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'sessions/', { intermediates: true })
        const data = JSON.stringify(recordingSession)
        console.log("new session data for", sessionName, ":", data)
        await FileSystem.writeAsStringAsync(sessionPath, data)
    }

    React.useEffect(() => {
        (async () => {
            const stat = await AudioModule.requestRecordingPermissionsAsync();
            if (!stat.granted) {
                alert('Permission to access microphone was denied');
            }
        })();
    }, []);

    async function loadSession(i: number) {
        let files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'sessions');
        console.log(files);
        let sessionPath = ''
        if (files.length === 0)
            return
        files.map(async (f) => {
            filePath = FileSystem.documentDirectory + 'sessions/' + f
            const checkSesh = 'session-' + i
            console.log('comparing', checkSesh, "with", f)
            if (checkSesh === f)
                sessionPath = filePath
        })
        FileSystem.readAsStringAsync(sessionPath).then((data) => {
                console.log(data)
                let objectData = JSON.parse(data)
                setRecordingSession(objectData)
                setStatus(Status.idle)
                let patientName = objectData.patientName + " " + objectData.patientSurname
                let date = new Date(objectData.creationTime)
                let infoText = objectData.title
                let detailsText = "Patient: " + patientName
                    + "\n" + date.toLocaleString("en-GB")

                setSessionText(infoText)
                setDetailsText(detailsText)
                setButtonStyle("bg-green-500")
            }
        ).catch((e) => console.log(e))
    }

    function handleButtonUpdate() {
        if (status == Status.idle) {
            setStatus(Status.recording);
            startRecording();
            setButtonStyle("bg-red-500");
            setStatusText("Recording...")
        }
        if (status == Status.recording) {
            setStatus(Status.idle);
            stopRecording();
            setButtonStyle("bg-green-500")
            setStatusText("Idle");
        }
        if (status == Status.inactive) {
            setSessionText("No session active. Select or create one.")
            setButtonStyle("bg-gray-500");
            setStatusText("Idle");
        }
    }

    // @ts-ignore
    // @ts-ignore
    return (
        <View className="flex-1">
            <View>
                <Text className="text-center text-2xl mb-4">{sessionText}</Text>
                <View className="flex-row items-center justify-between px-2 mb-4">
                    <Text className="text-l text-gray-800">{detailsText}</Text>

                    {status !== Status.inactive && (
                        <TouchableOpacity
                            className="mr-4 w-10 h-10 rounded-md items-center justify-center bg-gray-300"
                            onPress={() =>
                                navigation.navigate('edit-session', {
                                    sessionId: recordingSession.sessionId,
                                })
                            }
                        >
                            <Entypo name="pencil" size={24} color="black" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ParallaxScrollView headerBackgroundColor={{ light: '#FFFFFF', dark: '#000000' }}>
                <ThemedView className="px-5 pt-4 text-center">
                    <TouchableOpacity
                        className={`mb-3 p-4 bg-gray-200 rounded-lg ${status === Status.recording ? 'opacity-50' : ''}`}
                        disabled={status === Status.recording}
                        onPress={() => navigation.navigate('sessions')}
                    >
                        <Text className="text-center text-gray-800">Sessions</Text>
                    </TouchableOpacity>

                    {status !== Status.inactive && (
                        <TouchableOpacity
                            className={`mb-3 p-4 bg-gray-200 rounded-lg ${status === Status.recording ? 'opacity-50' : ''}`}
                            disabled={status === Status.recording}
                            onPress={() =>
                                navigation.navigate('recordings', {
                                    recordingSession: recordingSession,
                                })
                            }
                        >
                            <Text className="text-center text-gray-800">Recordings</Text>
                        </TouchableOpacity>
                    )}
                </ThemedView>
            </ParallaxScrollView>

            <TouchableOpacity
                className="absolute bottom-20 left-1/2 -translate-x-1/2 items-center"
                onPress={handleButtonUpdate}
            >
                <View className={'w-36 h-36 rounded-full items-center justify-center shadow-md ' + buttonStyle}>
                    <Entypo name="mic" size={48} color="black" />
                </View>
            </TouchableOpacity>
        </View>
    );
}
