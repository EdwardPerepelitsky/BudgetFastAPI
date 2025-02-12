from fastapi import FastAPI,Request
from users_routes import usersRouter
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

app.mount("/static", StaticFiles(directory="../build/static"), name="static")

templates = Jinja2Templates(directory="../templates")

app.include_router(usersRouter, prefix="/users")

@app.get("/{full_path:path}")
def catch_all(request: Request, full_path: str):
    return templates.TemplateResponse("index.html", {"request": request})



