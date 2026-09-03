SDD — HILLSTOURISM PREMIUM TOURISM LANDING PAGE
1. Document Control
Field	Details
Project Name	HillsTourism Premium Landing Page
Document Type	Software Design Document (SDD)
Version	1.0
Platform	Web
Scope	Frontend Only
Primary Goal	Client Reach & Lead Generation
Design Reference	Pakka Tourism – structural inspiration only
Responsive	Desktop + Tablet + Mobile
Animation	GSAP / ScrollTrigger + Canvas
Hero Assets	290-frame image sequence
Logo Asset	Single PNG
Backend	Not Required
Database	Not Required
Authentication	Not Required
2. Project Objective

Build a premium, cinematic, responsive tourism landing page for HillsTourism.

The website must:

attract potential clients
showcase travel packages
showcase travel experiences
create a premium brand impression
generate enquiries
work across all major devices
use cinematic scroll animations
use parallax effects
use a 3D trip-category carousel
use a 290-frame hero animation
provide a branded initial loading experience

The website must be frontend-only.

3. Design Reference

Use Pakka Tourism only as a reference for:

landing-page information architecture
tourism content hierarchy
package presentation
category organisation
testimonial structure
gallery structure
CTA placement
travel storytelling
Do NOT copy
logo
branding
exact colors
exact text
images
testimonials
card designs
proprietary content
exact layout

The HillsTourism website must have its own visual identity.

4. Core User Journey

The primary user journey is:

User clicks deployed URL
        ↓
Brand Loading Screen
        ↓
HillsTourism PNG Logo
        ↓
Loading animation
        ↓
Landing page enters
        ↓
Hero section
        ↓
Hero frame animation
        ↓
Trip Categories
        ↓
Featured Trips
        ↓
Travel Experiences
        ↓
Traveler Stories
        ↓
Gallery
        ↓
Why Choose Us
        ↓
Final CTA
        ↓
Footer
5. Asset Architecture

There are two completely different logo/visual asset systems.

5.1 Normal Logo

A single HillsTourism PNG logo.

Use this for:

Navbar
Loading Screen
Footer
CTA areas
Other normal branding

Example:

/public/assets/logo.png
5.2 Hero Frame Sequence

There are approximately 290 extracted frames.

frame_0001
frame_0002
frame_0003
...
frame_0290

Resolution:

800 × 450

Aspect ratio:

16:9
Critical rule

These 290 frames MUST ONLY be used inside the HERO SECTION.

Do NOT use the frame sequence for:

Navbar
Loading screen
Footer
Other sections
Normal logo display
6. Initial Loading Screen

When the user opens the deployed URL:

URL
 ↓
Loading Screen
 ↓
PNG HillsTourism Logo
 ↓
Logo Animation
 ↓
Page Transition
 ↓
Hero

The loading screen must be:

full viewport
premium
cinematic
minimal
fast
responsive
Do NOT

Use a generic:

Loading...

or spinner-only design.

7. Loading Screen Behaviour

Suggested animation:

0%
│
├── Dark background
│
├── Logo fades in
│
├── Logo scales subtly
│
├── Logo becomes sharp
│
├── Progress indicator
│
├── Logo transition
│
└── Main website reveal
100%

The loading screen must have a maximum timeout/fallback.

It must never remain stuck.

8. Hero Section

The Hero is the website's primary visual signature.

Hero uses:

290 frames
      ↓
Canvas
      ↓
Scroll progress
      ↓
Frame index
      ↓
Visual transformation
Animation

User scrolls:

Frame 001
   ↓
Frame 002
   ↓
Frame 003
   ↓
...
   ↓
Frame 290

The animation is scroll-driven.

It should NOT simply autoplay independently.

9. Hero Technical Design

Use:

HTML Canvas
GSAP
ScrollTrigger
requestAnimationFrame where required

Do not render:

<img />
<img />
<img />
...

290 times in the DOM.

Instead:

Frame Images
     ↓
Image Preloader
     ↓
Canvas
     ↓
GSAP ScrollTrigger
     ↓
Frame Renderer
10. Hero Performance

The frame animation must be optimized.

Requirements:

progressive preloading
image caching
canvas rendering
device pixel ratio handling
responsive canvas
memory cleanup
failed-frame handling
mobile optimization

If some frames fail:

Failed Frame
      ↓
Nearest Available Frame
      ↓
Continue Animation

The website must not break.

11. Hero Content

Hero content should appear after/during the frame transition.

Example:

Eyebrow

EXPLORE · EXPERIENCE · REMEMBER

Heading

Travel Beyond the Ordinary

Description

Journeys designed for stories worth remembering.

CTA
[Explore Journeys]
[Plan Your Trip]

Use original HillsTourism content.

12. Navbar

Desktop navbar:

Logo
Home
Journeys
Categories
Experiences
Gallery
About
Contact

Plan Your Trip
Behaviour

Initially:

Transparent / overlay

After scrolling:

Blurred / solid background

Navbar should remain sticky.

13. Mobile Navbar

Mobile:

Logo
       ☰

Menu opens with:

smooth animation
accessible close button
full navigation
CTA

Must not create horizontal overflow.

14. Trip Categories

This is a major interaction section.

Categories:

Honeymoon
Couple Packages
Family Packages
Friends & Group Trips
College Trips
Corporate Trips

Instead of normal cards, use a:

3D CAROUSEL
15. 3D Carousel Design

Desktop:

          Family
             \
              \
Couple ---- CENTER ---- Friends
              /
             /
         College
Center card
scale: 1
opacity: 1
high z-index
sharp
largest
Side cards
smaller
reduced opacity
perspective
rotateY
translateZ
visually behind center
16. Carousel Interaction

Must support:

mouse drag
touch swipe
trackpad
arrow buttons
keyboard controls

Transition:

Swipe
 ↓
3D rotation
 ↓
Scale
 ↓
Depth
 ↓
New center card

The animation must be smooth.

17. Mobile Carousel

Mobile should show:

       [Previous]
          ↓
     [CENTER CARD]
          ↓
       [Next]

Allow partial neighbouring cards.

Touch swipe should feel natural.

Reduce 3D depth if required for mobile performance.

18. Parallax System

Implement controlled parallax.

Hero

Slow background movement.

Images

Subtle vertical movement.

Typography

Small scroll movement.

Cards

Small depth movement.

Do not animate every element.

19. Scroll Animation System

Use GSAP ScrollTrigger where appropriate.

Animations:

Section headings
opacity
+
translateY
Cards
stagger
+
fade
+
scale
Images
clip-path
+
scale
Testimonials
fade
+
slide
Gallery
staggered reveal
20. Reduced Motion

Respect:

prefers-reduced-motion

When enabled:

reduce animations
disable unnecessary parallax
preserve functionality
preserve navigation
preserve content
21. Featured Trips

Create a premium package section.

Each package:

Image
Destination
Package Name
Duration
Starting Price
Description
Explore Button

Example:

Munnar Escape
3 Days / 2 Nights

From ₹9,999

[Explore Journey]

Use data-driven architecture.

22. Travel Experiences

Experiences:

Campfire
Mountain Trekking
Sunrise Viewpoints
Jeep Safari
Music Nights
Premium Stays

Use visual cards.

Add subtle hover interactions.

23. Traveler Stories

Testimonials contain:

Traveler Name
Trip
Location
Review
Rating
Profile Image

Use original dummy data.

Do not copy Pakka Tourism testimonials.

24. Gallery

Create a cinematic travel gallery.

Use:

masonry-like composition
varying image sizes
hover zoom
parallax
reveal animations
Desktop

Creative multi-column layout.

Tablet

Balanced grid.

Mobile

Single/two-column layout.

25. Why Choose Us

Trust section:

Curated Journeys
Local Expertise
Transparent Pricing
Safe Travel
Personalized Experiences
24/7 Support

Use clean icons.

26. Final CTA

Create strong conversion section.

Example:

Your next story starts here.

Buttons:

[Plan My Trip]
[Talk to Us]

Use cinematic imagery.

27. Footer

Footer contains:

HillsTourism Logo

About
Journeys
Categories
Experiences
Gallery
Contact

Social Links

WhatsApp
Contact

Privacy Policy
Terms

Copyright

Use the single PNG logo, not hero frames.

28. Responsive Requirements

Must work on:

Desktop
1920 × 1080
1440 × 900
1366 × 768
Laptop
1280 × 800
1024 × 768
Tablet
834 × 1194
768 × 1024
Mobile
430 × 932
414 × 896
390 × 844
375 × 812
360 × 800

No:

horizontal scrolling
clipped text
overlapping elements
broken cards
broken navigation
distorted images
animation overflow
29. Suggested Technology Stack

Use the existing project stack where possible.

Preferred:

React / Next.js
        +
Tailwind CSS
        +
GSAP
        +
ScrollTrigger

Optional:

Lenis

Only use Lenis if it does not introduce scroll or performance problems.

30. Component Architecture

Recommended:

src/
│
├── components/
│   ├── Navbar
│   ├── LoadingScreen
│   ├── Hero
│   ├── HeroFrameSequence
│   ├── TripCategoryCarousel
│   ├── FeaturedTrips
│   ├── Experiences
│   ├── Testimonials
│   ├── Gallery
│   ├── WhyChooseUs
│   ├── FinalCTA
│   └── Footer
│
├── data/
│   ├── categories
│   ├── packages
│   ├── experiences
│   └── testimonials
│
├── hooks/
│   ├── useFrameSequence
│   └── useScrollProgress
│
└── utils/
    ├── imageLoader
    └── responsive
31. Data Architecture

Example:

const categories = [
  {
    title: "Honeymoon",
    description: "...",
    image: "..."
  },
  {
    title: "Couple Packages",
    description: "...",
    image: "..."
  }
];

Packages:

const packages = [
  {
    title: "Munnar Escape",
    destination: "Munnar",
    duration: "3 Days / 2 Nights",
    price: "₹9,999",
    image: "...",
    category: "Couple",
    description: "..."
  }
];
32. Error Handling

Every important subsystem needs fallback behaviour.

Image failure
Image Error
 ↓
Fallback
Frame failure
Failed Frame
 ↓
Nearest Valid Frame
Animation library failure
Animation Failure
 ↓
Basic CSS / Native fallback
Slow network
Slow Network
 ↓
Main UI loads
 ↓
Hero continues preparing
33. Self-Fix Requirement

Antigravity must NOT stop when it encounters an error.

Required workflow:

Inspect
 ↓
Implement
 ↓
Run
 ↓
Detect Error
 ↓
Diagnose Root Cause
 ↓
Fix
 ↓
Run Again
 ↓
Verify
 ↓
Repeat

Do not ask the user to manually fix ordinary implementation errors.

34. Testing Requirements

Test:

Functional
navigation
mobile menu
CTA
carousel
drag
swipe
keyboard
scroll
hero sequence
Visual
spacing
typography
responsive behaviour
image proportions
Performance
initial load
frame loading
memory usage
animation smoothness
Build
npm install
npm run build

If available:

npm run lint
npm run typecheck
npm test
35. Final Acceptance Criteria

The project is complete only when:

✓ Website runs
✓ Production build succeeds
✓ No critical console errors
✓ Loading screen works
✓ PNG logo appears in loading screen
✓ Landing page opens after loading
✓ PNG logo used outside hero
✓ 290 frames used ONLY in hero
✓ Canvas hero works
✓ Scroll controls hero frames
✓ 16:9 preserved
✓ 3D category carousel works
✓ Mouse drag works
✓ Touch swipe works
✓ Keyboard works
✓ Parallax works
✓ Scroll animations work
✓ Reduced motion works
✓ Featured trips work
✓ Experiences work
✓ Testimonials work
✓ Gallery works
✓ CTA works
✓ Footer works
✓ Mobile navbar works
✓ Desktop works
✓ Tablet works
✓ Mobile works
✓ No horizontal overflow
✓ No infinite loading
✓ Failed frames handled
✓ Performance optimized
✓ Production tested