
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
 */export const generateVisualText = async (
    project: ProjectContext,
    format: CreativeFormat,
    parsedAngle: ParsedAngle
): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const { cleanAngle } = parsedAngle;
    const isIndo = project.targetCountry?.toLowerCase().includes("indonesia");

    const langInstruction = isIndo
        ? "LANGUAGE: BAHASA INDONESIA (Gaul/Casual/Slang). Hindari diksi formal marketing."
        : `LANGUAGE: Native language of ${project.targetCountry || "English"}.`;

    let taskInstruction = `
        TASK: Transform the Marketing Hook into a visual text string.
        ORIGINAL HOOK: "${cleanAngle}"
        CORE PRINCIPLE: "Clear over Clever". Teks harus terlihat seperti konten organik hasil ketikan manusia, bukan copy iklan.
    `;

    // --- FULL CATEGORY MAPPING (Meta Andromeda Logic) ---

    // 1. NATIVE UI & SYSTEM NOTIF (Trigger: Curiosity & Personal Bias)
    if ([
        CreativeFormat.GMAIL_UX, 
        CreativeFormat.DM_NOTIFICATION, 
        CreativeFormat.REMINDER_NOTIF, 
        CreativeFormat.CHAT_CONVERSATION
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Intimate Leaked Secret". Lowercase, personal, dan sedikit 'vulnerable'. 
            STRATEGY: Mimikri notifikasi dari teman atau pesan pribadi. Fokus pada Curiosity Gap.
            EXAMPLE: "we need to talk..." atau "maaf, baru jujur sekarang" atau "not sure if you've seen this".
        `;
    } 

    // 2. SOCIAL NATIVE (Trigger: Ingroup Bias & Authenticity)
    else if ([
        CreativeFormat.REDDIT_THREAD, 
        CreativeFormat.TWITTER_REPOST, 
        CreativeFormat.HANDHELD_TWEET, 
        CreativeFormat.PHONE_NOTES
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Confessional / Hot Take". 
            STRATEGY: Gunakan format judul thread atau status viral. Harus menyertakan 'Key Emotion' (I struggle) atau wawasan kontroversial (Unpopular opinion).
            EXAMPLE: "I struggle to keep up with [Keyword]..." atau "Unpopular opinion: [Pain Point] is actually a [Keyword] problem."
        `;
    }

    // 3. PATTERN INTERRUPT (Trigger: Stop-Scroll & Surprise Effect)
    else if ([
        CreativeFormat.BIG_FONT, 
        CreativeFormat.REELS_THUMBNAIL, 
        CreativeFormat.BILLBOARD
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Aggressive Call-out". Tipografi masif.
            STRATEGY: Fokus pada kata kunci GEJALA (Symptom) yang brutal atau 'Ugly Visual' description untuk memicu 'Pattern Interrupt'.
            EXAMPLE: "YOUR KNEES LIE." atau "JERAWAT BATU?" atau "STOP MAKAN GULA."
        `;
    }

    // 4. UGLY / RAW / MEME (Trigger: Attention Restoration & Relatability)
    else if ([
        CreativeFormat.UGLY_VISUAL, 
        CreativeFormat.MS_PAINT, 
        CreativeFormat.MEME, 
        CreativeFormat.CARTOON
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Brutally Honest / Shitpost Vibe". 
            STRATEGY: Teks harus terasa seperti meme atau coretan kasar yang sangat relatable. Fokus pada relatabilitas situasi (POV), bukan produk.
            EXAMPLE: "POV: You finally found the solution for [Pain Point]." atau "Me trying to [Action] without [Product]."
        `;
    }

    // 5. LOGIC, AUTHORITY & MECHANISM (Trigger: Intellectual Trust)
    else if ([
        CreativeFormat.WHITEBOARD, 
        CreativeFormat.VENN_DIAGRAM, 
        CreativeFormat.GRAPH_CHART, 
        CreativeFormat.MECHANISM_XRAY,
        CreativeFormat.ANNOTATED_PRODUCT,
        CreativeFormat.BENEFIT_POINTERS
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Handwritten Expert Insight". 
            STRATEGY: Teks harus membongkar 'The Secret' atau menunjukkan mekanisme unik (UMS). Gunakan gaya coretan tangan untuk memicu bias keaslian.
            EXAMPLE: "The [Keyword] Mechanism" atau "Why standard advice fails" atau "System for [Outcome]".
        `;
    }

    // 6. EDITORIAL & TRUST (Trigger: Institutional Authority)
    else if ([
        CreativeFormat.PRESS_FEATURE, 
        CreativeFormat.LONG_TEXT, 
        CreativeFormat.STORY_QNA
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Institutional Authority". 
            STRATEGY: Headline majalah atau News UX. Gunakan narasi 'thoughtful' atau cerita founder yang mendalam.
            EXAMPLE: "The Silent Killer In Your Kitchen" atau "How this [Location] Founder solved [Pain Point]."
        `;
    }

    // 7. CAROUSEL & JOURNEY (Trigger: Slippery Slope Effect)
    else if ([
        CreativeFormat.CAROUSEL_EDUCATIONAL, 
        CreativeFormat.CAROUSEL_REAL_STORY, 
        CreativeFormat.TIMELINE_JOURNEY
    ].includes(format)) {
        taskInstruction += `
            STYLE: "Slippery Slope Listicle". 
            STRATEGY: Teks slide pertama harus memaksa orang untuk swipe. Gunakan listicle atau perbandingan "Day 1 vs Day 30".
            EXAMPLE: "5 Reasons Why [Product] is the best for [Persona]" atau "My [Keyword] journey (Day 1 - 30)."
        `;
    }

    // 8. DEFAULT / AESTHETIC
    else {
        taskInstruction += `
            STYLE: "Minimalist & Clear". 
            STRATEGY: Pastikan teks 'Clear over Clever'. Fokus pada 'Outcome' akhir.
        `;
    }

    const prompt = `
        # ROLE: Expert Direct Response Copywriter (Meta Andromeda Specialist)
        ${langInstruction}
        ${taskInstruction}
        
        CRITICAL: Output HANYA teks final tanpa tanda kutip. Maksimal 12 kata (kecuali format LONG_TEXT atau REDDIT).
    `;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text?.trim()?.replace(/^"|"$/g, '') || cleanAngle;
    } catch (e) {
        return cleanAngle;
    }
};