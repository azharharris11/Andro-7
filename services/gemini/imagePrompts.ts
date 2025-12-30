
import { StrategyMode, CreativeFormat } from "../../types";
import { generateWithRetry } from "./client";
import { PromptContext } from "./imageUtils";

const getFormatVisualGuide = (format: CreativeFormat): string => {
    switch (format) {
        case CreativeFormat.UGLY_VISUAL:
        case CreativeFormat.MS_PAINT:
            return "Style: Lo-fi, amateur, crude MS Paint drawing or bad collage.";
        case CreativeFormat.TWITTER_REPOST:
            return "Style: A precise screenshot of a Twitter/X post on a white background. Sharp text.";
        case CreativeFormat.HANDHELD_TWEET:
            return "Style: A POV photo of a hand holding a smartphone. The screen displays a viral tweet clearly.";
        case CreativeFormat.GMAIL_UX:
            return "Style: A screenshot of a Gmail inbox or email body. Clean UI interface.";
        case CreativeFormat.CHAT_CONVERSATION:
        case CreativeFormat.DM_NOTIFICATION:
            return "Style: A smartphone lockscreen or chat interface bubble. High readability.";
        case CreativeFormat.BILLBOARD:
            return "Style: A realistic outdoor billboard on a highway or building side. Text must be on the sign.";
        case CreativeFormat.REMINDER_NOTIF:
            return "Style: An iPhone lockscreen notification bubble with glassmorphism.";
        default:
            return "Style: High quality social media advertising asset.";
    }
};

export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene, visualStyle,
        moodPrompt, culturePrompt, congruenceRationale, 
        aspectRatio, rawPersona, embeddedText, safety, enhancer,
        fullStoryContext 
    } = ctx;

    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    // Menentukan arahan visual berdasarkan mode strategi
    let visualDirective = "MODE: AUTHENTIC STORYTELLING. Focus on AMATEUR UGC VIBE. Raw, imperfect.";
    if (isHardSell) visualDirective = "MODE: PROBLEM-SOLUTION. Focus on RAW and GRITTY visuals. High Contrast.";
    else if (isVisualImpulse) visualDirective = "MODE: PATTERN INTERRUPT. High-end aesthetic but native to social media. Aspirational.";

    const strategicContext = {
        campaign: {
            product: project.productName,
            brandVoice: project.brandVoice || "Adaptable",
            // Menambahkan mekanisme agar visual selaras dengan logika solusi
            mechanismUMS: fullStoryContext?.mechanism?.ums 
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            // Fokus pada micro-moment penderitaan/kebutuhan persona
            visceralContext: rawPersona?.visceralSymptoms?.join(", ") 
        },
        narrative: {
            angle: parsedAngle.cleanAngle,
            textToRender: embeddedText, // CRITICAL FOR ONE-SHOT
            specificAction: visualScene, // Adegan dari Creative Director
            visualMood: visualStyle,     // Gaya dari Creative Director
            congruenceGoal: congruenceRationale
        },
        execution: {
            format: format,
            formatRule: getFormatVisualGuide(format),
            culture: culturePrompt,
            aspectRatio: aspectRatio
        }
    };

    const systemPrompt = `
    ROLE: Senior AI Prompt Engineer & Creative Director.
    TASK: Translate a Creative Concept into a single, high-conversion Image Generation Prompt.

    --- STRATEGIC CONTEXT ---
    ${JSON.stringify(strategicContext, null, 2)}

    --- DIRECTIVES ---
    1. CORE COMPOSITION: Execute the scene "${visualScene}" precisely. 
    2. VISUAL DNA: Strictly follow the style "${visualStyle}" and format rule: "${getFormatVisualGuide(format)}".
    3. NO STOCK LOOK: ${visualDirective}. Avoid smooth, generic AI lighting.
    4. TEXT RENDERING: The image MUST include the text "${embeddedText}" clearly visible in the scene (e.g., on the screen, sign, or overlay).
    5. CONGRUENCE: The visual must prove the text.
    
    --- TECHNICAL PARAMETERS ---
    - Style Enhancer: ${enhancer}
    - Safety & Quality: ${safety}
    - Localization: ${culturePrompt}

    Output ONLY the raw prompt string for the image generator.
    `;
    
    try {
        const response = await generateWithRetry({
            model: "gemini-3-flash-preview", 
            contents: systemPrompt
        });
        return response.text?.trim() || "";
    } catch (e) {
        // Fallback jika API gagal
        return `${format} style. ${visualScene}. ${visualStyle}. ${culturePrompt}. RENDER TEXT: "${embeddedText}"`; 
    }
};
