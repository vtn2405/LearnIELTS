/**
 * scripts/update-lesson.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cập nhật lesson "Thì Hiện tại đơn" (ID: lesson-present-simple-01) với
 * nội dung đầy đủ được viết lại theo văn phong IELTS học thuật.
 *
 * Chạy: npx ts-node scripts/update-lesson.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ── Constants ────────────────────────────────────────────────────────────────

const LESSON_ID = "lesson-present-simple-01";

// ── 1. Lý thuyết Markdown ─────────────────────────────────────────────────────
const THEORY_MD = `# Thì Hiện tại đơn (Present Simple)

## Bản chất
Thì Hiện tại đơn là thì **nền tảng** trong tiếng Anh, mô tả những gì mang tính **khuôn mẫu, ổn định, không thay đổi** theo thời gian — đúng ở quá khứ, hiện tại và có khả năng vẫn đúng trong tương lai.

---

## Cấu trúc (Structure)

| Loại câu | Công thức |
|----------|-----------|
| **Khẳng định** | S + V(s/es) + O |
| **Phủ định** | S + do/does + not + V\\_inf + O |
| **Nghi vấn** | Do/Does + S + V\\_inf + O? |

**Quy tắc thêm -s/-es (ngôi 3 số ít: He/She/It):**
- Thêm **-s** thông thường: work → works, play → plays
- Thêm **-es** sau ch, sh, x, s, z, o: watch → watches, go → goes
- Đổi **y → ies** (âm phụ + y): study → studies, fly → flies

---

## 4 Cách dùng cốt lõi

### 1. Sự thật hiển nhiên / Chân lý khoa học (General Truths)
> *The sun rises in the east.*
> *Gravity pulls objects towards the Earth at 9.8 m/s².*

### 2. Thói quen & Hành động lặp đi lặp lại (Habits/Routines)
Đi kèm trạng từ tần suất: always, usually, often, sometimes, rarely, never.
> *She always commutes to work by bicycle.*
> *I rarely eat fast food.*

### 3. Lịch trình & Thời gian biểu cố định (Schedules/Timetables)
Dù hành động xảy ra trong tương lai, nếu đã được cố định trên hệ thống thì vẫn dùng Hiện tại đơn.
> *The train departs at 07:45 tomorrow morning.*
> *The conference kicks off on Monday.*

### 4. Trạng thái & Nhận thức (States/Feelings)
Dùng với các **stative verbs** (động từ chỉ trạng thái — không dùng tiếp diễn):
know, believe, understand, think, love, hate, prefer, belong, consist, contain, mean, seem.
> *I strongly believe that education is a fundamental right.*
> *This device consists of three separate components.*`;

// ── 2. Lỗi người Việt hay mắc ────────────────────────────────────────────────
const COMMON_MISTAKES = `## Lỗi phổ biến của học viên người Việt

### Lỗi 1 — Quên thêm -s/-es với ngôi 3 số ít
❌ He *work* hard every day.
✅ He **works** hard every day.
💡 Mẹo: Mỗi khi thấy chủ ngữ He/She/It, hãy tự nhắc bản thân "chủ ngữ số ít → động từ thêm đuôi".

### Lỗi 2 — Ghép "am/is/are" với động từ thường (tư duy dịch word-by-word)
❌ I *am agree* with your point.
✅ I **agree** with your point.
💡 Lý do: "I agree" đã đủ nghĩa, "am" chỉ đi với tính từ hoặc danh từ vị ngữ.

### Lỗi 3 — Dùng "don't" thay cho "doesn't" với ngôi 3 số ít
❌ She *don't* understand the question.
✅ She **doesn't** understand the question.

### Lỗi 4 — Quên đổi y → ies
❌ The company *studys* consumer behaviour.
✅ The company **studies** consumer behaviour.

### Lỗi 5 — Dùng tiếp diễn hoặc quá khứ thay cho hiện tại đơn khi diễn đạt sự thật
❌ Water *was boiling* at 100°C.
✅ Water **boils** at 100°C.`;

// ── 3. Khi nào dùng trong Writing Task 2 ─────────────────────────────────────
const USAGE_NOTE_TASK2 = `## Thì Hiện tại đơn trong Writing Task 2

Đây là thì **chủ đạo** cho toàn bộ bài Task 2, xuất hiện trong khoảng **70–80% số động từ**. Cụ thể:

### ① Câu mở bài — nêu quan điểm / lập trường
> *"This essay argues that technological advancement, while beneficial, poses serious risks to employment stability."*

### ② Thân bài — đưa ra luận điểm & dẫn chứng chung
> *"Numerous studies demonstrate that children who attend pre-school education perform significantly better academically."*
> *"Urban migration creates considerable pressure on existing housing infrastructure."*

### ③ Câu mở rộng — diễn đạt xu hướng xã hội hiện tại
> *"An increasing number of employers now prioritise emotional intelligence over technical skills."*

### ④ Câu kết bài
> *"In conclusion, it remains evident that a balanced approach is necessary to address this complex issue."*

⚡ **Mẹo Band 7+:** Kết hợp Hiện tại đơn với trạng từ học thuật như *increasingly*, *consistently*, *inevitably*, *arguably* để tăng tính thuyết phục và nâng điểm Grammatical Accuracy.`;

// ── 4. Khi nào dùng trong văn nói ───────────────────────────────────────────
const USAGE_NOTE_SPOKEN = `## Thì Hiện tại đơn trong IELTS Speaking

### Speaking Part 1 — Mô tả thói quen, sở thích cá nhân
Đây là phần bạn dùng Hiện tại đơn nhiều nhất (gần 90% câu trả lời).
> *"I tend to spend my evenings reading, though I occasionally go out with friends."*

### Speaking Part 2 — Mô tả người/địa điểm có tính chất ổn định
> *"My hometown lies in the central highlands, and it absolutely captivates visitors with its scenic landscapes."*

### Speaking Part 3 — Phân tích, đánh giá theo quan điểm chung
> *"Most people nowadays rely heavily on digital devices, which fundamentally changes the way they process information."*

---

⚠️ **Lưu ý quan trọng:** Giám khảo đánh giá **Grammar Range** — đừng chỉ dùng mỗi Hiện tại đơn. Hãy phối hợp với:
- **Present Perfect** khi nói về kinh nghiệm: *"I have visited..."*
- **Past Simple** khi kể chuyện: *"When I was a child, I used to..."*
- **Future forms** khi đưa ra dự đoán: *"I think it will become..."*`;

// ── 5. Ví dụ học thuật ───────────────────────────────────────────────────────
const EXAMPLE_ACADEMIC = `Research consistently demonstrates that early intervention in childhood education significantly improves long-term academic achievement and broadens future career prospects. As a direct consequence, many governments now channel substantial funding into early-years programmes, recognising the crucial role these initiatives play in narrowing socioeconomic disparities.`;

// ── 6. Ví dụ văn nói ────────────────────────────────────────────────────────
const EXAMPLE_SPOKEN = `To be honest, I am quite a night owl by nature. More often than not, I stay up exceptionally late binge-watching my favourite detective series, and then I struggle to drag myself out of bed the following morning — which, admittedly, does not do my productivity any favours.`;

// ── 7. Cấu trúc văn nói ─────────────────────────────────────────────────────
const SPEAKING_STRUCTURES = [
  "I tend to + V... (Thay vì 'I usually + V', nghe học thuật và tự nhiên hơn)",
  "More often than not, I + V... (= 'Hầu như luôn luôn tôi...')",
  "As a rule, I + V... (= 'Như một lệ thường, tôi...' — cấu trúc Band 7+)",
  "I am inclined to + V... (= 'Tôi có xu hướng...' — trang trọng hơn 'I like to')",
  "It strikes me that + clause... (= 'Tôi nhận thấy rằng...' — dùng khi phân tích Part 3)",
];

// ── 8. Collocations ─────────────────────────────────────────────────────────
const COLLOCATIONS = [
  "lead a sedentary lifestyle (theo đuổi lối sống ít vận động)",
  "form a daily routine (xây dựng thói quen hàng ngày)",
  "break a bad habit (từ bỏ thói quen xấu)",
  "take something for granted (coi điều gì đó là đương nhiên, hiển nhiên)",
  "have an adverse impact on (gây tác động tiêu cực lên...)",
  "play a pivotal role in (đóng vai trò then chốt trong...)",
  "pose a significant threat to (đặt ra mối đe dọa đáng kể cho...)",
  "strongly believe / widely acknowledge (tin tưởng mạnh mẽ / được thừa nhận rộng rãi)",
];

// ── 9. 3 bài tập mới ─────────────────────────────────────────────────────────
const NEW_EXERCISES: {
  type:
    | "REGISTER_SHIFT"
    | "SENTENCE_COMBINING"
    | "SPEAKING_DRILL"
    | "MULTIPLE_CHOICE"
    | "FILL_IN_BLANK"
    | "REWRITE_SENTENCE"
    | "ERROR_CORRECTION";
  prompt: string;
  options: string[] | null;
  answer: string;
  solution: string;
  useAiGrading: boolean;
}[] = [
  // Exercise A: REGISTER_SHIFT
  {
    type: "REGISTER_SHIFT",
    prompt:
      'Viết lại câu informal sau thành văn phong học thuật (formal Academic Writing Task 2), giữ nguyên thì Hiện tại đơn và nghĩa gốc:\n\n"Lots of kids nowadays eat too much junk food, so they get super fat."',
    options: null,
    answer:
      "Nowadays, an increasing number of children consume excessive amounts of highly processed food, which directly contributes to a rising prevalence of childhood obesity.",
    solution:
      "Chuyển đổi: 'lots of kids' → 'an increasing number of children' (formal); 'junk food' → 'highly processed food'; 'get super fat' → 'contributes to a rising prevalence of childhood obesity'. Thì hiện tại đơn được giữ nguyên: consume, contributes. Tránh các từ thông tục như 'really', 'a lot', 'super'.",
    useAiGrading: true,
  },
  // Exercise B: SENTENCE_COMBINING
  {
    type: "SENTENCE_COMBINING",
    prompt:
      "Sử dụng Thì Hiện tại đơn và các từ nối nhân-quả, ghép 3 thông tin sau thành MỘT câu phức học thuật hoàn chỉnh:\n\n1. Deforestation reduces the number of trees.\n2. It destroys natural animal habitats.\n3. It drives global temperatures higher.",
    options: null,
    answer:
      "Deforestation not only reduces the number of trees and destroys natural animal habitats, but it also drives global temperatures to rise at an alarming rate.",
    solution:
      "Dùng cấu trúc 'not only...but also' để diễn đạt 3 hệ quả liên tiếp. Thì Hiện tại đơn xuyên suốt: reduces / destroys / drives. Trạng ngữ 'at an alarming rate' tăng tính học thuật. Câu trả lời khác được chấp nhận nếu sử dụng đúng thì và liên kết logic.",
    useAiGrading: true,
  },
  // Exercise C: SPEAKING_DRILL
  {
    type: "SPEAKING_DRILL",
    prompt:
      'Trả lời câu hỏi Speaking Part 1 sau đây bằng 2–3 câu, có sử dụng ít nhất MỘT trong các cấu trúc sau:\n• "More often than not, I..."\n• "I tend to..."\n• "As a rule, I..."\n\n❓ Câu hỏi: "What do you usually do to relax after a long day?"',
    options: null,
    answer:
      "More often than not, I put on some soothing music and curl up with a good book to unwind before bed. I tend to avoid screens in the evening, as I find that they actually make it harder for me to switch off mentally.",
    solution:
      "Câu trả lời mẫu dùng 'More often than not' và 'I tend to' — cả hai đều ở Hiện tại đơn (put, curl up, avoid, find, make). Lưu ý: 'curl up with a book' là idiom tự nhiên cho điểm Lexical Resource. Câu trả lời của bạn được chấp nhận nếu: (1) dùng ít nhất 1 cấu trúc được yêu cầu, (2) toàn bộ ở thì Hiện tại đơn, (3) logically coherent.",
    useAiGrading: true,
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting lesson update...\n");

  // 1. Verify lesson exists
  const lesson = await prisma.grammarLesson.findUnique({
    where: { id: LESSON_ID },
    select: { id: true, title: true },
  });

  if (!lesson) {
    throw new Error(
      `❌ Lesson "${LESSON_ID}" not found in database. Run: npx ts-node prisma/seed.ts first.`
    );
  }

  console.log(`📚 Found lesson: "${lesson.title}" (${lesson.id})`);

  // 2. Update all content fields
  const updated = await prisma.grammarLesson.update({
    where: { id: LESSON_ID },
    data: {
      theoryMd: THEORY_MD,
      commonMistakes: COMMON_MISTAKES,
      usageNoteTask2: USAGE_NOTE_TASK2,
      usageNoteSpoken: USAGE_NOTE_SPOKEN,
      exampleAcademic: EXAMPLE_ACADEMIC,
      exampleSpoken: EXAMPLE_SPOKEN,
      speakingStructures: SPEAKING_STRUCTURES,
      collocations: COLLOCATIONS,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      theoryMd: true,
      commonMistakes: true,
      usageNoteTask2: true,
      usageNoteSpoken: true,
      exampleAcademic: true,
      exampleSpoken: true,
      speakingStructures: true,
      collocations: true,
      updatedAt: true,
    },
  });

  console.log(`✅ Updated lesson fields:`);
  console.log(`   • theoryMd:          ${updated.theoryMd?.length ?? 0} chars`);
  console.log(`   • commonMistakes:    ${updated.commonMistakes?.length ?? 0} chars`);
  console.log(`   • usageNoteTask2:    ${updated.usageNoteTask2?.length ?? 0} chars`);
  console.log(`   • usageNoteSpoken:   ${updated.usageNoteSpoken?.length ?? 0} chars`);
  console.log(`   • exampleAcademic:   ${updated.exampleAcademic?.length ?? 0} chars`);
  console.log(`   • exampleSpoken:     ${updated.exampleSpoken?.length ?? 0} chars`);
  console.log(`   • speakingStructures: ${updated.speakingStructures.length} items`);
  console.log(`   • collocations:      ${updated.collocations.length} items`);
  console.log(`   • updatedAt:         ${updated.updatedAt.toISOString()}\n`);

  // 3. Add 3 new exercises (append — không xóa bài cũ)
  console.log("📝 Adding 3 new exercises (REGISTER_SHIFT, SENTENCE_COMBINING, SPEAKING_DRILL)...");

  const createdExercises = await Promise.all(
    NEW_EXERCISES.map((ex) =>
      prisma.grammarExercise.create({
        data: {
          lessonId: LESSON_ID,
          type: ex.type,
          prompt: ex.prompt,
          options: ex.options ? ex.options : Prisma.JsonNull,
          answer: ex.answer,
          solution: ex.solution,
          useAiGrading: ex.useAiGrading,
        },
        select: { id: true, type: true },
      })
    )
  );

  createdExercises.forEach((ex: { id: string; type: string }, i: number) => {
    console.log(`   ✅ Exercise ${i + 1}: ${ex.type} (${ex.id})`);
  });

  // 4. Summary
  const totalExercises = await prisma.grammarExercise.count({
    where: { lessonId: LESSON_ID },
  });

  console.log(`\n🎉 Done! Lesson "${updated.title}" now has ${totalExercises} exercises total.`);
  console.log(`\n💡 Next step: npx prisma studio`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("\n❌ Error:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
