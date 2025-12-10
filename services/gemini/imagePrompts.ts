import { CreativeFormat } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai } from "./client";

/**
 * AI PROMPT WRITER (UNIFIED ENGINE)
 * Uses the LLM to synthesize strategy into a high-fidelity image prompt + embedded text.
 */
export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, 
        fullStoryContext, enhancer, safety, visualScene
    } = ctx;

    const story = fullStoryContext?.story;
    const mechanism = fullStoryContext?.mechanism;
    const bigIdea = fullStoryContext?.bigIdea;
    
    // Konteks Hook Utama
    const mainHook = parsedAngle.cleanAngle;

    const systemPrompt = `
    ROLE: Hybrid Creative Director & Copywriter (Direct Response Expert).
    
    You are generating a FINAL IMAGE PROMPT for a Generative AI model (like Midjourney/Flux).
    You must define BOTH the **Visual Scene** AND the **Text Overlay/UI Content** in one cohesive description.
    
    --- INPUT STRATEGY ---
    PRODUCT: ${project.productName} (${project.productDescription})
    TARGET AUDIENCE: ${project.targetAudience} in ${project.targetCountry}
    FORMAT REQUIRED: ${format}
    SCENE CONTEXT: ${visualScene}
    
    CORE HOOK: "${mainHook}"
    DEEP PAIN (Story Context): "${story?.narrative || 'General frustration'}"
    THE SOLUTION (Mechanism): "${mechanism?.scientificPseudo || 'New Technology'}"
    THE SHIFT (Big Idea): "${bigIdea?.concept || 'Better way'}"
    
    --- LOGIC ROUTING & INSTRUCTIONS ---
    
    **CASE 1: IF FORMAT IS 'NATIVE UI' (Twitter, Chat, Notification, IG Story, Reddit)**
    - GOAL: Extreme Authenticity. Must look like a real screenshot.
    - VISUAL: Describe the specific UI elements (Dark mode? Blue bubbles? User avatar?).
    - COPYWRITING TASK: Write the specific text content inside the screenshot.
      - Do NOT just write the Hook. Adapt the Hook into a tweet, a DM, or a confession.
      - Use the 'Mechanism' logic in the text naturally (e.g., "I can't believe [Mechanism] actually fixed it").
      - Make it sound human, imperfect, and emotional (matches the 'Deep Pain').
    - PROMPT STRUCTURE START: "A realistic screenshot of a [Format Name]..."
    
    **CASE 2: IF FORMAT IS 'UGLY / MEME' (MS Paint, Ugly Visual)**
    - GOAL: Pattern Interrupt. Looks amateur/bad on purpose.
    - VISUAL: Describe a crude, low-effort drawing or photo. Use keywords: "MS Paint style", "pixelated", "harsh flash", "messy room".
    - COPYWRITING TASK: Write a top/bottom caption or a simple text label.
      - Use the 'Big Idea' sarcasm.
      - Example Text: "Me trying to fix [Problem] without [Mechanism]".
    
    **CASE 3: IF FORMAT IS 'CINEMATIC / PHOTOGRAPHY'**
    - GOAL: High Emotion & Atmosphere.
    - VISUAL: Synthesize the 'Deep Pain' into Lighting and Mood. (e.g. If pain is insomnia -> Blue dark lighting, shadows).
    - COPYWRITING TASK: Place the 'Core Hook' naturally in the scene (e.g. Neon sign, Text on a sticky note, Phone screen notification).
    - ADD TECHNICAL SPECS: ${enhancer}
    
    --- FINAL OUTPUT INSTRUCTION ---
    Write ONLY the raw prompt string. 
    You MUST include the specific text you wrote using the phrase: 'RENDER TEXT: "Your Written Copy Here"'.
    Include the Safety Guidelines at the end: ${safety}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: systemPrompt
        });
        
        return response.text?.trim() || "";
    } catch (e) {
        console.error("Unified Prompt Gen Failed", e);
        // Fallback simple prompt jika error
        return `A creative ad for ${project.productName} in style of ${format}. RENDER TEXT: "${mainHook}"`; 
    }
};