import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Streamdown } from "streamdown";
import { CloseIcon, CopyIcon } from "./Icons";

interface ResultViewProps {
  typeOfAction: string;
  result: string;
  onGoBack: () => void;
}

// Helper function to get natural label for each action type
const getResultLabel = (actionType: string): string => {
  const labels: Record<string, string> = {
    Grammar: "Grammar Check",
    Rewrite: "Grammar Check",
    Translate: "Translation",
    Summarize: "Summary",
    Ask: "Answer",
  };
  return labels[actionType] || "Result";
};

const ResultView: React.FC<ResultViewProps> = ({ typeOfAction, result, onGoBack }) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering the container click
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div style={{ position: "relative", display: "block", width: "100%" }}>
      {/* Animated glow effect - single pulse */}
      <motion.div
        initial={{ opacity: 1, scale: 1.2, rotate: 0 }}
        animate={{
          opacity: 0,
          scale: 1,
          rotate: 270,
        }}
        transition={{
          duration: 3.2,
          ease: "easeOut",
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px",
          background:
            "conic-gradient(from 0deg at 50% 50%,rgb(64, 131, 255),rgb(51, 180, 255), #3357FF,rgb(241, 162, 15),rgb(51, 252, 255))",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <motion.div
        layout
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "12px",
          background: "#F4F5F6",
          borderRadius: "16px",
        }}
      >
        {/* Header with Go Back button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#4C5360",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {getResultLabel(typeOfAction)}
          </div>
          <button
            onClick={onGoBack}
            style={{
              background: "transparent",
              border: "1px solid #E4E7E9",
              borderRadius: "6px",
              padding: "6px",
              color: "#5A6474",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "26px",
              height: "26px",
              minWidth: "26px",
              minHeight: "26px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F4F5F6";
              e.currentTarget.style.color = "#2D3748";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#828B9A";
            }}
          >
            <CloseIcon size="12px" />
          </button>
        </div>

        {/* Result Content */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#2D3748",
            padding: "8px",
            background: "#F0F9FF",
            borderRadius: "6px",
            border: "1px solid #BAE6FD",
            maxHeight: "300px",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            minHeight: "48px",
          }}
        >
          <Streamdown parseIncompleteMarkdown={true} className="streamdown-content">
            {result}
          </Streamdown>

          {/* Copy Button */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.08 }}
                onClick={handleCopy}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #E4E7E9",
                  borderRadius: "6px",
                  padding: "6px",
                  color: "#828B9A",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  minWidth: "28px",
                  minHeight: "28px",
                  backdropFilter: "blur(4px)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#2D3748";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.color = "#828B9A";
                }}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="checkmark"
                      initial={{ scale: 0.8, filter: "blur(2px)" }}
                      animate={{ scale: 1, filter: "blur(0px)" }}
                      exit={{ scale: 0.8, filter: "blur(2px)" }}
                      transition={{ duration: 0.04 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy-icon"
                      initial={{ scale: 0.8, filter: "blur(2px)" }}
                      animate={{ scale: 1, filter: "blur(0px)" }}
                      exit={{ scale: 0.8, filter: "blur(2px)" }}
                      transition={{ duration: 0.04 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <CopyIcon size="12px" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultView;
