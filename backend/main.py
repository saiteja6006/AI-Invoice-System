from fastapi import FastAPI, UploadFile, File
from controllers.invoice_controller import router as invoice_router
from services.vector_db_service import init_collection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/")
def root():
    return {"status": "running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ai-invoice-system.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_collection(384)

app.include_router(invoice_router)