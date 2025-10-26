declare namespace chrome {
  export namespace aiOriginTrial {
    // Language Model API
    export interface LanguageModel {
      create(params: ModelParams): Promise<ModelInstance>;
      capabilities(): Promise<ModelCapabilities>;
    }

    export interface ModelParams {
      systemPrompt?: string;
      temperature?: number;
      topK?: number;
    }

    export interface ModelCapabilities {
      available: 'readily' | string;
      defaultTemperature: number;
      maxTemperature: number;
      defaultTopK: number;
      maxTopK: number;
    }

    export interface ModelInstance {
      prompt(text: string): Promise<string>;
      destroy(): void;
    }

    // Proofreader API
    export interface Proofreader {
      check(text: string): Promise<ProofreaderResult>;
    }

    export interface ProofreaderResult {
      correctedText: string;
      suggestions?: ProofreaderSuggestion[];
    }

    export interface ProofreaderSuggestion {
      originalText: string;
      suggestedText: string;
      confidence: number;
    }

    // Translator API
    export interface Translator {
      translate(text: string, options: TranslationOptions): Promise<TranslationResult>;
    }

    export interface TranslationOptions {
      sourceLanguage?: string;
      targetLanguage?: string;
    }

    export interface TranslationResult {
      translatedText: string;
      detectedLanguage?: string;
    }

    // Summarizer API
    export interface Summarizer {
      summarize(text: string, options: SummarizationOptions): Promise<SummarizationResult>;
    }

    export interface SummarizationOptions {
      maxLength?: number;
      style?: 'bullet' | 'paragraph' | 'brief';
    }

    export interface SummarizationResult {
      summary: string;
      originalLength: number;
      summaryLength: number;
    }

    // Exported APIs
    export const languageModel: LanguageModel;
    export const proofreader: Proofreader;
    export const translator: Translator;
    export const summarizer: Summarizer;
  }
}
