from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast, AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
import uvicorn
from typing import Optional

# Initialize FastAPI app
app = FastAPI(title="Banglish to Bangla Translation & Summarization Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models and tokenizers
try:
    # Banglish to Bangla Translation
    # print("Loading Banglish to Bangla model and tokenizer...")
    # translation_model_name = "Mdkaif2782/banglish-to-bangla"
    # translation_tokenizer = MBart50TokenizerFast.from_pretrained(translation_model_name)
    # translation_model = MBartForConditionalGeneration.from_pretrained(translation_model_name)
    
    # Initialize the model and tokenizer
    summarization_model_name = "csebuetnlp/mT5_multilingual_XLSum"
    summarization_tokenizer = AutoTokenizer.from_pretrained(summarization_model_name)
    summarization_model = AutoModelForSeq2SeqLM.from_pretrained(summarization_model_name)
    
    

    
    print("Models and tokenizers loaded successfully")
except Exception as e:
    print(f"Error loading models: {str(e)}")
    raise

# Translation Request and Response Schema
class TranslationRequest(BaseModel):
    text: str

class TranslationResponse(BaseModel):
    success: bool
    translation: Optional[str] = None
    error: Optional[str] = None

# Summarization Request Schema
class TextRequest(BaseModel):
    article_text: str

# Translate text from Banglish to Bangla
# def translate_text(text: str) -> str:
#     try:
#         # Tokenize input text
#         inputs = translation_tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=128)
        
#         # Generate translation
#         with torch.no_grad():
#             translated_tokens = translation_model.generate(
#                 **inputs,
#                 decoder_start_token_id=translation_tokenizer.lang_code_to_id["bn_IN"],
#                 max_length=128,
#                 num_beams=4,
#                 length_penalty=1.0,
#                 early_stopping=True
#             )
        
#         # Decode translation
#         translated_text = translation_tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
#         return translated_text
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")



#***
# Translation endpoint
# @app.post("/translate", response_model=TranslationResponse)
# async def translate(request: TranslationRequest):
#     try:
#         if not request.text.strip():
#             return TranslationResponse(
#                 success=False,
#                 error="Empty text provided"
#             )
        
#         translated_text = translate_text(request.text)
#         return TranslationResponse(
#             success=True,
#             translation=translated_text
#         )
        
#     except Exception as e:
#         return TranslationResponse(
#             success=False,
#             error=str(e)
#         )



##testing

@app.post("/generate-summary")
async def generate_summary(request: TextRequest):
    print("API hit")
    print("Received article text:", request.article_text)
    
    # Handle whitespace
    WHITESPACE_HANDLER = lambda k: re.sub('\s+', ' ', re.sub('\n+', ' ', k.strip()))
    article_text = WHITESPACE_HANDLER(request.article_text)
    print("Cleaned article text:", article_text)

    # Tokenize input
    input_ids = summarization_tokenizer(
        [article_text],
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=512
    )["input_ids"]
    print("Tokenized input:", input_ids)

    # Generate summary
    try:
        output_ids = summarization_model.generate(
            input_ids=input_ids,
            max_length=84,
            no_repeat_ngram_size=2,
            num_beams=4
        )[0]
        print("Generated output IDs:", output_ids)

        # Decode summary
        summary = summarization_tokenizer.decode(
            output_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False
        )
        print("Decoded summary:", summary)
        return {"summary": summary}
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# Run the app
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=6000)
