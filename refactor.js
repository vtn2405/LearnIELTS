const fs = require('fs');

const game_path = "e:\\Web_IELTS\\components\\exercises\\SpeedDrillGame.tsx";
const mod_path = "e:\\Web_IELTS\\components\\exercises\\SpeedDrillModule.tsx";
const end_path = "e:\\Web_IELTS\\components\\exercises\\SpeedDrillEndScreen.tsx";

// 1. SpeedDrillGame.tsx
let game = fs.readFileSync(game_path, "utf-8");

game = game.replace(`// Inject / remove a body class that hides the AppShell sidebar + topnav
function useHideShell() {
  useEffect(() => {
    document.body.classList.add("speed-drill-fullscreen");
    // Inject CSS once
    const id = "sd-hide-shell";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = \`
        body.speed-drill-fullscreen header { display: none !important; }
        body.speed-drill-fullscreen aside { display: none !important; }
        body.speed-drill-fullscreen main { height: 100vh !important; }
      \`;
      document.head.appendChild(style);
    }
    return () => { document.body.classList.remove("speed-drill-fullscreen"); };
  }, []);
}

`, "");

game = game.replace("  useHideShell();\n", "");

game = game.replace(
    'import { useState, useEffect, useRef, useCallback } from "react";',
    'import { useState, useEffect, useRef, useCallback } from "react";\nimport { SD } from "../../constants/speedDrillTheme";\nimport { EASE_STANDARD, EASE_SPRING } from "../../utils/animation";'
);

game = game.replace(
    'const timerSeconds = levelRule.timer_seconds;\n  const totalQ = items.length;',
    'const timerSeconds = levelRule.timer_seconds;\n  const totalQ = items.length;\n\n  const [hoveredOption, setHoveredOption] = useState<number | null>(null);'
);

game = game.replace(
`                onClick={() => state.phase === "question" && handleAnswer(i)}
                disabled={state.phase === "feedback"}`,
`                onClick={() => state.phase === "question" && handleAnswer(i)}
                onMouseEnter={() => state.phase === "question" && setHoveredOption(i)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={state.phase === "feedback"}`
);

game = game.replace(
`            if (state.phase === "feedback") {
              if (i === state.chosenIndex) {
                 transform = "scale(1.05)";
                 zIndex = 10;
              }
              if (i !== item.correct_index && i !== state.chosenIndex) {
                 opacity = 0.4;
              }
              if (state.chosenIndex !== -1 && i === item.correct_index && i !== state.chosenIndex) {
                 transform = "scale(1.05)";
                 zIndex = 10;
              }
            }`,
`            if (state.phase === "feedback") {
              if (i === item.correct_index) {
                boxShadow = "0 0 20px #10b98140, 0 4px 16px #10b98120";
              } else if (i === state.chosenIndex) {
                boxShadow = "0 0 20px #ef444440, 0 4px 16px #ef444420";
              }
              if (i === state.chosenIndex) {
                 transform = "scale(1.05)";
                 zIndex = 10;
              }
              if (i !== item.correct_index && i !== state.chosenIndex) {
                 opacity = 0.4;
              }
              if (state.chosenIndex !== -1 && i === item.correct_index && i !== state.chosenIndex) {
                 transform = "scale(1.05)";
                 zIndex = 10;
              }
            } else if (state.phase === "question" && hoveredOption === i) {
               transform = "scale(1.03)";
            }`
);

game = game.replace('transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",', 'transition: `all 0.2s ${EASE_SPRING}`,');
game = game.replace('transition: "background 0.3s",', 'transition: `background 0.3s ${EASE_STANDARD}`,');
game = game.replaceAll(`fontFamily: "'Inter', sans-serif"`, 'fontFamily: "var(--font-inter), Inter, sans-serif"');
game = game.replace('return () => window.removeEventListener("keydown", onKey);\n  });', 'return () => window.removeEventListener("keydown", onKey);\n  }, [state.phase, state.currentIndex, handleAnswer]);');

game = game.replaceAll('background: "#09090b"', 'background: SD.bg');
game = game.replaceAll('background: "#18181b"', 'background: SD.surface');
game = game.replaceAll('background: "#1e293b"', 'background: SD.surfaceAlt');
game = game.replaceAll('borderBottom: "1px solid #27272a"', 'borderBottom: `1px solid ${SD.border}`');
game = game.replaceAll('border: "1px solid #27272a"', 'border: `1px solid ${SD.border}`');
game = game.replaceAll('stroke="#334155"', 'stroke={SD.borderAlt}');
game = game.replaceAll('? "#10b981" : pct > 0.25 ? "#f59e0b" : "#ef4444"', '? SD.correct : pct > 0.25 ? SD.timer : SD.wrong');
game = game.replaceAll('? (state.answers[i]?.correct ? "#10b981" : "#ef4444")', '? (state.answers[i]?.correct ? SD.correct : SD.wrong)');
game = game.replaceAll('? "#f59e0b" : "#334155"', '? SD.timer : SD.borderAlt');
game = game.replaceAll('border: `1px solid ${isCorrect ? "#10b981" : "#ef4444"}`', 'border: `1px solid ${isCorrect ? SD.correct : SD.wrong}`');
game = game.replaceAll('background: isCorrect ? "#10b981" : "#ef4444"', 'background: isCorrect ? SD.correct : SD.wrong');
game = game.replaceAll('color: isCorrect ? "#6ee7b7" : "#fca5a5"', 'color: isCorrect ? "#6ee7b7" : "#fca5a5"'); // skip
game = game.replaceAll('borderLeft: "3px solid #ef4444"', 'borderLeft: `3px solid ${SD.wrong}`');
game = game.replaceAll('borderLeft: "3px solid #f59e0b"', 'borderLeft: `3px solid ${SD.timer}`');
game = game.replaceAll('color: "#f8fafc"', 'color: SD.textPrimary');
game = game.replaceAll('color: "#94a3b8"', 'color: SD.textSecondary');
game = game.replaceAll('color: "#64748b"', 'color: SD.textMuted');

fs.writeFileSync(game_path, game, "utf-8");

// 2. SpeedDrillModule.tsx
let mod = fs.readFileSync(mod_path, "utf-8");

mod = mod.replace(`// Hide AppShell chrome while any Speed Drill view is shown
function useHideShell() {
  useEffect(() => {
    document.body.classList.add("speed-drill-fullscreen");
    // Inject CSS once
    const id = "sd-hide-shell";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = \`
        body.speed-drill-fullscreen header { display: none !important; }
        body.speed-drill-fullscreen aside { display: none !important; }
        body.speed-drill-fullscreen main { height: 100vh !important; }
      \`;
      document.head.appendChild(style);
    }
    return () => { document.body.classList.remove("speed-drill-fullscreen"); };
  }, []);
}

`, "");

mod = mod.replace(
    'import type { DrillItem, LevelRule, ScoreRule } from "./SpeedDrillGame";',
    'import type { DrillItem, LevelRule, ScoreRule } from "./SpeedDrillGame";\nimport useSpeedDrillShell from "../../hooks/useSpeedDrillShell";\nimport { SD } from "../../constants/speedDrillTheme";\nimport { EASE_STANDARD } from "../../utils/animation";'
);

mod = mod.replace("useHideShell();", "useSpeedDrillShell();");
mod = mod.replace('transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",', 'transition: `transform 0.2s ${EASE_STANDARD}, box-shadow 0.3s ${EASE_STANDARD}, background 0.3s ${EASE_STANDARD}, border-color 0.3s ${EASE_STANDARD}`,');
mod = mod.replaceAll(`fontFamily: "'Inter', sans-serif"`, 'fontFamily: "var(--font-inter), Inter, sans-serif"');

mod = mod.replaceAll('border: "4px solid #334155"', 'border: `4px solid ${SD.borderAlt}`');
mod = mod.replaceAll('color: "#64748b"', 'color: SD.textMuted');
mod = mod.replaceAll('color: "#94a3b8"', 'color: SD.textSecondary');
mod = mod.replaceAll('border: `1px solid ${hovered && unlocked ? meta.borderColor : "#334155"}`', 'border: `1px solid ${hovered && unlocked ? meta.borderColor : SD.borderAlt}`');
mod = mod.replaceAll('color: "#f59e0b"', 'color: SD.timer');
mod = mod.replaceAll('border: "1px solid #334155"', 'border: `1px solid ${SD.borderAlt}`');
mod = mod.replaceAll('borderBottom: "1px solid #1e293b"', 'borderBottom: `1px solid ${SD.surfaceAlt}`');

fs.writeFileSync(mod_path, mod, "utf-8");

// 3. SpeedDrillEndScreen.tsx
let end = fs.readFileSync(end_path, "utf-8");

end = end.replace(
    'import type { DrillItem, LevelRule } from "./SpeedDrillGame";',
    'import type { DrillItem, LevelRule } from "./SpeedDrillGame";\nimport { SD } from "../../constants/speedDrillTheme";'
);

end = end.replaceAll(`fontFamily: "'Inter', sans-serif"`, 'fontFamily: "var(--font-inter), Inter, sans-serif"');

end = end.replaceAll('color: accuracy >= 70 ? "#10b981" : "#ef4444"', 'color: accuracy >= 70 ? SD.correct : SD.wrong');
end = end.replaceAll('color: "#64748b"', 'color: SD.textMuted');
end = end.replaceAll('border: `1px solid ${a.correct ? "#10b98130" : "#ef444430"}`', 'border: `1px solid ${a.correct ? `${SD.correct}30` : `${SD.wrong}30`}`');
end = end.replaceAll('color: "#94a3b8"', 'color: SD.textSecondary');
end = end.replaceAll('color: a.correct ? "#10b981" : "#ef4444"', 'color: a.correct ? SD.correct : SD.wrong');
end = end.replaceAll('borderBottom: "1px solid #334155"', 'borderBottom: `1px solid ${SD.borderAlt}`');

fs.writeFileSync(end_path, end, "utf-8");

console.log("Done refactoring");
