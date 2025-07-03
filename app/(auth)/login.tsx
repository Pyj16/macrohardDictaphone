import React, {useEffect} from "react";
import { View, Text } from "react-native";
import {useAuth} from "../services/authContext";

export default function LoginScreen() {
    useEffect(() => {
        console.log("Login Screen");
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text onPress={useAuth().signIn}>Sign In</Text>
        </View>
    );
}
