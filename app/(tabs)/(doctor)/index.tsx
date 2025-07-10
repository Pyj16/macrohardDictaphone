import React, { useState, useEffect}from "react";
import {Text, View, ScrollView, SafeAreaView, TouchableOpacity, Pressable, Modal, Image} from "react-native";
import PatientOverlay from "@/app/components/PatientsOverlay";
import {AnamnesisType, DoctorType, PatientType, updatedAnamnesisType} from "@/app/types/MedicalTypes";
import { useRouter } from "expo-router";
//import fakeAuthContext from "@/app/services/fakeAuthContext";
import { useAuth } from '../../services/authContext';
import SERVER_URL, {public_key} from "@/constants/serverSettings";
import {RSA} from "react-native-rsa-native";
import decryptAesGcm, {encryptAes} from "@/app/services/encryption";
import AnamnesisEditOverlay from "@/app/components/AnamnesisEditOverlay";
import {createPDF} from '@/app/services/pdfGenetaion'
import AesGcmCrypto from "react-native-aes-gcm-crypto";
import { Buffer } from 'buffer';


export default function DoctorHome() {

	const [showPatients, setShowPatients] = useState<boolean>(false);
	const [patients, setPatients] = useState<PatientType[]>([]);
	const [anamnesis, setAnamnesis] = useState<AnamnesisType[]>([]);

	const [loading, setLoading] = useState<boolean>(true);
	const [selectedAnamnesis, setSelectedAnamnesis] = useState<AnamnesisType>();
	const [showOverlay, setShowOverlay] = useState<boolean>(false);
	const router = useRouter();
	const [showEditOverlay, setShowEditOverlay] = useState<boolean>(false);
	const { email, name, surname, id } = useAuth(); //const { email, name, surname, id } = fakeAuthContext();
	const [r, sr] = useState("")



	const confirmAnamnesis = async (updatedAnamnesis:updatedAnamnesisType) => {
		try{
			const array = new Uint8Array(32);
			crypto.getRandomValues(array);
			const aesKeyBase64 = Buffer.from(array).toString('base64');
			console.log("aesKeyBase64", aesKeyBase64);

		}catch (e){
			console.log("error", e);
		}
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		const aesKeyBase64 = Buffer.from(array).toString('base64');

		let encrypted_key = await RSA.encrypt(aesKeyBase64, public_key);


		console.log("Beginning encryption of the diagnosis...");
		let diagnosis = await encryptAes(updatedAnamnesis.diagnosis, aesKeyBase64);
		console.log(typeof diagnosis);

		let contents = await encryptAes(updatedAnamnesis.content,  aesKeyBase64);
		console.log("Anamnesis encrypted", typeof contents);

		try{
			console.log("encrypted_key", typeof encrypted_key);
			console.log("mkb10", typeof updatedAnamnesis.mkb10);
			console.log("Trying to fetch the data...");
			let response = await fetch(`${SERVER_URL}/update-anamnesis`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					anamnesis_id: updatedAnamnesis.anamnesis_id,
					encrypted_text: contents,
					encrypted_diagnosis: diagnosis,
					mkb10: updatedAnamnesis.mkb10,
					encrypted_key: encrypted_key,
					patient_id: updatedAnamnesis.patient_id
				})
			});
			console.log("response", response);
			let data  = await response.json();

			if (data.success) {
				console.log("Data updated successfully");
				sr("_")
			}else{
				console.log("Data update failed: ", data);
			}
		}catch(e){
			console.error(e);
		}

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

	//
	const handleAnamnesisPress = (anamnesis: AnamnesisType) => {
		setSelectedAnamnesis(anamnesis);
		setShowOverlay(true);
	};

	let close  = () => {
		setShowEditOverlay(false)
	}

	const handleShowEditOverlay = () => {
		setShowEditOverlay(true);
		setShowOverlay(false);
	}

	// Border color of anamnesis depending on status
	let statusColor = (status: string) => {
		switch (status) {
			case 'CONFIRMED':
				return "#03fc62"
			case 'PENDING':
				return "#f2e441"
			default:
				return "#666565"
		}
	}

	// Background color with opacity of anamnesis depending on status
	const hexToRgba = (hex: string, alpha: number) => {
		let r = 0, g = 0, b = 0;

		if (hex.length === 4) {
			r = parseInt(hex[1] + hex[1], 16);
			g = parseInt(hex[2] + hex[2], 16);
			b = parseInt(hex[3] + hex[3], 16);
		} else if (hex.length === 7) {
			r = parseInt(hex[1] + hex[2], 16);
			g = parseInt(hex[3] + hex[4], 16);
			b = parseInt(hex[5] + hex[6], 16);
		}

		return `rgba(${r},${g},${b},${alpha})`;
	};


	useEffect(() => {
		const fetchPatients = async () => {
			try{
				setLoading(true);
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
		fetchPatients().then(()=> {fetchAnamnesis()})
	}, [r]);




	const modPdf = (anamnesis: AnamnesisType) => {
		return  {
			type: anamnesis.title,
			patientName: anamnesis.p_name,
			patientSurname: anamnesis.p_surname,
			patientDoB: anamnesis.birthday,
			patientAddress: anamnesis.address,
			town: anamnesis.city,
			zip: anamnesis.zipcode,
			doctorName: anamnesis.d_name,
			doctorSurname: anamnesis.d_surname,
			doctorSpecialization: anamnesis.specialty,
			creationDate: anamnesis.date,
			diagnosis: anamnesis.diagnosis,
			anamnesis: anamnesis.contents,
			kzz: anamnesis.kzz,
			mkb10: anamnesis.mkb10
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-white px-4 pt-10">

			<PatientOverlay
				visible={showPatients}
				onClose={() => setShowPatients(false)}
				patients={patients}
			/>


			<Text className="text-gray-500 text-md">welcome back!</Text>
			<Text className="text-2xl font-bold mb-4">Dr. {surname}</Text>

			<View className="h-28 mb-4">
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
						<Text className="text-white font-semibold">Pacienti</Text>
					</TouchableOpacity>

					<View className="w-28 h-24 bg-blue-500 rounded-xl justify-center items-center">
						<Text className="text-white font-semibold">Posnetki</Text>
					</View>
				</ScrollView>
			</View>
			<Text className="text-gray-500 mb-2">Zadnje anamneze</Text>

			{!loading && anamnesis.map((item, index) => {
				const borderColor = statusColor(item.status);
				const backgroundColor = hexToRgba(borderColor, 0.10);
				return (
					<Pressable onPress={() => handleAnamnesisPress(item)} key={index}>
						<View
							className={`border p-4 rounded-2xl mb-2`}
							style={{
								borderColor: borderColor,
								backgroundColor: backgroundColor,
							}}>
							<Text className="font-semibold text-base">{item.title}</Text>
							<Text className="text-gray-700 text-sm">{item.p_name} {item.p_surname}</Text>
							<Text className="absolute right-4 top-4 text-gray-700 text-sm">{dateFormat(item.date)}</Text>
						</View>
					</Pressable>
				);
			})}


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
								<Text className="text-black text-2xl">×</Text>
							</Pressable>
						</View>
						<Text className="text-gray-500 text-sm mb-1">
							Pacient: {selectedAnamnesis?.p_name} {selectedAnamnesis?.p_surname}
						</Text>
						<Text className="text-gray-500 text-sm mb-3">
							Zdravnik: Dr. {name} {surname}
						</Text>
						{
							selectedAnamnesis?.status === "CONFIRMED" && (
								<Text className="text-gray-500 text-sm mb-3">
									Diagnoza: {selectedAnamnesis?.mkb10}: {selectedAnamnesis?.diagnosis}
								</Text>
							)
						}
						<ScrollView>
							<Text className="text-gray-700 text-base">{selectedAnamnesis?.contents}</Text>
						</ScrollView>


						{
							selectedAnamnesis?.status !== "CONFIRMED" ? (
									<TouchableOpacity className={` rounded-lg items-center justify-center mt-4 h-[40px]
										${selectedAnamnesis?.status === "UNPROCESSED" ? "bg-gray-500" : "bg-[#00A8E8]"}
									`}
													  onPress={() => handleShowEditOverlay()}
													  disabled={selectedAnamnesis?.status === "UNPROCESSED"}
									>
										<Text className={`text-lg text-white `}>Uredi in potrdi</Text>
									</TouchableOpacity>

							): (
							<TouchableOpacity className={` rounded-lg items-center justify-center mt-4 h-[40px] bg-[#00A8E8]`}
								onPress={() => createPDF(modPdf(selectedAnamnesis!))}
							>
								<Text className={`text-lg text-white `}>Prenesi PDF</Text>
							</TouchableOpacity>
							)
						}


					</View>
				</View>
			</Modal>
			{ showEditOverlay && selectedAnamnesis?.status === "PENDING" && (
				<View className="h-full">
					<AnamnesisEditOverlay visible={true} onClose={close} data={selectedAnamnesis!} onSave={confirmAnamnesis} isAdmin={false}/>
				</View>
			)}

			<View className="absolute bottom-8 pb-4 left-0 right-0 items-center">
				<Pressable
					onPress={() => {
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
