
import { CreativeFormat } from "../../types";
import { PromptContext, ENHANCERS, getSafetyGuidelines } from "./imageUtils";

export const getUglyFormatPrompt = (ctx: PromptContext): string => {
    const { format, project, visualScene, parsedAngle, moodPrompt, culturePrompt, enhancer } = ctx;
    const safety = getSafetyGuidelines(true);

    if (format === CreativeFormat.MS_PAINT) {
        return `A crude, badly drawn MS Paint illustration related to ${project.productName}. Stick figures, comic sans text, bright primary colors. Looks like a child or amateur drew it to explain: "${parsedAngle.cleanAngle}". Authentically bad internet meme style. ${safety}`;
    } 
    
    return `A visually raw, unpolished, low-quality image. ${ctx.subjectFocus}. Action: ${visualScene}. ${enhancer} ${culturePrompt} ${moodPrompt} ${safety}`;
};

export const getNativeStoryPrompt = (ctx: PromptContext): string => {
    const { format, project, visualScene, parsedAngle, textCopyInstruction, moodPrompt, culturePrompt, personaVisuals, enhancer } = ctx;
    const safety = getSafetyGuidelines(false);

    if (format === CreativeFormat.EDUCATIONAL_RANT) {
        return `
        EDUCATIONAL RANT FORMAT (TikTok/Reels Style):
        
        CAMERA SETUP:
        - POV: Direct-to-camera, person talking passionately
        - FRAMING: Vertical 9:16, face takes up 60% of frame
        - BACKGROUND: Green screen showing a screenshot of a news article/study/graph about "${parsedAngle.cleanAngle}"
        
        PERSON'S EXPRESSION:
        - Emotion: Passionate, frustrated, "I need to tell you this" energy
        - Gestures: Hands moving emphatically, pointing at screen occasionally
        - NOT smiling - this is serious educational content
        
        UI OVERLAYS:
        - Top text: "Why is nobody talking about this??" (White text, black outline)
        - Captions: Auto-generated style captions at bottom
        - Duration indicator: "0:15" in corner
        
        VIBE: Feels like a concerned friend dropping truth bombs, not a brand ad
        ${ENHANCERS.UGC} ${safety}
        `;
    }

    if (format === CreativeFormat.CHAT_CONVERSATION) {
        const isIndo = project.targetCountry?.toLowerCase().includes("indonesia");
        const appStyle = isIndo ? "WhatsApp UI (Green bubbles)" : "iMessage UI (Blue bubbles)";
        const sender = isIndo ? "Sayang" : "Bestie";

        return `
          A close-up photo of a hand holding a smartphone displaying a chat conversation.
          App Style: ${appStyle}.
          Sender Name: "${sender}".
          ${textCopyInstruction}
          Background: Blurry motion (walking on street or inside car).
          Lighting: Screen glow on thumb.
          Make the UI look 100% authentic to the app.
          ${enhancer} ${safety}
        `;
    } 
    
    return `
        A brutally authentic, amateur photo taken from a first-person perspective (POV) or candid angle.
        SCENE ACTION: ${visualScene}.
        ${personaVisuals}
        Lighting: Bad overhead lighting or harsh flash (Direct Flash Photography).
        Quality: Slightly grainy, iPhone photo quality.
        ${textCopyInstruction}
        ${culturePrompt} ${moodPrompt} ${safety}
    `;
};

export const getSpecificFormatPrompt = (ctx: PromptContext): string => {
    const { format, project, parsedAngle, enhancer, safety } = ctx;

    // 1. BIG FONTS (Screenshot 1 & 12)
    if (format === CreativeFormat.BIG_FONT) {
        return `
          STYLE: Brutalist Typography Ad.
          
          OPTION A (Body Overlay):
          A close-up photo of a human body part related to pain (e.g., knee, back, stomach).
          OVERLAY: The text "${parsedAngle.cleanAngle}" is 'tattooed' or digitally overlaid directly onto the skin in black font.
          
          OPTION B (The List):
          A plain white or bright yellow background.
          TEXT: A massive, bold, black list of problems.
          HEADLINE: "${parsedAngle.cleanAngle}" takes up 80% of the screen.
          
          Vibe: Shocking, Direct, aggressive.
          ${safety}
        `;
    }

    // 2. GMAIL/LETTER ADS (Screenshot 2 & 10)
    if (format === CreativeFormat.GMAIL_UX) {
        return `
          A realistic screenshot of a mobile Email Inbox (Gmail/iOS Mail).
          
          VISUAL:
          A list of emails. The top email is highlighted/opened.
          SENDER: "${project.productName} Founder" or "Sarah from ${project.productName}".
          SUBJECT LINE: Bold, lowercase, clickbait style. E.g., "we messed up...", "personal update", or "${parsedAngle.cleanAngle}".
          PREVIEW TEXT: "I wanted to personally reach out about..."
          
          VIBE: Private, Exclusive, "Oops" email.
          ${enhancer} ${safety}
        `;
    }

    // 3. THE LONG TEXT / EDITORIAL (Screenshot 3)
    if (format === CreativeFormat.LONG_TEXT) {
        return `
          An aesthetic "Magazine Page" or "Editorial Layout" (9:16 Vertical).
          
          LAYOUT STRUCTURE:
          - TOP HALF: A high-quality photo of a person experiencing the emotion of: "${parsedAngle.cleanAngle}".
          - BOTTOM HALF: A solid color block (Cream, Sage Green, or Soft Yellow).
          - CONTENT: A bold serif headline followed by 2-3 short, readable paragraphs explaining the story.
          
          STYLE: Looks like a page from a modern lifestyle magazine or a blog screenshot. Clean, serif fonts.
          ${safety}
        `;
    }

    // 4. UGLY VISUAL (Screenshot 4 & 11)
    if (format === CreativeFormat.UGLY_VISUAL) {
        return `
          A deliberately "Bad" or Amateur Photo.
          
          SCENE: A messy, cluttered room (bedroom or kitchen).
          LIGHTING: Harsh direct flash photography (looks like a 2010 digicam).
          TEXT OVERLAY: A generic sans-serif text (Arial) placed randomly on the image reading "${parsedAngle.cleanAngle}".
          
          VIBE: "I don't care about aesthetics, I care about results."
          CRITICAL: Do NOT make it pretty. Make it look raw and real.
          ${safety}
        `;
    }

    // 5. INSTAGRAM UX (Screenshot 5 & 14)
    if (format === CreativeFormat.IG_STORY_TEXT || format === CreativeFormat.STORY_QNA || format === CreativeFormat.STORY_POLL) {
        return `
          A POV photo formatted for Instagram Story.
          
          VISUAL: Hand holding the product (${project.productName}) OR a selfie of a person pointing at text.
          UI ELEMENT (CRITICAL):
          Superimpose a realistic Instagram Sticker:
          - "Ask Me Anything" box with question: "Does it actually work?"
          - OR a "Poll" sticker: "Yes / No".
          - OR a text block with a highlighted background.
          
          TEXT CONTENT: "${parsedAngle.cleanAngle}".
          ${enhancer} ${safety}
        `;
    }

    // 6. CARTOONIC (Screenshot 6)
    if (format === CreativeFormat.CARTOON) {
        return `
          A simple 4-panel comic strip or specific illustration.
          
          STYLE: "Corporate Memphis" or Simple Line Art (Sunday paper style).
          PANELS:
          1. Panel 1: Person struggling with "${parsedAngle.cleanAngle}".
          2. Panel 2: Person trying a wrong solution.
          3. Panel 3: Person finding ${project.productName}.
          4. Panel 4: Happy result.
          
          OR: A diagram comparing "Your Brain on Stress" vs "Your Brain on ${project.productName}".
          ${safety}
        `;
    }

    // 7. WHITEBOARD ADS (Screenshot 8)
    if (format === CreativeFormat.WHITEBOARD) {
        return `
          A vertical photo of a Whiteboard / Dry Erase Board.
          
          ACTION:
          A hand is holding the product (${project.productName}) in the foreground, partly blocking the board.
          
          BOARD CONTENT:
          Handwritten marker text (Red or Blue) explaining "${parsedAngle.cleanAngle}" with arrows or a simple graph.
          
          VIBE: "Let me explain the science", Teacher/Professor vibe.
          ${enhancer} ${safety}
        `;
    }

    // 8. STICKY NOTES / OG ADS (Screenshot 9)
    if (format === CreativeFormat.STICKY_NOTE_REALISM) {
        return `
          A POV photo of handwritten Post-it notes.
          
          PLACEMENT (Choose one):
          - Stuck on a Bathroom Mirror.
          - Stuck on a Laptop Screen.
          - Placed on a messy Bed sheet next to pills/supplements.
          
          CONTENT:
          Handwritten sharpie text: "${parsedAngle.cleanAngle}".
          Draw a simple arrow or underline for emphasis.
          
          VIBE: Reminder, Life hack, Personal note.
          ${enhancer} ${safety}
        `;
    }

    // 9. MEME ADS (Screenshot 13)
    if (format === CreativeFormat.MEME) {
        return `
          A classic internet meme format.
          
          STYLE:
          Standard Meme Layout: Image in center, White bar at top with black text.
          IMAGE: A funny/relatable reaction image related to "${parsedAngle.cleanAngle}".
          CAPTION: "Me when I finally found a fix for [Problem]..."
          
          FONT: Arial or Helvetica (Twitter style) OR Impact Font (Classic style).
          ${safety}
        `;
    }

    if (format === CreativeFormat.TESTIMONIAL_HIGHLIGHT) {
        return `
          A chaotic but aesthetic "Social Proof Collage" or "Wall of Love".
          
          COMPOSITION:
          A dense pile of mixed digital messages and reviews scattered/overlapping. 
          Make it look like the internet is exploding with feedback.

          MUST INCLUDE A DIVERSE MIX OF:
          1. WhatsApp Message Bubbles (Green UI).
          2. Instagram DM screenshots (Dark Mode).
          3. **TikTok Comment Overlays** (White text with shadow, "Liked by Creator" badge).
          4. **Twitter/X Posts** (Clean white UI, showing Retweet counts).
          5. **iPhone Lock Screen Notifications** (Stacked notifications saying "New Message").
          6. 5-Star Website Review widgets (Yellow stars).
          
          CONTENT INSTRUCTION:
          The CENTRAL or TOPMOST message contains the key hook: "${parsedAngle.cleanAngle}".
          
          HIGHLIGHT ACTION:
          A bright NEON YELLOW digital highlighter stroke marks that specific sentence on the central message, making it pop out instantly against the visual chaos.
          
          DETAILS TO ADD CREDIBILITY:
          - Add a "Verified" blue checkmark on one or two usernames.
          - Show high engagement numbers (e.g., "2.4k Likes", "Just now").
          - Vibe: "Viral Sensation", "Breaking the Internet", "Fear Of Missing Out (FOMO)".
          
          ${enhancer} ${safety}
        `;
    }

    // Fallback for others
    if (format === CreativeFormat.REDDIT_THREAD) {
         return `A screenshot of a Reddit thread (Dark Mode). Title: "${parsedAngle.cleanAngle}". Subreddit: r/TrueOffMyChest. Vibe: Authentic confession. ${safety}`;
    }
    
    // Existing formats
    if (format === CreativeFormat.VENN_DIAGRAM) {
        return `A simple, minimalist Venn Diagram graphic on a solid, clean background. Left Circle Label: "Competitors". Right Circle Label: "${project.productName}". Intersection: "${parsedAngle.cleanAngle}". Style: Corporate Memphis flat design. ${enhancer} ${safety}`;
    }

    if (format === CreativeFormat.PRESS_FEATURE) {
        return `
          A realistic digital screenshot of an online news article.
          Header: A recognized GENERIC media logo (like 'Daily Health', 'TechInsider').
          Headline: "${parsedAngle.cleanAngle}".
          Image: High-quality candid photo of ${project.productName} embedded in the article body.
          Vibe: Editorial, Trustworthy.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.LEAD_MAGNET_3D) {
        return `
          A high-quality 3D render of a physical book or spiral-bound report sitting on a modern wooden desk.
          Title on Cover: "${parsedAngle.cleanAngle}".
          Cover Design: Bold typography, authoritative colors.
          Lighting: Cinematic, golden hour.
          Background: Blurry office.
          ${enhancer} ${safety}
        `;
    }

    if (format === CreativeFormat.MECHANISM_XRAY) {
      return `
        A scientific or medical illustration style (clean, 3D render or cross-section diagram).
        Subject: Visualizing the problem: "${parsedAngle.cleanAngle}".
        Detail: Show the biological or mechanical failure point clearly inside the body/object.
        Labeling: Add a red arrow pointing to the problem area.
        Vibe: Educational, shocking discovery.
        ${safety}
      `;
    }

    if (format === CreativeFormat.US_VS_THEM) {
      return `
        A split screen comparison image. 
        Left side (Them): Visualize the PAIN of "${parsedAngle.cleanAngle}". Gloomy lighting. Labeled "Them". 
        Right side (Us): Visualize the SOLUTION of "${parsedAngle.cleanAngle}". Bright lighting. Labeled "Us". 
        ${enhancer} ${safety}.
      `;
    }

    return ""; 
};

export const getDefaultPrompt = (ctx: PromptContext): string => {
    const { technicalPrompt, visualScene, visualStyle, enhancer, culturePrompt, moodPrompt, subjectFocus } = ctx;
    const safety = getSafetyGuidelines(false);
    
    if (technicalPrompt && technicalPrompt.length > 20) {
        return `${subjectFocus} ${technicalPrompt}. ${enhancer} ${culturePrompt} ${moodPrompt} ${safety}`;
    } else {
        return `${subjectFocus} ${visualScene}. Style: ${visualStyle || 'Natural'}. ${enhancer} ${culturePrompt} ${moodPrompt} ${safety}`;
    }
};
