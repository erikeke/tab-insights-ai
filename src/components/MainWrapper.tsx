import React, { useState, useEffect, useCallback } from "react";
import SelectionContainer from "./SelectionContainer";
import MainContainer from "./MainContainer";
import SecondOptionsRow from "./SecondOptionsRow";
import ButtonRow from "./ButtonRow";
import { AnimatePresence, motion } from "motion/react";
import { useLayoutStore } from "../stores/layoutStore";

interface MainWrapperProps {
  onClose: () => void;
  onSetCloseTrigger?: (fn: () => void) => void;
}

const MainWrapper: React.FC<MainWrapperProps> = ({ onClose, onSetCloseTrigger }) => {
  const [isExiting, setIsExiting] = useState(false);
  const closeOverlay = useLayoutStore((state) => state.closeOverlay);
  const cancelOperation = useLayoutStore((state) => state.cancelOperation);
  const viewState = useLayoutStore((state) => state.viewState);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  }, [onClose]);

  const handleOverlayClick = () => {
    if (viewState === "loading") {
      // Cancel the operation if we're loading
      cancelOperation();
    } else if (viewState === "result") {
      // Go back if we're viewing results
      closeOverlay();
    }
  };

  // Set up the close trigger for external calls
  useEffect(() => {
    if (onSetCloseTrigger) {
      onSetCloseTrigger(() => {
        handleClose();
      });
    }
  }, [onSetCloseTrigger, handleClose]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence>
            {(viewState === "loading" || viewState === "result") && (
              <motion.div
                initial={{ clipPath: "circle(0% at 50% 92%)", opacity: 0 }}
                animate={{ clipPath: "circle(150% at 50% 100%)", opacity: 1 }}
                exit={{ clipPath: "circle(0% at 50% 92%)", opacity: 0 }}
                transition={{ duration: 0.36, ease: "easeInOut" }}
                onClick={handleOverlayClick}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(2px)",
                  zIndex: 999999999999999,
                  cursor: "pointer",
                }}
              ></motion.div>
            )}
          </AnimatePresence>
          {viewState === "buttons" && <SelectionContainer onClose={handleClose} />}
          <ButtonRow onClose={handleClose} />
          <MainContainer />
          <SecondOptionsRow />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainWrapper;
