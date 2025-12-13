import { CreativeFormat, StrategyMode } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai } from "./client";

/**
 * AI PROMPT WRITER (REVISED - CONTEXT AWARE ENGINE)
 * Refactored to leverage full context reasoning instead of rigid string templates.
 */
export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, 
        fullStoryContext, enhancer, safety, visualScene,
        personaVisuals, moodPrompt, culturePrompt,
        congruenceRationale, aspectRatio, rawPersona
    } = ctx;

    // 1. STRATEGY MODE LOGIC (Visual Direction)
    // Menentukan arah visual tanpa hardcode string panjang di awal
    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    let visualDirective = "";
    if (isHardSell) {
        visualDirective = "MODE: HARD SELL. Focus purely on PRODUCT HERO SHOT. High urgency, retail vibe, bright commercial lighting. NO clutter.";
    } else if (isVisualImpulse) {
        visualDirective = "MODE: VISUAL IMPULSE. Focus on AESTHETIC & VIBE. Pinterest/Instagram style, luxurious, aspirational. Product must look desirable.";
    } else {
        // Direct Response / Story Mode
        visualDirective = "MODE: STORYTELLING / REALISM. Focus on the PERSONA'S REALITY. Background must show the 'messy' private life props defined in context. Authentic, raw, emotional.";
    }

    // 2. CONSTRUCT STRUCTURED CONTEXT (JSON Payload)
    // Kita berikan "Otak" strategi ke AI dalam bentuk data terstruktur agar AI bisa "berpikir".
    const strategicContext = {
        campaign: {
            product: project.productName,
            description: project.productDescription,
            marketAwareness: project.marketAwareness,
            brandVoice: project.brandVoice || "Adaptable"
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            pain: rawPersona?.visceralSymptoms || [],
            motivation: rawPersona?.motivation,
            worldVisuals: personaVisuals // AI reads this to populate the background
        },
        narrative: {
            hook: parsedAngle.cleanAngle,
            story: fullStoryContext?.story?.narrative,
            mechanism: fullStoryContext?.mechanism?.scientificPseudo,
            bigIdea: fullStoryContext?.bigIdea?.concept
        },
        execution: {
            format: format,
            baseScene: visualScene, // The core action required
            mood: moodPrompt,
            culture: culturePrompt,
            aspectRatio: aspectRatio,
            logic: congruenceRationale
        }
    };

    // 3. THE MASTER PROMPT
    const systemPrompt = `
    ROLE: World-Class AI Prompt Engineer & Creative Director.
    
    TASK: Synthesize the provided [STRATEGIC CONTEXT] into a single, high-fidelity Image Generation Prompt.
    
    --- INPUT DATA (READ CAREFULLY) ---
    ${JSON.stringify(strategicContext, null, 2)}
    
    --- DIRECTIVES ---
    1. **VISUAL STRATEGY:** ${visualDirective}
    2. **TECHNICAL SPECS:** ${enhancer}
    
    --- INSTRUCTIONS ---
    You must output a raw prompt string that covers these 3 layers:

    **LAYER 1: THE SUBJECT & ACTION**
    - Based on 'execution.baseScene'.
    - If Strategy is 'Hard Sell', make the Product the hero.
    - If Strategy is 'Story', make the Persona the hero and place them in their 'worldVisuals'.

    **LAYER 2: THE ATMOSPHERE**
    - Combine 'execution.mood', 'execution.culture', and 'campaign.brandVoice'.
    - Ensure lighting and color grading match the emotion of the 'persona.pain' or 'narrative.hook'.

    **LAYER 3: TEXT & UI (CRITICAL)**
    - Format is '${format}'.
    - If format requires UI (e.g., Native UI, Tweets, Notifications), describe the UI elements precisely.
    - **COPYWRITING:** You must WRITE the text that appears in the image.
      - Extract the core message from 'narrative.hook'.
      - Adapt the tone to the 'campaign.brandVoice' (e.g., if Slang, use slang).
      - FORMAT: Use the syntax 'RENDER TEXT: "Your Copy Here"'.

    --- CONSTRAINTS ---
    - Do not explain your reasoning. Just output the prompt.
    - ${aspectRatio === '9:16' ? 'Ensure vertical composition with negative space for UI.' : 'Ensure balanced square composition.'}
    - SAFETY: ${safety}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: systemPrompt
        });
        
        return response.text?.trim() || "";
    } catch (e) {
        console.error("Unified Prompt Gen Failed", e);
        return `High quality photo of ${project.productName}, ${visualScene}. RENDER TEXT: "${parsedAngle.cleanAngle}"`; 
    }
};