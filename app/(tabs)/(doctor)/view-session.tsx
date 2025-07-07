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
        return <Text className="p-4">Nalaganje seje...</Text>;
    }

    return (
        <View className="p-5 bg-white w-full h-full">
            <View className="mx-4 my-6">
                <Text className="text-3xl font-bold mb-4 mt-8">{sessionData.title}</Text>
                <Text>Pacient: {sessionData.patientName} {sessionData.patientSurname}</Text>
                <Text>Datum: {new Date(sessionData.creationTime).toLocaleDateString()}</Text>
                <Text className="">ID seje: {sessionData.sessionId}</Text>

                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: "/recordings",
                        params: { sessionId: sessionData.sessionId },
                    })}
                    className="bg-blue-600 mt-8 py-3 rounded-xl items-center"
                >
                    <Text className="text-white font-semibold text-lg">Snemaj</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
