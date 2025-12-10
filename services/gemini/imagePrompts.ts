
import { CreativeFormat } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai } from "./client";

/**
 * HELPER: Extracts the emotional vibe from the strategic context.
 */
const getEmotionalContext = (ctx: PromptContext): string => {
    const storyEmotion = ctx.fullStoryContext?.story?.emotionalTheme;
    const hookAngle = ctx.parsedAngle.cleanAngle;
    
    if (storyEmotion) return storyEmotion;
    
    if (/sad|lonely|tired|exhausted/i.test(hookAngle)) return "Melancholic & Exhausted";
    if (/angry|hate|stop|worst/i.test(hookAngle)) return "Frustrated & Aggressive";
    if (/hope|fix|finally/i.test(hookAngle)) return "Hopeful & Relieved";
    
    return "Urgent & Visceral";
};

/**
 * HELPER: Extracts the mechanism logic.
 */
const getMechanismContext = (ctx: PromptContext): string => {
    return ctx.fullStoryContext?.mechanism?.scientificPseudo || "The Scientific Solution";
};

/**
 * AI PROMPT WRITER
 * Uses the LLM to synthesize strategy into a high-fidelity image prompt.
 */
export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene, 
        fullStoryContext, embeddedText, enhancer, safety 
    } = ctx;

    const story = fullStoryContext?.story;
    const mechanism = fullStoryContext?.mechanism;
    const bigIdea = fullStoryContext?.bigIdea;

    const systemPrompt = `
    ROLE: Expert AI Prompt Engineer for Midjourney/Flux/Gemini.
    
    INPUT CONTEXT (The Strategy):
    - Product: ${project.productName} (${project.productDescription})
    - Target Audience: ${project.targetAudience} in ${project.targetCountry}
    - Key Emotion/Pain: ${story?.emotionalTheme || getEmotionalContext(ctx)}
    - The Logic (Mechanism): ${mechanism?.scientificPseudo || "N/A"} (${mechanism?.ums || "N/A"})
    - The Shift (Big Idea): ${bigIdea?.concept || "N/A"}
    - Marketing Hook: "${parsedAngle.cleanAngle}"
    
    VISUAL GOAL (The Container):
    - Format: ${format}
    - Base Scene Description: ${visualScene}
    - Required Text on Image: "${embeddedText || ''}"
    
    TASK:
    Write a HIGH-FIDELITY IMAGE GENERATION PROMPT based on the inputs above.
    Synthesize the strategic context into visual descriptions (lighting, texture, angle, subject action).
    
    CRITICAL RULES:
    1. Do NOT explain the strategy. Just write the prompt description.
    2. Incorporate the "Mechanism" logic into the visual details (e.g. if mechanism is "glitch", add "glitch art style").
    3. Specify the camera angle, lighting, and film stock to match the "Key Emotion".
    4. If "Required Text" is present, use the instruction: 'RENDER TEXT: "..."'
    5. Append these technical modifiers at the end: "${enhancer}"
    6. Adhere to safety guidelines: "${safety}"
    
    OUTPUT FORMAT:
    Return ONLY the raw prompt string. No "Here is the prompt" text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: systemPrompt
        });
        
        const finalPrompt = response.text?.trim();
        return finalPrompt || `${visualScene} ${enhancer} ${safety}`;

    } catch (e) {
        console.error("Prompt Generation Failed", e);
        return `${visualScene} ${enhancer} ${safety}`; 
    }
};

/**
 * UGLY FORMATS (Deterministic)
 */
export const getUglyFormatPrompt = (ctx: PromptContext): string => {
    const { format, parsedAngle, safety } = ctx;
    const emotionalVibe = getEmotionalContext(ctx);

    if (format === CreativeFormat.BIG_FONT) {
        return `
          FORMAT ARCHETYPE: "The Brutalist Typography".
          CORE CONCEPT: "If you shout loud enough, they will look."
          FORMAT ESSENCE: A MASSIVE, UNAVOIDABLE STATEMENT. Typography dominates 80-90% of space.
          STRATEGIC ADAPTATION: The Hook "${parsedAngle.cleanAngle}" is the hero. Channel "${emotionalVibe}" into font weight.
          ${safety}
        `;
    }

    if (format === CreativeFormat.UGLY_VISUAL || format === CreativeFormat.MS_PAINT) {
        return `
          FORMAT ARCHETYPE: "The Authentic Amateur".
          CORE CONCEPT: "It looks so bad, it must be real."
          FORMAT ESSENCE: Reject professional design. Embrace chaos, clutter, and bad lighting. Looks like a mistake.
          STRATEGIC ADAPTATION: Show the "${emotionalVibe}" of the problem without filter.
          ${safety}
        `;
    }

    if (format === CreativeFormat.MEME) {
        return `
          FORMAT ARCHETYPE: "The Inside Joke".
          CORE CONCEPT: "Shared pain is funny."
          FORMAT ESSENCE: Internet culture visual language (Impact font, low-res).
          STRATEGIC ADAPTATION: Visual irony depicting "${parsedAngle.cleanAngle}".
          ${safety}
        `;
    }

    if (format === CreativeFormat.REDDIT_THREAD) {
        return `
          FORMAT ARCHETYPE: "The Anonymous Truth".
          CORE CONCEPT: "What people only say when they are anonymous."
          FORMAT ESSENCE: Dark-mode screenshot of text-heavy forum. Raw honesty.
          STRATEGIC ADAPTATION: Title "${parsedAngle.cleanAngle}" as a shocking confession.
          ${safety}
        `;
    }

    return getSpecificFormatPrompt(ctx);
};

/**
 * NATIVE / SOCIAL FORMATS (Deterministic)
 */
export const getNativeStoryPrompt = (ctx: PromptContext): string => {
    const { format, parsedAngle, enhancer, safety } = ctx;
    const emotionalVibe = getEmotionalContext(ctx);
    const mechanism = getMechanismContext(ctx);

    if (format === CreativeFormat.IG_STORY_TEXT || format === CreativeFormat.STORY_QNA || format === CreativeFormat.STORY_POLL) {
        return `
          FORMAT ARCHETYPE: "The Casual Update".
          CORE CONCEPT: "I'm just checking in with my friends."
          FORMAT ESSENCE: Ephemeral phone capture. Visual is secondary background noise. Interactive element.
          STRATEGIC ADAPTATION: Hook "${parsedAngle.cleanAngle}". Vibe reflects "${emotionalVibe}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.TWITTER_REPOST || format === CreativeFormat.HANDHELD_TWEET) {
        return `
          FORMAT ARCHETYPE: "The Viral Opinion".
          CORE CONCEPT: "This person said what we were all thinking."
          FORMAT ESSENCE: Sharp text statement. Social proof. Intellectual or controversial.
          STRATEGIC ADAPTATION: Tweet body contains "${parsedAngle.cleanAngle}". Grounded in physical world.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.CHAT_CONVERSATION || format === CreativeFormat.DM_NOTIFICATION) {
        return `
          FORMAT ARCHETYPE: "The Leaked DM".
          CORE CONCEPT: "Curiosity about private lives."
          FORMAT ESSENCE: Screenshot of private 1-on-1 convo. Immediate, urgent, unscripted.
          STRATEGIC ADAPTATION: Message "${parsedAngle.cleanAngle}" is breaking news about "${mechanism}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.PHONE_NOTES || format === CreativeFormat.REMINDER_NOTIF) {
        return `
          FORMAT ARCHETYPE: "The Inner Monologue".
          CORE CONCEPT: "Inside my head."
          FORMAT ESSENCE: Digital thoughts. Apple Notes or Lockscreen. Vulnerable.
          STRATEGIC ADAPTATION: Text "${parsedAngle.cleanAngle}" is a realization about "${emotionalVibe}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.UGC_MIRROR) {
        return `
          FORMAT ARCHETYPE: "The Body Check".
          CORE CONCEPT: "Showing progress/struggle."
          FORMAT ESSENCE: First-person mirror selfie. Universal format for health/beauty.
          STRATEGIC ADAPTATION: Confronting "${emotionalVibe}" in mirror. Overlay text "${parsedAngle.cleanAngle}".
          ${enhancer} ${safety}
        `;
    }
    
    if (format === CreativeFormat.SOCIAL_COMMENT_STACK) {
        return `
          FORMAT ARCHETYPE: "The Comment Section War".
          CORE CONCEPT: "Controversy breeds engagement."
          FORMAT ESSENCE: A stack of social media comments overlaid on a blurred relevant video background.
          STRATEGIC ADAPTATION: Show a debate about "${parsedAngle.cleanAngle}".
          ${enhancer} ${safety}
        `;
    }
    
    if (format === CreativeFormat.EDUCATIONAL_RANT) {
        return `
          FORMAT ARCHETYPE: "The Green Screen Rant".
          CORE CONCEPT: "Stop doing this wrong."
          FORMAT ESSENCE: Person speaking passionately in front of a news article or screenshot.
          STRATEGIC ADAPTATION: Pointing at "${parsedAngle.cleanAngle}" evidence.
          ${enhancer} ${safety}
        `;
    }

    return getSpecificFormatPrompt(ctx);
};

/**
 * LEGACY / GENERAL FORMATS (Deterministic Fallback)
 */
export const getSpecificFormatPrompt = (ctx: PromptContext): string => {
    const { format, parsedAngle, enhancer, safety, project } = ctx;
    const emotionalVibe = getEmotionalContext(ctx);
    const mechanism = getMechanismContext(ctx);

    if (format === CreativeFormat.GMAIL_UX) {
        return `
          FORMAT ARCHETYPE: "The Digital Voyeur".
          FORMAT ESSENCE: Private mobile inbox screenshot. Intimate.
          STRATEGIC ADAPTATION: Subject Line "${parsedAngle.cleanAngle}" from "${project.productName}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.CARTOON) {
        return `
          FORMAT ARCHETYPE: "The Visual Fable".
          FORMAT ESSENCE: Simple flat-style illustration. Friendly but deep.
          STRATEGIC ADAPTATION: Journey from pain "${parsedAngle.cleanAngle}" to relief "${mechanism}".
          ${safety}
        `;
    }

    if (format === CreativeFormat.LONG_TEXT) {
        return `
          FORMAT ARCHETYPE: "The Lifestyle Feature".
          FORMAT ESSENCE: High-end editorial design. Vogue/Kinfolk style.
          STRATEGIC ADAPTATION: Headline "${parsedAngle.cleanAngle}" as serious topic.
          ${safety}
        `;
    }

    if (format === CreativeFormat.WHITEBOARD) {
        return `
          FORMAT ARCHETYPE: "The Napkin Explanation".
          FORMAT ESSENCE: Rough handwritten explanation. "Secret" or "Lesson".
          STRATEGIC ADAPTATION: Diagram explaining "${mechanism}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.STICKY_NOTE_REALISM) {
        return `
          FORMAT ARCHETYPE: "The Physical Reminder".
          FORMAT ESSENCE: Bright sticky note in real world. Urgent.
          STRATEGIC ADAPTATION: Note "${parsedAngle.cleanAngle}" placed at source of pain.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.PRESS_FEATURE) {
        return `
          FORMAT ARCHETYPE: "The Social Proof".
          FORMAT ESSENCE: Reputable media outlet screenshot. Authority.
          STRATEGIC ADAPTATION: Headline "${parsedAngle.cleanAngle}" as breaking news.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.US_VS_THEM || format === CreativeFormat.BEFORE_AFTER) {
        return `
          FORMAT ARCHETYPE: "The Binary Choice".
          FORMAT ESSENCE: Strict visual separation. Contrast.
          STRATEGIC ADAPTATION: Gap between "${emotionalVibe}" and "${mechanism}".
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.MECHANISM_XRAY || format === CreativeFormat.BENEFIT_POINTERS) {
        return `
          FORMAT ARCHETYPE: "The Under-the-Hood Look".
          FORMAT ESSENCE: Scientific/Medical visualization. Evidence.
          STRATEGIC ADAPTATION: How "${mechanism}" solves "${parsedAngle.cleanAngle}".
          ${safety}
        `;
    }

    if (format === CreativeFormat.TESTIMONIAL_HIGHLIGHT || format === CreativeFormat.CAROUSEL_TESTIMONIAL) {
        return `
          FORMAT ARCHETYPE: "The Wall of Love".
          FORMAT ESSENCE: Chaotic, overlapping pile of feedback. FOMO.
          STRATEGIC ADAPTATION: Highlighted text "${parsedAngle.cleanAngle}". Viral vibe.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.LEAD_MAGNET_3D) {
        return `
          FORMAT ARCHETYPE: "The Tangible Value".
          FORMAT ESSENCE: Digital file as premium physical object. Thud factor.
          STRATEGIC ADAPTATION: Title "${parsedAngle.cleanAngle}" as exclusive gift.
          ${enhancer} ${safety}
        `;
    }
    
    return `
      FORMAT ARCHETYPE: "The Adaptive Creative".
      STRATEGIC ADAPTATION: Translate emotion "${emotionalVibe}" and concept "${parsedAngle.cleanAngle}" into scene.
      ${enhancer} ${safety}
    `;
};

export const getDefaultPrompt = (ctx: PromptContext): string => {
    return getSpecificFormatPrompt(ctx);
};
