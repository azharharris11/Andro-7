import { StrategyMode, CreativeFormat } from "../../types";
import { generateWithRetry } from "./client";
import { PromptContext } from "./imageUtils";

/**
 * World-Class Creative Strategist Visual Guide (The Ultimate Blueprint)
 * Mengintegrasikan: Ugly Ad Strategy, UX Familiarity Bias, & Unaware Marketing.
 * Fokus: Menghancurkan Banner Blindness melalui diversifikasi visual ekstrem.
 */
const getFormatVisualGuide = (format: CreativeFormat): string => {
    switch (format) {
        // --- CAROUSEL SPECIALS (NARRATIVE & DATA FLOW) ---
        case CreativeFormat.CAROUSEL_EDUCATIONAL:
            return "Style: High-value Slide Deck. Bold headlines, flat vector icons, clean grid. Educational vibe. Focus on 'How-to' content.";
        case CreativeFormat.CAROUSEL_TESTIMONIAL:
            return "Style: Testimonial Pile. A stack of review cards with 5-star ratings overlaid on a high-end product shot. Social proof overload.";
        case CreativeFormat.CAROUSEL_PANORAMA:
            return "Style: Seamless 9:16 or 1:1 wide image split across slides. Visual continuity that forces swiping interaction.";
        case CreativeFormat.CAROUSEL_PHOTO_DUMP:
            return "Style: Raw, unedited 'Weekend Dump' vibe. Flash photography, candid shots, imperfect framing. Looks like a friend's post.";
        case CreativeFormat.CAROUSEL_REAL_STORY:
            return "Style: UGC Journey. A mix of raw selfies and 'day in the life' frames. Very high authenticity, zero studio feel.";

        // --- PATTERN INTERRUPT (BREAKING THE FEED) ---
        case CreativeFormat.BIG_FONT:
            return "Style: Massive, aggressive typography filling 80% of the frame. High contrast (e.g., Neon Green on Black). Text IS the visual hook.";
        case CreativeFormat.GMAIL_UX:
            return "Style: Gmail Inbox Interface. Subject line looks like a critical personal email. Triggers the 'Check Mail' psychological reflex.";
        case CreativeFormat.BILLBOARD:
            return "Style: Realistic outdoor billboard on a highway or skyscraper. Cinematic lighting. Perception of scale and authority.";
        case CreativeFormat.UGLY_VISUAL:
            return "Style: The Ugly Ad Blueprint. Low-res collage, mismatched fonts, 'disturbing' or shocking visual metaphors to break banner blindness.";
        case CreativeFormat.MS_PAINT:
            return "Style: Crude MS Paint drawings. Amateur brush strokes, neon colors. Intentionally lo-fi to trigger curiosity and pattern interrupt.";
        case CreativeFormat.REDDIT_THREAD:
            return "Style: Reddit Discussion UI. Dark Mode. Upvotes, awards, and community names visible. Vibe: 'The community found a secret'.";
        case CreativeFormat.MEME:
            return "Style: Classic meme format. Impact font with black borders or X/Twitter style caption over a relatable, funny image.";
        case CreativeFormat.LONG_TEXT:
            return "Style: Native Mini Sales Letter. Off-white background, clean serif typography (Kindle/Article style). Zero visual distractions.";
        case CreativeFormat.CARTOON:
            return "Style: Hand-drawn editorial cartoon or comic strip. Expressive characters illustrating a relatable pain point.";
        case CreativeFormat.BEFORE_AFTER:
            return "Style: Visceral Transformation split-screen. Left: Gritty/Problem. Right: Vibrant/Solution. Clear, hard division line.";
        case CreativeFormat.WHITEBOARD:
            return "Style: Educational drawing on a real whiteboard. Marker texture, hand visible drawing a diagram. Authority/Teacher vibe.";
        case CreativeFormat.EDUCATIONAL_RANT:
            return "Style: Green Screen effect. A person talking over a news article, research paper, or a graph. High information density.";
        case CreativeFormat.OLD_ME_VS_NEW_ME:
            return "Style: Split screen comparing body language or skin. Sad/Slouching vs Confident/Glowing. Emotional transformation.";
        case CreativeFormat.PRESS_FEATURE:
            return "Style: Featured article layout (Forbes/Vogue style). Large headline, sub-headline, and a professional hero image. Institutional trust.";
        case CreativeFormat.LEAD_MAGNET_3D:
            return "Style: Sabri Suby Style. High-quality 3D render of a physical book or report floating with depth shadows. tangible value.";
        case CreativeFormat.MECHANISM_XRAY:
            return "Style: Scientific visualization. X-Ray or 3D cross-section showing molecules or 'inside the body' action. Unique Mechanism proof.";

        // --- NATIVE / SOCIAL (UX FAMILIARITY BIAS) ---
        case CreativeFormat.IG_STORY_TEXT:
            return "Style: 100% Native IG Story. ont: Typewriter. Background: Blurry candid photo. ";
        case CreativeFormat.TWITTER_REPOST:
            return "Style: X/Twitter Post screenshot. Sharp UI, authentic icons. High authority. Vibe: Viral thought or expert advice.";
        case CreativeFormat.PHONE_NOTES:
            return "Style: Apple Notes UI. Dark mode or yellow paper. Includes digital scribbles and highlights. Kesan: 'Bocoran Catatan Rahasia'.";
        case CreativeFormat.AESTHETIC_MINIMAL:
            return "Style: High-end editorial (Beige/Cream tones). Serif fonts, plenty of white space. Aspirational and premium.";
        case CreativeFormat.STORY_POLL:
        case CreativeFormat.STORY_QNA:
            return "Style: IG Story with interactive stickers (Poll/Q&A) in center. UGC background. Invites 'Phantom Interaction' touching.";
        case CreativeFormat.REELS_THUMBNAIL:
            return "Style: High-energy thumbnail. Bold text, expressive faces, high saturation. Designed for the Reels Explore feed.";
        case CreativeFormat.DM_NOTIFICATION:
            return "Style: Stacked iPhone lockscreen notifications. Glassmorphism blur. Triggers dopamine 'New Message' reflex.";
        case CreativeFormat.UGC_MIRROR:
            return "Style: Raw mirror selfie. Flash photography, messy room background. 100% authentic human connection.";
        case CreativeFormat.HANDHELD_TWEET:
            return "Style: POV photo of a hand holding a phone displaying a tweet. Depth of field focus on the screen. Cafe/Street background.";
        case CreativeFormat.SOCIAL_COMMENT_STACK:
            return "Style: 3-5 social media comment bubbles stacked over a raw product shot. Proves massive market validation.";
        case CreativeFormat.CHAT_CONVERSATION:
            return "Style: iMessage/WhatsApp thread simulation. Green/Blue bubbles. Includes 'Typing...' for realistic immersion.";
        case CreativeFormat.REMINDER_NOTIF:
            return "Style: iPhone Reminder notification bubble. Minimalist, urgent, and personal. 'Don't forget this' vibe.";

        // --- LOGIC / CONVERSION (THE PROOF) ---
        case CreativeFormat.US_VS_THEM:
            return "Style: Binary Logic table. Vibrant 'Us' vs Grayscale 'Them'. Checkmarks vs X-marks. Brutal logical comparison.";
        case CreativeFormat.VENN_DIAGRAM:
            return "Style: Data visualization of the 'Sweet Spot'. Clear overlapping circles. The 'Eureka' moment of the solution.";
        case CreativeFormat.TESTIMONIAL_HIGHLIGHT:
            return "Style: Screenshot of a text review with a yellow marker highlight over the 'Benefit' sentence. Authentic proof.";
        case CreativeFormat.GRAPH_CHART:
            return "Style: Rising line graph or bar chart. Visualizing growth or pain reduction. Proof of results through data.";
        case CreativeFormat.TIMELINE_JOURNEY:
            return "Style: Horizontal timeline (Day 1, Day 7, Day 30). Visualizes the speed of results and the transformation process.";
        case CreativeFormat.BENEFIT_POINTERS:
        case CreativeFormat.ANNOTATED_PRODUCT:
            return "Style: Hero shot of product with thin 'leader lines' pointing to ingredients/features. Educational anatomy.";
        case CreativeFormat.SEARCH_BAR:
            return "Style: Google Search simulation. White background. A query typed in (The Pain Point). Focus on 'Unaware' problem solving.";
        case CreativeFormat.POV_HANDS:
            return "Style: First-person POV looking down at hands using the product. High tactile detail. 'In-use' demonstration.";

        // --- AESTHETIC ---
        case CreativeFormat.COLLAGE_SCRAPBOOK:
            return "Style: Mixed media collage. Ripped paper, tape, polaroids, and textures. Artsy, tactile, and highly engaging.";
        case CreativeFormat.CHECKLIST_TODO:
            return "Style: Handwritten to-do list on a clipboard or notepad. Problems are crossed out, solutions are checked.";

        default:
            return "Style: Native social media asset. Sharp focus, authentic lighting, no AI gloss. Realistic and high-conversion.";
    }
};

export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene, visualStyle,
        rawPersona, embeddedText, fullStoryContext 
    } = ctx;

    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isUnaware = [CreativeFormat.UGLY_VISUAL, CreativeFormat.SEARCH_BAR, CreativeFormat.MS_PAINT].includes(format);

    // Directive visual berdasarkan Psikologi Andromeda
    let visualDirective = "MODE: NATIVE & ORGANIC. Look like a personal photo, not an ad.";
    
    if (isUnaware) {
        visualDirective = "MODE: CURIOSITY & UNAWARE. Focus on the visceral pain or a shocking visual metaphor. NO product shot. High visual friction.";
    } else if (isHardSell) {
        visualDirective = "MODE: DIRECT RESPONSE. High contrast, clear call-to-value, and logical dominance.";
    }

    const strategicContext = {
        campaign: {
            product: project.productName,
            mechanism: fullStoryContext?.mechanism?.ums 
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            visceralSymptoms: rawPersona?.visceralSymptoms?.[0] || "Unknown pain"
        },
        narrative: {
            angle: parsedAngle.cleanAngle,
            textToRender: embeddedText, 
            scene: visualScene,
            style: visualStyle
        },
        execution: {
            format: format,
            formatRule: getFormatVisualGuide(format)
        }
    };

    const systemPrompt = `
    ROLE: Senior AI Prompt Engineer & Meta Creative Strategist.
    TASK: Translate the Strategic Context into a hyper-specific, raw Image Generation Prompt.

    --- STRATEGIC CONTEXT (THE UGLY AD BLUEPRINT) ---
    ${JSON.stringify(strategicContext, null, 2)}

    --- PROMPT ENGINEERING RULES ---
    1. FORMAT FIDELITY: Strictly adhere to: "${getFormatVisualGuide(format)}".
    2. UX REALISM: For digital UI (Notes, Gmail, Twitter, Reddit), every detail (font, icons, spacing) must be 100% authentic.
    3. PATTERN INTERRUPT: ${visualDirective}. NO AI GLOSS. Add film grain, imperfections, and realistic shadows.
    4. TEXT RENDERING: The text "${embeddedText}" is the hook. Integrate it naturally into the scene or UI.
    5. THE HOOK: The visual scene "${visualScene}" must prove the text's claim.

    OUTPUT: Only the raw prompt string for a high-end image generator (like Flux or Imagen).
    `;
    
    try {
        const response = await generateWithRetry({
            model: "gemini-2.5-flash-preview-09-2025", 
            contents: [{ parts: [{ text: systemPrompt }] }]
        });
        
        const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return resultText?.trim() || "";
    } catch (e) {
        return `${format} style. ${visualDirective}. Scene: ${visualScene}. Render Text: "${embeddedText}". Raw & Native.`; 
    }
};