"""
train_seasonal_color.py

เทรน Random Forest Classifier สำหรับ Seasonal Color Analysis
Input:  ค่าสีผิว RGB (R, G, B) + brightness + warmth
Output: Spring / Summer / Autumn / Winter

ขั้นตอน:
  1. สร้าง dataset จาก color theory (synthetic data)
  2. เทรนโมเดล Random Forest
  3. ประเมินผล (accuracy, confusion matrix)
  4. export โมเดลเป็น .pkl
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import joblib
import os

np.random.seed(42)

# ─── 1. สร้าง Dataset ───────────────────────────────────────────────────────

def generate_season_samples(season, n=250):
    """
    สร้างตัวอย่างสีผิวสำหรับแต่ละ season
    อ้างอิงจาก seasonal color theory (Carole Jackson)
    """
    samples = []

    if season == "Spring":
        # ผิวสว่าง + warm undertone (peachy, golden)
        # R สูง (อบอุ่น), G กลาง, B ต่ำ
        R = np.random.randint(200, 240, n)
        G = np.random.randint(155, 200, n)
        B = np.random.randint(120, 165, n)

    elif season == "Summer":
        # ผิวสว่าง + cool undertone (pinkish, rosy)
        # R กลาง, G กลาง, B สูงกว่า R และ G
        R = np.random.randint(185, 225, n)
        G = np.random.randint(145, 185, n)
        B = np.random.randint(155, 195, n)

    elif season == "Autumn":
        # ผิวเข้ม + warm undertone (earthy, bronze)
        # R กลาง-สูง, G ต่ำ-กลาง, B ต่ำมาก
        R = np.random.randint(160, 210, n)
        G = np.random.randint(115, 160, n)
        B = np.random.randint(85,  130, n)

    elif season == "Winter":
        # ผิวเข้ม + cool undertone (bluish, olive cool)
        # R ต่ำ-กลาง, G ต่ำ, B กลาง
        R = np.random.randint(130, 185, n)
        G = np.random.randint(100, 145, n)
        B = np.random.randint(125, 170, n)

    for r, g, b in zip(R, G, B):
        samples.append({
            "R": int(r),
            "G": int(g),
            "B": int(b),
            "season": season
        })

    return samples

# สร้างตัวอย่างทุก season
all_samples = []
for season in ["Spring", "Summer", "Autumn", "Winter"]:
    all_samples.extend(generate_season_samples(season, n=250))

df = pd.DataFrame(all_samples)
print(f"Dataset size: {len(df)} samples")
print(df["season"].value_counts())
print()

# ─── 2. Feature Engineering ─────────────────────────────────────────────────

def extract_features(df):
    """
    คำนวณ feature เพิ่มเติมจาก RGB
    เพื่อให้โมเดลแยก season ได้แม่นขึ้น
    """
    features = df[["R", "G", "B"]].copy()

    # brightness: ความสว่างโดยรวม (สูง = ผิวสว่าง = Spring/Summer)
    features["brightness"] = (df["R"] + df["G"] + df["B"]) / 3

    # warmth: ความอบอุ่น (R - B สูง = warm = Spring/Autumn)
    features["warmth"] = df["R"] - df["B"]

    # pinkness: ความชมพู (R - G สูง = pinkish = Summer)
    features["pinkness"] = df["R"] - df["G"]

    # saturation approximation: ความสดของสี
    max_rgb = df[["R", "G", "B"]].max(axis=1)
    min_rgb = df[["R", "G", "B"]].min(axis=1)
    features["saturation"] = (max_rgb - min_rgb) / (max_rgb + 1)

    return features

X = extract_features(df)
y = df["season"]

print("Features ที่ใช้เทรน:")
print(X.columns.tolist())
print()

# ─── 3. แบ่ง Train / Test ───────────────────────────────────────────────────

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train)} | Test: {len(X_test)}")

# ─── 4. เทรนโมเดล ───────────────────────────────────────────────────────────

model = RandomForestClassifier(
    n_estimators=100,   # จำนวน decision tree
    max_depth=10,       # ความลึกสูงสุดของแต่ละ tree
    random_state=42
)

model.fit(X_train, y_train)
print("\nเทรนโมเดลเสร็จแล้ว")

# ─── 5. ประเมินผล ────────────────────────────────────────────────────────────

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\nAccuracy: {acc * 100:.2f}%")
print()
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred, labels=["Spring", "Summer", "Autumn", "Winter"])
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks(range(4))
ax.set_yticks(range(4))
ax.set_xticklabels(["Spring", "Summer", "Autumn", "Winter"])
ax.set_yticklabels(["Spring", "Summer", "Autumn", "Winter"])
ax.set_xlabel("Predicted")
ax.set_ylabel("Actual")
ax.set_title(f"Confusion Matrix (Accuracy: {acc*100:.1f}%)")
for i in range(4):
    for j in range(4):
        ax.text(j, i, cm[i, j], ha="center", va="center", color="black")
plt.tight_layout()
plt.savefig("ml/confusion_matrix.png")
print("บันทึก confusion_matrix.png แล้ว")

# Feature Importance
importances = model.feature_importances_
feat_names = X.columns.tolist()
fig2, ax2 = plt.subplots(figsize=(7, 4))
ax2.barh(feat_names, importances, color="#D23669")
ax2.set_xlabel("Importance")
ax2.set_title("Feature Importance")
plt.tight_layout()
plt.savefig("ml/feature_importance.png")
print("บันทึก feature_importance.png แล้ว")

# ─── 6. Export โมเดล ────────────────────────────────────────────────────────

os.makedirs("ml/model", exist_ok=True)
joblib.dump(model, "ml/model/seasonal_color_model.pkl")
print("\nบันทึกโมเดลที่ ml/model/seasonal_color_model.pkl แล้ว")

# ─── 7. ทดสอบ predict ───────────────────────────────────────────────────────

print("\n── ทดสอบ predict ──")

def predict_season(R, G, B):
    sample = pd.DataFrame([{
        "R": R, "G": G, "B": B,
        "brightness": (R + G + B) / 3,
        "warmth": R - B,
        "pinkness": R - G,
        "saturation": (max(R,G,B) - min(R,G,B)) / (max(R,G,B) + 1)
    }])
    pred = model.predict(sample)[0]
    proba = model.predict_proba(sample)[0]
    classes = model.classes_
    confidence = {c: round(float(p)*100, 1) for c, p in zip(classes, proba)}
    return pred, confidence

tests = [
    (220, 175, 145, "คาดว่า Spring"),
    (205, 165, 175, "คาดว่า Summer"),
    (185, 135, 100, "คาดว่า Autumn"),
    (155, 120, 148, "คาดว่า Winter"),
]

for R, G, B, note in tests:
    season, conf = predict_season(R, G, B)
    print(f"RGB({R},{G},{B}) → {season:8s} | {note}")
    print(f"  confidence: {conf}")
