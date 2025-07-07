import { Text, TouchableOpacity } from "react-native";

type Props = {
    onUpload: () => void;
};

export default function UploadButton({ onUpload }: Props) {
    return (
        <TouchableOpacity
            onPress={onUpload}
            className="bg-[#00A8E8] w-4/5 py-4 mx-8 mt-5 mb-24 rounded-lg items-center shadow"
        >
            <Text className="text-white text-base font-semibold">Pošlji posnetke </Text>
        </TouchableOpacity>
    );
}
