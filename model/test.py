from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re

# Initialize the model and tokenizer
summarization_model_name = "csebuetnlp/mT5_multilingual_XLSum"
summarization_tokenizer = AutoTokenizer.from_pretrained(summarization_model_name)
summarization_model = AutoModelForSeq2SeqLM.from_pretrained(summarization_model_name)

# Initialize FastAPI app
app = FastAPI(title="Banglish to Bangla Translation & Summarization Service")

# Define the input schema
class TextRequest(BaseModel):
    article_text: str

# Define the endpoint
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
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000)