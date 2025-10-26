/**
 * AI Actions Hook - Combines all AI action handlers
 */

import { useGrammarHandler } from '../handlers/grammarHandler';
import { useTranslationHandler } from '../handlers/translationHandler';
import { useSummarizationHandler } from '../handlers/summarizationHandler';
import { useQuestionHandler } from '../handlers/questionHandler';

export const useAIActions = () => {
    const { handleGrammarCheck } = useGrammarHandler();
    const { handleTranslation } = useTranslationHandler();
    const { handleSummarization } = useSummarizationHandler();
    const { handleAskQuestion } = useQuestionHandler();

    return {
        handleGrammarCheck,
        handleTranslation,
        handleSummarization,
        handleAskQuestion
    };
};
