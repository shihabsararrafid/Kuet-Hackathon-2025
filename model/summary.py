from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re

# Initialize the model and tokenizer
model_name = "csebuetnlp/mT5_multilingual_XLSum"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Initialize FastAPI app
app = FastAPI()

# Define the input schema
class TextRequest(BaseModel):
    article_text: str

# Define the endpoint
@app.post("/generate-summary/")
async def generate_summary(request: TextRequest):
    # Handle whitespace
    WHITESPACE_HANDLER = lambda k: re.sub('\s+', ' ', re.sub('\n+', ' ', k.strip()))
    article_text = WHITESPACE_HANDLER(request.article_text)

    # Tokenize input
    input_ids = tokenizer(
        [article_text],
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=512
    )["input_ids"]

    # Generate summary
    try:
        output_ids = model.generate(
            input_ids=input_ids,
            max_length=84,
            no_repeat_ngram_size=2,
            num_beams=4
        )[0]

        # Decode summary
        summary = tokenizer.decode(
            output_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
