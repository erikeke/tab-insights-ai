/**
 * ActionButton Component - Individual button for AI actions
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { GlitterIcon, TranslateIcon, SummarizeIcon, AskIcon, ThreeDotsIcon } from "./Icons";
import { Tooltip } from "./CommonUI";
import { useLayoutStore } from "../stores/layoutStore";

interface ActionButtonProps {
    index: number;
    title: string;
    icon: string;
    onClick: () => void;
    onEditClick: () => void;
    shortcut: string;
    lastItem?: boolean;
    disabled?: boolean;
    edit?: boolean;
    selectedLanguage?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    index,
    title,
    icon,
    onClick,
    onEditClick,
    shortcut,
    lastItem,
    disabled,
    edit,
    selectedLanguage
}) => {
    const [hoverEdit, setHoverEdit] = useState(false);
    const isLoading = useLayoutStore((state) => state.isLoading);

    const getFlagEmoji = (code: string): string => {
        const flagMap: Record<string, string> = {
            'en': '🇬🇧', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
            'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
            'ar': '🇸🇦', 'hi': '🇮🇳'
        };
        return flagMap[code] || '🌐';
    };

    const iconMap: { [key: string]: React.ReactNode } = {
        rewrite: <GlitterIcon />,
        translate: <TranslateIcon />,
        summarize: <SummarizeIcon />,
        ask: <AskIcon />,
    };

    const editIconMap: { [key: string]: React.ReactNode } = {
        rewrite: <ThreeDotsIcon />,
        translate: <p style={{ fontSize: "12px", fontWeight: "500", userSelect: "none" }}>
            {selectedLanguage ? getFlagEmoji(selectedLanguage) : '🇺🇸'}
        </p>,
        ask: <ThreeDotsIcon />,
    };

    const editClickMiddle = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setHoverEdit(false);
        onEditClick();
    };

    return (
        <motion.button
            onMouseDown={(e) => e.preventDefault()}
            whileHover={{ backgroundColor: hoverEdit ? "#F4F5F6" : "#ebedef" }}
            whileTap={{ backgroundColor: '#dfe1e3' }}
            transition={{ backgroundColor: { duration: 0.1 }, opacity: { duration: 0.16 } }}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    return;
                }
                onClick();
            }}
            style={{
                width: '100%',
                pointerEvents: disabled ? 'auto' : 'auto', // Always allow pointer events for edit button
                border: 'none',
                backgroundColor: '#F4F5F6',
                cursor: disabled ? 'not-allowed' : 'pointer',
                height: "64px",
                borderRight: lastItem ? 'none' : '1px solid #E4E7E9',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                color: disabled ? "#B6BBC4" : "#828B9A",
                position: 'relative',
                zIndex: 4 - index,
                borderRadius: index === 0 ? "0px 0px 0px 16px" : lastItem ? "0px 0px 16px 0px" : "0px",
                opacity: disabled ? 0.6 : 1,
            }}
        >
            <p style={{
                fontSize: '10px',
                userSelect: 'none',
                opacity: 0.675,
                color: "#828B9A",
                position: 'absolute',
                top: '4px',
                left: '8px'
            }}>{shortcut}</p>

            {edit && (
                <motion.div
                    onClick={editClickMiddle}
                    onMouseEnter={() => setHoverEdit(true)}
                    onMouseLeave={() => setHoverEdit(false)}
                    whileHover={{ backgroundColor: "#e0e2e4" }}
                    style={{
                        color: "#828B9A",
                        position: "absolute",
                        top: "4px",
                        right: "6px",
                        backgroundColor: "#e0e2e400",
                        borderRadius: "4px",
                        height: "22px",
                        width: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        pointerEvents: "auto" // Always allow clicking the edit button
                    }}
                >
                    {editIconMap[icon]}
                </motion.div>
            )}

            {isLoading ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #B6BBC4',
                        borderTop: '2px solid #828B9A',
                        borderRadius: '50%',
                        marginBottom: '4px'
                    }}
                />
            ) : (
                iconMap[icon]
            )}

            <p
                style={{
                    fontSize: '11px',
                    userSelect: 'none',
                    marginBottom: '4px',
                    color: disabled ? "#B6BBC4" : "#828B9A"
                }}
            >
                {title}
            </p>

            {hoverEdit && (
                <Tooltip
                    content={title === "Rewrite" ? "Edit" : title === "Ask" ? "Ask" : "Set"}
                    top={"-22px"}
                    right={"-2px"}
                />
            )}
        </motion.button>
    );
};
