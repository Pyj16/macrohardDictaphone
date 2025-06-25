import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";

export default function ViewSessionScreen() {
    const { sessionId } = useLocalSearchParams();
    const [sessionData, setSessionData] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const loadSession = async () => {
            try {
                const sessionName = `session-${sessionId}`;
                const sessionPath = FileSystem.documentDirectory + `sessions/${sessionName}`;
                const json = await FileSystem.readAsStringAsync(sessionPath);
                setSessionData(JSON.parse(json));
            } catch (err) {
                console.error("Failed to load session", err);
            }
        };

        if (sessionId) loadSession();
    }, [sessionId]);

    if (!sessionData) {
        return <Text className="p-4">Loading session...</Text>;
    }

    return (
        <View className="p-5">
            <Text className="text-xl font-bold mb-4">{sessionData.title}</Text>
            <Text>Patient: {sessionData.patientName} {sessionData.patientSurname}</Text>
            <Text>Date: {new Date(sessionData.creationTime).toLocaleDateString()}</Text>
            <Text className="mt-4">Session ID: {sessionData.sessionId}</Text>

            <TouchableOpacity
                onPress={() => router.push({
                    pathname: "/recordings",
                    params: { sessionId: sessionData.sessionId },
                })}
                className="bg-blue-600 mt-8 py-3 rounded-xl items-center"
            >
                <Text className="text-white font-semibold text-lg">Record</Text>
            </TouchableOpacity>
        </View>
    );
}
