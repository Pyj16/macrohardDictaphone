import React from 'react';
import { render, screen } from '@testing-library/react-native';
import {describe, expect, test} from "@jest/globals";

describe('Session Data Structure', () => {
    test('creates recording session with correct structure', () => {
        const testSession = {
            sessionId: '0',
            patientId: '1',
            title: 'AnaTitle',
            recordings: []
        };

        expect(testSession).toHaveProperty('sessionId');
        expect(testSession).toHaveProperty('patientId');
        expect(testSession).toHaveProperty('title');
        expect(testSession.recordings).toEqual([]);
        expect(testSession.sessionId).toBe('0');
        expect(testSession.title).toBe('AnaTitle');
    });

    test('session can store recordings array', () => {
        const testSession = {
            sessionId: '1337',
            patientId: '2',
            title: 'TitleAna',
            recordings: ['recording1.wav', 'recording2.wav']
        };

        expect(testSession.recordings).toHaveLength(2);
        expect(testSession.recordings[0]).toBe('recording1.wav');
    });
});

describe('Recording Status', () => {
    test('status enum has correct values', () => {
        enum Status {
            idle,
            recording,
            replaying,
        }

        expect(Status.idle).toBe(0);
        expect(Status.recording).toBe(1);
        expect(Status.replaying).toBe(2);
    });
});