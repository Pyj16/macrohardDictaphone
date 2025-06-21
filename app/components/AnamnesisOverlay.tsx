import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
} from "react-native";
import {AnamnesisType} from "@/app/types/MedicalTypes";

export default function AnamnesisOverlay({ visible, onClose, data }:{visible:boolean, onClose:() => void, data:AnamnesisType}) {
    if (!data) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/40 justify-center items-center px-4">
                <View className="bg-white w-full rounded-2xl p-6 max-h-[85%] relative">
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 z-10"
                        hitSlop={10}
                    >
                        <Text className="text-black text-xl font-bold">×</Text>
                    </Pressable>

                    <Text className="text-xl font-bold mb-2">{data.patient.name} {data.patient.surname}</Text>
                    <Text className="text-gray-600 mb-1">Doctor: {data.doctor.name} {data.doctor.surname}</Text>
                    <Text className="text-gray-400 text-xs mb-4">{data.date}</Text>

                    <ScrollView>
                        <Text className="text-gray-700 leading-6">{data.content}</Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
