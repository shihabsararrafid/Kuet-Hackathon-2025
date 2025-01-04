from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, FilePath, DirectoryPath
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Trainer, TrainingArguments
import os

app = FastAPI()

def ensure_output_dir(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)

# Define input model for API request
class TrainingRequest(BaseModel):
    data_file: FilePath = "banglish_to_bangla.csv"  # Path to the CSV file
    model_name: str = "Mdkaif2782/banglish-to-bangla"  # Hugging Face model name
    output_dir: DirectoryPath = "/home/bishal/Documents/KUET_HACKATHON"  # Directory to save results

# Function to train the model
def train_model(data_file: str, model_name: str, output_dir: str):
    # Load and split the dataset
    dataset = load_dataset('csv', data_files=data_file, split='train')
    split_dataset = dataset.train_test_split(test_size=0.2)

    # Tokenizer setup
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.tgt_lang = "bn_IN"

    def tokenize_function(examples):
        return tokenizer(examples['banglish'], text_target=examples['bangla'], truncation=True, padding=True)

    tokenized_datasets = split_dataset.map(tokenize_function, batched=True)

    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        learning_rate=3e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
    )

    # Load model
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    # Trainer setup
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets['train'],
        eval_dataset=tokenized_datasets['test'],
        tokenizer=tokenizer,
    )

    # Train the model
    trainer.train()

# FastAPI endpoint to trigger training
@app.post("/train")
async def train(request: TrainingRequest, background_tasks: BackgroundTasks):
    
    # Ensure output directory exists
    os.makedirs(request.output_dir, exist_ok=True)

    # Start training in a background task
    background_tasks.add_task(
        train_model,
        data_file=request.data_file,
        model_name=request.model_name,
        output_dir=request.output_dir,
    )

    return {"message": "Training started. Check the output directory for results."}


