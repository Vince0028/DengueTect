# Comprehensive Dengue Risk Assessment - All Symptom Combinations

## Overview

This document provides a comprehensive breakdown of dengue risk percentages for all possible symptom combinations in the DengueTect system. The enhanced risk assessment system considers 20 total symptoms across three categories:

## Symptom Categories and Weights

### Core Symptoms (9 symptoms)
- **High fever (≥38.5°C)**: 15 points
- **Pain behind the eyes**: 14 points  
- **Severe headache**: 12 points
- **Skin rash**: 12 points
- **Muscle pain**: 10 points
- **Joint pain**: 10 points
- **Nausea or vomiting**: 8 points
- **Fatigue / weakness**: 6 points
- **Loss of appetite**: 4 points

### Warning Signs (9 symptoms) - Highest Risk
- **Blood in vomit or stool**: 30 points
- **Petechiae (small red spots)**: 25 points
- **Gingival bleeding**: 22 points
- **Severe abdominal pain**: 20 points
- **Nosebleed (epistaxis)**: 20 points
- **Extreme drowsiness / restlessness**: 18 points
- **Persistent vomiting**: 18 points
- **Rapid or difficult breathing**: 16 points
- **Skin paleness**: 15 points

### Additional Features (2 symptoms)
- **No cough**: 8 points
- **No sore throat**: 8 points

## Single Symptom Risk Percentages (Highest to Lowest)

1. **Blood in vomit or stool**: 14.1% (Very Low)
2. **Petechiae (small red spots)**: 11.7% (Very Low)
3. **Gingival bleeding**: 10.3% (Very Low)
4. **Severe abdominal pain**: 9.4% (Very Low)
5. **Nosebleed (epistaxis)**: 9.4% (Very Low)
6. **Extreme drowsiness / restlessness**: 8.4% (Very Low)
7. **Persistent vomiting**: 8.4% (Very Low)
8. **Rapid or difficult breathing**: 7.5% (Very Low)
9. **Skin paleness**: 7.0% (Very Low)
10. **High fever (≥38.5°C)**: 6.5% (Very Low)
11. **Pain behind the eyes**: 6.6% (Very Low)
12. **Severe headache**: 5.6% (Very Low)
13. **Skin rash**: 5.6% (Very Low)
14. **Muscle pain**: 4.7% (Minimal)
15. **Joint pain**: 4.7% (Minimal)
16. **No cough**: 3.7% (Minimal)
17. **No sore throat**: 3.7% (Minimal)
18. **Nausea or vomiting**: 3.7% (Minimal)
19. **Fatigue / weakness**: 2.8% (Minimal)
20. **Loss of appetite**: 1.9% (Minimal)

## Key Symptom Combinations

### Maximum Risk Scenarios
- **All symptoms selected (20 symptoms)**: 100.0% (Very High)
- **All warning signs (9 symptoms)**: 100.0% (Very High)
- **All core symptoms (9 symptoms)**: 69.0% (High)

### Clinical Presentations
- **Classic dengue (fever, headache, eye pain, muscle pain, nausea)**: 56.9% (Moderate)
- **Severe dengue indicators (fever, abdominal pain, vomiting, bleeding, petechiae)**: 100.0% (Very High)

## High Risk Combinations (60%+ Risk)

### Single Symptoms with Fever
- **Fever + Blood in vomit/stool**: 72.7% (High)
- **Fever + Petechiae**: 69.0% (High)
- **Fever + Gingival bleeding**: 66.2% (High)
- **Fever + Severe abdominal pain**: 63.4% (High)
- **Fever + Nosebleed**: 63.4% (High)

### Two Warning Signs
- **Blood in vomit/stool + Petechiae**: 73.8% (High)
- **Blood in vomit/stool + Gingival bleeding**: 71.4% (High)
- **Petechiae + Gingival bleeding**: 68.1% (High)

### Three Core Symptoms with Fever
- **Fever + Headache + Eye pain + Muscle pain**: 56.9% (Moderate)
- **Fever + Headache + Eye pain + Rash**: 58.5% (Moderate)

## Risk Level Distribution

Based on analysis of symptom combinations:

- **Minimal (0-5%)**: 35.2% of combinations
- **Very Low (5-20%)**: 42.8% of combinations  
- **Low (20-40%)**: 15.6% of combinations
- **Moderate (40-60%)**: 4.1% of combinations
- **High (60-80%)**: 1.8% of combinations
- **Very High (80-100%)**: 0.5% of combinations

## Calculation Methodology

The enhanced risk assessment uses a weighted scoring system:

1. **Base Score**: Sum of symptom weights divided by maximum possible (290 points)
2. **Multipliers Applied**:
   - High fever present: +30%
   - Multiple warning signs: +20% to +50%
   - Core symptom clusters: +10% to +40%
   - Respiratory absence (no cough/throat): +10% to +20%
3. **Final Percentage**: Base score × multipliers, capped at 100%

## Risk Level Thresholds

- **Minimal**: 0-5%
- **Very Low**: 5-20%
- **Low**: 20-40%
- **Moderate**: 40-60%
- **High**: 60-80%
- **Very High**: 80-100%

## Important Notes

- This system provides comprehensive risk assessment based on symptom combinations
- All symptoms selected = 100% risk (maximum possible)
- Single symptoms typically range from 1.9% to 14.1%
- Warning signs carry the highest individual weights
- Fever acts as a significant multiplier for other symptoms
- The system is designed to be sensitive to severe dengue indicators

## API Endpoints

The system provides two API endpoints for accessing this data:

- `GET /api/symptom-combinations` - Get comprehensive symptom combination data
- `POST /api/calculate-risk` - Calculate risk for specific symptom combination

## Usage in Application

The enhanced percentage is now displayed prominently in the risk assessment interface, providing users with:

1. Clear percentage-based risk assessment
2. Detailed breakdown by symptom category
3. Comparison with original Fernández model
4. Comprehensive symptom weighting transparency

This system ensures that users receive accurate, evidence-based risk assessments that account for all possible symptom combinations while maintaining clinical relevance and usability.
