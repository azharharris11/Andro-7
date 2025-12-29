
import { ProjectContext, CreativeFormat } from "../../types";
import { ParsedAngle } from "./imageUtils";
import { ai } from "./client";

/**
 * OLD FUNCTION (DEPRECATED BUT KEPT FOR COMPATIBILITY)
 * This is used by the Prompt Builder to give general instructions.
 */
export const generateTextInstruction = (format: CreativeFormat, parsedAngle: ParsedAngle, project: ProjectContext): string => {
    // We now rely more on the AI-generated text below, but this serves as a fallback context.
    return `
    CONTEXT: The image must feature text related to "${parsedAngle.cleanAngle}".
    PRODUCT: ${project.productName}.
    FORMAT: ${format}.
    `;
};

/**
 * THE NEW AI COPYWRITER
 * Generates the specific string that will be rendered INTO the image.
 * This ensures the text matches the format's constraints (e.g. short for stickers, clickbait for email)
 * while allowing natural expression without strict word limits.
 */
export const generateVisualText = async (
    project: ProjectContext,
    format: CreativeFormat,
    parsedAngle: ParsedAngle
): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const { cleanAngle } = parsedAngle;
    const isIndo = project.targetCountry?.toLowerCase().includes("indonesia");

    const langInstruction = isIndo
        ? "LANGUAGE: BAHASA INDONESIA (Gaul/Casual/Slang). Do NOT use English unless it is common slang (like 'Skincare')."
        : `LANGUAGE: Native language of ${project.targetCountry || "English"}.`;

    let taskInstruction = `
        TASK: Rewrite the following Marketing Hook into a text string suitable for the specific visual format.
        ORIGINAL HOOK: "${cleanAngle}"
        CONSTRAINT: Ensure the text fits naturally within the visual format (e.g. subject line size vs magazine headline size), but prioritize expression over brevity.
    `;

    // --- FORMAT SPECIFIC COPYWRITING RULES ---
    if (format === CreativeFormat.GMAIL_UX) {
        taskInstruction += `
            CONTEXT: Gmail Subject Line.
            STYLE: Lowercase, personal, vulnerable, high curiosity. Looks like a friend or ex emailing you.
            BAD: "Special Offer Inside"
            GOOD: "we need to talk..." or "jujurly aku kecewa" or "my honest apology"
        `;
    } else if (format === CreativeFormat.LONG_TEXT) {
        taskInstruction += `
            CONTEXT: Magazine/Editorial Main Headline.
            STYLE: High-end, authoritative, bold serif style.
            EXAMPLE: "The Silent Killer In Your Kitchen."
        `;
    } else if (format === CreativeFormat.BIG_FONT) {
        taskInstruction += `
            CONTEXT: Impact Text Overlay (Poster).
            STYLE: Shocking, direct, brutal. Use CAPS LOCK.
            EXAMPLE: "YOUR KNEES LIE." or "STOP MAKAN GULA."
        `;
    } else if (format === CreativeFormat.UGLY_VISUAL || format === CreativeFormat.MS_PAINT) {
        taskInstruction += `
            CONTEXT: Meme text or ugly overlay.
            STYLE: Blunt, funny, or brutally honest.
            EXAMPLE: "Jerawat Batu?" or "Why am I like this?"
        `;
    } else if (format === CreativeFormat.STICKY_NOTE_REALISM || format === CreativeFormat.WHITEBOARD) {
        taskInstruction += `
            CONTEXT: Handwritten Note.
            STYLE: Personal reminder, messy, urgent.
            EXAMPLE: "Don't forget this!!" or "JANGAN LEWATKAN INI."
        `;
    } else if (format === CreativeFormat.TWITTER_REPOST || format === CreativeFormat.HANDHELD_TWEET) {
        taskInstruction += `
            CONTEXT: Viral Tweet Body.
            STYLE: Controversial opinion or "Hot Take".
            EXAMPLE: "Stop drinking coffee on an empty stomach if you want to live."
        `;
    } else if (format === CreativeFormat.CHAT_CONVERSATION || format === CreativeFormat.DM_NOTIFICATION) {
        taskInstruction += `
            CONTEXT: Private Message / Notification Preview.
            STYLE: Intimate, urgent, friend-to-friend gossip.
            EXAMPLE: "Omg did you see this??" or "Sumpah ini gila banget."
        `;
    } else if (format === CreativeFormat.IG_STORY_TEXT || format === CreativeFormat.STORY_QNA || format === CreativeFormat.STORY_POLL) {
        taskInstruction += `
            CONTEXT: Instagram Story Sticker (Poll/Question).
            STYLE: Interactive question or provocative statement.
            EXAMPLE: "Do you struggle with this?" or "Sering ngerasa gini gak?"
        `;
    } else if (format === CreativeFormat.MEME) {
        taskInstruction += `
            CONTEXT: Top Text of a Meme.
            STYLE: Relatable situation description.
            Start with: "Me when..." or "pov:..."
        `;
    } else if (format === CreativeFormat.REDDIT_THREAD) {
        taskInstruction += `
            CONTEXT: Reddit Thread Title.
            STYLE: Confessional, shocking, "TrueOffMyChest" vibe.
            EXAMPLE: "I finally realized why my acne never goes away."
        `;
    } else {
        // Default Fallback
        taskInstruction += `
            CONTEXT: Text overlay on image.
            STYLE: Punchy, clear headline.
        `;
    }

    const prompt = `
        ROLE: Expert Direct Response Copywriter.
        ${langInstruction}
        ${taskInstruction}
        
        CRITICAL: Output ONLY the final text string. Do not use quotation marks. Do not explain.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        
        // Cleanup: Remove quotes if AI added them
        return response.text?.trim()?.replace(/^"|"$/g, '') || cleanAngle;
    } catch (e) {
        console.error("Visual Text Gen Failed", e);
        return cleanAngle; // Fallback to original hook
    }
};
