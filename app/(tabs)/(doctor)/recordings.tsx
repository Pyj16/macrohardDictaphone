import React, { useEffect, useState, useRef } from "react";
import {View, Text, Pressable, Alert} from "react-native";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import {AudioModule, AudioQuality, IOSOutputFormat, useAudioPlayer, useAudioRecorder} from "expo-audio";
//import { sha256 } from "react-native-sha256";
import * as Crypto from "expo-crypto"; // TODO Figure out why sha256 is broken
import UploadButton from "@/app/components/Recordings/UploadButton";
import RecordingList from "@/app/components/Recordings/RecordingList";
import RecordingOverlay from "@/app/components/Recordings/RecordingOverlay";
import SERVER_URL from "@/constants/serverSettings";


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
    const router = useRouter();

    useEffect(() => {
        sha256("test")
            .then(console.log)
            .catch(console.error);
    }, []);


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

    const [recordingSession, setRecordingSession] = useState<RecordingSession | null>(null);
    const [statusText, setStatusText] = useState<string>("Idle");
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
        setStatusText(`Playing segment #${i + 1}`);
    };

    const pausePlayback = () => {
        player.pause();
        player.remove();
        setPlayingAt(-1);
        setStatusText("Paused");
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
            setStatusText("No recordings found");
            return;
        }

        const form = new FormData();
        setStatusText("Preparing files…");
        try {
            recordingSession.recordings.map(async (uri, i) => {
                setStatusText(uri)
                const file = parseUriFile(uri, i);
                form.append("audio_files", file as any);
            });
        } catch (e) {
            console.error("Failed to prepare audio files:", e);
            setStatusText("File prep failed");
            return;
        }

        setStatusText(`Files prepred, starting to hash value ${recordingSession.patientId}`)

        let hashedId_ = await sha256(recordingSession.patientId.toString());
        const hashedId = "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b";
        console.log(hashedId);
        setStatusText(hashedId);
        form.append("id_", hashedId);
        form.append("title", recordingSession.title);

        setStatusText("Uploading…");
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

            const text = await response.text();
            try {
                const json = JSON.parse(text);
                setStatusText(json.error ? "Error: " + json.error : "status: " + json.status);
            } catch {
                setStatusText("Unexpected server response");
            }
        } catch (e) {
            console.error("Network error:", e);
            setStatusText("Upload failed");
        }
    };

    if (!recordingSession) {
        return <Text className="text-center mt-10 text-gray-500">Loading session…</Text>;
    }

    return (
        <View className="flex-1 bg-gray-100 pt-5">
            <Text className="text-2xl font-bold text-center mt-16 text-gray-800 mb-3">
                Recordings (Session #{recordingSession.sessionId})
            </Text>
            <Text className="text-center text-sm text-gray-600 mb-4">Status: {statusText}</Text>

            <RecordingList
                recordings={recordingSession.recordings}
                playingAt={playingAt}
                play={playRecordingAt}
                pause={pausePlayback}
                deleteAt={deleteRecordingAt}
            />

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
            <UploadButton onUpload={handleUpload} />
        </View>
    );
}
