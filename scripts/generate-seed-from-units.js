const fs = require("fs");

const seedPath = "E:/Web_IELTS/prisma/seed.ts";
const jsonPath = "E:/Web_IELTS/app/grammar/grammar-units.json";

const units = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
let seed = fs.readFileSync(seedPath, "utf8");

const typeMap = {
  multiple_choice: { prisma: "MULTIPLE_CHOICE", ai: false },
  fill_in_blank: { prisma: "FILL_IN_BLANK", ai: false },
  error_correction: { prisma: "ERROR_CORRECTION", ai: true },
  rewrite_sentence: { prisma: "REWRITE_SENTENCE", ai: true },
  register_shift: { prisma: "REGISTER_SHIFT", ai: true },
  sentence_combining: { prisma: "SENTENCE_COMBINING", ai: true },
};

const escTpl = (s) =>
  String(s ?? "")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

const escDq = (s) =>
  String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

const constName = (id) => id.toUpperCase().replace(/-/g, "_");

function buildTheory(u, base) {
  const gf = u.theory?.grammarForSpeaking || {};
  const examples = Array.isArray(u.theory?.quickExamples)
    ? u.theory.quickExamples
    : [];
  const exBlock = examples
    .map((ex, i) => `${i + 1}. ${ex.en}\n   - ${ex.vi}`)
    .join("\n");
  return `const ${base}_THEORY = \`${escTpl(
    u.theory?.coreRule || "",
  )}\n\nSai: ${escTpl(gf.wrong || "")}\nDung: ${escTpl(
    gf.correct || "",
  )}\nMeo: ${escTpl(gf.tipVi || "")}\nBand impact: ${escTpl(
    gf.bandImpact || "",
  )}\n\nVi du nhanh:\n${escTpl(exBlock)}\`;`;
}

function buildMistakes(u, base) {
  const mistakes = Array.isArray(u.theory?.commonMistakes)
    ? u.theory.commonMistakes
    : [];
  const block = mistakes
    .map(
      (m) => `\u274c ${m.incorrect} -> \u2705 ${m.correct}\n${m.explanationVi}`,
    )
    .join("\n\n");
  return `const ${base}_MISTAKES = \`${escTpl(block)}\`;`;
}

function buildUsage(u, base) {
  const writing = u.theory?.goalBlock?.writing || "";
  const speaking = u.theory?.goalBlock?.speaking || "";
  return [
    `const ${base}_USAGE_TASK2 = \`${escTpl(writing)}\`;`,
    `const ${base}_USAGE_SPOKEN = \`${escTpl(speaking)}\`;`,
  ].join("\n");
}

const constantsBlock = units
  .map((u) => {
    const base = constName(u.id);
    return [
      buildTheory(u, base),
      buildMistakes(u, base),
      buildUsage(u, base),
    ].join("\n\n");
  })
  .join("\n\n");

const generatedConstants = [
  "// -- Auto-generated unit constants (from app/grammar/grammar-units.json) ---",
  "// AUTO_GENERATED_UNIT_CONSTANTS_START",
  constantsBlock,
  "// AUTO_GENERATED_UNIT_CONSTANTS_END",
  "",
].join("\n");

const lessonBlocks = units
  .map((u, idx) => {
    const n = idx + 2;
    const base = constName(u.id);
    const lessonVar = `lesson${n}`;
    const lessonId = `lesson-${u.id}`;
    const order = n;

    const items = (u.exercises?.items || [])
      .map((ex) => {
        const map = typeMap[ex.type] || {
          prisma: "MULTIPLE_CHOICE",
          ai: false,
        };
        const optionsExpr = Array.isArray(ex.options)
          ? `[${ex.options.map((o) => `\`${escTpl(o)}\``).join(", ")}]`
          : "Prisma.JsonNull";

        return `      {\n        lessonId: ${lessonVar}.id,\n        type: \"${map.prisma}\",\n        prompt: \`${escTpl(
          ex.question || "",
        )}\`,\n        options: ${optionsExpr},\n        answer: \`${escTpl(
          ex.correctAnswer || "",
        )}\`,\n        solution: \`${escTpl(
          ex.feedbackCorrect || "",
        )}\`,\n        useAiGrading: ${map.ai ? "true" : "false"},\n      }`;
      })
      .join(",\n");

    return `  // Lesson ${order} - ${u.title}\n  const ${lessonVar} = await prisma.grammarLesson.upsert({\n    where: { id: \"${lessonId}\" },\n    update: {\n      theoryMd: ${base}_THEORY,\n      commonMistakes: ${base}_MISTAKES,\n      usageNoteTask2: ${base}_USAGE_TASK2,\n      usageNoteSpoken: ${base}_USAGE_SPOKEN,\n      isPublished: true,\n    },\n    create: {\n      id: \"${lessonId}\",\n      chapterId: chapter2.id,\n      title: \"${escDq(u.title || "")}\",\n      summary: \"${escDq(
      u.subtitle || "",
    )}\",\n      content: \"${escDq(u.title || "")}\",\n      theoryMd: ${base}_THEORY,\n      commonMistakes: ${base}_MISTAKES,\n      usageNoteTask2: ${base}_USAGE_TASK2,\n      usageNoteSpoken: ${base}_USAGE_SPOKEN,\n      ieltsWritingTags: [\`${escTpl(
      u.theory?.goalBlock?.writing || "",
    )}\`],\n      ieltsSpeakingTags: [\`${escTpl(
      u.theory?.goalBlock?.speaking || "",
    )}\`],\n      isPublished: true,\n      order: ${order},\n    },\n  });\n  console.log(\`\u2705 Seeded lesson: \$\{${lessonVar}.title\} (\$\{${lessonVar}.id\})\`);\n\n  await prisma.grammarExercise.deleteMany({ where: { lessonId: ${lessonVar}.id } });\n  await prisma.grammarExercise.createMany({\n    data: [\n${items}\n    ],\n  });\n  console.log(\`\u2705 Seeded exercises for ${lessonVar}: ${escTpl(
      u.title || "",
    )}\`);`;
  })
  .join("\n\n");

const generatedLessons = [
  "  // -- Auto-generated lessons/exercises (from app/grammar/grammar-units.json) -",
  "  // AUTO_GENERATED_LESSONS_START",
  lessonBlocks,
  "  // AUTO_GENERATED_LESSONS_END",
].join("\n");

if (seed.includes("// AUTO_GENERATED_UNIT_CONSTANTS_START")) {
  seed = seed.replace(
    /\/\/ AUTO_GENERATED_UNIT_CONSTANTS_START[\s\S]*?\/\/ AUTO_GENERATED_UNIT_CONSTANTS_END\n?/m,
    `${generatedConstants.trimEnd()}\n`,
  );
} else {
  seed = seed.replace(
    "const prisma = new PrismaClient();\n\nasync function main() {",
    `const prisma = new PrismaClient();\n\n${generatedConstants}async function main() {`,
  );
}

if (seed.includes("// AUTO_GENERATED_LESSONS_START")) {
  seed = seed.replace(
    /  \/\/ AUTO_GENERATED_LESSONS_START[\s\S]*?  \/\/ AUTO_GENERATED_LESSONS_END/m,
    generatedLessons,
  );
} else {
  seed = seed.replace(
    /\n  \/\/ ── Lesson 2:[\s\S]*?\n}\n\n\/\/ ── Content constants/m,
    `\n${generatedLessons}\n}\n\n// ── Content constants`,
  );
}

seed = seed.replace(
  /\nconst THI_HIEN_TAI_TIEP_DIEN_THEORY =[\s\S]*?const THI_HIEN_TAI_TIEP_DIEN_COLLOCATIONS = \[[\s\S]*?\];\n?/m,
  "\n",
);

fs.writeFileSync(seedPath, seed, "utf8");
console.log(`Generated ${units.length} units into seed.ts`);
