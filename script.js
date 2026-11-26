const textDisplay = document.getElementById('text-display');
const typingArea = document.getElementById('typing-area');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const wordCountDisplay = document.getElementById('word-count');
const restartBtn = document.getElementById('restart-btn');
const aiStatus = document.getElementById('ai-status');

// Lightweight Markov Chain vocabulary for realistic, continuous AI text generation
const aiVocabulary = {
  start: ["the", "artificial", "digital", "every", "coding", "modern", "smart", "rapid"],
  the: ["system", "network", "future", "algorithm", "keyboard", "program", "stream", "machine"],
  artificial: ["intelligence", "neural", "minds", "systems"],
  digital: ["world", "age", "horizon", "tools", "flow"],
  every: ["keystroke", "second", "word", "developer", "challenge"],
  coding: ["projects", "skills", "logic", "creates", "requires"],
  modern: ["technology", "software", "websites", "interfaces"],
  smart: ["algorithms", "bots", "solutions", "models"],
  rapid: ["typing", "progress", "learning", "thinking"],
  system: ["learns", "adapts", "generates", "processes", "connects"],
  network: ["expands", "calculates", "streams", "predicts"],
  future: ["belongs", "evolves", "starts", "depends"],
  algorithm: ["predicts", "builds", "writes", "optimizes"],
  keyboard: ["clicks", "responds", "guides", "moves"],
  program: ["runs", "executes", "compiles", "generates"],
  stream: ["continues", "flows", "adapts", "grows"],
  machine: ["learning", "logic", "speed", "accuracy"],
  intelligence: ["powers", "shapes", "transforms", "drives"],
  neural: ["networks", "pathways", "patterns"],
  minds: ["create", "imagine", "solve", "build"],
  systems: ["operate", "scale", "synchronize"],
  world: ["changes", "connects", "innovates"],
  age: ["demands", "brings", "inspires"],
  horizon: ["looks", "opens", "expands"],
  tools: ["empower", "assist", "accelerate"],
  flow: ["never", "always", "smoothly"],
  keystroke: ["builds", "matters", "improves", "counts"],
  second: ["counts", "brings", "measures"],
  word: ["appears", "follows", "connects", "flows"],
  developer: ["writes", "builds", "creates", "designs"],
  challenge: ["sharpens", "tests", "improves"],
  projects: ["launch", "grow", "succeed"],
  skills: ["improve", "matter", "develop"],
  logic: ["drives", "powers", "structures"],
  creates: ["new", "better", "fast", "clean"],
  requires: ["focus", "practice", "patience", "speed"],
  technology: ["advances", "evolves", "simplifies"],
  software: ["powers", "connects", "automates"],
  websites: ["load", "render", "interact"],
  interfaces: ["respond", "adapt", "shine"],
  algorithms: ["analyze", "generate", "predict"],
  bots: ["assist", "generate", "learn"],
  solutions: ["emerge", "work", "scale"],
  models: ["train", "predict", "generate"],
  typing: ["speed", "rhythm", "accuracy", "fluency"],
  progress: ["happens", "continues", "builds"],
  learning: ["never", "always", "rapidly"],
  thinking: ["clearly", "fast", "ahead"],
  // Fallback connectors to keep sentences flowing infinitely
  default: ["and", "while", "as", "with", "through", "into", "for", "that", "which", "to"]
};

let currentText = "";
let charIndex = 0;
let correctChars = 0;
let totalTyped = 0;
let startTime = null;
let timerInterval = null;
let lastGeneratedWord = "";

// Generate a chunk of AI words based on the previous word
function generateAIChunk(wordCount = 15) {
  aiStatus.textContent = "AI Stream: Generating...";
  let words = [];

  for (let i = 0; i < wordCount; i++) {
    let nextOptions;
    if (!lastGeneratedWord || !aiVocabulary[lastGeneratedWord]) {
      nextOptions = i === 0 && !lastGeneratedWord ? aiVocabulary.start : aiVocabulary.default;
    } else {
      nextOptions = aiVocabulary[lastGeneratedWord];
    }

    // Pick a random next word from the Markov state
    let nextWord = nextOptions[Math.floor(Math.random() * nextOptions.length)];
    
    // If we used a connector word, pick a fresh starting noun/adjective next
    if (aiVocabulary.default.includes(nextWord)) {
      lastGeneratedWord = "";
    } else {
      lastGeneratedWord = nextWord;
    }

    words.push(nextWord);
  }

  setTimeout(() => {
    aiStatus.textContent = "AI Stream: Active";
  }, 300);

  return words.join(" ");
}

// Append new words to the DOM without disrupting already-typed characters
function appendText(newText) {
  const prefix = currentText.length > 0 ? " " : "";
  const fullAddition = prefix + newText;
  currentText += fullAddition;

  fullAddition.split("").forEach((char) => {
    const span = document.createElement("span");
    span.innerText = char;
    span.classList.add("char");
    textDisplay.appendChild(span);
  });

  updateCursor();
}

function updateCursor() {
  const chars = textDisplay.querySelectorAll(".char");
  chars.forEach((c) => c.classList.remove("current"));
  if (chars[charIndex]) {
    chars[charIndex].classList.add("current");
  }
}

function updateStats() {
  if (!startTime) return;

  const elapsedMinutes = (Date.now() - startTime) / 60000;
  // Standard WPM calculation: (correct characters / 5) / elapsed minutes
  const wpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const wordsTyped = Math.floor(correctChars / 5);

  wpmDisplay.innerText = wpm;
  accuracyDisplay.innerText = `${accuracy}%`;
  wordCountDisplay.innerText = wordsTyped;
}

function initTest() {
  clearInterval(timerInterval);
  textDisplay.innerHTML = "";
  currentText = "";
  charIndex = 0;
  correctChars = 0;
  totalTyped = 0;
  startTime = null;
  lastGeneratedWord = "";

  wpmDisplay.innerText = "0";
  accuracyDisplay.innerText = "100%";
  wordCountDisplay.innerText = "0";
  aiStatus.textContent = "AI Stream: Ready";

  // Generate initial batch of 25 words
  appendText(generateAIChunk(25));
}

// Handle typing input
typingArea.addEventListener("keydown", (e) => {
  // Ignore modifier keys
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1 && e.key !== "Backspace") return;

  e.preventDefault();

  // Start timer on first valid keystroke
  if (!startTime && e.key !== "Backspace") {
    startTime = Date.now();
    timerInterval = setInterval(updateStats, 500);
  }

  const chars = textDisplay.querySelectorAll(".char");

  if (e.key === "Backspace") {
    if (charIndex > 0) {
      charIndex--;
      if (chars[charIndex].classList.contains("correct")) {
        correctChars--;
      }
      chars[charIndex].classList.remove("correct", "incorrect");
    }
  } else {
    const targetChar = currentText[charIndex];
    totalTyped++;

    if (e.key === targetChar) {
      chars[charIndex].classList.add("correct");
      correctChars++;
    } else {
      chars[charIndex].classList.add("incorrect");
    }
    charIndex++;

    // Keep text scrolled cleanly by removing old lines once user is far ahead
    if (charIndex > 120) {
      const removeCount = 60;
      for (let i = 0; i < removeCount; i++) {
        if (textDisplay.firstChild) {
          textDisplay.removeChild(textDisplay.firstChild);
        }
      }
      currentText = currentText.slice(removeCount);
      charIndex -= removeCount;
    }

    // Trigger AI to generate more words when within 45 characters of the end
    if (currentText.length - charIndex < 45) {
      appendText(generateAIChunk(15));
    }
  }

  updateCursor();
  updateStats();
});

restartBtn.addEventListener("click", () => {
  initTest();
  typingArea.focus();
});

// Start on page load
initTest();
