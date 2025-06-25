import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SessionPatientType } from "@/app/types/MedicalTypes";
import { sessionPatients } from "@/app/data/medical-dev-data";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";

const SessionScreen = () => {
    const [documentName, setDocumentName] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<SessionPatientType>();
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const [patients, setPatients] = useState<SessionPatientType[]>([]);
    const today = new Date();
    const router = useRouter();

    const formattedDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const saveSession = async () => {
        if (!selectedPatient) return;

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);

        const sessionId = `${selectedPatient.surname}-${dd}-${mm}-${yy}`;

        const session = {
            sessionId: sessionId,
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            patientSurname: selectedPatient.surname,
            title: documentName || "Untitled",
            creationTime: Date.now(),
            recordings: [],
        };

        const sessionName = `session-${session.sessionId}`;
        const sessionsFolder = FileSystem.documentDirectory + 'sessions/';
        const sessionPath = sessionsFolder + sessionName;

        await FileSystem.makeDirectoryAsync(sessionsFolder, { intermediates: true });
        const data = JSON.stringify(session);
        await FileSystem.writeAsStringAsync(sessionPath, data);

        router.push({
            pathname: "/(tabs)/(doctor)/view-session",
            params: { sessionId: session.sessionId },
        });
    };

    useEffect(() => {
        setPatients(sessionPatients);
    }, []);

    return (
        <View className="p-5 bg-white min-h-full">
            {/* Title */}
            <Text className="text-2xl font-bold text-center mt-8 text-black">New Session</Text>

            <Text className="mt-6 text-black">Name of Document</Text>
            <TextInput
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Enter document name"
                placeholderTextColor="#888"
                className="border rounded-xl px-4 py-3 mt-2 text-black"
            />

            {/* Patient Picker */}
            <Text className="mt-6 text-black">Select Patient</Text>
            <View className="border rounded-xl mt-2">
                <Picker
                    selectedValue={selectedPatient?.id}
                    onValueChange={(itemValue) => {
                        const patient = patients.find(p => p.id === itemValue);
                        setSelectedPatient(patient);
                    }}
                    style={{ color: 'black' }}
                >
                    <Picker.Item label="Select a patient" value="" />
                    {patients.map((p) => (
                        <Picker.Item key={p.id} label={`${p.name} ${p.surname}`} value={p.id} />
                    ))}
                </Picker>
            </View>

            {/* Date */}
            <Text className="mt-6 text-black">Date of Visit</Text>
            <View className="border rounded-xl px-4 py-3 mt-2 bg-white">
                <Text className="text-black">{formattedDate}</Text>
            </View>

            {/* Save Button */}
            <Pressable
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                onPress={saveSession}
                disabled={!selectedPatient || documentName.trim() === ''}
                className={`border mt-10 rounded-xl px-6 py-3 items-center self-center text-lg ${
                    isPressed ? 'bg-[#003459]' : 'bg-transparent'
                }`}
            >
                <Text className={`${isPressed ? 'text-white' : 'text-black'}`}>Save</Text>
            </Pressable>
        </View>
    );
};

export default SessionScreen;
