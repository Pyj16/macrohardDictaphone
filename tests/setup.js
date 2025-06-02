import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Expo modules
jest.mock('expo-av', () => ({
    Audio: {
        requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    },
}));

jest.mock('expo-file-system', () => ({
    documentDirectory: 'file://test/',
    makeDirectoryAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    readDirectoryAsync: jest.fn(() => Promise.resolve([])),
    moveAsync: jest.fn(),
}));

jest.mock('expo-audio', () => ({
    useAudioRecorder: jest.fn(() => ({
        prepareToRecordAsync: jest.fn(),
        record: jest.fn(),
        stop: jest.fn(),
        uri: 'file://test/recording.wav',
    })),
    RecordingPresets: {
        HIGH_QUALITY: {},
    },
}));

// Mock Google Sign In
jest.mock('@react-native-google-signin/google-signin');

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
    useRoute: () => ({
        params: { sessionId: 1337 }
    }),
}));