# HILLSTOURISM --- Frontend Redesign SDD

## 1. Document Control

  Field                 Details
  --------------------- ------------------------------------------------
  Project               Hillstourism Website Redesign
  Product Type          Premium Tourism / Travel Experience Website
  Primary Destination   Hill / Mountain Tourism
  Design Direction      Cinematic, premium, immersive, nature-first
  Brand Asset           `hillstourism logo.png`
  Hero Interaction      290-frame scroll-controlled cinematic sequence
  Core Interaction      Scroll storytelling + 3D carousel + parallax
  Primary Conversion    Plan a Trip / Enquiry / Chatbot
  Status                Frontend redesign specification
  Version               1.0

------------------------------------------------------------------------

# 2. Product Vision

The website must not feel like a generic tourism template.

It should feel like:

> **Entering the hills, not browsing a website.**

The first impression must immediately communicate:

-   premium travel experience
-   mountain / nature identity
-   local expertise
-   adventure
-   trust
-   modern technology
-   strong visual storytelling

The website should be designed to make a client think:

> **"This looks like a premium tourism brand, not a normal travel
> website."**

The current business information architecture is inspired by the
following structure:

``` text
Navigation
Hero
Trip Finder
Statistics
Trip Types
Packages
Experiences
Gallery
Why Hillstourism
Testimonials
Stays
Smart Stay Matching
Vehicles
Trip Enquiry
Footer
```

However, the visual hierarchy must be redesigned substantially rather
than copied literally.

------------------------------------------------------------------------

# 3. Brand Direction

## 3.1 Logo Analysis

The supplied Hillstourism logo contains:

-   deep navy blue
-   bright/electric blue
-   white
-   natural green
-   mountain imagery
-   road/travel imagery
-   a large `H` monogram
-   premium outlined typography

The website color system must be derived from the logo.

## 3.2 Recommended Design Tokens

``` css
--hill-navy: #001040;
--hill-navy-deep: #00091F;
--hill-blue: #0050C0;
--hill-blue-bright: #0878FF;
--hill-blue-soft: #DCEBFF;
--hill-green: #2A5416;
--hill-green-bright: #5F9E2F;
--hill-white: #F7F9FC;
--hill-surface: #EEF3F8;
--hill-text: #07152F;
--hill-muted: #667085;
--hill-border: rgba(0, 16, 64, 0.12);
```

### Color rule

Use navy as the dominant brand anchor.

Use bright blue for:

-   primary CTA
-   active navigation
-   interactive highlights
-   progress indicators
-   chatbot accents

Use green sparingly for:

-   nature badges
-   eco/travel indicators
-   subtle decorative details

Do NOT turn the website into a green eco-tourism template.

The logo is fundamentally **navy + blue + white with natural green
accents**.

------------------------------------------------------------------------

# 4. Typography

The typography should feel editorial and premium.

Recommended pairing:

### Display

``` text
Manrope / Sora / Plus Jakarta Sans
```

### Body

``` text
Inter / Manrope
```

Use:

-   oversized display typography
-   tight heading tracking
-   comfortable body line height
-   strong contrast
-   restrained font weights

Hero headline should be large and cinematic.

Example:

``` text
ESCAPE
INTO THE
HILLS.
```

or

``` text
WHERE THE
MOUNTAINS
BEGIN.
```

Do not force this exact copy if the existing content already has
approved client copy.

------------------------------------------------------------------------

# 5. Global UX Principles

## 5.1 Design Principles

1.  Cinematic before informational.
2.  Visual hierarchy before dense content.
3.  One clear action per section.
4.  Use motion to explain, not distract.
5.  Maintain accessibility despite animation.
6.  Every section should have a visual reason to exist.
7.  Keep generous whitespace.
8.  Avoid generic card-grid repetition.
9.  Use depth, layering and spatial transitions.
10. Mobile must remain intentionally designed, not merely responsive.

## 5.2 Motion Principles

Motion should have:

-   inertia
-   easing
-   depth
-   continuity
-   controlled reveal
-   natural parallax

Avoid:

-   excessive bouncing
-   random fade-ins
-   animation on every element
-   distracting infinite loops
-   excessive blur
-   scroll-jank

------------------------------------------------------------------------

# 6. Site Architecture

``` text
HILLSTOURISM
│
├── Fixed Navigation
│
├── HERO EXPERIENCE
│   ├── 290-frame cinematic sequence
│   ├── Hero copy
│   ├── Explore Journey
│   ├── Plan Your Trip
│   ├── frame progress
│   └── scroll guidance
│
├── JOURNEY INTRO
│   ├── destination statement
│   ├── visual story
│   └── parallax landscape
│
├── TRIP FINDER
│   ├── Duration
│   ├── Budget
│   ├── Trip Type
│   └── Find My Trip
│
├── STATS
│
├── TRIP TYPES
│   ├── Couple Escapes
│   ├── Family Trips
│   ├── Friends & Groups
│   └── Trekking Adventures
│
├── PACKAGES
│   ├── All
│   ├── Couple
│   ├── Family
│   ├── Wildlife
│   └── Trekking
│
├── EXPERIENCES
│   ├── Tea Estate Walk
│   ├── Hairpin Bends
│   ├── Waterfalls
│   └── Forest / Wildlife
│
├── GALLERY
│   └── Cinematic image composition
│
├── WHY HILLSTOURISM
│   ├── Local expertise
│   ├── Nature-first
│   ├── Local partners
│   └── Human trip support
│
├── TESTIMONIALS
│
├── STAYS
│   ├── All
│   ├── Normal
│   ├── Premium
│   └── 5 Star
│
├── SMART STAY MATCHING
│
├── VEHICLES
│   ├── Driver available
│   ├── Local routes
│   └── Flexible pickup
│
├── TRIP ENQUIRY
│
├── AI TRAVEL CHATBOT
│
└── FOOTER
```

------------------------------------------------------------------------

# 7. HERO --- PRIMARY EXPERIENCE

## 7.1 Hero Objective

The hero is the most important part of the entire website.

It must create an immediate emotional reaction.

The supplied **290-frame sequence must be the hero's main visual
engine**.

Do not treat the frames as a normal slideshow.

They are a **scroll-controlled cinematic sequence**.

------------------------------------------------------------------------

# 8. 290-Frame Scroll Experience

## 8.1 Required Behavior

The hero should occupy a pinned viewport.

Conceptually:

``` text
Page Scroll
    ↓
Hero becomes pinned
    ↓
Scroll progress starts
    ↓
Frame 001
    ↓
Frame 002
    ↓
Frame 003
    ↓
...
    ↓
Frame 289
    ↓
Frame 290
    ↓
Hero animation complete
    ↓
Normal page scrolling resumes
    ↓
Journey section
```

### Critical requirement

The user must NOT leave the hero before frame 290 has completed.

If the user performs a normal continuous scroll gesture:

``` text
scroll
→ hero remains pinned
→ frame advances
→ frame advances
→ ...
→ frame 290
→ only then next section becomes reachable
```

This behavior is mandatory.

------------------------------------------------------------------------

# 9. Hero Technical Implementation

Use the existing project stack wherever possible.

If GSAP is already available, use:

``` text
GSAP
ScrollTrigger
```

If not installed, add it only if appropriate.

Avoid replacing the entire project architecture.

## 9.1 Recommended structure

``` text
HeroSection
├── HeroCanvas / FrameRenderer
├── HeroOverlay
│   ├── eyebrow
│   ├── heading
│   ├── description
│   └── CTA group
├── FrameProgress
├── ScrollIndicator
└── HeroTransition
```

## 9.2 Frame rendering

Prefer a `<canvas>` renderer for performance if the current
implementation can support it.

Requirements:

-   preload frames intelligently
-   avoid decoding all 290 full-resolution images simultaneously if
    memory becomes excessive
-   use requestAnimationFrame where appropriate
-   map scroll progress `[0, 1]` to frame index `[0, 289]`
-   render the nearest frame
-   handle resize correctly
-   maintain correct aspect ratio
-   prevent image distortion
-   avoid layout shift

Pseudo logic:

``` js
const progress = clamp(scrollProgress, 0, 1);

const frameIndex = Math.min(
  289,
  Math.floor(progress * 290)
);

renderFrame(frameIndex);
```

------------------------------------------------------------------------

# 10. Hero Layout

Desktop:

``` text
┌─────────────────────────────────────────────┐
│ LOGO        NAVIGATION          PLAN TRIP   │
│                                             │
│                                             │
│       cinematic 290-frame landscape         │
│                                             │
│   ┌──────────────────────────────┐          │
│   │ SMALL EYEBROW                │          │
│   │                              │          │
│   │ Discover the                 │          │
│   │ Hills Differently.           │          │
│   │                              │          │
│   │ short supporting copy        │          │
│   │                              │          │
│   │ [Explore Journey] [Plan Trip]│          │
│   └──────────────────────────────┘          │
│                                             │
│                    001 / 290        ↓       │
└─────────────────────────────────────────────┘
```

The hero text should remain readable while allowing the visual sequence
to dominate.

Use subtle gradient overlays only where necessary.

Do NOT put a huge opaque text panel over the cinematic imagery.

------------------------------------------------------------------------

# 11. Hero Progress UI

Add a minimal progress indicator.

Example:

``` text
01
───────●──────────────
290
```

or:

``` text
FRAME 124 / 290
```

The indicator should communicate that the hero is interactive.

Do not make it visually dominant.

------------------------------------------------------------------------

# 12. Hero CTA Behavior

Primary CTA:

``` text
Explore Journey
```

Secondary CTA:

``` text
Plan Your Trip
```

### Explore Journey

Smoothly transitions the user into the Journey section.

### Plan Your Trip

Scrolls toward the Trip Finder / enquiry experience.

Important:

The CTA must not break the 290-frame interaction unexpectedly.

If clicked before the cinematic sequence completes, the preferred
behavior is to smoothly complete/transition the hero experience rather
than abruptly teleporting the page.

------------------------------------------------------------------------

# 13. Journey Section

Immediately after the cinematic hero:

## Heading

``` text
The hills are calling.
```

or approved destination copy.

Use:

-   oversized typography
-   layered landscape imagery
-   subtle depth
-   horizontal movement
-   image reveal
-   parallax

The transition should feel like the cinematic hero has **opened into the
website**, not like a hard section break.

------------------------------------------------------------------------

# 14. Parallax System

Use at least three visual depth layers where appropriate:

``` text
Background mountains
        ↓ slowest

Middle forest
        ↓ medium

Foreground object / typography
        ↓ fastest
```

Suggested movement:

``` text
background: 0.10x
middle:     0.25x
foreground: 0.40x
```

These are starting values, not fixed requirements.

Parallax must remain subtle.

Avoid motion sickness and excessive displacement.

------------------------------------------------------------------------

# 15. 3D Carousel

Create a premium 3D carousel for selected content, preferably Trip Types
or Experiences.

Example:

``` text
                  [ CARD ]
            [ CARD ]   [ CARD ]
       [ CARD ]             [ CARD ]
```

The active card should have:

-   scale 1.0
-   highest opacity
-   stronger shadow
-   slightly greater depth

Side cards:

-   scale 0.82--0.92
-   reduced opacity
-   perspective rotation
-   partial visibility

Use CSS:

``` css
perspective
transform
translateZ
rotateY
scale
```

or a robust carousel library if already used in the project.

The carousel should support:

-   mouse drag
-   touch swipe
-   wheel interaction where appropriate
-   keyboard navigation
-   pagination
-   active-state transition

Do not make the carousel difficult to control.

------------------------------------------------------------------------

# 16. Trip Finder

## UI

``` text
Find your perfect mountain escape

[ Duration ]
[ Budget ]
[ Trip Type ]

[ Find My Trip ]
```

Example values:

### Duration

``` text
1–2 Days
3–4 Days
5+ Days
```

### Budget

``` text
Budget
Comfort
Premium
Luxury
```

### Trip Type

``` text
Couple
Family
Friends
Adventure
Wildlife
```

The result should update package recommendations.

If a backend is not available, implement a deterministic frontend
filtering system rather than pretending there is an AI algorithm.

------------------------------------------------------------------------

# 17. Statistics

Use a visually minimal number strip.

Example:

``` text
10K+
Travelers

50+
Curated Experiences

4.9/5
Traveler Rating

100%
Hill Focused
```

Do not hard-code fake numbers unless they are approved client data.

If real values are unavailable, use neutral placeholders or configurable
constants.

------------------------------------------------------------------------

# 18. Trip Type Discovery

Use the 3D carousel here if it provides the strongest visual result.

Categories:

``` text
Couple Escapes
Family Adventures
Friends & Groups
Trekking Adventures
```

Each card should have:

-   destination image
-   short description
-   small category label
-   CTA
-   hover depth
-   image scale on hover

------------------------------------------------------------------------

# 19. Packages

Section heading:

``` text
Curated journeys,
built around you.
```

Filters:

``` text
All | Couple | Family | Wildlife | Trekking
```

Package card:

``` text
┌─────────────────────────────┐
│                             │
│         IMAGE               │
│                             │
├─────────────────────────────┤
│ CATEGORY                    │
│ Package Name                │
│ Short description           │
│                             │
│ 3 Days · 2 Nights           │
│ Starting from ₹XXXX         │
│                             │
│ View Journey →              │
└─────────────────────────────┘
```

Use horizontal movement or staggered reveals instead of a generic
four-column grid.

------------------------------------------------------------------------

# 20. Experiences

Create an editorial experience layout.

Content:

-   Tea Estate Walk
-   40 Hairpin Bends
-   Waterfalls
-   Forest & Wildlife Drive

Recommended interaction:

``` text
large featured image
        +
small stacked experience list
        +
active item changes image
```

This is more premium than four equal cards.

------------------------------------------------------------------------

# 21. Gallery

Create a cinematic masonry/editorial gallery.

Avoid:

``` text
[image][image][image][image]
```

Prefer:

``` text
        large image
small image     tall image
        wide image
```

Use scroll reveal and subtle image scale.

No excessive carousel behavior in the gallery.

------------------------------------------------------------------------

# 22. Why Hillstourism

Use four feature blocks:

### Local Expertise

Know the roads, seasons and hidden corners.

### Nature First

Experiences designed around the landscape.

### Local Partners

Trusted stays and local experience hosts.

### Human Support

Real help before and during the trip.

Visual treatment:

-   large number `01 / 02 / 03 / 04`
-   icon or subtle line illustration
-   short copy
-   animated reveal

------------------------------------------------------------------------

# 23. Testimonials

Use a premium horizontal testimonial slider.

Include:

-   rating
-   quote
-   traveller name
-   trip type
-   optional destination image

Animation should be slow and intentional.

------------------------------------------------------------------------

# 24. Stays

Categories:

``` text
All
Normal
Premium
5 Star
```

Cards should show:

-   image
-   name
-   location
-   category
-   rating
-   price / night
-   amenities
-   View Stay

Use image hover zoom.

------------------------------------------------------------------------

# 25. Smart Stay Matching

Create a compact interactive module.

``` text
Not sure where to stay?

Tell us:

Budget
Group size
Comfort level

[ Match My Stay ]
```

Return a small recommendation card.

If no backend exists, use frontend rules.

Example:

``` js
if (budget === "premium" && comfort === "high") {
   return premiumStays;
}
```

Do not claim real-time availability unless connected to a real booking
system.

------------------------------------------------------------------------

# 26. Vehicles

Vehicle section should feel practical but premium.

Show:

-   vehicle image
-   passenger capacity
-   luggage capacity
-   driver availability
-   local route support
-   flexible pickup

Possible layout:

``` text
             VEHICLE IMAGE
        ┌─────────────────────┐
        │                     │
        │                     │
        └─────────────────────┘

 SUV / Traveller
 6 Seats · Driver Available

 [Choose Vehicle]
```

------------------------------------------------------------------------

# 27. AI / Travel Chatbot

Add a floating chatbot called:

``` text
HillGuide
```

or:

``` text
Hillstourism Travel Assistant
```

## Default launcher

Bottom-right:

``` text
        ┌──────────────────────┐
        │ Need help planning?  │
        │ Chat with HillGuide  │
        └──────────────────────┘
                    ●
```

The launcher should remain unobtrusive.

## Chat capabilities

The chatbot UI should support:

``` text
Hi 👋
What kind of hill escape are you planning?

[ Couple ]
[ Family ]
[ Friends ]
[ Adventure ]

or type your question...
```

Possible FAQ intents:

-   best time to visit
-   trip duration
-   packages
-   stays
-   vehicle
-   experiences
-   budget planning
-   itinerary
-   contact / enquiry

## Important implementation rule

If there is no real AI backend/API in the current project:

-   build a polished chatbot UI
-   implement deterministic FAQ/recommendation responses
-   clearly structure the code so an AI API can be connected later

Do NOT expose fake API calls or broken network requests.

------------------------------------------------------------------------

# 28. Contact / Trip Enquiry

Final CTA:

``` text
Your mountain story
starts here.
```

Form:

``` text
Full Name
Phone
Travel Date
Group Size
Trip Type
Preferred Package
Message
```

Primary:

``` text
Send Enquiry
```

Secondary:

``` text
WhatsApp
```

If WhatsApp integration already exists, preserve it.

Form validation:

-   required fields
-   phone validation
-   date validation
-   accessible error messages
-   loading state
-   success state

------------------------------------------------------------------------

# 29. Navigation Behavior

Navigation should be fixed/sticky.

Desktop:

``` text
[LOGO]   Home Packages Experiences Stays Vehicles Gallery About   [Plan Trip]
```

After scrolling:

-   slightly smaller header
-   backdrop blur
-   subtle translucent surface
-   thin border
-   maintain readability

Hero state may use a transparent navigation.

After hero:

``` text
background: rgba(...)
backdrop-filter: blur(...)
```

Mobile:

``` text
[LOGO]                         [MENU]
```

Menu opens with a full-screen or premium slide-down navigation.

------------------------------------------------------------------------

# 30. Scroll Architecture

Use section IDs:

``` html
#home
#journey
#trip-finder
#packages
#experiences
#gallery
#about
#stays
#vehicles
#contact
```

Navigation must smoothly scroll to sections.

The hero is special:

``` text
#home
    ↓
290-frame scroll sequence
    ↓
#journey
```

Do not allow anchor navigation to cause visual glitches.

------------------------------------------------------------------------

# 31. Animation Timeline

Recommended experience:

``` text
PAGE LOAD
   ↓
logo reveal
   ↓
hero image/frame appears
   ↓
headline reveal
   ↓
CTA reveal
   ↓
scroll hint
   ↓
USER SCROLLS
   ↓
290-frame cinematic sequence
   ↓
hero overlay subtly changes opacity
   ↓
frame 290
   ↓
hero dissolves into Journey
   ↓
parallax journey reveal
   ↓
trip finder cards rise
   ↓
statistics count/reveal
   ↓
3D carousel enters
   ↓
packages stagger
   ↓
experiences editorial transition
   ↓
gallery depth reveal
   ↓
why-us reveal
   ↓
testimonials
   ↓
stays
   ↓
vehicles
   ↓
final enquiry CTA
```

------------------------------------------------------------------------

# 32. Performance Requirements

The 290-frame hero is performance-critical.

Requirements:

-   lazy-load non-critical sections
-   preload hero frames intelligently
-   use WebP/AVIF where available
-   avoid enormous unoptimized images
-   use responsive image sizes
-   avoid unnecessary React re-renders
-   use GPU-friendly transforms
-   prefer transform/opacity animations
-   avoid animating layout properties
-   use `will-change` only where justified
-   debounce expensive calculations
-   clean up ScrollTrigger/event listeners
-   avoid memory leaks

Target:

``` text
Desktop: smooth 60 FPS where hardware permits
Mobile: graceful reduced-motion / lower-cost mode
```

------------------------------------------------------------------------

# 33. Responsive Design

## Desktop

Full cinematic experience.

## Tablet

Maintain:

-   hero composition
-   readable text
-   functional frame sequence
-   carousel usability

## Mobile

The 290-frame experience must still exist, but performance takes
priority.

Possible implementation:

``` text
Mobile frame resolution
↓
smaller optimized frames
↓
same 290-frame timeline
```

If device performance is insufficient:

``` text
reduced frame density / optimized renderer
```

Do not simply disable the hero without a strong fallback.

------------------------------------------------------------------------

# 34. Accessibility

Must include:

-   semantic HTML
-   keyboard navigation
-   visible focus states
-   alt text
-   accessible buttons
-   form labels
-   sufficient contrast
-   reduced-motion support

Respect:

``` css
@media (prefers-reduced-motion: reduce)
```

For reduced motion:

-   show a static hero image
-   remove aggressive parallax
-   simplify carousel transitions
-   keep content fully usable

------------------------------------------------------------------------

# 35. Component Architecture

Recommended:

``` text
src/
├── components/
│   ├── layout/
│   │   ├── Navbar
│   │   └── Footer
│   │
│   ├── hero/
│   │   ├── CinematicHero
│   │   ├── FrameRenderer
│   │   ├── HeroOverlay
│   │   └── HeroProgress
│   │
│   ├── journey/
│   ├── trip-finder/
│   ├── stats/
│   ├── trip-types/
│   ├── packages/
│   ├── experiences/
│   ├── gallery/
│   ├── about/
│   ├── testimonials/
│   ├── stays/
│   ├── vehicles/
│   ├── enquiry/
│   └── chatbot/
│
├── data/
│   ├── packages
│   ├── experiences
│   ├── stays
│   ├── vehicles
│   └── testimonials
│
├── hooks/
│   ├── useScrollProgress
│   ├── useMediaQuery
│   └── useReducedMotion
│
├── lib/
│   ├── whatsapp
│   └── recommendations
│
└── styles/
```

Do not create unnecessary abstraction if the current repository has a
simpler established architecture.

------------------------------------------------------------------------

# 36. Data Model

## Package

``` js
{
  id,
  title,
  category,
  duration,
  nights,
  price,
  image,
  description,
  highlights,
  itinerary,
  inclusions,
  exclusions
}
```

## Experience

``` js
{
  id,
  title,
  category,
  duration,
  image,
  description,
  location,
  difficulty
}
```

## Stay

``` js
{
  id,
  name,
  category,
  location,
  rating,
  pricePerNight,
  image,
  amenities
}
```

## Vehicle

``` js
{
  id,
  name,
  capacity,
  luggage,
  driverAvailable,
  image
}
```

Keep data separate from UI components.

------------------------------------------------------------------------

# 37. UX States

Every interactive component must define:

``` text
default
hover
focus
active
loading
empty
error
success
disabled
```

Examples:

### Trip Finder

``` text
default → selection → loading → results
```

### Enquiry

``` text
editing → submitting → success
                    ↘ error
```

### Chatbot

``` text
closed → opening → active → typing → response
```

------------------------------------------------------------------------

# 38. Visual Quality Rules

Avoid:

-   generic glassmorphism everywhere
-   excessive rounded cards
-   excessive gradients
-   random blue/purple gradients
-   stock-template layouts
-   excessive text
-   tiny typography
-   overuse of shadows
-   inconsistent border radius
-   unrelated colors

Prefer:

-   editorial layouts
-   large imagery
-   controlled navy/blue palette
-   natural green accents
-   subtle borders
-   depth
-   strong spacing
-   cinematic transitions
-   premium typography

------------------------------------------------------------------------

# 39. Final Conversion Strategy

The website should have repeated but non-annoying conversion
opportunities.

Primary actions:

``` text
Explore Journey
Plan Your Trip
Find My Trip
View Journey
Match My Stay
Choose Vehicle
Send Enquiry
Chat with HillGuide
WhatsApp
```

Do not make every section scream "BOOK NOW".

The conversion funnel should feel natural:

``` text
EMOTION
  ↓
DISCOVERY
  ↓
PERSONALIZATION
  ↓
TRUST
  ↓
EXPLORATION
  ↓
PLANNING
  ↓
ENQUIRY
```

------------------------------------------------------------------------

# 40. Definition of Done

The redesign is complete only when:

-   [ ] Logo is correctly integrated
-   [ ] Brand colors are derived from the logo
-   [ ] Fixed navigation works
-   [ ] 290-frame hero works
-   [ ] Hero remains pinned until frame 290
-   [ ] Normal page scroll starts only after frame 290
-   [ ] Hero does not jump or skip unexpectedly
-   [ ] Hero progress indicator works
-   [ ] Explore Journey CTA works
-   [ ] Plan Trip CTA works
-   [ ] Journey parallax works
-   [ ] 3D carousel works
-   [ ] Trip Finder works
-   [ ] Package filters work
-   [ ] Experience interactions work
-   [ ] Gallery reveal works
-   [ ] Testimonials work
-   [ ] Stay filters work
-   [ ] Smart Stay Matching works
-   [ ] Vehicle section works
-   [ ] Enquiry form validates
-   [ ] Chatbot opens/closes correctly
-   [ ] Chatbot has useful responses
-   [ ] Mobile layout works
-   [ ] Reduced-motion mode works
-   [ ] No horizontal overflow
-   [ ] No console errors
-   [ ] No broken images
-   [ ] No broken links
-   [ ] Animations remain smooth
-   [ ] Lighthouse/performance is acceptable
-   [ ] Existing working functionality is preserved

------------------------------------------------------------------------

# 41. ANTIGRAVITY IMPLEMENTATION MASTER PROMPT

Copy the following prompt into Antigravity after attaching/providing the
project context.

------------------------------------------------------------------------

## MASTER PROMPT

You are the lead frontend engineer and creative interaction designer for
the **Hillstourism website redesign**.

Your task is to transform the existing Hillstourism frontend into a
**premium, cinematic, conversion-focused tourism experience**.

Do NOT treat this as a normal UI redesign.

The goal is to make the client immediately feel:

> "This is a premium travel brand."

### STEP 1 --- INSPECT BEFORE CHANGING

First inspect the complete existing project.

Analyze:

-   framework
-   routing
-   component structure
-   styling system
-   installed dependencies
-   existing animations
-   current hero implementation
-   existing 290-frame assets
-   image loading strategy
-   responsive behavior
-   existing forms
-   existing chatbot if any
-   current navigation
-   current data structures

Do not blindly rewrite the project.

Preserve working functionality unless it conflicts with this
specification.

Before implementation, identify the exact files responsible for:

1.  Hero
2.  Navigation
3.  Main page
4.  Styling
5.  Assets
6.  Package/experience data
7.  Contact/enquiry
8.  Chatbot

------------------------------------------------------------------------

### STEP 2 --- BRAND SYSTEM

Use the supplied Hillstourism logo as the visual source of truth.

Build the theme around:

``` text
Deep Navy
Bright Blue
White
Natural Green accent
```

Suggested starting tokens:

``` text
#001040
#00091F
#0050C0
#0878FF
#F7F9FC
#07152F
#2A5416
```

Do not introduce unrelated purple/pink/orange palettes.

The design should feel like:

``` text
Mountain
Luxury
Adventure
Nature
Technology
Trust
```

------------------------------------------------------------------------

### STEP 3 --- BUILD THE 290-FRAME HERO CORRECTLY

THIS IS THE MOST IMPORTANT REQUIREMENT.

The existing 290 frames must form one continuous cinematic scroll
sequence.

The hero must be pinned to the viewport.

The user should scroll through:

``` text
Frame 001
Frame 002
Frame 003
...
Frame 290
```

The page MUST NOT transition to the next section until frame 290 has
completed.

Desired behavior:

``` text
USER ENTERS HERO
        ↓
HERO PINNED
        ↓
SCROLL
        ↓
FRAME PROGRESS
        ↓
FRAME 290
        ↓
UNPIN HERO
        ↓
JOURNEY SECTION
```

Do not implement a simple `<img>` slideshow.

Prefer a performant canvas renderer if appropriate.

Use GSAP ScrollTrigger if the existing stack supports it or if adding it
is justified.

Map scroll progress deterministically to the 290 frames.

Do not allow frame skipping caused by unnecessary React state updates.

Preload intelligently.

Maintain correct aspect ratio.

Do not distort the frames.

Do not create scroll-jank.

------------------------------------------------------------------------

### STEP 4 --- HERO VISUAL DESIGN

Create a cinematic composition.

Layer:

``` text
290-frame background
+
subtle gradient
+
brand typography
+
CTA
+
frame progress
+
scroll indicator
```

Do not cover the whole image with an opaque panel.

Hero typography should be large and premium.

Use the approved existing copy if available.

Otherwise use a strong destination-oriented message.

Primary CTA:

``` text
Explore Journey
```

Secondary CTA:

``` text
Plan Your Trip
```

Add:

``` text
FRAME 001 / 290
```

or a minimal progress indicator.

------------------------------------------------------------------------

### STEP 5 --- HERO → JOURNEY TRANSITION

After frame 290, create a smooth cinematic transition into the Journey
section.

Do not abruptly switch from hero to a standard white section.

Use:

-   opacity transition
-   subtle scale
-   parallax
-   typography reveal
-   image depth

The transition should feel continuous.

------------------------------------------------------------------------

### STEP 6 --- FULL PAGE STRUCTURE

Implement this information architecture:

``` text
Fixed Navigation

Hero — 290-frame cinematic sequence

Journey

Trip Finder

Statistics

Trip Types — 3D carousel

Packages

Experiences

Gallery

Why Hillstourism

Testimonials

Stays

Smart Stay Matching

Vehicles

Trip Enquiry

HillGuide Chatbot

Footer
```

------------------------------------------------------------------------

### STEP 7 --- 3D CAROUSEL

Create at least one premium 3D carousel.

Prefer Trip Types or Experiences.

Use:

-   perspective
-   rotateY
-   translateZ
-   scale
-   opacity
-   depth
-   smooth easing

Active card should clearly dominate.

Side cards should remain partially visible.

Support:

-   mouse drag
-   touch swipe
-   keyboard
-   accessible controls

Do not create an unusable gimmick.

------------------------------------------------------------------------

### STEP 8 --- SCROLL ANIMATION SYSTEM

Create a coherent animation language across the page.

Use:

-   fade
-   translate
-   scale
-   clip-path/image reveals
-   stagger
-   parallax
-   horizontal movement where useful

Do NOT animate every element.

Motion should communicate hierarchy.

Use transform/opacity whenever possible.

------------------------------------------------------------------------

### STEP 9 --- PARALLAX

Create layered parallax sections.

Use different speeds for:

``` text
background
middle layer
foreground
text
```

Keep it subtle.

Ensure it does not cause horizontal overflow.

------------------------------------------------------------------------

### STEP 10 --- TRIP FINDER

Create:

``` text
Duration
Budget
Trip Type
```

with:

``` text
Find My Trip
```

Filtering must actually work.

If there is no backend, use local deterministic recommendation logic.

Do not fake network/API functionality.

------------------------------------------------------------------------

### STEP 11 --- PACKAGES

Create premium package cards.

Filters:

``` text
All
Couple
Family
Wildlife
Trekking
```

Use real existing data if available.

Do not invent business claims or fake prices if data is absent.

Make the data structure configurable.

------------------------------------------------------------------------

### STEP 12 --- EXPERIENCES

Create an editorial interaction rather than a generic grid.

Experiences:

``` text
Tea Estate Walk
40 Hairpin Bends
Waterfalls
Forest & Wildlife Drive
```

Use a large active image with supporting experience navigation if
appropriate.

------------------------------------------------------------------------

### STEP 13 --- GALLERY

Create a cinematic editorial gallery.

Use:

-   asymmetric layout
-   masonry-like composition
-   image reveal
-   subtle scale
-   parallax

Avoid a boring equal grid.

------------------------------------------------------------------------

### STEP 14 --- WHY HILLSTOURISM

Show:

``` text
Local Expertise
Nature First
Local Partners
Human Support
```

Use premium typography and subtle motion.

------------------------------------------------------------------------

### STEP 15 --- STAYS

Filters:

``` text
All
Normal
Premium
5 Star
```

Build reusable stay cards.

Add:

``` text
Smart Stay Matching
```

Use deterministic frontend rules if backend is unavailable.

------------------------------------------------------------------------

### STEP 16 --- VEHICLES

Build a premium but practical vehicle section.

Show:

``` text
capacity
driver availability
local route support
flexible pickup
```

Keep the visual language consistent.

------------------------------------------------------------------------

### STEP 17 --- HILLGUIDE CHATBOT

Create a floating chatbot:

``` text
HillGuide
```

It should open from the bottom-right.

Starter message:

``` text
Hi 👋
What kind of hill escape are you planning?
```

Quick actions:

``` text
Couple
Family
Friends
Adventure
```

Support common questions:

``` text
Best time to visit
Trip duration
Packages
Stays
Vehicles
Experiences
Budget
Itinerary
Contact
```

If no AI backend exists, implement a clean deterministic response
engine.

Structure the code so a real AI provider/API can be integrated later.

Never create broken fake API calls.

------------------------------------------------------------------------

### STEP 18 --- ENQUIRY FORM

Fields:

``` text
Name
Phone
Travel Date
Group Size
Trip Type
Preferred Package
Message
```

Include:

``` text
Send Enquiry
WhatsApp
```

Implement proper validation and success/error states.

------------------------------------------------------------------------

### STEP 19 --- NAVIGATION

Desktop navigation:

``` text
Logo
Home
Packages
Experiences
Stays
Vehicles
Gallery
About
Contact
Plan Your Trip
```

Transparent over hero.

After scrolling:

-   blurred/translucent background
-   smaller height
-   subtle border

Mobile:

``` text
Logo
Menu
```

with a premium animated menu.

------------------------------------------------------------------------

### STEP 20 --- RESPONSIVE

Test:

``` text
1440px+
1280px
1024px
768px
480px
390px
360px
```

The hero must remain usable.

The 290-frame experience must not destroy mobile performance.

Use optimized assets where possible.

------------------------------------------------------------------------

### STEP 21 --- PERFORMANCE

Pay special attention to the 290-frame hero.

Do:

-   intelligent preloading
-   optimized images
-   canvas rendering where beneficial
-   lazy loading
-   GPU-friendly transforms
-   cleanup event listeners
-   avoid unnecessary React state updates
-   avoid memory leaks

Do not load every heavy asset at once if it causes memory pressure.

------------------------------------------------------------------------

### STEP 22 --- ACCESSIBILITY

Implement:

-   semantic HTML
-   keyboard navigation
-   focus states
-   alt text
-   form labels
-   contrast
-   reduced motion

For:

``` text
prefers-reduced-motion: reduce
```

provide a static hero/fallback experience.

------------------------------------------------------------------------

### STEP 23 --- VISUAL QA

After implementation, inspect the website visually.

Check:

-   hero alignment
-   290-frame progression
-   frame 290 → next section transition
-   navbar
-   CTA placement
-   3D carousel
-   parallax
-   section spacing
-   typography
-   mobile layout
-   chatbot position
-   horizontal overflow
-   footer

Do not stop after writing code.

Actually run/build the application and fix visual and console issues.

------------------------------------------------------------------------

### STEP 24 --- CRITICAL ACCEPTANCE TEST

Perform this exact test:

1.  Open page at the top.
2.  Confirm hero fills the viewport.
3.  Scroll slowly.
4.  Confirm frame sequence advances continuously.
5.  Confirm hero remains pinned.
6.  Continue scrolling.
7.  Confirm frame 290 is reached.
8.  Confirm ONLY AFTER frame 290 the page enters Journey.
9.  Scroll upward.
10. Confirm reverse scrolling reverses the frame sequence naturally.
11. Confirm there is no jump.
12. Confirm no horizontal scrollbar.
13. Test mobile.
14. Test reduced motion.
15. Check browser console.

If any of these fail, fix them before finishing.

------------------------------------------------------------------------

# 42. Final Design Goal

The final website should communicate:

``` text
HILLSTOURISM

Not just a place to visit.

A journey into the hills.
```

The visual experience should combine:

``` text
290-frame cinematic storytelling
+
premium typography
+
3D interaction
+
parallax depth
+
destination imagery
+
smart trip discovery
+
stays
+
vehicles
+
human enquiry
+
HillGuide chatbot
```

The result must feel **premium, immersive, modern, memorable and
client-ready**.

Do not make it look like a generic AI-generated tourism template.

Build it like a senior creative frontend engineer and product designer
would build a showcase tourism website.
