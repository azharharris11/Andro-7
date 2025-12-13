
import { ProjectContext, CreativeFormat, MarketAwareness } from "../../types";

export interface ParsedAngle {
    cleanAngle: string;
    context: string;
    isPainFocused: boolean;
    isSolutionFocused: boolean;
    isUrgent: boolean;
}

export interface PromptContext {
    project: ProjectContext;
    format: CreativeFormat;
    parsedAngle: ParsedAngle;
    visualScene: string;
    visualStyle: string;
    technicalPrompt: string;
    textCopyInstruction: string;
    personaVisuals: string;
    moodPrompt: string;
    culturePrompt: string;
    subjectFocus: string;
    enhancer: string;
    safety?: string;
    
    // NEW: Deep Context for AI Prompt Writer
    fullStoryContext?: {
        story?: any;
        bigIdea?: any;
        mechanism?: any;
    };
    embeddedText?: string;
    
    // Fixes for "Lost Memory"
    congruenceRationale?: string;
    aspectRatio?: string;
}

export const getSafetyGuidelines = (isUglyOrMeme: boolean): string => {
  const COMMON_RULES = `
    1. NO Nudity or Sexual content.
    2. NO Medical Gore or overly graphic body fluids.
    3. If humans are shown, they must look generally realistic (unless specified as cartoon/drawing).
  `;

  if (isUglyOrMeme) {
    return `
      SAFETY GUIDELINES (RELAXED FOR MEMES/UGLY ADS):
      ${COMMON_RULES}
      4. EXCEPTION: Low quality, pixelated, "broken" aesthetics, MS Paint drawings, and amateur editing are ALLOWED and REQUIRED for this format.
      5. EXCEPTION: Glitchy text or impact font overlays are ALLOWED.
    `;
  }

  return `
    SAFETY GUIDELINES (STRICT PROFESSIONAL):
    ${COMMON_RULES}
    4. NO Glitchy text.
    5. NO "Before/After" split screens that show unrealistic body transformations.
    6. Images must be high quality and strictly adhere to ad platform policies.
  `;
};

export const ENHANCERS = {
    PROFESSIONAL: "Photorealistic, 8k resolution, highly detailed, shot on 35mm lens, depth of field, natural lighting, sharp focus.",
    UGC: "Shot on iPhone 15, raw photo, realistic skin texture, authentic amateur photography, slightly messy background, no bokeh, everything in focus (deep depth of field).",
    AUTHENTIC_UGC: `
      STYLE: Authentic User Generated Content (UGC).
      - Shot on iPhone, slightly wide angle.
      - Lighting: Natural indoor lighting or standard room light (No studio lights).
      - Focus: Sharp and clear focus on the subject/text (NO motion blur).
      - Composition: Centered and clear, easy to understand at a glance.
      - Vibe: Looks like a regular person posted this on their story.
      - NOT aesthetic, but NOT broken. Just real.
    `
};

export const getCulturePrompt = (country: string = "USA"): string => {
    const c = country.toLowerCase();
    
    if (c.includes('indonesia')) {
        return `
            INDONESIAN CONTEXT (CRITICAL):
            - Models: Indonesian ethnicity (Native), Southeast Asian features.
            - Environment: Tropical vibes, ceramic tile floors, slightly cluttered aesthetics, rattan furniture, or modern minimalist Jakarta apartments.
            - Street Details: If outdoors, show tropical plants, motorbikes (scooters like Honda Beat), or subtle "Warung" vibes in background.
            - Lighting: Warm, humid tropical light.
            - Clothing: Casual modest wear.
        `;
    }
    
    if (c.includes('usa') || c.includes('united states') || c.includes('america')) {
        return `
            US CONTEXT:
            - Models: Diverse American demographics.
            - Environment: Suburban homes (carpet/hardwood), open plan kitchens, or urban brick exposed apartments.
            - Street Details: Pickup trucks, SUVs, wider streets, US-style electrical outlets if visible.
            - Lighting: Clean daylight or cinematic indoor warmth.
        `;
    }

    return `Target Country: ${country}. Adapt visual cues (plugs, architecture, ethnicity) to be authentic to this region.`;
};

export const getPersonaVisualContext = (persona: any, angle: string): string => {
    const age = persona.age || 25;
    const pain = (persona.visceralSymptoms || []).join(", ");
    
    // MAP PAIN TO VISUAL PROPS
    const painToVisuals: Record<string, string> = {
        'insomnia': 'Unmade bed, blackout curtains, melatonin bottles on nightstand, phone showing 3:47 AM',
        'sleep': 'Unmade bed, blackout curtains, melatonin bottles on nightstand, phone showing 3:47 AM',
        'back pain': 'Heating pad on couch, pain relief cream, awkward sitting posture, lumbar pillow',
        'acne': 'Bathroom counter cluttered with skincare products, tissue with makeup removal, mirror avoidance',
        'skin': 'Bathroom counter cluttered with skincare products, tissue with makeup removal, mirror avoidance',
        'anxiety': 'Bitten nails, fidgeting hands, messy notes, coffee cups everywhere',
        'weight': 'Old gym membership card, unopened salad in fridge, scale in corner',
        'fat': 'Old gym membership card, unopened salad in fridge, scale in corner',
        'brain fog': 'Sticky notes everywhere, half-finished tasks, coffee addiction visible',
        'chronic fatigue': 'Messy unmade bed, curtains closed at noon, energy drink cans',
        'tired': 'Messy unmade bed, curtains closed at noon, energy drink cans',
    };
    
    let environmentalCues = "";
    const contextText = (pain + " " + angle).toLowerCase();
    
    for (const [key, visual] of Object.entries(painToVisuals)) {
        if (contextText.includes(key)) {
            environmentalCues = `Environmental Props: ${visual}`;
            break;
        }
    }
    
    if (!environmentalCues) {
        environmentalCues = `Environmental Props: Clutter related to "${pain}" (e.g. failed solution products, medical paperwork, messy workspace)`;
    }
    
    let ageStyle = "";
    if (age < 26) {
        ageStyle = `Gen Z Aesthetic: LED lights, ring light selfies, messy 'photo dump' vibe, flash photography, mirrors, posters on wall, charging cables everywhere.`;
    } else if (age < 42) {
        ageStyle = `Millennial Aesthetic: House plants (pothos, monstera), minimalist but lived-in, 'Instagrammable' aesthetic, clean chaos, muted tones, reusable water bottle visible.`;
    } else {
        ageStyle = `Gen X / Boomer Aesthetic: Clean, functional spaces, traditional furniture, family photos on walls, organized but not trendy, good overhead lighting.`;
    }

    const identity = persona.profile || persona.name || "Target User";

    return `
        PERSONA VISUAL IDENTITY:
        - WHO: ${identity} (Age: ${age})
        - PAIN: "${pain}"
        - ${environmentalCues}
        - AESTHETIC: ${ageStyle}
        
        CRITICAL: The environment MUST visually communicate the pain without text.
    `;
};

export const parseAngle = (angle: string): ParsedAngle => {
    // Legacy support: Just clean quotes if any
    const cleanAngle = angle.trim().replace(/^"|"$/g, '');
    const context = ""; // Context is now passed via Object, not string injection
    
    const lower = cleanAngle.toLowerCase();
    
    return {
        cleanAngle,
        context,
        isPainFocused: /pain|problem|struggle|suffering|hate|tired|sick|failed|stop|avoid|mistake|worst/i.test(lower),
        isSolutionFocused: /fix|solve|cure|relief|solution|trick|hack|method|system|easy/i.test(lower),
        isUrgent: /now|today|immediately|urgent|warning|alert|fast/i.test(lower)
    };
};

export const getSubjectFocus = (
    marketAwareness: MarketAwareness,
    personaVisuals: string,
    parsedAngle: ParsedAngle,
    project: ProjectContext
): string => {
    const { cleanAngle } = parsedAngle;
    const lowerAngle = cleanAngle.toLowerCase();
    
    switch (marketAwareness) {
        case MarketAwareness.UNAWARE:
            let specificScene = "";
            
            if (/sleep|insomnia|tired|exhausted/i.test(lowerAngle)) {
                specificScene = `
                    SCENE BLOCKING:
                    - CAMERA ANGLE: POV from pillow looking up at person lying in bed
                    - TIME: Phone screen shows 3:47 AM (Make this visible)
                    - PERSON: Eyes wide open, staring at ceiling, one hand on forehead (frustrated gesture)
                    - LIGHTING: Only light source is phone screen glow (blue light)
                    - ENVIRONMENT: Messy sheets, pillow on floor, blackout curtains
                    - EMOTION: Defeated exhaustion (NOT peaceful sleep)
                `;
            } else if (/pain|ache|sore|hurt|back|neck/i.test(lowerAngle)) {
                specificScene = `
                    SCENE BLOCKING:
                    - CAMERA ANGLE: Side profile or 3/4 view
                    - ACTION: Person wincing while trying to stand up from chair, one hand on lower back/neck
                    - BODY LANGUAGE: Slight hunch, grimace on face, slow careful movement
                    - ENVIRONMENT: Home office or living room, heating pad visible on couch
                    - PROPS: Pain relief cream on table, used but ineffective
                `;
            } else if (/acne|skin|blemish|breakout|wrinkle/i.test(lowerAngle)) {
                specificScene = `
                    SCENE BLOCKING:
                    - LOCATION: Bathroom, morning light
                    - ACTION: Person looking in mirror, face turned away from reflection (avoidance), touching problem area gently
                    - EMOTION: Frustrated, insecure
                    - PROPS: Skincare products lined up (visual "graveyard"), tissue box, makeup removal wipes
                    - LIGHTING: Harsh bathroom light showing skin texture clearly
                `;
            } else if (/fat|weight|diet|belly/i.test(lowerAngle)) {
                 specificScene = `
                    SCENE BLOCKING:
                    - LOCATION: Bedroom or Bathroom
                    - ACTION: Person standing on a scale, looking down with disappointment, or pinching belly fat
                    - EMOTION: Frustrated, insecure
                    - PROPS: Scale, old gym clothes
                 `;
            } else {
                specificScene = `
                    SCENE BLOCKING:
                    - CAPTURE: A specific moment of frustration related to "${cleanAngle}"
                    - PERSON: Showing clear negative emotion (furrowed brow, slumped shoulders, hands covering face)
                    - ENVIRONMENT: Cluttered with signs of struggle
                    - TIMING: "Rock bottom" moment
                `;
            }
            
            return `
                ${personaVisuals}
                MARKET AWARENESS: UNAWARE (Problem-focused, NO PRODUCT)
                ${specificScene}
                
                CRITICAL RULES:
                - DO NOT show the product or solution
                - DO NOT show relief or happiness
                - Focus on the PAIN, not the cure
                - This is the "Before" state
            `;
            
        case MarketAwareness.PROBLEM_AWARE:
            return `
                ${personaVisuals}
                MARKET AWARENESS: PROBLEM AWARE
                
                SCENE BLOCKING:
                - CONCEPT: "The Graveyard of Failed Solutions"
                - VISUAL: Wide shot of table/counter covered with OLD products that didn't work
                - PRODUCTS: Show 5-7 half-used bottles, pills, supplements (DO NOT show ${project.productName})
                - PERSON: In background, arms crossed, looking skeptical/fed up
                - PROPS: Receipts, empty boxes, instruction manuals (signs of wasted money)
                - MOOD: Cynical, defeated, "I've tried everything"
                
                CRITICAL: This shows they KNOW the problem but haven't found the right solution yet.
            `;
            
        case MarketAwareness.SOLUTION_AWARE:
            return `
                ${personaVisuals}
                MARKET AWARENESS: SOLUTION AWARE
                
                SCENE BLOCKING:
                - CONCEPT: "Old Way vs New Way" comparison
                - SPLIT SCREEN or BEFORE/AFTER setup
                - LEFT/BEFORE: Old solution failing (e.g. person still in pain while using competitor)
                - RIGHT/AFTER: New mechanism working (e.g. person relieved, showing ${project.productName})
                - VISUAL CONTRAST: Use color grading (grey/blue for old, warm/golden for new)
            `;
            
        case MarketAwareness.PRODUCT_AWARE:
        case MarketAwareness.MOST_AWARE:
            return `
                MARKET AWARENESS: MOST AWARE (Offer-focused)
                
                SCENE BLOCKING:
                - CONCEPT: "Product Hero Shot + Value Stack"
                - CAMERA: Overhead flat lay OR product held in hand at eye level
                - MAIN SUBJECT: ${project.productName} (3 bottles if "Buy 2 Get 1" offer)
                - SUPPORTING PROPS: Free bonuses (ebook, guide) shown as physical items
                - OVERLAY TEXT: "LIMITED TIME: Buy 2 Get 1 FREE" in bold
                - BACKGROUND: Clean, uncluttered, premium surface (marble or wood)
                - LIGHTING: Professional product photography lighting
                
                CRITICAL: This is about the OFFER, not the problem. Show abundance and value.
            `;
            
        default:
            return `${personaVisuals} SUBJECT: High context visual related to ${cleanAngle}.`;
    }
};
