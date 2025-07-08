import React, { useEffect, useState } from "react";
import {View, Text, Pressable, Alert} from "react-native";
import * as FileSystem from "expo-file-system";
import RNFS from 'react-native-fs';

import { useLocalSearchParams } from "expo-router";
import {AudioModule, AudioQuality, IOSOutputFormat, useAudioPlayer, useAudioRecorder} from "expo-audio";
import UploadButton from "@/app/components/Recordings/UploadButton";
import RecordingList from "@/app/components/Recordings/RecordingList";
import RecordingOverlay from "@/app/components/Recordings/RecordingOverlay";
import SERVER_URL, {public_key} from "@/constants/serverSettings";
import { RSA } from 'react-native-rsa-native';
import AesGcmCrypto from "react-native-aes-gcm-crypto";
//import useFakeAuthContext from "@/app/services/fakeAuthContext";
import { useAuth } from '../../services/authContext';


type RecordingSession = {
    sessionId: string;
    patientId: number;
    patientName: string;
    patientSurname: string;
    title: string;
    creationTime: number;
    recordings: string[];
};

export default function Recordings() {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const { id } = useAuth(); // useFakeAuthContext();
    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission to access microphone was denied');
            }
        })();
    }, []);

    useEffect(() => {
        async function loadSession() {
            if (!sessionId) return;
            const path = FileSystem.documentDirectory + `sessions/session-${sessionId}`;
            try {
                const json = await FileSystem.readAsStringAsync(path);
                setRecordingSession(JSON.parse(json));
            } catch (e) {
                console.error("Failed to load session", e);
            }
        }

        loadSession();
    }, [sessionId]);




    const player = useAudioPlayer();
    const audioRecorder = useAudioRecorder({
            extension: '.wav',
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            android: {
                outputFormat: 'mpeg4',
                audioEncoder: 'aac',
            },
            ios: {
                outputFormat: IOSOutputFormat.MPEG4AAC,
                audioQuality: AudioQuality.MAX,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
            },
            web: {
                mimeType: 'audio/webm',
                bitsPerSecond: 128000,
            },
        }
    );
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        if (!player.currentStatus.playing && isPlaying) {
            console.log("Playback finished!");

            setPlayingAt(-1);
            setIsPlaying(false);
            setStatusText("Playback finished");
        }
    }, [isPlaying, player.currentStatus.playing]);

    const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
    const [statusText, setStatusText] = useState<string>("Čakanje");
    const [playingAt, setPlayingAt] = useState<number>(-1);
    const [showOverlay, setShowOverlay] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const persistSession = async (session: RecordingSession) => {
        const sessionPath = FileSystem.documentDirectory + `sessions/session-${session.sessionId}`;
        try {
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "sessions/", {
                intermediates: true,
            });
            await FileSystem.writeAsStringAsync(sessionPath, JSON.stringify(session));
        } catch (e) {
            console.error("Failed to save session", e);
        }
    };

    const startRecording = async () => {
        await audioRecorder.prepareToRecordAsync()
        audioRecorder.record();
        setStatusText("Recording...");
        setIsRecording(true);

    }

    const stopRecording = async () => {
        await audioRecorder.stop()
        setIsRecording(false);
        return audioRecorder.uri
    }

    const toggleRecording = async () => {
        if (!recordingSession) return;

        if (!isRecording) {
            try {
                await startRecording();
            } catch (e) {
                console.error("Failed to start recording:", e);
                setStatusText("Failed to start recording");
            }
        } else {
            try {
                const uri = await stopRecording(); // returns { uri }
                setIsRecording(false);

                if (!uri) {
                    setStatusText("No file saved");
                    return;
                }

                const updated = {
                    ...recordingSession,
                    recordings: [...recordingSession.recordings, uri],
                };
                setRecordingSession(updated);
                await persistSession(updated);
                setStatusText("Recording saved");
            } catch (e) {
                console.error("Failed to stop recording:", e);
                setStatusText("Failed to save recording");
            }
        }
    };

    const playRecordingAt = (i: number) => {
        const uri = recordingSession?.recordings[i];
        if (!uri) return;
        player.replace(uri);
        player.play();
        setPlayingAt(i);
        setIsPlaying(true);
        setStatusText(`Playing segment #${i + 1}`);
    };

    const pausePlayback = () => {
        if (player.currentStatus.playing){
            player.pause();
            //player.remove();
            setPlayingAt(-1);
            setIsPlaying(false);
            setStatusText("Paused");
        }

    };

    const deleteRecordingAt = async (i: number) => {
        if (!recordingSession) return;
        const uri = recordingSession.recordings[i];
        try {
            await FileSystem.deleteAsync(uri);
        } catch (e) {
            console.error("Failed to delete file:", e);
        }

        const updated = {
            ...recordingSession,
            recordings: recordingSession.recordings.filter((_, idx) => idx !== i),
        };
        setRecordingSession(updated);
        await persistSession(updated);
    };

    function parseUriFile(uri: string, index: number): { name: string; type: string; uri: string } {

        const normalizedUri = uri.endsWith('.wav') ? uri : uri + '.wav';
        console.log(uri, normalizedUri);
        return {
            uri: normalizedUri,
            name: `segment-${index + 1}.wav`,
            type: 'audio/wav',
        };
    }

    const handleUpload = async () => {
        console.log(recordingSession);
        if (!recordingSession || !recordingSession.recordings.length) {
            setStatusText("Ni posnetkov");
            return;
        }

        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const aesKeyBase64 = Buffer.from(array).toString('base64');

        let key = await RSA.encrypt(aesKeyBase64, public_key);


        const form = new FormData();


        setStatusText("Priprava datotek…");
        try {
            recordingSession.recordings.map(async (uri, i) => {
                setStatusText(uri)
               const file = parseUriFile(uri, i);
                form.append("audio_files", file as any);
            });
        } catch (e) {
            console.error("Failed to prepare audio files:", e);
            setStatusText("Napaka v pripipravi posnetkoov");
            return;
        }

        form.append("patient_id", recordingSession.patientId.toString());
        form.append("title", recordingSession.title);
        form.append("doctor_id", id.toString())

        setStatusText("Pošiljanje seje…");
        try {
            const response = await fetch(
                `${SERVER_URL}/multiple-recordings`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                    body: form,
                }
            );

            if (!response.ok) {
                setStatusText( `Prišlo je do napake (err. ${response.status})`);
                return;
            }

            const text = await response.text();
            try {
                const json = JSON.parse(text);
                setStatusText(json.error ? "Prišlo je do napake: " + json.error : "status: " + json.status);
            } catch {
                setStatusText("Strežnik je prejel nepričakovan odgovor");
            }
        } catch (e) {
            console.error("Network error:", e);
            setStatusText("Upload failed");
            return;
        }

    };

    if (!recordingSession) {
        return <Text className="text-center mt-10 text-gray-500">Loading session…</Text>;
    }

    return (
        <View className="flex-1 bg-white pt-5">
            <Text className="text-2xl font-bold text-center mt-16 text-gray-800 mb-3">
                Posnetki (Seja #{recordingSession.sessionId})
            </Text>
            <Text className="text-center text-sm text-gray-600 mb-4">Status: {statusText}</Text>

            <RecordingList
                recordings={recordingSession.recordings}
                playingAt={playingAt}
                play={playRecordingAt}
                pause={pausePlayback}
                deleteAt={deleteRecordingAt}
                isPlaying={isPlaying}            />

            {showOverlay && (
                <RecordingOverlay
                    isRecording={isRecording}
                    onClose={() => setShowOverlay(false)}
                    onToggleRecording={toggleRecording}
                />
            )}

            <Pressable
                onPress={() => setShowOverlay(true)}
                className="absolute bottom-10 right-10 w-14 h-14 bg-[#003459] rounded-full items-center justify-center shadow-lg"
            >
                <Text className="text-white text-3xl">＋</Text>
            </Pressable>

            {/* Center bottom button container */}
            <View className="absolute bottom-5 w-fit left-0 right-0 items-center">
                <UploadButton onUpload={handleUpload} />
            </View>
        </View>
    );
}
