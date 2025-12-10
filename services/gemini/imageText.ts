import { ProjectContext, CreativeFormat } from "../../types";
import { ParsedAngle } from "./imageUtils";

export const generateTextInstruction = (format: CreativeFormat, parsedAngle: ParsedAngle, project: ProjectContext): string => {
    const { cleanAngle } = parsedAngle;
    const productContext = `${project.productName} (${project.productDescription})`;

    const isIndo = project.targetCountry?.toLowerCase().includes("indonesia");
    const langInstruction = isIndo 
        ? "LANGUAGE: BAHASA INDONESIA (Gaul/Casual). Do NOT use English." 
        : `LANGUAGE: Native language of ${project.targetCountry || "English"}.`;

    const baseCtx = `
        PRODUCT: ${productContext}
        INPUT HOOK: "${cleanAngle}"
    `;

    const FORBIDDEN = `FORBIDDEN WORDS: "Buy Now", "Click Here", "Sale". Keep it native.`;

    switch (format) {
        case CreativeFormat.GMAIL_UX:
            return `
            ${langInstruction}
            CONTEXT: Gmail Subject Line.
            TASK: Write a 3-5 word lowercase subject line.
            STYLE: Personal, vulnerable, clickbait.
            EXAMPLES (If Indo): "maaf ya...", "jujurly...", "buka dong".
            EXAMPLES (If English): "we messed up", "can i be honest?".
            ${FORBIDDEN}
            `;

        case CreativeFormat.BIG_FONT:
            return `
            ${langInstruction}
            CONTEXT: Poster Headline.
            TASK: Write a 3-7 word SHOCKING statement.
            STYLE: Aggressive, Direct.
            EXAMPLES (If Indo): "STOP MAKAN GULA", "LUTUT KAMU BOHONG", "PENGHANCUR LEMAK".
            EXAMPLES (If English): "STOP EATING SUGAR", "YOUR KNEES ARE LYING", "FAT BURNER".
            ${FORBIDDEN}
            `;

        case CreativeFormat.LONG_TEXT:
            return `
            ${langInstruction}
            CONTEXT: Editorial Magazine Headline.
            TASK: Write a headline and 1 sentence sub-headline.
            STYLE: Educational, "How-To", Authority.
            EXAMPLE (If Indo): "Kenapa 80% Diet Gagal (Dan Solusinya)."
            EXAMPLE (If English): "Why 80% of Diets Fail (And What To Do Instead)."
            ${FORBIDDEN}
            `;
            
        case CreativeFormat.WHITEBOARD:
        case CreativeFormat.STICKY_NOTE_REALISM:
            return `
            ${langInstruction}
            CONTEXT: Handwritten Note.
            TASK: Write 3-5 punchy words.
            STYLE: Informal, Arrows, Underlines.
            EXAMPLE (If Indo): "Cuma 5 menit!!", "Jangan lupa ini!", "TRIK RAHASIA ->".
            EXAMPLE (If English): "Works in 5 mins!!", "Don't forget this!", "SECRET TRICK ->".
            ${FORBIDDEN}
            `;
            
        case CreativeFormat.UGLY_VISUAL:
            return `
            ${langInstruction}
            CONTEXT: Text overlay on a bad photo.
            TASK: A simple question or statement.
            STYLE: Blunt.
            EXAMPLE (If Indo): "Berantakan?", "Ini beneran ampuh.", "Jerawat ilang."
            EXAMPLE (If English): "Disorganized?", "This actually works.", "Acne Relief."
            ${FORBIDDEN}
            `;

        case CreativeFormat.IG_STORY_TEXT:
        case CreativeFormat.STORY_QNA:
        case CreativeFormat.STORY_POLL:
            return `
            ${langInstruction}
            CONTEXT: Instagram Sticker Text.
            TASK: A question for the audience.
            STYLE: Engagement bait.
            EXAMPLE (If Indo): "Udah pernah coba?", "Ya atau Tidak?", "Penyelamat kulitku."
            EXAMPLE (If English): "Have you tried this?", "Yes or No?", "This saved my skin."
            ${FORBIDDEN}
            `;

        case CreativeFormat.CHAT_CONVERSATION:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Private DM between friends (WhatsApp/iMessage)
            - SENDER POV: Someone who JUST experienced the result
            - TONE: Shocked, excited, informal, typo-prone
            ${FORBIDDEN}
            `;
        
        case CreativeFormat.TWITTER_REPOST:
        case CreativeFormat.HANDHELD_TWEET:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: A viral tweet/X post.
            - TONE: Opinionated, slightly controversial, "Hot Take".
            - BAD: "This product is great."
            - GOOD: "If you still do [Old Habit], you are playing life on hard mode."
            ${FORBIDDEN}
            `;

        case CreativeFormat.PHONE_NOTES:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Personal "To-Do" list or Journal in Apple Notes.
            - TONE: Raw, unfiltered, bullet points.
            - TASK: Write 3 reminders related to the hook.
            ${FORBIDDEN}
            `;

        case CreativeFormat.SOCIAL_COMMENT_STACK:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Social Media Comments Section.
            - TASK: Generate 2 comments (Skeptic & Believer).
            ${FORBIDDEN}
            `;

        case CreativeFormat.MEME:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Top/Bottom Text Impact Font Meme.
            - TONE: Ironic, funny, relatable pain.
            - TASK: "When you [Experience Pain] but then [Result of Hook]".
            ${FORBIDDEN}
            `;

        case CreativeFormat.REMINDER_NOTIF:
        case CreativeFormat.DM_NOTIFICATION:
            return `
            ${baseCtx}
            ${langInstruction}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Lock screen notification.
            - TASK: A short, urgent reminder.
            ${FORBIDDEN}
            `;

        default:
             return `TEXT COPY INSTRUCTION: Include the text "${parsedAngle.cleanAngle}" clearly in the image. ${langInstruction} ${FORBIDDEN}`;
    }
};