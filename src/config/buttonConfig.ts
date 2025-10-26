/**
 * Button Configuration - Defines button properties and behaviors
 */

export interface ButtonConfig {
    title: string;
    icon: string;
    shortcut: string;
    edit: boolean;
    actionType: string;
}

export const BUTTON_CONFIGS: ButtonConfig[] = [
    {
        title: "Grammar",
        icon: "rewrite",
        shortcut: "R",
        edit: false,
        actionType: "Rewrite"
    },
    {
        title: "Translate",
        icon: "translate",
        shortcut: "T",
        edit: true,
        actionType: "Translate"
    },
    {
        title: "Summarize",
        icon: "summarize",
        shortcut: "S",
        edit: false,
        actionType: "Summarize"
    },
    {
        title: "Ask",
        icon: "ask",
        shortcut: "A",
        edit: false,
        actionType: "Ask"
    }
];
