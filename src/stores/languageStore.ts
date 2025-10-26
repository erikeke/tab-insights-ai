/**
 * Language Store - Manages translation language preferences with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LanguagePreference {
    code: string;
    name: string;
}

/**
 * Supported Languages for Translation
 * 
 * These languages are supported by Chrome AI Translation API.
 * The availability depends on:
 * 1. Chrome AI API support (Chrome 138+)
 * 2. Origin trial registration (if required)
 * 3. System requirements and flags enabled
 * 
 * Languages are ordered by common usage, with English first as default.
 */
export const SUPPORTED_LANGUAGES: LanguagePreference[] = [
    { code: 'en', name: 'English' },      // Default language
    { code: 'es', name: 'Spanish' },      // Most common Romance language
    { code: 'fr', name: 'French' },       // Common European language
    { code: 'de', name: 'German' },       // Common European language
    { code: 'it', name: 'Italian' },      // Romance language
    { code: 'pt', name: 'Portuguese' },    // Romance language
    { code: 'ru', name: 'Russian' },      // Slavic language
    { code: 'ja', name: 'Japanese' },     // East Asian language
    { code: 'ko', name: 'Korean' },       // East Asian language
    { code: 'zh', name: 'Chinese' },      // East Asian language
    { code: 'ar', name: 'Arabic' },       // Middle Eastern language
    { code: 'hi', name: 'Hindi' },        // South Asian language
];

interface LanguageState {
    selectedLanguage: LanguagePreference;
    setSelectedLanguage: (language: LanguagePreference) => void;
    getLanguageByCode: (code: string) => LanguagePreference | undefined;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            selectedLanguage: SUPPORTED_LANGUAGES[0], // Default to English
            setSelectedLanguage: (language) => set({ selectedLanguage: language }),
            getLanguageByCode: (code) =>
                SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0],
        }),
        {
            name: 'language-preferences', // localStorage key
            partialize: (state) => ({ selectedLanguage: state.selectedLanguage }),
        }
    )
);
