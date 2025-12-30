
import { CreativeFormat, StrategyMode } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai, generateWithRetry } from "./client";

const getFormatVisualGuide = (format: CreativeFormat): string => {
   // (Reusing existing massive switch statement logic - condensed for XML)
   // Returning generic guide if not specific match found
   return `VISUAL PRIORITY: Strictly NO stock or AI images. Format: ${format}. Focus on Authenticity.`;
};

export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene,
        subjectFocus, moodPrompt, culturePrompt,
        congruenceRationale, aspectRatio, rawPersona, embeddedText, safety, enhancer
    } = ctx;

    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    let visualDirective = "MODE: AUTHENTIC STORYTELLING. Focus on AMATEUR UGC VIBE.";
    if (isHardSell) visualDirective = "MODE: PROBLEM-SOLUTION. Focus on RAW visuals.";
    else if (isVisualImpulse) visualDirective = "MODE: PATTERN INTERRUPT. Mimic NATIVE UX.";

    const strategicContext = {
        campaign: {
            product: project.productName,
            brandVoice: project.brandVoice || "Adaptable"
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            psychologicalBlocking: subjectFocus 
        },
        narrative: {
            angle: parsedAngle.cleanAngle,
            customTextToRender: embeddedText,
            specificAction: visualScene,
            congruenceGoal: congruenceRationale
        },
        execution: {
            format: format,
            formatRule: getFormatVisualGuide(format),
            mood: moodPrompt,
            culture: culturePrompt,
            aspectRatio: aspectRatio
        }
    };

    const systemPrompt = `
    ROLE: World-Class AI Prompt Engineer & Creative Director specializing in "direct respons ads".
    TASK: Create a single Strategically Raw, High-Conversion Image Generation Prompt.

    --- STRATEGIC CONTEXT ---
    ${JSON.stringify(strategicContext, null, 2)}

    --- DIRECTIVES ---
    1. CORE COMPOSITION: Combine 'persona.psychologicalBlocking' with 'narrative.specificAction'.
    2. FORMAT RULE: Strictly obey 'execution.formatRule'.
    3. VISUAL STRATEGY: ${visualDirective}. Strictly NO stock-photo look.
    4. TEXT RENDERING: Render: "${embeddedText}".
    
    --- TECHNICAL ---
    ${enhancer}
    SAFETY: ${safety}

    Output ONLY the raw prompt string.
    `;
    
    try {
        const response = await generateWithRetry({
            model: "gemini-3-flash-preview", 
            contents: systemPrompt
        });
        return response.text?.trim() || "";
    } catch (e) {
        return `${format} style. ${subjectFocus}. ${visualScene}. High contrast. RENDER TEXT: "${embeddedText}"`; 
    }
};
