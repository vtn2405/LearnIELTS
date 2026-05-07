const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../public/speed-drill-unit1-v4-final.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Personalized feedback map: item_id → { optionText: explanation }
const FEEDBACKS = {
  sd_s_001: {
    "study":    "'study' là dạng nguyên mẫu, dùng cho I/You/We/They. 'My sister' = she (ngôi 3 số ít) → phải đổi y→i+es: studies.",
    "studying": "'studying' là Present Continuous, chỉ hành động đang xảy ra lúc nói. Câu nói về thói quen thường xuyên → Simple Present: studies.",
    "studied":  "'studied' là Past Simple, diễn tả hành động đã xảy ra trong quá khứ. Câu nói về thói quen hiện tại → Simple Present: studies.",
  },
  sd_s_002: {
    "don't do":      "'don't' dùng cho I/You/We/They. Chủ ngữ là 'He' (ngôi 3 số ít) → phải dùng 'doesn't do'.",
    "doesn't does":  "Lỗi double-s: sau 'doesn't' phải dùng V nguyên mẫu, không thêm -s. Đúng là 'doesn't do', không phải 'doesn't does'.",
    "isn't do":      "'isn't' là phủ định của 'be', không dùng để phủ định V thường. Với V thường, dùng 'doesn't + V nguyên mẫu'.",
  },
  sd_s_003: {
    "rising":     "Thiếu trợ động từ 'is'. Nhưng quan trọng hơn, đây là quy luật tự nhiên vĩnh cửu → Simple Present: rises.",
    "is rising":  "'is rising' (Present Continuous) chỉ sự kiện đang xảy ra lúc nói. Quy luật tự nhiên không thay đổi → Simple Present: rises.",
    "rose":       "'rose' là Past Simple, dùng khi sự việc đã xảy ra và kết thúc. Quy luật tự nhiên là sự thật vĩnh cửu → Simple Present: rises.",
  },
  sd_s_004: {
    "usually they":  "Lặp lại chủ ngữ (câu đã có 'Students') và sai vị trí. 'Usually' phải đứng TRƯỚC V thường: Students usually review.",
    "they usually":  "Lặp lại chủ ngữ trong câu — 'Students' đã là chủ ngữ rồi, không thêm 'they'. Điền 'usually' để thành 'Students usually review'.",
    "are usually":   "'are usually' dùng với tính từ/danh từ (e.g., 'They are usually late'). Với V thường 'review', dùng 'usually' không có 'be'.",
  },
  sd_s_005: {
    "Do":   "'Do' dùng cho I/You/We/They. 'Your school' = it (ngôi 3 số ít) → phải dùng 'Does'.",
    "Is":   "'Is' là trợ động từ của 'be', dùng hỏi trạng thái ('Is it open?'). Với V thường 'start', câu hỏi phải là 'Does ... start?'.",
    "Are":  "'Are' dùng cho You/We/They hoặc danh từ số nhiều. 'Your school' = it (số ít) → dùng 'Does'.",
  },
  sd_s_006: {
    "am studying":  "'am studying' (Present Continuous) chỉ hành động đang xảy ra tại thời điểm nói. 'Every morning' là dấu hiệu thói quen → Simple Present: study.",
    "studied":      "'studied' là Past Simple, diễn tả hành động đã xảy ra và kết thúc. 'Every morning' = thói quen hiện tại → Simple Present: study.",
    "studies":      "'studies' thêm -s/-es dành cho ngôi 3 số ít (he/she/it). Chủ ngữ là 'I' → dạng nguyên mẫu: study.",
  },
  sd_s_007: {
    "am believing":  "'believe' là stative verb (động từ trạng thái) → không bao giờ dùng dạng -ing. Simple Present: I believe.",
    "am believe":    "Sai cấu trúc: 'am + V nguyên mẫu' không tồn tại trong tiếng Anh. 'Believe' là stative verb → Simple Present: I believe.",
    "believes":      "'believes' thêm -s dành cho ngôi 3 số ít (he/she/it). Chủ ngữ là 'I' → dạng nguyên mẫu: believe.",
  },
  sd_s_008: {
    "provide":        "'provide' là dạng nguyên mẫu, dùng cho I/You/We/They. 'The school' = it (ngôi 3 số ít) + 'every year' → Simple Present: provides.",
    "is providing":   "'is providing' (Present Continuous) chỉ hành động đang xảy ra lúc nói. 'Every year' là dấu hiệu lặp lại → Simple Present: provides.",
    "provided":       "'provided' là Past Simple, chỉ hành động đã xảy ra trong quá khứ. 'Every year' chỉ thói quen hiện tại → provides.",
  },
  sd_s_009: {
    "doesn't":  "'doesn't' dùng cho ngôi 3 số ít (he/she/it). 'Most students' = số nhiều → phải dùng 'don't'.",
    "aren't":   "'aren't' là phủ định của 'be'. Với V thường 'enjoy', phủ định bằng 'don't/doesn't', không dùng 'aren't'.",
    "isn't":    "'isn't' là phủ định của 'be' ở ngôi 3 số ít. Với V thường 'enjoy' và chủ ngữ số nhiều 'most students', dùng 'don't enjoy'.",
  },
  sd_s_010: {
    "provide":        "'provide' là dạng nguyên mẫu, dùng cho I/You/We/They. 'Education' là danh từ không đếm được → được coi là số ít → provides.",
    "are providing":  "'Education' tuy không có -s nhưng là danh từ không đếm được (uncountable) → số ít → không dùng 'are'. Dùng Simple Present: provides.",
    "provided":       "'provided' là Past Simple. Câu nêu sự thật chung, không phải quá khứ → Simple Present: provides.",
  },
};

let changed = 0;
for (const item of data.blueprint.items_by_level.starter) {
  if (FEEDBACKS[item.item_id]) {
    item.wrong_answer_feedbacks = FEEDBACKS[item.item_id];
    changed++;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
console.log(`Done — updated ${changed} items.`);
