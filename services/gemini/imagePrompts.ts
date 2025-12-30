
import { StrategyMode, CreativeFormat } from "../../types";
import { generateWithRetry } from "./client";
import { PromptContext } from "./imageUtils";

const getFormatVisualGuide = (format: CreativeFormat): string => {
    switch (format) {
        // --- EXISTING & BASIC ---
        case CreativeFormat.UGLY_VISUAL:
        case CreativeFormat.MS_PAINT:
            return "Style: Lo-fi, amateur, crude MS Paint drawing or bad collage. Intentionally ugly aesthetic.";
        
        case CreativeFormat.TWITTER_REPOST:
            return "Style: A precise screenshot of a Twitter/X post on a white background. Sharp text, authentic UI.";
        
        case CreativeFormat.HANDHELD_TWEET:
            return "Style: A POV photo of a hand holding a smartphone. The screen displays a viral tweet clearly. Depth of field focus on phone.";
        
        case CreativeFormat.GMAIL_UX:
            return "Style: A screenshot of a Gmail inbox or email body. Clean UI interface. White background with standard email formatting.";
            
        case CreativeFormat.CHAT_CONVERSATION:
        case CreativeFormat.DM_NOTIFICATION:
            return "Style: A smartphone chat interface (iMessage or WhatsApp). Green/Blue text bubbles on screen. High readability.";
            
        case CreativeFormat.BILLBOARD:
            return "Style: A realistic outdoor billboard on a highway or building side. The ad content is physically printed on the billboard canvas.";
            
        case CreativeFormat.REMINDER_NOTIF:
            return "Style: An iPhone lockscreen notification bubble with glassmorphism on a blurred wallpaper background.";

        // --- CAROUSEL SPECIALS ---
        case CreativeFormat.CAROUSEL_EDUCATIONAL:
            return "Style: Clean Infographic or Slide Deck. Bold headlines, flat vector icons, solid background colors. Educational vibe.";
        case CreativeFormat.CAROUSEL_TESTIMONIAL:
            return "Style: A trusted review card element overlaid on a lifestyle background. 5-star rating visual.";
        case CreativeFormat.CAROUSEL_PANORAMA:
            return "Style: A wide panoramic shot cropped to 1:1. Continuity on edges.";
        case CreativeFormat.CAROUSEL_PHOTO_DUMP:
            return "Style: A chaotic collection of raw, unedited lifestyle photos. Flash photography, candid energy.";
        case CreativeFormat.CAROUSEL_REAL_STORY:
            return "Style: Raw selfie or UGC frame. Authentic, imperfect lighting, real person looking at camera.";

        // --- PATTERN INTERRUPT ---
        case CreativeFormat.BIG_FONT:
            return "Style: Massive, bold sans-serif typography filling the frame. High contrast background (e.g. Black text on Yellow). Minimal visual elements.";
        case CreativeFormat.REDDIT_THREAD:
            return "Style: A screenshot of a Reddit discussion thread. Dark mode or Light mode UI. Upvote arrows visible.";
        case CreativeFormat.MEME:
            return "Style: Classic Internet Meme format. Top text and bottom text in Impact font, or a Twitter-style caption above an image.";
        case CreativeFormat.LONG_TEXT:
            return "Style: A wall of text or a notes app screenshot. Focus on readability. Narrative vibe.";
        case CreativeFormat.CARTOON:
            return "Style: Hand-drawn editorial cartoon or comic strip style. Expressive characters.";
        case CreativeFormat.BEFORE_AFTER:
            return "Style: A split screen composition. Left side desaturated/problem, Right side vibrant/solution. Clear division line.";
        case CreativeFormat.WHITEBOARD:
            return "Style: Hand-drawn diagrams and text on a dry-erase whiteboard. Marker texture visible.";
        case CreativeFormat.EDUCATIONAL_RANT:
             return "Style: Green screen effect. A person in foreground talking, with a news article or graph in the background.";
        case CreativeFormat.OLD_ME_VS_NEW_ME:
             return "Style: Split screen comparison of a person. Sad/Slouching vs Happy/Confident.";
        case CreativeFormat.PRESS_FEATURE:
             return "Style: A featured article layout from a reputable news site or magazine. Headline and lead image style.";
        case CreativeFormat.LEAD_MAGNET_3D:
             return "Style: A high-quality 3D render of a book, report, or checklist floating in a studio environment. Shadow and depth.";
        case CreativeFormat.MECHANISM_XRAY:
             return "Style: Scientific visualization. X-Ray view, cross-section, or schematic diagram showing how it works inside.";

        // --- NATIVE / SOCIAL ---
        case CreativeFormat.IG_STORY_TEXT:
             return "Style: Instagram Story layout. Vertical composition. Text overlay with standard IG fonts (Neon, Modern, Typewriter).";
        case CreativeFormat.PHONE_NOTES:
             return "Style: Apple Notes app interface. Yellow paper texture or dark mode. Handwritten marker doodles optional.";
        case CreativeFormat.AESTHETIC_MINIMAL:
             return "Style: Beige, cream, and earth tones. Minimalist composition. High-end editorial magazine vibe. Serif fonts.";
        case CreativeFormat.STORY_POLL:
             return "Style: Instagram Story with an interactive Poll sticker ('Yes/No') visible in the center.";
        case CreativeFormat.STORY_QNA:
             return "Style: Instagram Story with a 'Ask me a question' sticker box.";
        case CreativeFormat.REELS_THUMBNAIL:
             return "Style: High-energy YouTube/Reels thumbnail style. Expressive face, bold text overlay, high saturation.";
        case CreativeFormat.UGC_MIRROR:
             return "Style: A selfie taken in a bathroom or gym mirror. Phone visible in hand. Casual and authentic.";
        case CreativeFormat.SOCIAL_COMMENT_STACK:
             return "Style: A stack of social media comment bubbles overlaid on a blurred background. Evidence of community engagement.";
        
        // --- LOGIC / CONVERSION ---
        case CreativeFormat.US_VS_THEM:
             return "Style: Comparison table or visual split. Checkmarks (Green) on our side, X marks (Red) on their side.";
        case CreativeFormat.VENN_DIAGRAM:
             return "Style: Two or three overlapping circles diagram. Text labels in the intersections. Clean data viz.";
        case CreativeFormat.TESTIMONIAL_HIGHLIGHT:
             return "Style: A specific phrase highlighted (yellow marker effect) within a block of review text.";
        case CreativeFormat.GRAPH_CHART:
             return "Style: A rising line graph or bar chart. Data visualization showing improvement/growth.";
        case CreativeFormat.TIMELINE_JOURNEY:
             return "Style: A horizontal or vertical timeline showing progress steps. Day 1 to Day 30.";
        case CreativeFormat.BENEFIT_POINTERS:
             return "Style: Product photography with thin lines pointing to key features, labeled with text.";
        case CreativeFormat.STICKY_NOTE_REALISM:
             return "Style: A handwritten yellow sticky note attached to a real-world object (monitor, mirror, fridge).";
        case CreativeFormat.SEARCH_BAR:
             return "Style: A search engine input bar (Google style) with a query typed in. Clean white background.";
        case CreativeFormat.ANNOTATED_PRODUCT:
             return "Style: Exploded view or hero shot of product with detailed technical labels.";
        case CreativeFormat.POV_HANDS:
             return "Style: First-Person Point of View (POV). Looking down at own hands using the product.";

        // --- AESTHETIC ---
        case CreativeFormat.COLLAGE_SCRAPBOOK:
             return "Style: Mixed media collage. Ripped paper edges, tape textures, cutout photos layered together.";
        case CreativeFormat.CHECKLIST_TODO:
             return "Style: A to-do list on a clipboard or notepad. Checkmarks ticking off items.";

        default:
            return "Style: High quality social media advertising asset. Sharp focus, good lighting, clear subject.";
    }
};

export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene, visualStyle,
        moodPrompt, culturePrompt, congruenceRationale, 
        aspectRatio, rawPersona, embeddedText, safety, enhancer,
        fullStoryContext 
    } = ctx;

    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    // Menentukan arahan visual berdasarkan mode strategi
    let visualDirective = "MODE: AUTHENTIC STORYTELLING. Focus on AMATEUR UGC VIBE. Raw, imperfect.";
    if (isHardSell) visualDirective = "MODE: PROBLEM-SOLUTION. Focus on RAW and GRITTY visuals. High Contrast.";
    else if (isVisualImpulse) visualDirective = "MODE: PATTERN INTERRUPT. High-end aesthetic but native to social media. Aspirational.";

    const strategicContext = {
        campaign: {
            product: project.productName,
            brandVoice: project.brandVoice || "Adaptable",
            // Menambahkan mekanisme agar visual selaras dengan logika solusi
            mechanismUMS: fullStoryContext?.mechanism?.ums 
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            // Fokus pada micro-moment penderitaan/kebutuhan persona
            visceralContext: rawPersona?.visceralSymptoms?.join(", ") 
        },
        narrative: {
            angle: parsedAngle.cleanAngle,
            textToRender: embeddedText, // CRITICAL FOR ONE-SHOT
            specificAction: visualScene, // Adegan dari Creative Director
            visualMood: visualStyle,     // Gaya dari Creative Director
            congruenceGoal: congruenceRationale
        },
        execution: {
            format: format,
            formatRule: getFormatVisualGuide(format),
            culture: culturePrompt,
            aspectRatio: aspectRatio
        }
    };

    const systemPrompt = `
    ROLE: Senior AI Prompt Engineer & Creative Director.
    TASK: Translate a Creative Concept into a single, high-conversion Image Generation Prompt.

    --- STRATEGIC CONTEXT ---
    ${JSON.stringify(strategicContext, null, 2)}

    --- DIRECTIVES ---
    1. CORE COMPOSITION: Execute the scene "${visualScene}" precisely. 
    2. VISUAL DNA: Strictly follow the style "${visualStyle}" and format rule: "${getFormatVisualGuide(format)}".
    3. NO STOCK LOOK: ${visualDirective}. Avoid smooth, generic AI lighting.
    4. TEXT RENDERING: The image MUST include the text "${embeddedText}" clearly visible in the scene (e.g., on the screen, sign, or overlay).
    5. CONGRUENCE: The visual must prove the text.
    
    --- TECHNICAL PARAMETERS ---
    - Style Enhancer: ${enhancer}
    - Safety & Quality: ${safety}
    - Localization: ${culturePrompt}

    Output ONLY the raw prompt string for the image generator.
    `;
    
    try {
        const response = await generateWithRetry({
            model: "gemini-3-flash-preview", 
            contents: systemPrompt
        });
        return response.text?.trim() || "";
    } catch (e) {
        // Fallback jika API gagal
        return `${format} style. ${visualScene}. ${visualStyle}. ${culturePrompt}. RENDER TEXT: "${embeddedText}"`; 
    }
};
