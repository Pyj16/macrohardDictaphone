import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export const signIn = async () => {
  try {
    console.log("Checking for Play Services...");
    await GoogleSignin.hasPlayServices();

    console.log("Attempting Google Sign-In...");
    const response = await GoogleSignin.signIn();
    console.log("Sign-In Response:", response);

    if (isSuccessResponse(response)) {
      const userInfo = response.data;
      setState({ userInfo });
      console.log("Sign-In Successful. User Info:", userInfo);
    } else {
      console.log("Sign-In cancelled or unsuccessful:", response);
    }
  } catch (error) {
    console.log("Google Sign-In Error:", error);

    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          console.log("Sign-In already in progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log("Google Play Services not available or outdated");
          break;
        case statusCodes.SIGN_IN_CANCELLED:
          console.log("Sign-In cancelled by user");
          break;
        default:
          console.log("Unknown error code:", error.code);
      }
    } else {
      console.log("Non-Google error:", error);
    }
  }
};

