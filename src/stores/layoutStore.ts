import { create } from 'zustand'
import { GrammarResult, chromeAIService } from '../services/chromeAIService'

type ViewState = 'buttons' | 'loading' | 'result';

interface LayoutState {
  rewriteOpen: boolean
  setRewriteOpen: (open: boolean) => void
  toggleRewrite: () => void
  secondRowOpen: boolean
  setSecondRowOpen: (open: boolean) => void
  selectedText: string | null
  setSelectedText: (text: string | null) => void
  wordCount: number
  setWordCount: (count: number) => void
  frozenSelection?: FrozenSelection
  typeOfAction: string
  setTypeOfAction: (type: string) => void
  closeOverlay: () => void
  resultOpen: boolean
  setResultOpen: (open: boolean) => void
  aiResponse: string | GrammarResult | null
  setAIResponse: (response: string | GrammarResult | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  viewState: ViewState
  setViewState: (state: ViewState) => void
  cancelOperation: () => void
}

interface FrozenSelection {
  text: string | null;
  wordCount: number;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  rewriteOpen: false,
  setRewriteOpen: (open) => set({ rewriteOpen: open }),
  secondRowOpen: false,
  setSecondRowOpen: (open) => set({ secondRowOpen: open }),
  resultOpen: false,
  setResultOpen: (open) => set({ resultOpen: open }),
  toggleRewrite: () => set((state) => ({ rewriteOpen: !state.rewriteOpen })),
  selectedText: null,
  setSelectedText: (text) => set({ selectedText: text }),
  wordCount: 0,
  setWordCount: (count) => set({ wordCount: count }),
  typeOfAction: '',
  setTypeOfAction: (type) => set({ typeOfAction: type }),
  aiResponse: null,
  setAIResponse: (response) => set({ aiResponse: response }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
  viewState: 'buttons',
  setViewState: (state) => set({ viewState: state }),
  cancelOperation: () => {
    // Cancel any ongoing AI requests
    chromeAIService.cancel();

    set((state) => ({
      viewState: 'buttons',
      isLoading: false,
      aiResponse: null,
      error: null,
      rewriteOpen: false,
      secondRowOpen: false,
      resultOpen: false
    }));
  },
  closeOverlay: () => set({
    rewriteOpen: false,
    secondRowOpen: false,
    resultOpen: false,
    frozenSelection: undefined,
    aiResponse: null,
    error: null,
    isLoading: false,
    viewState: 'buttons'
  }),
}))