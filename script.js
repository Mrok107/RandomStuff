const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const say = (id, text) => { $(id).textContent = text; };

/* ---------- Home ---------- */
const pressLines = ["Nice.", "Again?", "Wow, so brave.", "That did something. Probably.", "You pressed it.", "Cozy click.", "Okay okay, enough. (Never enough.)"];
let pressed = 0;
$("press-me").onclick = () => {
    pressed++;
    $("press-me").textContent = `${pick(pressLines)} (${pressed})`;
};

/* ---------- Button Room ---------- */
function confetti() {
    const bits = ["🎉", "✨", "🧡", "🍪", "⭐", "🧸"];
    for (let i = 0; i < 40; i++) {
        const s = document.createElement("span");
        s.className = "confetti";
        s.textContent = pick(bits);
        s.style.left = rand(0, 98) + "vw";
        s.style.animationDuration = (2 + Math.random() * 2) + "s";
        s.style.fontSize = (1 + Math.random()) + "rem";
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 4200);
    }
}
$("confetti-btn").onclick = confetti;

const facts = [
    "Octopuses have three hearts.",
    "Bananas are berries, but strawberries aren't.",
    "Wombat poop is cube-shaped.",
    "A day on Venus is longer than its year.",
    "Honey found in ancient tombs was still edible.",
    "Sea otters hold hands while they sleep.",
    "A group of flamingos is called a flamboyance."
];
$("fact-btn").onclick = () => say("fact-output", pick(facts));

$("color-btn").onclick = () => document.documentElement.style.setProperty("--hue", rand(0, 360));

let dodges = 0;
const runaway = $("runaway-btn");
function dodge() {
    if (dodges >= 8) return;
    dodges++;
    runaway.style.transform = `translate(${rand(-120, 120)}px, ${rand(-50, 50)}px)`;
    if (dodges === 8) { runaway.textContent = "Fine. Catch me."; }
}
runaway.addEventListener("pointerenter", dodge);
runaway.addEventListener("pointerdown", dodge);
runaway.onclick = () => {
    if (dodges >= 8) { runaway.textContent = "You caught me!"; runaway.style.transform = ""; confetti(); dodges = 0; setTimeout(() => (runaway.textContent = "Catch me"), 2000); }
};

/* ---------- Games ---------- */
// Click counter
let clicks = 0;
$("click-btn").onclick = () => say("click-count", ++clicks);

// Don't click
const nopes = ["...why?", "I said don't.", "Seriously?", "You have no self-control.", "Okay that's 5. Impressive.", "Fine. Click all you want.", "I'm not mad. Just disappointed."];
let nope = 0;
$("dont-click-btn").onclick = () => say("dont-click-output", nopes[Math.min(nope++, nopes.length - 1)]);

// Reaction test
let rState = "idle", rTimer, rStart;
$("reaction-btn").onclick = () => {
    const btn = $("reaction-btn");
    if (rState === "idle") {
        rState = "waiting";
        btn.textContent = "Wait for it...";
        say("reaction-output", "");
        rTimer = setTimeout(() => { rState = "go"; btn.textContent = "NOW!"; rStart = performance.now(); }, rand(1500, 3500));
    } else if (rState === "waiting") {
        clearTimeout(rTimer);
        rState = "idle";
        btn.textContent = "Start";
        say("reaction-output", "Too soon! Patience, friend.");
    } else {
        const ms = Math.round(performance.now() - rStart);
        rState = "idle";
        btn.textContent = "Start";
        say("reaction-output", `${ms} ms. ${ms < 250 ? "Speedy!" : ms < 400 ? "Pretty good." : "Cozy reflexes."}`);
    }
};

// Useless upgrades
let points = 0, upgradeIdx = 0;
const upgrades = [
    { name: "a tiny hat for your cursor", cost: 10 },
    { name: "a slightly bigger hat", cost: 25 },
    { name: "a very serious monocle", cost: 50 },
    { name: "nothing, but premium", cost: 100 }
];
const hat = document.createElement("div");
hat.id = "cursor-hat";
hat.hidden = true;
document.body.appendChild(hat);
document.addEventListener("pointermove", (e) => { hat.style.left = e.clientX + "px"; hat.style.top = e.clientY + "px"; });
function renderUpgrade() {
    const u = upgrades[upgradeIdx];
    $("upgrade-btn").textContent = u ? `Buy ${u.name} (${u.cost} pts)` : "Sold out of nonsense";
    say("points", points);
}
$("earn-btn").onclick = () => { points++; renderUpgrade(); };
$("upgrade-btn").onclick = () => {
    const u = upgrades[upgradeIdx];
    if (!u) return;
    if (points < u.cost) return say("upgrade-output", `Need ${u.cost - points} more points.`);
    points -= u.cost;
    say("upgrade-output", `You bought ${u.name}. Worth it.`);
    hat.hidden = false;
    hat.textContent = ["🎩", "👑", "🧐", "✨"][upgradeIdx];
    upgradeIdx++;
    renderUpgrade();
};
renderUpgrade();

// Guess the number
let secret = rand(1, 10);
$("guess-btn").onclick = () => {
    const g = Number($("guess-input").value);
    if (!g || g < 1 || g > 10) return say("guess-output", "Pick a number from 1 to 10.");
    if (g === secret) { say("guess-output", "Correct! New number picked."); secret = rand(1, 10); confetti(); }
    else say("guess-output", g < secret ? "Higher!" : "Lower!");
};

// Rock vs rock
const rpsText = { rock: "Tie. The rock is smug.", paper: "Paper beats rock. The rock respects it.", scissors: "Rock wins. Obviously." };
["rock", "paper", "scissors"].forEach((m) => { $(`rps-${m}-btn`).onclick = () => say("rps-output", rpsText[m]); });

// Hold the button
let holdStart = 0, longest = 0;
const holdBtn = $("hold-btn");
holdBtn.addEventListener("pointerdown", () => { holdStart = performance.now(); holdBtn.classList.add("held"); });
const endHold = () => {
    if (!holdStart) return;
    const t = (performance.now() - holdStart) / 1000;
    holdStart = 0;
    holdBtn.classList.remove("held");
    if (t > longest) { longest = t; say("hold-time", longest.toFixed(1)); }
};
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => holdBtn.addEventListener(ev, endHold));
holdBtn.addEventListener("contextmenu", (e) => e.preventDefault());

// Catch the dot
let dots = 0;
const dot = $("dot-btn");
function moveDot() {
    const area = $("dot-area");
    dot.style.left = rand(0, area.clientWidth - dot.offsetWidth) + "px";
    dot.style.top = rand(0, area.clientHeight - dot.offsetHeight) + "px";
}
dot.onclick = () => { say("dot-count", ++dots); moveDot(); };
setTimeout(moveDot, 50);

// Pet rock
const faces = ["( o_o )", "( ^_^ )", "( -_- )", "( o.o )", "( u_u )"];
const rockLines = ["The rock has no opinion.", "The rock tolerates this.", "The rock is rock-solid happy.", "Nothing changed. Everything changed."];
$("pet-btn").onclick = () => { say("rock-face", pick(faces)); say("rock-output", pick(rockLines)); };
$("feed-btn").onclick = () => { say("rock-face", "( o_O )"); say("rock-output", "The rock cannot eat. It appreciates the gesture."); };

// Fake loading bar
let loading = false;
$("load-btn").onclick = () => {
    if (loading) return;
    loading = true;
    const bar = $("load-progress");
    bar.value = 0;
    say("load-output", "Loading...");
    const id = setInterval(() => {
        bar.value += bar.value < 90 ? rand(3, 9) : 0.5;
        if (bar.value >= 99) {
            clearInterval(id);
            setTimeout(() => { bar.value = 100; say("load-output", "Loaded nothing. Enjoy!"); loading = false; }, 1500);
        }
    }, 150);
};

/* ---------- Stupid Stuff ---------- */
const eightBall = ["Yes, probably.", "Ask again after a snack.", "Absolutely not.", "The signs say maybe.", "Honestly? Nap first.", "Definitely, but at what cost?", "I'd rather not say.", "Bold of you to ask."];
$("8ball-btn").onclick = () => say("8ball-output", `🎱 ${pick(eightBall)}`);

const decisions = ["Eat cereal for dinner", "Text your ex (no)", "Buy a third houseplant", "Rearrange all the furniture", "Start a podcast", "Take a nap right now", "Adopt a rock", "Learn the accordion"];
let spinning = false;
$("wheel-btn").onclick = () => {
    if (spinning) return;
    spinning = true;
    let n = 0;
    const id = setInterval(() => {
        say("wheel-output", pick(decisions));
        if (++n > 14) { clearInterval(id); say("wheel-output", `🎡 ${$("wheel-output").textContent}!`); spinning = false; }
    }, 100);
};

$("dice-btn").onclick = () => say("dice-coin-output", `🎲 You rolled a ${rand(1, 6)}.`);
$("coin-btn").onclick = () => say("dice-coin-output", `🪙 ${Math.random() < 0.01 ? "It landed on its edge. Wow." : pick(["Heads.", "Tails."])}`);

const compliments = ["Your cursor movement is elite.", "You have excellent button-pressing energy.", "Somewhere, a houseplant is proud of you.", "You're the human equivalent of a warm blanket.", "Top-tier scrolling technique."];
$("compliment-btn").onclick = () => say("compliment-output", pick(compliments));

const excuseA = ["My cat", "A suspicious pigeon", "My sock drawer", "The wifi", "A very slow duck"];
const excuseB = ["unionized", "learned to drive", "filed a complaint", "ate my homework", "blocked the door"];
$("excuse-btn").onclick = () => say("excuse-output", `${pick(excuseA)} ${pick(excuseB)}.`);

$("complaint-btn").onclick = () => {
    if (!$("complaint-input").value.trim()) return say("complaint-output", "The void needs something to read.");
    $("complaint-input").value = "";
    say("complaint-output", pick(["Sent to the void. The void says thanks.", "Complaint received and immediately forgotten.", "Filed under 'Later (Never)'."]));
};

let nothing = 0;
$("nothing-btn").onclick = () => say("nothing-count", ++nothing);

$("vibe-btn").onclick = () => {
    const v = rand(0, 100);
    $("vibe-level").value = v;
    say("vibe-output", v > 80 ? "Immaculate vibes." : v > 50 ? "Solid, cozy vibes." : v > 25 ? "Needs tea." : "Emergency blanket required.");
};

/* ---------- Cozy Corner ---------- */
$("theme-btn").onclick = () => {
    const root = document.documentElement;
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
};

let rain = null;
$("rain-btn").onclick = () => {
    const btn = $("rain-btn");
    if (rain) { rain.stop(); rain = null; btn.textContent = "Rain sounds"; return; }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    rain = { stop: () => { src.stop(); ctx.close(); } };
    btn.textContent = "Stop the rain";
};

const quotes = ["Rest is productive too.", "Soft things are allowed to be strong.", "A warm drink fixes more than you'd think.", "You don't have to earn a break.", "Small joys count double.", "Be gentle with today."];
const quoteEl = $("comfort-quote");
quoteEl.textContent = quotes[new Date().getDate() % quotes.length];
quoteEl.title = "Click for another";
quoteEl.onclick = () => { quoteEl.textContent = pick(quotes); };