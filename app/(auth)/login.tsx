// screens/LoginScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAuth } from "../services/authContext";
import { Buffer } from "buffer";

const tenantId = "67652474-eba6-4a6b-bbcb-5013864b11f4";
const clientId = "c0a4b7bd-5e2e-48d3-a959-54816b1a512e";

const authority = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
const discovery = {
  authorizationEndpoint: `${authority}/authorize`,
  tokenEndpoint:         `${authority}/token`,
};

export default function LoginScreen() {
  const router = useRouter();
  const { setId, setName, setSurname, setEmail, setRole, setToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: Constants.manifest?.scheme ?? Constants.expoConfig?.scheme,
    path:   "login",
    useProxy:false,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes:      ["openid","profile","User.Read"],
      extraParams: { prompt:"select_account" },
    },
    discovery
  );

  useEffect(() => {
    async function handleAuth() {
      if (response?.type !== "success" || !request) return;
      setLoading(true);

      const { code } = response.params;
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          redirectUri,
          code,
          extraParams: { code_verifier: request.codeVerifier },
        },
        discovery
      );

      const { accessToken: jwt, idToken } = tokenResult;
      setToken(jwt);

      let roleValue = "doctor";  // fallback
      if (idToken) {
        const [, payload] = idToken.split(".");
        try {
          const claims = JSON.parse(Buffer.from(payload, "base64").toString());
          const roles = Array.isArray(claims.roles) ? claims.roles : [];
          if (roles.includes("admin")) roleValue = "admin";
          else if (roles.includes("doctor")) roleValue = "doctor";
        } catch (e) {
          console.warn("Failed to parse ID token roles", e);
        }
      }
      console.log("Assigned Role: ", roleValue)
      setRole(roleValue);

      const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!graphRes.ok) {
        console.error("Graph API error", graphRes.status, await graphRes.text());
        setLoading(false);
        return;
      }
      const user = await graphRes.json();
      console.log("User Profile Data: ",user )
      setProfile(user);

      setId(user.id);
      setName(user.givenName);
      setSurname(user.surname || user.familyName);
      setEmail(user.mail);

      setLoading(false);
      router.replace(roleValue === "admin" ? "/(tabs)/(administrator)" : "/(tabs)/(doctor)");
    }
    handleAuth();
  }, [response, request]);

  return (
    <SafeAreaView className="flex-1 bg-white px-4 justify-center items-center">
      <Text className="text-gray-500 text-lg mb-2">Dobrodošli!</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0063B1" className="mt-4" />
      ) : profile ? (
        <Text className="text-2xl font-bold text-gray-800">
          Pozdravljeni, {profile.displayName}!
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => promptAsync({ useProxy:false })}
          disabled={!request}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white text-base font-medium text-center">
            Prijava z Microsoft
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
