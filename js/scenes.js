/* ==========================================================
   scenes.js: all content and settings live here.
   Plain script (no modules) so it also works from file://
   ========================================================== */
window.NOSTALGIA_CONFIG = {
  transitionMs: 900,          // crossfade duration (keep in sync with --fade in CSS)

  /* Paste a Spotify track/playlist/album link, e.g. "https://open.spotify.com/playlist/XXXX".
     Empty = the radio is a visual shell only and its button stays disabled. */
  spotifyUrl: "https://open.spotify.com/playlist/6p1LFUW0D9q8b7VdwHY3is",

  /* Each scene:
       time        "HH:MM" (24h). The scene closest to the visitor's clock opens first.
       image       path to the WebP image. mobileImage: optional separate portrait image (or null)
       focus       which part stays visible when cropped (CSS background-position);
                   focusMobile is used on portrait screens (0% = left edge, 100% = right edge)
       title       the big heading (Devanagari looks best). "" hides it
       caption     the short sentence under the title ("" hides it)
       textBox     text position on laptops/desktops (landscape). Pick the calmest part of the image.
                   Use left OR right, and top OR bottom (any CSS length, e.g. "4vw", "6vh"):
                   width = block width, align = "left"/"center"/"right",
                   scale = title size multiplier (1 = biggest), capw = caption max width
       textPos     phones (portrait): "top", "mid" or "low".  textAlign: "left", "center" or "right"
       fallback    colour shown if the image is missing */
  scenes: [
    {
      id: "afternoon-game", label: "Afternoon video game", time: "14:00",
      image: "assets/images/scene-nes-brick-game.webp", mobileImage: null,
      focus: "50% 50%", focusMobile: "58% 50%",
      title: "एक और लाइफ",
      // SUGGESTED caption for this image. Replace with your own whenever you like.
      caption: "One more life, one more level, and the cartridge always needed a good blow first.",
      textPos: "top", textAlign: "center", textBox: { left: "4vw", top: "11vh", width: "58vw", align: "left", scale: 0.78, capw: "max(15rem, 17vw)" },
      fallback: "#3a2f22"
    },
    {
      id: "street-game", label: "Street games", time: "17:00",
      image: "assets/images/scene-street-game.webp", mobileImage: null,
      focus: "50% 50%", focusMobile: "48% 50%",
      title: "गली का खेल",
      caption: "The game ended only when someone finally called your name.",
      textPos: "top", textAlign: "center", textBox: { left: "4vw", top: "11vh", width: "40vw", align: "left", scale: 0.85, capw: "max(16rem, 22vw)" },
      fallback: "#4a4136"
    },
    {
      id: "rooftop-antenna", label: "Rooftop antenna", time: "18:30",
      image: "assets/images/scene-rooftop-antenna.webp", mobileImage: null,
      focus: "55% 0%", focusMobile: "60% 0%",   // 0% = keep the top (antenna) in view on wide windows
      title: "थोड़ा और बाएँ",
      caption: "Ab aaya? The whole family waited for one clear picture.",
      textPos: "top", textAlign: "left", textBox: { left: "4vw", top: "11vh", width: "42vw", align: "left", scale: 0.95, capw: "max(17rem, 26vw)" },
      fallback: "#5a4a48"
    },
    {
      id: "night-study", label: "Late-night study", time: "20:30",
      image: "assets/images/scene-night-study.webp", mobileImage: null,
      focus: "45% 50%", focusMobile: "45% 50%",
      title: "रात की पढ़ाई",
      caption: "Homework on the table, earphones in your ears, and one favourite song on repeat.",
      textPos: "top", textAlign: "center", textBox: { left: "3vw", top: "11vh", width: "30vw", align: "left", scale: 0.62, capw: "max(15rem, 26vw)" },
      fallback: "#2a2318"
    },
    {
      id: "kirana-chai", label: "Kirana and chai tapri", time: "23:00",
      image: "assets/images/scene-kirana-chai.webp", mobileImage: null,
      focus: "50% 0%", focusMobile: "74% 0%",   // chai tapri side; use 22% for the kirana side
      title: "नुक्कड़",
      caption: "Where the chai never stopped boiling, and the uncles always had time for one more conversation.",
      textPos: "low", textAlign: "center", textBox: { left: "480px", bottom: "4.5vh", width: "min(42vw, 640px)", align: "left", scale: 0.6, capw: "max(17rem, 34vw)" },
      fallback: "#1c140d"   // top of this image holds the shop signs; left: 480px keeps clear of the player card
    }
  ]
};