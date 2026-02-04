import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

# 1. Create/Load Dataset (Simulating Real Medical Data)
# In a real scenario, this would load 'medical_data.csv'
data = {
    'Symptom_Fever': [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0],
    'Symptom_Cough': [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1],
    'Symptom_Fatigue': [1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    'Symptom_Headache': [0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    'Symptom_SoreThroat': [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    'Symptom_BodyPain': [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    'Symptom_RunnyNose': [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
    'Symptom_Breathlessness': [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    'Disease': [
        'Viral Fever', 'Common Cold', 'Malaria', 'Covid-19', 'Fatigue', 'Migraine',
        'Viral Fever', 'Covid-19', 'Common Cold', 'Malaria', 'Typhoid', 'Asthma'
    ]
}

# Expand dataset to mimic larger data (Synthetic oversampling for demo)
df = pd.DataFrame(data)
df = pd.concat([df]*50, ignore_index=True) # Multiply data to simulate training scale

print(f"Dataset Loaded: {df.shape[0]} records")

# 2. Preprocessing
X = df.drop('Disease', axis=1)
y = df['Disease']

# 3. Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Model Training (Random Forest)
print("Training AI Model...")
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# 5. Evaluation
accuracy = rf.score(X_test, y_test)
print(f"Model Training Complete. Accuracy: {accuracy * 100:.2f}%")

# 6. Save Model & Columns
model_data = {
    'model': rf,
    'features': list(X.columns)
}

with open('disease_model.pkl', 'wb') as f:
    pickle.dump(model_data, f)

print("Model saved to 'disease_model.pkl'")
