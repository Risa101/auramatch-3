<!-- ---
name: design-web
description: Redesign or improve UI for any AuraMatch page. Use when user says "ออกแบบใหม่", "แก้หน้า", "ให้สวยขึ้น", "redesign", or "update UI". Applies brand guidelines and design system consistently.
argument-hint: "page-name or component description"
---

Redesign or improve the AuraMatch UI for: **$ARGUMENTS**

## Brand & Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary rose | `#D23669` | Buttons, headings, accents |
| Light pink | `#FF85A2` | Hover, gradients |
| Pale bg | `#FFEBF0` / `#FFF5F8` | Section backgrounds |
| Border | `#EEDDE4` / `#F3D5E0` | Card borders |
| Dark text | `#3A3437` | Body text |
| Gold | `#C5A358` | Premium accents |

### Typography (Tailwind)
- Headlines: `font-[900] tracking-tighter uppercase`
- Labels: `text-[9px] font-black uppercase tracking-widest`
- Body: `text-sm text-gray-500 leading-relaxed`
- Font family: Montserrat (loaded via Google Fonts in Navbar)

### Card style
```
rounded-[2.5rem] border border-[#EEDDE4] bg-white shadow-sm
hover:shadow-xl hover:-translate-y-1 transition-all duration-500
```

### Button styles
- Primary: `bg-[#D23669] text-white rounded-full font-black uppercase tracking-widest hover:bg-[#FF85A2]`
- Outline: `border-2 border-[#D23669] text-[#D23669] rounded-full font-black hover:bg-[#FFF5F8]`
- Ghost: `text-[#D23669] hover:bg-[#FFEBF0] rounded-full`

### Pill / Badge
```
text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full
bg-[#FFF5F8] text-[#D23669] border border-[#EEDDE4]
```

### Section header pattern
```jsx
<div className="inline-flex items-center gap-2 bg-[#D23669] text-white text-[9px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full mb-3">
  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" /> Section Title
</div>
<h2 className="text-4xl md:text-6xl font-[900] tracking-tighter text-[#3A3437] uppercase">Heading</h2>
```

## Stack
- **Tailwind CSS** — utility-first, no custom CSS unless animation
- **Framer Motion** — for page transitions and complex animations
- **AOS** — for scroll-reveal (`data-aos="fade-up"` `data-aos-delay={i*60}`)
- **Lucide React** — icons only (no emoji in UI unless user requests)

## Layout patterns used in this project
- Modal: `fixed inset-0 z-[100]` backdrop + `max-w-4xl rounded-[4rem]` content
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`
- Hero: full-width gradient bg + large `text-[8rem]` heading
- Before/After: `grid grid-cols-2 gap-2` with label above each image

## Pages & their files
| Page | File |
|------|------|
| Home | `src/pages/Home.jsx` |
| Analysis (face scan) | `src/pages/Analysis.jsx` |
| Makeup Looks | `src/pages/MakeupLooks.jsx` |
| Cosmetics shop | `src/pages/cosmeticPage.jsx` |
| Account / Profile | `src/pages/AccountProfile.jsx` |
| Analysis History | `src/pages/AnalysisHistory.jsx` |
| Advisor | `src/pages/Advisor.jsx` |
| Admin dashboard | `src/pages/admin/` |

## Design process
1. Read the current file to understand existing structure
2. Identify which section needs changing — don't rewrite the whole file
3. Apply brand guidelines above
4. Keep animations lightweight — prefer Tailwind transitions over Framer Motion for simple hover effects
5. Mobile-first: every layout must work at `sm` (375px) breakpoint
6. Use `aspect-square` or `aspect-[4/5]` for image containers — never fixed px heights on images
7. Prefer `gap-*` over margin for spacing inside flex/grid -->
