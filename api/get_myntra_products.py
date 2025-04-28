from fastapi import FastAPI
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup

app = FastAPI()

@app.get("/api/get_myntra_products")
async def get_myntra_products():
    try:
        url = "https://www.myntra.com/shop/trending"
        headers = {"User-Agent": "Mozilla/5.0"}
        page = requests.get(url, headers=headers)
        soup = BeautifulSoup(page.content, "html.parser")
        
        products = []
        for item in soup.find_all('h4', class_='product-product')[:10]:
            products.append(item.text)
        
        return JSONResponse(content={"products": products})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
      
