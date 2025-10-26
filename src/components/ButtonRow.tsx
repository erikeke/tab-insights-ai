/**
 * ButtonRow Component - Main button container using modular architecture
 */

import React from "react";
import { motion } from "motion/react";
import { useLayoutStore } from "../stores/layoutStore";
import { useLanguageStore } from "../stores/languageStore";
import { useAIActions } from "../hooks/useAIActions";
import { ActionButton } from "./ActionButton";
import { BUTTON_CONFIGS } from "../config/buttonConfig";

interface ButtonRowProps {
  onClose: () => void;
}

const ButtonRow: React.FC<ButtonRowProps> = ({ onClose }) => {
  const rewriteOpen = useLayoutStore((state) => state.rewriteOpen);
  const secondRowOpen = useLayoutStore((state) => state.secondRowOpen);
  const selectedText = useLayoutStore((state) => state.selectedText);
  const resultOpen = useLayoutStore((state) => state.resultOpen);
  const isLoading = useLayoutStore((state) => state.isLoading);
  const frozenSelection = useLayoutStore((state) => state.frozenSelection);
  const wordCount = useLayoutStore((state) => state.wordCount);
  const viewState = useLayoutStore((state) => state.viewState);
  const setRewriteOpen = useLayoutStore((state) => state.setRewriteOpen);
  const setSecondRowOpen = useLayoutStore((state) => state.setSecondRowOpen);

  // Language store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  const { handleGrammarCheck, handleTranslation, handleSummarization, handleAskQuestion } =
    useAIActions();

  // Hide ButtonRow when not in buttons state
  if (viewState !== "buttons") {
    return null;
  }

  const handleAction = (actionType: string) => {
    const newFrozenSelection = frozenSelection || {
      text: selectedText,
      wordCount: wordCount,
    };
    // Only Translate needs the extra space for language flags (-108px)
    // Ask just needs the input field (-80px)
    const shouldOpenSecondRow = actionType === "Translate";
    useLayoutStore.setState({
      frozenSelection: newFrozenSelection,
      typeOfAction: actionType,
      rewriteOpen: true,
      secondRowOpen: shouldOpenSecondRow,
    });
  };

  const getButtonHandler = (actionType: string) => {
    switch (actionType) {
      case "Rewrite":
        return handleGrammarCheck;
      case "Translate":
        return () => handleTranslation(selectedLanguage.code);
      case "Summarize":
        return handleSummarization;
      case "Ask":
        return () => handleAction(actionType);
      default:
        return () => {};
    }
  };

  const getEditHandler = (actionType: string) => {
    switch (actionType) {
      case "Rewrite":
      case "Translate":
        return () => handleAction(actionType);
      default:
        return () => {};
    }
  };

  const handleDismiss = () => {
    if (secondRowOpen || rewriteOpen) {
      setSecondRowOpen(false);
      setRewriteOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 200 }}
      animate={{
        y: secondRowOpen ? -108 : rewriteOpen ? -80 : 0,
        scale: secondRowOpen || rewriteOpen ? 0.925 : 1,
        filter:
          secondRowOpen || rewriteOpen ? "brightness(0.95) blur(2px)" : "brightness(1) blur(0px)",
      }}
      exit={{ y: 200 }}
      onClick={handleDismiss}
      style={{
        position: "fixed",
        bottom: "16px",
        left: "calc(50% - 213px)",
        width: "426px",
        background: "#F4F5F6",
        boxShadow: "0 12px 40px 0 rgba(0,0,0,0.10), 0 12px 10px -4px rgba(0,0,0,0.20)",
        borderRadius: "0 0 16px 16px",
        zIndex: 999999999999998,
        display: "flex",
        transformOrigin: "bottom center",
        cursor: secondRowOpen || rewriteOpen ? "pointer" : "default",
      }}
    >
      {BUTTON_CONFIGS.map((buttonConfig, index) => (
        <ActionButton
          key={index}
          index={index}
          title={buttonConfig.title}
          icon={buttonConfig.icon}
          onClick={getButtonHandler(buttonConfig.actionType)}
          onEditClick={getEditHandler(buttonConfig.actionType)}
          shortcut={buttonConfig.shortcut}
          lastItem={index === BUTTON_CONFIGS.length - 1}
          edit={buttonConfig.edit}
          disabled={(!rewriteOpen && (!selectedText || selectedText.length === 0)) || isLoading}
          selectedLanguage={
            buttonConfig.actionType === "Translate" ? selectedLanguage.code : undefined
          }
        />
      ))}
    </motion.div>
  );
};

export default ButtonRow;
