/**
 * Summarization Handler - Handles text summarization operations
 */

import { chromeAIService } from '../services/chromeAIService';
import { useLayoutStore } from '../stores/layoutStore';

export interface SummarizationOptions {
    maxLength?: number;
    style?: 'bullet' | 'paragraph' | 'brief';
}

export const useSummarizationHandler = () => {
    const selectedText = useLayoutStore((state) => state.selectedText);
    const frozenSelection = useLayoutStore((state) => state.frozenSelection);
    const wordCount = useLayoutStore((state) => state.wordCount);
    const setIsLoading = useLayoutStore((state) => state.setIsLoading);
    const setAIResponse = useLayoutStore((state) => state.setAIResponse);
    const setError = useLayoutStore((state) => state.setError);

    const handleSummarization = async (options: SummarizationOptions = {}) => {
        console.log('📄 Summarization handler called');
        if (!selectedText) {
            console.log('❌ No selected text for summarization');
            return;
        }

        console.log('✅ Starting summarization...');

        // Immediately show loading state
        const newFrozenSelection = frozenSelection || {
            text: selectedText,
            wordCount: wordCount
        };

        useLayoutStore.setState({
            frozenSelection: newFrozenSelection,
            typeOfAction: "Summarize",
            viewState: 'loading',
            isLoading: true,
            aiResponse: null,
            error: null
        });

        try {
            console.log('🔧 Calling chromeAIService.summarizeText...');
            const result = await chromeAIService.summarizeText(selectedText, {
                maxLength: options.maxLength || 100,
                style: options.style || 'bullet'
            });
            console.log('📝 Summarization result:', result);

            // Check if the operation was cancelled by checking current state
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring result');
                return;
            }

            if (result.success && result.data) {
                console.log('✅ Summarization successful!');
                setAIResponse(result.data as string);
                useLayoutStore.setState({
                    viewState: 'result'
                });
            } else {
                console.log('❌ Summarization failed:', result.error);
                setError(result.error || 'Summarization failed');
                useLayoutStore.setState({
                    viewState: 'buttons'
                });
            }
        } catch (error) {
            console.error('💥 Summarization error:', error);

            // Check if the operation was cancelled
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring error');
                return;
            }

            setError('Failed to summarize text. Please try again.');
            useLayoutStore.setState({
                viewState: 'buttons'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { handleSummarization };
};
