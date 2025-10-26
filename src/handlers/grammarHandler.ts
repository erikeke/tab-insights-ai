/**
 * Grammar Handler - Handles grammar checking operations
 */

import { chromeAIService } from '../services/chromeAIService';
import { useLayoutStore } from '../stores/layoutStore';

export const useGrammarHandler = () => {
    const selectedText = useLayoutStore((state) => state.selectedText);
    const frozenSelection = useLayoutStore((state) => state.frozenSelection);
    const wordCount = useLayoutStore((state) => state.wordCount);
    const setIsLoading = useLayoutStore((state) => state.setIsLoading);
    const setAIResponse = useLayoutStore((state) => state.setAIResponse);
    const setError = useLayoutStore((state) => state.setError);

    const handleGrammarCheck = async () => {
        console.log('🔍 Grammar check clicked!');
        console.log('Selected text:', selectedText);

        if (!selectedText) {
            console.log('❌ No selected text, returning');
            return;
        }

        // Immediately show loading state
        const newFrozenSelection = frozenSelection || {
            text: selectedText,
            wordCount: wordCount
        };

        useLayoutStore.setState({
            frozenSelection: newFrozenSelection,
            typeOfAction: "Grammar",
            viewState: 'loading',
            isLoading: true,
            aiResponse: null,
            error: null
        });

        try {
            console.log('🔧 Calling chromeAIService.checkGrammar...');
            const result = await chromeAIService.checkGrammar(selectedText);
            console.log('📝 Grammar check result:', result);

            // Check if the operation was cancelled by checking current state
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring result');
                return;
            }

            if (result.success && result.data) {
                console.log('✅ Grammar check successful!');
                setAIResponse(result.data);
                useLayoutStore.setState({
                    viewState: 'result'
                });
            } else {
                console.log('❌ Grammar check failed:', result.error);
                setError(result.error || 'Grammar check failed');
                useLayoutStore.setState({
                    viewState: 'buttons'
                });
            }
        } catch (error) {
            console.error('💥 Grammar check error:', error);

            // Check if the operation was cancelled
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring error');
                return;
            }

            setError('Failed to check grammar. Please try again.');
            useLayoutStore.setState({
                viewState: 'buttons'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { handleGrammarCheck };
};
