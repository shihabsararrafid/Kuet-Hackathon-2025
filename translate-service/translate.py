from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import torch
import uvicorn
from typing import Optional

app = FastAPI(title="Banglish to Bangla Translation Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str

class TranslationResponse(BaseModel):
    success: bool
    translation: Optional[str] = None
    error: Optional[str] = None

# Initialize model and tokenizer
try:
    print("Loading model and tokenizer...")
    model_name = "Mdkaif2782/banglish-to-bangla"
    tokenizer = MBart50TokenizerFast.from_pretrained(model_name)
    model = MBartForConditionalGeneration.from_pretrained(model_name)
    print("Model and tokenizer loaded successfully on CPU")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

def translate_text(text: str) -> str:
    try:
        # Tokenize input text
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
        
        # Generate translation
        with torch.no_grad():
            translated_tokens = model.generate(
                **inputs,
                decoder_start_token_id=tokenizer.lang_code_to_id["bn_IN"],
                max_length=128,
                num_beams=4,
                length_penalty=1.0,
                early_stopping=True
            )
        
        # Decode translation
        translated_text = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
        return translated_text
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@app.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    try:
        if not request.text.strip():
            return TranslationResponse(
                success=False,
                error="Empty text provided"
            )
        
        translated_text = translate_text(request.text)
        return TranslationResponse(
            success=True,
            translation=translated_text
        )
        
    except Exception as e:
        return TranslationResponse(
            success=False,
            error=str(e)
        )

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=6000, reload=False)