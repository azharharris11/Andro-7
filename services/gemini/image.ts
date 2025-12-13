
import { ProjectContext, CreativeFormat, GenResult, MarketAwareness } from "../../types";
import { ai } from "./client";
import { 
    PromptContext, 
    ENHANCERS, 
    getSafetyGuidelines, 
    getCulturePrompt, 
    getPersonaVisualContext, 
    parseAngle, 
    getSubjectFocus 
} from "./imageUtils";
import { generateAIWrittenPrompt } from "./imagePrompts";

export const generateCreativeImage = async (
  project: ProjectContext,
  persona: any,
  angle: string,
  format: CreativeFormat,
  visualScene: string,
  visualStyle: string,
  technicalPrompt: string,
  aspectRatio: string = "1:1",
  referenceImageBase64?: string,
  congruenceRationale?: string
): Promise<GenResult<string | null>> => {
  
  // LOGIC TO SWITCH MODELS
  // standard -> 'gemini-2.5-flash-image'
  // pro -> 'gemini-3-pro-image-preview'
  const model = project.imageModel === 'pro' 
      ? "gemini-3-pro-image-preview" 
      : "gemini-2.5-flash-image";

  console.log(`🎨 Generating Image using Model: ${model} | Format: ${format}`);
  
  const country = project.targetCountry || "USA";
  
  const parsedAngle = parseAngle(angle);
  const culturePrompt = getCulturePrompt(country);
  const personaVisuals = getPersonaVisualContext(persona, parsedAngle.cleanAngle);
  
  const isUglyFormat = [
    CreativeFormat.MS_PAINT,
    CreativeFormat.UGLY_VISUAL,
    CreativeFormat.MEME
  ].includes(format);

  const safety = getSafetyGuidelines(isUglyFormat);

  // FIX 2: VISUAL MOOD CONFLICT
  // Removed the rigid "if (pain || urgent) { mood = dark }" logic. 
  // This was causing "Product Aware" ads (Hero Shots) to look depressive just because they had urgency.
  // Now we default to professional/neutral and let the specific format enhancers or Scene Description drive the mood.
  let moodPrompt = "Lighting: Professional, high-quality, authentic to the scene. Emotion: Congruent with the action.";
  
  if (isUglyFormat) {
     moodPrompt = "Lighting: Bad, amateur flash, or harsh fluorescent. Emotion: Authentic, candid.";
  }

  const subjectFocus = getSubjectFocus(project.marketAwareness || MarketAwareness.PROBLEM_AWARE, personaVisuals, parsedAngle, project);

  let appliedEnhancer = ENHANCERS.PROFESSIONAL;
  
  const isNativeStory = [
    CreativeFormat.UGC_MIRROR,
    CreativeFormat.PHONE_NOTES, 
    CreativeFormat.TWITTER_REPOST, 
    CreativeFormat.SOCIAL_COMMENT_STACK,
    CreativeFormat.HANDHELD_TWEET, 
    CreativeFormat.EDUCATIONAL_RANT,
    CreativeFormat.CHAT_CONVERSATION, 
    CreativeFormat.DM_NOTIFICATION,
    CreativeFormat.REMINDER_NOTIF
  ].includes(format);

  if (isUglyFormat) appliedEnhancer = ENHANCERS.AUTHENTIC_UGC;
  else if (isNativeStory) appliedEnhancer = ENHANCERS.UGC;
  else if (format === CreativeFormat.CAROUSEL_REAL_STORY) appliedEnhancer = ENHANCERS.UGC;

  // 1. PREPARE FULL CONTEXT (Megaprompt Data)
  // persona object passed here now contains the strategy data from App.tsx fix
  const fullStoryContext = {
      story: persona.storyData,
      mechanism: persona.mechanismData,
      bigIdea: persona.bigIdeaData
  };

  const ctx: PromptContext = {
      project, format, parsedAngle, visualScene, visualStyle, technicalPrompt, 
      textCopyInstruction: "", // No longer used
      personaVisuals, moodPrompt, culturePrompt, subjectFocus, 
      enhancer: appliedEnhancer,
      safety,
      fullStoryContext,
      congruenceRationale,
      aspectRatio
      // embeddedText is handled by the Unified Prompt Engine now
  };

  // 2. INVOKE UNIFIED PROMPT ENGINE
  const finalPrompt = await generateAIWrittenPrompt(ctx);

  const parts: any[] = [{ text: finalPrompt }];
  
  if (referenceImageBase64) {
      const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
      parts.unshift({
          inlineData: { mimeType: "image/png", data: base64Data }
      });
      parts.push({ text: "Use this image as a strict character/style reference. Maintain the same person/environment but change the pose/action as described." });
  } 
  else if (project.productReferenceImage) {
      const base64Data = project.productReferenceImage.split(',')[1] || project.productReferenceImage;
      parts.unshift({
          inlineData: { mimeType: "image/png", data: base64Data }
      });
      parts.push({ text: "Use the product/subject in the provided image as the reference. Maintain brand colors and visual identity." });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { imageConfig: { aspectRatio: aspectRatio === "1:1" ? "1:1" : "9:16" } }
    });

    let imageUrl: string | null = null;
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
    }
    return {
      data: imageUrl,
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0
    };
  } catch (error) {
    console.error("Image Gen Error", error);
    return { data: null, inputTokens: 0, outputTokens: 0 };
  }
};

export const generateCarouselSlides = async (
  project: ProjectContext,
  format: CreativeFormat,
  angle: string,
  visualScene: string,
  visualStyle: string,
  technicalPrompt: string,
  persona: any,
  congruenceRationale?: string
): Promise<GenResult<string[]>> => {
  const slides: string[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const slideVariations = [
    { role: "Title Slide", instruction: "This is the first slide (Hook). Focus on the problem or headline visual." },
    { role: "Middle Slide", instruction: "This is the middle slide (Value). Show the mechanism, process, or social proof detail." },
    { role: "End Slide", instruction: "This is the final slide (CTA). Show the result, product stack, or call to action." }
  ];

  const promises = slideVariations.map(v => {
      const slideScene = `${visualScene}. [CAROUSEL CONTEXT: ${v.role} - ${v.instruction}]`;
      return generateCreativeImage(
          project, 
          persona, 
          angle, 
          format, 
          slideScene, 
          visualStyle, 
          technicalPrompt, 
          "1:1",
          undefined,
          congruenceRationale
      );
  });

  const results = await Promise.all(promises);

  results.forEach(res => {
      if (res.data) slides.push(res.data);
      totalInputTokens += res.inputTokens;
      totalOutputTokens += res.outputTokens;
  });

  return {
      data: slides,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens
  };
};
