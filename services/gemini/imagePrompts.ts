import { CreativeFormat, StrategyMode } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";
import { ai } from "./client";

/**
 * Mendefinisikan aturan visual spesifik berdasarkan format kreatif untuk 
 * memicu 'Pattern Interrupt' dan 'Psychological Triggers'.
 */
const getFormatVisualGuide = (format: CreativeFormat): string => {
    switch (format) {
        // --- PATTERN INTERRUPT (UGLY, RAW, & CHAOTIC) ---
        case CreativeFormat.UGLY_VISUAL:
            return "VISUAL PRIORITY: Disorganized layout showing a raw 'ugly problem' (e.g., acne, messy desk). Looks organic and not like an ad. High relatability through imperfection ";
        case CreativeFormat.MS_PAINT:
            return "VISUAL PRIORITY: Nostalgia effect using 90s-era 'Word Art' aesthetics. Amateurish digital strokes that trigger familiarity for millennials. Designed to stop the scroll through contrast .";
        case CreativeFormat.MEME:
            return "VISUAL PRIORITY: Language of the internet. Can use 'before and after' formats. Must look 'not on brand' to feel authentic. Relatable and humorous content that users want to consume ";
        case CreativeFormat.WHITEBOARD:
            return "VISUAL PRIORITY:  Strictly handwritten text on a physical whiteboard. Shows a mix of problems and benefits together. Focus on explaining how to get results or outcomes faster";
        case CreativeFormat.STICKY_NOTE_REALISM:
            return "VISUAL PRIORITY: Native mobile 'Notes' app interface or real post-it notes. Connects simple text with storytelling. High authenticity bias because it looks like a personal thought";
        case CreativeFormat.BIG_FONT:
            return "VISUAL PRIORITY: Aggressive pattern interrupt using massive typography. Focuses on 'symptom-related' keywords (e.g., 'the fupa', 'arthritis'). No distractions, just the core problem in bold";
        case CreativeFormat.CARTOON:
            return "VISUAL PRIORITY: Simple 2D storytelling. Extremely effective for mental health or explaining relatable 'pain point' stories (e.g., a child’s health issue). Focus on the winning message, not artistic polish.";
        case CreativeFormat.BILLBOARD:
            return "VISUAL PRIORITY: Digital version of a physical highway billboard. Leverages 'familiarity bias'—people are hardwired to pay attention to billboards as ads. Makes the message feel established";

        // --- NATIVE UI / SYSTEM UX (PSYCHOLOGICAL TRIGGERS) ---
        case CreativeFormat.GMAIL_UX:
            return "VISUAL PRIORITY: Gmail/Email interface. Often uses 'scroll stopper' headlines like 'We have to apologize' or 'Not sure if you’ve seen this'. Feels like a personal follow-up .";
        case CreativeFormat.TWITTER_REPOST:
            return "VISUAL PRIORITY: Meniru visual asli platform (X/Twitter). Gunakan layout "repost" atau tangkapan layar asli. Jika menggunakan tangan manusia (handheld), pastikan suasananya organik (bukan studio) untuk memicu bias keaslian (authenticity bias";
        case CreativeFormat.HANDHELD_TWEET:
            return "VISUAL PRIORITY: High-fidelity X/Twitter post screenshot on a phone screen, held by a real person in a cafe/street setting.";
        case CreativeFormat.DM_NOTIFICATION:
            return "VISUAL PRIORITY: Replika persis dari notifikasi sistem (iOS/Android). Harus terlihat seperti pesan organik yang biasa diterima pengguna setiap hari.";
        case CreativeFormat.REMINDER_NOTIF:
            return "VISUAL PRIORITY: iOS Lockscreen reminder notification. Frosted glass effect. Text sharp against a blurred lifestyle background.";
        case CreativeFormat.PHONE_NOTES:
            return "VISUAL PRIORITY: iPhone 'Notes' app interface or post-it notes. Best used for telling a 'founder story' or a personal secret. High authenticity";
        case CreativeFormat.REDDIT_THREAD:
            return "VISUAL PRIORITY: Pure Reddit UX. Must look like an organic post. Use specific keywords (e.g., location like 'Munich') and key emotions like 'I struggle";
        case CreativeFormat.SEARCH_BAR:
            return "VISUAL PRIORITY: A giant Google-style search bar with a specific question being typed. Minimalist, clean background.";

        // --- CAROUSEL SPECIALS (STORYTELLING & BATCHING) ---
        case CreativeFormat.CAROUSEL_EDUCATIONAL:
            return "VISUAL PRIORITY: Clear over Clever'. Use raw, high-contrast text slides. Every slide should act as a 'slippery slope' leading to the next. Use numbered lists and zero branded colors to avoid looking like an ad ";
        case CreativeFormat.CAROUSEL_TESTIMONIAL:
            return "VISUAL PRIORITY: A 'disorganized' pile of real screenshots (DMs, reviews, stars). Avoid polished design. Lean into the authenticity bias—unpolished versions are trusted more than polished ones.";
        case CreativeFormat.CAROUSEL_PANORAMA:
            return "VISUAL PRIORITY: Use a raw, wide-angle 'ugly visual' that feels like an accidental camera pan. Designed for pattern interrupt to stop the scroll and trigger the surprise effect ";
        case CreativeFormat.CAROUSEL_PHOTO_DUMP:
            return "VISUAL PRIORITY: Strictly NO stock or AI images. A messy grid of candid, unedited, and even blurry photos. Mimics a real user's timeline to leverage familiarity bias and platform-agnostic feel";
        case CreativeFormat.CAROUSEL_REAL_STORY:
            return "VISUAL PRIORITY: Sequence showing a 'thoughtful' journey from problem to outcome. Use amateur UGC photography. Focus on the 'key emotion' and 'outcome' in every slide (e.g., Day 1 vs Day 30).";

        // --- DIRECT RESPONSE & MECHANISM (AUTHORITY) ---
        case CreativeFormat.LEAD_MAGNET_3D:
            return "VISUAL PRIORITY: A tangible asset that looks 'thoughtful' rather than a polished marketing render. Use 'Big Font' to highlight the specific problem or outcome. Avoid branded colors to pass the 'authenticity bias' and don't look like a traditional ad ";
        case CreativeFormat.MECHANISM_XRAY:
            return "VISUAL PRIORITY: Focus on an 'ugly visual' of the problem being solved. Instead of futuristic glows, use raw, 'disorganized' overlays that point out the 'Unique Mechanism'. Must feel like a real person's insight, not an AI or stock graphic";
        case CreativeFormat.ANNOTATED_PRODUCT:
            return "VISUAL PRIORITY: Authentic product photography (strictly NO stock images). Use technical annotations that look 'strictly handwritten'. Highlight 'The Secret' ingredient as a 'winning message' that is clear rather than just clever";
        case CreativeFormat.BENEFIT_POINTERS:
            return "VISUAL PRIORITY: Raw product shot with 'disorganized' handwritten scribbles. Arrows should point to features that solve a 'key emotion' or 'struggle'. Should look like an expert's quick breakdown on a whiteboard, leveraging the 'attention restoration bias'.";
        case CreativeFormat.PRESS_FEATURE:
            return "VISUAL PRIORITY: Mimics a real News UX. The headline must be a 'scroll stopper' and 'thoughtful' (e.g., a founder's story or data-backed insight). Psychological trigger: Uses institutional familiarity to build trust without looking like a paid promotion ";
        case CreativeFormat.EDUCATIONAL_RANT:
            return "VISUAL PRIORITY: Raw UGC video. Focus on the 'slippery slope' copywriting—the first 3 seconds must be a pattern interrupt. Background can be irrelevant or 'calming' to trigger the loop effect on Instagram. Prioritize a clear, intense message over high production value ";

        
        // --- LOGIC, COMPARISON & AESTHETIC ---
        case CreativeFormat.US_VS_THEM:
            // Sumber: Menggunakan format meme "before and after" dan menghindari warna brand [6, 7].
            // Mengandalkan "contrast effect" untuk memicu perhatian otak [3, 4].
            return "VISUAL PRIORITY: Unpolished side-by-side comparison. Avoid branded colors to pass the 'authenticity bias'. Use a 'before and after' meme format that looks like a real user's post rather than a corporate ad .";

        case CreativeFormat.VENN_DIAGRAM:
            // Sumber: "Thoughtful but not pretty" [6]. Whiteboard ads harus "strictly handwritten" [8].
            return "VISUAL PRIORITY: Strictly handwritten diagram on a real whiteboard . Intersection highlights the 'Outcome' or 'Golden Solution'. Must look like an expert's raw sketch, not a clean graphic-designed asset .";

        case CreativeFormat.GRAPH_CHART:
            // Sumber: Grafik tangan lebih dipercaya daripada yang dipoles (unpolished vs polished) [4].
            return "VISUAL PRIORITY: Hand-drawn line graph on a notebook or whiteboard . Use a high-contrast marker (red/black). Focus on showing how the product gets 'results faster' (Outcome) . Avoid digital perfection to maintain the 'attention restoration bias'.";

        case CreativeFormat.TIMELINE_JOURNEY:
            // Sumber: Menggunakan storytelling ala 'Emma' atau 'Founder Story' [6, 9].
            // Menggunakan "slippery slope" agar audiens terus menyimak [10].
            return "VISUAL PRIORITY: Sequential 'thoughtful' imagery showing a transformation journey . Use raw UGC-style photos (Day 1 vs Day 30). Apply the 'slippery slope' copywriting principle where the first image/text acts as a scroll-stopper .";

        case CreativeFormat.TESTIMONIAL_HIGHLIGHT:
            // Sumber: Screenshot asli (Reddit/DM) lebih punya trust factor [8, 9].
            // Visual yang 'disorganized' justru lebih menarik perhatian [11].
            return "VISUAL PRIORITY: Raw screenshot of a real review (e.g., WA or DM) to leverage 'similarity bias'. Highlight key 'Emotions' (e.g., 'I struggle') with a messy marker effect . Visual clutter is intentional to look organic.";

        case CreativeFormat.CHECKLIST_TODO:
            // Sumber: Menggunakan format Notes App atau Post-it yang familiar bagi pengguna [8].
            return "VISUAL PRIORITY: Native iPhone 'Notes' app interface or a physical notepad with post-it notes. Use it to tell a 'thoughtful' story or list high-value outcomes. Leans into the 'UX familiarity bias' .";

        case CreativeFormat.COLLAGE_SCRAPBOOK:
            // Sumber: Memanfaatkan 'nostalgia effect' (seperti gaya MS Paint/Word Art) [14].
            return "VISUAL PRIORITY: Handmade, 'disorganized' tactile collage . Use elements that trigger a 'nostalgia effect' for millennials (e.g., Word Art styles) to stop the scroll. Looks like a personal project, not an ad .";

        case CreativeFormat.AESTHETIC_MINIMAL:
            // Sumber: "Pretty ads don't sell" [1]. Stock images adalah 'blind spot' terbesar [15].
            // Untuk AOV tinggi (>10k), tetap harus 'clear' bukan cuma 'sexy' [5, 15].
            return "VISUAL PRIORITY: 'Clear over Clever' approach . Massive whitespace but with 'Big Font' focusing on a specific problem/symptom keyword . Strictly NO stock or AI images. Premium feel comes from clarity, not over-polishing .";

        case CreativeFormat.OLD_ME_VS_NEW_ME:
            // Sumber: Menggunakan format meme yang relatable dan unpolished [7].
            return "VISUAL PRIORITY: Relatable meme-style comparison. Use real, unpolished photos of people (strictly no stock images) . Contrast the 'Key Emotion' of the old self (e.g., 'I struggle') with the 'Outcome' of the new self .";

        case CreativeFormat.UGC_MIRROR:
            // Mengandalkan 'Attention Restoration Bias' (memilih versi tidak dipoles) [3].
            // Harus terlihat sangat organik agar melewati faktor kepercayaan [2].
            return "VISUAL PRIORITY: Deeply unpolished mirror selfie. No professional lighting; camera flash preferred. Must look like a real person's post, leveraging authenticity bias to pass the trust factor .";

        case CreativeFormat.POV_HANDS:
            // Menghindari 'Stock Images' yang merupakan blind spot terbesar [4].
            // Fokus pada 'Outcome' atau hasil penggunaan produk [5].
            return "VISUAL PRIORITY: First-person perspective using real, amateur hands. Strictly NO stock-image look or bokeh that feels too 'pretty'. Focus on showing the 'Outcome' or unique mechanism in a raw, relatable setting .";

        case CreativeFormat.BEFORE_AFTER:
            // Menggunakan prinsip 'Ugly Visual' yang menunjukkan masalah secara nyata [6].
            // Bisa menggunakan format meme untuk meningkatkan relatabilitas [7].
            return "VISUAL PRIORITY: Disorganized, raw split-screen. Left shows the 'Ugly Visual' of the problem (e.g., acne or mess). Right shows the 'Outcome'. Should look 'not on brand' to feel like an authentic user transformation .";

        case CreativeFormat.CHAT_CONVERSATION:
            // Memanfaatkan 'UX Familiarity Bias' agar iklan dikonsumsi seperti konten asli [8].
            // Copywriting harus 'thoughtful' dan sederhana [9].
            return "VISUAL PRIORITY: Authentic iMessage/WhatsApp UX. Content must be 'thoughtful' (e.g., a founder's story or insider insight) and use simple copywriting . Feels like a personal, non-ad communication .";

        case CreativeFormat.STORY_POLL:
        case CreativeFormat.STORY_QNA:
            // Instagram UX harus meniru cara orang mengonsumsi konten di platform tersebut [12].
            // Tidak boleh menggunakan warna brand yang mencolok agar tidak terlihat seperti iklan [10].
            return "VISUAL PRIORITY: Strictly native Instagram UX. Zero branded colors to ensure it doesn't look like an ad . Use standard stickers to leverage UX familiarity bias, making it a 'scroll stopper'.";

        case CreativeFormat.REELS_THUMBNAIL:
            // Fokus pada 'Pattern Interrupt' dan 'Surprise Effect' [1, 13].
            // Menggunakan teks besar (Big Font) yang menyoroti gejala atau masalah [13].
            return "VISUAL PRIORITY: High-energy organic frame. Overlay with 'Big Font' targeting specific symptoms or problems (e.g., 'I struggle...') to trigger pattern interrupt . Must look like an organic post .";

        case CreativeFormat.SOCIAL_COMMENT_STACK:
            // Menggunakan 'Ingroup Bias' di mana orang mempercayai mereka yang mirip dengan mereka [3].
            // Meniru format Reddit yang memiliki trust factor tinggi [15].
            return "VISUAL PRIORITY: Zoomed-in, slightly disorganized comment stack. Mimics Reddit or social proof UX to leverage ingroup bias . Should highlight 'Key Emotions' from real users to drive trust .";
    
                
        case CreativeFormat.IG_STORY_TEXT:
            // Berdasarkan sumber [5, 6], Instagram UX harus meniru konten organik.
            // Hindari warna brand agar tidak terlihat seperti iklan berbayar.
            return "VISUAL PRIORITY: Native Instagram Story UX. 9:16 Vertical. Use native fonts and stickers. Zero branded colors. Looks like a post from a friend to leverage 'UX familiarity bias'. Product is secondary to the 'thoughtful' message .";

        case CreativeFormat.LONG_TEXT:
            // Sumber [8, 9] menyebut ini sebagai 'VSSL in a text format'.
            // Fokus pada teknik 'slippery slope' di mana baris pertama menarik pembaca.
            return "VISUAL PRIORITY: 'Slippery Slope' layout. Use 'Big Font' for symptom-related keywords (e.g., 'I struggle') . Disorganized or raw text is better than a clean article layout to trigger 'pattern interrupt' and bypass banner blindness .";

        default:
            // Sumber [1, 3, 13] sangat melarang penggunaan stok foto atau iklan 'cantik' yang dipoles.
            // Default harus merujuk pada formula dasar 'Ugly Ad'.
            return "VISUAL PRIORITY: Strictly NO stock or AI images . Follow the 'Ugly Ad Formula': Keyword, Key Emotion, Qualifier, and Outcome . Prioritize unpolished, 'thoughtful' visuals over high-quality photography to leverage 'attention restoration bias' .";
    }
};

/**
 * Fungsi utama untuk men-generate prompt gambar AI berdasarkan konteks strategis campaign.
 */
export const generateAIWrittenPrompt = async (ctx: PromptContext): Promise<string> => {
    const { 
        project, format, parsedAngle, visualScene,
        subjectFocus, moodPrompt, culturePrompt,
        congruenceRationale, aspectRatio, rawPersona, embeddedText, safety, enhancer
    } = ctx;

    const isHardSell = project.strategyMode === StrategyMode.HARD_SELL;
    const isVisualImpulse = project.strategyMode === StrategyMode.VISUAL_IMPULSE;

    let visualDirective = "";

if (isHardSell) {
    // Fokus pada masalah mentah (Ugly Visual) atau hasil akhir yang nyata
    visualDirective = "MODE: PROBLEM-SOLUTION. Focus on RAW, DISORGANIZED visuals of the problem or the OUTCOME. Strictly NO professional lighting."; 
} else if (isVisualImpulse) {
    // Fokus pada penghenti pola (Pattern Interrupt) melalui UX platform
    visualDirective = "MODE: PATTERN INTERRUPT. Mimic NATIVE UX (Reddit/Instagram/Gmail). Focus on FAMILIARITY BIAS. No branded colors.";
} else {
    // Fokus pada cerita personal dan autentisitas
    visualDirective = "MODE: AUTHENTIC STORYTELLING. Focus on AMATEUR UGC VIBE. Unpolished, real-life setting, leveraging AUTHENTICITY BIAS.";
}



// Tambahkan instruksi global untuk AI Image Generator

const globalUglyRules = "RULE: Strictly NO stock-photo aesthetic. Use amateur photography style, slightly imperfect cropping, and high contrast. Visual must not look like an ad.";

    // 1. STRATEGIC CONTEXT (Menyusun data untuk LLM)
    const strategicContext = {
        campaign: {
            product: project.productName,
            marketAwareness: project.marketAwareness,
            brandVoice: project.brandVoice || "Adaptable"
        },
        persona: {
            identity: rawPersona?.profile || "General Audience",
            pain: rawPersona?.visceralSymptoms || [],
            psychologicalBlocking: subjectFocus // Ini adalah inti adegan!
        },
        narrative: {
            angle: parsedAngle.cleanAngle,
            customTextToRender: embeddedText,
            specificAction: visualScene,
            congruenceGoal: congruenceRationale // Memastikan gambar membuktikan teks iklan
        },
        execution: {
            format: format,
            formatRule: getFormatVisualGuide(format),
            mood: moodPrompt,
            culture: culturePrompt,
            aspectRatio: aspectRatio
        }
    };
const systemPrompt = `
ROLE: World-Class AI Prompt Engineer & Creative Director specializing in "Ugly Ads" that bypass banner blindness.

TASK: Create a single Strategically Raw, High-Conversion Image Generation Prompt based on [STRATEGIC CONTEXT].

--- STRATEGIC CONTEXT ---
${JSON.stringify(strategicContext, null, 2)}

--- DIRECTIVES ---
1. **CORE COMPOSITION:** Combine 'persona.psychologicalBlocking' with 'narrative.specificAction'. Focus on the 'Key Emotion' (e.g., struggling, frustration) to make it relatable [7].
2. **FORMAT RULE (NON-NEGOTIABLE):** Strictly obey 'execution.formatRule'. If it demands a Reddit, Gmail, or MS Paint look, the prompt must mirror that specific UX [8-11].
3. **VISUAL STRATEGY & AUTHENTICITY:** 
   - ${visualDirective}.
   - **Strictly NO stock-photo or "polished AI" look.** Leverage 'Authenticity Bias' by describing amateur lighting, handheld camera angles, and realistic (imperfect) human features [2, 4].
   - Focus on "Clear over Clever" [12]. The image must immediately prove the ad's message [8].
4. **PATTERN INTERRUPT:** Use high-contrast elements or 'Big Font' instructions if specified to stop the scroll [5, 13].
5. **TEXT RENDERING:** If the format requires text, render: "${embeddedText}". Describe it as 'handwritten' [14], 'Impact font' [15], or 'Native UI text' [16] based on the format rule.

--- TECHNICAL ---
${enhancer}
STYLE: Amateur UGC Photography, Raw, Unpolished, Real-life setting.
SAFETY: ${safety}

Output ONLY the raw prompt string for the image generator.
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: systemPrompt
        });
        return response.text?.trim() || "";
    } catch (e) {
        // Fallback jika API gagal
        return `${format} style. ${subjectFocus}. ${visualScene}. High contrast, cinematic lighting. RENDER TEXT: "${embeddedText}"`; 
    }
};