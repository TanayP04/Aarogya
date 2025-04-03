from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import MedicalChatModel
import uvicorn

app = FastAPI()
model = MedicalChatModel()

class Query(BaseModel):
    text: str

@app.post("/predict")
async def predict(query: Query):
    try:
        response = model.get_response(query.text)
        return {"response": response}
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)