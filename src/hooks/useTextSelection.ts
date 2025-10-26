import { useEffect } from 'react';
import { useLayoutStore } from '../stores/layoutStore';

interface UseTextSelectionReturn {
  selectedText: string;
  wordCount: number;
}

export const useTextSelection = (): UseTextSelectionReturn => {
  const setSelectedText = useLayoutStore(state => state.setSelectedText);
  const setWordCount = useLayoutStore(state => state.setWordCount);

  // Create Intl.Segmenter for word counting
  const segmenter = new Intl.Segmenter('en', { granularity: 'word' });

  const countWords = (text: string): number => {
    const segments = segmenter.segment(text);
    let count = 0;
    for (const segment of segments) {
      if (segment.isWordLike) {
        count++;
      }
    }
    return count;
  };

  useEffect(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) {
      setSelectedText(text);
      setWordCount(countWords(text));
    } else {
      setSelectedText(null);
      setWordCount(0);
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text) {
        setSelectedText(text);
        setWordCount(countWords(text));
      } else {
        setSelectedText(null);
        setWordCount(0);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [setSelectedText, setWordCount]);

  const selectedText = useLayoutStore(state => state.selectedText) ?? "";
  const wordCount = useLayoutStore(state => state.wordCount) ?? 0;

  return { selectedText, wordCount };
}; 