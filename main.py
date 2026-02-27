from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit

import requests, pathlib, ast

from rich.table import Table
from rich.console import Console

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dotenv import load_dotenv
load_dotenv()

# Constant Variables
DB_LOCATION = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db"
FILENAME = "chinook.db"
SQL_URI = f"sqlite:///{FILENAME}"
MODEL = "gpt-4o"


class UserExecute:
    """
        UserExecute:
            Handling the custom SQL queries from the user
    """

    def __init__(self, database_name: str, database_location: str, sql_uri: str):
        self.database_name = database_name
        self.database_location = database_location
        self.sql_uri = sql_uri
        self.database = None
        self.__load_db()

    def __load_db(self):
        # the database file will be stored to root dir with given file name
        filepath = pathlib.Path(self.database_name)

        if not filepath.exists():
            try:
                # Downloading the database file to local folder from the given URL
                response = requests.get(self.database_location)
                if response.status_code == 200:
                    filepath.write_bytes(response.content)
                else:
                    print("Unable to save database from the given location")
            except Exception:
                raise RuntimeError("Unable to load database from the given location")

        # load the database available in the local folder
        self.database = SQLDatabase.from_uri(self.sql_uri)

    def run_query(self, sql_query: str) -> str:
        # Run's the SQL query in the database and return result in string format
        try:
            sql_result = self.database.run(sql_query, include_columns=True)
            return sql_result
        except Exception:
            raise RuntimeError("Unable to run the SQL command")

    def display_result(self, sql_result: str):
        console = Console()
        try:
            # Convert the string to python literal
            sql_data: list[dict] = ast.literal_eval(sql_result)  # "[(1, AC/DC)]" (String) -> [(1, "AC/DC")] (List of Tuple)

            # empty return if no data is available
            if not sql_data:
                console.print("[yellow]No results found.[/yellow]")
                return

            # Rich Table UI for SQL Data
            table = Table(show_header=True, header_style="bold magenta")

            # Extracting column names from the list of SQL result
            for keys in sql_data[0].keys():
                table.add_column(keys, justify="left")

            # Extracting each row from the list of SQL result
            for row in sql_data:
                values = list(row.values())
                values = [str(v) for v in values]
                table.add_row(*values, style="green")  # * is to split the elements into individual value from the list

            console.print(table)

        except Exception as e:
            print(e)
            console.print(sql_result)  # if unable to print the Rich Table UI

    def get_query_result(self, sql_query: str) -> dict:
        """Returns structured result for API/frontend consumption as tabular data."""
        try:
            sql_result = self.database.run(sql_query, include_columns=True)
            sql_data: list[dict] = ast.literal_eval(sql_result)

            if not sql_data:
                return {"columns": [], "rows": [], "row_count": 0}

            columns = list(sql_data[0].keys())
            rows = [
                [str(v) if v is not None else "NULL" for v in row.values()]
                for row in sql_data
            ]
            return {"columns": columns, "rows": rows, "row_count": len(rows)}

        except Exception as e:
            raise RuntimeError(f"Unable to execute query: {str(e)}")


class AgentExecute:
    """
        AgentExecute:
            Converting the raw text input from user to SQL queries
                - Format the output from the Agent
                - Provide the Data Visualization components - if possible
                - Forecasting result from the data - if possible
    """

    def __init__(self, sql_uri: str, model_name: str):
        self.sql_uri = sql_uri
        self.model_name = model_name
        self.__load_model()

    def __load_model(self):
        self.database = SQLDatabase.from_uri(self.sql_uri)  # loading the available SQL database
        self.model = init_chat_model(self.model_name, temperature=0.0)  # initializing the model with 0 randomness
        toolkit = SQLDatabaseToolkit(db=self.database, llm=self.model)
        self.tools = toolkit.get_tools()

        self.__system_prompt = """
            You are an agent designed to interact with a SQL database.
            Given an input question, create a syntactically correct sqlite query to run,
            then look at the results of the query and return the answer. Unless the user
            specifies a specific number of examples they wish to obtain, always limit your
            query to at most {top_k} results.

            You can order the results by a relevant column to return the most interesting
            examples in the database. Never query for all the columns from a specific table,
            only ask for the relevant columns given the question.

            You MUST double check your query before executing it. If you get an error while
            executing a query, rewrite the query and try again.

            DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the
            database.

            To start you should ALWAYS look at the tables in the database to see what you
            can query. Do NOT skip this step.

            Then you should query the schema of the most relevant tables.
            """.format(
            top_k=5,
        )

    def sql_agent(self, query: str) -> str:
        """
        TODO
        - Response - Data Visualization
          Ex - User - Plot me the graph for this table data
        """
        agent = create_agent(self.model, tools=self.tools, system_prompt=self.__system_prompt)

        response = agent.invoke({
            "messages": [{"role": "user", "content": query}]
        })

        return response["messages"][-1].content


# ── Pydantic Models ────────────────────────────────────────────────────────────

class RunQueryRequest(BaseModel):
    query: str


class RunQueryResponse(BaseModel):
    columns: list[str]
    rows: list[list[str]]
    row_count: int


class AskAIRequest(BaseModel):
    query: str


class AskAIResponse(BaseModel):
    response: str


# ── App Initialization ─────────────────────────────────────────────────────────

userExecute = UserExecute(FILENAME, DB_LOCATION, SQL_URI)
agent = AgentExecute(SQL_URI, MODEL)

app = FastAPI(title="SQL RAG Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "message": "SQL RAG Agent API is running"}


@app.post("/run-query", response_model=RunQueryResponse)
async def run_query(request: RunQueryRequest):
    try:
        result = userExecute.get_query_result(request.query)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask-ai", response_model=AskAIResponse)
async def ask_ai(request: AskAIRequest):
    try:
        response = agent.sql_agent(request.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
