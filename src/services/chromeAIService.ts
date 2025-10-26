/**
 * Chrome AI Service - Modular service for Chrome AI API integrations
 * Handles grammar checking, translation, summarization, and Q&A functionality
 */

export interface GrammarResult {
    correctedText: string;
    changes: string[];
}

export interface AIResponse {
    success: boolean;
    data?: string | GrammarResult;
    error?: string;
}

export interface TranslationOptions {
    sourceLanguage?: string;
    targetLanguage?: string;
}

export interface SummarizationOptions {
    maxLength?: number;
    style?: 'bullet' | 'paragraph' | 'brief';
}

class ChromeAIService {
    private isSupported: boolean = false;
    private initialized: boolean = false;
    private session: any = null;
    private currentAbortController: AbortController | null = null;

    constructor() {
        this.checkSupport();
    }

    /**
     * Check if Chrome AI APIs are supported
     */
    private async checkSupport(): Promise<void> {
        try {
            console.log('🔍 Checking Chrome AI API support...');
            console.log('window.LanguageModel:', (window as any).LanguageModel);

            // Check if Chrome AI APIs are available
            // LanguageModel is available globally, others may be in different locations
            const hasProofreader = !!(window.chrome && (window.chrome as any).aiOriginTrial?.proofreader);
            const hasTranslator = !!(window.chrome && (window.chrome as any).translator); // Direct API in Chrome 138+
            const hasSummarizer = !!(window.chrome && (window.chrome as any).summarizer); // Direct API in Chrome 138+
            const hasLanguageModel = !!(window as any).LanguageModel; // Global API

            console.log('📊 API availability:');
            console.log('  - Proofreader:', hasProofreader);
            console.log('  - Translator:', hasTranslator);
            console.log('  - Summarizer:', hasSummarizer);
            console.log('  - Language Model:', hasLanguageModel);

            this.isSupported = hasProofreader || hasTranslator || hasSummarizer || hasLanguageModel;
            console.log('✅ Chrome AI APIs supported:', this.isSupported);

            this.initialized = true;
        } catch (error) {
            console.warn('❌ Chrome AI APIs not supported:', error);
            this.isSupported = false;
            this.initialized = true;
        }
    }

    /**
     * Wait for initialization to complete
     */
    private async waitForInit(): Promise<void> {
        while (!this.initialized) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Run prompt with session management (like the official sample)
     */
    private async runPrompt(prompt: string, params: any): Promise<string> {
        try {
            // Create a new AbortController for this request
            this.currentAbortController = new AbortController();

            // Always create a fresh session to avoid parameter conflicts
            this.resetSession();
            const LanguageModel = (window as any).LanguageModel;

            console.log('🔧 Creating new language model session...');
            this.session = await LanguageModel.create(params);

            // Check if cancelled before making the request
            if (this.currentAbortController && this.currentAbortController.signal.aborted) {
                console.log('🚫 Request was cancelled before execution');
                throw new Error('Request was cancelled');
            }

            console.log('📝 Executing prompt...');
            const result = await this.session.prompt(prompt);
            console.log('✅ Prompt executed successfully');

            return result;
        } catch (e) {
            console.error('💥 Prompt execution failed:', e);
            const error = e as Error;
            console.error('💥 Error details:', {
                message: error.message,
                stack: error.stack,
                promptLength: prompt.length,
                promptPreview: prompt.substring(0, 100)
            });

            // Reset session on error
            this.resetSession();
            throw e;
        }
    }

    /**
     * Reset session only (without cancelling AbortController)
     */
    private resetSession(): void {
        if (this.session) {
            this.session.destroy();
        }
        this.session = null;
    }

    /**
     * Reset session and cancel any ongoing request
     */
    private reset(): void {
        // Cancel any ongoing request
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }

        this.resetSession();
    }

    /**
     * Cancel any ongoing request
     */
    public cancel(): void {
        console.log('🛑 Cancelling current request...');
        this.reset();
    }

    /**
     * Check grammar and spelling of the provided text
     */
    async checkGrammar(text: string): Promise<AIResponse> {
        console.log('🔍 Starting grammar check for text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

        await this.waitForInit();

        if (!this.isSupported) {
            console.log('❌ Chrome AI APIs not supported');
            return {
                success: false,
                error: 'Chrome AI APIs are not supported in this browser. Please enable Chrome AI flags and restart Chrome.'
            };
        }

        try {
            // Use Chrome's Proofreader API
            const proofreader = (window.chrome as any).aiOriginTrial?.proofreader;
            if (proofreader) {
                console.log('✅ Using Chrome Proofreader API');
                const result = await proofreader.check(text);
                console.log('📝 Proofreader result:', result);

                return {
                    success: true,
                    data: {
                        correctedText: result.correctedText || text,
                        changes: result.changes || []
                    }
                };
            }

            // Fallback to language model if proofreader not available
            console.log('⚠️ Proofreader not available, using language model fallback');
            return await this.fallbackGrammarCheck(text);
        } catch (error) {
            console.error('💥 Grammar check failed:', error);
            const err = error as Error;
            console.error('💥 Error details:', {
                message: err.message,
                stack: err.stack,
                textLength: text.length,
                textPreview: text.substring(0, 50)
            });

            return {
                success: false,
                error: `Failed to check grammar: ${err.message}. Please try again.`
            };
        }
    }

    /**
     * Translate text between languages
     */
    async translateText(text: string, options: TranslationOptions = {}): Promise<AIResponse> {
        await this.waitForInit();

        if (!this.isSupported) {
            return {
                success: false,
                error: 'Chrome AI APIs are not supported in this browser. Please enable Chrome AI flags and restart Chrome.'
            };
        }

        try {
            // Try direct API first (Chrome 138+)
            const translator = (window.chrome as any).translator;
            if (translator) {
                console.log('✅ Using direct Translator API');
                const result = await translator.translate(text, {
                    sourceLanguage: options.sourceLanguage || 'auto',
                    targetLanguage: options.targetLanguage || 'en'
                });
                return {
                    success: true,
                    data: result.translatedText
                };
            }

            // Fallback to origin trial API
            const translatorOT = (window.chrome as any).aiOriginTrial?.translator;
            if (translatorOT) {
                console.log('✅ Using origin trial Translator API');
                const result = await translatorOT.translate(text, {
                    sourceLanguage: options.sourceLanguage || 'auto',
                    targetLanguage: options.targetLanguage || 'en'
                });
                return {
                    success: true,
                    data: result.translatedText
                };
            }

            // Fallback to language model
            return await this.fallbackTranslation(text, options);
        } catch (error) {
            console.error('Translation failed:', error);
            return {
                success: false,
                error: 'Failed to translate text. Please try again.'
            };
        }
    }

    /**
     * Summarize the provided text
     */
    async summarizeText(text: string, options: SummarizationOptions = {}): Promise<AIResponse> {
        await this.waitForInit();

        if (!this.isSupported) {
            return {
                success: false,
                error: 'Chrome AI APIs are not supported in this browser. Please enable Chrome AI flags and restart Chrome.'
            };
        }

        try {
            // Try direct API first (Chrome 138+)
            const summarizer = (window.chrome as any).summarizer;
            if (summarizer) {
                console.log('✅ Using direct Summarizer API');
                const result = await summarizer.summarize(text, {
                    maxLength: options.maxLength || 100,
                    style: options.style || 'bullet'
                });
                return {
                    success: true,
                    data: result.summary
                };
            }

            // Fallback to origin trial API
            const summarizerOT = (window.chrome as any).aiOriginTrial?.summarizer;
            if (summarizerOT) {
                console.log('✅ Using origin trial Summarizer API');
                const result = await summarizerOT.summarize(text, {
                    maxLength: options.maxLength || 100,
                    style: options.style || 'bullet'
                });
                return {
                    success: true,
                    data: result.summary
                };
            }

            // Fallback to language model
            return await this.fallbackSummarization(text, options);
        } catch (error) {
            console.error('Summarization failed:', error);
            return {
                success: false,
                error: 'Failed to summarize text. Please try again.'
            };
        }
    }

    /**
     * Ask a question about the provided text
     */
    async askQuestion(text: string, question: string): Promise<AIResponse> {
        await this.waitForInit();

        if (!this.isSupported) {
            return {
                success: false,
                error: 'Chrome AI APIs are not supported in this browser. Please enable Chrome AI flags and restart Chrome.'
            };
        }

        try {
            // Use global LanguageModel API (like the official sample)
            const LanguageModel = (window as any).LanguageModel;
            if (LanguageModel) {
                console.log('✅ Using global LanguageModel API');

                const params = {
                    initialPrompts: [
                        { role: 'system', content: 'You are a helpful assistant. Answer questions about the provided text accurately and concisely.' }
                    ],
                    temperature: 0.7,
                    topK: 3
                };

                const prompt = `Text: "${text}"\n\nQuestion: ${question}\n\nAnswer:`;
                const answer = await this.runPrompt(prompt, params);

                return {
                    success: true,
                    data: answer
                };
            }

            return {
                success: false,
                error: 'Language model not available'
            };
        } catch (error) {
            console.error('Question answering failed:', error);
            return {
                success: false,
                error: 'Failed to answer question. Please try again.'
            };
        }
    }

    /**
     * Fallback grammar check using language model
     */
    private async fallbackGrammarCheck(text: string): Promise<AIResponse> {
        try {
            const LanguageModel = (window as any).LanguageModel;
            if (!LanguageModel) {
                return { success: false, error: 'Language model not available' };
            }

            const params = {
                initialPrompts: [
                    { role: 'system', content: 'You are a grammar and spelling checker. You must return a valid JSON object with "correctedText" and "changes" array. The correctedText should be the grammatically corrected version of the input text. The changes array should list specific changes made, like "Changed \'word1\' to \'word2\'" or "Added comma after \'word\'". Always return valid JSON only.' }
                ],
                temperature: 0.1, // Lower temperature for more consistent output
                topK: 2
            };

            const prompt = `Correct the grammar and spelling in this text: "${text}"

Return ONLY a valid JSON object in this exact format:
{"correctedText": "corrected version here", "changes": ["specific change 1", "specific change 2"]}

Do not include any explanations, markdown, or other text. Only return the JSON object.`;

            const result = await this.runPrompt(prompt, params);
            console.log('🔍 Raw AI response:', result);

            // Enhanced JSON parsing with multiple fallback strategies
            const parsedResult = this.parseGrammarResult(result, text);

            return {
                success: true,
                data: parsedResult
            };
        } catch (error) {
            console.error('💥 Grammar check error:', error);
            return { success: false, error: 'Grammar check failed' };
        }
    }

    /**
     * Robust JSON parsing for grammar results with multiple fallback strategies
     */
    private parseGrammarResult(rawResult: string, originalText: string): GrammarResult {
        console.log('🔍 Parsing grammar result:', rawResult);

        // Strategy 1: Direct JSON parsing
        try {
            const parsed = JSON.parse(rawResult.trim());
            if (parsed.correctedText && Array.isArray(parsed.changes)) {
                console.log('✅ Direct JSON parsing successful');
                return parsed;
            }
        } catch (e) {
            console.log('❌ Direct JSON parsing failed:', e);
        }

        // Strategy 2: Extract JSON from markdown code blocks
        try {
            let cleanResult = rawResult.trim();

            // Remove markdown code blocks
            if (cleanResult.includes('```json')) {
                const jsonMatch = cleanResult.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    cleanResult = jsonMatch[1].trim();
                }
            } else if (cleanResult.includes('```')) {
                const codeMatch = cleanResult.match(/```\s*([\s\S]*?)\s*```/);
                if (codeMatch) {
                    cleanResult = codeMatch[1].trim();
                }
            }

            // Try to find JSON object in the text
            const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.correctedText && Array.isArray(parsed.changes)) {
                    console.log('✅ JSON extraction from markdown successful');
                    return parsed;
                }
            }
        } catch (e) {
            console.log('❌ JSON extraction failed:', e);
        }

        // Strategy 3: Extract corrected text and generate changes
        try {
            // Look for patterns like "correctedText": "..." or similar
            const correctedMatch = rawResult.match(/["']correctedText["']\s*:\s*["']([^"']*)["']/i);
            const changesMatch = rawResult.match(/["']changes["']\s*:\s*\[([^\]]*)\]/i);

            if (correctedMatch) {
                const correctedText = correctedMatch[1];
                let changes: string[] = [];

                if (changesMatch) {
                    // Try to parse the changes array
                    try {
                        const changesStr = '[' + changesMatch[1] + ']';
                        changes = JSON.parse(changesStr);
                    } catch (e) {
                        // If parsing fails, generate basic changes
                        changes = this.generateBasicChanges(originalText, correctedText);
                    }
                } else {
                    changes = this.generateBasicChanges(originalText, correctedText);
                }

                console.log('✅ Pattern extraction successful');
                return { correctedText, changes };
            }
        } catch (e) {
            console.log('❌ Pattern extraction failed:', e);
        }

        // Strategy 4: Use the raw result as corrected text and generate changes
        console.log('⚠️ All parsing strategies failed, using fallback');
        const cleanText = rawResult.replace(/```json|```|{|}|\[|\]/g, '').trim();
        return {
            correctedText: cleanText || originalText,
            changes: this.generateBasicChanges(originalText, cleanText || originalText)
        };
    }

    /**
     * Generate basic changes by comparing original and corrected text
     */
    private generateBasicChanges(original: string, corrected: string): string[] {
        const changes: string[] = [];

        if (original !== corrected) {
            // Simple word-level comparison
            const originalWords = original.split(/\s+/);
            const correctedWords = corrected.split(/\s+/);

            for (let i = 0; i < Math.min(originalWords.length, correctedWords.length); i++) {
                if (originalWords[i] !== correctedWords[i]) {
                    changes.push(`Changed '${originalWords[i]}' to '${correctedWords[i]}'`);
                }
            }

            if (originalWords.length !== correctedWords.length) {
                changes.push(`Text length changed from ${originalWords.length} to ${correctedWords.length} words`);
            }
        }

        return changes.length > 0 ? changes : ['No changes detected'];
    }

    /**
     * Fallback translation using language model
     */
    private async fallbackTranslation(text: string, options: TranslationOptions): Promise<AIResponse> {
        try {
            const LanguageModel = (window as any).LanguageModel;
            if (!LanguageModel) {
                return { success: false, error: 'Language model not available' };
            }
            const targetLang = options.targetLanguage || 'English';

            const params = {
                initialPrompts: [
                    { role: 'system', content: `You are a professional translator. Translate the provided text to ${targetLang}. Return ONLY the translated text, no explanations or additional commentary.` }
                ],
                temperature: 0.3,
                topK: 3
            };

            const translatedText = await this.runPrompt(`Translate this text to ${targetLang}. Return ONLY the translated text: ${text}`, params);

            return {
                success: true,
                data: translatedText
            };
        } catch (error) {
            return { success: false, error: 'Translation failed' };
        }
    }

    /**
     * Fallback summarization using language model
     */
    private async fallbackSummarization(text: string, options: SummarizationOptions): Promise<AIResponse> {
        try {
            const LanguageModel = (window as any).LanguageModel;
            if (!LanguageModel) {
                return { success: false, error: 'Language model not available' };
            }

            const maxLength = options.maxLength || 100;
            const style = options.style || 'bullet';

            const params = {
                initialPrompts: [
                    { role: 'system', content: `You are a professional summarizer. Create a concise summary of the provided text in ${style} format, keeping it under ${maxLength} words.` }
                ],
                temperature: 0.3,
                topK: 3
            };

            const summary = await this.runPrompt(`Summarize this text in ${style} format (max ${maxLength} words): ${text}`, params);

            return {
                success: true,
                data: summary
            };
        } catch (error) {
            return { success: false, error: 'Summarization failed' };
        }
    }

    /**
     * Check if Chrome AI APIs are available
     */
    async isChromeAISupported(): Promise<boolean> {
        await this.waitForInit();
        return this.isSupported;
    }
}

// Export singleton instance
export const chromeAIService = new ChromeAIService();
