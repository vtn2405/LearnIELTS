**Phase 1: Build UI Components (mock data, chưa cần engine)**
Mục tiêu: nhìn thấy và tương tác được với từng exercise type trên trình duyệt.


Bước 1: Tạo route /exercises/pattern-builder/[unitId]/page.tsx
         → Load 7 bài mock cứng từ exercises.json (chưa cần engine)
         → Render exercise đầu tiên
Bước 2: Build FillExercise.tsx
         → Input box, user gõ → check token → show feedback
         → Có nút Hint (3 levels)
         → Có nút Next
Bước 3: Build BuildExercise.tsx
         → Chips hiện ra, user click/drag xếp thứ tự
         → Check correctOrder → show feedback
Bước 4: Build FeedbackPanel.tsx (shared)
         → 4 phần: ✓ Correct, 🗣 IELTS Usage, 📈 Band Tip, ⚠ Common Mistake
         → Dùng chung cho tất cả exercise types
Bước 5: Build HintSystem.tsx (shared)
         → Click hint → show level 1 → click thêm → level 2 → level 3
         → Progressive reveal
Bước 6: Build TransformExercise.tsx
         → Textarea, user viết câu
         → Show constraints
         → Submit → mock feedback (chưa cần Gemini)
Bước 7: Build SpeakExercise.tsx
         → Cue + "Record" button + "Type instead" fallback
         → Mock feedback
Bước 8: Build MasterExercise.tsx
         → Textarea + countdown timer (20s)
         → Mock feedback
Bước 9: Build SessionSummary.tsx
         → Patterns Built Today
         → Weakness Summary
         → Next Actions (Retry / Next Level / Apply in Writing)
**Phase 2: Session Flow UI**

Bước 10: Kết nối 7 exercises thành 1 session flow
          → Progress bar: "Exercise 3 of 7"
          → Transition giữa các exercises
          → Auto-advance sau feedback
          → End → SessionSummary
**Phase 3: Session Engine (logic)**

Bước 11: Build session-engine.ts
          → Pick 7 bài từ pool theo rules
          → Dùng localStorage cho progress tracking ban đầu
**Phase 4: DB + API**

Bước 12: Prisma models + API routes
Bước 13: Swap localStorage → DB
TẠI SAO UI TRƯỚC?
Thấy kết quả ngay — bạn test UX/UI trực tiếp trên browser
Feedback nhanh — thấy cái nào cần chỉnh sửa về layout, animation, flow
Mock data đủ dùng — 4 units JSON đã có, hardcode 7 bài là chạy được
Logic engine phức tạp — nếu build engine trước mà UI chưa có thì không biết test ở đâu
Tránh build lại — nếu UI thay đổi sau khi test, engine có thể phải điều chỉnh theo