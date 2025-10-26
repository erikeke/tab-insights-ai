import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";
import { useLayoutStore } from "../stores/layoutStore";
import { useLanguageStore, SUPPORTED_LANGUAGES } from "../stores/languageStore";
import { useTranslationHandler } from "../handlers/translationHandler";
import { chromeAIService } from "../services/chromeAIService";
import { CloseIcon } from "./Icons";

interface OptionConfig {
  title: string;
  icon: string;
  onClick: (e?: React.FormEvent) => void | Promise<void>;
  shortcut: string;
  isSelected?: boolean;
  flag?: string;
}

const SecondOptionsRow = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // Track current page for pagination
  const rewriteOpen = useLayoutStore((state) => state.rewriteOpen);
  const frozenSelection = useLayoutStore((state) => state.frozenSelection);
  const typeOfAction = useLayoutStore((state) => state.typeOfAction);
  const viewState = useLayoutStore((state) => state.viewState);

  // Language store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const setSelectedLanguage = useLanguageStore((state) => state.setSelectedLanguage);

  // Translation handler
  const { handleTranslation } = useTranslationHandler();

  // Clear search term and reset page when rewriteOpen becomes false
  useEffect(() => {
    if (!rewriteOpen) {
      setSearchTerm("");
      setCurrentPage(0);
    }
  }, [rewriteOpen]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const getFlagEmoji = (code: string): string => {
    const flagMap: Record<string, string> = {
      en: "🇬🇧",
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      it: "🇮🇹",
      pt: "🇵🇹",
      ru: "🇷🇺",
      ja: "🇯🇵",
      ko: "🇰🇷",
      zh: "🇨🇳",
      ar: "🇸🇦",
      hi: "🇮🇳",
    };
    return flagMap[code] || "🌐";
  };

  const handleSubmit = async (e: React.FormEvent, title: string) => {
    e.preventDefault();
    if (!frozenSelection?.text) return;

    const prompt = `${title}: "${frozenSelection.text}"`;
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(""); // Clear previous response

    try {
      // Use the AI service directly instead of background script
      const result = await chromeAIService.askQuestion(frozenSelection.text, prompt);

      if (result.success && result.data) {
        setResponse(result.data as string);
      } else {
        setResponse(`Error: ${result.error || "Failed to process request"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typeOfAction === "Ask") {
      if (!frozenSelection?.text || !searchTerm.trim()) return;

      // Set loading state in layout store
      useLayoutStore.setState({
        isLoading: true,
        viewState: "loading",
      });

      try {
        // Use the AI service directly for asking questions
        const result = await chromeAIService.askQuestion(frozenSelection.text, searchTerm);

        if (result.success && result.data) {
          // Close the second row and show result
          useLayoutStore.setState({
            rewriteOpen: false,
            secondRowOpen: false,
            aiResponse: result.data as string,
            viewState: "result",
            isLoading: false,
          });
        } else {
          useLayoutStore.setState({
            error: result.error || "Failed to process request",
            viewState: "buttons",
            isLoading: false,
            secondRowOpen: false,
          });
        }
      } catch (error) {
        console.error("Error:", error);
        useLayoutStore.setState({
          error: error instanceof Error ? error.message : "Unknown error",
          viewState: "buttons",
          isLoading: false,
          secondRowOpen: false,
        });
      }
    }
    // For Translate action, the form submission just filters the options (no processing needed)
  };

  const rewriteOptions: OptionConfig[] = [
    {
      title: "Grammar",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Fix grammar"),
      shortcut: "S",
    },
    {
      title: "Shorten",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Make shorter"),
      shortcut: "S",
    },
    {
      title: "Longer",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Make longer"),
      shortcut: "L",
    },
    {
      title: "Bullet points",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Bullet points"),
      shortcut: "B",
    },
    {
      title: "Formal",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Formal"),
      shortcut: "F",
    },
    {
      title: "Casual",
      icon: "copy",
      onClick: (e?: React.FormEvent) => handleSubmit(e!, "Casual"),
      shortcut: "C",
    },
  ];

  const handleLanguageSelect = (language: (typeof SUPPORTED_LANGUAGES)[0]) => {
    setSelectedLanguage(language);
    setSearchTerm(""); // Clear search term when selecting language
    setCurrentPage(0); // Reset to first page
    // Close the second row after selecting language
    useLayoutStore.setState({ rewriteOpen: false, secondRowOpen: false });
  };

  const handleCloseSecondRow = () => {
    setSearchTerm(""); // Clear search term when closing
    useLayoutStore.setState({ rewriteOpen: false, secondRowOpen: false });
  };

  const translateOptions: OptionConfig[] = SUPPORTED_LANGUAGES.map((language) => ({
    title: language.code.toUpperCase(),
    icon: "translate",
    onClick: () => handleLanguageSelect(language),
    shortcut: language.code.toUpperCase(),
    isSelected: language.code === selectedLanguage.code,
    flag: getFlagEmoji(language.code),
  }));

  const getActiveOptions = (): OptionConfig[] => {
    switch (typeOfAction) {
      case "Rewrite":
        return rewriteOptions;
      case "Translate":
        return translateOptions;
      default:
        return rewriteOptions;
    }
  };

  const activeOptions = getActiveOptions();
  const filteredOptions = activeOptions.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    const titleLower = option.title.toLowerCase();

    // For translate options, also search by full language name
    if (typeOfAction === "Translate" && option.flag) {
      const language = SUPPORTED_LANGUAGES.find((lang) => lang.code.toLowerCase() === titleLower);
      const languageName = language?.name.toLowerCase() || "";
      return titleLower.includes(searchLower) || languageName.includes(searchLower);
    }

    return titleLower.includes(searchLower);
  });

  // Pagination logic for translate options
  const FLAGS_PER_PAGE = 7;
  const getPaginatedOptions = () => {
    if (typeOfAction !== "Translate") {
      return { options: filteredOptions, hasMore: false, totalPages: 0, currentPage: 0 };
    }

    const startIndex = currentPage * FLAGS_PER_PAGE;
    const endIndex = startIndex + FLAGS_PER_PAGE;
    const paginatedOptions = filteredOptions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredOptions.length / FLAGS_PER_PAGE);
    const hasMore = filteredOptions.length > endIndex;

    return {
      options: paginatedOptions,
      hasMore,
      totalPages,
      currentPage,
    };
  };

  const paginationData = getPaginatedOptions();
  const displayOptions = paginationData.options;
  const showPaginationControls = typeOfAction === "Translate" && paginationData.totalPages > 1;

  const getPlaceholderText = () => {
    switch (typeOfAction) {
      case "Rewrite":
        return "Filter options";
      case "Translate":
        return "Search language";
      case "Summarize":
        return "Summarize options";
      case "Ask":
        return "Ask a question";
      default:
        return "Search options";
    }
  };

  return (
    <AnimatePresence>
      {rewriteOpen &&
        (typeOfAction === "Translate" || typeOfAction === "Ask") &&
        viewState !== "loading" && (
          <motion.div
            layout
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="outer-container"
            style={{ padding: "6px" }}
          >
            <div
              style={{
                padding: "12px 12px",
                background: "#F4F5F6",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <form onSubmit={handleFormSubmit}>
                <div style={{ position: "relative" }}>
                  <input
                    autoFocus
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={getPlaceholderText()}
                    style={{
                      flex: 1,
                      background: "white",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#1C1F2E",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      outline: "none",
                      border: "1px solid #E4E7E9",
                      width: "100%",
                      paddingRight: "60px", // Make room for both buttons
                    }}
                  />
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={handleCloseSecondRow}
                    style={{
                      position: "absolute",
                      right: "32px",
                      top: "6px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#828B9A",
                      transition: "background-color 0.2s",
                      width: "20px",
                      height: "20px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F4F5F6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <CloseIcon size="10px" />
                  </button>
                  {/* Submit button */}
                  <button
                    type="submit"
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "6px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#828B9A",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F4F5F6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    ↵
                  </button>
                </div>
              </form>
              {typeOfAction === "Translate" && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {displayOptions.length > 0 ? (
                    <>
                      {displayOptions.map((option, index) => (
                        <SecondActionButton
                          key={index}
                          {...option}
                          lastItem={index === displayOptions.length - 1}
                        />
                      ))}
                      {showPaginationControls && (
                        <>
                          {/* Show "More" button if there are more pages */}
                          {paginationData.hasMore && (
                            <SecondActionButton
                              title={`+${filteredOptions.length - paginationData.options.length}`}
                              icon="translate"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              shortcut=""
                            />
                          )}
                          {/* Show "Back" button if not on first page */}
                          {currentPage > 0 && (
                            <SecondActionButton
                              title="←"
                              icon="translate"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              shortcut=""
                              isSelected={false}
                            />
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "24px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#828B9A",
                          opacity: 0.675,
                        }}
                      >
                        No options found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );
};

export default SecondOptionsRow;

const SecondActionButton = ({
  title,
  icon,
  onClick,
  shortcut,
  lastItem,
  isSelected = false,
  flag,
}: OptionConfig & {
  lastItem?: boolean;
  isSelected?: boolean;
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: isSelected ? "#d1d5db" : "#e0e2e4" }}
      whileTap={{ backgroundColor: isSelected ? "#9ca3af" : "#d6d8da" }}
      transition={{ duration: 0.1 }}
      style={{
        cursor: "pointer",
        padding: "3px 6px",
        background: isSelected ? "#3B82F6" : "#E9ECEE",
        borderRadius: "6px",
        border: isSelected ? "1px solid #2563EB" : "1px solid #E4E7E9",
        maxHeight: "22px",
        minHeight: "22px",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {flag && <span style={{ fontSize: "12px" }}>{flag}</span>}
      <p
        style={{
          lineHeight: "1.2",
          userSelect: "none",
          fontSize: "11px",
          fontWeight: "500",
          color: isSelected ? "#FFFFFF" : "#828B9A",
        }}
      >
        {title}
      </p>
    </motion.button>
  );
};
