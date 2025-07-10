import AesGcmCrypto from 'react-native-aes-gcm-crypto';

import { Buffer } from 'buffer';
import {RSA} from "react-native-rsa-native";

export default async function decryptAesGcm(encryptedBase64: string, binaryKey: string) {
	const raw = Buffer.from(encryptedBase64, 'base64');
	const keyHex = Buffer.from(binaryKey, 'base64').toString('hex');
	const keyBase64 = Buffer.from(keyHex, 'hex').toString('base64');
	const nonce = raw.slice(0, 12);
	const tag = raw.slice(-16);
	const ciphertext = raw.slice(12, raw.length - 16);

	const nonceBase64 = nonce.toString('hex');
	const tagBase64 = tag.toString('hex');
	const ciphertextBase64 = ciphertext.toString('base64');

	try {
		const decrypted = await AesGcmCrypto.decrypt(
			ciphertextBase64,
			keyBase64,
			nonceBase64,
			tagBase64,
			false
		);
		return decrypted;
	} catch (err) {
		console.error('AES‐GCM decryption failed:', err);
		return '';
	}
}

export async function encryptAes(plaintext: string, base64key:string){
	const result = await AesGcmCrypto.encrypt(plaintext, false, base64key);
	const ivBytes = Buffer.from(result.iv, 'hex');
	const contentBytes = Buffer.from(result.content, 'base64');
	const tagBytes = Buffer.from(result.tag, 'hex');
	const combined = Buffer.concat([ivBytes, contentBytes, tagBytes]);
	const encrypted_text = combined.toString('base64');
	return encrypted_text;
}


