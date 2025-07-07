import { Text, View } from "react-native";
import RecordingRow from "./RecordingRow";

type Props = {
    recordings: string[];
    playingAt: number;
    play: (i: number) => void;
    pause: () => void;
    deleteAt: (i: number) => void;
    isPlaying: boolean;
};

export default function RecordingList({ recordings, playingAt, play, pause, deleteAt, isPlaying }: Props) {
    if (recordings.length === 0) {
        return <Text className="text-base text-gray-500 text-center mt-10">Seznam posnetkov je prazen</Text>;
    }

    return (
        <View className="flex-1 px-4">
            {recordings.map((_, i) => (
                <RecordingRow
                    key={i}
                    index={i}
                    isPlaying={i === playingAt && isPlaying}
                    onPlay={() => play(i)}
                    onPause={pause}
                    onDelete={() => deleteAt(i)}
                />
            ))}
        </View>
    );
}
