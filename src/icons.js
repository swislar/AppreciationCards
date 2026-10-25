/* ==========================================================================
   Cardstock — icon library
   Hand-drawn SVG line icons on a 24x24 grid (stroke = currentColor),
   plus an illustrated Bichon Frise face generator.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------- helpers ---------- */
  const P = (d, extra) => `<path d="${d}"${extra || ""}/>`;
  const C = (cx, cy, r, extra) => `<circle cx="${cx}" cy="${cy}" r="${r}"${extra || ""}/>`;
  const E = (cx, cy, rx, ry, extra) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${extra || ""}/>`;
  const L = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`;

  const LINE = { fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "stroke-linejoin": "round" };

  /* ---------- 24x24 line icons ---------- */
  const ICONS = {
    /* ------- drinks / bar / party ------- */
    martini: {
      label: "Martini", tags: "bar drink cocktail",
      inner: P("M3.4 4.3h17.2L12 13.3 3.4 4.3Z") + P("M12 13.3V19.6") + L(8, 19.6, 16, 19.6) +
        C(15.7, 8.1, 1.25) + L(15.7, 8.1, 9.1, 3.8)
    },
    coupe: {
      label: "Champagne coupe", tags: "bar drink champagne toast",
      inner: P("M4.3 8.6h15.4c0 4.3-3.5 7-7.7 7s-7.7-2.7-7.7-7Z") + P("M12 15.6V20") + L(8.4, 20, 15.6, 20) +
        C(9.5, 5.6, 0.75) + C(12, 3.8, 0.75) + C(14.5, 5.6, 0.75)
    },
    wine: {
      label: "Wine glass", tags: "bar drink wine",
      inner: P("M7.1 3.6h9.8c0 5.2-2 8.4-4.9 8.4s-4.9-3.2-4.9-8.4Z") + P("M12 12V20") + L(8.5, 20, 15.5, 20) +
        P("M7.5 7.4c1.9 1.3 7.1 1.3 9 0")
    },
    beer: {
      label: "Beer mug", tags: "bar drink beer pub",
      inner: P("M6.2 9.2h8.6v10.2a1.6 1.6 0 0 1-1.6 1.6H7.8a1.6 1.6 0 0 1-1.6-1.6V9.2Z") +
        P("M6.2 9.2c0-1.7 1.3-2.8 2.5-2.3.4-1.6 2.2-2.2 3.1-1.1 1.1-.9 2.7 0 2.4 1.5.9.2 1.3 1 1.3 1.9") +
        P("M14.8 11.5h2.1a2.2 2.2 0 0 1 2.2 2.2v3a2.2 2.2 0 0 1-2.2 2.2h-2.1") + C(9  , 13.2, 0.65) + C(11.6, 15.6, 0.55)
    },
    bottle: {
      label: "Bottle", tags: "bar drink wine bottle",
      inner: P("M10.1 2.9h3.8v3.3c0 .9.4 1.5 1 2.2.8.9 1.2 1.9 1.2 3.2V19.9a1.3 1.3 0 0 1-1.3 1.3H9.2a1.3 1.3 0 0 1-1.3-1.3V11.6c0-1.3.4-2.3 1.2-3.2.6-.7 1-1.3 1-2.2V2.9Z") +
        L(10.1, 2.9, 13.9, 2.9) + P("M7.9 15.2h8.2")
    },
    shaker: {
      label: "Cocktail shaker", tags: "bar drink shaker mixology",
      inner: P("M8.7 10.1h6.6l1 8a1.8 1.8 0 0 1-1.8 2H9.5a1.8 1.8 0 0 1-1.8-2l1-8Z") +
        P("M8.3 10.1V7.7c0-.6.4-1 1-1h5.4c.6 0 1 .4 1 1v2.4") +
        P("M8.7 6.7 9.5 4.2c.2-.5.6-.8 1.1-.8h2.8c.5 0 .9.3 1.1.8l.8 2.5") + L(8.7, 6.7, 15.3, 6.7)
    },
    cherry: {
      label: "Cherries", tags: "bar drink fruit sweet",
      inner: C(7.9, 15.4, 3.2) + C(16, 16, 2.8) +
        P("M8.6 12.3C9.6 8.2 11.8 5.6 15 4.6") + P("M15.9 13.4c.5-3.2 1.5-5.6 3.1-7.5") +
        P("M15 4.6c1.4-1.7 3.7-1.9 5.4-.6-1.3 1.9-3.3 2.5-5.4 2.2Z")
    },
    disco: {
      label: "Disco ball", tags: "party dance nightclub",
      inner: C(12, 11, 6.1) + L(5.9, 11, 18.1, 11) + L(12, 4.9, 12, 17.1) +
        P("M8 6.8c2.7 3 5.3 5.2 8 8.2") + P("M16 6.8c-2.7 3-5.3 5.2-8 8.2") +
        L(12, 2.2, 12, 4.4) + P("M4.4 2.6l.9.9") + P("M19.6 2.6l-.9.9") + P("M3 11h1.2") + P("M19.8 11H21")
    },
    balloons: {
      label: "Balloons", tags: "party birthday celebration",
      inner: E(8.7, 7.4, 3.6, 4.4) + E(15.6, 6.5, 3.2, 4) +
        P("M8.7 11.9v1.2c0 2.3 3 2 3.2 4.7") + P("M15.6 10.6v1.2c0 1.7-1.6 1.9-1.9 3.4")
    },
    popper: {
      label: "Party popper", tags: "party confetti celebrate",
      inner: P("M4.2 19.8 9.4 8.2l6.4 6.4-11.6 5.2Z") +
        P("M12.7 6.1l.6-2.6") + P("M16.9 7.4l1.7-1.9") + P("M18 11.3l2.4-.2") + P("M15.4 4.4 16.8 3") +
        C(14.4, 12.4, 0.8) + C(19.2, 14.8, 0.8) + C(10.4, 4.4, 0.8)
    },
    bunting: {
      label: "Bunting", tags: "party garland celebrate",
      inner: P("M2.6 6.4c3.8 2.8 15 2.8 18.8 0") +
        P("M4.2 7.2 7.4 7.8 6 12.2Z") + P("M9.2 8.2 12.4 8.4 11 12.8Z") +
        P("M14.4 8.4 17.6 8 16.2 12.4Z") + P("M19.4 7.6 20.9 7.4 20.9 11Z")
    },
    music: {
      label: "Music notes", tags: "party music dance song",
      inner: P("M9.1 17.1V6.3l8.2-1.7v10.6") + E(7.2, 17.4, 2.1, 1.8) + E(15.4, 15.3, 2.1, 1.8) + P("M9.1 9.6l8.2-1.7")
    },
    star: {
      label: "Star", tags: "celebration happy favourite",
      inner: P("M12 3.3 14.5 8.6 20.3 9.4 16.1 13.4 17.1 19.1 12 16.4 6.9 19.1 7.9 13.4 3.7 9.4 9.5 8.6Z")
    },
    sparkle: {
      label: "Sparkle", tags: "magic happy shine new",
      inner: P("M12 2.8c.7 4.7 2.5 6.5 7.2 7.2-4.7.7-6.5 2.5-7.2 7.2-.7-4.7-2.5-6.5-7.2-7.2 4.7-.7 6.5-2.5 7.2-7.2Z") +
        P("M18.6 15.4c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z")
    },
    heart: {
      label: "Heart", tags: "love happy",
      inner: P("M12 20.1s-7.6-4.6-7.6-9.5a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 4.9-7.6 9.5-7.6 9.5Z")
    },

    /* ------- dog / bichon ------- */
    paw: {
      label: "Paw print", tags: "dog puppy pet",
      filled: true,
      inner: E(12, 15.4, 4.9, 4.2) + E(6.2, 10.2, 2.1, 2.6) + E(10, 7.6, 2.1, 2.7) + E(14.2, 7.6, 2.1, 2.7) + E(18, 10.2, 2.1, 2.6)
    },
    bone: {
      label: "Bone", tags: "dog puppy treat",
      filled: true,
      inner: C(6.5, 9.3, 2.6) + C(6.5, 14.7, 2.6) + C(17.5, 9.3, 2.6) + C(17.5, 14.7, 2.6) + `<rect x="6.5" y="9.3" width="11" height="5.4"/>`
    },
    ball: {
      label: "Tennis ball", tags: "dog puppy play fetch",
      inner: C(12, 12, 8.4) + P("M5.2 5.8c4.6 3.6 4.6 8.8 0 12.4") + P("M18.8 5.8c-4.6 3.6-4.6 8.8 0 12.4") + P("M7.4 8.2c1.9 2.3 1.9 5.3 0 7.6") + P("M16.6 8.2c-1.9 2.3-1.9 5.3 0 7.6")
    },
    daisy: {
      label: "Daisy", tags: "dog flower garden cute",
      inner: E(12, 5.6, 2.5, 3.2) + E(12, 18.4, 2.5, 3.2) + E(5.6, 12, 3.2, 2.5) + E(18.4, 12, 3.2, 2.5) +
        E(7.5, 7.5, 2.1, 3) + E(16.5, 7.5, 2.1, 3) + E(7.5, 16.5, 2.1, 3) + E(16.5, 16.5, 2.1, 3) + C(12, 12, 2.5)
    },
    crown: {
      label: "Crown", tags: "dog best good boy royal",
      inner: P("M3.6 8.6 7.6 12l4.4-6 4.4 6 4-3.4-1.7 9.3H5.3L3.6 8.6Z") + C(3.6, 8.6, 0.8) + C(12, 6, 0.8) + C(20.4, 8.6, 0.8)
    },
    biscuit: {
      label: "Dog biscuit", tags: "dog puppy treat snack",
      inner: C(12, 12, 7.4) + C(9.2, 9.6, 0.8) + C(14.8, 10.2, 0.8) + C(10.4, 14.8, 0.8) + C(15, 14.4, 0.8)
    },
    collar: {
      label: "Collar", tags: "dog puppy tag",
      inner: P("M3.4 8.4c4.8 3.8 12.4 3.8 17.2 0") + P("M4.6 10.4c4 2.8 10.8 2.8 14.8 0") +
        C(12, 15.2, 2.7) + P("M12 12.6v.2") + C(12, 15.2, 0.7)
    },
    doghouse: {
      label: "Dog house", tags: "dog puppy home",
      inner: P("M3.4 11.2 12 4.2l8.6 7") + P("M5.6 10.4v9.4h12.8v-9.4") + P("M9.6 19.8v-5.2h4.8v5.2") + C(12, 11.6, 0.9)
    },

    /* ------- general: travel / holiday ------- */
    plane: {
      label: "Paper plane", tags: "travel holiday flight",
      inner: P("M20.8 3.4 3.4 10.3l6.2 2.6 2.6 6.3 8.6-15.8Z") + P("M9.6 12.9 20.8 3.4")
    },
    globe: {
      label: "Globe", tags: "travel world holiday",
      inner: C(12, 12, 8.6) + E(12, 12, 3.7, 8.6) + L(3.4, 12, 20.6, 12) +
        P("M5.4 6.9c4.2 1.9 9 1.9 13.2 0") + P("M5.4 17.1c4.2-1.9 9-1.9 13.2 0")
    },
    palm: {
      label: "Palm tree", tags: "travel holiday beach",
      inner: P("M13.5 20.4c-.8-5.1.3-9.2 3.1-12.7") + L(10.8, 20.4, 16.6, 20.4) +
        P("M16.2 7.6C13.1 6.9 9.8 8 8.3 10.4c2.6-.2 4.8.4 6.4 1.6") +
        P("M16.2 7.6C13.5 4.9 9.9 4.6 7.3 6.4c2.4 1 4.2 2.4 5.2 4.1") +
        P("M16.6 7.2c.7-3 3.3-4.9 5.8-4.2-1.6 1.6-2.5 3.2-2.9 5.1") +
        P("M16.9 7.8c2.7-.8 5.5.4 6.1 2.6-2.3-.4-4.3.2-5.9 1.2") +
        C(16.3, 8.1, 0.9)
    },
    mountain: {
      label: "Mountains", tags: "travel holiday nature hike",
      inner: P("M2.6 19.7 9.1 7.6l4.1 7.5 2.4-3.9 5.8 8.5Z") + C(17.6, 6.2, 2.2)
    },
    sun: {
      label: "Sun", tags: "holiday happy summer beach",
      inner: C(12, 12, 4.3) + P("M12 1.9v2.2") + P("M12 19.9v2.2") + P("M1.9 12h2.2") + P("M19.9 12h2.2") +
        P("M4.9 4.9l1.6 1.6") + P("M17.5 17.5l1.6 1.6") + P("M19.1 4.9l-1.6 1.6") + P("M6.5 17.5l-1.6 1.6")
    },
    umbrella: {
      label: "Beach umbrella", tags: "travel holiday beach summer",
      inner: P("M3.2 12.1c1.4-1.5 2.9-1.5 4.4 0 1.4-1.5 2.9-1.5 4.4 0 1.4-1.5 2.9-1.5 4.4 0 1.4-1.5 2.9-1.5 4.4 0") +
        P("M3.2 12.1C4 7.5 7.7 4.1 12 4.1s8 3.4 8.8 8") + P("M12 12.1v5.7a2.2 2.2 0 0 0 4.4 0") + C(12, 4.1, 0.9)
    },
    camera: {
      label: "Camera", tags: "travel holiday memory photo hobby",
      inner: P("M3.2 8.6h3.2l1.5-2.4h8.2l1.5 2.4h3.2a1 1 0 0 1 1 1v8.6a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1V9.6a1 1 0 0 1 1-1Z") +
        C(12, 13.4, 3.5) + C(18, 10.6, 0.7)
    },
    compass: {
      label: "Compass", tags: "travel adventure explore",
      inner: C(12, 12, 8.7) + P("M15.6 8.4 13.7 13.7 8.4 15.6 10.3 10.3Z") + C(12, 12, 0.6)
    },
    suitcase: {
      label: "Suitcase", tags: "travel holiday trip",
      inner: P("M3.3 8.4h17.4a1.2 1.2 0 0 1 1.2 1.2v9a1.2 1.2 0 0 1-1.2 1.2H3.3a1.2 1.2 0 0 1-1.2-1.2v-9a1.2 1.2 0 0 1 1.2-1.2Z") +
        P("M8.6 8.4V5.9a1.4 1.4 0 0 1 1.4-1.4h4a1.4 1.4 0 0 1 1.4 1.4v2.5") +
        L(8.2, 8.4, 8.2, 19.8) + L(15.8, 8.4, 15.8, 19.8) + C(7, 21.4, 0.8) + C(17, 21.4, 0.8)
    },
    pin: {
      label: "Map pin", tags: "travel holiday place",
      inner: P("M12 21.2c4.5-5.4 6.6-8.6 6.6-11.4a6.6 6.6 0 1 0-13.2 0c0 2.8 2.1 6 6.6 11.4Z") + C(12, 9.6, 2.4)
    },
    gift: {
      label: "Gift", tags: "holiday birthday celebration",
      inner: P("M3.4 9.9h17.2v10a1.2 1.2 0 0 1-1.2 1.2H4.6a1.2 1.2 0 0 1-1.2-1.2v-10Z") +
        P("M2.4 6.4h19.2v3.5H2.4Z") + L(12, 6.4, 12, 21.1) +
        P("M12 6.4C11 3.5 9.4 2.6 7.8 3c-1.9.5-2.2 2.6-.9 3.4M12 6.4c1-2.9 2.6-3.8 4.2-3.4 1.9.5 2.2 2.6.9 3.4")
    },
    cake: {
      label: "Cake", tags: "holiday birthday celebration",
      inner: P("M3.4 20.4v-6.2c0-1 .8-1.8 1.8-1.8h13.6c1 0 1.8.8 1.8 1.8v6.2") +
        P("M3.4 16.4c1.6 1.5 3.2 1.5 4.8 0s3.2-1.5 4.8 0 3.2 1.5 4.8 0 2.4-1.2 3.4-.6") +
        P("M7.8 12.4V9.6M12 12.4V9.6M16.2 12.4V9.6") +
        P("M7.8 6.8c0-1 .7-1.2.7-2.3 0-.5-.3-.9-.3-.9s-.8.7-.8 1.5c0 .8.4 1.7.4 1.7Z") +
        P("M12 6.8c0-1 .7-1.2.7-2.3 0-.5-.3-.9-.3-.9s-.8.7-.8 1.5c0 .8.4 1.7.4 1.7Z") +
        P("M16.2 6.8c0-1 .7-1.2.7-2.3 0-.5-.3-.9-.3-.9s-.8.7-.8 1.5c0 .8.4 1.7.4 1.7Z") +
        L(2.4, 20.4, 21.6, 20.4)
    },
    smiley: {
      label: "Smiley", tags: "happy happiness fun",
      inner: C(12, 12, 8.8) + C(8.7, 9.9, 0.95, ' fill="currentColor" stroke="none"') + C(15.3, 9.9, 0.95, ' fill="currentColor" stroke="none"') +
        P("M7.8 14.2c1.2 2 2.6 3 4.2 3s3-1 4.2-3")
    },
    rainbow: {
      label: "Rainbow", tags: "happy holiday hope",
      inner: P("M2.8 18.4a9.2 9.2 0 0 1 18.4 0") + P("M6.2 18.4a5.8 5.8 0 0 1 11.6 0") + P("M9.6 18.4a2.4 2.4 0 0 1 4.8 0") +
        C(2.8, 14.8, 0.9) + C(21.2, 14.8, 0.9)
    },
    balloonSingle: {
      label: "Balloon", tags: "party happy celebration",
      inner: E(12, 8.6, 4.6, 5.6) + P("M12 14.2v1.4c0 2-2.2 1.8-2.2 4.2") + P("M10.9 14.7h2.2l-1.1 1.4Z")
    },

    /* ------- general: hobbies / exercise ------- */
    bike: {
      label: "Bicycle", tags: "exercise sport cycle hobby",
      inner: C(5.6, 16.4, 3.7) + C(18.4, 16.4, 3.7) +
        P("M5.6 16.4 10.4 9h2.4l-2 7.4h7.6l-2.4-5.2") + P("M6.9 9h3.6") + P("M14.4 6.2h2.7l1 2.8")
    },
    dumbbell: {
      label: "Dumbbell", tags: "exercise gym fitness",
      inner: L(7.6, 12, 16.4, 12) + P("M6.4 6.7v10.6a1.3 1.3 0 0 1-2.6 0V6.7a1.3 1.3 0 0 1 2.6 0Z") +
        P("M7.6 9v6") + P("M16.4 9v6") + P("M20.2 6.7v10.6a1.3 1.3 0 0 0 2.6 0V6.7a1.3 1.3 0 0 0-2.6 0Z")
    },
    sneaker: {
      label: "Running shoe", tags: "exercise run sport",
      inner: P("M2.6 16.6v-4.4l3.6-4.4 2.2 1.2 1.4-1.4 2.6 2.6c2 .2 4.4 1 6 2.4 1.3 1.1 2.9 1.4 3.1 2.6.1 1-.5 1.4-1.4 1.4H2.6Z") +
        P("M8.4 9.6l1.6 2.4") + P("M11 10.4l1.4 2") + L(2.6, 14.4, 20.5, 14.4)
    },
    yoga: {
      label: "Yoga", tags: "exercise wellness calm hobby",
      inner: C(12, 4.9, 2.1) + P("M12 7.6v4.6") + P("M4.4 10.4c2.6 1.4 5.2 1.2 7.6-1.2 2.4 2.4 5 2.6 7.6 1.2") +
        P("M6.4 19.4c1.2-3.2 3.4-4.8 5.6-4.8s4.4 1.6 5.6 4.8") + L(12, 12.2, 12, 14.6)
    },
    trophy: {
      label: "Trophy", tags: "exercise sport win prize",
      inner: P("M7 3.8h10v3.7a5 5 0 0 1-10 0V3.8Z") +
        P("M7 5.4H4.4a2.7 2.7 0 0 0 2.9 5.9") + P("M17 5.4h2.6a2.7 2.7 0 0 1-2.9 5.9") +
        P("M12 12.5v3.3") + P("M8.5 20.2h7l-.9-4.4H9.4l-.9 4.4Z")
    },
    brush: {
      label: "Paintbrush", tags: "hobby art paint craft",
      inner: P("M13.6 10.4 19.6 4.4a2.3 2.3 0 0 1 3.2 3.2l-6 6") +
        P("M14.9 9.1l2.2 2.2") +
        P("M13.6 10.4c1.4 1.4 1.6 3.2.5 4.6-1 1.3-2.6 1.2-3.6 2.2-1 1-1 2.6-2.4 3.4-1.6 1-3.6.4-4.4-.6 1.2-.6 1.2-2 1.8-3.2.8-1.6 2-2 3-3 1-1 1-2.2 2.2-3 .9-.6 2-.6 2.9-.4Z")
    },
    headphones: {
      label: "Headphones", tags: "hobby music listen",
      inner: P("M4.4 15.4v-3a7.6 7.6 0 0 1 15.2 0v3") + P("M4.4 13.9h1.8a1.2 1.2 0 0 1 1.2 1.2v4a1.2 1.2 0 0 1-1.2 1.2H4.4a1.2 1.2 0 0 1-1.2-1.2v-4a1.2 1.2 0 0 1 1.2-1.2Z") +
        P("M19.6 13.9h-1.8a1.2 1.2 0 0 0-1.2 1.2v4a1.2 1.2 0 0 0 1.2 1.2h1.8a1.2 1.2 0 0 0 1.2-1.2v-4a1.2 1.2 0 0 0-1.2-1.2Z")
    },
    book: {
      label: "Open book", tags: "hobby read",
      inner: P("M12 6.4C10.1 4.8 7.2 4.3 3.4 5.1v13c3.8-.8 6.7-.3 8.6 1.3 1.9-1.6 4.8-2.1 8.6-1.3v-13c-3.8-.8-6.7-.3-8.6 1.3Z") + P("M12 6.4v13")
    },
    palette: {
      label: "Paint palette", tags: "hobby art paint craft",
      inner: P("M12 3.2c5 0 8.8 3.3 8.8 7.4 0 2.5-1.7 3.7-3.6 3.7h-1.5c-1.6 0-2.4 1.9-1.2 3.1.9.9.4 2.8-1.6 2.8-5.2 0-9.7-4-9.7-8.7S7 3.2 12 3.2Z") +
        C(8, 7.2, 1.15) + C(12.4, 6, 1.15) + C(16.6, 8, 1.15) + C(7.4, 11.6, 1.15) + C(10.6, 13.9, 1.4)
    },
    yarn: {
      label: "Yarn ball", tags: "hobby craft knit",
      inner: C(11.4, 11.4, 8.2) + P("M6.1 5.3c4 1.2 7.4 5.6 8.1 12.4") + P("M4.2 9c4.2.3 8.4 3.7 10.4 9.4") +
        P("M5.8 6.6c5.4-.4 10.8 2.6 13 8.1") + P("M18.9 15.2c1.5.6 2.4 1.8 2.2 3.4")
    },
    coffee: {
      label: "Coffee", tags: "hobby cafe warm",
      inner: P("M4.4 9.2h11.4v6.4a4.4 4.4 0 0 1-4.4 4.4H8.8a4.4 4.4 0 0 1-4.4-4.4V9.2Z") +
        P("M15.8 10.6h1.6a2.6 2.6 0 0 1 0 5.2h-1.6") + P("M3.2 21.4h13.8") +
        P("M7.4 6.2c-.8-.9-.8-1.6 0-2.5") + P("M11.4 6.2c-.8-.9-.8-1.6 0-2.5")
    },
    plant: {
      label: "House plant", tags: "hobby home nature",
      inner: P("M7.4 13.4h9.2l-1 5.6a1.6 1.6 0 0 1-1.6 1.3h-4a1.6 1.6 0 0 1-1.6-1.3l-1-5.6Z") +
        P("M12 13.4V8.2") + P("M12 8.2c0-2.6 2-4.6 4.6-4.6 0 2.6-2 4.6-4.6 4.6Z") + P("M12 10.4c0-2.4-1.9-4.2-4.3-4.2 0 2.4 1.9 4.2 4.3 4.2Z")
    },
    chess: {
      label: "Chess piece", tags: "hobby game strategy",
      inner: C(12, 5.2, 2.3) + P("M9.2 8.2h5.6l-1 2.6h-3.6l-1-2.6Z") + P("M11.2 10.8h1.6v3.4h-1.6Z") +
        P("M9.4 14.2h5.2c.9 2.2 1.5 4.2 1.5 5.2H7.9c0-1 .6-3 1.5-5.2Z") + L(6.6, 19.4, 17.4, 19.4)
    },
    coffeeCup: {
      label: "Tea cup", tags: "hobby warm drink",
      inner: P("M4 9.6h12.6v5.6a4.4 4.4 0 0 1-4.4 4.4H8.4A4.4 4.4 0 0 1 4 15.2V9.6Z") +
        P("M16.6 11h1.8a2.4 2.4 0 0 1 0 4.8h-1.8") + L(3, 21.2, 18, 21.2) + P("M8 6.6V4.8") + P("M12 6.6V4.8")
    }
  };

  /* ======================================================================
     EXTRA ICON SETS — racing, flowers, cats, Japanese motifs
     Same 24×24 grid and 1.7 stroke as the rest of the library.
     ====================================================================== */

  /* repeated petals around a centre, and a cog built from teeth */
  const petalRing = (n, cx, cy, rx, ry, orbit, phase) =>
    Array.from({ length: n }).map((_, i) =>
      `<ellipse cx="${cx}" cy="${cy - orbit}" rx="${rx}" ry="${ry}" transform="rotate(${((phase || 0) + (i * 360) / n).toFixed(1)} ${cx} ${cy})"/>`
    ).join("");

  const COG = (() => {
    const teeth = Array.from({ length: 8 }).map((_, i) => {
      const a = (i * 45 * Math.PI) / 180;
      const x1 = 12 + Math.cos(a) * 5, y1 = 12 + Math.sin(a) * 5;
      const x2 = 12 + Math.cos(a) * 7.5, y2 = 12 + Math.sin(a) * 7.5;
      return `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke-width="2.5"/>`;
    }).join("");
    return C(12, 12, 5) + C(12, 12, 1.9) + teeth;
  })();

  const DOT = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r || 0.8}" fill="currentColor" stroke="none"/>`;

  Object.assign(ICONS, {
    /* ---------------- racing ---------------- */
    helmet: {
      label: "Racing helmet", tags: "racing motorsport speed",
      inner: P("M3.8 18.4c0-5.6 3.7-10 8.2-10s8.2 4.4 8.2 10") + L(3.8, 18.4, 20.2, 18.4) +
        `<path d="M4.4 12.1h5.9c2.8 0 5.3 1.5 6.9 3.8l-2.2 1.4c-1.2-1.6-3.1-2.6-5.2-2.6H4.4Z" fill="currentColor" stroke="none"/>` +
        L(12.6, 18.4, 12.6, 16.1)
    },
    flag: {
      label: "Chequered flag", tags: "racing finish flag",
      inner: L(5.6, 3.2, 5.6, 20.9) + L(3.4, 20.9, 7.8, 20.9) +
        P("M5.6 4.2h15.6v8.2H5.6Z") +
        `<rect x="5.6" y="4.2" width="5.2" height="4.1" fill="currentColor" stroke="none"/>` +
        `<rect x="16" y="4.2" width="5.2" height="4.1" fill="currentColor" stroke="none"/>` +
        `<rect x="10.8" y="8.3" width="5.2" height="4.1" fill="currentColor" stroke="none"/>`
    },
    steering: {
      label: "Steering wheel", tags: "racing drive wheel",
      inner: C(12, 12, 8.4) + C(12, 12, 3.2) +
        L(12, 8.8, 12, 3.6) + L(9.3, 13.6, 4.6, 16) + L(14.7, 13.6, 19.4, 16)
    },
    tyre: {
      label: "Tyre", tags: "racing wheel tyre",
      inner: C(12, 12, 8.3) + C(12, 12, 4.2) +
        `<circle cx="12" cy="12" r="6.3" stroke-dasharray="1.4 2.5" stroke-width="1.5"/>`
    },
    car: {
      label: "Race car", tags: "racing car speed",
      inner: P("M3 16.3c0-1.4.6-2.5 1.9-2.9l3.4-.8 2.3-2.2c.5-.5 1.1-.8 1.8-.8h3.4c.9 0 1.7.5 2.2 1.2l1.4 2.1 2.1.5c1 .2 1.7 1.1 1.7 2.1v.8H3Z") +
        C(7.7, 16.5, 2.1) + C(16.3, 16.5, 2.1) + C(7.7, 16.5, 0.85) + C(16.3, 16.5, 0.85)
    },
    stopwatch: {
      label: "Stopwatch", tags: "racing time lap",
      inner: C(12, 13.6, 6.4) + P("M12 4.2v2.6") + L(9.9, 2.9, 14.1, 2.9) +
        L(12, 13.6, 14.9, 11.5) + C(12, 13.6, 0.85) + L(17.7, 7.5, 19.3, 9.1)
    },
    fuel: {
      label: "Fuel can", tags: "racing fuel pit",
      inner: P("M7.3 7.2h9.4c.7 0 1.3.6 1.3 1.3v9.5c0 .7-.6 1.3-1.3 1.3H7.3c-.7 0-1.3-.6-1.3-1.3V8.5c0-.7.6-1.3 1.3-1.3Z") +
        P("M9.5 7.2V5.3c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9v1.9") +
        L(8.8, 16.4, 14.6, 10.6) + L(8.8, 10.6, 14.6, 16.4)
    },
    gear: { label: "Gear", tags: "racing pit wrench", inner: COG },
    cone: {
      label: "Traffic cone", tags: "racing pit track",
      inner: P("M12 4.4 7.4 17.6h9.2Z") + L(5.4, 18.6, 18.6, 18.6) +
        L(9.5, 11.4, 14.5, 11.4) + L(8.5, 14.8, 15.5, 14.8)
    },
    wrench: {
      label: "Wrench", tags: "racing pit repair",
      inner: P("M14.8 4.3a4.6 4.6 0 0 0-4.1 6.8l-6 6a1.9 1.9 0 1 0 2.7 2.7l6-6a4.6 4.6 0 0 0 6.3-5.8l-2.8 2.8-2.4-.7-.7-2.4 2.8-2.8a4.6 4.6 0 0 0-1.8-.6Z")
    },
    bolt: { label: "Lightning", tags: "speed energy racing", inner: P("M13.4 2.6 5.6 13.5h5.2l-1 7.9 8.6-11.2h-5.2Z") },
    road: {
      label: "Road", tags: "racing track circuit",
      inner: L(3.3, 20.7, 9.6, 3.7) + L(20.7, 20.7, 14.4, 3.7) +
        L(12, 19.4, 12, 17.2) + L(12, 15, 12, 12.4) + L(12, 10.2, 12, 7.4)
    },

    /* ---------------- flowers ---------------- */
    rose: {
      label: "Rose", tags: "flower bloom love",
      inner: P("M12 3.9c-3.4 0-6.2 2.8-6.2 6.2s2.8 6.2 6.2 6.2 6.2-2.8 6.2-6.2") +
        P("M12 6.3c-2.1 0-3.8 1.7-3.8 3.8s1.7 3.8 3.8 3.8 3.8-1.7 3.8-3.8") +
        P("M12 8.7c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4") +
        L(12, 16.3, 12, 21.4) + P("M12 18.3c-2.3 0-3.9-1.1-4.4-2.9 2.2-.4 3.9.7 4.4 2.9Z")
    },
    tulip: {
      label: "Tulip", tags: "flower spring bloom",
      inner: P("M6.6 8.2v2.4c0 3.1 2.4 5.6 5.4 5.6s5.4-2.5 5.4-5.6V8.2l-2.7 1.9L12 6.1 9.3 10.1Z") +
        L(12, 16.2, 12, 21.4) + P("M12 18.7c-2.4 0-4-1.2-4.4-3 2.2-.3 3.8.7 4.4 3Z")
    },
    sunflower: {
      label: "Sunflower", tags: "flower summer sun",
      inner: petalRing(14, 12, 12, 1.5, 3.2, 6) + C(12, 12, 3.2) +
        DOT(11, 11.2, 0.5) + DOT(13.2, 12.4, 0.5) + DOT(11.6, 13.4, 0.45)
    },
    blossom: {
      label: "Blossom", tags: "flower petal bloom",
      inner: petalRing(5, 12, 12, 2.7, 3.9, 4.5, -90) + C(12, 12, 1.9)
    },
    poppy: {
      label: "Poppy", tags: "flower field red",
      inner: petalRing(4, 12, 11.4, 3.4, 4.3, 3.9, -45) + C(12, 11.4, 2.5) + DOT(12, 11.4, 0.6) +
        L(12, 15.2, 12, 21.4) + P("M12 18.4c-2.2-.2-3.6-1.2-4-2.9 2-.3 3.4.6 4 2.9Z")
    },
    leaf: {
      label: "Leaf", tags: "flower leaf plant",
      inner: P("M20.2 3.8c0 8.4-4.3 12.8-9.6 12.8-3.6 0-6.4-2.4-6.4-5.6 0-5.4 7.2-7.2 16-7.2Z") +
        P("M19.6 4.4C14.8 8.8 10 13.2 5.8 18.6")
    },
    sprig: {
      label: "Sprig", tags: "flower botanical green",
      inner: L(12, 21.6, 12, 6.6) +
        P("M12 10.4c-2.6-.4-4.2-1.8-4.6-3.8 2.4-.2 4.2 1.4 4.6 3.8Z") +
        P("M12 10.4c2.6-.4 4.2-1.8 4.6-3.8-2.4-.2-4.2 1.4-4.6 3.8Z") +
        P("M12 15.2c-2.6-.4-4.2-1.8-4.6-3.8 2.4-.2 4.2 1.4 4.6 3.8Z") +
        P("M12 15.2c2.6-.4 4.2-1.8 4.6-3.8-2.4-.2-4.2 1.4-4.6 3.8Z") +
        C(12, 5.4, 1.5)
    },
    vase: {
      label: "Vase", tags: "flower home still life",
      inner: P("M8.5 12.8h7c0 3.6-1 5.2-1 7.2 0 .9-1 1.4-2.5 1.4s-2.5-.5-2.5-1.4c0-2-1-3.6-1-7.2Z") +
        L(10.2, 12.8, 9.1, 8) + L(13.8, 12.8, 14.9, 8) + L(12, 12.8, 12, 6.4) +
        C(12, 5.2, 1.25) + C(8.6, 7, 1.1) + C(15.4, 7, 1.1)
    },
    wateringCan: {
      label: "Watering can", tags: "flower garden water",
      inner: P("M7.6 9.8h6.8c.6 0 1.1.5 1.1 1.1v7.5c0 1-.8 1.8-1.8 1.8H8.3c-1 0-1.8-.8-1.8-1.8v-7.5c0-.6.5-1.1 1.1-1.1Z") +
        P("M15.5 12.1 20 9.4v2.9l-4.5 2.3") +
        P("M7.4 11.8c-2.3.4-3.5 2-3.5 4.1s1.3 3.4 3.5 3.6")
    },
    butterfly: {
      label: "Butterfly", tags: "flower garden summer",
      inner: `<ellipse cx="7.3" cy="10.4" rx="4.2" ry="3.2" transform="rotate(-28 7.3 10.4)"/>` +
        `<ellipse cx="7.7" cy="15.4" rx="3.2" ry="2.5" transform="rotate(-16 7.7 15.4)"/>` +
        `<ellipse cx="16.7" cy="10.4" rx="4.2" ry="3.2" transform="rotate(28 16.7 10.4)"/>` +
        `<ellipse cx="16.3" cy="15.4" rx="3.2" ry="2.5" transform="rotate(16 16.3 15.4)"/>` +
        L(12, 8.6, 12, 17.6) + C(12, 7.3, 0.75) + P("M11.4 6.7 9.6 4.2") + P("M12.6 6.7 14.4 4.2")
    },
    bee: {
      label: "Bee", tags: "flower garden honey",
      inner: E(12, 13.8, 4.2, 5.4) +
        L(8.4, 11.9, 15.6, 11.9) + L(8, 14.2, 16, 14.2) + L(8.6, 16.6, 15.4, 16.6) +
        `<ellipse cx="7.2" cy="9.4" rx="2.7" ry="1.8" transform="rotate(-32 7.2 9.4)"/>` +
        `<ellipse cx="16.8" cy="9.4" rx="2.7" ry="1.8" transform="rotate(32 16.8 9.4)"/>` +
        C(12, 7, 1.7) + P("M11.1 5.6 10 3.6") + P("M12.9 5.6 14 3.6") + L(12, 17.4, 12, 20.4)
    },
    lavender: {
      label: "Lavender", tags: "flower garden purple",
      inner: L(12, 21.6, 12, 12.4) +
        E(12, 10.3, 1.5, 2.1) + E(10.9, 7.7, 1.35, 1.9) + E(13.1, 7.7, 1.35, 1.9) + E(12, 5.3, 1.25, 1.8) +
        L(12, 16.4, 9.6, 14.4) + L(12, 18.2, 14.4, 16.2)
    },
    clover: {
      label: "Clover", tags: "flower luck garden",
      inner: C(12, 7.4, 3.5) + C(8.6, 13, 3.5) + C(15.4, 13, 3.5) +
        L(12, 15.4, 12, 21.4) + P("M12 18c1.9 0 3.1-1 3.5-2.4-1.8-.3-3 .6-3.5 2.4Z")
    },
    mushroom: {
      label: "Mushroom", tags: "flower forest garden",
      inner: P("M4.4 12.4c0-4.2 3.4-7.6 7.6-7.6s7.6 3.4 7.6 7.6c0 .9-.7 1.6-1.6 1.6H6c-.9 0-1.6-.7-1.6-1.6Z") +
        P("M9.6 14v4.2c0 1.2 1 2.2 2.4 2.2s2.4-1 2.4-2.2V14") +
        DOT(9.2, 9.6, 0.85) + DOT(14.4, 8.8, 0.7)
    },

    /* ---------------- cats ---------------- */
    kitty: {
      label: "Cat face", tags: "cat pet kitten",
      inner: C(12, 13.4, 6.5) +
        P("M6.2 9.9 5.4 4.5l5 3.1") + P("M17.8 9.9 18.6 4.5l-5 3.1") +
        DOT(9.7, 12.8, 0.85) + DOT(14.3, 12.8, 0.85) +
        P("M11.2 15h1.6L12 16.1Z") + P("M12 16.1v.9") + P("M10.5 17.4q1.5 1.5 3 0") +
        L(3.8, 12.4, 6.7, 12.9) + L(3.9, 15.2, 6.6, 14.6) +
        L(20.2, 12.4, 17.3, 12.9) + L(20.1, 15.2, 17.4, 14.6)
    },
    fish: {
      label: "Fish", tags: "cat food fish",
      inner: P("M9 12c0-2.8 2.6-4.8 6-4.8s6 2 6 4.8-2.8 4.8-6 4.8-6-2-6-4.8Z") +
        P("M8.8 12 3.6 8.2v7.6L8.8 12Z") + DOT(17.2, 11, 0.8)
    },
    milk: {
      label: "Milk carton", tags: "cat drink milk",
      inner: P("M8.6 8.6 12 4.3l3.4 4.3v9.6c0 .9-.7 1.6-1.6 1.6H10.2c-.9 0-1.6-.7-1.6-1.6Z") +
        P("M8.6 8.6 12 10.6l3.4-2") + L(8.9, 13.6, 15.1, 13.6)
    },
    box: {
      label: "Cardboard box", tags: "cat play box",
      inner: P("M4.6 9.2 12 5.2l7.4 4v7.6L12 20.8l-7.4-4Z") +
        P("M4.6 9.2 12 13.2l7.4-4") + L(12, 13.2, 12, 20.8)
    },
    feather: {
      label: "Feather", tags: "cat play bird",
      inner: P("M18.8 5.2c.4 6-3 10.2-7.6 12.2L8 14.4C10 9.8 13 5.6 18.8 5.2Z") +
        L(4.6, 19.4, 11.4, 12.4) + L(9.9, 14.1, 8.4, 12.6) + L(12.4, 11.6, 10.9, 9.9)
    },
    bell: {
      label: "Bell", tags: "cat collar bell",
      inner: P("M7.8 10.9a4.2 4.2 0 0 1 8.4 0c0 4.1 1.5 5.5 1.5 5.5H6.3s1.5-1.4 1.5-5.5Z") +
        P("M10.4 19.1a1.7 1.7 0 0 0 3.2 0") + L(12, 4.7, 12, 6.4)
    },
    moon: {
      label: "Crescent moon", tags: "cat night sleep cosy",
      inner: P("M20.2 14.4A8.4 8.4 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6Z") +
        DOT(16.6, 7.4, 0.7) + DOT(19.4, 10.4, 0.55)
    },

    /* ---------------- Japanese motifs ---------------- */
    sakura: {
      label: "Sakura", tags: "japan cherry blossom",
      inner: Array.from({ length: 5 }).map((_, i) =>
        `<path d="M0 0C-1.9-1.5-2.4-3.6-1.6-5.3-.8-5.9-.5-5.9 0-4.7.5-5.9.8-5.9 1.6-5.3 2.4-3.6 1.9-1.5 0 0Z" transform="translate(12 12.4) rotate(${i * 72 + 90})"/>`
      ).join("") + C(12, 12.4, 1.5) + DOT(12, 12.4, 0.5)
    },
    torii: {
      label: "Torii gate", tags: "japan shrine gate",
      inner: P("M3.4 6.6c2.9-1 5.8-1.5 8.6-1.5s5.7.5 8.6 1.5") + L(4.8, 9.7, 19.2, 9.7) +
        L(7.4, 6.9, 7.4, 19.6) + L(16.6, 6.9, 16.6, 19.6) + L(12, 9.7, 12, 17.4)
    },
    wave: {
      label: "Seigaiha wave", tags: "japan sea wave pattern",
      inner: P("M2.6 18.6a9.4 9.4 0 0 1 18.8 0") + P("M6.4 18.6a5.6 5.6 0 0 1 11.2 0") +
        P("M10.2 18.6a1.8 1.8 0 0 1 3.6 0")
    },
    fan: {
      label: "Folding fan", tags: "japan fan summer",
      inner: P("M4.8 10.2a10.6 10.6 0 0 1 14.4 0L12 19.4Z") +
        L(12, 19.4, 8.2, 8.8) + L(12, 19.4, 12, 7.6) + L(12, 19.4, 15.8, 8.8)
    },
    lantern: {
      label: "Paper lantern", tags: "japan lantern festival",
      inner: P("M12 6.2c3.4 0 6.2 2.9 6.2 6.4s-2.8 6.4-6.2 6.4-6.2-2.9-6.2-6.4 2.8-6.4 6.2-6.4Z") +
        L(8.2, 5.4, 15.8, 5.4) + L(8.6, 19.2, 15.4, 19.2) + P("M12 5.4V3.4") +
        L(6.6, 10.4, 17.4, 10.4) + P("M6 12.6h12") + P("M6.8 15.2h10.4")
    },
    koi: {
      label: "Koi carp", tags: "japan fish pond",
      inner: P("M4.7 13.7c1.8-3.6 4.7-5.4 8.1-5.4 3 0 5.3 1.4 6.5 3.4-1 2.8-3.8 4.6-7.2 4.6-2.8 0-5.2-1-7.4-2.6Z") +
        P("M4.7 13.7 3.2 9.4l3.5 1.3") + P("M4.7 13.7 3.2 18l3.5-1.3") + DOT(16.2, 12.2, 0.75)
    },
    onigiri: {
      label: "Onigiri", tags: "japan rice snack",
      inner: P("M12 4.6c.8 0 1.5.4 1.9 1.1l5.6 9.6c.9 1.6-.2 3.5-2 3.5H6.5c-1.8 0-2.9-1.9-2-3.5l5.6-9.6c.4-.7 1.1-1.1 1.9-1.1Z") +
        `<rect x="8.9" y="15.2" width="6.2" height="3.6" fill="currentColor" stroke="none" opacity="0.85"/>`
    },
    daruma: {
      label: "Daruma", tags: "japan doll luck",
      inner: P("M12 3.8c4 0 7.2 3.8 7.2 8.6 0 5-3.2 8.2-7.2 8.2s-7.2-3.2-7.2-8.2c0-4.8 3.2-8.6 7.2-8.6Z") +
        DOT(9.9, 10.6, 0.8) + DOT(14.1, 10.6, 0.8) +
        P("M10.6 14.4c.9.6 1.9.6 2.8 0") + P("M6.6 16.8c3.6 1.6 7.2 1.6 10.8 0")
    }
  });


  /* ---------- Bichon Frise illustrator ---------- */
  /* Drawing is built on a 64x64 canvas. Fixed palette keeps the pup looking
     like a pup on every theme; paper tone is inherited via --fur. */
  function fluff(cx, cy, r, bumps, amp, phase) {
    const step = (Math.PI * 2) / bumps;
    let d = "";
    for (let i = 0; i < bumps; i++) {
      const a0 = (phase || 0) + i * step;
      const a1 = a0 + step;
      const mid = (a0 + a1) / 2;
      const x0 = (cx + r * Math.cos(a0)).toFixed(2);
      const y0 = (cy + r * Math.sin(a0)).toFixed(2);
      const x1 = (cx + r * Math.cos(a1)).toFixed(2);
      const y1 = (cy + r * Math.sin(a1)).toFixed(2);
      const mx = (cx + (r + amp) * Math.cos(mid)).toFixed(2);
      const my = (cy + (r + amp) * Math.sin(mid)).toFixed(2);
      d += (i === 0 ? `M${x0} ${y0}` : "") + `Q${mx} ${my} ${x1} ${y1}`;
    }
    return d + "Z";
  }

  const FUR = "#FFFFFF";
  const FUR_SHADE = "#F3EAE3";
  const OUTLINE = "#6B5148";
  const EYE = "#3B2B27";
  const BLUSH = "#F3ACB7";
  const TONGUE = "#E8798F";

  function bichonFace(opts) {
    const o = Object.assign({ expr: "happy", acc: "none", vb: 64 }, opts || {});
    const eyes =
      o.expr === "wink"
        ? `<path d="M23 31.5q3.2-3.2 6.4 0" fill="none" stroke="${EYE}" stroke-width="2.6" stroke-linecap="round"/>
           <ellipse cx="41" cy="32" rx="2.9" ry="3.4" fill="${EYE}"/>
           <circle cx="42.1" cy="30.7" r="0.95" fill="#fff"/>`
        : o.expr === "sleep"
          ? `<path d="M22.4 32.6q3.4 2.8 6.6 0" fill="none" stroke="${EYE}" stroke-width="2.5" stroke-linecap="round"/>
             <path d="M35.4 32.6q3.4 2.8 6.6 0" fill="none" stroke="${EYE}" stroke-width="2.5" stroke-linecap="round"/>`
          : `<ellipse cx="25.6" cy="32" rx="2.9" ry="3.5" fill="${EYE}"/>
             <ellipse cx="38.6" cy="32" rx="2.9" ry="3.5" fill="${EYE}"/>
             <circle cx="26.7" cy="30.6" r="0.95" fill="#fff"/>
             <circle cx="39.7" cy="30.6" r="0.95" fill="#fff"/>`;

    const shades =
      `<g>
        <rect x="19.4" y="27.8" width="11.2" height="7.4" rx="3.4" fill="${EYE}"/>
        <rect x="33.4" y="27.8" width="11.2" height="7.4" rx="3.4" fill="${EYE}"/>
        <path d="M30.6 30.6h2.8" stroke="${EYE}" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M19.8 29.4l-2.6-1.4M44.2 29.4l2.6-1.4" stroke="${EYE}" stroke-width="1.8" stroke-linecap="round"/>
      </g>`;

    const mouth = o.expr === "tongue"
      ? `<path d="M28.4 39.4q3.6 3.6 7.2 0" fill="none" stroke="${OUTLINE}" stroke-width="2.1" stroke-linecap="round"/>
         <path d="M29.8 41.2h4.4v2.6a2.2 2.2 0 0 1-4.4 0v-2.6Z" fill="${TONGUE}" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round"/>`
      : `<path d="M32 37.4v2.4" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>
         <path d="M27.8 39.2q4.2 4.6 8.4 0" fill="none" stroke="${OUTLINE}" stroke-width="2.1" stroke-linecap="round"/>`;

    const blush = o.expr === "sleep"
      ? ""
      : `<ellipse cx="20.6" cy="40.6" rx="3.8" ry="2.3" fill="${BLUSH}" opacity="0.75"/>
         <ellipse cx="43.4" cy="40.6" rx="3.8" ry="2.3" fill="${BLUSH}" opacity="0.75"/>`;

    const bow = o.acc === "bow"
      ? `<g transform="translate(45.5 15) rotate(14)">
           <path d="M0 0c-5-4.2-9.2-1.8-8.6 2.4.5 3.6 4.8 4.2 8.6 0Z" fill="${BLUSH}" stroke="${OUTLINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <path d="M0 0c3.6-4.8 8-4 8.4 0 .4 4-3.8 5.4-8.4 0Z" fill="${BLUSH}" stroke="${OUTLINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <circle cx="0" cy="1.4" r="2.5" fill="#E8798F" stroke="${OUTLINE}" stroke-width="1.4"/>
         </g>`
      : "";

    const hat = o.acc === "hat"
      ? `<g transform="translate(32 6.5)">
           <path d="M-7.6 7.6 -1.2-7.4c.6-1.4 2.6-1.4 3.2 0l6.4 15Z" fill="#F2C94C" stroke="${OUTLINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <path d="M-4.4 1.2 4.2 1.2" stroke="#E8798F" stroke-width="3.4"/>
           <circle cx="0" cy="-9.6" r="2.9" fill="${BLUSH}" stroke="${OUTLINE}" stroke-width="1.5"/>
         </g>`
      : "";

    const crownArt = o.acc === "crown"
      ? `<g transform="translate(32 10.4)">
           <path d="M-10 4.6 -12.4-6.4l5.8 3.4L0-9.6l6.6 6.6 5.8-3.4L10 4.6Z" fill="#F2C94C" stroke="${OUTLINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <circle cx="0" cy="-11.6" r="1.5" fill="#fff" stroke="${OUTLINE}" stroke-width="1.1"/>
         </g>`
      : "";

    const zzz = o.expr === "sleep"
      ? `<g fill="none" stroke="${OUTLINE}" stroke-width="1.9" stroke-linecap="round">
           <path d="M45.6 18.6h5.4l-5.4 6h5.4"/>
           <path d="M53.4 10.4h3.6l-3.6 4h3.6" stroke-width="1.6"/>
         </g>`
      : "";

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="${OUTLINE}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
        <!-- ears behind head -->
        <path d="${fluff(12.2, 34.4, 9.4, 10, 1.6, 0.3)}" fill="${FUR_SHADE}"/>
        <path d="${fluff(51.8, 34.4, 9.4, 10, 1.6, 0.3)}" fill="${FUR_SHADE}"/>
        <!-- top knot -->
        <path d="${fluff(32, 14.6, 7.4, 10, 1.5, 0.2)}" fill="${FUR}"/>
        <path d="${fluff(23.6, 19.4, 6.2, 9, 1.3, 0.5)}" fill="${FUR}"/>
        <path d="${fluff(40.4, 19.4, 6.2, 9, 1.3, 0.5)}" fill="${FUR}"/>
        <!-- head -->
        <path d="${fluff(32, 31.6, 17.4, 16, 1.75, 0.12)}" fill="${FUR}"/>
        <!-- cheeks -->
        <path d="${fluff(17.8, 39.4, 6.6, 10, 1.2, 0.4)}" fill="${FUR}"/>
        <path d="${fluff(46.2, 39.4, 6.6, 10, 1.2, 0.4)}" fill="${FUR}"/>
      </g>
      ${blush}
      ${o.acc === "shades" ? shades : eyes}
      <!-- muzzle -->
      <ellipse cx="32" cy="37" rx="6.6" ry="5" fill="${FUR}"/>
      <path d="M29.4 35.4c1.6-.9 3.6-.9 5.2 0" fill="none" stroke="${OUTLINE}" stroke-width="1.9" stroke-linecap="round"/>
      <ellipse cx="32" cy="35.4" rx="2.5" ry="1.9" fill="${EYE}"/>
      ${mouth}
      ${bow}${hat}${crownArt}${zzz}
    </svg>`;
  }


  /* ======================================================================
     CAT illustrator — a ginger cat face on the same 64×64 canvas
     ====================================================================== */
  const CAT_FUR = "#F7C9A2";
  const CAT_SHADE = "#EBB181";
  const CAT_INNER = "#EFA3A9";
  const CAT_LINE = "#6B4A38";
  const CAT_EYE = "#332B26";
  const CAT_CREAM = "#FFF4E7";
  const CAT_BLUSH = "#F3A6AE";

  function catFace(opts) {
    const o = Object.assign({ expr: "happy", acc: "none" }, opts || {});

    const eyes =
      o.expr === "sleep"
        ? `<path d="M21.8 31.8q3.4 3 6.6 0M35.6 31.8q3.4 3 6.6 0" fill="none" stroke="${CAT_EYE}" stroke-width="2.5" stroke-linecap="round"/>`
        : o.expr === "wink"
          ? `<path d="M22 32.2q3.4-3.2 6.8 0" fill="none" stroke="${CAT_EYE}" stroke-width="2.6" stroke-linecap="round"/>
             <ellipse cx="39" cy="32" rx="3.1" ry="4.1" fill="${CAT_EYE}"/>
             <circle cx="40.2" cy="30.4" r="1.05" fill="#fff"/>`
          : `<ellipse cx="25.4" cy="32" rx="3.1" ry="4.1" fill="${CAT_EYE}"/>
             <ellipse cx="38.6" cy="32" rx="3.1" ry="4.1" fill="${CAT_EYE}"/>
             <circle cx="26.5" cy="30.4" r="1.05" fill="#fff"/>
             <circle cx="39.7" cy="30.4" r="1.05" fill="#fff"/>`;

    const mouth = o.expr === "tongue"
      ? `<path d="M28.4 41.6q3.6 3.4 7.2 0" fill="none" stroke="${CAT_LINE}" stroke-width="2.1" stroke-linecap="round"/>
         <path d="M29.8 43.4h4.4v2.6a2.2 2.2 0 0 1-4.4 0v-2.6Z" fill="#E8798F" stroke="${CAT_LINE}" stroke-width="1.4" stroke-linejoin="round"/>`
      : `<path d="M32 40.4v2.2" stroke="${CAT_LINE}" stroke-width="2" stroke-linecap="round"/>
         <path d="M27.8 42q4.2 4.4 8.4 0M36.2 42q-1.4 3.2-4.2 4.2" fill="none" stroke="${CAT_LINE}" stroke-width="2" stroke-linecap="round"/>`;

    const blush = o.expr === "sleep" ? "" :
      `<ellipse cx="19.4" cy="39.6" rx="4" ry="2.4" fill="${CAT_BLUSH}" opacity="0.7"/>
       <ellipse cx="44.6" cy="39.6" rx="4" ry="2.4" fill="${CAT_BLUSH}" opacity="0.7"/>`;

    const bow = o.acc === "bow"
      ? `<g transform="translate(45.8 15.4) rotate(14)">
           <path d="M0 0c-5-4.2-9.2-1.8-8.6 2.4.5 3.6 4.8 4.2 8.6 0Z" fill="${CAT_BLUSH}" stroke="${CAT_LINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <path d="M0 0c3.6-4.8 8-4 8.4 0 .4 4-3.8 5.4-8.4 0Z" fill="${CAT_BLUSH}" stroke="${CAT_LINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <circle cx="0" cy="1.4" r="2.5" fill="#E8798F" stroke="${CAT_LINE}" stroke-width="1.4"/>
         </g>`
      : "";

    const crownArt = o.acc === "crown"
      ? `<g transform="translate(32 11.4)">
           <path d="M-10 4.6 -12.4-6.4l5.8 3.4L0-9.6l6.6 6.6 5.8-3.4L10 4.6Z" fill="#F2C94C" stroke="${CAT_LINE}" stroke-width="1.7" stroke-linejoin="round"/>
           <circle cx="0" cy="-11.6" r="1.5" fill="#fff" stroke="${CAT_LINE}" stroke-width="1.1"/>
         </g>`
      : "";

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="${CAT_LINE}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
        <!-- ears -->
        <path d="M16.6 23.4 11.8 4.2 28.4 12.4Z" fill="${CAT_SHADE}"/>
        <path d="M47.4 23.4 52.2 4.2 35.6 12.4Z" fill="${CAT_SHADE}"/>
        <path d="M18.2 20 15.6 9.2 25.2 14Z" fill="${CAT_INNER}" stroke-width="1.2"/>
        <path d="M45.8 20 48.4 9.2 38.8 14Z" fill="${CAT_INNER}" stroke-width="1.2"/>
        <!-- head -->
        <ellipse cx="32" cy="33.4" rx="19.4" ry="16.4" fill="${CAT_FUR}"/>
        <!-- cheek tufts -->
        <path d="M13.4 36.6c-2.6.6-4.6 1.8-5.8 3.6 2.4.6 4.6.2 6.4-1.2" fill="${CAT_FUR}"/>
        <path d="M50.6 36.6c2.6.6 4.6 1.8 5.8 3.6-2.4.6-4.6.2-6.4-1.2" fill="${CAT_FUR}"/>
      </g>
      ${blush}
      <!-- forehead stripes -->
      <g stroke="${CAT_SHADE}" stroke-width="2.4" stroke-linecap="round" fill="none">
        <path d="M32 18.6v4.6"/>
        <path d="M26.4 19.8 25.6 24"/>
        <path d="M37.6 19.8 38.4 24"/>
      </g>
      ${eyes}
      <ellipse cx="32" cy="40.4" rx="9.4" ry="6.6" fill="${CAT_CREAM}"/>
      <path d="M29.6 37.8h4.8L32 40.6Z" fill="${CAT_INNER}" stroke="${CAT_LINE}" stroke-width="1.3" stroke-linejoin="round"/>
      ${mouth}
      <g stroke="${CAT_LINE}" stroke-width="1.3" stroke-linecap="round" opacity="0.85">
        <path d="M22.6 38.6 11.4 36.4"/><path d="M22.4 41 10.8 40.4"/><path d="M23 43.4l-10.6 2"/>
        <path d="M41.4 38.6 52.6 36.4"/><path d="M41.6 41 53.2 40.4"/><path d="M41 43.4l10.6 2"/>
      </g>
      ${bow}${crownArt}
    </svg>`;
  }

  /* ======================================================================
     MANEKI-NEKO — the beckoning lucky cat, 64×64
     ====================================================================== */
  const MK_FUR = "#FFFFFF";
  const MK_SHADE = "#F2E8DC";
  const MK_LINE = "#5B4A46";
  const MK_RED = "#D8362F";
  const MK_GOLD = "#E8B93B";
  const MK_GOLD_D = "#C99A24";
  const MK_PINK = "#EFA3A9";

  function manekiCat(opts) {
    const o = Object.assign({ acc: "coin" }, opts || {});

    const coin = o.acc === "coin"
      ? `<g>
           <ellipse cx="32" cy="45.6" rx="6.6" ry="7.6" fill="${MK_GOLD}" stroke="${MK_LINE}" stroke-width="1.5"/>
           <ellipse cx="32" cy="45.6" rx="4.2" ry="5.1" fill="none" stroke="${MK_GOLD_D}" stroke-width="1.2"/>
           <path d="M29.6 43.6h4.8M29.6 45.8h4.8M30.6 48h2.8" stroke="${MK_GOLD_D}" stroke-width="1.2" stroke-linecap="round"/>
         </g>`
      : "";

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
      <g stroke="${MK_LINE}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
        <!-- ears -->
        <path d="M21.2 15.4 19 4.2 30.6 10.4Z" fill="${MK_SHADE}"/>
        <path d="M42.8 15.4 45 4.2 33.4 10.4Z" fill="${MK_SHADE}"/>
        <path d="M22.8 13.6 21.6 7.4 27.6 10.8Z" fill="${MK_PINK}" stroke-width="1.1"/>
        <path d="M41.2 13.6 42.4 7.4 36.4 10.8Z" fill="${MK_PINK}" stroke-width="1.1"/>
        <!-- body -->
        <path d="M16.8 56.8c-1.4-10.2 4-17.2 15.2-17.2s16.6 7 15.2 17.2Z" fill="${MK_FUR}"/>
        <!-- head -->
        <ellipse cx="31.4" cy="21.6" rx="12.4" ry="11" fill="${MK_FUR}"/>
        <!-- raised paw -->
        <ellipse cx="48.4" cy="32" rx="4.6" ry="9.4" transform="rotate(8 48.4 32)" fill="${MK_FUR}"/>
        <path d="M46.6 24.6v3.2M49.4 24.2v3.2" stroke-width="1.2" opacity="0.8"/>
        <!-- collar + bell -->
        <path d="M22.6 30.4c6.2 2.2 12.6 2.2 18.8 0" stroke="${MK_RED}" stroke-width="3.2"/>
        <circle cx="32" cy="32.4" r="2.8" fill="${MK_GOLD}" stroke-width="1.4"/>
        <path d="M30.6 33.2h2.8" stroke="${MK_GOLD_D}" stroke-width="1.1"/>
        <!-- bib -->
        <path d="M23.4 33.6c5.2 3.2 12 3.2 17.2 0l2.2 9.8c-6.8 3-14.8 3-21.6 0Z" fill="${MK_RED}" stroke-width="1.5"/>
      </g>
      ${coin}
      <!-- face -->
      <g fill="none" stroke="${MK_LINE}" stroke-width="2.1" stroke-linecap="round">
        <path d="M24.4 22.4q2.9-3 5.8 0"/>
        <path d="M32.6 22.4q2.9-3 5.8 0"/>
      </g>
      <path d="M30.6 24.4h2.4l-1.2 1.5Z" fill="${MK_PINK}" stroke="${MK_LINE}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M31.8 25.9v1M30 27q1.8 1.5 3.6 0" fill="none" stroke="${MK_LINE}" stroke-width="1.4" stroke-linecap="round"/>
      <g stroke="${MK_LINE}" stroke-width="1.2" stroke-linecap="round" opacity="0.8">
        <path d="M19.6 22.6 13 21"/><path d="M19.4 25.2 12.8 25.8"/>
      </g>
      <!-- front paws -->
      <g stroke="${MK_LINE}" stroke-width="1.5" fill="${MK_FUR}" stroke-linejoin="round">
        <ellipse cx="24.6" cy="54.6" rx="5.2" ry="3.2"/>
        <ellipse cx="39.4" cy="54.6" rx="5.2" ry="3.2"/>
      </g>
    </svg>`;
  }

  const BICHONS = {
    bichon: { expr: "happy", acc: "none" },
    bichonBow: { expr: "happy", acc: "bow" },
    bichonWink: { expr: "wink", acc: "bow" },
    bichonParty: { expr: "tongue", acc: "hat" },
    bichonCool: { expr: "happy", acc: "shades" },
    bichonSleep: { expr: "sleep", acc: "none" },
    bichonCrown: { expr: "happy", acc: "crown" },
    bichonTongue: { expr: "tongue", acc: "none" }
  };

  const CATS = {
    catnap: { label: "Cat with a bow", expr: "happy", acc: "bow" },
    catnapWink: { label: "Winking cat", expr: "wink", acc: "bow" },
    catnapSleep: { label: "Sleeping cat", expr: "sleep", acc: "none" },
    catnapCrown: { label: "Cat in a crown", expr: "happy", acc: "crown" },
    catnapTongue: { label: "Cat with tongue out", expr: "tongue", acc: "none" }
  };

  const MANEKIS = {
    maneki: { label: "Maneki-neko", acc: "coin" },
    manekiPlain: { label: "Maneki-neko, plain", acc: "none" }
  };

  function svgFor(name, opts) {
    if (BICHONS[name]) {
      const b = BICHONS[name];
      return bichonFace(Object.assign({}, b, opts));
    }
    if (CATS[name]) return catFace(Object.assign({}, CATS[name], opts));
    if (MANEKIS[name]) return manekiCat(Object.assign({}, MANEKIS[name], opts));
    const ic = ICONS[name];
    if (!ic) return "";
    const attrs = ic.filled
      ? `fill="currentColor" stroke="none"`
      : `fill="none" stroke="currentColor" stroke-width="${ic.sw || 1.7}" stroke-linecap="round" stroke-linejoin="round"`;
    return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ${attrs}>${ic.inner}</svg>`;
  }

  const MASCOTS = Object.assign({}, BICHONS, CATS, MANEKIS);

  global.CardIcons = {
    ICONS,
    BICHONS,
    CATS,
    MANEKIS,
    MASCOTS,
    svgFor,
    bichonFace,
    catFace,
    manekiCat,
    /* mascots are illustrations, never shrunk into the icon ring */
    isMascot: (name) => Object.prototype.hasOwnProperty.call(MASCOTS, name),
    names: Object.keys(ICONS).concat(Object.keys(MASCOTS))
  };
})(window);
