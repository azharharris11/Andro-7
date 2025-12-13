
import { Type } from "@google/genai";
import { ProjectContext, CreativeFormat, AdCopy, CreativeConcept, GenResult, StoryOption, BigIdeaOption, MechanismOption, MarketAwareness, LanguageRegister } from "../../types";
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
  persona: any, 
  angle: string, 
  format: CreativeFormat
): Promise<GenResult<CreativeConcept>> => {
  const model = "gemini-2.5-flash";

  const awareness = project.marketAwareness || "Problem Aware";
  
  let awarenessInstruction = "";
  if (awareness.includes("Unaware") || awareness.includes("Problem")) {
      awarenessInstruction = `AWARENESS: LOW. Focus on SYMPTOM. Use Pattern Interrupt.`;
  } else if (awareness.includes("Solution")) {
      awarenessInstruction = `AWARENESS: MEDIUM. Focus on MECHANISM and SOCIAL PROOF.`;
  } else {
      awarenessInstruction = `AWARENESS: HIGH. Focus on URGENCY and OFFER.`;
  }

  // Extract detailed persona info if available
  const personaIdentity = persona.profile || persona.name || "User";
  const personaPain = persona.visceralSymptoms ? persona.visceralSymptoms.join(", ") : "General frustration";

  const prompt = `
    # Role: Creative Director (The Pattern Interrupt Specialist)

    **SABRI SUBY'S "ANTI-COMPETITOR" RULE:**
    1. Imagine the "Standard Boring Ad" for this industry (e.g., smiling stock photos, clean studio lighting).
    2. THROW IT IN THE TRASH.
    3. Do the EXACT OPPOSITE. If they go high, we go low (lo-fi). If they are polished, we are raw.
    
    **INPUTS:**
    Product Name: ${project.productName}
    Product Description (WHAT IT IS): ${project.productDescription}
    Winning Insight: ${angle}
    Format: ${format}
    Context: ${project.targetCountry}
    ${awarenessInstruction}
    
    **PERSONA CONTEXT (CRITICAL):**
    Who: ${personaIdentity}
    Pain: ${personaPain}
    *Ensure the visual scene reflects THIS specific person's life, environment, and struggles. Do not hallucinate a generic model.*
    
    **CRITICAL FOR FORMAT '${format}':**
    *   If 'Long Text' or 'Story' or 'IG Story Text Overlay': You MUST describe a vertical, candid, authentic shot.
    *   **CRITICAL NEGATIVE SPACE RULE:** For 'IG Story Text Overlay', the subject MUST be positioned to leave ample "Negative Space" (e.g., sky, blank wall, car ceiling) where text can be overlaid. Do not fill the frame with details.
    *   If 'Ugly Visual' or 'Pattern Interrupt': Describe a chaotic, low-fidelity scene.

    **CRITICAL VISUAL TRANSLATION RULE:**
    You are translating a "Marketing Concept" into a "Real Life Scene".
    - IF Input is "The Bio-Lock Protocol" -> VISUALIZE: A closeup of a secure seal, or a biological diagram, or a lock closing. DO NOT put the text "Bio-Lock" on a wall.
    - IF Input is "Stop wasting money" -> VISUALIZE: A hand throwing cash into a trash can, or burning a receipt.
    - **NEVER** just describe "A person thinking about [Input]". That is lazy.
    - **CONGRUENCE CHECK:** The image must prove the headline is true without using words.
    
    **TASK:**
    Create a concept that VIOLATES the expectations of the feed.

    **VISUAL INSTRUCTION (MICRO-MOMENTS):**
    If the hook is about a habit, ritual, or anxiety, describe the SPECIFIC MICRO-MOMENT.
    Bad: "A sad person."
    Good: "A POV shot of looking down at a bathroom scale seeing the number, toes curled in anxiety."
    Good: "Checking banking app at 3AM with one eye open."
    
    **OUTPUT REQUIREMENTS (JSON):**

    **1. Congruence Rationale:**
    Explain WHY this image matches this specific headline. "The headline promises X, so the image shows X happening."

    **2. TECHNICAL PROMPT (technicalPrompt):**
    A STRICT prompt for the Image Generator. 
    *   If format is text-heavy (e.g. Twitter, Notes, Story), describe the BACKGROUND VIBE (Candid/Blurry) and UI details (Instagram Fonts, Text Bubbles).
    *   If format is visual (e.g. Photography), the SUBJECT ACTION must match the HOOK.

    **3. SCRIPT DIRECTION (copyAngle):**
    Instructions for the copywriter.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualScene: { type: Type.STRING, description: "Director's Note" },
          visualStyle: { type: Type.STRING, description: "Aesthetic vibe" },
          technicalPrompt: { type: Type.STRING, description: "Strict prompt for Image Gen" },
          copyAngle: { type: Type.STRING, description: "Strategy for the copywriter" },
          rationale: { type: Type.STRING, description: "Strategic Hypothesis" },
          congruenceRationale: { type: Type.STRING, description: "Why the Image proves the Text (The Jeans Rule)" },
          hookComponent: { type: Type.STRING, description: "The Visual Hook element" },
          bodyComponent: { type: Type.STRING, description: "The Core Argument element" },
          ctaComponent: { type: Type.STRING, description: "The Call to Action element" }
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
  persona: any, 
  concept: CreativeConcept,
  angle: string, 
  format: CreativeFormat = CreativeFormat.UGLY_VISUAL,
  isHVCOFlow: boolean = false,
  mechanism?: MechanismOption
): Promise<GenResult<AdCopy>> => {
  const model = "gemini-2.5-flash";
  const country = project.targetCountry || "USA";
  const isIndo = country.toLowerCase().includes("indonesia");
  const register = project.languageRegister || LanguageRegister.CASUAL;
  const awareness = project.marketAwareness || "Problem Aware";

  // --- 0. SALES PRESSURE LOGIC ---
  let salesPressure = "MEDIUM";
  let awarenessContext = "";

  if (awareness.includes("Unaware")) {
      salesPressure = "ZERO PRESSURE. Pure curiosity/education.";
      awarenessContext = "Target is UNAWARE. Do not pitch the product immediately. Start with the symptom.";
  } else if (awareness.includes("Most") || awareness.includes("Product")) {
      salesPressure = "HIGH PRESSURE. Call to action.";
      awarenessContext = "Target is HOT. Pitch the offer. Stop beating around the bush.";
  } else {
      awarenessContext = "Target is AWARE. Show them the mechanism and why it works.";
  }

  // --- 1. PERSONA DEEP DIVE (Agar Emosional) ---
  const deepPsychologyContext = `
    TARGET PERSONA:
    - Identity: ${persona.name}
    - Profile: ${persona.profile || 'General Audience'}
    - Pain Points/Visceral Symptoms: "${(persona.visceralSymptoms || []).join('", "')}"
    - Deep Fear: "${persona.deepFear || 'Failure'}"
    - Motivation: "${persona.motivation || 'Relief'}"
    
    CRITICAL INSTRUCTION: You are writing to THIS specific person. Use their vocabulary, their fears.
    Do NOT write a generic ad. Speak directly to their 'Bleeding Neck' problem defined above.
  `;

  // --- 2. DYNAMIC TONE & LANGUAGE LOGIC (FIXED) ---
  // Previously this was hardcoded to Indo vs English. Now it supports ANY country.
  
  let toneInstruction = "";
  
  if (register.includes("Street/Slang")) {
      // SLANG TIER
      toneInstruction = `
        LANGUAGE TARGET: Native Slang/Street Language of ${country}.
        - STYLE: Informal, raw, gen-z, social media native.
        - KEYWORDS: Use local slang particles.
        - VIBE: Bestie sharing a secret or venting to a friend. Not a salesman.
        - IF INDONESIA: Use 'Gue/Lo', 'Banget', 'Sumpah', 'Jujurly'.
        - IF USA: Use 'fr', 'lowkey', 'ong'.
        - IF OTHER: Use appropriate local street dialect.
      `;
  } else if (register.includes("Formal/Professional")) {
      // PROFESSIONAL TIER
      toneInstruction = `
        LANGUAGE TARGET: Formal/Professional Native Language of ${country}.
        - STYLE: Respectful, articulate, trustworthy.
        - KEYWORDS: Use polite pronouns (e.g. 'Anda' in Indo, 'Sie' in German).
        - VIBE: Consultant, Doctor, or Financial Advisor.
        - STRUCTURE: Clear, complete sentences. No slang.
      `;
  } else {
      // CASUAL TIER (DEFAULT)
      toneInstruction = `
        LANGUAGE TARGET: Casual/Conversational Native Language of ${country}.
        - STYLE: Friendly, warm, easy to read.
        - KEYWORDS: Neutral/Polite pronouns (e.g. 'Aku/Kamu' in Indo).
        - VIBE: Friendly neighbor or Mom blogger sharing a tip. Warm and inviting.
      `;
  }

  // --- 3. BRAND VOICE CALIBRATION (NEW - MEMORY FIX) ---
  let brandVoiceContext = "";
  if (project.brandCopyExamples) {
      brandVoiceContext = `
        *** BRAND VOICE CALIBRATION (MIMIC THIS STYLE) ***
        The user has provided examples of their best copy. You MUST adopt this exact writing style (length, emoji usage, sentence structure).
        
        REFERENCE EXAMPLES:
        "${project.brandCopyExamples}"
        
        INSTRUCTION: Read the examples above. Absorb the vibe. Write the new ad in THIS specific voice.
      `;
  }

  // --- 4. FORMAT STYLE GUIDE (The "Same Copy" Fix) ---
  let formatStyleGuide = "";
  
  switch (format) {
      case CreativeFormat.TWITTER_REPOST:
      case CreativeFormat.HANDHELD_TWEET:
          formatStyleGuide = `
              FORMAT: TWITTER/X THREAD.
              - LENGTH: Ultra short caption (max 10 words) because the image IS the text.
              - STYLE: "Link in bio 👇" or "I can't believe I'm sharing this..." or "The thread you needed today."
              - DO NOT write a long paragraph. The visual does the heavy lifting.
          `;
          break;
      case CreativeFormat.MEME:
      case CreativeFormat.UGLY_VISUAL:
      case CreativeFormat.MS_PAINT:
          formatStyleGuide = `
              FORMAT: SHITPOST / MEME CAPTION.
              - LENGTH: 1 short sentence.
              - STYLE: Lowercase, sarcastic, "it be like that".
              - EXAMPLE: "real." or "i feel attacked" or "don't tag me."
              - DO NOT sound like an ad.
          `;
          break;
      case CreativeFormat.LONG_TEXT:
      case CreativeFormat.REDDIT_THREAD:
      case CreativeFormat.PHONE_NOTES:
          formatStyleGuide = `
              FORMAT: STORYTELLING / CONFESSION.
              - LENGTH: Medium to Long.
              - STYLE: Emotional dump. Start with "I messed up..." or "I finally found it...".
              - STRUCTURE: No emojis in the first line. Raw text.
          `;
          break;
      case CreativeFormat.IG_STORY_TEXT:
      case CreativeFormat.STORY_POLL:
          formatStyleGuide = `
              FORMAT: IG STORY OVERLAY.
              - LENGTH: Very short hook.
              - STYLE: "Tap here 👇" or "Who else?"
              - PURPOSE: Drive a click to the Link Sticker.
          `;
          break;
      case CreativeFormat.GMAIL_UX:
      case CreativeFormat.DM_NOTIFICATION:
      case CreativeFormat.CHAT_CONVERSATION:
          formatStyleGuide = `
              FORMAT: PRIVATE MESSAGE CONTEXT.
              - CAPTION: "POV: You finally check your inbox..." or "My doctor sent me this..."
              - VIBE: Voyeuristic.
          `;
          break;
      default:
          formatStyleGuide = `
              FORMAT: STANDARD FEED POST.
              - LENGTH: 3 short paragraphs.
              - STRUCTURE: Hook -> Agitate -> Solution.
              - VIBE: Helpful, high-value advice.
          `;
          break;
  }

  // --- 5. THE PROMPT (The Brain Transplant) ---
  const prompt = `
    # ROLE: Viral Social Media Content Creator (NOT a Copywriter).
    
    **YOUR ENEMY:** "Landing Page Copy".
    If it sounds like a brochure, a TV commercial, or a website header, YOU FAIL.
    If it sounds like a friend venting, gossiping, or sharing a lifehack, YOU WIN.

    **INPUT CONTEXT:**
    Product: ${project.productName} (${project.productDescription})
    Offer: ${project.offer}
    ${deepPsychologyContext}
    
    **MARKET AWARENESS CALIBRATION:**
    Level: ${awareness}
    Sales Pressure: ${salesPressure}
    Context: ${awarenessContext}

    **INPUT STRATEGY:**
    Core Angle/Hook: "${angle}"
    Creative Strategy Note: "${concept.copyAngle}"
    
    **VISUAL CONTEXT:**
    The user sees: "${concept.visualScene}"
    Rationale: "${concept.congruenceRationale}"
    
    **RULES OF ENGAGEMENT:**
    1. **NO INTROS:** Never start with "Do you suffer from...?" or "Introducing...". Start with a Statement or a weird Question.
    2. **MICRO-BLOG FORMAT:** Short lines. Lots of white space. No heavy paragraphs.
    3. **NATIVE CONTENT:** If the visual is a meme, write a meme caption. If it's a story, write a story.
    4. **THE "ANTI-AD" FILTER:** Would a real person post this? If no, rewrite it.
    5. **MECHANISM TRANSLATION (ABSOLUTE RULE):** 
       - Check the input 'Core Angle'. Does it sound like a scientific term (e.g. "Bio-Lock Protocol")?
       - IF YES: You are FORBIDDEN from using that exact term as the headline.
       - INSTEAD: You must write the *Benefit* of that mechanism.
       - BAD: "Introducing the Bio-Lock Protocol."
       - GOOD: "How to finally stop the bloating cycle."
       - Only mention the mechanism name deep in the caption/body, never the hook.
    6. **STORYTELLING RULE:**
       - If the Input Strategy says "Story about...", DO NOT use the story Title as the headline.
       - Start the caption *IN MEDIA RES* (Middle of the action).
       - E.g. Input: "Story about Shame". Output Headline: "I Cried At The ATM Today."
    7. **BIG IDEA RULE:**
       - If the Input Strategy says "The Shift:...", write a 'Pattern Interrupt' statement.
       - Challenge the status quo. "Stop doing X, Start doing Y."

    8. **LANGUAGE ENFORCEMENT (ABSOLUTE):**
       - TARGET COUNTRY: ${country}
       - REGISTER: ${register}
       - EVEN IF the input data (Product Name, Angle, Description) is in English, YOU MUST WRITE THE OUTPUT IN THE NATIVE LANGUAGE OF ${country}.
       - Do NOT mix languages unless it's specific slang defined in the tone.
    
    ${toneInstruction}
    ${brandVoiceContext}
    
    --- FORMAT STYLE GUIDE (FOLLOW THIS STRICTLY) ---
    ${formatStyleGuide}
    --------------------------------------------------
    
    ${mechanism ? `Hint at the Mechanism ("${mechanism.scientificPseudo}") as the 'New Way' or 'The Reason you failed before', but don't be boring/academic.` : ''}

    **TASK:** Write the Instagram/TikTok Caption & Headline.

    **OUTPUT JSON:**
    {
      "primaryText": "The caption. (Use emojis naturally 🧵👇)",
      "headline": "The image headline (Max 7 words, punchy, benefit-driven)",
      "cta": "Button text (e.g. 'More Info', 'Download', 'Learn More')"
    }
  `;

  // Use a higher temperature for creativity to prevent repetition
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 1.2, // Increased randomness
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
