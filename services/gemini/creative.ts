
import { Type } from "@google/genai";
import { ProjectContext, CreativeFormat, AdCopy, CreativeConcept, GenResult, StoryOption, BigIdeaOption, MechanismOption, MarketAwareness, LanguageRegister, StrategyMode } from "../../types";
import { ai, extractJSON } from "./client";

export const generateSalesLetter = async (
  project: ProjectContext,
  story: StoryOption,
  bigIdea: BigIdeaOption,
  mechanism: MechanismOption,
  hook: string
): Promise<GenResult<string>> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    ROLE: Direct Response Copywriter (Long Form / Advertorial Specialist).
    
    TASK: Write a high-converting Sales Letter (or long-form Facebook Ad) that connects all the strategic dots.
    
    STRATEGY STACK:
    1. HOOK: "${hook}" (Grab attention).
    2. STORY: "${story.narrative}" (Emotional Connection/Empathy).
    3. THE SHIFT (Big Idea): "${bigIdea.headline}" - "${bigIdea.concept}" (Destroys old belief).
    4. THE SOLUTION (Mechanism): "${mechanism.scientificPseudo}" - "${mechanism.ums}" (The new logic).
    5. OFFER: ${project.offer} for ${project.productName}.
    
    PRODUCT DETAILS:
    ${project.productDescription}
    
    TONE: Persuasive, storytelling-based, logical yet emotional.
    FORMAT: Markdown. Use bolding for emphasis. Keep paragraphs short (1-2 sentences).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return {
    data: response.text || "",
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateCreativeConcept = async (
  project: ProjectContext, 
  fullStrategyContext: any, // Accepted properly now
  angle: string, 
  format: CreativeFormat
): Promise<GenResult<CreativeConcept>> => {
  const model = "gemini-2.5-flash";

  const awareness = project.marketAwareness || "Problem Aware";
  const strategyMode = project.strategyMode || StrategyMode.DIRECT_RESPONSE;
  
  // Extract Strategy Data safely
  const persona = fullStrategyContext || {};
  const story = fullStrategyContext?.storyData;
  const mech = fullStrategyContext?.mechanismData;
  const bigIdea = fullStrategyContext?.bigIdeaData;

  let strategyInstruction = "";

  if (strategyMode === StrategyMode.VISUAL_IMPULSE) {
      strategyInstruction = `
        STRATEGY MODE: VISUAL IMPULSE (Lifestyle/Aesthetic).
        - DO NOT visualize "Pain" or "Struggle".
        - FOCUS on: Desire, Status, Vibe, Texture, Satisfaction.
        - The visual must look like a Pinterest Moodboard or High-End Editorial.
        - Avoid "Marketing Graphics". Make it look artful.
      `;
  } else if (strategyMode === StrategyMode.HARD_SELL) {
      strategyInstruction = `
        STRATEGY MODE: HARD SELL (Promo).
        - FOCUS on: The Product, The Offer, The Urgency.
        - Visuals should be loud, clear, and product-focused.
      `;
  } else {
      // Direct Response (Default)
      strategyInstruction = `
        STRATEGY MODE: DIRECT RESPONSE (Scientific/Story).
        - FOCUS on: Pattern Interrupts, Visualizing the Problem (Pain), and the Mechanism.
        - Visuals should stop the scroll by being weird, gross, or highly relatable.
      `;
  }

  // Extract detailed persona info if available
  const personaIdentity = persona.profile || persona.name || "User";
  const personaPain = persona.visceralSymptoms ? persona.visceralSymptoms.join(", ") : "General frustration";

  const prompt = `
    # Role: Creative Director (The Pattern Interrupt Specialist)

    **SABRI SUBY'S "ANTI-COMPETITOR" RULE:**
    1. Imagine the "Standard Boring Ad" for this industry.
    2. THROW IT IN THE TRASH.
    3. Do the EXACT OPPOSITE.
    
    **INPUTS:**
    Product Name: ${project.productName}
    Product Description: ${project.productDescription}
    Winning Insight (Hook): ${angle}
    Format: ${format}
    Context: ${project.targetCountry}
    
    ${strategyInstruction}
    
    **STRATEGIC CONTEXT (USE THIS LOGIC):**
    ${mech ? `Mechanism Action: ${mech.ums}` : ''}
    ${bigIdea ? `Concept Shift: ${bigIdea.concept}` : ''}
    
    **PERSONA CONTEXT (CRITICAL):**
    Who: ${personaIdentity}
    Pain: ${personaPain}
    *Ensure the visual scene reflects THIS specific person's life.*
    
    **CRITICAL FOR FORMAT '${format}':**
    *   If 'IG Story Text Overlay': Leave ample "Negative Space" for text.
    *   If 'Ugly Visual': Describe a chaotic, low-fidelity scene.

    **TASK:**
    Create a concept that VIOLATES the expectations of the feed.
    
    **OUTPUT REQUIREMENTS (JSON):**
    1. **visualScene**: The Director's Note. Specific action.
    2. **visualStyle**: Aesthetic vibe (e.g. "Disposable Camera", "Cinematic", "Candid").
    3. **technicalPrompt**: Strict prompt for Image Gen.
    4. **copyAngle**: Strategy for the copywriter.
    5. **rationale**: Why this works.
    6. **congruenceRationale**: Why the image proves the text.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualScene: { type: Type.STRING },
          visualStyle: { type: Type.STRING },
          technicalPrompt: { type: Type.STRING },
          copyAngle: { type: Type.STRING },
          rationale: { type: Type.STRING },
          congruenceRationale: { type: Type.STRING },
          hookComponent: { type: Type.STRING },
          bodyComponent: { type: Type.STRING },
          ctaComponent: { type: Type.STRING }
        },
        required: ["visualScene", "visualStyle", "technicalPrompt", "copyAngle", "rationale", "congruenceRationale"]
      }
    }
  });

  return {
    data: extractJSON(response.text || "{}"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateAdCopy = async (
  project: ProjectContext, 
  fullStrategyContext: any, // Contains Persona + Story + Mech
  concept: CreativeConcept,
  angle: string, 
  format: CreativeFormat = CreativeFormat.UGLY_VISUAL,
  isHVCOFlow: boolean = false,
  mechanism?: MechanismOption
): Promise<GenResult<AdCopy>> => {
  const model = "gemini-2.5-flash";
  const country = project.targetCountry || "USA";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const awareness = project.marketAwareness || "Problem Aware";
  const strategyMode = project.strategyMode || StrategyMode.DIRECT_RESPONSE;

  // Extract Context
  const persona = fullStrategyContext || {};

  // --- 1. STRATEGY MODE OVERRIDE (Fixing "Amnesia") ---
  let strategyGuide = "";
  
  if (strategyMode === StrategyMode.VISUAL_IMPULSE) {
      strategyGuide = `
        *** STRATEGY MODE: VISUAL IMPULSE / AESTHETIC ***
        - FORBIDDEN: Do not use the "Problem-Agitate-Solution" framework.
        - FORBIDDEN: Do not sound like a doctor or a salesman.
        - GOAL: Sell the VIBE, the LOOK, and the IDENTITY.
        - STYLE: Minimalist, cool, confident.
        - STRUCTURE: Short Hook -> Aesthetic Benefit -> Link.
        - EXAMPLE: "The only jacket you need this winter." (Not "Are you cold? Buy this.")
      `;
  } else if (strategyMode === StrategyMode.HARD_SELL) {
      strategyGuide = `
        *** STRATEGY MODE: HARD SELL / PROMO ***
        - GOAL: Urgent Conversion.
        - STYLE: Loud, direct, scarcity-driven.
        - KEYWORDS: "50% Off", "Ending Soon", "Restock Alert".
        - Don't tell a story. Just tell them the deal.
      `;
  } else {
      strategyGuide = `
        *** STRATEGY MODE: DIRECT RESPONSE (Scientific/Story) ***
        - GOAL: Educate and persuade via Logic + Emotion.
        - STYLE: Empathetic, insightful, slightly controversial.
        - FRAMEWORK: Hook -> Story/Pain -> Mechanism Reveal -> Offer.
        - Use the specific 'Visceral Symptoms' of the persona.
      `;
  }

  // --- 2. DYNAMIC TONE & LANGUAGE LOGIC ---
  let toneInstruction = "";
  
  if (register.includes("Street/Slang")) {
      toneInstruction = `
        LANGUAGE TARGET: Native Slang/Street Language of ${country}.
        - STYLE: Informal, raw, gen-z, social media native.
        - IF INDONESIA: Use 'Gue/Lo', 'Banget', 'Sumpah', 'Jujurly'.
        - VIBE: Bestie sharing a secret.
      `;
  } else if (register.includes("Formal/Professional")) {
      toneInstruction = `
        LANGUAGE TARGET: Formal/Professional Native Language of ${country}.
        - STYLE: Respectful, articulate, trustworthy.
        - VIBE: Consultant or Expert.
      `;
  } else {
      toneInstruction = `
        LANGUAGE TARGET: Casual/Conversational Native Language of ${country}.
        - STYLE: Friendly, warm, easy to read.
        - VIBE: Friendly neighbor or Mom blogger.
      `;
  }

  // --- 3. FORMAT STYLE GUIDE ---
  let formatStyleGuide = "";
  switch (format) {
      case CreativeFormat.TWITTER_REPOST:
      case CreativeFormat.HANDHELD_TWEET:
          formatStyleGuide = `FORMAT: TWEET. Max 280 chars. Cynical, funny, or "hot take". Lowercase aesthetic.`;
          break;
      case CreativeFormat.MEME:
      case CreativeFormat.UGLY_VISUAL:
          formatStyleGuide = `FORMAT: MEME CAPTION. 1 sentence. Sarcastic. "It be like that."`;
          break;
      case CreativeFormat.IG_STORY_TEXT:
          formatStyleGuide = `FORMAT: IG STORY. Super short. "Tap for details".`;
          break;
      default:
          formatStyleGuide = `FORMAT: FEED POST. Clear hook, valuable body, clear CTA.`;
          break;
  }

  // --- 4. THE PROMPT ---
  const prompt = `
    # ROLE: Viral Social Media Copywriter.
    
    **YOUR ENEMY:** "Boring Marketing Copy".
    
    **INPUT CONTEXT:**
    Product: ${project.productName}
    Angle/Hook: "${angle}"
    Creative Concept: "${concept.copyAngle}"
    Visual Scene: "${concept.visualScene}"
    
    **PERSONA:**
    Name: ${persona.name}
    Pain: ${persona.visceralSymptoms ? persona.visceralSymptoms.join(', ') : 'N/A'}
    
    **STRATEGY SETTINGS (OBEY STRICTLY):**
    ${strategyGuide}
    
    **LANGUAGE SETTINGS:**
    ${toneInstruction}
    **CRITICAL: Write in the NATIVE language of ${country}.**
    
    **FORMAT SETTINGS:**
    ${formatStyleGuide}
    
    **MECHANISM RULE:**
    ${mechanism ? `Hint at the mechanism "${mechanism.scientificPseudo}" but focus on the BENEFIT (${mechanism.ums}).` : ''}

    **TASK:** Write the Instagram/TikTok Caption & Headline.

    **OUTPUT JSON:**
    {
      "primaryText": "The caption/body copy.",
      "headline": "The image headline (Max 7 words)",
      "cta": "Button text (e.g. 'Shop Now', 'Learn More')"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 1.1, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryText: { type: Type.STRING },
          headline: { type: Type.STRING },
          cta: { type: Type.STRING }
        },
        required: ["primaryText", "headline", "cta"]
      }
    }
  });

  return {
    data: extractJSON(response.text || "{}"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};
