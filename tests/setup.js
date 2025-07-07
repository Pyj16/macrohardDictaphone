import '@testing-library/jest-native/extend-expect';

jest.mock('nativewind/jsx-runtime', () => ({
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
}), { virtual: true });

jest.mock('nativewind', () => ({
    styled: (component) => component,
}), { virtual: true });

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
    AudioModule: {
        requestRecordingPermissionsAsync: jest.fn(() =>
            Promise.resolve({ granted: true })
        )
    }
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

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => ({
    default: {
        View: 'View',
        Text: 'Text',
        ScrollView: 'ScrollView',
        FlatList: 'FlatList',
        Image: 'Image',
        createAnimatedComponent: (component) => component,
    },
    interpolate: jest.fn(),
    useAnimatedRef: jest.fn(),
    useAnimatedStyle: jest.fn(() => ({})),
    useScrollViewOffset: jest.fn(),
    runOnJS: jest.fn(),
    withSpring: jest.fn(),
    withTiming: jest.fn(),
}));

// Mock the global CSS import
jest.mock('@/global.css', () => ({}));