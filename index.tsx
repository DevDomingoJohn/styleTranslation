/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { ComponentDispatch, DraftStore, DraftType, Menu, SelectedChannelStore, Toasts } from "@webpack/common";

const getDraft = (channelId: string) => DraftStore.getDraft(channelId, DraftType.ChannelMessage);

async function fetchModelResponse(userInput: string, prompt: string, apiKey: string): Promise<string | null> {
    try {
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-thinking-exp-1219:free",
                    messages: [
                        {
                            role: "user",
                            content:
                                `${userInput} ${prompt}`,
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const generatedtext = result.choices[0].message.content;
        return generatedtext;
    } catch (error) {
        console.error("Error", error);
        return null;
    }
}

const enum messageStyle {
    Enhanced,
    Godlike,
    EarlyModern,
    Custom,
}

const settings = definePluginSettings({
    modelApiKey: {
        type: OptionType.STRING,
        description: "Required Openrouter Api Key. Get free apikey here: https://openrouter.ai/",
        default: ""
    },
    customTranslationPrompt: {
        type: OptionType.STRING,
        description: "You can add your own custom prompt here.",
        default: ""
    }
});

function getPrompt(style: messageStyle): string {
    switch (style) {
        case messageStyle.Enhanced: return "Enhance the following message by refining and elevating the tone, clarity, and impact of the following message without altering its original intent. Focus on improving the vocabulary, sentence structure, and overall flow. **Guidelines:** 1.Maintain the original meaning and intent of the message. 2.Use a positive and respectful tone. 3.Adjust the vocabulary to be more professional or friendly, depending on the context. 4.Ensure grammatical accuracy and coherence. 5.Include any relevant context or background information that could enhance the message’s effectiveness. The output should consist solely of the revised message without any quotation marks or additional commentary.";
        case messageStyle.Godlike: return "Translate the following message into the speech of a god-like being, ensuring that the language is elevated, majestic, and imbued with authority. The translation should reflect a divine perspective, using grandiose vocabulary and a tone that conveys wisdom, power, and omniscience. Output only the translated message without any additional commentary, context, or punctuation, such as double quotation marks.";
        case messageStyle.EarlyModern: return "Translate the following message into Early Modern English, ensuring that the vocabulary, grammar, and syntax reflect the linguistic characteristics of the period (approximately 1500-1700). The output should be a faithful translation that captures the essence and tone of the original message, suitable for communication with another individual. Avoid using any quotation marks or additional commentary; provide only the translated message.";
        case messageStyle.Custom: return settings.store.customTranslationPrompt;
    }
}

const ChatBarContextMenuItems: NavContextMenuPatchCallback = children => {
    const group = findGroupChildrenByChildId("languages", children);

    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "languages");
    group.splice(idx + 1, 0,
        <Menu.MenuItem
            id="style-translation"
            label="Style Translation"
        >
            <Menu.MenuItem
                id="style-enhanced"
                label="Enhanced"
                action={() => translate(messageStyle.Enhanced)}
            />
            <Menu.MenuItem
                id="style-godlike"
                label="Godlike"
                action={() => translate(messageStyle.Godlike)}
            />
            <Menu.MenuItem
                id="style-early-modern-english"
                label="Early Modern English"
                action={() => translate(messageStyle.EarlyModern)}
            />
            <Menu.MenuItem
                id="style-custom"
                label="Custom"
                action={() => translate(messageStyle.Custom)}
            />
        </Menu.MenuItem>
    );
};

async function translate(style: messageStyle) {
    const apiKey = settings.store.modelApiKey;
    const channelId = SelectedChannelStore.getChannelId();
    const userInput = `${getDraft(channelId)}`;
    const prompt = getPrompt(style);

    if (userInput === "") {
        Toasts.show({
            message: "Style Translation Failed: Empty User Input",
            type: Toasts.Type.FAILURE,
            id: Toasts.genId(),
            options: { duration: 3000 }
        });
        return;
    }

    if (apiKey === "") {
        Toasts.show({
            message: "Style Translation Failed: No ApiKey Found!",
            type: Toasts.Type.FAILURE,
            id: Toasts.genId(),
            options: { duration: 5000 }
        });
        return;
    }

    if (prompt === "") {
        Toasts.show({
            message: "Style Translation Failed: Empty Custom Prompt",
            type: Toasts.Type.FAILURE,
            id: Toasts.genId(),
            options: { duration: 5000 }
        });
        return;
    }

    ComponentDispatch.dispatchToLastSubscribed("CLEAR_TEXT");
    const response = await fetchModelResponse(`**[${userInput}]**`, prompt, apiKey);

    if (response != null) {
        Toasts.show({
            message: "Translated Successfully!",
            type: Toasts.Type.SUCCESS,
            id: Toasts.genId(),
            options: { duration: 4000 }
        });
        insertTextIntoChatInputBox(response);
    }
}

export default definePlugin({
    name: "Style Translation",
    description: "Translate your English message into a different style of speech. This only works properly with English. To use this, right click your message in the chat input box and you should see Style Translation.",
    authors: [{
        name: "JohnLed69",
        id: 826746276212113419n
    }],
    settings,
    contextMenus: {
        "textarea-context": ChatBarContextMenuItems
    },
});
