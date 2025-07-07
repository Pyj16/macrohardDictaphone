import React from "react";
import {
    Modal,
    View,
    Text,
    FlatList,
    Pressable,
} from "react-native";
import {PatientType} from "@/app/types/MedicalTypes";

export default function PatientOverlay({ visible, onClose, patients }: {visible: boolean, onClose: () => void, patients: PatientType[]}) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/40 justify-center items-center px-4">
                <View className="bg-white w-full rounded-2xl p-6 max-h-[80%] relative">
                    {/* Close Button */}
                    <Pressable
                        onPress={onClose}
                        className="absolute top-4 right-4 z-10"
                        hitSlop={10}
                    >
                        <Text className="text-black text-xl font-bold">×</Text>
                    </Pressable>

                    <Text className="text-xl font-bold mb-4">Patient List</Text>

                    <FlatList
                        data={patients}
                        keyExtractor={(item) => item.medical_card_id}
                        renderItem={({ item }) => (
                            <View key={item.medical_card_id} className="mb-4 border border-gray-200 rounded-xl p-4">
                                <Text className="font-semibold text-lg">
                                    {item.name} {item.surname}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    ZKK: {item.medical_card_id}
                                </Text>
                                <Text className="text-gray-400 text-xs">{item.birthday}</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
