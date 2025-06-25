import { Text, TouchableOpacity } from "react-native";

type Props = {
    onUpload: () => void;
};

export default function UploadButton({ onUpload }: Props) {
    return (
        <TouchableOpacity
            onPress={onUpload}
            className="bg-green-500 py-4 mx-8 my-5 rounded-lg items-center shadow"
        >
            <Text className="text-white text-base font-semibold">Submit Recording</Text>
        </TouchableOpacity>
    );
}
