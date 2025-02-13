# BudgetFastAPI
A budgeting app built using Python, FastAPI, SQLModel, JWTs, and React. Both the backend and the frontend are served on a single FastAPI server.

To run, run the command "python -m fastapi dev main.py" from the ./server directory.

If running for the first time:

1. Run the command "npm install" from the top directory
2. Configure the local database in the file ./server/queries.py
3. run "python create_tables.py" from the directory ./server
4. run the command "python -m fastapi dev main.py" from the ./server directory
   
The url for the app is http://127.0.0.1:8000 .
