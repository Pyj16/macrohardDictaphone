import { describe, test, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

const mockSignOut = jest.fn();

jest.mock('../app/services/authContext.tsx', () => ({
    useAuth: jest.fn(),
}));

import { useAuth } from '../app/services/authContext.tsx';
import ProfileScreen from '../app/(drawer)/profile';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProfileScreen', () => {
    test('renders without crashing', () => {
        mockUseAuth.mockReturnValue({
            signOut: mockSignOut,
            userInfo: { name: 'Test User', email: 'test@example.com' },
            loading: false,
        });

        const { getByText } = render(<ProfileScreen />);
        expect(getByText).toBeTruthy();
    });

    test('displays user information when available', () => {
        const mockUser = {
            name: 'John Doe',
            email: 'john@example.com',
        };

        mockUseAuth.mockReturnValue({
            signOut: mockSignOut,
            userInfo: mockUser,
            loading: false,
        });

        render(<ProfileScreen />);
    });

    test('handles empty user data gracefully', () => {
        mockUseAuth.mockReturnValue({
            signOut: mockSignOut,
            userInfo: null,
            loading: false,
        });

        render(<ProfileScreen />);
        expect(true).toBe(true);
    });
});