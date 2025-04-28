from fastapi import FastAPI
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup

app = FastAPI()

@app.get("/api/get_flipkart_products")
async def get_flipkart_products():
    try:
        url = "https://www.flipkart.com/search?q=trending"
        headers = {"User-Agent": "Mozilla/5.0"}
        page = requests.get(url, headers=headers)
        soup = BeautifulSoup(page.content, "html.parser")
        
        products = []
        for item in soup.find_all('div', class_='_4rR01T')[:10]:
            products.append(item.text)
        
        return JSONResponse(content={"products": products})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
      
