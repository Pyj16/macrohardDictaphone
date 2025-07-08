import SERVER_URL from "@/constants/serverSettings";
import {RSA} from "react-native-rsa-native";
import decryptAesGcm from "@/app/services/encryption";
import {Modal, Pressable, SafeAreaView, ScrollView, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import {AnamnesisType} from "@/app/types/MedicalTypes";
//import useFakeAuthContext from "@/app/services/fakeAuthContext";
import AnamnesisEditOverlay from "@/app/components/AnamnesisEditOverlay";
import { useAuth } from '../../services/authContext';

export default function AdminIndex(){
	const [anamnesis, setAnamnesis] = useState<AnamnesisType[]>([]);

	const [loading, setLoading] = useState<boolean>(true);
	const [selectedAnamnesis, setSelectedAnamnesis] = useState<AnamnesisType>();
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const [showEditOverlay, setShowEditOverlay] = useState<boolean>(false);
	const {name, surname, email} = useAuth(); // const {name, surname, email} = useFakeAuthContext();
	const close = () => {
		setShowEditOverlay(false);
	}
	const handleShowEditOverlay = () => {
		setShowOverlay(false);
		setShowEditOverlay(true);
	}

	const dateFormat = (dateString: string) => {
		const weekdays = ["ned", "pon", "tor", "sre", "čet", "pet", "sob"];
		const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
		const date = new Date(dateString);

		// Get parts
		const weekday = weekdays[date.getDay()];
		const day = date.getDate();
		const month = months[date.getMonth()];
		const year = date.getFullYear();

		return `${weekday}, ${day}. ${month} ${year}`;
	}

	const handleAnamnesisPress = (anamnesis: AnamnesisType) => {
		setSelectedAnamnesis(anamnesis);
		setShowOverlay(true);
	};
	useEffect(() => {
		const fetchAnamnesis = async () => {
			try {
				setLoading(true);
				const keypair = await RSA.generateKeys(2048)
				const publicKey = keypair.public;
				const response = await fetch(`${SERVER_URL}/fetch-anamnesis`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({public_key: publicKey, doctor_email: email}),

				})
				const rawText = await response.text();
				let data: any;
				try {
					data = JSON.parse(rawText);
				} catch (error) {
					console.error("Failed to parse response", error);
					return;
				}
				if (!data || !Array.isArray(data.anamnesis)) {
					console.error("Unexpected structure", data);
				}

				const dcKey = await RSA.decrypt64(data.encrypted_key, keypair.private);


				for (let i=0; i<data.anamnesis.length; i++){
					data.anamnesis[i].contents = await decryptAesGcm(data.anamnesis[i].contents, dcKey);
					data.anamnesis[i].diagnosis = await decryptAesGcm(data.anamnesis[i].diagnosis, dcKey)

				}
				setAnamnesis(data.anamnesis)
				setLoading(false);
			} catch (e) {
				console.error("Failed to parse response", e);
			}
		}
		fetchAnamnesis().then(()=>console.log("success"))
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-white px-4 pt-10">

			<Text className="text-black text-center mt-8  text-2xl mb-4">Nepotrjene anamneze</Text>

			{!loading && anamnesis.map((item, index) => (

				<Pressable onPress={() => handleAnamnesisPress(item)} key={index}>
					<View className="bg-white border-l-black border p-4 rounded-2xl shadow-md mb-2">
						<Text className="font-semibold text-base">{item.title}</Text>
						<Text className="text-gray-400 text-sm">{item.p_name} {item.p_surname}</Text>
						<Text className="absolute right-4 top-4 text-gray-400 text-sm">{dateFormat(item.date)}</Text>
					</View>
				</Pressable>
			))}

			<Modal
				visible={showOverlay}
				transparent
				animationType="slide"
				onRequestClose={() => setShowOverlay(false)}
			>
				<View className="flex-1 bg-white h-full w-full justify-center px-6">
					<View className="bg-white p-4 rounded-2xl h-full">
						<View className="flex-row justify-between items-center mb-3">
							<Text className="text-lg font-semibold">{selectedAnamnesis?.title}</Text>
							<Pressable onPress={() => setShowOverlay(false)}>
								<Text className="text-black text-3xl">×</Text>
							</Pressable>
						</View>
						<Text className="text-gray-500 text-sm mb-1">
							Pacient: {selectedAnamnesis?.p_name} {selectedAnamnesis?.p_surname}
						</Text>
						<Text className="text-gray-500 text-sm mb-3">
							Zdravnik: Dr. {name} {surname}
						</Text>
						<ScrollView>
							<Text className="text-gray-700 text-base">This is actually what it{selectedAnamnesis?.contents}</Text>
						</ScrollView>

						<Pressable className="bg-[#00A8E8] w-full h-[40px] rounded-lg justify-center items-center mt-4 " onPress={() => handleShowEditOverlay()}>
							<Text className=" text-white text-lg ">Uredi in potrdi</Text>
						</Pressable>

					</View>
				</View>
			</Modal>
			{ showEditOverlay && (
				<View className="h-full">
					<AnamnesisEditOverlay visible={true} onClose={close} data={selectedAnamnesis!} onSave={setSelectedAnamnesis} isAdmin={true}/>
				</View>
			)}



		</SafeAreaView>
		)
}