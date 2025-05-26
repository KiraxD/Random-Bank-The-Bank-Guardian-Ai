from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
from typing import Optional
import uvicorn

app = FastAPI(title="Random Bank Fraud Detection API")

class TransactionRequest(BaseModel):
    userId: str
    type: str
    amount: float
    recipientId: Optional[str] = None

class FraudResponse(BaseModel):
    transaction_id: str
    fraud_score: float
    is_fraudulent: bool

@app.get("/")
async def root():
    return {"message": "Random Bank Fraud Detection API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=FraudResponse)
async def predict_fraud(transaction: TransactionRequest):
    """
    Mock fraud detection endpoint.
    
    This is a simplified mock that returns a random fraud score.
    In a real application, this would use a trained ML model.
    """
    # Initialize fraud score based on transaction characteristics
    # Default to a very low score for small transactions
    fraud_score = 0.05
    
    # Only consider fraud detection for transactions above 100
    if transaction.amount < 100:
        fraud_score = 0.0  # No fraud risk for small transactions
    else:
        # Calculate base risk score using amount tiers
        if transaction.amount >= 100 and transaction.amount < 500:
            fraud_score = 0.2
        elif transaction.amount >= 500 and transaction.amount < 1000:
            fraud_score = 0.3
        elif transaction.amount >= 1000 and transaction.amount < 5000:
            fraud_score = 0.5
        elif transaction.amount >= 5000:
            fraud_score = 0.6
        
        # Apply transaction type risk factors
        if transaction.type == "transfer":
            # Transfers have higher risk, but still reasonable for normal amounts
            if transaction.amount > 1000:
                fraud_score += 0.2
            else:
                fraud_score += 0.1
        
        # Add some randomness to simulate other risk factors (0-0.15)
        fraud_score += random.random() * 0.15
    
    # Cap the fraud score at 1.0
    fraud_score = min(fraud_score, 1.0)
    
    # Determine if the transaction is fraudulent based on a threshold
    is_fraudulent = fraud_score > 0.7
    
    # Generate a mock transaction ID
    transaction_id = f"tx_{random.randint(10000, 99999)}"
    
    return {
        "transaction_id": transaction_id,
        "fraud_score": round(fraud_score, 2),
        "is_fraudulent": is_fraudulent
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
