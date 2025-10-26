import React from "react";
import MainWrapper from "./components/MainWrapper";

interface AppProps {
  onClose: () => void;
  onSetCloseTrigger?: (fn: () => void) => void;
}

const App: React.FC<AppProps> = ({ onClose, onSetCloseTrigger }) => {
  return <MainWrapper onClose={onClose} onSetCloseTrigger={onSetCloseTrigger} />;
};

export default App;

if (module.hot) module.hot.accept();