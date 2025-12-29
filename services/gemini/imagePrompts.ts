import { CreativeFormat, StrategyMode } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai } from "./client";

/**
 * HELPER: Strict Visual Rules per Format
 * Ini memaksa AI untuk mengikuti layout visual spesifik, bukan hanya 'vibe'.
 */
const getFormatVisualGuide = (format: CreativeFormat): string => {
    switch (format) {
        // --- UI & SOCIAL FORMATS (CRITICAL: MUST LOOK LIKE UI) ---
        case CreativeFormat.TWITTER_REPOST:
        case CreativeFormat.HANDHELD_TWEET:
            return "VISUAL PRIORITY: A screenshot of a social media post (Twitter/X style) on a clean background. White/Dark UI. User avatar visible. Focus on the TEXT layout.";
        case CreativeFormat.GMAIL_UX:
            return "VISUAL PRIORITY: A Gmail inbox list view or email open view. White/Grey UI. Focus on the Subject Line and Sender Name. NOT a photo of a person.";
        case CreativeFormat.DM_NOTIFICATION:
        case CreativeFormat.REMINDER_NOTIF:
            return "VISUAL PRIORITY: An iPhone Lockscreen or Notification bubble overlay. Blurred background. The text notification must be the clear focal point.";
        case CreativeFormat.CHAT_CONVERSATION:
            return "VISUAL PRIORITY: An iMessage or WhatsApp chat screen. Green/Blue bubbles. Chat interface. NOT a lifestyle photo.";
        case CreativeFormat.IG_STORY_TEXT:
        case CreativeFormat.STORY_POLL:
        case CreativeFormat.STORY_QNA:
            return "VISUAL PRIORITY: Vertical Instagram Story layout. Large negative space (sky, wall, texture) for text overlay. Interactive Sticker (Poll/Question) visible in center.";
        
        // --- UGLY / RAW FORMATS ---
        case CreativeFormat.UGLY_VISUAL:
        case CreativeFormat.MS_PAINT:
        case CreativeFormat.MEME:
            return "VISUAL PRIORITY: Low-fidelity, amateur, chaotic, or intentionally ugly/crude. Harsh flash lighting. Look like a shitpost or raw meme. DO NOT make it pretty.";
        case CreativeFormat.STICKY_NOTE_REALISM:
        case CreativeFormat.PHONE_NOTES:
            return "VISUAL PRIORITY: A handwritten sticky note or iPhone Notes app screenshot. Text is the main visual element. Simple background.";

        // --- EDITORIAL / TEXT HEAVY ---
        case CreativeFormat.BIG_FONT:
        case CreativeFormat.LONG_TEXT:
            return "VISUAL PRIORITY: Text-Heavy Poster. The background image is secondary/dimmed. Huge, bold Typography takes up 50-70% of the frame.";
        case CreativeFormat.PRESS_FEATURE:
            return "VISUAL PRIORITY: A magazine article layout or news website header. Headline is huge. Authority/Trustworthy vibe.";

        // --- COMPARISON / LOGIC ---
        case CreativeFormat.BEFORE_AFTER:
        case CreativeFormat.OLD_ME_VS_NEW_ME:
        case CreativeFormat.US_VS_THEM:
            return "VISUAL PRIORITY: Split Screen Composition. Left side = Gloomy/Problem. Right side = Bright/Solution. Clear dividing line.";
        
        // --- PRODUCT FOCUSED ---
        case CreativeFormat.LEAD_MAGNET_3D:
            return "VISUAL PRIORITY: A high-quality 3D Mockup of a PDF Book, Guide, or Checklist floating in 3D space. Clean background.";
        case CreativeFormat.MECHANISM_XRAY:
            return "VISUAL PRIORITY: Scientific or Medical cross-section diagram. Zoomed in detail. Schematic style overlay.";

        // --- DEFAULT SCENES ---
        default:
            return "VISUAL PRIORITY: Standard Photography Composition. Focus on the Subject/Action defined in the scene.";
    }
};

/**
 * AI PROMPT WRITER (REVISED - CONTEXT AWARE ENGINE)
 */
export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, 
        fullStoryContext, enhancer, safety, visualScene,
        personaVisuals, moodPrompt, culturePrompt,
        congruenceRationale, aspectRatio, rawPersona
    } = ctx;

    // 1. STRATEGY MODE LOGIC (Visual Direction)
    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    let visualDirective = "";
    if (isHardSell) {
        visualDirective = "MODE: HARD SELL. Focus purely on PRODUCT HERO SHOT. High urgency, retail vibe. NO clutter.";
    } else if (isVisualImpulse) {
        visualDirective = "MODE: VISUAL IMPULSE. Focus on AESTHETIC & VIBE. Pinterest/Instagram style, luxurious. Product must look desirable.";
    } else {
        // Direct Response / Story Mode
        visualDirective = "MODE: STORYTELLING / REALISM. Focus on the PERSONA'S REALITY. Authentic, raw, emotional props.";
    }

    // 2. GET STRICT FORMAT GUIDES
    const formatRule = getFormatVisualGuide(format);

    // 3. CONSTRUCT STRUCTURED CONTEXT
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
            worldVisuals: personaVisuals // AI reads this to populate the background
        },
        narrative: {
            hook: parsedAngle.cleanAngle,
            sceneAction: visualScene // The core action required
        },
        execution: {
            format: format,
            formatRule: formatRule, // <--- INJECTED HERE
            mood: moodPrompt,
            culture: culturePrompt,
            aspectRatio: aspectRatio
        }
    };

    // 4. THE MASTER PROMPT
    const systemPrompt = `
    ROLE: World-Class AI Prompt Engineer & Creative Director.
    
    TASK: Synthesize the provided [STRATEGIC CONTEXT] into a single, high-fidelity Image Generation Prompt.
    
    --- INPUT DATA (READ CAREFULLY) ---
    ${JSON.stringify(strategicContext, null, 2)}
    
    --- DIRECTIVES (HIERARCHY OF IMPORTANCE) ---
    1. **FORMAT RULE (HIGHEST PRIORITY):** You MUST obey 'execution.formatRule'. If it says "Screenshot", do NOT generate a photo of a person. If it says "Split Screen", you MUST create a split screen.
    2. **VISUAL STRATEGY:** ${visualDirective} (Apply this ONLY inside the constraints of the Format Rule).
    3. **TECHNICAL SPECS:** ${enhancer}
    
    --- INSTRUCTIONS ---
    You must output a raw prompt string that covers these 3 layers:

    **LAYER 1: COMPOSITION & LAYOUT**
    - Strictly follow '${format}'.
    - If format is UI (Twitter/Gmail/Chat), describe the interface elements precisely.
    - If format is Scene (Ugly/Story), describe the 'narrative.sceneAction' taking place in the 'persona.worldVisuals'.

    **LAYER 2: THE ATMOSPHERE**
    - Ensure lighting and color grading match the 'execution.mood' and 'campaign.brandVoice'.

    **LAYER 3: TEXT & UI (CRITICAL)**
    - If the format usually contains text (like a Meme, Tweet, or Sticky Note), you MUST write the text into the prompt.
    - Extract the core message from 'narrative.hook'.
    - SYNTAX: Use 'RENDER TEXT: "Your Copy Here"'.

    --- CONSTRAINTS ---
    - Do not explain your reasoning. Just output the prompt.
    - ${aspectRatio === '9:16' ? 'Ensure vertical composition.' : 'Ensure balanced square composition.'}
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
        // Fallback yang lebih spesifik
        return `${format} style image. ${visualScene}. RENDER TEXT: "${parsedAngle.cleanAngle}"`; 
    }
};