import React, { useState, useEffect}from "react";
import {Text, View, ScrollView, SafeAreaView, TouchableOpacity, Pressable, Modal, Image} from "react-native";
import PatientOverlay from "@/app/components/PatientsOverlay";
import {patients, anamnesis, doctors} from "@/app/data/medical-dev-data";
import {AnamnesisType, DoctorType} from "@/app/types/MedicalTypes";
import { useRouter } from "expo-router";
export default function DoctorHome() {


    const [showPatients, setShowPatients] = useState<boolean>(false);


    //const [anamnesis, setAnamnesis] = useState<tempAnamnesis[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedAnamnesis, setSelectedAnamnesis] = useState<AnamnesisType>();
    const [showOverlay, setShowOverlay] = useState<boolean>(false);
    const router = useRouter();

    const doctor: DoctorType = doctors[0];

    const handleAnamnesisPress = (anamnesis: AnamnesisType) => {
        setSelectedAnamnesis(anamnesis);
        setShowOverlay(true);
    };
    /*
    useEffect(() => {
        const fetchAnamnesis = async () => {
            try {
                const res = await fetch('http://192.168.1.164:5000/fetch-anamnesis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        doctorEmail: 'dr.john@example.com', // change as needed
                    }),
                });

                if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

                const data = await res.json();
                console.log(data);
                setAnamnesis(data.anamnesis); // assuming `data` is an array
            } catch (err) {
                console.error('Failed to fetch anamnesis:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnamnesis();
    }, []);

     */

    return (
        <SafeAreaView className="flex-1 bg-white px-4 pt-10">
            {/* Header */}

            <PatientOverlay
                visible={showPatients}
                onClose={() => setShowPatients(false)}
                patients={patients}
            />

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg">☰</Text>
                <Text className="text-3xl font-bold text-green-600">＋</Text>
            </View>

            <Text className="text-gray-500 text-md">welcome back!</Text>
            <Text className="text-2xl font-bold mb-4">Dr. {doctor.surname}</Text>

            {/* Summary Cards */}
            <View className="h-28 mb-4">a
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 8 }}
                >
                    <View className="w-28 h-24 bg-purple-500 rounded-xl mr-3 justify-center items-center">
                        <Text className="text-white font-semibold">Drafts</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowPatients(true)}
                        className="w-28 h-24 bg-cyan-500 rounded-xl mr-3 justify-center items-center"
                    >
                        <Text className="text-white font-semibold">Patients</Text>
                    </TouchableOpacity>

                    <View className="w-28 h-24 bg-blue-500 rounded-xl justify-center items-center">
                        <Text className="text-white font-semibold">Recordings</Text>
                    </View>
                </ScrollView>
            </View>
            <Text className="text-gray-500 mb-2">Latest anamnesis</Text>

            {!loading && anamnesis.map((item, index) => (

                <Pressable onPress={() => handleAnamnesisPress(item)} key={index}>
                    <View className="bg-white p-4 rounded-2xl shadow-md mb-2">
                        <Text className="font-semibold text-base">{item.title}</Text>
                        <Text className="text-gray-400 text-sm">{item.patient.name} {item.patient.surname}</Text>
                        <Text className="absolute right-4 top-4 text-gray-400 text-sm">{item.date}</Text>
                    </View>
                </Pressable>

            ))}

            <Modal
                visible={showOverlay}
                transparent
                animationType="slide"
                onRequestClose={() => setShowOverlay(false)}
            >
                <View className="flex-1 bg-black/40 justify-center px-6">
                    <View className="bg-white p-6 rounded-2xl max-h-[90%]">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-semibold">{selectedAnamnesis?.title}</Text>
                            <Pressable onPress={() => setShowOverlay(false)}>
                                <Text className="text-black text-xl">×</Text>
                            </Pressable>
                        </View>
                        <Text className="text-gray-500 text-sm mb-1">
                            Patient: {selectedAnamnesis?.patient.name} {selectedAnamnesis?.patient.surname}
                        </Text>
                        <Text className="text-gray-500 text-sm mb-3">
                            Doctor: Dr. {selectedAnamnesis?.doctor.name} {selectedAnamnesis?.doctor.surname}
                        </Text>
                        <ScrollView>
                            <Text className="text-gray-700 text-base">{selectedAnamnesis?.content}</Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            <View className="absolute bottom-8 pb-4 left-0 right-0 items-center">
                <Pressable
                    onPress={() => {
                        console.log("Mic pressed");
                        router.push("/(tabs)/(doctor)/list-sessions");
                    }}
                    className="w-24 h-24 rounded-full items-center justify-center"
                    style={{ backgroundColor: "#00A8E8" }}
                >
                    <Image
                        source={require("../../assets/images/microphone.png")}
                        style={{ width: 40, height: 40, tintColor: "#fff" }}
                        resizeMode="contain"
                    />
                </Pressable>
            </View>

        </SafeAreaView>
    );
}
