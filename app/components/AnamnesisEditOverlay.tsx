import React, { useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	Pressable,
	ScrollView,
} from "react-native";
import { AnamnesisType } from "@/app/types/MedicalTypes";

export default function AnamnesisEditOverlay({ visible, onClose, data, onSave }: { visible: boolean; onClose: () => void; data: AnamnesisType; onSave: (updated: AnamnesisType) => void; }) {
	const [diagnosis, setDiagnosis] = useState(data.diagnosis);
	const [mkb10, setMkb10] = useState(data.mkb10);
	const [contents, setContents] = useState(data.contents);

	const handleSave = () => {
		onSave({
			...data,
			mkb10: mkb10,
			diagnosis: diagnosis,
			contents,
		});
		onClose();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
			className="h-full"
		>
			<View className="flex-1 bg-white h-full items-center px-4">
				<View className="bg-white w-full rounded-2xl p-6 max-h-[90%] relative">
					<Pressable
						onPress={onClose}
						className="absolute top-4 right-4 z-10"
						hitSlop={10}
					>
						<Text className="text-black text-xl font-bold">×</Text>
					</Pressable>

					<ScrollView>
						<Text className="text-xl font-bold mb-4">Uredi Anamnezo</Text>

						<TextInput
							placeholder="Diagnoza"
							value={diagnosis}
							onChangeText={setDiagnosis}
							className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
						/>

						<TextInput
							placeholder="MKB-10"
							value={mkb10}
							onChangeText={setMkb10}
							className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
						/>

						<TextInput
							placeholder="Vsebina"
							value={contents}
							onChangeText={setContents}
							multiline
							numberOfLines={32}
							textAlignVertical="top"
							className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
						/>

						<Pressable
							onPress={handleSave}
							className="bg-[#00A8E8] py-3 rounded-lg items-center mb-3"
						>
							<Text className="text-white font-semibold">Shrani</Text>
						</Pressable>

						<Pressable
							onPress={onClose}
							className="bg-gray-300 py-3 rounded-lg items-center"
						>
							<Text className="text-black font-semibold">Prekliči</Text>
						</Pressable>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
