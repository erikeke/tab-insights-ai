import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLayoutStore } from "../stores/layoutStore";
import { GrammarResult } from "../services/chromeAIService";
import LoadingView from "./LoadingView";
import GrammarResultView from "./GrammarResultView";
import ResultView from "./ResultView";

const MainContainer: React.FC = () => {
  const viewState = useLayoutStore((state) => state.viewState);
  const typeOfAction = useLayoutStore((state) => state.typeOfAction);
  const aiResponse = useLayoutStore((state) => state.aiResponse);
  const frozenSelection = useLayoutStore((state) => state.frozenSelection);
  const cancelOperation = useLayoutStore((state) => state.cancelOperation);
  const setViewState = useLayoutStore((state) => state.setViewState);

  const handleGoBack = () => {
    setViewState("buttons");
  };

  // Only show MainContainer when not in buttons state
  if (viewState === "buttons") {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ y: 200 }}
      animate={{ y: 0 }}
      exit={{ y: 200 }}
      style={{
        position: "fixed",
        bottom: "16px",
        left: "calc(50% - 213px)",
        width: "426px",
        background: "#F4F5F6",
        boxShadow: "0 12px 40px 0 rgba(0,0,0,0.10), 0 12px 10px -4px rgba(0,0,0,0.20)",
        borderRadius: "16px",
        zIndex: 999999999999998,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        {viewState === "loading" && (
          <motion.div
            key="loading"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="outer-container"
            style={{ padding: "6px" }}
          >
            <LoadingView actionType={typeOfAction} onCancel={cancelOperation} />
          </motion.div>
        )}

        {viewState === "result" && typeOfAction === "Grammar" && frozenSelection?.text && (
          <motion.div
            key="grammar-result"
            layout
            initial={{ y: 240 }}
            animate={{ y: 0 }}
            exit={{ y: 240 }}
            className="outer-container"
            style={{ padding: "6px" }}
          >
            <GrammarResultView
              originalText={frozenSelection.text}
              result={aiResponse as GrammarResult}
              onGoBack={handleGoBack}
            />
          </motion.div>
        )}

        {viewState === "result" && typeOfAction !== "Grammar" && (
          <motion.div
            key="generic-result"
            layout
            initial={{ y: 240 }}
            animate={{ y: 0 }}
            exit={{ y: 240 }}
            className="outer-container"
            style={{ padding: "6px" }}
          >
            <ResultView
              typeOfAction={typeOfAction}
              result={aiResponse as string}
              onGoBack={handleGoBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MainContainer;
