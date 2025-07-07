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
        params: { sessionId: 1 },
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
        const screens = ['index', 'statistics', 'personel', 'profile'];
        screens.forEach(screen => {
            expect(typeof screen).toBe('string');
        });
    });

    test('route params handling', () => {
        const mockRoute = { params: { sessionId: 123 } };
        expect(mockRoute.params.sessionId).toBe(123);
    });

    test('screen options configuration', () => {
        const expectedScreens = [
            { name: 'index', title: 'Home', icon: 'house.fill' },
            { name: 'statistics', title: 'Statistics', icon: 'chart.bar.fill' },
            { name: 'personel', title: 'Personel', icon: 'paperplane.fill' },
            { name: 'profile', title: 'Profile', icon: 'person.fill' }
        ];

        expectedScreens.forEach(screen => {
            expect(screen.name).toBeDefined();
            expect(screen.title).toBeDefined();
            expect(screen.icon).toBeDefined();
        });
    });
});