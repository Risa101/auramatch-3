// src/lib/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";


const savedLang = localStorage.getItem("lang") || "th";

const resources = {
  en: {
    translation: {

      /* ───────────────── NAVBAR ───────────────── */
      "nav.home": "HOME",
      "nav.analysis": "ANALYSIS",
      "nav.advisor": "ADVISOR",
      "nav.coupons": "COUPONS",
      "nav.about": "ABOUT US",
      "nav.look": "LOOK",
      "nav.cosmetics": "COSMETICS",
      "nav.tagline": "AI Beauty Advisor",
      "nav.login": "LOGIN",
      "nav.logout": "Sign out",
      "nav.account": "My Account",
      "nav.history": "Analysis history",

      /* ─────────────── COSMETICS ─────────────── */
      "cos.all": "All Cosmetics",
      "cos.blush": "Blush",
      "cos.contour": "Contour & Highlight",
      "cos.concealer": "Concealer",
      "cos.gloss": "Gloss",
      "cos.cushion": "Cushion",

      /* ───────────────── HOME PAGE ───────────────── */
      "home.pageTitle": "AuraMatch – AI Beauty Advisor",
      "home.hero.badge": "AI Beauty Advisor",
      "home.hero.title": "Aura Match",
      "home.hero.desc": "Define Your True Elegance",
      "home.hero.uploadBtn": "Upload photo",
      "home.hero.viewProductsBtn": "View products",
      "home.hero.meta":
        "Update color shades • Popular brands • Mobile support",
      "home.hero.imageAlt": "Model with soft natural makeup",

      "home.section.facialType": "Facial structure type",
      "home.section.personalColor": "Personal Color",
      "home.section.recommended": "Recommended products",
      "home.section.winterLooks": "Winter Looks",
      "home.section.tutorial": "Makeup Tutorial",

      "home.shape.round": "Round",
      "home.shape.oval": "Oval",
      "home.shape.square": "Square",
      "home.shape.heart": "Heart",
      "home.shape.triangle": "Triangle",
      "home.shape.diamond": "Diamond",
      "home.facial.selectedLabel": "Selected:",

      "home.season.spring": "Spring palette",
      "home.season.summer": "Summer palette",
      "home.season.autumn": "Autumn palette",
      "home.season.winter": "Winter palette",
      "home.personal.paletteLabel": "Color palette",

      "home.products.badge": "Bestseller",
      "home.products.pricePrefix": "THB",
      "home.products.buyNow": "BUY NOW",

      "home.winter.look1": "SUMMER LOOK",
      "home.winter.look2": "GLOSSY LOOK",
      "home.winter.look3": "DINNER LOOK",
      "home.winter.badge": "WINTER LOOK",
      "home.winter.seeMore": "See more",
      "home.winter.cardTooltip": "See more looks",

      "home.shorts.1": "La Glace New Lip Matte Swatches",
      "home.shorts.2": "La Glace Ultimate Baddie Lip Matte",
      "home.shorts.3": "La Glace Baddie Lip Matte 2023",
      "home.shorts.4": "La Glace Baddie Lip Matte 2023",
      "home.shorts.5": "La Glace Baddie Lip Matte 2023",
      "home.shorts.6": "La Glace Baddie Lip Matte 2023",
      "home.shorts.scrollLeft": "Scroll left",
      "home.shorts.scrollRight": "Scroll right",

      "home.footer.copy": "© 2025 AuraMatch. All rights reserved.",
      "home.footer.instagram": "Instagram",
      "home.footer.tiktok": "TikTok",
      "home.footer.facebook": "Facebook",

      /* ───────────────── ANALYSIS PAGE ───────────────── */
      analysis: {
        pageTitle: "AuraMatch – AI Facial & Color Analysis",

        hero: {
          badge: "AI Beauty Advisor",
          title: "Upload & analyze your personal color, features, and hair",
          desc:
            "Upload a front-facing portrait under natural light to let AI analyze your personal color, facial features, and hairstyle that best matches your proportions.",
          btnUpload: "Choose photo",
          btnAnalyze: "Analyze with AI",
          btnDemo: "Use demo photo",
          meta: "Supports mobile camera • JPG/PNG • up to ~10MB",
          previewAlt: "Your uploaded face photo",
          placeholderAlt: "Sample model used for analysis preview",
        },

        status: {
          uploading: "Uploading your photo…",
          analyzing: "Analyzing with AI…",
          done: "Analysis complete ✅",
        },

        error: {
          readFile: "Cannot read image file. Please try again.",
          noFile: "Please upload a face photo first.",
          analyzeFailed: "An error occurred while analyzing. Please try again.",
        },

        section: {
          personalColor: "Personal Color",
          feature: "Feature Analysis",
          styles: "Suggested Styles",
          hairProfile: "Hair Profile",
          hairStyles: "Recommended Hairstyles",
          hairColors: "Recommended Hair Colors",
          youtube: "YouTube Tutorials",
          products: "Recommended Products",
        },

        generic: {
          none: "-",
          noData: "No data yet.",
        },

        personal: {
          badge: "Season: {{season}}",
          previewAlt: "Your face image used for analysis",
          previewNote:
            "This is the image used for analysis (front view, soft natural light is recommended).",
          desc:
            "You are likely in the {{season}} season group, which is best matched with the palette below.",
          empty:
            "No data yet — upload a photo and tap “Analyze with AI”.",
        },

        feature: {
          meta: "Overall facial feature styling suggestions",
          eyebrows: "Eyebrows",
          eyes: "Eyes",
          nose: "Nose",
          lips: "Lips",
        },

        styles: {
          meta: "Suggested shapes and styles that flatter your features",
          brows: "Brows: {{style}}",
          eyes: "Eyes: {{style}}",
          nose: "Nose: {{style}}",
          lips: "Lips: {{style}}",
        },

        hair: {
          faceBadge: "Face shape: {{shape}}",
          faceShape: "Face Shape",
          length: "Hair Length",
          texture: "Hair Texture",
          empty:
            "No data yet — analyze first to see your hair profile.",
          cardNote: "Good for balancing facial proportions.",
        },

        hairStyles: {
          meta: "Based on your face shape: {{shape}}",
          noStyles:
            "No hairstyle suggestions are available for this face shape yet.",
          empty:
            "No data yet — analyze first to see hairstyle suggestions.",
          tip1:
            "Tip: Add volume where you want to balance proportions.",
          tip2:
            "Tip: Choose length that complements your jawline and neck.",
        },

        hairColors: {
          meta: "Based on personal color: {{season}}",
          desc:
            "These hair shades harmonize with the undertone and contrast of your {{season}} season. Try the swatches below.",
          empty:
            "Analyze your photo to see hair color shades that work best for you.",
        },

        youtube: {
          meta: "Scroll to explore more videos • Tap to play",
          prev: "Scroll tutorials left",
          next: "Scroll tutorials right",
        },

        products: {
          badge: "Recommended",
          pricePrefix: "THB",
          buyNow: "BUY NOW",
          meta: "For {{season}} tone",
          empty:
            "Upload a photo and tap “Analyze with AI” to see products that match your tone.",
          noneForSeason: "No products configured for this season yet.",
        },

        disclaimer:
          "*These suggestions are for general beauty advice only and are not a medical diagnosis.",

        sticky: {
          upload: "Upload",
          analyze: "Analyze",
        },
      },

      /* ───────────────── MAKEOVER STUDIO ───────────────── */
      makeover: {
        title: "Makeover Studio",
        subtitle: "Choose brows, eyes, lips, hairstyle and hair color",

        common: {
          none: "None",
        },

        tabs: {
          brows: "Brows",
          eyes: "Eyes",
          lips: "Lips",
          hairstyle: "Hairstyle",
          hairColor: "Hair Color",
        },

        brows: {
          none: "None",
          softArch: "Soft Arch",
          straight: "Straight",
          highArch: "High Arch",
          thin: "Thin",
          curve: "Curve",
        },

        eyes: {
          none: "None",
          natural: "Natural",
          catEye: "Cat Eye",
          dolly: "Dolly",
        },

        lips: {
          none: "None",
          red: "Red Lip",
          pink: "Pink Gloss",
          nude: "Nude Matte",
        },

        hairstyle: {
          none: "None",
          longLayer: "Long Layer",
          bobCut: "Bob Cut",
          airyBangs: "Airy Bangs",
        },

        hairColor: {
          none: "None",
          brown: "Brown",
          blonde: "Blonde",
          black: "Black",
        },

        buttons: {
          reset: "Reset",
          save: "Save Look",
        },
      },
      // เพิ่มต่อท้ายก้อน makeover ใน en: { translation: { ... } }
      advisor: {
        hero: { title: "Personal Advisor" },
        quiz: {
          ratio: {
            q: "What is your face ratio?",
            opt1: "Length and width are almost equal",
            opt2: "Length is significantly more than width",
            opt3: "Width is slightly more than length"
          },
          jaw: {
            q: "How would you describe your jawline?",
            opt1: "Soft and rounded",
            opt2: "Sharp and angular",
            opt3: "Pointed or V-shaped"
          },
          forehead: {
            q: "Which part of your face is the widest?",
            opt1: "Equally distributed",
            opt2: "The forehead area",
            opt3: "The jaw area"
          },
          cheekbone: {
            q: "Are your cheekbones prominent?",
            opt1: "High and very visible",
            opt2: "Subtle and balanced",
            opt3: "Soft and hidden"
          },
          chin: {
            q: "What does your chin look like?",
            opt1: "Small and rounded",
            opt2: "Pointed",
            opt3: "Square or flat"
          },
          overall: {
            q: "Overall, what is the most noticeable feature?",
            opt1: "Soft curves",
            opt2: "Strong lines/bones",
            opt3: "Tapered downwards"
          },
          restart: "Restart Quiz",
          next: "Next Question",
          finish: "See Result"
        },
        shape: {
          do: "Recommended Style",
          avoid: "Avoid",
          Round: { name: "Round Face", traits: "Soft features with equal width and length." },
          Oval: { name: "Oval Face", traits: "Balanced proportions, slightly longer than wide." },
          Square: { name: "Square Face", traits: "Strong jawline and broad forehead." },
          Heart: { name: "Heart Face", traits: "Wide forehead tapering to a narrow chin." },
          Triangle: { name: "Triangle Face", traits: "Narrow forehead with a wider jawline." },
          Diamond: { name: "Diamond Face", traits: "Wide cheekbones with narrow forehead and chin." }
        },
        faceResult: {
          badge: "Analysis Success",
          retry: "Try Again",
          toAnalysis: "Go to AI Analysis"
        }
      }
    },
  },


  /* ───────────────────────────── THAI ───────────────────────────── */
  th: {
    translation: {
      /* NAVBAR */
      "nav.home": "หน้าแรก",
      "nav.analysis": "วิเคราะห์ผิว",
      "nav.advisor": "ที่ปรึกษา",
      "nav.coupons": "คูปอง",
      "nav.about": "เกี่ยวกับเรา",
      "nav.look": "ลุคแต่งหน้า",
      "nav.cosmetics": "เครื่องสำอาง",
      "nav.tagline": "ผู้ช่วยด้านความงามด้วย AI",
      "nav.login": "เข้าสู่ระบบ",
      "nav.logout": "ออกจากระบบ",
      "nav.account": "บัญชีของฉัน",
      "nav.history": "ประวัติการวิเคราะห์",

      /* COSMETICS */
      "cos.all": "ดูเครื่องสำอางทั้งหมด",
      "cos.blush": "บลัชออน",
      "cos.contour": "คอนทัวร์ & ไฮไลต์",
      "cos.concealer": "คอนซีลเลอร์",
      "cos.gloss": "ลิปกลอส",
      "cos.cushion": "คุชชั่น",

      /* HOME PAGE */
      "home.pageTitle": "AuraMatch – ผู้ช่วยความงามด้วย AI",
      "home.hero.badge": "ผู้ช่วยด้านความงามด้วย AI",
      "home.hero.title": "Aura Match",
      "home.hero.desc": "นิยามความสง่างามที่แท้จริงของคุณ",
      "home.hero.uploadBtn": "อัปโหลดรูป",
      "home.hero.viewProductsBtn": "ดูสินค้า",
      "home.hero.meta":
        "อัปเดตเฉดสี • แบรนด์ยอดนิยม • รองรับการใช้งานบนมือถือ",
      "home.hero.imageAlt": "นางแบบแต่งหน้าธรรมชาติในโทนหวาน",

      "home.section.facialType": "ประเภทโครงหน้า",
      "home.section.personalColor": "โทนสีผิว (Personal Color)",
      "home.section.recommended": "สินค้าแนะนำ",
      "home.section.winterLooks": "ลุคแต่งหน้าสำหรับโทน Winter",
      "home.section.tutorial": "วิดีโอสอนแต่งหน้า",

      "home.shape.round": "หน้าเรียวกลม (Round)",
      "home.shape.oval": "หน้าเรียวยาว (Oval)",
      "home.shape.square": "หน้าเหลี่ยม (Square)",
      "home.shape.heart": "หน้าหัวใจ (Heart)",
      "home.shape.triangle": "หน้าสามเหลี่ยม (Triangle)",
      "home.shape.diamond": "หน้าเพชร (Diamond)",
      "home.facial.selectedLabel": "โครงหน้าที่เลือก:",

      "home.season.spring": "โทน Spring",
      "home.season.summer": "โทน Summer",
      "home.season.autumn": "โทน Autumn",
      "home.season.winter": "โทน Winter",
      "home.personal.paletteLabel": "โทนสีที่เหมาะกับคุณ",

      "home.products.badge": "สินค้าขายดี",
      "home.products.pricePrefix": "฿",
      "home.products.buyNow": "ซื้อเลย",

      "home.winter.look1": "ลุค SUMMER LOOK",
      "home.winter.look2": "ลุค GLOSSY LOOK",
      "home.winter.look3": "ลุค DINNER LOOK",
      "home.winter.badge": "ลุค Winter",
      "home.winter.seeMore": "ดูเพิ่มเติม",
      "home.winter.cardTooltip": "ดูไอเดียลุคแต่งหน้าเพิ่มเติม",

      "home.shorts.1": "สวอชลิปแมตต์ La Glace คอลเลคชันใหม่",
      "home.shorts.2": "La Glace Ultimate Baddie Lip Matte",
      "home.shorts.3": "La Glace Baddie Lip Matte 2023",
      "home.shorts.4": "สวอชสีลิปแมตต์โทนบ๊าดดี้",
      "home.shorts.5": "รวมลุคแต่งหน้ากับลิป La Glace",
      "home.shorts.6": "ไอเดียทาลิปแมตต์ให้ปากสวยฟู",
      "home.shorts.scrollLeft": "เลื่อนไปทางซ้าย",
      "home.shorts.scrollRight": "เลื่อนไปทางขวา",

      "home.footer.copy": "© 2025 AuraMatch สงวนลิขสิทธิ์ทั้งหมด",
      "home.footer.instagram": "อินสตาแกรม",
      "home.footer.tiktok": "ติ๊กต็อก",
      "home.footer.facebook": "เฟซบุ๊ก",

      /* ANALYSIS PAGE */
      analysis: {
        pageTitle: "AuraMatch – วิเคราะห์โทนสีและโครงหน้าด้วย AI",

        hero: {
          badge: "ผู้ช่วยด้านความงามด้วย AI",
          title:
            "อัปโหลดรูปเพื่อวิเคราะห์โทนสีผิว โครงหน้า และทรงผมที่เหมาะกับคุณ",
          desc:
            "อัปโหลดภาพหน้าตรงในสภาพแสงธรรมชาติ เพื่อให้ AI วิเคราะห์ Personal Color องค์ประกอบใบหน้า และทรงผมที่บาลานซ์กับสัดส่วนของคุณ",
          btnUpload: "เลือกรูปจากโทรศัพท์",
          btnAnalyze: "วิเคราะห์ด้วย AI",
          btnDemo: "ใช้รูปตัวอย่าง",
          meta: "รองรับกล้องมือถือ • ไฟล์ JPG/PNG • ขนาดไม่เกิน ~10MB",
          previewAlt: "รูปใบหน้าที่คุณอัปโหลด",
          placeholderAlt: "ตัวอย่างนางแบบสำหรับแสดงผลการวิเคราะห์",
        },

        status: {
          uploading: "กำลังอัปโหลดภาพ…",
          analyzing: "กำลังวิเคราะห์ด้วย AI…",
          done: "วิเคราะห์เสร็จแล้ว ✅",
        },

        error: {
          readFile: "ไม่สามารถอ่านไฟล์ภาพได้ กรุณาลองใหม่อีกครั้ง",
          noFile: "กรุณาอัปโหลดภาพใบหน้าก่อน",
          analyzeFailed:
            "เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง",
        },

        section: {
          personalColor: "Personal Color (โทนสีผิว)",
          feature: "วิเคราะห์องค์ประกอบใบหน้า",
          styles: "สไตล์ที่แนะนำ",
          hairProfile: "โปรไฟล์เส้นผม",
          hairStyles: "ทรงผมที่เหมาะกับคุณ",
          hairColors: "เฉดสีผมที่แนะนำ",
          youtube: "วิดีโอสอนแต่งหน้า",
          products: "ผลิตภัณฑ์ที่เหมาะกับคุณ",
        },

        generic: {
          none: "-",
          noData: "ยังไม่มีข้อมูล",
        },

        personal: {
          badge: "ฤดู: {{season}}",
          previewAlt: "รูปใบหน้าที่ใช้ในการวิเคราะห์",
          previewNote:
            "รูปที่ใช้วิเคราะห์ (แนะนำมุมตรง แสงธรรมชาติจะให้ผลที่แม่นยำมากขึ้น)",
          desc:
            "จากการวิเคราะห์ คุณมีแนวโน้มอยู่ในฤดู {{season}} ซึ่งเหมาะกับโทนสีตามพาเล็ตต์ด้านล่าง",
          empty: "ยังไม่มีข้อมูล — อัปโหลดรูปและกด “วิเคราะห์ด้วย AI”",
        },

        feature: {
          meta:
            "คำแนะนำภาพรวมสำหรับการจัดทรงคิ้ว ดวงตา จมูก และริมฝีปาก",
          eyebrows: "คิ้ว",
          eyes: "ดวงตา",
          nose: "จมูก",
          lips: "ริมฝีปาก",
        },

        styles: {
          meta:
            "ทรง/สไตล์ที่ช่วยเสริมจุดเด่นและบาลานซ์ใบหน้าของคุณ",
          brows: "Brows: {{style}}",
          eyes: "Eyes: {{style}}",
          nose: "Nose: {{style}}",
          lips: "Lips: {{style}}",
        },

        hair: {
          faceBadge: "รูปหน้า: {{shape}}",
          faceShape: "รูปหน้า",
          length: "ความยาวผม",
          texture: "ลักษณะเส้นผม",
          empty:
            "ยังไม่มีข้อมูล — กรุณาวิเคราะห์ก่อนเพื่อดูโปรไฟล์เส้นผม",
          cardNote: "ช่วยบาลานซ์สัดส่วนใบหน้าให้ดูสมส่วนมากขึ้น",
        },

        hairStyles: {
          meta: "อิงจากรูปหน้า {{shape}}",
          noStyles: "ยังไม่มีคำแนะนำทรงผมสำหรับรูปหน้านี้",
          empty:
            "ยังไม่มีข้อมูล — กรุณาวิเคราะห์ก่อนเพื่อดูทรงผมที่เหมาะ",
          tip1:
            "Tip: เพิ่มวอลุ่มที่บริเวณที่ต้องการบาลานซ์สัดส่วนใบหน้า",
          tip2:
            "Tip: เลือกความยาวให้พอดีกับสัดส่วนคางและความยาวคอ",
        },

        hairColors: {
          meta: "อิงจาก Personal Color: {{season}}",
          desc:
            "เฉดสีผมเหล่านี้เข้ากับอุณหภูมิผิวและคอนทราสต์ของโทน {{season}} สามารถใช้เป็นไอเดียเลือกสีทำสีผมได้",
          empty: "อัปโหลดรูปและวิเคราะห์ เพื่อดูเฉดสีผมที่เหมาะกับคุณ",
        },

        youtube: {
          meta: "เลื่อนเพื่อดูหลายคลิป • แตะเพื่อเล่นวิดีโอ",
          prev: "เลื่อนวิดีโอไปทางซ้าย",
          next: "เลื่อนวิดีโอไปทางขวา",
        },

        products: {
          badge: "สินค้าแนะนำ",
          pricePrefix: "฿",
          buyNow: "ซื้อเลย",
          meta: "สำหรับโทน {{season}}",
          empty:
            "อัปโหลดรูปและกด “วิเคราะห์ด้วย AI” เพื่อดูผลิตภัณฑ์ที่เหมาะกับโทนสีของคุณ",
          noneForSeason: "ยังไม่มีสินค้าสำหรับฤดูนี้",
        },

        disclaimer:
          "*คำแนะนำนี้จัดทำเพื่อการแนะนำด้านความงามทั่วไป ไม่ใช่การวินิจฉัยทางการแพทย์",

        sticky: {
          upload: "อัปโหลดรูป",
          analyze: "วิเคราะห์",
        },
      },

      /* MAKEOVER STUDIO */
      makeover: {
        title: "Makeover Studio",
        subtitle: "เลือกคิ้ว – ตา – ปาก – ทรงผม – สีผม ที่คุณต้องการ",

        common: {
          none: "ไม่เลือก",
        },

        tabs: {
          brows: "คิ้ว",
          eyes: "ดวงตา",
          lips: "ริมฝีปาก",
          hairstyle: "ทรงผม",
          hairColor: "สีผม",
        },

        brows: {
          none: "ไม่เลือก",
          softArch: "คิ้วโค้งนุ่ม",
          straight: "คิ้วตรง",
          highArch: "คิ้วโก่ง",
          thin: "คิ้วเส้นบาง",
          curve: "คิ้วโค้ง",
        },

        eyes: {
          none: "ไม่เลือก",
          natural: "ธรรมชาติ",
          catEye: "คาเทอาย",
          dolly: "ดอลลี่",
        },

        lips: {
          none: "ไม่เลือก",
          red: "ปากแดง",
          pink: "ชมพู",
          nude: "นู้ด",
        },

        hairstyle: {
          none: "ไม่เลือก",
          longLayer: "ผมยาวเลเยอร์",
          bobCut: "บ็อบ",
          airyBangs: "หน้าม้า Airy",
        },

        hairColor: {
          none: "ไม่เลือกสีผม",
          brown: "น้ำตาล",
          blonde: "บลอนด์",
          black: "ดำ",
        },

        buttons: {
          reset: "รีเซ็ต",
          save: "บันทึกผลลัพธ์",
        },
      },
      /* ───────────────── ADVISOR (ที่ปรึกษา) ───────────────── */
      advisor: {
        hero: {
          title: "Personal Advisor"
        },
        quiz: {
          ratio: {
            q: "สัดส่วนใบหน้าของคุณเป็นอย่างไร?",
            opt1: "ความกว้างและความยาวพอๆ กัน",
            opt2: "ความยาวมากกว่าความกว้างอย่างเห็นได้ชัด",
            opt3: "ความกว้างช่วงโหนกแก้มมากกว่าความยาวเล็กน้อย"
          },
          jaw: {
            q: "ลักษณะแนวกรามของคุณเป็นแบบไหน?",
            opt1: "โค้งมน นุ่มนวล",
            opt2: "เป็นเหลี่ยมชัดเจน",
            opt3: "แหลม หรือเป็นรูปตัว V"
          },
          forehead: {
            q: "ส่วนไหนของใบหน้ากว้างที่สุด?",
            opt1: "กว้างเท่าๆ กันทุกส่วน",
            opt2: "หน้าผากกว้างที่สุด",
            opt3: "กรามกว้างที่สุด"
          },
          cheekbone: {
            q: "โหนกแก้มของคุณชัดเจนไหม?",
            opt1: "ชัดเจนมากและอยู่ตำแหน่งสูง",
            opt2: "เห็นได้ชัดแต่มีความสมดุล",
            opt3: "ไม่ค่อยชัดเจนหรือค่อนข้างนุ่มนวล"
          },
          chin: {
            q: "ลักษณะคางของคุณเป็นอย่างไร?",
            opt1: "เล็กและโค้งมน",
            opt2: "แหลมหรือยาว",
            opt3: "เป็นเหลี่ยมหรือตัดตรง"
          },
          overall: {
            q: "โดยรวมแล้ว จุดเด่นที่สุดบนใบหน้าคุณคืออะไร?",
            opt1: "เส้นสายที่มีความโค้งมน",
            opt2: "โครงกระดูกหรือกรามที่ชัดเจน",
            opt3: "ส่วนล่างของหน้าค่อยๆ สอบแหลมลงไป"
          },
          restart: "เริ่มทำแบบทดสอบใหม่",
          next: "ข้อต่อไป",
          finish: "ดูผลลัพธ์"
        },
        shape: {
          do: "สไตล์ที่แนะนำ",
          avoid: "สิ่งที่ควรเลี่ยง",
          Round: { 
            name: "หน้ากลม (Round Face)", 
            traits: "ใบหน้ามีความโค้งมน ความกว้างและความยาวเกือบเท่ากัน" 
          },
          Oval: { 
            name: "หน้าเรียว (Oval Face)", 
            traits: "สัดส่วนสมดุล มีความยาวมากกว่าความกว้างเล็กน้อย" 
          },
          Square: { 
            name: "หน้าเหลี่ยม (Square Face)", 
            traits: "แนวกรามชัดเจน หน้าผากและกรามกว้างพอๆ กัน" 
          },
          Heart: { 
            name: "รูปหน้าหัวใจ (Heart Face)", 
            traits: "หน้าผากกว้างและค่อยๆ สอบแหลมลงไปที่คาง" 
          },
          Triangle: { 
            name: "หน้าทรงสามเหลี่ยม (Triangle Face)", 
            traits: "หน้าผากแคบและกว้างออกที่ช่วงแนวกราม" 
          },
          Diamond: { 
            name: "หน้าทรงเพชร (Diamond Face)", 
            traits: "โหนกแก้มชัดและกว้าง หน้าผากและคางแคบ" 
          }
        },
        faceResult: {
          badge: "วิเคราะห์สำเร็จ",
          retry: "ทดสอบใหม่อีกครั้ง",
          toAnalysis: "ไปหน้าวิเคราะห์ด้วย AI"
        },
        learn: {
          whatis: {
            title: "Personal Color คืออะไร?",
            desc: "คือการหาโทนสีที่เข้ากับเรามากที่สุด โดยวิเคราะห์จาก Undertone ผิว, สีตา, และสีผมตามธรรมชาติ เพื่อช่วยขับผิวให้ดูเปล่งประกาย",
            tag: {
              undertone: "อันเดอร์โทน",
              value: "ความสว่าง",
              chroma: "ความสดของสี",
              contrast: "คอนทราสต์"
            }
          },
          axis: {
            title: "แกนการวิเคราะห์",
            undertone: "อุณหภูมิสีผิว (ร้อน/เย็น)",
            value: "น้ำหนักความอ่อนเข้ม",
            chroma: "ความสดใสหรือความหม่น",
            contrast: "ความแตกต่างของสีผิวและเส้นผม"
          },
          selfcheck: {
            title1: "วิธีการเช็คเบื้องต้น",
            item1: "ตรวจสอบสีเส้นเลือดที่ข้อมือ",
            item2: "เทียบผิวกับเครื่องประดับทองและเงิน",
            item3: "สังเกตสีผิวเมื่อออกแดด",
            item4: "ใช้กระดาษสีเทียบข้างใบหน้า",
            note: "*แนะนำให้เช็คภายใต้แสงธรรมชาติ",
            title2: "เช็ค Undertone",
            test1: "เส้นเลือดสีม่วง/น้ำเงิน = Cool Tone",
            test2: "เส้นเลือดสีเขียว = Warm Tone",
            test3: "เส้นเลือดหลายสี = Neutral Tone",
            test4: "ใส่สีขาวแล้วผิวผ่อง = Cool / สีครีมแล้วผิวผ่อง = Warm"
          }
        },
        accordion: {
          basics: "พื้นฐานความงาม",
          seasons: "พาเล็ตต์สีทั้ง 4 ฤดู",
          selfCheck: "วิธีวิเคราะห์ตัวเองเบื้องต้น"
        },
        season: {
          Spring: {
            name: "ฤดูใบไม้ผลิ (Spring)",
            undertone: "Warm Tone",
            desc: "สดใส มีพลัง เหมือนแสงแดดยามเช้า",
            best: ["สีส้มพีช", "สีเขียวแอปเปิ้ล", "สีเหลืองทอง"],
            avoid: ["สีดำสนิท", "สีเทาหม่น"],
            makeup: ["สีส้มชานม", "สีชมพูพีช"],
            hair: ["น้ำตาลทอง", "น้ำตาลน้ำผึ้ง"],
            metal: "ทองเหลืองเงา",
            palette: ["#FFB347", "#FFCC33", "#99CC33", "#F08080"]
          },
          Summer: {
            name: "ฤดูร้อน (Summer)",
            undertone: "Cool Tone",
            desc: "นุ่มนวล ละมุนตา เหมือนสีพาสเทล",
            best: ["สีชมพูนม", "สีฟ้าลาเวนเดอร์", "สีเทาควันบุหรี่"],
            avoid: ["สีส้มสด", "สีเหลืองสด"],
            makeup: ["สีชมพูกุหลาบ", "สีม่วงอ่อน"],
            hair: ["น้ำตาลหม่น", "เทาหม่น"],
            metal: "เงินผิวแมตต์",
            palette: ["#F4C2C2", "#B19CD9", "#AEC6CF", "#CFCFC4"]
          },
          Autumn: {
            name: "ฤดูใบไม้ร่วง (Autumn)",
            undertone: "Warm Tone",
            desc: "อบอุ่น มั่นคง เหมือนสีของป่าไม้",
            best: ["สีส้มอิฐ", "สีเขียวขี้ม้า", "สีน้ำตาลไหม้"],
            avoid: ["สีชมพูบานเย็น", "สีฟ้าสด"],
            makeup: ["สีส้มอิฐ", "สีแดงก่ำ"],
            hair: ["น้ำตาลแดง", "ช็อกโกแลต"],
            metal: "ทองโบราณ",
            palette: ["#8B4513", "#556B2F", "#D2691E", "#B8860B"]
          },
          Winter: {
            name: "ฤดูหนาว (Winter)",
            undertone: "Cool Tone",
            desc: "ชัดเจน โดดเด่น มีคอนทราสต์สูง",
            best: ["สีแดงสด", "สีน้ำเงินเข้ม", "สีดำ", "สีขาว"],
            avoid: ["สีส้ม", "สีน้ำตาลทอง"],
            makeup: ["สีแดงเชอร์รี่", "สีชมพูสด"],
            hair: ["ดำสนิท", "น้ำตาลเข้มจัด"],
            metal: "เงินเงา หรือแพลทินัม",
            palette: ["#FF0000", "#0000FF", "#000000", "#FFFFFF"]
          }
        }
      }
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "th",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = savedLang;

export default i18n;
