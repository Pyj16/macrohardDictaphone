import AesGcmCrypto from "react-native-aes-gcm-crypto";

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
		return await AesGcmCrypto.decrypt(
			ciphertextBase64,
			keyBase64,
			nonceBase64,
			tagBase64,
			false
		);
	} catch (err) {
		console.error('AES‐GCM decryption failed:', err);
		return '';
	}
}