import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

export default function ListSessionsScreen() {
    const [sessions, setSessions] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadSessionList = async () => {
            const sessionDir = FileSystem.documentDirectory + "sessions/";

            try {
                const dirInfo = await FileSystem.getInfoAsync(sessionDir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(sessionDir, { intermediates: true });
                }

                const files = await FileSystem.readDirectoryAsync(sessionDir);
                setSessions(files);
            } catch (err) {
                console.error("Failed to access sessions directory", err);
            }
        };

        loadSessionList();
    }, []);

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="p-5">
                <Text className="text-2xl font-bold mb-8 mt-16 text-center">All Sessions</Text>
                {sessions.length === 0 ? (
                    <Text className="text-center text-gray-500">No sessions found.</Text>
                ) : (
                    sessions.map((filename, idx) => {
                        const sessionId = filename.replace("session-", "");
                        return (
                            <TouchableOpacity
                                key={idx}
                                className="border rounded-xl p-4 mb-2 bg-gray-100"
                                onPress={() =>
                                    router.push({
                                        pathname: "/view-session",
                                        params: { sessionId },
                                    })
                                }
                            >
                                <Text className="text-lg font-semibold text-gray-800">
                                    {sessionId}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Floating Plus Button */}
            <TouchableOpacity
                onPress={() => router.push("/create-session")}
                className="absolute bottom-6 right-6 bg-blue-600 rounded-full w-16 h-16 items-center justify-center shadow-md"
            >
                <Text className="text-white text-3xl leading-6">+</Text>
            </TouchableOpacity>
        </View>
    );
}
