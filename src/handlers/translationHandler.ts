/**
 * Translation Handler - Handles translation operations
 */

import { chromeAIService } from '../services/chromeAIService';
import { useLayoutStore } from '../stores/layoutStore';

export const useTranslationHandler = () => {
    const selectedText = useLayoutStore((state) => state.selectedText);
    const frozenSelection = useLayoutStore((state) => state.frozenSelection);
    const wordCount = useLayoutStore((state) => state.wordCount);
    const setIsLoading = useLayoutStore((state) => state.setIsLoading);
    const setAIResponse = useLayoutStore((state) => state.setAIResponse);
    const setError = useLayoutStore((state) => state.setError);

    const handleTranslation = async (targetLanguage: string = 'en') => {
        console.log('🌐 Translation handler called');
        if (!selectedText) {
            console.log('❌ No selected text for translation');
            return;
        }

        console.log('✅ Starting translation...');

        // Immediately show loading state
        const newFrozenSelection = frozenSelection || {
            text: selectedText,
            wordCount: wordCount
        };

        useLayoutStore.setState({
            frozenSelection: newFrozenSelection,
            typeOfAction: "Translate",
            viewState: 'loading',
            isLoading: true,
            aiResponse: null,
            error: null
        });

        try {
            console.log('🔧 Calling chromeAIService.translateText...');
            const result = await chromeAIService.translateText(selectedText, {
                targetLanguage
            });
            console.log('📝 Translation result:', result);

            // Check if the operation was cancelled by checking current state
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring result');
                return;
            }

            if (result.success && result.data) {
                console.log('✅ Translation successful!');
                setAIResponse(result.data as string);
                useLayoutStore.setState({
                    viewState: 'result'
                });
            } else {
                console.log('❌ Translation failed:', result.error);
                setError(result.error || 'Translation failed');
                useLayoutStore.setState({
                    viewState: 'buttons'
                });
            }
        } catch (error) {
            console.error('💥 Translation error:', error);

            // Check if the operation was cancelled
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring error');
                return;
            }

            setError('Failed to translate text. Please try again.');
            useLayoutStore.setState({
                viewState: 'buttons'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { handleTranslation };
};
