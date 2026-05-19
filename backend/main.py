from fastapi import FastAPI
from sqlalchemy import text
from database import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://melbourne-rental-intelligence-frontend.onrender.com/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Melbourne Rental Dashboard API"}


@app.get("/rentals")
def get_rentals():

    with engine.connect() as conn:

        result = conn.execute(text("SELECT * FROM rental_prices"))

        rentals = [dict(row._mapping) for row in result]

    return rentals
