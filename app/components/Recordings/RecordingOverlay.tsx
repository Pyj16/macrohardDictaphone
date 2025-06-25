import { View, Text, Pressable, Image } from "react-native";
import { useEffect } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

export default function RecordingOverlay({
                                             isRecording,
                                             onClose,
                                             onToggleRecording,
                                         }: {
    isRecording: boolean;
    onClose: () => void;
    onToggleRecording: () => void;
}) {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isRecording) {
            scale.value = withRepeat(
                withTiming(1.15, {
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                }),
                -1,
                true
            );
        } else {
            scale.value = withTiming(1, {
                duration: 300,
                easing: Easing.out(Easing.ease),
            });
        }
    }, [isRecording]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="w-72 h-72 bg-white rounded-3xl items-center justify-center relative shadow-2xl">
                {/* Close X Button */}
                <Pressable onPress={onClose} className="absolute top-2 right-4 z-10">
                    <Text className="text-5xl text-gray-400">×</Text>
                </Pressable>

                {/* Pulsing Mic Button */}
                <Pressable onPress={onToggleRecording}>
                    <Animated.View
                        style={[
                            {
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                backgroundColor: isRecording ? "#003459" : "white",
                                justifyContent: "center",
                                alignItems: "center",
                            },
                            animatedStyle,
                        ]}
                    >
                        <Image
                            source={require("../../assets/images/microphone.png")}
                            style={{
                                width: 40,
                                height: 40,
                                tintColor: isRecording ? "white" : "#003459",
                            }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </Pressable>

                <Text className="mt-5 text-gray-700 text-base font-medium">
                    {isRecording ? "Recording…" : "Tap to Record"}
                </Text>
            </View>
        </View>
    );
}
