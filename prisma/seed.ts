import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// -- Auto-generated unit constants (from app/grammar/grammar-units.json) ---
// -- Auto-generated unit constants (from app/grammar/grammar-units.json) ---
// AUTO_GENERATED_UNIT_CONSTANTS_START
const UNIT_1_SIMPLE_PRESENT_THEORY = `Simple Present diễn tả: (1) thói quen / hành động lặp lại → dùng với always, usually, often, sometimes, never, every day; (2) sự thật hiển nhiên, quy luật; (3) trạng thái hiện tại (cảm xúc, nhận thức). Công thức: S + V (nguyên mẫu) — riêng ngôi 3 số ít (he/she/it) thêm -s hoặc -es.

Sai: I am study English every morning.
Dung: I study English every morning before school.
Meo: Người Việt hay dùng 'am/is/are' cho mọi thì vì trong tiếng Việt không chia động từ. Nhớ: thói quen hàng ngày → KHÔNG dùng 'be + V-ing', chỉ dùng động từ thường.
Band impact: Lỗi dùng nhầm 'am study' thay vì 'study' bị giám khảo trừ điểm Grammatical Range — khó vượt band 5.0 nếu mắc lỗi cơ bản này.

Vi du nhanh:
1. Most students in Vietnam take extra classes after school.
   - Hầu hết học sinh Việt Nam học thêm sau giờ học.
2. She usually reviews her notes before an IELTS exam.
   - Cô ấy thường ôn lại ghi chú trước kỳ thi IELTS.
3. Universities require students to submit assignments on time.
   - Các trường đại học yêu cầu sinh viên nộp bài đúng hạn.`;

const UNIT_1_SIMPLE_PRESENT_MISTAKES = `❌ She study very hard for her university entrance exam. -> ✅ She studies very hard for her university entrance exam.
Chủ ngữ 'she' là ngôi 3 số ít → động từ phải thêm -s: study → studies.

❌ I am go to school by bus every day. -> ✅ I go to school by bus every day.
Thói quen hàng ngày dùng Simple Present, không dùng 'am + go'. 'Am going' chỉ dùng cho kế hoạch tương lai gần.

❌ Education play an important role in society. -> ✅ Education plays an important role in society.
'Education' là danh từ không đếm được, coi như ngôi 3 số ít → plays (thêm -s).`;

const UNIT_1_SIMPLE_PRESENT_USAGE_TASK2 = `Dùng Simple Present để viết luận Task 2 về các sự thật giáo dục, xu hướng chung — câu văn mạch lạc, đúng cấu trúc.`;
const UNIT_1_SIMPLE_PRESENT_USAGE_SPOKEN = `Dùng Simple Present để trả lời câu hỏi Part 1 về thói quen học tập — nghe tự nhiên, không bị lẫn với thì tiếp diễn.`;

const UNIT_1_PRESENT_CONTINUOUS_THEORY = `Present Continuous = am/is/are + V-ing. Dùng khi: (1) hành động đang xảy ra ngay lúc nói (now, at the moment); (2) hành động tạm thời đang diễn ra trong giai đoạn này (this week, these days); (3) xu hướng đang thay đổi (getting, rising, falling); (4) kế hoạch tương lai gần đã sắp xếp. KHÔNG dùng với: think, know, want, understand, believe, love, hate.

Sai: More and more students apply for universities these days.
Dung: More and more students are applying for universities these days.
Meo: Khi nói về xu hướng đang thay đổi trong giai đoạn này ('these days', 'nowadays'), dùng Present Continuous chứ không dùng Simple Present. Đây là lỗi rất phổ biến trong Task 2.
Band impact: Phân biệt đúng Simple Present vs Present Continuous khi nói về xu hướng giúp bạn đạt Grammatical Range & Accuracy band 6.0+.

Vi du nhanh:
1. Many universities are updating their curricula to include AI skills.
   - Nhiều trường đại học đang cập nhật chương trình học để bao gồm kỹ năng AI.
2. I am currently preparing for my IELTS exam next month.
   - Hiện tôi đang chuẩn bị cho kỳ thi IELTS vào tháng tới.
3. The number of international students is rising every year.
   - Số lượng sinh viên quốc tế đang tăng lên mỗi năm.`;

const UNIT_1_PRESENT_CONTINUOUS_MISTAKES = `❌ I am wanting to study abroad next year. -> ✅ I want to study abroad next year.
'Want' là động từ chỉ trạng thái tâm lý, không dùng dạng -ing. Các động từ tương tự: know, think, believe, understand, love, hate.

❌ She is study for her final exams this week. -> ✅ She is studying for her final exams this week.
Cấu trúc Present Continuous bắt buộc là: be + V-ing. Thiếu -ing là lỗi cấu trúc cơ bản nhất.

❌ The education system improve a lot these days. -> ✅ The education system is improving a lot these days.
'These days' là tín hiệu của xu hướng đang thay đổi → cần Present Continuous 'is improving', không phải Simple Present.`;

const UNIT_1_PRESENT_CONTINUOUS_USAGE_TASK2 = `Dùng Present Continuous để viết về xu hướng đang thay đổi trong giáo dục — cấu trúc phù hợp với Task 2 phong cách học thuật.`;
const UNIT_1_PRESENT_CONTINUOUS_USAGE_SPOKEN = `Dùng Present Continuous để mô tả điều đang xảy ra trong cuộc sống học tập ngay lúc này — nghe tự nhiên, phân biệt được với Simple Present.`;

const UNIT_1_SIMPLE_PAST_THEORY = `Simple Past diễn tả: (1) hành động đã bắt đầu và kết thúc tại một thời điểm cụ thể trong quá khứ; (2) chuỗi hành động xảy ra kế tiếp nhau trong quá khứ. Công thức: S + V-ed (động từ có quy tắc) hoặc S + V2 (động từ bất quy tắc). Từ tín hiệu: yesterday, last week/month/year, ago, in 2020, when I was a child.

Sai: When I was in high school, I study very hard for the university entrance exam.
Dung: When I was in high school, I studied very hard for the university entrance exam.
Meo: Người Việt hay quên chia động từ ở quá khứ vì tiếng Việt không chia thì. Mỗi khi thấy 'when I was...', 'last year', 'ago' → tự nhắc bản thân: PHẢI dùng V-ed hoặc V2.
Band impact: Kể chuyện trong Part 2 mà dùng Simple Present thay Simple Past sẽ bị trừ điểm nặng về Grammatical Range — khó đạt band 6.0.

Vi du nhanh:
1. I attended a private school for six years before I moved to the city.
   - Tôi đã học trường tư trong sáu năm trước khi chuyển lên thành phố.
2. My teacher encouraged me to take the IELTS exam last year.
   - Giáo viên của tôi đã khuyến khích tôi thi IELTS năm ngoái.
3. The school introduced a new curriculum in 2018 and students responded positively.
   - Trường đã giới thiệu chương trình học mới vào năm 2018 và học sinh phản hồi tích cực.`;

const UNIT_1_SIMPLE_PAST_MISTAKES = `❌ She goed to university in 2019. -> ✅ She went to university in 2019.
'Go' là động từ bất quy tắc: go → went. Không bao giờ thêm -ed cho động từ bất quy tắc. Cần học thuộc danh sách V2.

❌ I didn't studied enough before the IELTS exam. -> ✅ I didn't study enough before the IELTS exam.
Sau 'didn't', động từ luôn ở dạng nguyên mẫu (bare infinitive). 'Didn't studied' là lỗi cực phổ biến của người Việt.

❌ When did you finished your degree? -> ✅ When did you finish your degree?
Trong câu hỏi với 'did', động từ chính luôn ở dạng nguyên mẫu. 'Did you finished' là sai — chỉ được 'Did you finish'.`;

const UNIT_1_SIMPLE_PAST_USAGE_TASK2 = `Dùng Simple Past để đưa ra ví dụ lịch sử hoặc trải nghiệm cá nhân trong Task 2 — làm lập luận thuyết phục hơn.`;
const UNIT_1_SIMPLE_PAST_USAGE_SPOKEN = `Dùng Simple Past để kể câu chuyện trong Speaking Part 2 (cue card) — kể mạch lạc, đúng thì, tự nhiên như người bản ngữ.`;

const UNIT_1_PAST_CONTINUOUS_THEORY = `Past Continuous = was/were + V-ing. Dùng khi: (1) hành động đang xảy ra tại một thời điểm cụ thể trong quá khứ; (2) hành động đang diễn ra (dài hơn) thì bị gián đoạn bởi hành động khác (ngắn hơn) → dùng WHILE/WHEN: [Past Continuous] when/while [Simple Past]. Lưu ý: Past Continuous = hành động nền dài; Simple Past = hành động ngắn xen vào.

Sai: I studied for my exam when the teacher called to give me good news.
Dung: I was studying for my exam when my teacher called to give me good news.
Meo: Hành động đang tiếp diễn (studying) bị gián đoạn bởi hành động khác (called) → Past Continuous + when + Simple Past. Người Việt thường dùng Simple Past cho cả hai.
Band impact: Biết dùng 'was/were + V-ing' đúng lúc giúp câu chuyện Part 2 nghe tự nhiên và đạt Grammatical Range band 6.0.

Vi du nhanh:
1. I was taking my final exam when the power went out.
   - Tôi đang làm bài thi cuối kỳ thì điện bị cúp.
2. While the students were waiting for results, the school announced a new scholarship program.
   - Trong khi học sinh đang chờ kết quả, nhà trường thông báo một chương trình học bổng mới.
3. She was preparing her university application when she realized she had missed the deadline.
   - Cô ấy đang chuẩn bị hồ sơ đại học thì nhận ra đã bỏ lỡ hạn chót.`;

const UNIT_1_PAST_CONTINUOUS_MISTAKES = `❌ While I was studying, my friend was called me. -> ✅ While I was studying, my friend called me.
Hành động gián đoạn (friend called) dùng Simple Past, không phải Past Continuous. 'Was called' = bị động, mang nghĩa khác hoàn toàn.

❌ I were reviewing my notes when the exam result came out. -> ✅ I was reviewing my notes when the exam result came out.
Với 'I', luôn dùng 'was' (không bao giờ 'were' trong câu khẳng định). Were chỉ dùng cho you/we/they.

❌ She was knowing the answer but she was too nervous to speak. -> ✅ She knew the answer but she was too nervous to speak.
'Know' là stative verb — không dùng dạng -ing. Dùng 'knew' (Simple Past) thay vì 'was knowing'.`;

const UNIT_1_PAST_CONTINUOUS_USAGE_TASK2 = `Dùng Past Continuous trong Task 2 để tạo câu phức hợp mô tả tình huống quá khứ có chiều sâu.`;
const UNIT_1_PAST_CONTINUOUS_USAGE_SPOKEN = `Dùng Past Continuous kết hợp Simple Past để kể câu chuyện Part 2 có bối cảnh sinh động — phân biệt hành động nền và hành động chính.`;

const UNIT_2_PRESENT_PERFECT_THEORY = `Present Perfect = have/has + V3 (past participle). Dùng khi: (1) kinh nghiệm trong cuộc đời (chưa rõ khi nào): ever, never, before; (2) hành động vừa xảy ra, còn ảnh hưởng hiện tại: just, already, yet; (3) hành động bắt đầu quá khứ, kéo dài đến nay: since, for; (4) xu hướng gần đây: recently, lately, over the past few years. KHÔNG dùng khi đã nêu thời điểm cụ thể (yesterday, in 2020 → dùng Simple Past).

Sai: I used many different apps to learn English since 2020.
Dung: I have used many different apps to learn English since 2020.
Meo: 'Since 2020' = từ quá khứ đến bây giờ → cần Present Perfect, không phải Simple Past. Đây là lỗi số 1 của người Việt với Present Perfect vì tiếng Việt không có thì này.
Band impact: Dùng đúng Present Perfect với 'since/for' trong Part 1 là dấu hiệu rõ ràng nhất của band 6.0+.

Vi du nhanh:
1. Technology has transformed the way people work over the past decade.
   - Công nghệ đã thay đổi cách mọi người làm việc trong thập kỷ qua.
2. I have never worked remotely, but I would like to try it.
   - Tôi chưa bao giờ làm việc từ xa, nhưng tôi muốn thử.
3. Many companies have recently adopted AI tools to increase productivity.
   - Nhiều công ty gần đây đã áp dụng các công cụ AI để tăng năng suất.`;

const UNIT_2_PRESENT_PERFECT_MISTAKES = `❌ She has worked at that tech company since three years. -> ✅ She has worked at that tech company for three years.
'Since' đi với mốc thời gian cụ thể (since 2020, since Monday). 'For' đi với khoảng thời gian (for three years, for a long time).

❌ I have finished my project yesterday. -> ✅ I finished my project yesterday.
'Yesterday' là thời điểm cụ thể trong quá khứ → dùng Simple Past, không phải Present Perfect. Present Perfect không đi kèm thời điểm cụ thể đã qua.

❌ Have you ever went to a tech conference? -> ✅ Have you ever been to a tech conference?
Trong câu hỏi về kinh nghiệm với 'go to a place', dùng 'been to', không phải 'gone to'. 'Gone to' có nghĩa là đã đi và chưa về.`;

const UNIT_2_PRESENT_PERFECT_USAGE_TASK2 = `Dùng Present Perfect trong Task 2 để nói về xu hướng từ quá khứ đến hiện tại — đặc biệt trong mở bài và kết bài.`;
const UNIT_2_PRESENT_PERFECT_USAGE_SPOKEN = `Dùng Present Perfect để nói về kinh nghiệm làm việc và công nghệ trong Part 1 — phân biệt 'I have used' vs 'I used' một cách tự nhiên.`;

const UNIT_2_PAST_PERFECT_THEORY = `Past Perfect = had + V3. Dùng khi diễn tả hành động xảy ra và kết thúc TRƯỚC một thời điểm hoặc hành động khác trong quá khứ. Thường đi với: before, after, when, by the time, already, just, never. Công thức kể chuyện: [Past Perfect] + before/when + [Simple Past] HOẶC [Simple Past] + because + [Past Perfect].

Sai: When I arrived at the job interview, I realized I forgot to bring my CV.
Dung: When I arrived at the job interview, I realized I had forgotten to bring my CV.
Meo: Hành động quên (forget) xảy ra TRƯỚC khi nhận ra (realize) → Past Perfect 'had forgotten'. Người Việt hay dùng Simple Past cho cả hai vì tiếng Việt không phân biệt thứ tự thì.
Band impact: Dùng đúng Past Perfect trong chuỗi sự kiện là dấu hiệu grammar band 6.5+ trong Speaking Part 2.

Vi du nhanh:
1. By the time the company adopted cloud technology, its competitors had already moved ahead.
   - Khi công ty áp dụng công nghệ đám mây, các đối thủ đã tiến xa rồi.
2. She got the promotion because she had worked exceptionally hard for two years.
   - Cô ấy được thăng chức vì đã làm việc xuất sắc trong hai năm.
3. I had never used a coding language before I joined the software company.
   - Tôi chưa bao giờ dùng ngôn ngữ lập trình trước khi vào công ty phần mềm.`;

const UNIT_2_PAST_PERFECT_MISTAKES = `❌ After she has finished the project, she went home. -> ✅ After she had finished the project, she went home.
Cả hai hành động đều trong quá khứ. 'Had finished' xảy ra trước 'went home' → dùng Past Perfect, không phải Present Perfect.

❌ He didn't get the job because he hadn't practiced for the interview. -> ✅ He didn't get the job because he hadn't practiced for the interview.
Câu này thực ra đúng rồi! 'Hadn't practiced' (Past Perfect phủ định) chỉ việc anh ta ĐÃ KHÔNG chuẩn bị — xảy ra trước 'didn't get'.

❌ By the time I learned about the job opening, someone had already took it. -> ✅ By the time I learned about the job opening, someone had already taken it.
'Take' là động từ bất quy tắc: take → took → taken (V3). Sau 'had' phải dùng V3 = taken, không phải V2 = took.`;

const UNIT_2_PAST_PERFECT_USAGE_TASK2 = `Dùng Past Perfect trong Task 2 để lập luận về nguyên nhân-kết quả trong quá khứ — câu văn phức tạp và học thuật hơn.`;
const UNIT_2_PAST_PERFECT_USAGE_SPOKEN = `Dùng Past Perfect để kể chuyện Part 2 có chiều sâu thời gian — nêu được trình tự 'cái gì xảy ra trước, cái gì sau' một cách rõ ràng.`;

const UNIT_2_PAST_FUTURE_THEORY = `WILL: (1) dự đoán dựa trên quan điểm/kinh nghiệm; (2) quyết định ngay lúc nói; (3) lời hứa, đề nghị, yêu cầu. GOING TO: (1) kế hoạch đã được sắp xếp từ trước; (2) dự đoán dựa trên bằng chứng hiện tại. Trong câu điều kiện và mệnh đề thời gian: KHÔNG dùng will sau when/if/before/after → dùng Simple Present.

Sai: I think robots will to replace most factory workers in 20 years.
Dung: I think robots will replace most factory workers in the next 20 years.
Meo: Sau 'will' luôn dùng động từ nguyên mẫu không 'to'. 'Will to replace' là lỗi rất phổ biến — có thể vì nhầm với 'be going to + V'.
Band impact: 'Will + V (không to)' là cấu trúc cơ bản. Sai ở đây trong Part 3 sẽ bị trừ điểm Grammatical Accuracy ngay lập tức.

Vi du nhanh:
1. Automation will likely eliminate repetitive jobs but create new roles in AI management.
   - Tự động hóa có thể sẽ xóa bỏ các công việc lặp lại nhưng tạo ra các vai trò mới trong quản lý AI.
2. I'm going to apply for a software engineering position next month — I've already updated my CV.
   - Tháng tới tôi sẽ nộp đơn vào vị trí kỹ sư phần mềm — tôi đã cập nhật CV rồi.
3. Look at those dark clouds — it's going to rain, so we should move the outdoor tech event inside.
   - Nhìn những đám mây đen kia — trời sắp mưa, chúng ta nên chuyển sự kiện công nghệ ngoài trời vào trong.`;

const UNIT_2_PAST_FUTURE_MISTAKES = `❌ When technology will advance, many jobs will disappear. -> ✅ When technology advances, many jobs will disappear.
Trong mệnh đề thời gian bắt đầu bằng 'when/if/before/after', KHÔNG dùng 'will' — dùng Simple Present thay thế. Lỗi này rất phổ biến trong Task 2.

❌ I will to start my own tech business next year. -> ✅ I'm going to start my own tech business next year.
Kế hoạch đã có sẵn → 'going to'. Thêm vào đó, 'will to start' sai — sau will không dùng 'to'. Đúng là: will start hoặc am going to start.

❌ The company is going to probably expand globally. -> ✅ The company will probably expand globally.
'Probably' thường đi với 'will', không phải 'going to'. Và 'probably' đứng GIỮA will và động từ chính: will probably + V.`;

const UNIT_2_PAST_FUTURE_USAGE_TASK2 = `Dùng 'will' để đưa ra dự đoán học thuật trong Task 2 — kết hợp với trạng từ: probably, likely, certainly để điều tiết mức độ chắc chắn.`;
const UNIT_2_PAST_FUTURE_USAGE_SPOKEN = `Phân biệt 'will' (dự đoán, quyết định tức thì) và 'going to' (kế hoạch đã có, dự đoán dựa trên bằng chứng) để trả lời Part 3 tự nhiên và chính xác.`;

const UNIT_3_MODAL_ABILITY_THEORY = `CAN: khả năng hiện tại / khả năng chung chung. COULD: (1) khả năng trong quá khứ; (2) khả năng lý thuyết / đề xuất lịch sự hơn can; (3) trong câu điều kiện. Sau modal: luôn dùng V nguyên mẫu (không to, không -s, không -ed). Phủ định: cannot/can't, couldn't.

Sai: Technology can to solve many problems in the workplace.
Dung: Technology can solve many problems in the workplace.
Meo: Sau modal verbs (can, could, will, would, may, might, should, must) KHÔNG BAO GIỜ dùng 'to'. Đây là quy tắc tuyệt đối. 'Can to solve' là lỗi rất phổ biến.
Band impact: Lỗi 'can to + V' là lỗi cơ bản nhất với modal verbs. Giám khảo gặp lỗi này ngay câu đầu sẽ ảnh hưởng đến ấn tượng toàn bài.

Vi du nhanh:
1. Remote workers can collaborate effectively using digital tools like Zoom and Slack.
   - Nhân viên làm việc từ xa có thể cộng tác hiệu quả bằng các công cụ kỹ thuật số như Zoom và Slack.
2. Ten years ago, most people couldn't imagine working from home full-time.
   - Mười năm trước, hầu hết mọi người không thể tưởng tượng làm việc tại nhà toàn thời gian.
3. Governments could invest more in digital literacy programs to help older workers adapt.
   - Chính phủ có thể đầu tư thêm vào các chương trình đọc viết kỹ thuật số để giúp người lao động lớn tuổi thích nghi.`;

const UNIT_3_MODAL_ABILITY_MISTAKES = `❌ She can speaks three programming languages fluently. -> ✅ She can speak three programming languages fluently.
Sau modal verbs (can, could, will, would...) luôn dùng V nguyên mẫu không thêm -s, -ed, -ing. 'Can speaks' là sai — phải là 'can speak'.

❌ When I was a student, I can access the internet easily. -> ✅ When I was a student, I could access the internet easily.
Nói về khả năng trong quá khứ → dùng 'could', không phải 'can'. 'Can' chỉ dùng cho hiện tại.

❌ This technology could to improve productivity significantly. -> ✅ This technology could improve productivity significantly.
Quy tắc tuyệt đối: modal + V nguyên mẫu (không 'to'). 'Could to improve' = sai. 'Could improve' = đúng.`;

const UNIT_3_MODAL_ABILITY_USAGE_TASK2 = `Dùng can/could trong Task 2 để đưa ra đề xuất giải pháp — câu văn học thuật, tránh dùng 'can' quá nhiều.`;
const UNIT_3_MODAL_ABILITY_USAGE_SPOKEN = `Dùng can/could linh hoạt trong Part 3 để nói về khả năng của con người và công nghệ — tránh câu trả lời đơn điệu chỉ dùng 'can'.`;

const UNIT_3_MODAL_POSSIBILITY_THEORY = `MAY: xác suất khoảng 50% (có thể xảy ra). MIGHT: xác suất thấp hơn, ít chắc chắn hơn may. Cả hai: modal + V nguyên mẫu. Phủ định: may not / might not (KHÔNG dùng mayn't). Quá khứ: may/might + have + V3. Lưu ý: Trong văn nói không trang trọng, may và might thường dùng thay nhau.

Sai: Climate change might causes more frequent natural disasters in the future.
Dung: Climate change might cause more frequent natural disasters in the future.
Meo: Sau may/might → V nguyên mẫu (không thêm -s). 'Might causes' là lỗi phổ biến vì người Việt nhớ quy tắc thêm -s cho ngôi 3 nhưng quên rằng sau modal không áp dụng.
Band impact: Dùng may/might đúng trong Part 3 cho thấy bạn có khả năng diễn đạt quan điểm một cách thận trọng — dấu hiệu Coherence band 6.5+.

Vi du nhanh:
1. Rising sea levels may displace millions of coastal residents by 2050.
   - Mực nước biển dâng có thể khiến hàng triệu cư dân ven biển phải di dời vào năm 2050.
2. Some scientists believe renewable energy might completely replace fossil fuels within 30 years.
   - Một số nhà khoa học tin rằng năng lượng tái tạo có thể thay thế hoàn toàn nhiên liệu hóa thạch trong vòng 30 năm.
3. Stricter environmental regulations might discourage foreign investment in developing countries.
   - Các quy định môi trường nghiêm ngặt hơn có thể làm nản lòng đầu tư nước ngoài vào các nước đang phát triển.`;

const UNIT_3_MODAL_POSSIBILITY_MISTAKES = `❌ She may not goes to the environmental summit. -> ✅ She may not go to the environmental summit.
Sau may/might not → V nguyên mẫu (không -s, không -ed). 'May not goes' sai. 'May not go' đúng.

❌ The new policy mightn't work as expected. -> ✅ The new policy might not work as expected.
Không có dạng rút gọn 'mightn't' trong tiếng Anh chuẩn. Phải viết đầy đủ 'might not'. Khác với 'can't', 'won't', 'shouldn't'.

❌ This approach may solves the pollution problem. -> ✅ This approach may solve the pollution problem.
Modal + V nguyên mẫu. 'May solves' sai vì thêm -s sau modal. 'May solve' đúng.`;

const UNIT_3_MODAL_POSSIBILITY_USAGE_TASK2 = `Dùng may/might trong Task 2 để điều tiết mức độ chắc chắn của lập luận — thể hiện tư duy phê phán học thuật.`;
const UNIT_3_MODAL_POSSIBILITY_USAGE_SPOKEN = `Dùng may/might để đưa ra ý kiến thận trọng trong Part 3 về các vấn đề môi trường và xã hội — tránh nghe quá tự tin hoặc thiếu căn cứ.`;

const UNIT_3_PASSIVE_THEORY = `Passive = be + V3 (past participle). Chia 'be' theo thì: is/are (hiện tại), was/were (quá khứ), will be (tương lai), has/have been (hoàn thành), is/are being (tiếp diễn). 'By + agent' khi cần nêu người/vật thực hiện hành động. Dùng Passive khi: (1) không biết ai thực hiện; (2) không cần nêu ai thực hiện; (3) muốn nhấn mạnh đối tượng bị tác động.

Sai: The environment is being damaged by human activities, and many species are being affected.
Dung: The environment is being damaged by human activities, and many species are being affected — câu này thực ra ĐÚNG!
Meo: Passive tiếp diễn = is/are + being + V3. Đây là dạng khó nhất. Ví dụ lỗi thực tế: 'The report was wrote by the team' → 'was written'. V3 của 'write' = written, không phải wrote.
Band impact: Passive Voice đa dạng (simple, continuous, perfect) trong Task 2 là dấu hiệu rõ nhất của Grammatical Range band 6.5+.

Vi du nhanh:
1. Thousands of tonnes of plastic waste are dumped into the ocean every year.
   - Hàng ngàn tấn rác thải nhựa bị đổ xuống đại dương mỗi năm.
2. New environmental laws have been introduced in many countries over the past decade.
   - Các luật môi trường mới đã được ban hành ở nhiều quốc gia trong thập kỷ qua.
3. A new recycling facility is being built in the city center to reduce landfill waste.
   - Một cơ sở tái chế mới đang được xây dựng ở trung tâm thành phố để giảm rác thải chôn lấp.`;

const UNIT_3_PASSIVE_MISTAKES = `❌ The report was wrote by the research team last month. -> ✅ The report was written by the research team last month.
'Write' bất quy tắc: write → wrote → written (V3). Passive dùng V3, không phải V2. 'Was wrote' sai → 'was written' đúng.

❌ Many trees are cutting down to build new factories. -> ✅ Many trees are being cut down to build new factories.
Passive tiếp diễn hiện tại: is/are + being + V3. 'Are cutting' là chủ động. 'Are being cut down' = đang bị chặt (bị động tiếp diễn).

❌ The new environmental policy will introduced next year. -> ✅ The new environmental policy will be introduced next year.
Passive tương lai: will + BE + V3. Không được bỏ 'be'. 'Will introduced' thiếu 'be' — lỗi rất phổ biến.`;

const UNIT_3_PASSIVE_USAGE_TASK2 = `Dùng Passive trong Task 1 khi mô tả quy trình, và Task 2 khi cần văn phong học thuật — tránh lặp 'people/governments do...' quá nhiều.`;
const UNIT_3_PASSIVE_USAGE_SPOKEN = `Dùng Passive Voice trong Part 3 để nói về các vấn đề xã hội mà không cần chỉ đích danh ai — nghe khách quan và học thuật hơn.`;

const UNIT_4_CONDITIONAL_1_THEORY = `Conditional Type 1: IF + Simple Present, will + V nguyên mẫu. Tình huống CÓ THỂ xảy ra. Biến thể: If + Present, can/may/might + V. KHÔNG dùng will trong mệnh đề if.

Sai: If governments will invest in renewable energy, carbon emissions will decrease.
Dung: If governments invest in renewable energy, carbon emissions will decrease significantly.
Meo: KHÔNG BAO GIỜ dùng 'will' trong mệnh đề 'if'. Mệnh đề if dùng Simple Present dù nói về tương lai.
Band impact: Lỗi 'if + will' trong Task 2 là lỗi cơ bản — giám khảo sẽ không cho quá band 5.5 về Grammatical Accuracy.

Vi du nhanh:
1. If world leaders fail to reach a climate agreement, global temperatures will continue to rise.
   - Nếu các nhà lãnh đạo không đạt được thỏa thuận, nhiệt độ toàn cầu sẽ tiếp tục tăng.
2. Economic inequality will worsen if governments do not increase investment in education.
   - Bất bình đẳng sẽ tồi tệ hơn nếu chính phủ không tăng đầu tư giáo dục.
3. If countries cooperate on trade policies, both economies may benefit significantly.
   - Nếu các quốc gia hợp tác về thương mại, cả hai nền kinh tế có thể hưởng lợi.`;

const UNIT_4_CONDITIONAL_1_MISTAKES = `❌ If the pollution level will rise, marine life will be threatened. -> ✅ If the pollution level rises, marine life will be threatened.
Mệnh đề if dùng Simple Present (rises), không dùng will.

❌ Countries will suffer if they won't reduce carbon emissions. -> ✅ Countries will suffer if they do not reduce carbon emissions.
Phủ định trong mệnh đề if: do not/does not, không dùng won't.

❌ If we takes action now, the situation might improve. -> ✅ If we take action now, the situation might improve.
We = số nhiều → take (không thêm -s).`;

const UNIT_4_CONDITIONAL_1_USAGE_TASK2 = `Dùng Conditional Type 1 trong Task 2 để đề xuất giải pháp và dự đoán kết quả — đặc trưng band 6.0+.`;
const UNIT_4_CONDITIONAL_1_USAGE_SPOKEN = `Dùng Conditional Type 1 trong Part 3 để lập luận nhân quả về các vấn đề toàn cầu.`;

const UNIT_4_CONDITIONAL_2_THEORY = `Conditional Type 2: IF + Past Simple, would + V nguyên mẫu. Tình huống KHÔNG CÓ THẬT ở hiện tại/tương lai. Đặc biệt: If I/he/she/it were... (văn trang trọng dùng were). KHÔNG dùng would trong mệnh đề if.

Sai: If every country would reduce emissions by 50%, climate change would slow.
Dung: If every country reduced emissions by 50%, climate change would slow significantly.
Meo: KHÔNG dùng 'would' trong mệnh đề 'if' của Type 2. Mệnh đề if dùng Past Simple.
Band impact: Phân biệt đúng Type 1 (if + present) và Type 2 (if + past) là điều kiện để đạt Grammatical Range band 6.5.

Vi du nhanh:
1. If world leaders were more united, global problems would be easier to solve.
   - Nếu các nhà lãnh đạo đoàn kết hơn, các vấn đề toàn cầu sẽ dễ giải quyết hơn.
2. If I were the prime minister, I would prioritize investment in renewable energy.
   - Nếu tôi là thủ tướng, tôi sẽ ưu tiên đầu tư vào năng lượng tái tạo.
3. Developing nations could catch up economically if they received more equitable trade opportunities.
   - Các nước đang phát triển có thể bắt kịp nếu nhận được cơ hội thương mại công bằng hơn.`;

const UNIT_4_CONDITIONAL_2_MISTAKES = `❌ If I was the president, I will change immigration policies. -> ✅ If I were the president, I would change immigration policies.
Type 2: if-clause dùng were (văn trang trọng). Mệnh đề chính: would (not will).

❌ If countries would cooperate more, poverty would decrease. -> ✅ If countries cooperated more, poverty would decrease.
KHÔNG dùng would trong mệnh đề if — lỗi cực phổ biến. Dùng Past Simple.

❌ The world would be safer if tensions between nations will reduce. -> ✅ The world would be safer if tensions between nations reduced.
Dù if-clause đứng sau mệnh đề chính — vẫn phải dùng Past Simple (reduced).`;

const UNIT_4_CONDITIONAL_2_USAGE_TASK2 = `Dùng Type 2 trong Task 2 để lập luận về tình huống lý tưởng hoặc phản biện.`;
const UNIT_4_CONDITIONAL_2_USAGE_SPOKEN = `Dùng Type 2 trong Part 3 để đưa ra ý kiến giả thuyết — thể hiện tư duy phân tích cao.`;

const UNIT_4_CONDITIONAL_3_THEORY = `Conditional Type 3: IF + Past Perfect (had + V3), would/could/might + have + V3. Diễn đạt tình huống KHÔNG CÓ THẬT trong QUÁ KHỨ. Biến thể mệnh đề chính: could have + V3, might have + V3.

Sai: If countries had acted earlier on climate change, the situation would be much better now.
Dung: If countries had acted earlier on climate change, the situation would have been much better.
Meo: Type 3 phải nhất quán: if-clause dùng Past Perfect (had acted) → mệnh đề chính dùng would HAVE + V3. 'Would be' là Type 2 — trộn hai loại là lỗi phổ biến.
Band impact: Dùng đúng Type 3 hoàn chỉnh là dấu hiệu Grammatical Range band 6.5–7.0.

Vi du nhanh:
1. If earlier generations had prioritized environmental protection, we would not have faced such severe climate crises.
   - Nếu các thế hệ trước đã ưu tiên bảo vệ môi trường, chúng ta đã không phải đối mặt với khủng hoảng khí hậu nghiêm trọng.
2. The 2008 financial crisis could have been avoided if regulators had imposed stricter controls.
   - Cuộc khủng hoảng 2008 đã có thể tránh được nếu cơ quan quản lý áp đặt kiểm soát chặt chẽ hơn.
3. Millions of lives might have been saved if international aid had reached affected regions sooner.
   - Hàng triệu sinh mạng đã có thể được cứu nếu viện trợ quốc tế đến sớm hơn.`;

const UNIT_4_CONDITIONAL_3_MISTAKES = `❌ If they had prepared better, they would avoid the crisis. -> ✅ If they had prepared better, they would have avoided the crisis.
Type 3 phải nhất quán: if + had + V3, would + HAVE + V3. Không dùng 'would avoid' (Type 2).

❌ If the treaty would have been signed earlier, more countries could participate. -> ✅ If the treaty had been signed earlier, more countries could have participated.
If-clause Type 3: 'had been signed' (không 'would have been'). Mệnh đề chính: could have participated.

❌ The disaster might avoided if the government has warned citizens earlier. -> ✅ The disaster might have been avoided if the government had warned citizens earlier.
Mệnh đề chính: might + have + been + V3. If-clause: had + V3. Hai vế phải nhất quán.`;

const UNIT_4_CONDITIONAL_3_USAGE_TASK2 = `Dùng Type 3 trong Task 2 để lập luận nguyên nhân-kết quả trong quá khứ — cấu trúc phức tạp nhất.`;
const UNIT_4_CONDITIONAL_3_USAGE_SPOKEN = `Dùng Type 3 trong Part 3 để phân tích sai lầm lịch sử — thể hiện tư duy phân tích sâu, band 6.5+.`;

const UNIT_5_RELATIVE_THEORY = `Relative Clauses dùng: WHO (người — chủ ngữ/tân ngữ), WHICH (vật/sự việc), THAT (người hoặc vật trong defining clauses), WHOSE (sở hữu), WHERE (nơi chốn). Defining (không dấu phẩy, dùng that): 'The policy that was introduced...' Non-defining (có dấu phẩy, không dùng that): 'Climate change, which affects all nations, requires...'

Sai: Countries which they are developing need more international support.
Dung: Countries that are developing need more international support.
Meo: Sau đại từ quan hệ (who/which/that), KHÔNG lặp lại đại từ chủ ngữ. 'Countries which they are...' thừa 'they' — lỗi đặc trưng người Việt.
Band impact: Lỗi lặp đại từ trong mệnh đề quan hệ ('which it is', 'who he is') là lỗi điển hình dưới band 6.0.

Vi du nhanh:
1. Developing nations, which often lack resources to adapt, are most vulnerable to climate change.
   - Các quốc gia đang phát triển, thường thiếu nguồn lực, dễ bị tổn thương nhất bởi biến đổi khí hậu.
2. The Paris Agreement, which was signed by 196 parties, represents a milestone in global cooperation.
   - Hiệp định Paris, được ký bởi 196 bên, là cột mốc quan trọng trong hợp tác toàn cầu.
3. Communities where economic opportunities are limited tend to have higher emigration rates.
   - Các cộng đồng thiếu cơ hội kinh tế có xu hướng có tỷ lệ di cư cao hơn.`;

const UNIT_5_RELATIVE_MISTAKES = `❌ The agreement which it was signed in 2015 has been widely praised. -> ✅ The agreement which was signed in 2015 has been widely praised.
Sau 'which' không cần 'it'. 'Which' ĐÃ là chủ ngữ — thêm 'it' là thừa và sai.

❌ The scientists that they discovered the vaccine received a Nobel Prize. -> ✅ The scientists who discovered the vaccine received a Nobel Prize.
Người → dùng 'who', không phải 'that they'. Không lặp 'they' sau 'who'.

❌ This is the country where I have visited it many times. -> ✅ This is the country that I have visited many times.
'Visit' cần tân ngữ trực tiếp → dùng 'that/which', không phải 'where'. Và không lặp 'it'.`;

const UNIT_5_RELATIVE_USAGE_TASK2 = `Dùng Relative Clauses trong Task 2 để viết câu phức tạp, tránh lặp từ — đặc trưng band 6.5+.`;
const UNIT_5_RELATIVE_USAGE_SPOKEN = `Dùng Relative Clauses để mô tả chi tiết trong Part 3 — gộp hai câu ngắn thành một câu phức hợp tự nhiên.`;

const UNIT_6_REPORTED_THEORY = `Reported Speech: thay đổi (1) đại từ; (2) thì (backshift): Present→Past, Past→Past Perfect, will→would, can→could, may→might; (3) trạng từ: now→then, today→that day, here→there. Động từ tường thuật: say (that), tell sb (that), argue (that), claim (that), suggest (that), warn (that).

Sai: The researcher said that global inequality is getting worse every year.
Dung: The researcher said that global inequality was getting worse every year.
Meo: Khi động từ tường thuật ở quá khứ (said), thì trong mệnh đề phụ phải lùi một thì: 'is getting' → 'was getting'. Người Việt thường quên backshift.
Band impact: Backshift đúng trong Reported Speech — dấu hiệu ngữ pháp phức tạp giúp tăng điểm từ 6.0 lên 6.5.

Vi du nhanh:
1. The UN Secretary-General argued that immediate action on poverty was essential for global stability.
   - Tổng thư ký LHQ lập luận rằng hành động ngay lập tức về nghèo đói là thiết yếu.
2. Researchers warned that if deforestation continued, entire ecosystems would collapse within decades.
   - Các nhà nghiên cứu cảnh báo rằng nếu phá rừng tiếp tục, toàn bộ hệ sinh thái sẽ sụp đổ.
3. Some economists claimed that free trade had created more inequality than prosperity.
   - Một số nhà kinh tế tuyên bố rằng thương mại tự do đã tạo ra bất bình đẳng nhiều hơn thịnh vượng.`;

const UNIT_6_REPORTED_MISTAKES = `❌ The expert told that education was the key to reducing poverty. -> ✅ The expert said that education was the key to reducing poverty.
'Tell' phải có tân ngữ (tell somebody). 'Say' không cần tân ngữ. 'Told that' sai — phải là 'told us that' hoặc 'said that'.

❌ She said me that the policy had failed. -> ✅ She told me that the policy had failed.
'Said' không theo sau bởi tân ngữ người. 'Told me' = đúng. 'Said me' = sai.

❌ The report claimed that poverty is increasing in rural areas. -> ✅ The report claimed that poverty was increasing in rural areas.
Khi 'claimed' ở quá khứ → backshift: 'is increasing' → 'was increasing'.`;

const UNIT_6_REPORTED_USAGE_TASK2 = `Dùng Reported Speech trong Task 2 để giới thiệu và phản biện quan điểm — đặc trưng bài luận band 6.5+.`;
const UNIT_6_REPORTED_USAGE_SPOKEN = `Dùng Reported Speech trong Part 3 để thuật lại quan điểm từ nghiên cứu — nghe thuyết phục và học thuật.`;

const UNIT_6_CLEFT_THEORY = `Hai loại: (1) IT-cleft: It is/was + [nhấn mạnh] + that/who + [phần còn lại]. VD: 'It is education that holds the key to reducing poverty.' (2) WH-cleft: What + [mệnh đề] + is/was + [nhấn mạnh]. VD: 'What the world needs most is greater international cooperation.' Dùng để nhấn mạnh CHỦ THỂ, HÀNH ĐỘNG, THỜI GIAN, NGUYÊN NHÂN.

Sai: It is education that it reduces poverty most effectively.
Dung: It is education that reduces poverty most effectively.
Meo: Sau 'that' trong IT-cleft, KHÔNG lặp lại chủ ngữ. 'That IT reduces' sai vì 'that' đã là đại từ quan hệ làm chủ ngữ.
Band impact: Dùng đúng một Cleft Sentence trong Task 2 ngay lập tức tạo ấn tượng tốt — hiếm gặp dưới band 7.0.

Vi du nhanh:
1. It is international cooperation, not unilateral action, that offers the most hope for solving global problems.
   - Chính là hợp tác quốc tế, không phải hành động đơn phương, mang lại hy vọng lớn nhất.
2. What governments urgently need to do is invest more in green infrastructure and public transport.
   - Điều mà các chính phủ cần gấp làm là đầu tư nhiều hơn vào cơ sở hạ tầng xanh.
3. It was the lack of political will, not the absence of solutions, that allowed poverty to persist.
   - Chính là sự thiếu ý chí chính trị, không phải thiếu giải pháp, đã khiến nghèo đói kéo dài.`;

const UNIT_6_CLEFT_MISTAKES = `❌ It is the government that it must take responsibility for inequality. -> ✅ It is the government that must take responsibility for inequality.
Sau 'that' trong IT-cleft không lặp lại chủ ngữ. 'That must take' đúng; 'that IT must take' sai.

❌ What we need it is more investment in education. -> ✅ What we need is more investment in education.
WH-cleft: What + [mệnh đề] + is + [danh từ]. 'What we need IT is' thừa 'it'.

❌ It was in 2015 when the Paris Agreement was signed. -> ✅ It was in 2015 that the Paris Agreement was signed.
IT-cleft nhấn mạnh thời gian dùng 'that', không phải 'when'.`;

const UNIT_6_CLEFT_USAGE_TASK2 = `Dùng Cleft Sentences trong Task 2 để nhấn mạnh giải pháp hoặc nguyên nhân — câu văn ấn tượng, đặc trưng band 7.0.`;
const UNIT_6_CLEFT_USAGE_SPOKEN = `Dùng Cleft Sentences trong Part 3 để nhấn mạnh điểm quan trọng nhất của lập luận — thể hiện khả năng cấu trúc nâng cao tự nhiên.`;
// AUTO_GENERATED_UNIT_CONSTANTS_END
async function main() {
  console.log("Seeding database...");

  // ── Create test user ─────────────────────────────────────────────────────────
  const testUser = await prisma.user.upsert({
    where: { id: "test-user-001" },
    update: {
      // Explicitly reset on every seed run — prevents a migration or race
      // from leaving clerkId / email as NULL on subsequent seeds.
      clerkId: "clerk_test_user_001",
      email: "student@test.com",
      name: "Học viên Demo",
    },
    create: {
      id: "test-user-001",
      clerkId: "clerk_test_user_001",
      email: "student@test.com",
      name: "Học viên Demo",
      totalXp: 0,
      targetBand: 7.0,
      currentBand: null,
    },
  });
  console.log(`✅ Test user: ${testUser.email}`);

  // ── Create 5 Grammar Chapters ────────────────────────────────────────────────
  const chapters = await Promise.all([
    prisma.grammarChapter.upsert({
      where: { slug: "phan-loai-tu" },
      update: {},
      create: {
        slug: "phan-loai-tu",
        title: "Từ Loại",
        description: "Danh từ, Động từ, Tính từ, Trạng từ, Giới từ...",
        ieltsPurpose: "Xây dựng nền tảng từ vựng & cấu trúc câu cơ bản",
        communicativeGoals: ["identify word classes", "use correct word forms"],
        order: 1,
      },
    }),
    prisma.grammarChapter.upsert({
      where: { slug: "thi-va-phoi-hop-thi" },
      update: {},
      create: {
        slug: "thi-va-phoi-hop-thi",
        title: "Thì và Sự Phối Hợp Thì",
        description: "12 thì tiếng Anh, cách phối hợp thì trong câu",
        ieltsPurpose:
          "Mô tả xu hướng Task 1, kể chuyện & lập luận Task 2 và Speaking",
        communicativeGoals: [
          "describe trends",
          "narrate events",
          "make arguments",
        ],
        order: 2,
      },
    }),
    prisma.grammarChapter.upsert({
      where: { slug: "menh-de" },
      update: {},
      create: {
        slug: "menh-de",
        title: "Mệnh Đề",
        description: "Mệnh đề quan hệ, trạng ngữ, danh ngữ, câu điều kiện",
        ieltsPurpose: "Viết câu phức để tăng Grammar Range Band 7+",
        communicativeGoals: [
          "write complex sentences",
          "use conditionals",
          "add relative clauses",
        ],
        order: 3,
      },
    }),
    prisma.grammarChapter.upsert({
      where: { slug: "cau" },
      update: {},
      create: {
        slug: "cau",
        title: "Câu",
        description: "Câu bị động, tường thuật, so sánh, nhấn mạnh",
        ieltsPurpose: "Đa dạng hóa cấu trúc câu trong Writing Task 1 & 2",
        communicativeGoals: [
          "use passive voice",
          "report information",
          "make comparisons",
        ],
        order: 4,
      },
    }),
    prisma.grammarChapter.upsert({
      where: { slug: "tu-vung-hoc" },
      update: {},
      create: {
        slug: "tu-vung-hoc",
        title: "Từ Vựng Học",
        description: "Collocations, Phrasal verbs, Word formation",
        ieltsPurpose: "Nâng điểm Lexical Resource Writing & Speaking",
        communicativeGoals: [
          "use collocations",
          "apply phrasal verbs",
          "form new words",
        ],
        order: 5,
      },
    }),
  ]);

  console.log(`✅ Seeded ${chapters.length} grammar chapters`);

  // ── Lesson demo: Thì Hiện tại đơn ──────────────────────────────────────────
  const chapter2 = chapters[1]; // "Thì và Sự Phối Hợp Thì"



  // -- Auto-generated lessons/exercises (from app/grammar/grammar-units.json) -
  // -- Auto-generated lessons/exercises (from app/grammar/grammar-units.json) -
  // AUTO_GENERATED_LESSONS_START
  // Lesson 2 - Simple Present
  const lesson2 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-1-simple-present" },
    update: {
      theoryMd: UNIT_1_SIMPLE_PRESENT_THEORY,
      commonMistakes: UNIT_1_SIMPLE_PRESENT_MISTAKES,
      usageNoteTask2: UNIT_1_SIMPLE_PRESENT_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_SIMPLE_PRESENT_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-1-simple-present",
      chapterId: chapter2.id,
      title: "Simple Present",
      summary: "Thì hiện tại đơn",
      content: "Simple Present",
      theoryMd: UNIT_1_SIMPLE_PRESENT_THEORY,
      commonMistakes: UNIT_1_SIMPLE_PRESENT_MISTAKES,
      usageNoteTask2: UNIT_1_SIMPLE_PRESENT_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_SIMPLE_PRESENT_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Simple Present để viết luận Task 2 về các sự thật giáo dục, xu hướng chung — câu văn mạch lạc, đúng cấu trúc.`],
      ieltsSpeakingTags: [`Dùng Simple Present để trả lời câu hỏi Part 1 về thói quen học tập — nghe tự nhiên, không bị lẫn với thì tiếp diễn.`],
      isPublished: true,
      order: 2,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson2.title} (${lesson2.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson2.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson2.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi nói về thói quen học tập hàng ngày?`,
        options: [`She is reviews her vocabulary list every night.`, `She reviews her vocabulary list every night.`, `She reviewing her vocabulary list every night.`, `She review her vocabulary list every night.`],
        answer: `She reviews her vocabulary list every night.`,
        solution: `Chính xác! 'She' là ngôi 3 số ít → 'reviews' (thêm -s). Đây là thói quen hàng đêm nên dùng Simple Present.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson2.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chọn câu đúng để hoàn thành ý kiến IELTS Task 2: 'Many educators believe that homework _____ students develop discipline.'`,
        options: [`is help`, `helping`, `helps`, `help`],
        answer: `helps`,
        solution: `Đúng! 'Homework' là danh từ không đếm được, đóng vai ngôi 3 số ít → 'helps'. Câu này diễn tả sự thật chung.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson2.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi sai trong câu này (lỗi thật của học viên Việt Nam): 'In Vietnam, most parents wants their children to attend university because they believe education bring better job opportunities.'`,
        options: [`most parents want ... education brings`, `most parents wants ... education bring`, `most parents want ... education bring`, `most parents wants ... education brings`],
        answer: `most parents want ... education brings`,
        solution: `Giỏi lắm! 'Parents' là số nhiều → 'want' (không thêm -s). 'Education' là số ít → 'brings' (thêm -s). Hai chủ ngữ, hai quy tắc khác nhau!`,
        useAiGrading: true,
      },
      {
        lessonId: lesson2.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền dạng đúng của động từ trong ngoặc: 'An IELTS candidate usually _____ (spend) at least 3 months preparing, and the exam _____ (test) four skills: Listening, Reading, Writing and Speaking.'`,
        options: [`spends / tests`, `spend / test`, `spends / test`, `spend / tests`],
        answer: `spends / tests`,
        solution: `Hoàn hảo! 'A candidate' = ngôi 3 số ít → 'spends'. 'The exam' = ngôi 3 số ít → 'tests'. Luôn kiểm tra chủ ngữ trước khi chia động từ.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson2.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Xây dựng câu hoàn chỉnh từ các từ sau để tạo câu Task 2 tự nhiên (sắp xếp đúng thứ tự): [argue / educators / that / many / pressure / excessive / harm / academic / students]`,
        options: [`Many educators argue that excessive academic pressure harms students.`, `Many educators argue that students harm excessive academic pressure.`, `Educators many argue that academic excessive harms pressure students.`, `That many educators argue excessive academic pressure harms students.`],
        answer: `Many educators argue that excessive academic pressure harms students.`,
        solution: `Xuất sắc! Cấu trúc: Many + danh từ số nhiều + argue (không -s vì 'educators' là số nhiều) + that + mệnh đề (pressure → harms, thêm -s vì ngôi 3 số ít). Đây là câu Task 2 band 6.0+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson2: Simple Present`);

  // Lesson 3 - Present Continuous
  const lesson3 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-1-present-continuous" },
    update: {
      theoryMd: UNIT_1_PRESENT_CONTINUOUS_THEORY,
      commonMistakes: UNIT_1_PRESENT_CONTINUOUS_MISTAKES,
      usageNoteTask2: UNIT_1_PRESENT_CONTINUOUS_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_PRESENT_CONTINUOUS_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-1-present-continuous",
      chapterId: chapter2.id,
      title: "Present Continuous",
      summary: "Thì hiện tại tiếp diễn",
      content: "Present Continuous",
      theoryMd: UNIT_1_PRESENT_CONTINUOUS_THEORY,
      commonMistakes: UNIT_1_PRESENT_CONTINUOUS_MISTAKES,
      usageNoteTask2: UNIT_1_PRESENT_CONTINUOUS_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_PRESENT_CONTINUOUS_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Present Continuous để viết về xu hướng đang thay đổi trong giáo dục — cấu trúc phù hợp với Task 2 phong cách học thuật.`],
      ieltsSpeakingTags: [`Dùng Present Continuous để mô tả điều đang xảy ra trong cuộc sống học tập ngay lúc này — nghe tự nhiên, phân biệt được với Simple Present.`],
      isPublished: true,
      order: 3,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson3.title} (${lesson3.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson3.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson3.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi nói về điều đang xảy ra ngay lúc này trong lớp học?`,
        options: [`The teacher explains the grammar rule right now.`, `The teacher is explaining the grammar rule right now.`, `The teacher explaining the grammar rule right now.`, `The teacher is explain the grammar rule right now.`],
        answer: `The teacher is explaining the grammar rule right now.`,
        solution: `Đúng! 'Right now' báo hiệu hành động đang xảy ra ngay lúc này → Present Continuous: is + explaining.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson3.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chọn câu ĐÚNG để hoàn thành đoạn Task 2: 'Online education _____ increasingly popular as technology advances.'`,
        options: [`is becoming`, `becomes`, `becoming`, `are becoming`],
        answer: `is becoming`,
        solution: `Chính xác! 'Online education' là số ít, xu hướng đang thay đổi → 'is becoming'. Đây là cấu trúc Task 2 rất hay!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson3.id,
        type: "ERROR_CORRECTION",
        prompt: `Tìm và sửa lỗi: 'Nowadays, more parents are choosing homeschooling because they are think the traditional school system is not flexible enough.'`,
        options: [`are thinking → think (không dùng -ing với 'think')`, `are choosing → choose (không dùng -ing với 'choose')`, `is not → are not (chia số nhiều)`, `Câu đúng, không cần sửa.`],
        answer: `are thinking → think (không dùng -ing với 'think')`,
        solution: `Chính xác! 'Think' là stative verb (động từ chỉ trạng thái nhận thức) → không dùng dạng -ing. Phải dùng 'they think'. Nhưng 'are choosing' thì đúng vì 'choose' là action verb.`,
        useAiGrading: true,
      },
      {
        lessonId: lesson3.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng dạng động từ: 'According to recent data, the gap between rich and poor students _____ (widen), while the government _____ (invest) more in public schools to address this issue.'`,
        options: [`is widening / is investing`, `widens / invests`, `is widening / invests`, `widens / is investing`],
        answer: `is widening / is investing`,
        solution: `Xuất sắc! Cả hai đều là xu hướng đang diễn ra hiện tại → cả hai dùng Present Continuous. Câu này đạt chuẩn Task 2 band 6.0.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson3.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Ghép các từ thành câu Task 2 hoàn chỉnh, tự nhiên: [traditional / are / universities / rethinking / many / their / teaching / approach]`,
        options: [`Many traditional universities are rethinking their teaching approach.`, `Many universities traditional are their teaching approach rethinking.`, `Traditional many universities are rethinking approach their teaching.`, `Are many traditional universities rethinking their teaching approach.`],
        answer: `Many traditional universities are rethinking their teaching approach.`,
        solution: `Tuyệt vời! Cấu trúc hoàn hảo: Many + adj + noun [chủ ngữ] + are rethinking [Present Continuous] + their teaching approach [tân ngữ]. Đây là câu Task 2 band 6.5!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson3: Present Continuous`);

  // Lesson 4 - Simple Past
  const lesson4 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-1-simple-past" },
    update: {
      theoryMd: UNIT_1_SIMPLE_PAST_THEORY,
      commonMistakes: UNIT_1_SIMPLE_PAST_MISTAKES,
      usageNoteTask2: UNIT_1_SIMPLE_PAST_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_SIMPLE_PAST_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-1-simple-past",
      chapterId: chapter2.id,
      title: "Simple Past",
      summary: "Thì quá khứ đơn",
      content: "Simple Past",
      theoryMd: UNIT_1_SIMPLE_PAST_THEORY,
      commonMistakes: UNIT_1_SIMPLE_PAST_MISTAKES,
      usageNoteTask2: UNIT_1_SIMPLE_PAST_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_SIMPLE_PAST_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Simple Past để đưa ra ví dụ lịch sử hoặc trải nghiệm cá nhân trong Task 2 — làm lập luận thuyết phục hơn.`],
      ieltsSpeakingTags: [`Dùng Simple Past để kể câu chuyện trong Speaking Part 2 (cue card) — kể mạch lạc, đúng thì, tự nhiên như người bản ngữ.`],
      isPublished: true,
      order: 4,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson4.title} (${lesson4.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson4.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson4.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi kể về trải nghiệm học tập trong quá khứ?`,
        options: [`I go to an English center three times a week when I was in grade 10.`, `I went to an English center three times a week when I was in grade 10.`, `I was go to an English center three times a week when I was in grade 10.`, `I goed to an English center three times a week when I was in grade 10.`],
        answer: `I went to an English center three times a week when I was in grade 10.`,
        solution: `Đúng! 'When I was in grade 10' = quá khứ → Simple Past. 'Go' là động từ bất quy tắc → 'went', không phải 'goed'.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson4.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chọn câu đúng để viết ví dụ trong Task 2: 'Finland _____ its education system in the 1970s and _____ one of the best systems in the world.'`,
        options: [`reformed / became`, `reforms / becomes`, `reformed / becomes`, `reform / became`],
        answer: `reformed / became`,
        solution: `'In the 1970s' = thời điểm cụ thể trong quá khứ → cả hai động từ đều ở Simple Past: reformed, became.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson4.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi trong câu Part 2: 'Last year, I decided to take an online course because I didn't had enough money to attend a language center, so I teach myself using YouTube videos.'`,
        options: [`didn't had → didn't have; teach → taught`, `decided → decide; didn't had → didn't have`, `didn't had → hadn't; teach → taught`, `teach → was teaching; decided → was deciding`],
        answer: `didn't had → didn't have; teach → taught`,
        solution: `Chính xác! Hai lỗi: (1) 'didn't had' → 'didn't have' (sau didn't luôn dùng nguyên mẫu); (2) 'teach' → 'taught' (câu kể quá khứ, teach là động từ bất quy tắc: teach→taught).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson4.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'When I _____ (be) a child, my parents _____ (send) me to a bilingual school, which _____ (give) me a strong foundation in English.'`,
        options: [`was / sent / gave`, `was / sended / gave`, `were / sent / gived`, `was / sent / given`],
        answer: `was / sent / gave`,
        solution: `Hoàn hảo! 'was' (be→was/were), 'sent' (send→sent, bất quy tắc), 'gave' (give→gave, bất quy tắc). Ba động từ bất quy tắc phổ biến!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson4.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Xây dựng câu kể chuyện Part 2 hoàn chỉnh: [the / inspired / my / teacher / high school / English / me / pursue / to / career / an / international]`,
        options: [`My high school English teacher inspired me to pursue an international career.`, `My English teacher high school inspired me to an international career pursue.`, `To pursue an international career, my high school English teacher inspired me.`, `My high school inspired me English teacher to pursue an international career.`],
        answer: `My high school English teacher inspired me to pursue an international career.`,
        solution: `Tuyệt! Cấu trúc: My + noun phrase [chủ ngữ] + inspired [Simple Past] + me [tân ngữ] + to pursue [động từ nguyên mẫu] + an international career [tân ngữ]. Câu kể chuyện Part 2 band 6.0!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson4: Simple Past`);

  // Lesson 5 - Past Continuous
  const lesson5 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-1-past-continuous" },
    update: {
      theoryMd: UNIT_1_PAST_CONTINUOUS_THEORY,
      commonMistakes: UNIT_1_PAST_CONTINUOUS_MISTAKES,
      usageNoteTask2: UNIT_1_PAST_CONTINUOUS_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_PAST_CONTINUOUS_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-1-past-continuous",
      chapterId: chapter2.id,
      title: "Past Continuous",
      summary: "Thì quá khứ tiếp diễn",
      content: "Past Continuous",
      theoryMd: UNIT_1_PAST_CONTINUOUS_THEORY,
      commonMistakes: UNIT_1_PAST_CONTINUOUS_MISTAKES,
      usageNoteTask2: UNIT_1_PAST_CONTINUOUS_USAGE_TASK2,
      usageNoteSpoken: UNIT_1_PAST_CONTINUOUS_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Past Continuous trong Task 2 để tạo câu phức hợp mô tả tình huống quá khứ có chiều sâu.`],
      ieltsSpeakingTags: [`Dùng Past Continuous kết hợp Simple Past để kể câu chuyện Part 2 có bối cảnh sinh động — phân biệt hành động nền và hành động chính.`],
      isPublished: true,
      order: 5,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson5.title} (${lesson5.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson5.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson5.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào mô tả đúng bối cảnh câu chuyện học tập?`,
        options: [`The students took their English exam when the fire alarm rang.`, `The students were taking their English exam when the fire alarm rang.`, `The students were taking their English exam when the fire alarm was ringing.`, `The students took their English exam when the fire alarm was ringing.`],
        answer: `The students were taking their English exam when the fire alarm rang.`,
        solution: `Đúng! 'Were taking' = hành động đang diễn ra (dài hơn). 'Rang' = hành động xen vào (ngắn hơn). Đây là cấu trúc WHILE/WHEN chuẩn.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson5.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng: 'While _____ for the scholarship interview, she _____ that she had forgotten her documents at home.'`,
        options: [`she was waiting / realized`, `she waited / was realizing`, `she was waiting / was realizing`, `she waited / realized`],
        answer: `she was waiting / realized`,
        solution: `Chính xác! 'While she was waiting' = hành động nền đang tiếp diễn. 'Realized' = khoảnh khắc nhận ra (ngắn) → Simple Past.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson5.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'While the teacher was explained the grammar rule, some students were texted on their phones, which annoyed her greatly.'`,
        options: [`was explained → was explaining; were texted → were texting`, `was explained → explained; were texted → were texting`, `was explained → was explaining; were texted → texted`, `Câu đúng, không cần sửa.`],
        answer: `was explained → was explaining; were texted → were texting`,
        solution: `Chính xác! 'Was explained' = bị động (passive), không phải Past Continuous. Phải là 'was explaining' (chủ động). Tương tự 'were texted' → 'were texting' (học sinh chủ động nhắn tin).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson5.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'At this time last year, I _____ (prepare) for my university entrance exam. I _____ (study) 10 hours a day, so when my friend _____ (invite) me to a party, I had to decline.'`,
        options: [`was preparing / was studying / invited`, `prepared / studied / was inviting`, `was preparing / studied / was inviting`, `prepared / was studying / invited`],
        answer: `was preparing / was studying / invited`,
        solution: `Hoàn hảo! 'At this time last year' = thời điểm cụ thể → 'was preparing'. 'Was studying' = hành động kéo dài. 'Invited' = hành động xen vào ngắn → Simple Past.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson5.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu kể chuyện Part 2 hoàn chỉnh: [revision / my / I / final / doing / was / when / called / scholarship / the / committee / to / inform / me / I / won / had]`,
        options: [`I was doing my final revision when the scholarship committee called to inform me I had won.`, `I doing was my final revision when called the scholarship committee to inform me I had won.`, `When I was doing my final revision, called the scholarship committee to inform me I had won.`, `The scholarship committee called when I was doing my final revision to inform me I won.`],
        answer: `I was doing my final revision when the scholarship committee called to inform me I had won.`,
        solution: `Xuất sắc! Câu kể chuyện hoàn hảo: Past Continuous (was doing) + when + Simple Past (called) + Past Perfect (had won) trong mệnh đề bổ sung. Đây là câu Part 2 band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson5: Past Continuous`);

  // Lesson 6 - Present Perfect
  const lesson6 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-2-present-perfect" },
    update: {
      theoryMd: UNIT_2_PRESENT_PERFECT_THEORY,
      commonMistakes: UNIT_2_PRESENT_PERFECT_MISTAKES,
      usageNoteTask2: UNIT_2_PRESENT_PERFECT_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PRESENT_PERFECT_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-2-present-perfect",
      chapterId: chapter2.id,
      title: "Present Perfect",
      summary: "Thì hiện tại hoàn thành",
      content: "Present Perfect",
      theoryMd: UNIT_2_PRESENT_PERFECT_THEORY,
      commonMistakes: UNIT_2_PRESENT_PERFECT_MISTAKES,
      usageNoteTask2: UNIT_2_PRESENT_PERFECT_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PRESENT_PERFECT_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Present Perfect trong Task 2 để nói về xu hướng từ quá khứ đến hiện tại — đặc biệt trong mở bài và kết bài.`],
      ieltsSpeakingTags: [`Dùng Present Perfect để nói về kinh nghiệm làm việc và công nghệ trong Part 1 — phân biệt 'I have used' vs 'I used' một cách tự nhiên.`],
      isPublished: true,
      order: 6,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson6.title} (${lesson6.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson6.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson6.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Examiner hỏi: 'Do you use technology for work?' — Câu trả lời nào đúng ngữ pháp nhất?`,
        options: [`Yes, I used many digital tools since I started my job.`, `Yes, I have used many digital tools since I started my job.`, `Yes, I am using many digital tools since I started my job.`, `Yes, I was using many digital tools since I started my job.`],
        answer: `Yes, I have used many digital tools since I started my job.`,
        solution: `Đúng! 'Since I started my job' = từ khi bắt đầu đến nay → Present Perfect 'have used'. Trải nghiệm kéo dài đến hiện tại.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson6.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chọn câu đúng cho mở bài Task 2: 'In recent years, artificial intelligence _____ the nature of work in almost every industry.'`,
        options: [`transformed`, `has transformed`, `is transforming`, `transforms`],
        answer: `has transformed`,
        solution: `'In recent years' = xu hướng từ quá khứ đến nay → Present Perfect 'has transformed'. Đây là cấu trúc mở bài Task 2 chuyên nghiệp.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson6.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'Remote working has became increasingly common since the pandemic started in 2020, and many employees have discovered that they are more productive at home.'`,
        options: [`has became → has become`, `has became → had become`, `have discovered → discovered`, `Câu đúng, không cần sửa.`],
        answer: `has became → has become`,
        solution: `'Become' là động từ bất quy tắc: become → became → become (V3). Không phải 'became' sau 'has'. V3 của become = become (giống nguyên mẫu).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson6.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'I _____ (work) in the tech industry for five years, and during that time the field _____ (change) dramatically. I _____ (just / update) my skills by completing an AI certification course.'`,
        options: [`have worked / has changed / have just updated`, `worked / changed / just updated`, `have worked / changed / have just updated`, `worked / has changed / just updated`],
        answer: `have worked / has changed / have just updated`,
        solution: `Hoàn hảo! 'For five years' → Present Perfect 'have worked'. 'Dramatically' + xu hướng → 'has changed'. 'Just' → 'have just updated'. Ba cách dùng Present Perfect khác nhau trong một đoạn!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson6.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 học thuật: [has / number / the / dramatically / remote / of / risen / workers / past / over / the / decade]`,
        options: [`The number of remote workers has risen dramatically over the past decade.`, `The number of remote workers dramatically has risen over the past decade.`, `Over the past decade has the number of remote workers risen dramatically.`, `The number has risen dramatically of remote workers over the past decade.`],
        answer: `The number of remote workers has risen dramatically over the past decade.`,
        solution: `Câu Task 2 hoàn hảo! Cấu trúc: The number of [noun] + has risen [Present Perfect] + dramatically [trạng từ] + over the past decade [thời gian]. Band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson6: Present Perfect`);

  // Lesson 7 - Past Perfect
  const lesson7 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-2-past-perfect" },
    update: {
      theoryMd: UNIT_2_PAST_PERFECT_THEORY,
      commonMistakes: UNIT_2_PAST_PERFECT_MISTAKES,
      usageNoteTask2: UNIT_2_PAST_PERFECT_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PAST_PERFECT_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-2-past-perfect",
      chapterId: chapter2.id,
      title: "Past Perfect",
      summary: "Thì quá khứ hoàn thành",
      content: "Past Perfect",
      theoryMd: UNIT_2_PAST_PERFECT_THEORY,
      commonMistakes: UNIT_2_PAST_PERFECT_MISTAKES,
      usageNoteTask2: UNIT_2_PAST_PERFECT_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PAST_PERFECT_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Past Perfect trong Task 2 để lập luận về nguyên nhân-kết quả trong quá khứ — câu văn phức tạp và học thuật hơn.`],
      ieltsSpeakingTags: [`Dùng Past Perfect để kể chuyện Part 2 có chiều sâu thời gian — nêu được trình tự 'cái gì xảy ra trước, cái gì sau' một cách rõ ràng.`],
      isPublished: true,
      order: 7,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson7.title} (${lesson7.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson7.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson7.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi kể thứ tự sự kiện: 'By the time the manager called a meeting, the tech team _____ the problem.'`,
        options: [`already solved`, `had already solved`, `has already solved`, `was already solving`],
        answer: `had already solved`,
        solution: `'By the time' + Simple Past (called) → hành động xảy ra trước đó dùng Past Perfect: 'had already solved'.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson7.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Task 2 — Câu nào diễn đạt đúng: Nhiều công ty thất bại vì không kịp thích nghi với công nghệ?`,
        options: [`Many companies failed because they didn't adapt to new technology.`, `Many companies failed because they hadn't adapted to new technology.`, `Many companies had failed because they didn't adapt to new technology.`, `Many companies were failing because they hadn't adapted to new technology.`],
        answer: `Many companies failed because they hadn't adapted to new technology.`,
        solution: `Đúng! 'Failed' là kết quả (Simple Past). 'Hadn't adapted' là nguyên nhân xảy ra TRƯỚC → Past Perfect. Nhấn mạnh: vì đã không thích nghi từ trước nên mới thất bại.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson7.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'When the startup finally received funding, the founders already spent most of their savings on product development, so they were relieved.'`,
        options: [`already spent → had already spent`, `received → had received`, `were relieved → had been relieved`, `Câu đúng, không cần sửa.`],
        answer: `already spent → had already spent`,
        solution: `Đúng! 'Spending savings' xảy ra TRƯỚC 'received funding' → cần Past Perfect 'had already spent'. 'Received' là Simple Past cho sự kiện chính.`,
        useAiGrading: true,
      },
      {
        lessonId: lesson7.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng dạng động từ: 'She got the promotion because she _____ (exceed) her targets for three consecutive years and _____ (complete) a leadership training program before the position became available.'`,
        options: [`had exceeded / had completed`, `exceeded / completed`, `had exceeded / completed`, `exceeded / had completed`],
        answer: `had exceeded / had completed`,
        solution: `Hoàn hảo! Cả hai nguyên nhân đều xảy ra TRƯỚC khi cô ấy được thăng chức → cả hai dùng Past Perfect.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson7.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Part 2 phức tạp: [had / the / I / applied / job / when / already / company / filled / position / the / I / realized]`,
        options: [`When I applied for the job, I realized the company had already filled the position.`, `I had applied for the job when I realized the company already filled the position.`, `When I realized the company had already filled the position, I applied for the job.`, `The company had filled the position when I applied and realized already.`],
        answer: `When I applied for the job, I realized the company had already filled the position.`,
        solution: `Xuất sắc! 'Applied' và 'realized' = Simple Past (hai hành động gần như đồng thời). 'Had already filled' = Past Perfect (xảy ra trước cả hai). Ba thì trong một câu — band 6.5!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson7: Past Perfect`);

  // Lesson 8 - Future (will / going to)
  const lesson8 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-2-past-future" },
    update: {
      theoryMd: UNIT_2_PAST_FUTURE_THEORY,
      commonMistakes: UNIT_2_PAST_FUTURE_MISTAKES,
      usageNoteTask2: UNIT_2_PAST_FUTURE_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PAST_FUTURE_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-2-past-future",
      chapterId: chapter2.id,
      title: "Future (will / going to)",
      summary: "Thì tương lai — will và be going to",
      content: "Future (will / going to)",
      theoryMd: UNIT_2_PAST_FUTURE_THEORY,
      commonMistakes: UNIT_2_PAST_FUTURE_MISTAKES,
      usageNoteTask2: UNIT_2_PAST_FUTURE_USAGE_TASK2,
      usageNoteSpoken: UNIT_2_PAST_FUTURE_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng 'will' để đưa ra dự đoán học thuật trong Task 2 — kết hợp với trạng từ: probably, likely, certainly để điều tiết mức độ chắc chắn.`],
      ieltsSpeakingTags: [`Phân biệt 'will' (dự đoán, quyết định tức thì) và 'going to' (kế hoạch đã có, dự đoán dựa trên bằng chứng) để trả lời Part 3 tự nhiên và chính xác.`],
      isPublished: true,
      order: 8,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson8.title} (${lesson8.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson8.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson8.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Examiner hỏi Part 3: 'Do you think AI will replace human workers?' — Câu trả lời nào đúng ngữ pháp?`,
        options: [`I think AI will to replace some workers, but not all.`, `I think AI will replace some workers, but not all.`, `I think AI is going to to replace some workers, but not all.`, `I think AI replaces some workers, but not all.`],
        answer: `I think AI will replace some workers, but not all.`,
        solution: `Đúng! Dự đoán dựa trên quan điểm → 'will + V nguyên mẫu (không to)'. Không bao giờ 'will to + V'.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson8.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Task 2 nào đúng: 'If governments _____ to regulate AI, society _____ serious consequences.'`,
        options: [`will fail / will face`, `fail / will face`, `will fail / faces`, `fail / faces`],
        answer: `fail / will face`,
        solution: `Đúng! Mệnh đề 'if' → Simple Present (fail), không dùng will. Mệnh đề chính → will face (kết quả tương lai).`,
        useAiGrading: false,
      },
      {
        lessonId: lesson8.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'As technology will continue to evolve, more workers will to need to reskill themselves. Companies are going to probably invest more in employee training programs.'`,
        options: [`will continue → continues; will to need → will need; going to probably → will probably`, `will continue → will continues; will to need → will need`, `will to need → will need only (câu đầu đúng, câu sau đúng)`, `Câu đúng, không cần sửa.`],
        answer: `will continue → continues; will to need → will need; going to probably → will probably`,
        solution: `Ba lỗi! (1) 'As + will continue' → 'as continues' (mệnh đề thời gian). (2) 'will to need' → 'will need' (không có 'to' sau will). (3) 'going to probably' → 'will probably' ('probably' đi tự nhiên hơn với 'will').`,
        useAiGrading: true,
      },
      {
        lessonId: lesson8.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng (chọn will hoặc going to + dạng đúng của động từ): 'I _____ (attend) a digital marketing conference next week — I registered last month. I think it _____ (be) very useful for my career development.'`,
        options: [`am going to attend / will be`, `will attend / am going to be`, `will attend / will be`, `am going to attend / am going to be`],
        answer: `am going to attend / will be`,
        solution: `'Am going to attend' = kế hoạch đã đăng ký từ trước. 'Will be' = dự đoán/quan điểm cá nhân. Đây chính xác là sự khác biệt giữa will và going to!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson8.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 dự đoán học thuật: [artificial / likely / will / intelligence / reshape / the / job / market / significantly / next / over / the / decade]`,
        options: [`Artificial intelligence will likely reshape the job market significantly over the next decade.`, `Artificial intelligence likely will reshape significantly the job market over the next decade.`, `Artificial intelligence will reshape likely the job market significantly over the next decade.`, `Over the next decade, artificial intelligence the job market will likely reshape significantly.`],
        answer: `Artificial intelligence will likely reshape the job market significantly over the next decade.`,
        solution: `Câu Task 2 chuẩn mực! Trật tự trạng từ: will + likely (trạng từ tình thái) + V + tân ngữ + trạng từ cách thức + cụm thời gian. Band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson8: Future (will / going to)`);

  // Lesson 9 - Modal — Ability (can / could)
  const lesson9 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-3-modal-ability" },
    update: {
      theoryMd: UNIT_3_MODAL_ABILITY_THEORY,
      commonMistakes: UNIT_3_MODAL_ABILITY_MISTAKES,
      usageNoteTask2: UNIT_3_MODAL_ABILITY_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_MODAL_ABILITY_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-3-modal-ability",
      chapterId: chapter2.id,
      title: "Modal — Ability (can / could)",
      summary: "Động từ khuyết thiếu — Khả năng",
      content: "Modal — Ability (can / could)",
      theoryMd: UNIT_3_MODAL_ABILITY_THEORY,
      commonMistakes: UNIT_3_MODAL_ABILITY_MISTAKES,
      usageNoteTask2: UNIT_3_MODAL_ABILITY_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_MODAL_ABILITY_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng can/could trong Task 2 để đưa ra đề xuất giải pháp — câu văn học thuật, tránh dùng 'can' quá nhiều.`],
      ieltsSpeakingTags: [`Dùng can/could linh hoạt trong Part 3 để nói về khả năng của con người và công nghệ — tránh câu trả lời đơn điệu chỉ dùng 'can'.`],
      isPublished: true,
      order: 9,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson9.title} (${lesson9.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson9.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson9.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi nói về khả năng của công nghệ hiện đại?`,
        options: [`AI can to process data much faster than humans.`, `AI can processed data much faster than humans.`, `AI can process data much faster than humans.`, `AI cans process data much faster than humans.`],
        answer: `AI can process data much faster than humans.`,
        solution: `Đúng! Modal + V nguyên mẫu: 'can process'. Modal không chia theo ngôi (không thêm -s) và không theo sau bởi 'to'.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson9.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chọn câu Task 2 đúng về đề xuất giải pháp: 'Companies _____ offer flexible working hours to attract and retain talented employees.'`,
        options: [`can to`, `could`, `could to`, `cans`],
        answer: `could`,
        solution: `'Could' diễn đạt đề xuất lịch sự, khả năng lý thuyết — phù hợp hơn 'can' trong văn phong học thuật Task 2. Và không có 'to' sau could.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson9.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'Before smartphones existed, people couldn't accessed information instantly. Now, anyone can to look up any fact within seconds.'`,
        options: [`couldn't accessed → couldn't access; can to look up → can look up`, `couldn't accessed → couldn't accessed; can to look up → can look up`, `couldn't accessed → could accessed; can to look up → can to look up`, `Câu đúng, không cần sửa.`],
        answer: `couldn't accessed → couldn't access; can to look up → can look up`,
        solution: `Hai lỗi cùng một kiểu: sau modal (couldn't, can) → luôn dùng V nguyên mẫu. 'Couldn't access' (không -ed). 'Can look up' (không 'to').`,
        useAiGrading: true,
      },
      {
        lessonId: lesson9.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền can hoặc could + dạng đúng: 'When my father started his career in the 1990s, he _____ (not / use) a computer at all. Today, even young children _____ (navigate) complex digital platforms with ease.'`,
        options: [`couldn't use / can navigate`, `can't use / could navigate`, `couldn't use / could navigate`, `can't use / can navigate`],
        answer: `couldn't use / can navigate`,
        solution: `Đúng! Quá khứ → 'couldn't use'. Hiện tại → 'can navigate'. Và cả hai đều là modal + V nguyên mẫu (không to, không -s).`,
        useAiGrading: false,
      },
      {
        lessonId: lesson9.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 đề xuất giải pháp: [literacy / programs / digital / provide / governments / could / to / workers / free / all]`,
        options: [`Governments could provide free digital literacy programs to all workers.`, `Governments could to provide free digital literacy programs to all workers.`, `Governments could provide digital literacy free programs to all workers.`, `Free digital literacy programs could governments provide to all workers.`],
        answer: `Governments could provide free digital literacy programs to all workers.`,
        solution: `Câu Task 2 đề xuất hoàn hảo! Governments [chủ ngữ] + could [modal] + provide [V nguyên mẫu] + free digital literacy programs [tân ngữ] + to all workers [giới từ]. Band 6.0+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson9: Modal — Ability (can / could)`);

  // Lesson 10 - Modal — Possibility (may / might)
  const lesson10 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-3-modal-possibility" },
    update: {
      theoryMd: UNIT_3_MODAL_POSSIBILITY_THEORY,
      commonMistakes: UNIT_3_MODAL_POSSIBILITY_MISTAKES,
      usageNoteTask2: UNIT_3_MODAL_POSSIBILITY_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_MODAL_POSSIBILITY_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-3-modal-possibility",
      chapterId: chapter2.id,
      title: "Modal — Possibility (may / might)",
      summary: "Động từ khuyết thiếu — Khả năng xảy ra",
      content: "Modal — Possibility (may / might)",
      theoryMd: UNIT_3_MODAL_POSSIBILITY_THEORY,
      commonMistakes: UNIT_3_MODAL_POSSIBILITY_MISTAKES,
      usageNoteTask2: UNIT_3_MODAL_POSSIBILITY_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_MODAL_POSSIBILITY_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng may/might trong Task 2 để điều tiết mức độ chắc chắn của lập luận — thể hiện tư duy phê phán học thuật.`],
      ieltsSpeakingTags: [`Dùng may/might để đưa ra ý kiến thận trọng trong Part 3 về các vấn đề môi trường và xã hội — tránh nghe quá tự tin hoặc thiếu căn cứ.`],
      isPublished: true,
      order: 10,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson10.title} (${lesson10.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson10.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson10.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào đúng khi đưa ra dự đoán thận trọng về môi trường trong Part 3?`,
        options: [`Deforestation might leads to species extinction.`, `Deforestation might lead to species extinction.`, `Deforestation might to lead to species extinction.`, `Deforestation mights lead to species extinction.`],
        answer: `Deforestation might lead to species extinction.`,
        solution: `Đúng! might + V nguyên mẫu (không to, không -s): 'might lead'. Dùng 'might' (không chắc chắn) phù hợp cho dự đoán môi trường.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson10.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Task 2 — Câu nào học thuật nhất khi nói về hậu quả của ô nhiễm?`,
        options: [`Air pollution will definitely destroy public health.`, `Air pollution may have serious consequences for public health.`, `Air pollution might to seriously affect public health.`, `Air pollution might seriously affects public health.`],
        answer: `Air pollution may have serious consequences for public health.`,
        solution: `Đúng! 'May have' = khả năng xảy ra, thận trọng. 'Have serious consequences for' = colocation học thuật đẹp. Câu này band 6.5.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson10.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'Some environmentalists argue that plastic pollution mightn't be solved without a global ban on single-use plastics, while others believe technology may offers alternative solutions.'`,
        options: [`mightn't → might not; may offers → may offer`, `mightn't → might not; may offers → may offered`, `mightn't → mustn't; may offers → may offer`, `Câu đúng, không cần sửa.`],
        answer: `mightn't → might not; may offers → may offer`,
        solution: `Hai lỗi: (1) 'mightn't' không tồn tại → 'might not'. (2) 'may offers' sai → 'may offer' (modal + V nguyên mẫu, không -s).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson10.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền may hoặc might + dạng đúng: 'Renewable energy _____ (become) cheaper than fossil fuels within a decade, which _____ (encourage) more governments to invest in green infrastructure.'`,
        options: [`may become / might encourage`, `may becomes / might encourages`, `might became / may encourage`, `may become / might encourages`],
        answer: `may become / might encourage`,
        solution: `Hoàn hảo! Cả hai là dự đoán không chắc chắn → may/might + V nguyên mẫu (không -s, không -ed). Dùng cả may và might trong một đoạn tạo sự đa dạng ngữ pháp.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson10.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 thận trọng: [carbon / governments / might / taxes / imposing / face / public / by / significant / resistance]`,
        options: [`Governments might face significant public resistance by imposing carbon taxes.`, `Governments might to face significant public resistance by imposing carbon taxes.`, `Governments might faced significant public resistance by imposing carbon taxes.`, `By imposing carbon taxes governments might facing significant public resistance.`],
        answer: `Governments might face significant public resistance by imposing carbon taxes.`,
        solution: `Câu Task 2 học thuật cao! Governments [chủ ngữ] + might [modal] + face [V nguyên mẫu] + significant public resistance [tân ngữ] + by imposing carbon taxes [cụm giới từ chỉ cách thức]. Band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson10: Modal — Possibility (may / might)`);

  // Lesson 11 - Passive Voice
  const lesson11 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-3-passive" },
    update: {
      theoryMd: UNIT_3_PASSIVE_THEORY,
      commonMistakes: UNIT_3_PASSIVE_MISTAKES,
      usageNoteTask2: UNIT_3_PASSIVE_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_PASSIVE_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-3-passive",
      chapterId: chapter2.id,
      title: "Passive Voice",
      summary: "Câu bị động",
      content: "Passive Voice",
      theoryMd: UNIT_3_PASSIVE_THEORY,
      commonMistakes: UNIT_3_PASSIVE_MISTAKES,
      usageNoteTask2: UNIT_3_PASSIVE_USAGE_TASK2,
      usageNoteSpoken: UNIT_3_PASSIVE_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Passive trong Task 1 khi mô tả quy trình, và Task 2 khi cần văn phong học thuật — tránh lặp 'people/governments do...' quá nhiều.`],
      ieltsSpeakingTags: [`Dùng Passive Voice trong Part 3 để nói về các vấn đề xã hội mà không cần chỉ đích danh ai — nghe khách quan và học thuật hơn.`],
      isPublished: true,
      order: 11,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson11.title} (${lesson11.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson11.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson11.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu bị động nào đúng: 'The environmental report _____ by scientists at the UN last week.'`,
        options: [`was published`, `is published`, `published`, `was publish`],
        answer: `was published`,
        solution: `'Last week' = quá khứ. Passive quá khứ: was/were + V3. 'Publish' → V3 = published. 'Was published' = đúng.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson11.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu bị động học thuật nào phù hợp nhất cho Task 2: 'Millions of tonnes of carbon _____ into the atmosphere each year.'`,
        options: [`releases`, `are released`, `is released`, `are releasing`],
        answer: `are released`,
        solution: `'Millions of tonnes' = số nhiều → 'are'. Chủ ngữ là vật bị tác động → Passive: are + V3 (released). Đây là câu Task 2 học thuật chuẩn.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson11.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'A new international climate agreement will signed at the summit next month. Several key proposals have already been submit for review.'`,
        options: [`will signed → will be signed; been submit → been submitted`, `will signed → was signed; been submit → been submitted`, `will signed → will be signed; been submit → been submit`, `Câu đúng, không cần sửa.`],
        answer: `will signed → will be signed; been submit → been submitted`,
        solution: `Hai lỗi: (1) 'will signed' thiếu 'be' → 'will be signed' (Passive tương lai: will + be + V3). (2) 'been submit' → 'been submitted' (V3 của submit = submitted, thêm -ted).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson11.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng dạng Passive: 'According to the report, 1 billion trees _____ (plant) globally since 2010. Currently, a new reforestation project _____ (develop) in Southeast Asia.'`,
        options: [`have been planted / is being developed`, `have been planted / is being developing`, `were planted / is developed`, `have planted / are being developed`],
        answer: `have been planted / is being developed`,
        solution: `Hoàn hảo! 'Since 2010' → Present Perfect Passive: have been planted. 'Currently' → Present Continuous Passive: is being developed. Hai dạng Passive phức trong một câu!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson11.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 học thuật dùng Passive: [measures / urgent / must / to / taken / protect / be / biodiversity / global]`,
        options: [`Urgent measures must be taken to protect global biodiversity.`, `Urgent measures must taken to be protect global biodiversity.`, `Urgent measures must be take to protect global biodiversity.`, `Urgent measures be must taken to protect global biodiversity.`],
        answer: `Urgent measures must be taken to protect global biodiversity.`,
        solution: `Câu Task 2 kết luận hoàn hảo! Modal Passive: must + be + V3 (taken). 'Urgent measures' làm chủ ngữ nhấn mạnh sự cấp bách. Band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson11: Passive Voice`);

  // Lesson 12 - Conditional Type 1
  const lesson12 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-4-conditional-1" },
    update: {
      theoryMd: UNIT_4_CONDITIONAL_1_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_1_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_1_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_1_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-4-conditional-1",
      chapterId: chapter2.id,
      title: "Conditional Type 1",
      summary: "Câu điều kiện loại 1 — Có thật ở hiện tại/tương lai",
      content: "Conditional Type 1",
      theoryMd: UNIT_4_CONDITIONAL_1_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_1_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_1_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_1_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Conditional Type 1 trong Task 2 để đề xuất giải pháp và dự đoán kết quả — đặc trưng band 6.0+.`],
      ieltsSpeakingTags: [`Dùng Conditional Type 1 trong Part 3 để lập luận nhân quả về các vấn đề toàn cầu.`],
      isPublished: true,
      order: 12,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson12.title} (${lesson12.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson12.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson12.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Conditional Type 1 nào đúng?`,
        options: [`If the government will act quickly, the crisis will be avoided.`, `If the government acts quickly, the crisis will be avoided.`, `If the government acts quickly, the crisis would be avoided.`, `If the government act quickly, the crisis will be avoided.`],
        answer: `If the government acts quickly, the crisis will be avoided.`,
        solution: `Đúng! If + Simple Present (acts — ngôi 3 số ít thêm -s) + will + V nguyên mẫu. Không có will trong mệnh đề if.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson12.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Hoàn thành câu Task 2: 'Economic growth _____ if developing nations _____ access to advanced technology.'`,
        options: [`will accelerate / gain`, `will accelerate / will gain`, `would accelerate / gain`, `accelerates / gain`],
        answer: `will accelerate / gain`,
        solution: `'Will accelerate' ở mệnh đề chính. 'Gain' (Simple Present) ở mệnh đề if. Type 1 hoàn chỉnh.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson12.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'If countries will not reduce plastic waste, the ocean will become uninhabitable for marine species.'`,
        options: [`will not reduce → do not reduce`, `will not reduce → would not reduce`, `will become → would become`, `Câu đúng, không cần sửa.`],
        answer: `will not reduce → do not reduce`,
        solution: `'Will not reduce' trong mệnh đề if sai → 'do not reduce' (Simple Present phủ định).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson12.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'If more nations _____ (sign) the trade agreement, global poverty _____ (likely / reduce) significantly.'`,
        options: [`sign / will likely be reduced`, `will sign / will likely be reduced`, `sign / is likely reduced`, `signs / will likely reduce`],
        answer: `sign / will likely be reduced`,
        solution: `'Sign' (Simple Present, số nhiều — không -s) trong if. 'Will likely be reduced' = Passive tương lai + likely. Kết hợp Conditional + Passive + likely = band 6.5!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson12.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2: [education / if / invest / governments / quality / will / in / narrow / the / wealth / gap / more]`,
        options: [`If governments invest more in quality education, the wealth gap will narrow.`, `If governments will invest more in quality education, the wealth gap will narrow.`, `If governments invest more in quality education, the wealth gap narrows.`, `The wealth gap will narrow if governments will invest more in quality education.`],
        answer: `If governments invest more in quality education, the wealth gap will narrow.`,
        solution: `Câu Task 2 lập luận hoàn hảo! If + invest (Simple Present, không will) → will + narrow. Band 6.0+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson12: Conditional Type 1`);

  // Lesson 13 - Conditional Type 2
  const lesson13 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-4-conditional-2" },
    update: {
      theoryMd: UNIT_4_CONDITIONAL_2_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_2_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_2_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_2_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-4-conditional-2",
      chapterId: chapter2.id,
      title: "Conditional Type 2",
      summary: "Câu điều kiện loại 2 — Không có thật ở hiện tại",
      content: "Conditional Type 2",
      theoryMd: UNIT_4_CONDITIONAL_2_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_2_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_2_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_2_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Type 2 trong Task 2 để lập luận về tình huống lý tưởng hoặc phản biện.`],
      ieltsSpeakingTags: [`Dùng Type 2 trong Part 3 để đưa ra ý kiến giả thuyết — thể hiện tư duy phân tích cao.`],
      isPublished: true,
      order: 13,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson13.title} (${lesson13.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson13.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson13.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Conditional Type 2 nào đúng?`,
        options: [`If more people would use public transport, air pollution would decrease.`, `If more people used public transport, air pollution would decrease.`, `If more people use public transport, air pollution would decrease.`, `If more people used public transport, air pollution will decrease.`],
        answer: `If more people used public transport, air pollution would decrease.`,
        solution: `Đúng! Type 2: If + Past Simple (used) + would + V nguyên mẫu (decrease). Giả thuyết — hiện tại không đủ người dùng phương tiện công cộng.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson13.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Part 3 — 'If you could change one thing about global economic policy, what would it be?' Câu trả lời nào đúng?`,
        options: [`If I can change one thing, I will reduce trade barriers.`, `If I could change one thing, I would reduce trade barriers between developing nations.`, `If I would change one thing, I would reduce trade barriers.`, `If I changed one thing, I will reduce trade barriers.`],
        answer: `If I could change one thing, I would reduce trade barriers between developing nations.`,
        solution: `'If I could' = giả thuyết (could = Past Simple của can). 'I would reduce' = mệnh đề chính. Câu trả lời Part 3 band 6.0!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson13.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'If wealthy nations would share their medical technology, developing countries would overcome health crises more effectively. If there was more international solidarity, fewer people will die.'`,
        options: [`would share → shared; will die → would die; was → were`, `would share → shared only`, `will die → would die only`, `Câu đúng, không cần sửa.`],
        answer: `would share → shared; will die → would die; was → were`,
        solution: `Ba điểm: (1) would share → shared (if-clause dùng Past Simple). (2) will die → would die (mệnh đề chính Type 2). (3) was → were (văn trang trọng).`,
        useAiGrading: true,
      },
      {
        lessonId: lesson13.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'If the international community _____ (adopt) a unified approach to cybersecurity, global digital infrastructure _____ (be) far more secure.'`,
        options: [`adopted / would be`, `would adopt / would be`, `adopts / would be`, `adopted / will be`],
        answer: `adopted / would be`,
        solution: `'Adopted' = Past Simple trong if-clause (Type 2). 'Would be' = kết quả giả thuyết. Câu Task 2 học thuật!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson13.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Part 3: [were / nations / all / if / committed / equality / gender / to / be / disparities / global / would / reduce]`,
        options: [`If all nations were committed to gender equality, global disparities would reduce.`, `If all nations would be committed to gender equality, global disparities would reduce.`, `If all nations were committed to gender equality, global disparities will reduce.`, `All nations if were committed to gender equality, global disparities would reduce.`],
        answer: `If all nations were committed to gender equality, global disparities would reduce.`,
        solution: `Hoàn hảo! 'Were committed' = Past Simple Passive trong if-clause (Type 2). 'Would reduce' = mệnh đề chính. Band 6.5+!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson13: Conditional Type 2`);

  // Lesson 14 - Conditional Type 3
  const lesson14 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-4-conditional-3" },
    update: {
      theoryMd: UNIT_4_CONDITIONAL_3_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_3_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_3_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_3_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-4-conditional-3",
      chapterId: chapter2.id,
      title: "Conditional Type 3",
      summary: "Câu điều kiện loại 3 — Không có thật trong quá khứ",
      content: "Conditional Type 3",
      theoryMd: UNIT_4_CONDITIONAL_3_THEORY,
      commonMistakes: UNIT_4_CONDITIONAL_3_MISTAKES,
      usageNoteTask2: UNIT_4_CONDITIONAL_3_USAGE_TASK2,
      usageNoteSpoken: UNIT_4_CONDITIONAL_3_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Type 3 trong Task 2 để lập luận nguyên nhân-kết quả trong quá khứ — cấu trúc phức tạp nhất.`],
      ieltsSpeakingTags: [`Dùng Type 3 trong Part 3 để phân tích sai lầm lịch sử — thể hiện tư duy phân tích sâu, band 6.5+.`],
      isPublished: true,
      order: 14,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson14.title} (${lesson14.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson14.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson14.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Conditional Type 3 nào đúng?`,
        options: [`If the UN had intervened sooner, the conflict would be prevented.`, `If the UN had intervened sooner, the conflict would have been prevented.`, `If the UN would have intervened sooner, the conflict would be prevented.`, `If the UN intervened sooner, the conflict would have been prevented.`],
        answer: `If the UN had intervened sooner, the conflict would have been prevented.`,
        solution: `Đúng! Type 3: if + had intervened (Past Perfect) + would have been prevented (Passive would + have + V3).`,
        useAiGrading: false,
      },
      {
        lessonId: lesson14.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Task 2 nào phân tích đúng nguyên nhân khủng hoảng 2008?`,
        options: [`The 2008 crisis could be avoided if banks would have been regulated more strictly.`, `The 2008 crisis could have been avoided if banks had been regulated more strictly.`, `The 2008 crisis could have been avoided if banks were regulated more strictly.`, `The 2008 crisis would avoid if banks had been regulated more strictly.`],
        answer: `The 2008 crisis could have been avoided if banks had been regulated more strictly.`,
        solution: `'Could have been avoided' = Passive Type 3. 'Had been regulated' = Past Perfect Passive trong if-clause. Câu Task 2 phân tích lịch sử band 6.5!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson14.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'If colonial powers had not exploited developing nations, those countries might have develop stronger economies. Many global inequalities would not existed today.'`,
        options: [`might have develop → might have developed; would not existed → would not have existed`, `might have develop → might developed; would not existed đúng`, `Chỉ might have develop → might have developed`, `Câu đúng, không cần sửa.`],
        answer: `might have develop → might have developed; would not existed → would not have existed`,
        solution: `Hai lỗi: (1) 'might have develop' → 'might have developed' (modal + have + V3). (2) 'would not existed' → 'would not have existed' (thiếu 'have').`,
        useAiGrading: true,
      },
      {
        lessonId: lesson14.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'If global leaders _____ (take) decisive action on inequality in the 1990s, the wealth gap we see today _____ (might / not / become) so extreme.'`,
        options: [`had taken / might not have become`, `had taken / might not become`, `would have taken / might not have become`, `had taken / might not became`],
        answer: `had taken / might not have become`,
        solution: `'Had taken' = Past Perfect trong if-clause. 'Might not have become' = modal + not + have + V3. Type 3 hoàn chỉnh!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson14.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2: [invested / developed / nations / had / clean / in / energy / earlier / carbon / emissions / would / significantly / have / fallen]`,
        options: [`If developed nations had invested in clean energy earlier, carbon emissions would have fallen significantly.`, `If developed nations would have invested in clean energy earlier, carbon emissions would have fallen significantly.`, `If developed nations had invested in clean energy earlier, carbon emissions would fallen significantly.`, `Developed nations had invested in clean energy earlier, carbon emissions would have fallen significantly.`],
        answer: `If developed nations had invested in clean energy earlier, carbon emissions would have fallen significantly.`,
        solution: `Type 3 hoàn hảo! If + had invested (Past Perfect — không 'would have invested') + would have fallen (would + have + V3, V3 của fall = fallen). Band 7.0!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson14: Conditional Type 3`);

  // Lesson 15 - Relative Clauses
  const lesson15 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-5-relative" },
    update: {
      theoryMd: UNIT_5_RELATIVE_THEORY,
      commonMistakes: UNIT_5_RELATIVE_MISTAKES,
      usageNoteTask2: UNIT_5_RELATIVE_USAGE_TASK2,
      usageNoteSpoken: UNIT_5_RELATIVE_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-5-relative",
      chapterId: chapter2.id,
      title: "Relative Clauses",
      summary: "Mệnh đề quan hệ",
      content: "Relative Clauses",
      theoryMd: UNIT_5_RELATIVE_THEORY,
      commonMistakes: UNIT_5_RELATIVE_MISTAKES,
      usageNoteTask2: UNIT_5_RELATIVE_USAGE_TASK2,
      usageNoteSpoken: UNIT_5_RELATIVE_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Relative Clauses trong Task 2 để viết câu phức tạp, tránh lặp từ — đặc trưng band 6.5+.`],
      ieltsSpeakingTags: [`Dùng Relative Clauses để mô tả chi tiết trong Part 3 — gộp hai câu ngắn thành một câu phức hợp tự nhiên.`],
      isPublished: true,
      order: 15,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson15.title} (${lesson15.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson15.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson15.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu nào dùng đúng mệnh đề quan hệ?`,
        options: [`Refugees which they flee war deserve international protection.`, `Refugees who flee war deserve international protection.`, `Refugees who they flee war deserve international protection.`, `Refugees that they flee war deserve international protection.`],
        answer: `Refugees who flee war deserve international protection.`,
        solution: `Người → 'who'. Sau 'who' không lặp 'they'. 'Who flee' = mệnh đề xác định.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson15.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Task 2 nào dùng mệnh đề quan hệ học thuật nhất?`,
        options: [`Globalization has benefits and it has created economic opportunities for millions.`, `Globalization, which has created economic opportunities for millions, also has significant drawbacks.`, `Globalization that has created economic opportunities for millions, also has significant drawbacks.`, `Globalization, which it has created economic opportunities for millions, also has drawbacks.`],
        answer: `Globalization, which has created economic opportunities for millions, also has significant drawbacks.`,
        solution: `Non-defining clause: dấu phẩy + which (không 'that') + mệnh đề bổ sung. Gộp hai ý vào một câu — band 6.5.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson15.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'Nations that they have strong social safety nets tend to have lower poverty rates. This is an approach which it has been proven effective in Scandinavian countries.'`,
        options: [`that they have → that have; which it has → which has`, `that they have → which they have; which it has → which has`, `Chỉ which it has → which has`, `Câu đúng, không cần sửa.`],
        answer: `that they have → that have; which it has → which has`,
        solution: `Hai lỗi cùng kiểu: lặp đại từ sau đại từ quan hệ. 'That have', 'which has' — không thêm 'they/it'.`,
        useAiGrading: true,
      },
      {
        lessonId: lesson15.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng đại từ quan hệ: 'The communities _____ are most affected by poverty are often located in regions _____ investment is severely lacking, and _____ residents have limited access to education.'`,
        options: [`that / where / whose`, `which / where / who`, `who / which / whose`, `that / which / whose`],
        answer: `that / where / whose`,
        solution: `'That' (defining, chủ ngữ). 'Where' (nơi chốn). 'Whose' (sở hữu — residents of communities). Ba đại từ quan hệ trong một câu — band 7.0!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson15.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Gộp hai câu: [International aid organizations have worked in conflict zones for decades] + [they often operate under dangerous conditions]`,
        options: [`International aid organizations, which have been working in conflict zones for decades, often operate under dangerous conditions.`, `International aid organizations, that have been working in conflict zones for decades, often operate under dangerous conditions.`, `International aid organizations which they have been working in conflict zones for decades often operate under dangerous conditions.`, `International aid organizations, which have been working in conflict zones for decades, which often operate under dangerous conditions.`],
        answer: `International aid organizations, which have been working in conflict zones for decades, often operate under dangerous conditions.`,
        solution: `Non-defining clause (bổ sung → dấu phẩy + which). Không lặp 'they' sau 'which'. Mệnh đề quan hệ + Present Perfect = band 7.0!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson15: Relative Clauses`);

  // Lesson 16 - Reported Speech
  const lesson16 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-6-reported" },
    update: {
      theoryMd: UNIT_6_REPORTED_THEORY,
      commonMistakes: UNIT_6_REPORTED_MISTAKES,
      usageNoteTask2: UNIT_6_REPORTED_USAGE_TASK2,
      usageNoteSpoken: UNIT_6_REPORTED_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-6-reported",
      chapterId: chapter2.id,
      title: "Reported Speech",
      summary: "Câu tường thuật",
      content: "Reported Speech",
      theoryMd: UNIT_6_REPORTED_THEORY,
      commonMistakes: UNIT_6_REPORTED_MISTAKES,
      usageNoteTask2: UNIT_6_REPORTED_USAGE_TASK2,
      usageNoteSpoken: UNIT_6_REPORTED_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Reported Speech trong Task 2 để giới thiệu và phản biện quan điểm — đặc trưng bài luận band 6.5+.`],
      ieltsSpeakingTags: [`Dùng Reported Speech trong Part 3 để thuật lại quan điểm từ nghiên cứu — nghe thuyết phục và học thuật.`],
      isPublished: true,
      order: 16,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson16.title} (${lesson16.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson16.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson16.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Chuyển sang Reported Speech: 'Global inequality is a serious threat to world peace.' (Expert said...)`,
        options: [`The expert said global inequality is a serious threat to world peace.`, `The expert said that global inequality was a serious threat to world peace.`, `The expert told that global inequality was a serious threat to world peace.`, `The expert said that global inequality is was a threat to world peace.`],
        answer: `The expert said that global inequality was a serious threat to world peace.`,
        solution: `'Said' (quá khứ) → backshift: 'is' → 'was'. 'Said that' (không 'told that').`,
        useAiGrading: false,
      },
      {
        lessonId: lesson16.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu Task 2 nào đúng khi giới thiệu quan điểm đối lập?`,
        options: [`However, others argued that free trade can to harm developing economies.`, `However, others argued that free trade could harm developing economies.`, `However, others argued that free trade could harmed developing economies.`, `However, others told that free trade could harm developing economies.`],
        answer: `However, others argued that free trade could harm developing economies.`,
        solution: `'Argued' (quá khứ) → backshift: 'can' → 'could'. 'Could harm' = modal + V nguyên mẫu. Câu phản biện Task 2 chuẩn!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson16.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'The UN report warned that millions of people will face food insecurity if climate action is not taken. It also claimed that developing nations are the most vulnerable.'`,
        options: [`will face → would face; is not taken → was not taken (are có thể giữ — sự thật chung)`, `will face → would face; is not taken → was not taken; are → were`, `will face → would face only`, `Câu đúng, không cần sửa.`],
        answer: `will face → would face; is not taken → was not taken (are có thể giữ — sự thật chung)`,
        solution: `Backshift: warned → will → would, is not → was not. NHƯNG: 'are vulnerable' có thể giữ nguyên nếu là sự thật chung hiện hữu — đây là ngoại lệ backshift.`,
        useAiGrading: true,
      },
      {
        lessonId: lesson16.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'Economists _____ (argue) that globalization _____ (create) both winners and losers, and _____ (warn) that without proper policies, inequality _____ (continue) to rise.'`,
        options: [`argued / had created / warned / would continue`, `argued / created / warned / would continue`, `argue / has created / warn / will continue`, `argued / creates / warned / continued`],
        answer: `argued / had created / warned / would continue`,
        solution: `'Argued/warned' = quá khứ. 'Had created' = backshift từ Present Perfect. 'Would continue' = backshift từ will. Reported Speech phức tạp nhất — band 7.0!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson16.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2: [researchers / suggested / that / urban / poverty / was / increasing / rapidly / and / that / governments / should / act / immediately]`,
        options: [`Researchers suggested that urban poverty was increasing rapidly and that governments should act immediately.`, `Researchers suggested that urban poverty is increasing rapidly and that governments should act immediately.`, `Researchers suggested urban poverty was increasing rapidly and governments should to act immediately.`, `Researchers told that urban poverty was increasing rapidly and governments should act immediately.`],
        answer: `Researchers suggested that urban poverty was increasing rapidly and that governments should act immediately.`,
        solution: `'Suggested that' (không 'told that'). 'Was increasing' = backshift. 'Should' giữ nguyên. 'That' lặp trước mệnh đề thứ hai — chuẩn học thuật!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson16: Reported Speech`);

  // Lesson 17 - Cleft Sentences
  const lesson17 = await prisma.grammarLesson.upsert({
    where: { id: "lesson-unit-6-cleft" },
    update: {
      theoryMd: UNIT_6_CLEFT_THEORY,
      commonMistakes: UNIT_6_CLEFT_MISTAKES,
      usageNoteTask2: UNIT_6_CLEFT_USAGE_TASK2,
      usageNoteSpoken: UNIT_6_CLEFT_USAGE_SPOKEN,
      isPublished: true,
    },
    create: {
      id: "lesson-unit-6-cleft",
      chapterId: chapter2.id,
      title: "Cleft Sentences",
      summary: "Câu chẻ — Cấu trúc nhấn mạnh",
      content: "Cleft Sentences",
      theoryMd: UNIT_6_CLEFT_THEORY,
      commonMistakes: UNIT_6_CLEFT_MISTAKES,
      usageNoteTask2: UNIT_6_CLEFT_USAGE_TASK2,
      usageNoteSpoken: UNIT_6_CLEFT_USAGE_SPOKEN,
      ieltsWritingTags: [`Dùng Cleft Sentences trong Task 2 để nhấn mạnh giải pháp hoặc nguyên nhân — câu văn ấn tượng, đặc trưng band 7.0.`],
      ieltsSpeakingTags: [`Dùng Cleft Sentences trong Part 3 để nhấn mạnh điểm quan trọng nhất của lập luận — thể hiện khả năng cấu trúc nâng cao tự nhiên.`],
      isPublished: true,
      order: 17,
    },
  });
  console.log(`✅ Seeded lesson: ${lesson17.title} (${lesson17.id})`);

  await prisma.grammarExercise.deleteMany({ where: { lessonId: lesson17.id } });
  await prisma.grammarExercise.createMany({
    data: [
      {
        lessonId: lesson17.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Câu IT-cleft nào đúng để nhấn mạnh giải pháp?`,
        options: [`It is education which breaks the cycle of poverty.`, `It is education that breaks the cycle of poverty.`, `It is education that it breaks the cycle of poverty.`, `It was education which breaks the cycle of poverty.`],
        answer: `It is education that breaks the cycle of poverty.`,
        solution: `Đúng! IT-cleft: It is + [education] + that + [breaks...]. Dùng 'that' (không 'which'). Không lặp 'it' sau 'that'.`,
        useAiGrading: false,
      },
      {
        lessonId: lesson17.id,
        type: "MULTIPLE_CHOICE",
        prompt: `WH-cleft nào đúng và học thuật nhất cho kết bài Task 2?`,
        options: [`What the world needs it is immediate action on climate change.`, `What the world needs is immediate and coordinated action on climate change.`, `Which the world needs is immediate action on climate change.`, `What the world needs are immediate action on climate change.`],
        answer: `What the world needs is immediate and coordinated action on climate change.`,
        solution: `'What + clause + is + noun'. 'Action' không đếm được → 'is'. Không có 'it' sau 'needs'. Câu kết Task 2 band 7.0!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson17.id,
        type: "ERROR_CORRECTION",
        prompt: `Sửa lỗi: 'It was the industrial revolution which it transformed global economies. What governments they need to do now is learn from history and act more sustainably.'`,
        options: [`which it → that; they need → need`, `which it → that only`, `which → that; it transformed → transformed`, `Câu đúng, không cần sửa.`],
        answer: `which it → that; they need → need`,
        solution: `Hai lỗi: (1) IT-cleft dùng 'that', không 'which'. Không lặp 'it'. (2) WH-cleft: 'What governments need' — không lặp 'they' sau 'governments'.`,
        useAiGrading: true,
      },
      {
        lessonId: lesson17.id,
        type: "FILL_IN_BLANK",
        prompt: `Điền đúng: 'It _____ the combined effort of governments and citizens _____ will ultimately determine whether we build a more equitable world. What _____ most urgently is greater political commitment.'`,
        options: [`is / that / is needed`, `is / which / needed`, `was / that / is needed`, `is / that / needs`],
        answer: `is / that / is needed`,
        solution: `IT-cleft: It + IS + [combined effort] + THAT + [will determine]. WH-cleft: What + is needed (Passive). Kết hợp hai loại cleft — band 7.0!`,
        useAiGrading: false,
      },
      {
        lessonId: lesson17.id,
        type: "MULTIPLE_CHOICE",
        prompt: `Tạo câu Task 2 nhấn mạnh: [international / cooperation / is / it / will / that / solve / global / challenges / not / individual / action / most / effectively]`,
        options: [`It is international cooperation, not individual action, that will solve global challenges most effectively.`, `It is international cooperation, not individual action, which will solve global challenges most effectively.`, `It is international cooperation, not individual action, that it will solve global challenges most effectively.`, `International cooperation, not individual action, that will solve global challenges most effectively.`],
        answer: `It is international cooperation, not individual action, that will solve global challenges most effectively.`,
        solution: `Câu kết Task 2 đỉnh cao! IT-cleft với đối lập 'not individual action'. 'That will solve' (không which, không that it). Band 7.0!`,
        useAiGrading: false,
      }
    ],
  });
  console.log(`✅ Seeded exercises for lesson17: Cleft Sentences`);
  // AUTO_GENERATED_LESSONS_END
}



main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seeding completed!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
