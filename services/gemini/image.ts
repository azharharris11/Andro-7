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
import { generateVisualText } from "./imageText"; // Tambahkan import ini

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
): Promise<GenResult<{ imageUrl: string | null; finalPrompt: string }>> => {
  
  const model = project.imageModel === 'pro' 
      ? "gemini-3-pro-image-preview" 
      : "gemini-2.5-flash-image";

  console.log(`🎨 Generating Image using Model: ${model} | Format: ${format}`);
  
  const country = project.targetCountry || "USA";
  const parsedAngle = parseAngle(angle);
  const culturePrompt = getCulturePrompt(country);
  const personaVisuals = getPersonaVisualContext(persona, parsedAngle.cleanAngle);
  
  // 1. GENERATE CUSTOM TEXT FOR FORMAT (Menghubungkan imageText.ts)
  const embeddedText = await generateVisualText(project, format, parsedAngle);

  
  // 2. GET PSYCHOLOGICAL BLOCKING (Menghubungkan Market Awareness)
  const subjectFocus = getSubjectFocus(
    project.marketAwareness || MarketAwareness.PROBLEM_AWARE, 
    personaVisuals, 
    parsedAngle, 
    project
  );

  let appliedEnhancer = ENHANCERS.PROFESSIONAL;
  const isNativeStory = [
    CreativeFormat.UGC_MIRROR, CreativeFormat.PHONE_NOTES, CreativeFormat.TWITTER_REPOST, 
    CreativeFormat.SOCIAL_COMMENT_STACK, CreativeFormat.HANDHELD_TWEET, CreativeFormat.EDUCATIONAL_RANT,
    CreativeFormat.CHAT_CONVERSATION, CreativeFormat.DM_NOTIFICATION, CreativeFormat.REMINDER_NOTIF
  ].includes(format);

  if (isUglyFormat) appliedEnhancer = ENHANCERS.AUTHENTIC_UGC;
  else if (isNativeStory || format === CreativeFormat.CAROUSEL_REAL_STORY) appliedEnhancer = ENHANCERS.UGC;

  const fullStoryContext = {
      story: persona.storyData,
      mechanism: persona.mechanismData,
      bigIdea: persona.bigIdeaData
  };

  // 3. PACK FULL CONTEXT
  const ctx: PromptContext = {
      project, format, parsedAngle, visualScene, visualStyle, technicalPrompt, 
      textCopyInstruction: "", 
      personaVisuals, moodPrompt, culturePrompt, 
      subjectFocus, // Sekarang dikirim!
      enhancer: appliedEnhancer,
      safety,
      fullStoryContext,
      congruenceRationale,
      aspectRatio,
      rawPersona: persona,
      embeddedText // Hasil dari generateVisualText
  };

  const finalPrompt = await generateAIWrittenPrompt(ctx);

  const parts: any[] = [{ text: finalPrompt }];
  
  // Handle Reference Images
  if (referenceImageBase64) {
      const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
      parts.unshift({ inlineData: { mimeType: "image/png", data: base64Data } });
      parts.push({ text: "Maintain character/environment but change the pose/action as described." });
  } else if (project.productReferenceImage) {
      const base64Data = project.productReferenceImage.split(',')[1] || project.productReferenceImage;
      parts.unshift({ inlineData: { mimeType: "image/png", data: base64Data } });
      parts.push({ text: "Use the product/subject in the provided image as reference." });
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
      data: { imageUrl, finalPrompt },
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0
    };
  } catch (error) {
    console.error("Image Gen Error", error);
    return { data: { imageUrl: null, finalPrompt }, inputTokens: 0, outputTokens: 0 };
  }
};