
import { Type } from "@google/genai";
import { ProjectContext, GenResult, StoryOption, BigIdeaOption, MechanismOption, HVCOOption, MafiaOffer, LanguageRegister, MarketAwareness, StrategyMode } from "../../types";
import { ai, extractJSON } from "./client";

// Shared Helper (Duplicate logic for now to keep files independent, or import from utils if available)
const getLanguageInstruction = (country: string, register: LanguageRegister): string => {
    const isIndo = country?.toLowerCase().includes("indonesia");
    
    if (!isIndo) return `LANGUAGE: Native language of ${country} (e.g., English for USA).`;

    if (register === LanguageRegister.SLANG) {
        return `LANGUAGE: Bahasa Indonesia (Gaul/Slang). Use 'Gue/Lo', 'Banget', 'Valid'.`;
    } else if (register === LanguageRegister.PROFESSIONAL) {
        return `LANGUAGE: Bahasa Indonesia (Formal). Use 'Anda', 'Solusi'.`;
    } else {
        return `LANGUAGE: Bahasa Indonesia (Casual). Use 'Aku/Kamu'.`;
    }
};

export const auditHeadlineSabri = async (headline: string, audience: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Role: Sabri Suby (Ruthless Copy Editor).
    
    Task: Rate this headline based on the 4 U's:
    1. Urgent (Why now?)
    2. Unique (Have I heard this before?)
    3. Ultra-Specific (Does it use numbers/names?)
    4. Useful (What's in it for me?)
    
    Headline: "${headline}"
    Target Audience: ${audience}
    
    Output: A short, harsh critique (max 2 sentences) and a Score /10. 
    If score < 7, rewrite it to be better.
  `;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });
  
  return response.text || "Audit failed.";
};

export const generateMafiaOffer = async (project: ProjectContext): Promise<GenResult<MafiaOffer>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);
  
  const prompt = `
    ROLE: Sabri Suby (Offer Architect).
    
    CONTEXT:
    Product: ${project.productName}
    Product Description (WHAT IT IS & HOW IT WORKS): ${project.productDescription}
    Current Offer: ${project.offer}
    Target Audience: ${project.targetAudience}
    
    TASK:
    Transform the boring current offer into a "MAFIA OFFER" (An offer they can't refuse).
    The offer must feel valuable based on the ACTUAL PRODUCT VALUE described above.
    
    FORMULA:
    1. BOLD PROMISE: Specific outcome with a timeline (Quantified End Result).
    2. VALUE STACK: Add bonuses that handle objections (e.g., "Free Meal Plan", "24/7 Support"). Assign a fake $$$ value to each.
    3. RISK REVERSAL: A crazy guarantee (e.g., "If you don't like it, I'll pay you $100").
    4. SCARCITY: A reason to act now.
    
    EXAMPLE:
    Boring: "Hire our agency."
    Mafia: "We will double your leads in 90 days or we work for FREE until we do. Plus, get our $2k Audit Script as a bonus."
    
    ${langInstruction}
    **CRITICAL: Output 'headline', 'valueStack', 'riskReversal', 'scarcity' in the Target Language defined above. Do NOT output English.**

    OUTPUT JSON:
    {
        "headline": "The 1-Sentence Mafia Hook (In Target Language)",
        "valueStack": ["Bonus 1 ($Val)", "Bonus 2 ($Val)", "Bonus 3 ($Val)"],
        "riskReversal": "The 'Sleep Like A Baby' Guarantee",
        "scarcity": "Why it expires soon"
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          valueStack: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskReversal: { type: Type.STRING },
          scarcity: { type: Type.STRING }
        },
        required: ["headline", "valueStack", "riskReversal"]
      }
    }
  });

  return {
      data: extractJSON<MafiaOffer>(response.text || "{}"),
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateBigIdeas = async (project: ProjectContext, story: StoryOption): Promise<GenResult<BigIdeaOption[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);

  const prompt = `
    ROLE: Direct Response Strategist (Big Idea Developer)
    
    CONTEXT:
    We are targeting a user who connects with this story: "${story.title}" (${story.narrative}).
    
    PRODUCT TRUTH:
    Product Name: ${project.productName}
    Product Description (THE MECHANISM): ${project.productDescription}
    
    TASK:
    Generate 3 "Big Ideas" (New Opportunities) that bridge this story to our SPECIFIC solution.
    A Big Idea is NOT a benefit. It is a new way of looking at the problem.
    
    CRITICAL CONSTRAINT: 
    The "New Opportunity" must actually be related to how the product works (${project.productDescription}).
    Do not invent a mechanism that doesn't exist in the description.
    
    EXAMPLE:
    Story: "I diet but don't lose weight."
    Product Truth: A probiotic supplement.
    Big Idea: "It's not your willpower, it's your gut biome diversity." (Shift blame -> Matches Product).
    
    ${langInstruction}
    **CRITICAL: Write the 'headline', 'concept', and 'targetBelief' in the Target Language defined above. Do NOT output English.**

    OUTPUT JSON:
    - headline: The Big Idea Statement.
    - concept: Explanation of the shift.
    - targetBelief: What old belief are we destroying?
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            headline: { type: Type.STRING },
            concept: { type: Type.STRING },
            targetBelief: { type: Type.STRING }
          },
          required: ["headline", "concept", "targetBelief"]
        }
      }
    }
  });

  const ideas = extractJSON<any[]>(response.text || "[]");
  return {
    data: ideas.map((s, i) => ({ ...s, id: `idea-${i}` })),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateMechanisms = async (project: ProjectContext, bigIdea: BigIdeaOption): Promise<GenResult<MechanismOption[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);
  
  // DYNAMIC STRATEGY ADJUSTMENT
  const isSimpleProduct = project.strategyMode === StrategyMode.VISUAL_IMPULSE || project.strategyMode === StrategyMode.HARD_SELL;
  
  let taskInstruction = "";
  
  if (isSimpleProduct) {
      // FOR SIMPLE PRODUCTS (Fashion, Food, Simple Gadgets)
      taskInstruction = `
        **MODE: VISUAL/IMPULSE PRODUCT (Non-Scientific)**
        The user is selling a product like Food, Fashion, or Decor. 
        DO NOT invent a fake scientific mechanism like "Bio-Weave Protocol". That sounds fake.
        
        INSTEAD, Focus on the "SENSORY LOGIC" or "QUALITY FEATURE":
        1. UMP (The Problem): Why do cheap alternatives suck? (e.g. "Cotton shrinks", "Soggy crust").
        2. UMS (The Solution): What is the specific feature here? (e.g. "Pre-shrunk comb cotton", "Double-fried technique").
        3. MECHANISM NAME: Give it a descriptive name (e.g. "Signature Crunch", "Stay-Fit Fabric").
      `;
  } else {
      // FOR COMPLEX PRODUCTS (Supplements, SaaS, Skincare) - DEFAULT
      taskInstruction = `
        **MODE: DEEP DIVE / SCIENTIFIC**
        1. UMP (The Real Villain): Why do standard solutions fail? What is the biological/technical root cause?
        2. UMS (The New Hero): How does THIS product solve the UMP? Be specific about ingredients/tech.
        3. MECHANISM NAME (The Wrapper): Give the UMS a proprietary name (e.g. "Dual-Action Weave", "Micro-Encapsulation").
      `;
  }

  const prompt = `
    ROLE: World-Class Direct Response Product Developer.
    
    CONTEXT:
    Big Idea: ${bigIdea.headline}
    Product Name: ${project.productName}
    
    *** PRODUCT SOURCE OF TRUTH (READ THIS CAREFULLY) ***: 
    ${project.productDescription}
    
    ${langInstruction}
    
    TASK:
    Define the UMP (Unique Mechanism of Problem) and UMS (Unique Mechanism of Solution).
    This gives the "Logic" to the "Magic".
    
    ${taskInstruction}
    
    **CRITICAL: The 'Scientific Pseudo Name' (Headline) must be DESCRIPTIVE of the physical product.**
    
    OUTPUT JSON (3 Variants):
    - ump: The Root Cause of failure (In Target Language).
    - ums: The New Solution mechanism (In Target Language).
    - scientificPseudo: A catchy but CLEAR name for the mechanism.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            ump: { type: Type.STRING },
            ums: { type: Type.STRING },
            scientificPseudo: { type: Type.STRING }
          },
          required: ["ump", "ums", "scientificPseudo"]
        }
      }
    }
  });

  const mechs = extractJSON<any[]>(response.text || "[]");
  return {
    data: mechs.map((s, i) => ({ ...s, id: `mech-${i}` })),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateHooks = async (
  project: ProjectContext, 
  bigIdea: BigIdeaOption, 
  mechanism: MechanismOption,
  story: StoryOption
): Promise<GenResult<string[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);
  
  const prompt = `
    ROLE: Viral Hook Writer (TikTok/Reels/FB Ads).
    
    INPUT CONTEXT:
    1. STORY LEAD: "${story.narrative}"
    2. EMOTION: "${story.emotionalTheme}"
    3. UMP (The Enemy): "${mechanism.ump}"
    4. MECHANISM NAME: "${mechanism.scientificPseudo}" (DO NOT USE THIS NAME IN THE HOOK!)
    
    TASK: 
    Generate 10-15 viral hooks that specifically channel the "${story.emotionalTheme}" emotion.
    
    **CRITICAL "NO REVEAL" RULE (THE MYSTERY GAP):**
    - NEVER mention the "Mechanism Name" or "Product Name" in the hook.
    - Curiosity requires a "Gap". If you name the solution, the gap closes, and they scroll past.
    - Instead of "Use the Bio-Lock Protocol", say "This 30-second ritual..."
    - Instead of "Buy Lumina Mask", say "Why your sleep is actually broken..."
    - Refer to the solution as "The Secret", "This 1 Change", "A Simple Tweak", "The Routine", "Hidden Cause".

    ${langInstruction}
    **CRITICAL: Write the hooks in the Target Language defined above.**

    PATTERNS TO USE:
    1. "The Real Reason you [Problem]..." (Focus on UMP)
    2. "Stop doing [Common Habit]..." (Pattern Interrupt)
    3. "I finally found why [Old Solution] failed..." (Story Gap)
    4. "Doctors are wrong about [Topic]..." (Contrarian)
    5. "Sumpah, nyesel banget baru tau [Rahasia/Trik] ini..." (If Indo Slang)

    Output a simple JSON string array.
  `;
  
   const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return {
    data: extractJSON(response.text || "[]"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
}

export const generateAngles = async (project: ProjectContext, personaName: string, personaMotivation: string): Promise<GenResult<any[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);
  const awareness = project.marketAwareness || MarketAwareness.PROBLEM_AWARE;

  // LOGIC FIX: AWARENESS CONTEXT
  let awarenessGuide = "";
  if (awareness === MarketAwareness.UNAWARE) {
      awarenessGuide = `
        MARKET AWARENESS: UNAWARE (Level 1).
        - The user DOES NOT know they have a problem.
        - DO NOT mention the product or the solution name.
        - DO NOT use "Sales" language.
        - FOCUS: Symptoms, anomalies, weird feelings, "Why is this happening?".
        - GOAL: Make them say "Wait, I have that!"
      `;
  } else if (awareness === MarketAwareness.PROBLEM_AWARE) {
      awarenessGuide = `
        MARKET AWARENESS: PROBLEM AWARE (Level 2).
        - The user knows they have pain, but doesn't know the cure.
        - FOCUS: Empathy, Agitation, "Why standard advice fails".
        - GOAL: Prove you understand the problem better than they do.
      `;
  } else if (awareness === MarketAwareness.SOLUTION_AWARE) {
      awarenessGuide = `
        MARKET AWARENESS: SOLUTION AWARE (Level 3).
        - The user is shopping around (e.g. Keto vs Paleo, Cream vs Pill).
        - FOCUS: Mechanism comparisons, "The Old Way vs The New Way".
        - GOAL: Prove your mechanism is superior.
      `;
  } else {
      awarenessGuide = `
        MARKET AWARENESS: PRODUCT/MOST AWARE (Level 4/5).
        - The user knows you. They are on the fence.
        - FOCUS: The Offer, The Guarantee, The Discount, The FOMO.
        - GOAL: Close the sale now.
      `;
  }

  // SYSTEM: Andromeda Strategy (Tier Selection & Prioritization)
  const prompt = `
    You are a Direct Response Strategist applying the "Andromeda Testing Playbook".
    
    CONTEXT:
    Product: ${project.productName}
    Product Description (SOURCE OF TRUTH): ${project.productDescription}
    Persona: ${personaName}
    Deep Motivation: ${personaMotivation}
    Target Country: ${project.targetCountry}
    
    ${awarenessGuide}
    
    TASK:
    Brainstorm 10 raw angles/hooks using these specific psychological frames, TAILORED TO THE AWARENESS LEVEL:
    
    1. THE NEGATIVE ANGLE (Crucial): Focus on what they want to AVOID.
    2. THE TECHNICAL ANGLE: Use a specific scientific term/ingredient FROM THE PRODUCT DESCRIPTION.
    3. THE DESIRE ANGLE: Pure benefit/transformation.

    Then, Prioritize & Assign Tiers:
    - TIER 1 (Concept Isolation): Big, bold, new ideas. High risk/reward.
    - TIER 2 (Persona Isolation): Specifically tailored to this persona's fear/desire.
    - TIER 3 (Sprint Isolation): A simple iteration or direct offer.
    
    ${langInstruction}
    **CRITICAL: Write the 'headline' and 'hook' and 'painPoint' in the Target Language defined above. Do NOT output English.**
    
    OUTPUT:
    Return ONLY the Top 3 High-Potential Insights (Ensure at least 1 is a NEGATIVE ANGLE).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "The core Hook/Angle name" },
            painPoint: { type: Type.STRING, description: "The specific problem or insight" },
            psychologicalTrigger: { type: Type.STRING, description: "The principle used (e.g. Loss Aversion)" },
            testingTier: { type: Type.STRING, description: "TIER 1, TIER 2, or TIER 3" },
            hook: { type: Type.STRING, description: "The opening line or concept" }
          },
          required: ["headline", "painPoint", "psychologicalTrigger", "testingTier"]
        }
      }
    }
  });

  return {
    data: extractJSON(response.text || "[]"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

// --- NEW FUNCTION: EXPRESS PROMO MODE ---
export const generateExpressAngles = async (project: ProjectContext): Promise<GenResult<any[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);
  
  const prompt = `
    ROLE: E-Commerce Campaign Manager (Flash Sale / Promo Specialist).
    
    CONTEXT:
    Product: ${project.productName}
    Description: ${project.productDescription}
    Current Offer: ${project.offer}
    
    GOAL: 
    We need "Hard Sell" or "Impulse Buy" angles. 
    Skip the deep psychology. Focus on VISUAL APPEAL, SCARCITY, and DEAL VALUE.
    
    TASK:
    Generate 3 distinct promotional angles:
    1. THE "UGC" ANGLE (Social Proof / Viral Vibe).
    2. THE "URGENCY" ANGLE (Flash Sale / FOMO).
    3. THE "DEMO" ANGLE (Features / Aesthetic).
    
    ${langInstruction}
    **CRITICAL: Output 'headline' and 'hook' in the Target Language.**
    
    OUTPUT JSON:
    Return 3 items.
    - headline: Short catchy title (e.g. "50% OFF Today").
    - hook: The first line of copy.
    - testingTier: "TIER 3: SPRINT" (Hardcoded).
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            hook: { type: Type.STRING },
            testingTier: { type: Type.STRING }
          },
          required: ["headline", "hook"]
        }
      }
    }
  });

  return {
    data: extractJSON(response.text || "[]"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};

export const generateHVCOIdeas = async (project: ProjectContext, painPoint: string): Promise<GenResult<HVCOOption[]>> => {
  const model = "gemini-2.5-flash";
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const langInstruction = getLanguageInstruction(project.targetCountry || "USA", register);

  const prompt = `
    ROLE: Sabri Suby (Strategy).
    
    CONTEXT:
    The market is tired of "Hard Offers" (Buy Now). We need to catch the 97% of people who are just "Looking for Info".
    We need a "High Value Content Offer" (HVCO) - a Bait piece of content (PDF/Video/Guide).
    
    PRODUCT: ${project.productName}
    PRODUCT DESCRIPTION: ${project.productDescription}
    PAIN POINT: ${painPoint}
    
    TASK:
    Generate 3 HVCO (Lead Magnet) Titles that solve a specific "Bleeding Neck" problem WITHOUT asking for a purchase.
    The content MUST be relevant to the product niche.
    
    CRITERIA:
    1. Must sound like "Forbidden Knowledge" or "Insider Secrets".
    2. Must be a "Mechanism" (e.g., The 3-Step System, The Checklist).
    3. Format: PDF Guide, Cheat Sheet, or Video Training.
    
    ${langInstruction}
    **CRITICAL: Write the 'title' and 'hook' in the Target Language defined above. Do NOT output English.**

    EXAMPLE:
    Product: SEO Agency.
    HVCO: "The 17-Point SEO Death-Checklist That Google Doesn't Want You To Know."
    
    OUTPUT JSON:
    - title: The Catchy Title.
    - format: PDF/Video/Webinar.
    - hook: Why they need to download it NOW.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            format: { type: Type.STRING },
            hook: { type: Type.STRING }
          },
          required: ["title", "format", "hook"]
        }
      }
    }
  });
  
  return {
    data: extractJSON<HVCOOption[]>(response.text || "[]"),
    inputTokens: response.usageMetadata?.promptTokenCount || 0,
    outputTokens: response.usageMetadata?.candidatesTokenCount || 0
  };
};
