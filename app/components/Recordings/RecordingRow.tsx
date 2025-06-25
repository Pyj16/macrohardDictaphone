import { Text, TouchableOpacity, View } from "react-native";

type Props = {
    index: number;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onDelete: () => void;
};

export default function RecordingRow({ index, isPlaying, onPlay, onPause, onDelete }: Props) {
    return (
        <View className="flex-row justify-between items-center bg-white rounded-lg py-4 px-3 my-2 shadow-sm">
            <Text className="text-base text-gray-800 font-medium">Segment #{index + 1}</Text>
            <View className="flex-row items-center">
                <TouchableOpacity onPress={isPlaying ? onPause : onPlay}>
                    <Text className="text-lg text-gray-700 mx-2">{isPlaying ? "❚❚" : "▶"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete}>
                    <Text className="text-lg text-red-600 mx-2">🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
