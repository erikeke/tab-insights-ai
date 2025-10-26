/**
 * Question Handler - Handles question answering operations
 */

import { chromeAIService } from '../services/chromeAIService';
import { useLayoutStore } from '../stores/layoutStore';

export const useQuestionHandler = () => {
    const selectedText = useLayoutStore((state) => state.selectedText);
    const frozenSelection = useLayoutStore((state) => state.frozenSelection);
    const wordCount = useLayoutStore((state) => state.wordCount);
    const setIsLoading = useLayoutStore((state) => state.setIsLoading);
    const setAIResponse = useLayoutStore((state) => state.setAIResponse);
    const setError = useLayoutStore((state) => state.setError);

    const handleAskQuestion = async (question?: string) => {
        if (!selectedText) return;

        // Immediately show loading state
        const newFrozenSelection = frozenSelection || {
            text: selectedText,
            wordCount: wordCount
        };

        useLayoutStore.setState({
            frozenSelection: newFrozenSelection,
            typeOfAction: "Ask",
            viewState: 'loading',
            isLoading: true,
            aiResponse: null,
            error: null
        });

        try {
            const userQuestion = question || 'What is the main point of this text?';
            const result = await chromeAIService.askQuestion(selectedText, userQuestion);

            // Check if the operation was cancelled by checking current state
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring result');
                return;
            }

            if (result.success && result.data) {
                setAIResponse(result.data as string);
                useLayoutStore.setState({
                    viewState: 'result'
                });
            } else {
                setError(result.error || 'Question answering failed');
                useLayoutStore.setState({
                    viewState: 'buttons'
                });
            }
        } catch (error) {
            // Check if the operation was cancelled
            const currentState = useLayoutStore.getState();
            if (currentState.viewState !== 'loading') {
                console.log('🚫 Operation was cancelled, ignoring error');
                return;
            }

            setError('Failed to answer question. Please try again.');
            useLayoutStore.setState({
                viewState: 'buttons'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return { handleAskQuestion };
};
