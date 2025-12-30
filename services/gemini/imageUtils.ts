import { ProjectContext, CreativeFormat, MarketAwareness } from "../../types";

export interface ParsedAngle {
    cleanAngle: string;
    context: string;
    isPainFocused: boolean;
    isSolutionFocused: boolean;
    isUrgent: boolean;
}

/**
 * PromptContext yang lebih ramping.
 * Menghilangkan subjectFocus karena adegan utama kini murni dari generateCreativeConcept.
 */
export interface PromptContext {
    project: ProjectContext;
    format: CreativeFormat;
    parsedAngle: ParsedAngle;
    visualScene: string; // Diambil dari generateCreativeConcept
    visualStyle: string; // Diambil dari generateCreativeConcept
    technicalPrompt: string; // Diambil dari generateCreativeConcept
    personaVisuals: string; // Detail lingkungan spesifik persona
    moodPrompt: string;
    culturePrompt: string;
    enhancer: string;
    safety?: string;
    rawPersona?: any;
    embeddedText?: string;
    aspectRatio?: string;
}

/**
 * REFACTOR: Fokus pada parameter teknis iklan, bukan mengatur adegan.
 */
export const getSafetyGuidelines = (isUglyOrMeme: boolean): string => {
  const COMMON_RULES = `
    1. NO Nudity or Sexual content.
    2. NO Medical Gore or overly graphic body fluids.
    3. Humans must look realistic unless specified as cartoon.
  `;

    }

  return `
    ${COMMON_RULES}
    
    5. NO realistic "before/after" split screens that violate platform policies.
  `;
};

/**
 * ENHANCERS: Dipisahkan agar konsisten untuk single image maupun carousel.
 */
export const ENHANCERS = {
    PROFESSIONAL: "High-end commercial photography, 8k, shot on Phase One, studio lighting, clean composition.",
    UGC: "Shot on iPhone, authentic creator vibe, natural home lighting, realistic skin textures, no filters.",
    AUTHENTIC_UGC: "Amateur social media post style, handheld look, non-studio lighting, raw and relatable."
};

/**
/**
 * REFACTOR: Fokus pada 'Lingkungan' dan 'Vibe', bukan blocking kamera.
 * Ini membantu LLM di Concept untuk memperkaya adegan.
 */
export const getPersonaVisualContext = (persona: any): string => {
    const painPoints = (persona.visceralSymptoms || []).join(", ");
    
    // Memberikan LLM daftar "benda/objek" yang relevan dengan penderitaan mereka
    return `
        PERSONA ENVIRONMENT CUES:
        - Visual markers of "${persona.name}": ${painPoints}.
        - Required Elements: Show items associated with the struggle (e.g., if insomnia: unmade bed, digital clock at 3 AM).
        - Demographic Vibe: Match the age-appropriate aesthetic (Gen Z vs Professional).
    `;
};

export const parseAngle = (angle: string): ParsedAngle => {
    const cleanAngle = angle.trim().replace(/^"|"$/g, '');
    const lower = cleanAngle.toLowerCase();
    
    return {
        cleanAngle,
        context: "",
        isPainFocused: /pain|problem|struggle|tired|failed|worst/i.test(lower),
        isSolutionFocused: /fix|solve|cure|relief|trick|hack/i.test(lower),
        isUrgent: /now|today|immediately|urgent/i.test(lower)
    };
};