# src/api/main.py
from fastapi import FastAPI

app = FastAPI(title="Jobuine API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Hello, World! 👋 from Jobuine API"}
