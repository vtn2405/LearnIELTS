import {
  GrammarUnit,
  Exercise,
  WritingMiniTask,
  SpeakingDrill,
  CompletionMeta,
  SpeakingContrastExample,
} from "../types";

export const unit: GrammarUnit = {
  id: "unit-1-simple-present",
  chapter: 1,
  title: "Simple Present",
  subtitle: "Thì hiện tại đơn",
  band_min: 4.0,
  band_target: 5.5,

  theory: {
    title: "Thì Hiện Tại Đơn",
    description:
      "Dùng cho thói quen, sự thật khoa học, trạng thái hiện tại và lịch trình cố định.",
    formation: {
      affirmative: "S + V(s/es)",
      negative: "S + do/does + not + V",
      question: "Do/Does + S + V?",
    },
    contrast_examples: [
      {
        wrong: "I go gym every day.",
        correct: "I go to the gym every day.",
        tip_vi:
          'Thêm "to the" trước danh từ địa điểm. Không bỏ giới từ trong tiếng Anh học thuật.',
        band_impact: "Thiếu giới từ → -0.5 band (Fluency & Coherence)",
      },
      {
        wrong: "She go to work at 8am.",
        correct: "She goes to work at 8am.",
        tip_vi: 'Chủ ngữ "She" (ngôi 3 số ít) → thêm -es vào động từ.',
        band_impact: "Lỗi động từ số ít → -1.0 band (Grammar)",
      },
      {
        wrong: "They usually watches TV.",
        correct: "They usually watch TV.",
        tip_vi:
          '"They" là ngôi 3 số nhiều → dùng động từ không thêm -s. Chỉ He/She/It thêm -es.',
        band_impact: "Subject-verb disagreement → -1.0 band (Grammar)",
      },
    ] as SpeakingContrastExample[],
    key_points: [
      "Dùng cho hành động lặp lại (I study every day)",
      "Sự thật không thay đổi (Water boils at 100°C)",
      "Trạng thái tồn tại (She knows the answer)",
      "Lịch trình cố định (The train leaves at 9am)",
    ],
  },

  exercises: {
    total: 5,
    items: [
      {
        id: "ex-1-1",
        type: "multiple_choice",
        question: "My sister _____ to the gym every morning.",
        options: ["go", "going", "goes", "have gone"],
        correct_answer: "goes",
        feedback_correct:
          'Chính xác! "My sister" (ngôi 3 số ít) → thêm -es. Đây là hành động thường xuyên → Simple Present.',
        feedback_wrong:
          'Sai rồi. "My sister" là ngôi 3 số ít (He/She/It) → động từ phải thêm -s/-es.',
        ielts_tip:
          "Speaking Part 1: Nói về thói quen hàng ngày → luôn dùng Simple Present + thêm frequency adverbs (usually, always, often).",
        skill: "both",
      } as Exercise,
      {
        id: "ex-1-2",
        type: "multiple_choice",
        question: "Water _____ at 100 degrees Celsius.",
        options: ["boil", "boils", "is boiling", "boiled"],
        correct_answer: "boils",
        feedback_correct:
          'Đúng! Đây là sự thật khoa học → Simple Present. "Water" = ngôi 3 số ít → "boils".',
        feedback_wrong:
          "Sai. Sự thật khoa học dùng Simple Present, không phải hiện tại tiếp diễn hay quá khứ.",
        ielts_tip:
          'Writing Task 2: Khi phát biểu sự thật chung (e.g., "Research shows that...") → Simple Present thường được dùng.',
        skill: "both",
      } as Exercise,
      {
        id: "ex-1-3",
        type: "multiple_choice",
        question: "They _____ coffee every morning, but I prefer tea.",
        options: ["drinks", "drink", "are drinking", "drank"],
        correct_answer: "drink",
        feedback_correct:
          'Chính xác! "They" là ngôi 3 số nhiều → động từ không thêm -s. Dùng Simple Present cho thói quen.',
        feedback_wrong:
          'Sai. "They" (số nhiều) → động từ không thêm -s. Chỉ He/She/It thêm -es.',
        ielts_tip:
          "Tránh lỗi phổ biến: Thêm -s vào động từ với các chủ ngữ số nhiều (they, you, we).",
        skill: "both",
      } as Exercise,
      {
        id: "ex-1-4",
        type: "find_error",
        question:
          'Tìm lỗi: "The government create new policies every year to address economic challenges."',
        options: [
          'Lỗi: "create" → phải là "creates" (ngôi 3 số ít)',
          'Lỗi: "create" → phải là "creates" (lịch trình cố định)',
          "Không có lỗi",
        ] as any,
        correct_answer: 'Lỗi: "create" → phải là "creates" (ngôi 3 số ít)',
        feedback_correct:
          'Đúng! "The government" là danh từ tập hợp (số ít) → "creates".',
        feedback_wrong:
          'Sai. Chủ ngữ "the government" là số ít → động từ cần thêm -s/-es.',
        ielts_tip:
          'Writing Task 2: Danh từ tập hợp (government, team, company) ở tiếng Anh học thuật dùng như số ít → "creates", "proposes".',
        skill: "writing",
      } as Exercise,
      {
        id: "ex-1-5",
        type: "reorder",
        question: "Sắp xếp thành câu đúng: every / I / day / go to school",
        options: [
          "I go to school every day.",
          "I every day go to school.",
          "Every day I go to school.",
          "Go I to school every day.",
        ] as any,
        correct_answer: "I go to school every day.",
        feedback_correct:
          "Chính xác! Cấu trúc: S + V + O + frequency adverb (cuối câu).",
        feedback_wrong:
          'Sai. Frequency adverb thường đứng sau chủ ngữ + động từ, hoặc ở cuối câu. Đúng: "I go to school every day."',
        ielts_tip:
          'Speaking Part 1: Khi nói về thói quen, đặt "every day / usually / always" ở đúng vị trí để câu tự nhiên.',
        skill: "speaking",
      } as Exercise,
    ],
  },

  apply: {
    writing_mini: {
      prompt:
        "Viết 25-35 từ: Nói về một thói quen hàng ngày của bạn (ăn cơm, đi học, chơi thể thao, v.v.).",
      placeholder: "Every day, I... [viết tiếp]",
      grammar_must_use: [
        "Simple Present",
        "frequency adverb (always, usually, often)",
        "preposition (in, at, on)",
      ],
      word_limit: 30,
      model_answer:
        "Every day, I usually wake up at 6:30am. I go to the gym for one hour. After that, I have breakfast and prepare for work.",
      model_band: 5.0,
    } as WritingMiniTask,

    speaking_drill: {
      prompt:
        'Trả lời Speaking Part 1 (30 giây): "Tell me about your daily routine. What time do you usually wake up and sleep?"',
      time_limit: 30,
      grammar_targets: [
        "Simple Present",
        "frequency adverbs",
        "time expressions",
      ],
      model_answer:
        "Well, I usually wake up at around 6:30 in the morning, and I generally go to bed at around 11pm. During the day, I often study for about 3-4 hours, and then I spend time with friends or exercise. I typically have dinner at 7pm with my family.",
      model_band: 5.5,
    } as SpeakingDrill,
  },

  completion: {
    xp_reward: 50,
    badge: {
      id: "badge-present-1",
      name: "Time Master",
      icon: "⏰",
      description_vi:
        "Bạn đã thành thạo thì hiện tại đơn! Sẵn sàng cho các thì phức tạp hơn.",
    },
    // Khi content file unit-1-present-continuous được tạo, đổi thành "unit-1-present-continuous"
    next_unit_id: null as string | null,
    next_unit_title: "Present Continuous",
    next_unit_connection:
      'Contrast với Simple Present: "I read a book" vs "I am reading a book" (đang đọc ngay bây giờ).',
  } as CompletionMeta,
};
