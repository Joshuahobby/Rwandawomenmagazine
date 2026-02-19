import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock dependencies
vi.mock('../context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal() as Record<string, unknown>;
    return {
        ...actual,
        useAuth: () => ({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
        }),
    };
});

describe('Frontend Smoke Test', () => {
    it('renders the App without crashing', () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        );
        // Success if no crash
    });
});
