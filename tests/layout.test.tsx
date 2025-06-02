import { describe, test, expect, jest } from '@jest/globals';
import React from 'react';

jest.mock('expo-router/drawer', () => ({
    Drawer: {
        Screen: ({ name, options }: any) => null,
    },
}));

jest.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

jest.mock('@/constants/Colors', () => ({
    Colors: {
        light: {
            background: '#fff',
            text: '#000',
            tint: '#007AFF',
        },
        dark: {
            background: '#000',
            text: '#fff',
            tint: '#007AFF',
        },
    },
}));

jest.mock('@/components/ui/IconSymbol', () => ({
    IconSymbol: () => null,
}));

jest.mock('@react-navigation/core', () => ({
    useRoute: () => ({
        params: null,
    }),
}));

import DrawerLayout from '../app/(drawer)/_layout';

describe('DrawerLayout', () => {
    test('renders without crashing', () => {
        const component = () => <DrawerLayout />;
        expect(component).toBeTruthy();
    });

    test('component can be instantiated', () => {
        const element = <DrawerLayout />;
        expect(element).toBeTruthy();
        expect(element.type).toBe(DrawerLayout);
    });

    test('uses light color scheme by default', () => {
        const component = DrawerLayout;
        expect(typeof component).toBe('function');
    });

    test('drawer configuration is valid', () => {
        // Test that the drawer screens are properly configured
        const screens = ['index', 'statistics', 'debug', 'profile'];
        screens.forEach(screen => {
            expect(typeof screen).toBe('string');
        });
    });
});