/* ==========================================================
   scenes.js: all content and settings live here.
   Plain script (no modules) so it also works from file://
   ========================================================== */
window.NOSTALGIA_CONFIG = {
  transitionMs: 900,          // crossfade duration (keep in sync with --fade in CSS)

  /* Playlist metadata. Add a YouTube link or 11-character video ID to enable playback.
     Some YouTube videos block embedding; use an official upload when possible. */
  tracks: [
    {
      youtube: "",
      title: "Pal Pal Dil Ke Paas - From \"Blackmail\"",
      artist: "Kishore Kumar",
      duration: "5:28"
    },
    {
      youtube: "",
      title: "Chura Liya Hai Tumne Jo Dil Ko",
      artist: "Asha Bhosle, Mohammed Rafi, R. D. Burman",
      duration: "4:47"
    },
    {
      youtube: "",
      title: "O Mere Dil Ke Chain",
      artist: "Kishore Kumar, R. D. Burman",
      duration: "4:36"
    },
    {
      youtube: "",
      title: "Itna Na Mujhse Tu Pyar Badha",
      artist: "Talat Mahmood, Lata Mangeshkar, Salil Chowdhury",
      duration: "3:55"
    },
    {
      youtube: "",
      title: "Yeh Raaten Yeh Mausam",
      artist: "Kishore Kumar, Asha Bhosle",
      duration: "3:21"
    },
    {
      youtube: "",
      title: "Dekha Ek Khwab",
      artist: "Lata Mangeshkar, Kishore Kumar",
      duration: "5:20"
    },
    {
      youtube: "",
      title: "Mere Samnewali Khidki Mein",
      artist: "Kishore Kumar, R. D. Burman",
      duration: "2:52"
    },
    {
      youtube: "",
      title: "Chand Sifarish",
      artist: "Jatin-Lalit, Shaan, Kailash Kher, Prasoon Joshi",
      duration: "4:35"
    },
    {
      youtube: "",
      title: "Uden Jab Jab Zulfen Teri",
      artist: "Mohammed Rafi, Asha Bhosle",
      duration: "4:55"
    },
    {
      youtube: "",
      title: "Abhi Na Jao Chhod Kar",
      artist: "Asha Bhosle, Mohammed Rafi",
      duration: "4:15"
    },
    {
      youtube: "",
      title: "Mere Bhole Balam",
      artist: "Kishore Kumar, R. D. Burman",
      duration: "3:14"
    },
    {
      youtube: "",
      title: "Lag Ja Gale Se Phir",
      artist: "Lata Mangeshkar",
      duration: "4:17"
    },
    {
      youtube: "",
      title: "Hungamaa Ho Gaya",
      artist: "Asha Bhosle, Arijit Singh, Amit Trivedi, Laxmikant–Pyarelal",
      duration: "4:31"
    },
    {
      youtube: "",
      title: "Intaha Ho Gai Intezar Ki",
      artist: "Kishore Kumar, Asha Bhosle",
      duration: "8:49"
    },
    {
      youtube: "",
      title: "Ek Ajnabee Haseena Se",
      artist: "Kishore Kumar, R. D. Burman",
      duration: "4:26"
    },
    {
      youtube: "",
      title: "Mere Sapnon Ki Rani",
      artist: "Kishore Kumar, S. D. Burman",
      duration: "5:00"
    },
    {
      youtube: "",
      title: "Dil Se Re",
      artist: "A.R. Rahman, Anuradha, Chandralekha Annupamaa",
      duration: "6:45"
    },
    {
      youtube: "",
      title: "Kun Faya Kun",
      artist: "A.R. Rahman, Javed Ali, Mohit Chauhan",
      duration: "7:50"
    },
    {
      youtube: "",
      title: "Kya Hua Tera Vada",
      artist: "Sushma Shrestha, Mohammed Rafi, R. D. Burman",
      duration: "4:17"
    },
    {
      youtube: "",
      title: "Dhal Gaya Din Ho Gayi Sham",
      artist: "Asha Bhosle, Mohammed Rafi, Laxmikant–Pyarelal",
      duration: "4:53"
    },
    {
      youtube: "",
      title: "Yeh Sham Mastani",
      artist: "Kishore Kumar, R. D. Burman",
      duration: "4:36"
    },
    {
      youtube: "",
      title: "Halka Halka",
      artist: "Rahat Fateh Ali Khan, Rashmi Virag, Abhijit Vaghani",
      duration: "4:33"
    },
    {
      youtube: "",
      title: "Chaar Kadam",
      artist: "Shaan, Shreya Ghoshal, Shantanu Moitra, Swanand Kirkire",
      duration: "4:02"
    },
    {
      youtube: "",
      title: "Aashiyan",
      artist: "Pritam, Shreya Ghoshal, Nikhil Paul George",
      duration: "3:56"
    },
    {
      youtube: "",
      title: "Pehla Nasha",
      artist: "Udit Narayan, Sadhana Sargam",
      duration: "4:51"
    },
    {
      youtube: "",
      title: "O Sanam",
      artist: "Lucky Ali",
      duration: "3:43"
    }
  ],

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