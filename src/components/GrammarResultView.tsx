import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GrammarResult } from "../services/chromeAIService";
import { CloseIcon, CopyIcon } from "./Icons";

interface GrammarResultViewProps {
  originalText: string;
  result: GrammarResult;
  onGoBack: () => void;
}

const GrammarResultView: React.FC<GrammarResultViewProps> = ({
  originalText,
  result,
  onGoBack,
}) => {
  console.log("🔍 GrammarResultView received result:", result);
  console.log("🔍 GrammarResultView correctedText:", result.correctedText);

  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <motion.div
      layout
      style={{
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
          Grammar Result
        </div>
        <button
          onClick={onGoBack}
          style={{
            background: "transparent",
            border: "1px solid #E4E7E9",
            borderRadius: "6px",
            padding: "6px",
            color: "#828B9A",
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

      {/* Original Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#828B9A",
            fontWeight: "500",
          }}
        >
          Original:
        </div>
        <div
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#6B7280",
            padding: "8px",
            background: "#F9FAFB",
            borderRadius: "6px",
            border: "1px solid #E5E7EB",
            maxHeight: "150px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {originalText}
        </div>
      </div>

      {/* Corrected Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#828B9A",
            fontWeight: "500",
          }}
        >
          Corrected:
        </div>
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
            maxHeight: "150px",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
          }}
        >
          {result.correctedText}

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
      </div>

      {/* Changes Made */}
      {result.changes && result.changes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#828B9A",
              fontWeight: "500",
            }}
          >
            Changes made:
          </div>
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.4",
              color: "#059669",
              padding: "6px",
              background: "#ECFDF5",
              borderRadius: "6px",
              border: "1px solid #A7F3D0",
            }}
          >
            {result.changes.map((change, index) => (
              <div
                key={index}
                style={{ marginBottom: index < result.changes.length - 1 ? "4px" : "0" }}
              >
                • {change}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GrammarResultView;
