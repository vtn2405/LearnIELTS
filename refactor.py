import os

game_path = r"e:\Web_IELTS\components\exercises\SpeedDrillGame.tsx"
mod_path = r"e:\Web_IELTS\components\exercises\SpeedDrillModule.tsx"
end_path = r"e:\Web_IELTS\components\exercises\SpeedDrillEndScreen.tsx"

# hooks/useSpeedDrillShell.ts
os.makedirs(r"e:\Web_IELTS\hooks", exist_ok=True)
with open(r"e:\Web_IELTS\hooks\useSpeedDrillShell.ts", "w", encoding="utf-8") as f:
    f.write("""import { useEffect } from "react";\n\nexport default function useSpeedDrillShell() {\n  useEffect(() => {\n    document.body.classList.add("speed-drill-fullscreen");\n    const id = "sd-hide-shell";\n    if (!document.getElementById(id)) {\n      const style = document.createElement("style");\n      style.id = id;\n      style.textContent = `\n        body.speed-drill-fullscreen header { display: none !important; }\n        body.speed-drill-fullscreen aside { display: none !important; }\n        body.speed-drill-fullscreen main { height: 100vh !important; }\n      `;\n      document.head.appendChild(style);\n    }\n    return () => { document.body.classList.remove("speed-drill-fullscreen"); };\n  }, []);\n}\n""")

# utils/animation.ts
os.makedirs(r"e:\Web_IELTS\utils", exist_ok=True)
with open(r"e:\Web_IELTS\utils\animation.ts", "w", encoding="utf-8") as f:
    f.write("""export const EASE_STANDARD = "cubic-bezier(0.4, 0, 0.2, 1)";\nexport const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";\n""")

# constants/speedDrillTheme.ts
os.makedirs(r"e:\Web_IELTS\constants", exist_ok=True)
with open(r"e:\Web_IELTS\constants\speedDrillTheme.ts", "w", encoding="utf-8") as f:
    f.write("""export const SD = {\n  bg: "#09090b",\n  surface: "#18181b",\n  surfaceAlt: "#1e293b",\n  border: "#27272a",\n  borderAlt: "#334155",\n  correct: "#10b981",\n  wrong: "#ef4444",\n  timer: "#f59e0b",\n  textPrimary: "#f8fafc",\n  textSecondary: "#94a3b8",\n  textMuted: "#64748b",\n} as const;\n""")

# SpeedDrillGame.tsx
with open(game_path, "r", encoding="utf-8") as f:
    game = f.read()

game = game.replace("""// Inject / remove a body class that hides the AppShell sidebar + topnav\nfunction useHideShell() {\n  useEffect(() => {\n    document.body.classList.add("speed-drill-fullscreen");\n    // Inject CSS once\n    const id = "sd-hide-shell";\n    if (!document.getElementById(id)) {\n      const style = document.createElement("style");\n      style.id = id;\n      style.textContent = `\n        body.speed-drill-fullscreen header { display: none !important; }\n        body.speed-drill-fullscreen aside { display: none !important; }\n        body.speed-drill-fullscreen main { height: 100vh !important; }\n      `;\n      document.head.appendChild(style);\n    }\n    return () => { document.body.classList.remove("speed-drill-fullscreen"); };\n  }, []);\n}\n\n""", "")

game = game.replace("  useHideShell();\n", "")

game = game.replace(
    'import { useState, useEffect, useRef, useCallback } from "react";',
    'import { useState, useEffect, useRef, useCallback } from "react";\nimport { SD } from "../../constants/speedDrillTheme";\nimport { EASE_STANDARD, EASE_SPRING } from "../../utils/animation";'
)

game = game.replace(
    'const timerSeconds = levelRule.timer_seconds;\n  const totalQ = items.length;',
    'const timerSeconds = levelRule.timer_seconds;\n  const totalQ = items.length;\n\n  const [hoveredOption, setHoveredOption] = useState<number | null>(null);'
)

game = game.replace(
"""                onClick={() => state.phase === "question" && handleAnswer(i)}\n                disabled={state.phase === "feedback"}""",
"""                onClick={() => state.phase === "question" && handleAnswer(i)}\n                onMouseEnter={() => state.phase === "question" && setHoveredOption(i)}\n                onMouseLeave={() => setHoveredOption(null)}\n                disabled={state.phase === "feedback"}"""
)

game = game.replace(
"""            if (state.phase === "feedback") {\n              if (i === state.chosenIndex) {\n                 transform = "scale(1.05)";\n                 zIndex = 10;\n              }\n              if (i !== item.correct_index && i !== state.chosenIndex) {\n                 opacity = 0.4;\n              }\n              if (state.chosenIndex !== -1 && i === item.correct_index && i !== state.chosenIndex) {\n                 transform = "scale(1.05)";\n                 zIndex = 10;\n              }\n            }""",
"""            if (state.phase === "feedback") {\n              if (i === item.correct_index) {\n                boxShadow = "0 0 20px #10b98140, 0 4px 16px #10b98120";\n              } else if (i === state.chosenIndex) {\n                boxShadow = "0 0 20px #ef444440, 0 4px 16px #ef444420";\n              }\n              if (i === state.chosenIndex) {\n                 transform = "scale(1.05)";\n                 zIndex = 10;\n              }\n              if (i !== item.correct_index && i !== state.chosenIndex) {\n                 opacity = 0.4;\n              }\n              if (state.chosenIndex !== -1 && i === item.correct_index && i !== state.chosenIndex) {\n                 transform = "scale(1.05)";\n                 zIndex = 10;\n              }\n            } else if (state.phase === "question" && hoveredOption === i) {\n               transform = "scale(1.03)";\n            }"""
)

game = game.replace('transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",', 'transition: `all 0.2s ${EASE_SPRING}`,')
game = game.replace('transition: "background 0.3s",', 'transition: `background 0.3s ${EASE_STANDARD}`,')
game = game.replace('fontFamily: "\'Inter\', sans-serif",', 'fontFamily: "var(--font-inter), Inter, sans-serif",')
game = game.replace('return () => window.removeEventListener("keydown", onKey);\n  });', 'return () => window.removeEventListener("keydown", onKey);\n  }, [state.phase, state.currentIndex, handleAnswer]);')

game = game.replace('background: "#09090b"', 'background: SD.bg')
game = game.replace('background: "#18181b"', 'background: SD.surface')
game = game.replace('background: "#1e293b"', 'background: SD.surfaceAlt')
game = game.replace('borderBottom: "1px solid #27272a"', 'borderBottom: `1px solid ${SD.border}`')
game = game.replace('border: "1px solid #27272a"', 'border: `1px solid ${SD.border}`')
game = game.replace('stroke="#334155"', 'stroke={SD.borderAlt}')
game = game.replace('? "#10b981" : pct > 0.25 ? "#f59e0b" : "#ef4444"', '? SD.correct : pct > 0.25 ? SD.timer : SD.wrong')
game = game.replace('? "#10b981" : "#ef4444"', '? SD.correct : SD.wrong')
game = game.replace('? "#f59e0b" : "#334155"', '? SD.timer : SD.borderAlt')
game = game.replace('border: `1px solid ${isCorrect ? "#10b981" : "#ef4444"}`', 'border: `1px solid ${isCorrect ? SD.correct : SD.wrong}`')
game = game.replace('borderLeft: "3px solid #ef4444"', 'borderLeft: `3px solid ${SD.wrong}`')
game = game.replace('borderLeft: "3px solid #f59e0b"', 'borderLeft: `3px solid ${SD.timer}`')
game = game.replace('color: "#f8fafc"', 'color: SD.textPrimary')
game = game.replace('color: "#94a3b8"', 'color: SD.textSecondary')
game = game.replace('color: "#64748b"', 'color: SD.textMuted')

with open(game_path, "w", encoding="utf-8") as f:
    f.write(game)

# SpeedDrillModule.tsx
with open(mod_path, "r", encoding="utf-8") as f:
    mod = f.read()

mod = mod.replace("""// Hide AppShell chrome while any Speed Drill view is shown\nfunction useHideShell() {\n  useEffect(() => {\n    document.body.classList.add("speed-drill-fullscreen");\n    // Inject CSS once\n    const id = "sd-hide-shell";\n    if (!document.getElementById(id)) {\n      const style = document.createElement("style");\n      style.id = id;\n      style.textContent = `\n        body.speed-drill-fullscreen header { display: none !important; }\n        body.speed-drill-fullscreen aside { display: none !important; }\n        body.speed-drill-fullscreen main { height: 100vh !important; }\n      `;\n      document.head.appendChild(style);\n    }\n    return () => { document.body.classList.remove("speed-drill-fullscreen"); };\n  }, []);\n}\n\n""", "")

mod = mod.replace(
    'import type { DrillItem, LevelRule, ScoreRule } from "./SpeedDrillGame";',
    'import type { DrillItem, LevelRule, ScoreRule } from "./SpeedDrillGame";\nimport useSpeedDrillShell from "../../hooks/useSpeedDrillShell";\nimport { SD } from "../../constants/speedDrillTheme";\nimport { EASE_STANDARD } from "../../utils/animation";'
)

mod = mod.replace("useHideShell();", "useSpeedDrillShell();")
mod = mod.replace('transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",', 'transition: `transform 0.2s ${EASE_STANDARD}, box-shadow 0.3s ${EASE_STANDARD}, background 0.3s ${EASE_STANDARD}, border-color 0.3s ${EASE_STANDARD}`,')
mod = mod.replace('fontFamily: "\'Inter\', sans-serif",', 'fontFamily: "var(--font-inter), Inter, sans-serif",')

mod = mod.replace('border: "4px solid #334155"', 'border: `4px solid ${SD.borderAlt}`')
mod = mod.replace('color: "#64748b"', 'color: SD.textMuted')
mod = mod.replace('color: "#94a3b8"', 'color: SD.textSecondary')
mod = mod.replace('border: `1px solid ${hovered && unlocked ? meta.borderColor : "#334155"}`', 'border: `1px solid ${hovered && unlocked ? meta.borderColor : SD.borderAlt}`')
mod = mod.replace('color: "#f59e0b"', 'color: SD.timer')
mod = mod.replace('border: "1px solid #334155"', 'border: `1px solid ${SD.borderAlt}`')

with open(mod_path, "w", encoding="utf-8") as f:
    f.write(mod)

# SpeedDrillEndScreen.tsx
with open(end_path, "r", encoding="utf-8") as f:
    end = f.read()

end = end.replace(
    'import type { DrillItem, LevelRule } from "./SpeedDrillGame";',
    'import type { DrillItem, LevelRule } from "./SpeedDrillGame";\nimport { SD } from "../../constants/speedDrillTheme";'
)

end = end.replace('fontFamily: "\'Inter\', sans-serif",', 'fontFamily: "var(--font-inter), Inter, sans-serif",')

end = end.replace('color: accuracy >= 70 ? "#10b981" : "#ef4444"', 'color: accuracy >= 70 ? SD.correct : SD.wrong')
end = end.replace('color: "#64748b"', 'color: SD.textMuted')
end = end.replace('border: `1px solid ${a.correct ? "#10b98130" : "#ef444430"}`', 'border: `1px solid ${a.correct ? `${SD.correct}30` : `${SD.wrong}30`}`')
end = end.replace('color: "#94a3b8"', 'color: SD.textSecondary')
end = end.replace('color: a.correct ? "#10b981" : "#ef4444"', 'color: a.correct ? SD.correct : SD.wrong')

with open(end_path, "w", encoding="utf-8") as f:
    f.write(end)

print("Done")
