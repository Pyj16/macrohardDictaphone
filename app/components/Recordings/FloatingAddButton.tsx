import { View, Pressable, Text } from 'react-native';

export default function FloatingPlusButton({ onPress }: { onPress: () => void }) {
    return (
        <View className="absolute bottom-8 right-8 z-50">
            <Pressable
                onPress={onPress}
                className="bg-blue-500 rounded-full w-16 h-16 items-center justify-center shadow"
            >
                <Text className="text-white text-3xl font-bold">+</Text>
            </Pressable>
        </View>
    );
}
