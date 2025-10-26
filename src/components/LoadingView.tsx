import React from "react";
import { motion } from "motion/react";

interface LoadingViewProps {
  actionType: string;
  onCancel: () => void;
}

const LoadingView: React.FC<LoadingViewProps> = ({ actionType, onCancel }) => {
  return (
    <motion.div
      layout
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        color: "#828B9A",
        fontSize: "14px",
        padding: "12px",
        background: "#F4F5F6",
        borderRadius: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: "16px",
            height: "16px",
            border: "2px solid #B6BBC4",
            borderTop: "2px solid #828B9A",
            borderRadius: "50%",
          }}
        />
        <motion.span
          animate={{
            backgroundPosition: ["200% 0%", "0% 0%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeIn",
          }}
          style={{
            marginLeft: "8px",
            display: "inline-block",
            background:
              "linear-gradient(to right,rgb(70, 76, 87) 0%,rgb(191, 199, 207) 50%, rgb(70, 76, 87) 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Processing {actionType.toLowerCase()}...
        </motion.span>
      </div>
      <button
        onClick={onCancel}
        style={{
          background: "transparent",
          border: "1px solid #E4E7E9",
          borderRadius: "6px",
          padding: "4px 8px",
          fontSize: "12px",
          color: "#828B9A",
          cursor: "pointer",
          transition: "all 0.2s",
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
        Cancel
      </button>
    </motion.div>
  );
};

export default LoadingView;
