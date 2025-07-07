import React from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    ScrollView,
} from "react-native";
import { AnamnesisType } from "@/app/types/MedicalTypes";

export default function AnamnesisOverlay({ visible, onClose, data, onEdit}: { visible: boolean; onClose: () => void; data: AnamnesisType; onEdit: () => void; }) {
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

                    <Text className="text-xl font-bold mb-2">
                        {data.p_name} {data.p_surname}
                    </Text>
                    <Text className="text-gray-600 mb-1">
                        Doctor: {data.d_name} {data.d_surname}
                    </Text>
                    <Text className="text-gray-400 text-xs mb-4">{data.date}</Text>

                    <ScrollView>
                        <Text className="text-gray-700 leading-6">{data.contents}</Text>
                    </ScrollView>

                    <Pressable
                        onPress={onEdit}
                        className="mt-4 bg-[#00A8E8] py-3 rounded-lg items-center"
                    >
                        <Text className="text-white font-semibold">Uredi</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
