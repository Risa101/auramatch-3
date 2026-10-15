# ความก้าวหน้าในส่วน AI — AuraMatch

## 1. ระบบวิเคราะห์สี/รูปหน้าแบบ Multi-source (ส.ค. 2026)

วางสถาปัตยกรรมให้มีหลายแหล่งวิเคราะห์ทำงานร่วมกัน แต่ละแหล่ง override ผล season/face-shape ได้เฉพาะเมื่อสำเร็จ (fallback อัตโนมัติถ้าแหล่งใดล้มเหลว):

- โมเดล **RandomForest** ที่เทรนเองจากค่า RGB ผิว (`ml/train_seasonal_color.py`)
- **face-api.js** (68 landmark) สำหรับตรวจรูปทรงใบหน้า
- **Color engine** จาก MediaPipe + CIELAB color space (จากโปรเจกต์ auramatchgenz) — แหล่งที่แม่นยำที่สุดในขณะนั้น
- เพิ่มระบบ telemetry (`aiLogger`) เก็บ log ผลวิเคราะห์จากทุกแหล่งเพื่อตรวจสอบย้อนหลัง
- เชื่อม backend endpoint ใหม่ `/api/undertone/analyze` สำหรับตรวจ undertone (warm/cool) ด้วย computer vision เพื่อแนะนำบลัชให้ตรงสีผิวจริง

## 2. การประเมินความแม่นยำอย่างเป็นระบบ (ก.ย. 2026) — งานวิจัยหลักของโปรเจกต์

ทดสอบ pipeline จริงกับ dataset ที่มี ground truth จากผู้เชี่ยวชาญ (**Deep Armocromia**, 4,920 ภาพ) แบ่ง train/test แยกกันอย่างถูกต้อง ไม่ปนข้อมูล

### ขั้นที่ 1 — วัด pipeline แบบ classical (เดิม) ของระบบ

- ความแม่นยำจริง: **27.7%** (เทียบกับสุ่มได้ ~25%) — เกิด class collapse รุนแรง ทำนาย "Spring" ถึง 70.5% ของทุกเคส
- Recall แยกราย season: Spring 72.8%, Summer 27.5%, Winter 8.7%, Autumn เหลือเพียง 6.5%
- ตรวจ root cause ด้วย diagnostic ablation พบว่าแกน "warm" และ "value" ที่ใช้ตัดสินใจ มีผลพลิกผลลัพธ์ ~50% ของเคส (ใกล้เคียง coin-flip) ชี้ว่าระบบตัดสินใจอยู่บนขอบเขตที่ไม่มั่นคง
- ลองปรับ calibration (hue_pivot/value_pivot) จาก train partition แล้ว validate บน test → ได้ 30.5% แต่ปัญหาไม่ได้ถูกแก้จริง เพียงย้าย collapse จาก Spring ไป Winter แทน (เพราะฟีเจอร์ hue_angle มีช่องว่างแยก warm/cool แค่ 0.15° — แทบไม่มีสัญญาณแยกกลุ่มเลย)
- สรุป: ข้อจำกัดเชิงโครงสร้างคือ pipeline เดิมบีบแต่ละภาพเหลือค่า Lab เฉลี่ยค่าเดียว ไม่มีข้อมูลเชิงพื้นที่/texture เหลือให้ tuning ใดๆ กู้สัญญาณที่ไม่ถูกจับมาตั้งแต่แรก

### ขั้นที่ 2 — สร้างโมเดล Deep Learning มาทดแทน (`personal_color_ai/`)

สร้างโปรเจกต์แยกพร้อม pipeline เทรนเต็มรูปแบบ (MediaPipe face parsing, dual-head timm backbone, AdamW + CosineAnnealingLR + focal loss, early stopping) แล้วทดลองเปรียบเทียบ 4 แนวทางอย่างเป็นระบบบน test set เดียวกัน (912 ภาพ, held-out):

| โมเดล/วิธี | Test Accuracy | ผลลัพธ์ |
|---|---|---|
| Classical (เดิม) | 27.7% | collapse รุนแรง |
| Classical + calibration | 30.5% | collapse ย้ายไป Winter |
| HGNetV2-B5 (deep learning, full run) | 51.5% | ไม่มี collapse, recall ทุก season 45–64% |
| **EfficientNetV2-L (clean run)** | **53.7%** | ไม่มี collapse — ผลดีที่สุดที่ยืนยันซ้ำได้ |
| EfficientNetV2-L + regularization หนักขึ้น | 53.7% | val ดีขึ้น (+3.3pp) แต่ test เท่าเดิม — negative result ที่แท้จริง |
| EfficientNetV2-L + ภาพตัดพื้นหลัง (masked RGB) | 53.6% | ทดสอบว่าพื้นหลังรบกวนโมเดลหรือไม่ — ไม่ใช่สาเหตุ |
| ViT-Base (CLIP-pretrained) | 49.5% | แย่กว่า CNN เพราะ dataset (~3,600 ภาพ train) เล็กเกินไปสำหรับ Transformer |

- สามการทดลองที่เป็นอิสระกัน (unregularized / regularization หนักขึ้น / ตัดพื้นหลัง) **ลงเอยที่ตัวเลขเดิม 53.6–53.7%** ซึ่งเป็นหลักฐานที่น่าเชื่อถือกว่าตัวเลขเดี่ยว บ่งชี้ว่านี่คือ ceiling เชิงโครงสร้างของ dataset ขนาดนี้ (~3,600 ภาพ train) ไม่ใช่ปัญหาจาก hyperparameter
- พบและแก้บั๊กจริง 2 จุดระหว่างทำวิจัย:
  1. โค้ดประเมินผลใช้ weight จาก epoch สุดท้ายแทน best checkpoint ที่ early-stopping เลือกไว้
  2. ไฟล์ผลลัพธ์ไม่ได้ตั้งชื่อแยกตาม run ทำให้ข้อมูลโมเดลก่อนหน้าถูก overwrite ทับ (ต้องสร้างไฟล์ hgnetv2_b5 ขึ้นใหม่จาก log ย้อนหลัง)

### ขั้นที่ 3 — ทดสอบรูปทรงใบหน้าด้วยวิธีเดียวกัน

- ใช้ dataset แยก (1,613 ภาพ web-scraped) ทดสอบ `faceGeometry.js`/face-api.js เดิม → **17.2% agreement เท่านั้น** พบ collapse ไปทาง "Square" เกือบทุกเคส (recall คลาสอื่น 0–11.4%)
- สาเหตุที่พบ: face-api.js (68 จุด) ไม่มี landmark จุดหน้าผาก ต้องใช้ bounding-box แทนซึ่งไม่เสถียรเมื่อผมบังหน้าผาก

## 3. การนำผลวิจัยไปแก้ที่ระบบจริง (ต.ค. 2026 — กำลังทำ, ยังไม่ commit)

- เขียน `faceGeometry.js` ใหม่ทั้งหมดด้วย **MediaPipe (468 จุด)** แทน face-api.js เพื่อแก้ปัญหาการวัดรูปทรงหน้าโดยตรงจากข้อ 2
- เพิ่ม `imageQuality.js` เป็น quality gate ตรวจความละเอียด/ความเบลอ/แสง/ขนาดใบหน้า/มุมหน้า **ก่อน** เข้า pipeline วิเคราะห์ — เดิมไม่มีการตรวจเลย ภาพที่เบลอ/แสงไม่พอก็ยังได้ผลลัพธ์ที่ดูมั่นใจเหมือนภาพปกติ
- ลบโมเดล face-api.js (`public/models/*`) และ RandomForest model (`.pkl`) เดิมที่พิสูจน์แล้วว่าไม่แม่นยำออกจาก production path
- เริ่มเขียน unit test ให้โมดูลคำนวณ geometry/color ที่แยกจาก React เพื่อให้ทดสอบ logic ได้โดยไม่ต้อง mock DOM

## สิ่งที่ยังไม่เสร็จ

- โมเดล deep learning (EfficientNetV2-L, 53.7%) ยังอยู่ในขั้นทดลองที่โปรเจกต์แยก (`personal_color_ai/`) **ยังไม่ได้ train ให้พร้อม deploy หรือเชื่อมเข้า production**
- ยังไม่มีการวัดความแม่นยำของ undertone classification ด้วย ground truth (มีแค่ season และ face shape ที่วัดแล้ว)
- ยังไม่ได้ re-run benchmark วัด accuracy หลังแก้ white-balance/faceGeometry ของสัปดาห์นี้ เทียบกับ baseline 27.7% เดิม
