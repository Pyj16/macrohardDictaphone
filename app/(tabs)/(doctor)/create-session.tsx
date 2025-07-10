import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {PatientType } from "@/app/types/MedicalTypes";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import SERVER_URL from "@/constants/serverSettings";
import {useAuth} from "@/app/services/authContext";

const SessionScreen = () => {
    const [documentName, setDocumentName] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientType>();
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const [patients, setPatients] = useState<PatientType[]>([]);
    const today = new Date();
    const router = useRouter();
    const { email } = useAuth();
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
            patientId: selectedPatient.patient_id,
            patientName: selectedPatient.name,
            patientSurname: selectedPatient.surname,
            title: documentName || "Untitled",
            creationTime: Date.now(),
            recordings: [],
        };

        const sessionName = `session-${session.sessionId}`;
        const sessionsFolder = FileSystem.documentDirectory + 'sessions/';
        const sessionPath = sessionsFolder + sessionName;
        console.log(sessionPath);
        await FileSystem.makeDirectoryAsync(sessionsFolder, { intermediates: true });
        const data = JSON.stringify(session);
        await FileSystem.writeAsStringAsync(sessionPath, data);

        router.push({
            pathname: "/(tabs)/(doctor)/view-session",
            params: { sessionId: session.sessionId },
        });
    };

    useEffect(() => {

        const fetchPatients = async () => {
            try{
                const response = await fetch(`${SERVER_URL}/fetch-patients`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        doctor_email: email
                    })
                });
                const rawText = await response.text();
                let data:any;
                try {
                    data = JSON.parse(rawText);
                }catch (error) {
                    console.log("Failed to parse the response", error);
                    return;
                }
                setPatients(data.patients);

            }
            catch (e){
                console.log("Failed to parse the response (outer)", e);
            }

        }
        fetchPatients()
    }, []);

    return (
        <View className="p-5 bg-white min-h-full">
            {/* Title */}
            <Text className="text-2xl font-bold text-center mt-8 text-black">Nova seja</Text>

            <Text className="mt-6 text-black">Tip dokumenta</Text>
            <TextInput
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Vnesite tip dokumenta"
                placeholderTextColor="#888"
                className="border rounded-xl px-4 py-3 mt-2 text-black"
            />

            <Text className="mt-6 text-black">Select Patient</Text>
            <View className="border rounded-xl mt-2">
                <Picker
                    selectedValue={selectedPatient?.patient_id}
                    onValueChange={(itemValue) => {
                        const patient = patients.find(p => p.patient_id === itemValue);
                        setSelectedPatient(patient);
                    }}
                    style={{ color: 'black' }}
                >
                    <Picker.Item label="Izberite pacienta" value="" />
                    {patients.map((p) => (
                        <Picker.Item key={p.patient_id} label={`${p.name} ${p.surname}`} value={p.patient_id} />
                    ))}
                </Picker>
            </View>

            <Text className="mt-6 text-black">Datum obiska</Text>
            <View className="border rounded-xl px-4 py-3 mt-2 bg-white">
                <Text className="text-black">{formattedDate}</Text>
            </View>

            <Pressable
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                onPress={saveSession}
                disabled={!selectedPatient || documentName.trim() === ''}
                className={`border mt-10 rounded-xl px-6 py-3 items-center self-center text-lg ${
                    isPressed ? 'bg-[#003459]' : 'bg-transparent'
                }`}
            >
                <Text className={`${isPressed ? 'text-white' : 'text-black'}`}>Shrani</Text>
            </Pressable>
        </View>
    );
};

export default SessionScreen;
