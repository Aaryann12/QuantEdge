
STOCK PREDICTION MODEL
======================

Model:
LightGBM LambdaRank

Purpose:
Rank stocks by expected next-day relative strength.

Features:
65

SYMBOL:
Not used as an ML feature.

Prediction horizon:
Next trading day.

Model file:
lambdarank_model.pkl

Feature list:
feature_columns.json

Configuration:
model_config.json

Return calibration:
calibration.json

Important:
The LambdaRank model is primarily a ranking model.
The calibration value represents the historical expected
return of validation-period Top-5 candidates.

Production flow:

User selects SYMBOL
        ->
Backend obtains market data
        ->
Calculate the exact 65 features
        ->
LambdaRank model
        ->
Ranking / signal
        ->
Return calibration
        ->
Predicted return
        ->
Predicted price
        ->
Direction / confidence
