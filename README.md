# Yaadein: nostalgic Indian-life website

Plain HTML, CSS and vanilla JavaScript. No build step, no backend.

## Folder
```
nostalgia-website/
├── index.html
├── css/style.css
├── js/scenes.js      <- ALL content: times, images, captions, focal points, Spotify link
├── js/app.js         <- behaviour only
├── assets/images/    <- optimized WebP scene images
└── assets/audio/
```

## Your images
Already copied in and mapped (time order):

| Time | File | Caption |
|---|---|---|
| 2:00 PM | `scene-nes-brick-game.webp` | suggested, replace freely |
| 5:00 PM | `scene-street-game.webp` | "The game ended only when someone finally called your name." |
| 6:30 PM | `scene-rooftop-antenna.webp` | "Ab aaya? ..." |
| 8:30 PM | `scene-night-study.webp` | "Homework on the table..." |
| 11:00 PM | `scene-kirana-chai.webp` | "Where the chai never stopped boiling..." |

To rename or swap a file: put it in `assets/images/` and edit its `image:` path in `js/scenes.js`.
To change a time: edit `time:` ("HH:MM", 24h). The timeline re-sorts itself.

## Titles, text position and fonts
Each scene has a big `title`, a `caption`, `textPos` ("top"/"mid"/"low") and `textAlign`. Place the text over the calmest
part of the image. Titles use the Google font "Yatra One" (needs internet); offline it falls back to a system Devanagari font.
To self-host, download the font into `assets/` and add an `@font-face` in `css/style.css`.
A "back to now" button appears under the timeline whenever you are not on the scene that matches your clock.

## Run
Double-clicking `index.html` works (no modules or fetch are used). A local server is still the safest:
```
cd nostalgia-website
python3 -m http.server 8000     # then open http://localhost:8000
```

## Phones (portrait crop)
A landscape image can't fill a portrait screen without cropping. Each scene has `focusMobile`
("x% y%") deciding which slice stays visible; 0% = left edge, 100% = right edge.
For the best result later, add a real 9:16 image via `mobileImage: "assets/images/xyz-portrait.jpg"`.

## Spotify
The radio is a visual shell. The button is disabled until you set `spotifyUrl` in `js/scenes.js`
to a real `https://open.spotify.com/...` link. Then the button loads Spotify's official embed
on click (never autoplays). That embed path is written but UNTESTED with a real link, so test it with yours.

## Known image issues (fix the files, not the code)
- `scene-night-study.webp` has a music-player overlay ("Dil Se Re") baked in. Retouch it out.
- Small Gemini sparkle marks in the bottom-right of some images; the timeline sits there. Retouch them out.
- Most images are about 1024px wide and will look soft on large screens. Upscale if possible.