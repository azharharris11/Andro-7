
import { Type } from "@google/genai";
import { 
  ProjectContext, 
  CreativeFormat, 
  AdCopy, 
  CreativeConcept, 
  GenResult, 
  StoryOption, 
  BigIdeaOption, 
  MechanismOption, 
  LanguageRegister, 
  StrategyMode 
} from "../../types";
import { ai, extractJSON } from "./client";

export const generateSalesLetter = async (
  project: ProjectContext,
  story: StoryOption,
  bigIdea: BigIdeaOption,
  mechanism: MechanismOption,
  hook: string
): Promise<GenResult<string>> => {
  const model = "gemini-3-flash-preview";
  const country = project.targetCountry || "Indonesia";
  
  const prompt = `
    ROLE: Direct Response Copywriter (Long Form / Advertorial Specialist).
    TARGET COUNTRY: ${country}. 
    
    TASK: Write a high-converting Sales Letter (long-form Facebook Ad) in the NATIVE language of ${country}.
    
    STRATEGY STACK (MUST CONNECT ALL DOTS):
    1. HOOK: "${hook}" (The attention grabber).
    2. STORY: "${story.narrative}" (The emotional bridge).
    3. THE SHIFT (Big Idea): "${bigIdea.headline}" - "${bigIdea.concept}" (The new perspective).
    4. THE SOLUTION (Mechanism): "${mechanism.scientificPseudo}" - "${mechanism.ums}" (The specific logic of how it works).
    5. OFFER: ${project.offer} for ${project.productName}.
    
    PRODUCT DETAILS:
    ${project.productDescription}
    
    TONE: Persuasive, storytelling-based, logical yet emotional.
    FORMAT: Markdown. Paragraphs: 1-2 sentences max. Use bolding for emphasis on core benefits.
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
  fullStrategyContext: any, 
  angle: string, 
  format: CreativeFormat
): Promise<GenResult<CreativeConcept>> => {
  const model = "gemini-3-flash-preview";
  const strategyMode = project.strategyMode || StrategyMode.DIRECT_RESPONSE;
  
  // Robust Extraction for Context
  const persona = fullStrategyContext || {};
  const personaPain = persona.visceralSymptoms ? persona.visceralSymptoms.join(", ") : "General frustration";
  const mech = fullStrategyContext?.mechanismData;
  const bigIdea = fullStrategyContext?.bigIdeaData;

  // DYNAMIC STRATEGY DIRECTION
  let strategyInstruction = "";
  if (strategyMode === StrategyMode.HARD_SELL) {
      strategyInstruction = `
        **PRIORITY: CONVERSION & OFFER**
        - Visual: "Hero Shot" of ${project.productName}. High quality, clean, trustworthy.
        - Tone: Urgent, direct, promotional.
        - Override: If format is 'Ugly', maintain the low-fi vibe but the PRODUCT must remain the clear hero.
      `;
  } else if (strategyMode === StrategyMode.VISUAL_IMPULSE) {
      strategyInstruction = `
        **PRIORITY: AESTHETIC & DESIRE**
        - Visual: Aspirational, Pinterest-style, lifestyle focus.
        - Tone: Minimalist, "cool", identity-driven.
              `;
  } else {
      strategyInstruction = `
        **PRIORITY: PATTERN INTERRUPT (Direct Response)**
        - Visual: Start with the PROBLEM/PAIN. Show a relatable human moment.
        - Tone: Empathetic, raw, "Stop the scroll" energy.
      `;
  }

  const prompt = `
    # Role: Creative Director (Meta Ads Specialist)

    **CONTEXT:**
    Strategy Mode: ${strategyMode}
    Format: ${format}
    Target Country: ${project.targetCountry}

    **STRATEGIC GUIDELINES:**
    ${strategyInstruction}

    **CORE INPUTS:**
    Product: ${project.productName} - ${project.productDescription}
    Winning Insight: ${angle}
    Mechanism Logic: ${mech?.ums || "Standard benefit"}
    
    **PERSONA DATA:**
    Who: ${persona.name || "Target User"}
    Symptoms: ${personaPain}
    
    **TASK:** 
    1. Create a visual scene that proves the text is true (Congruence).
    2. Define visual style, lighting, and mood.
    3. Ensure 'copyAngle' provides a clear transition for the caption writer.

    **OUTPUT JSON REQUIREMENTS:**
    - visualScene: Specific action/setup.
    - visualStyle: Camera type, lighting, mood.
    - copyAngle: The strategic "Hook" for the copywriter.
    - rationale: Strategic reason why this hooks the persona.
    - congruenceRationale: Why the image supports the specific claim.
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
          // technicalPrompt Removed
          copyAngle: { type: Type.STRING },
          rationale: { type: Type.STRING },
          congruenceRationale: { type: Type.STRING }
        },
        required: ["visualScene", "visualStyle", "copyAngle", "rationale", "congruenceRationale"]
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
  fullStrategyContext: any, 
  concept: CreativeConcept,
  angle: string, 
  format: CreativeFormat = CreativeFormat.UGLY_VISUAL,
  isHVCOFlow: boolean = false,
  mechanism?: MechanismOption
): Promise<GenResult<AdCopy>> => {
  const model = "gemini-3-flash-preview";
  const country = project.targetCountry || "Indonesia";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const strategyMode = project.strategyMode || StrategyMode.DIRECT_RESPONSE;

  const persona = fullStrategyContext || {};
  const story = fullStrategyContext?.storyData;
  const bigIdea = fullStrategyContext?.bigIdeaData;

  let strategyGuide = "";
  if (strategyMode === StrategyMode.VISUAL_IMPULSE) {
      strategyGuide = `Sell the VIBE and IDENTITY. Short, minimalist, confident. Avoid "Pain" language.`;
  } else if (strategyMode === StrategyMode.HARD_SELL) {
      strategyGuide = `Sell the OFFER and URGENCY. Scarcity-driven. Focus on the deal.`;
  } else {
      strategyGuide = `Sell the LOGIC & EMOTION. Use the persona's Visceral Symptoms: ${persona.visceralSymptoms?.join(', ')}. Mention the mechanism benefit: ${mechanism?.ums || ""}.`;
  }

  const prompt = `
    # ROLE: Social Media Copywriter (Direct Response Expert)
    
    **INPUTS:**
    Target Country: ${country} (Write in NATIVE language)
    Register: ${register}
    Visual Concept: ${concept.visualScene}
    Winning Hook: ${angle}
    
    **STRATEGY:**
    ${strategyGuide}
    
    **CONTEXT:**
    ${story ? `Narrative Context: ${story.narrative}` : ''}
    ${bigIdea ? `Big Idea Shift: ${bigIdea.concept}` : ''}

    **FORMAT RULES:**
    ${format === CreativeFormat.MEME || format === CreativeFormat.UGLY_VISUAL ? '1 sentence, sarcastic/raw.' : 'Structure: Hook -> Body -> CTA.'}
    
    **TASK:** Write the Caption and Headline.
    **CRITICAL:** Caption must be CONGRUENT with the visual concept: "${concept.visualScene}".

    **OUTPUT JSON:**
    {
      "primaryText": "Caption copy in native language",
      "headline": "Scroll-stopping headline (Max 7 words)",
      "cta": "Action text (e.g. 'Coba Sekarang', 'Shop Now')"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 1.0, 
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
