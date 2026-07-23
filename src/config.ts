/* ============================================================
   💖  EASY CUSTOMIZATION  💖
   Edit the text between the "quotes" — save — refresh.
   (When developing: `npm run dev`. To rebuild the gift: `npm run build`.)
   ============================================================ */

export const CONFIG = {
  herName: "Sugandh", // ← put her name here
  yourName: "Yours, always", // ← how you sign off

  // Page 1 — the question
  question: "Do you love me?",
  yesText: "Yes",
  noText: "No",
  // cheeky things the "No" button says as it runs away (loops)
  noTaunts: [
    "No",
    "Are you sure?",
    "Really?",
    "Think again 🥺",
    "Last chance…",
    "Can't catch me!",
    "Pretty please?",
    "My heart 💔",
    "Just say yes 🥹",
    "I'll wait forever…",
  ],

  // Page 2 — the letter
  letterTitle: "A little note, just for you",
  letterDate: "Today, and every day after",
  letterBody:
    "Hi, you. I won't borrow anyone else's words for this, because you deserve mine, clumsy and true. " +
    "Loving you is the softest thing that has ever happened to me. I love the sleepy sound of your voice in the morning. " +
    "I love the way you steal the blanket, and that little laugh you do when you think no one is listening. " +
    "When you're far from me, I catch myself saving up kisses to give you later. One for your forehead. " +
    "One for the tip of your nose. And a hundred slow ones just for your lips. " +
    "So here is my promise. I will choose you on the easy days, and hold you closer on the hard ones. " +
    "Thank you for being mine. Now come here. I still owe you that kiss. 💋",

  // Ambient music + sounds default on?
  soundDefaultOn: false,
};

export type Config = typeof CONFIG;
