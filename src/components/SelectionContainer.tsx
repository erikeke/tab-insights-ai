import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClickIcon, CloseIcon } from "./Icons";
import { useLayoutStore } from "../stores/layoutStore";
import { useTextSelection } from "../hooks/useTextSelection";
import ButtonRow from "./ButtonRow";

const SelectionContainer = ({ onClose }: { onClose: () => void }) => {
  const { selectedText: liveSelectedText, wordCount: liveWordCount } = useTextSelection();
  const rewriteOpen = useLayoutStore((state) => state.rewriteOpen);
  const secondRowOpen = useLayoutStore((state) => state.secondRowOpen);
  const frozenSelection = useLayoutStore((state) => state.frozenSelection);
  const selectedText =
    rewriteOpen && frozenSelection?.text ? frozenSelection.text : liveSelectedText;
  const wordCount =
    rewriteOpen && frozenSelection?.wordCount ? frozenSelection.wordCount : liveWordCount;
  const resultOpen = useLayoutStore((state) => state.resultOpen);
  const setRewriteOpen = useLayoutStore((state) => state.setRewriteOpen);
  const setSecondRowOpen = useLayoutStore((state) => state.setSecondRowOpen);

  const handleDismiss = () => {
    if (secondRowOpen || rewriteOpen) {
      setSecondRowOpen(false);
      setRewriteOpen(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ y: 240 }}
      animate={{
        y: secondRowOpen ? -108 : rewriteOpen ? -80 : 0,
        scale: secondRowOpen || rewriteOpen ? 0.925 : 1,
        filter:
          secondRowOpen || rewriteOpen ? "brightness(0.95) blur(2px)" : "brightness(1) blur(0px)",
      }}
      exit={{ y: 240 }}
      onClick={handleDismiss}
      className="outer-container"
      style={{
        padding: "6px 6px 42px",
        transformOrigin: "bottom center",
        cursor: secondRowOpen || rewriteOpen ? "pointer" : "default",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          opacity: 0.6,
          transition: "opacity 0.12s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "26px",
          height: "24px",
          minWidth: "26px",
          minHeight: "24px",
          zIndex: 10,
          padding: "4px 8px 4px 4px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.6";
        }}
      >
        <CloseIcon size="14px" />
      </button>

      <motion.div className="selection-inner">
        <motion.div layout="position" className="selection-info">
          <motion.p layout="position" className="selection-label">
            Selected text:
          </motion.p>
          <motion.div className="selection-count">
            <motion.p className="selection-count-text">{wordCount} {wordCount === 1 ? 'word' : 'words'}</motion.p>
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {selectedText ? (
            <motion.p layout="position" className="selection-text">
              {selectedText}
            </motion.p>
          ) : (
            <motion.p
              layout="position"
              className="selection-text-empty"
              whileHover={{ filter: "brightness(1.1)" }}
            >
              Select any text on the page to get started
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SelectionContainer;
