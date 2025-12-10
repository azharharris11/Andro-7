
import { ProjectContext, CreativeFormat } from "../../types";
import { ParsedAngle } from "./imageUtils";

export const generateTextInstruction = (format: CreativeFormat, parsedAngle: ParsedAngle, project: ProjectContext): string => {
    const { cleanAngle } = parsedAngle;
    const productContext = `${project.productName} (${project.productDescription})`;

    const baseCtx = `
        PRODUCT: ${productContext}
        INPUT HOOK: "${cleanAngle}"
    `;

    const FORBIDDEN = `FORBIDDEN WORDS: "Buy Now", "Click Here", "Sale". Keep it native.`;

    switch (format) {
        case CreativeFormat.GMAIL_UX:
            return `
            CONTEXT: Gmail Subject Line.
            TASK: Write a 3-5 word lowercase subject line.
            STYLE: Personal, vulnerable, clickbait.
            EXAMPLES: "we messed up", "can i be honest?", "my apology".
            ${FORBIDDEN}
            `;

        case CreativeFormat.BIG_FONT:
            return `
            CONTEXT: Poster Headline.
            TASK: Write a 3-7 word SHOCKING statement.
            STYLE: Aggressive, Direct.
            EXAMPLES: "STOP EATING SUGAR", "YOUR KNEES ARE LYING", "FAT BURNER".
            ${FORBIDDEN}
            `;

        case CreativeFormat.LONG_TEXT:
            return `
            CONTEXT: Editorial Magazine Headline.
            TASK: Write a headline and 1 sentence sub-headline.
            STYLE: Educational, "How-To", Authority.
            EXAMPLE: "Why 80% of Diets Fail (And What To Do Instead)."
            ${FORBIDDEN}
            `;
            
        case CreativeFormat.WHITEBOARD:
        case CreativeFormat.STICKY_NOTE_REALISM:
            return `
            CONTEXT: Handwritten Note.
            TASK: Write 3-5 punchy words.
            STYLE: Informal, Arrows, Underlines.
            EXAMPLE: "Works in 5 mins!!", "Don't forget this!", "SECRET TRICK ->".
            ${FORBIDDEN}
            `;
            
        case CreativeFormat.UGLY_VISUAL:
            return `
            CONTEXT: Text overlay on a bad photo.
            TASK: A simple question or statement.
            STYLE: Blunt.
            EXAMPLE: "Disorganized?", "This actually works.", "Acne Relief."
            ${FORBIDDEN}
            `;

        case CreativeFormat.IG_STORY_TEXT:
        case CreativeFormat.STORY_QNA:
        case CreativeFormat.STORY_POLL:
            return `
            CONTEXT: Instagram Sticker Text.
            TASK: A question for the audience.
            STYLE: Engagement bait.
            EXAMPLE: "Have you tried this?", "Yes or No?", "This saved my skin."
            ${FORBIDDEN}
            `;

        case CreativeFormat.CHAT_CONVERSATION:
            return `
            ${baseCtx}
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
            TEXT COPY INSTRUCTION:
            - CONTEXT: Personal "To-Do" list or Journal in Apple Notes.
            - TONE: Raw, unfiltered, bullet points.
            - TASK: Write 3 reminders related to the hook.
            ${FORBIDDEN}
            `;

        case CreativeFormat.SOCIAL_COMMENT_STACK:
            return `
            ${baseCtx}
            TEXT COPY INSTRUCTION:
            - CONTEXT: Social Media Comments Section.
            - TASK: Generate 2 comments (Skeptic & Believer).
            ${FORBIDDEN}
            `;

        case CreativeFormat.MEME:
            return `
            ${baseCtx}
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
            TEXT COPY INSTRUCTION:
            - CONTEXT: Lock screen notification.
            - TASK: A short, urgent reminder.
            ${FORBIDDEN}
            `;

        default:
             return `TEXT COPY INSTRUCTION: Include the text "${parsedAngle.cleanAngle}" clearly in the image. ${FORBIDDEN}`;
    }
};
