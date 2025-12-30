// services/gemini/imagePrompts.ts

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
    let visualDirective = "MODE: AUTHENTIC STORYTELLING. Focus on AMATEUR UGC VIBE.";
    if (isHardSell) visualDirective = "MODE: PROBLEM-SOLUTION. Focus on RAW and GRITTY visuals.";
    else if (isVisualImpulse) visualDirective = "MODE: PATTERN INTERRUPT. High-end aesthetic but native to social media.";

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
            customTextToRender: embeddedText,
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
    2. VISUAL DNA: Strictly follow the style "${visualStyle}". 
    3. NO STOCK LOOK: ${visualDirective}. Avoid smooth, generic AI lighting. 
    4. CONGRUENCE: The image MUST visually prove the Mechanism: "${fullStoryContext?.mechanism?.ums}".
    5. TEXT: Clearly render this text if possible: "${embeddedText}".
    
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