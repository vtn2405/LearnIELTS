# Project Context — The Scholarly Perspective

## Mục đích

Web app giúp người học IELTS người Việt cải thiện
ngữ pháp tiếng Anh, áp dụng vào Writing và Speaking.
Nội dung ngữ pháp tham khảo từ sách "Giải thích ngữ
pháp Tiếng Anh" - Mai Lan Hương & Hà Thanh Uyên
(viết lại bằng ngôn ngữ riêng, không copy nguyên văn).

## Đối tượng

Người Việt Nam luyện thi IELTS, band mục tiêu 5.0–8.0.

## Level người dùng

- BASIC: Band 4–5.5
- INTERMEDIATE: Band 6–6.5
- ADVANCED: Band 7–9

---

## Tech Stack

- Frontend + Backend: Next.js (App Router), TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL + Prisma ORM
- AI: Gemini 2.0 Flash qua Antigravity Railway proxy
- Speech: Web Speech API (browser, miễn phí)
- Deploy: Vercel (frontend) + Railway (proxy sẵn có)

## Gemini API — QUAN TRỌNG

Không gọi Google AI trực tiếp.
Tất cả Gemini calls đều qua:
BASE_URL = https://antigravity-tools-production.up.railway.app
API_KEY = từ biến env GEMINI_API_KEY
Model = gemini-3.0-flash
File xử lý tập trung: src/lib/gemini.ts

## Ngôn ngữ giao diện

Tiếng Việt. Giải thích lỗi bằng tiếng Việt.
Ví dụ sửa bằng tiếng Anh.

---

## 3 Module chính

### Module 1 — Grammar

Triết lý: Không học để "biết công thức" mà học để
"dùng được trong Writing và Speaking IELTS".

Cấu trúc chương (theo mục đích giao tiếp):

- Chương 1: Mô tả sự kiện quá khứ
- Chương 2: Đưa ra quan điểm & lập luận
- Chương 3: Dự đoán & khả năng
- Chương 4: So sánh & đối chiếu
- Chương 5: Từ vựng trong ngữ cảnh

Cấu trúc mỗi bài học (7 phần):

1. Lý thuyết (Markdown)
2. Common Mistakes (lỗi người Việt hay mắc)
3. Usage Note (Writing Task 2 vs văn nói)
4. Applied Examples (1 học thuật + 1 hội thoại)
5. Grammar for Speaking (structures, phrasal verbs, collocations)
6. Bài tập tương tác (7 loại)
7. Shadowing (nghe + ghi âm so sánh)

7 loại bài tập:

1. MULTIPLE_CHOICE
2. FILL_IN_BLANK
3. REWRITE_SENTENCE
4. ERROR_CORRECTION (sửa lỗi trong đoạn văn)
5. REGISTER_SHIFT (informal ↔ formal)
6. SENTENCE_COMBINING (kết hợp câu)
7. SPEAKING_DRILL (ghi âm theo cấu trúc)

AI Flexible Grading:

- Bài tập mở (useAiGrading: true) → Gemini chấm
- Không chỉ đúng/sai cứng nhắc
- Trả về: { isAcceptable, score, feedbackVi, suggestedAnswer }

### Module 2 — Writing

Format đúng chuẩn IELTS:

- Task 1 Academic: mô tả biểu đồ/bảng/sơ đồ
- Task 1 General: viết thư formal/informal
- Task 2: opinion / discussion / problem-solution

Tính năng:

- Dàn ý thông minh (outline) cho người mới
- Gợi ý câu mở bài, thân bài, kết bài
- Gemini chấm 4 tiêu chí: Task Response, Coherence,
  Lexical Resource, Grammar Range & Accuracy
- Highlight lỗi grammar trực tiếp trong editor
- Trend note: so sánh với bài trước
- Gợi ý từ vựng/collocation theo topic

### Module 3 — Speaking

Layout 2 panel:

- Trái: Script Editor (gõ nháp + AI gợi ý câu hay hơn)
- Phải: Recording Area (Web Speech API transcribe realtime)
- User sửa tay transcript nếu máy nghe sai
- Gemini chỉ phân tích grammar của transcript

Format đúng 3 Part IELTS:

- Part 1: câu hỏi cá nhân ngắn
- Part 2: cue card 1–2 phút
- Part 3: thảo luận chuyên sâu

Tính năng:

- Gợi ý câu trả lời mẫu cho người mới
- Chữa lỗi grammar thường gặp trong văn nói
- Fluency Score (tốc độ nói, filler words)
- Topic vocabulary tags + linking phrases

---

## 3 Tính năng học thật sự

### 1. Mistake Tracking

- Mỗi lần làm sai → lưu vào MistakeLog (grammarTag)
- Dashboard hiển thị điểm yếu cá nhân
- Gemini nhận diện mistake pattern khi chấm Writing/Speaking

### 2. Spaced Repetition

- Đúng → ôn sau 3 ngày → 7 ngày → 14 ngày
- Sai → reset về 1 ngày
- Dashboard hiển thị: "Hôm nay cần ôn X bài"
- Lưu trong ExerciseResult: nextReviewAt, reviewCount, easeFactor

### 3. Grammar → IELTS Task Mapping

- Mỗi GrammarLesson có: ieltsWritingTags, ieltsSpeakingTags
- Sau khi học xong bài → gợi ý ngay Writing/Speaking task liên quan
- Gemini biết user đang học gì để chấm có trọng tâm

---

## Database (Prisma Models)

User, GrammarChapter, GrammarLesson, GrammarExercise,
ExerciseResult, MistakeLog, WritingPrompt,
WritingSubmission, SpeakingPrompt, SpeakingSubmission,
UserProgress

## Phases đã hoàn thành

- [ ] Phase 1: Setup Next.js, Tailwind, Prisma, Auth
- [ ] Phase 2: Database schema + seed + parse PDF
- [ ] Phase 3: Grammar Module UI
- [ ] Phase 4: Writing Module + Gemini
- [ ] Phase 5: Speaking Module
- [ ] Phase 6: Dashboard + Progress
- [ ] Phase 7: Test + Deploy Vercel
