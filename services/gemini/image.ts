
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
import { generateTextInstruction } from "./imageText";
import { 
    getUglyFormatPrompt, 
    getNativeStoryPrompt, 
    getSpecificFormatPrompt, 
    getDefaultPrompt 
} from "./imagePrompts";

export const generateCreativeImage = async (
  project: ProjectContext,
  persona: any,
  angle: string,
  format: CreativeFormat,
  visualScene: string,
  visualStyle: string,
  technicalPrompt: string,
  aspectRatio: string = "1:1",
  referenceImageBase64?: string
): Promise<GenResult<string | null>> => {
  
  const model = "gemini-2.5-flash-image";
  const country = project.targetCountry || "USA";
  
  const parsedAngle = parseAngle(angle);
  const culturePrompt = getCulturePrompt(country);
  const personaVisuals = getPersonaVisualContext(persona, parsedAngle.cleanAngle);
  
  const isUglyFormat = [
    CreativeFormat.MS_PAINT
  ].includes(format);

  const safety = getSafetyGuidelines(isUglyFormat);

  let moodPrompt = "Lighting: Natural, inviting. Emotion: Positive.";
  if (parsedAngle.isPainFocused || parsedAngle.isUrgent) {
      moodPrompt = "Lighting: High contrast, dramatic shadows, moody. Emotion: Frustrated, Urgent, Serious.";
  }
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

  const ctx: PromptContext = {
      project, format, parsedAngle, visualScene, visualStyle, technicalPrompt, 
      textCopyInstruction: generateTextInstruction(format, parsedAngle, project),
      personaVisuals, moodPrompt, culturePrompt, subjectFocus, 
      enhancer: appliedEnhancer,
      safety
  };

  let finalPrompt = "";
  
  // Prioritize technicalPrompt result from Creative Director if detailed enough
  // This ensures the visual translation logic from creative.ts is respected
  if (technicalPrompt && technicalPrompt.length > 50 && !isUglyFormat) {
      finalPrompt = `${technicalPrompt} ${ctx.enhancer} ${ctx.safety}`;
  } else {
      if (isUglyFormat) {
          finalPrompt = getUglyFormatPrompt(ctx);
      } else if (isNativeStory) {
          finalPrompt = getNativeStoryPrompt(ctx);
      } else {
          const specificPrompt = getSpecificFormatPrompt(ctx);
          if (specificPrompt) {
              finalPrompt = specificPrompt;
          } else {
              finalPrompt = getDefaultPrompt(ctx);
          }
      }
  }

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
  persona: any
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
          "1:1"
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
