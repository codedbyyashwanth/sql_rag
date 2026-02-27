from langchain.chat_models import init_chat_model
from langchain.agents import create_agent
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit

import requests, pathlib
from rich.table import Table
from rich.console import Console
import ast 

from dotenv import load_dotenv
load_dotenv()

# Constant Variables 
DB_LOCATION = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db"
FILENAME = "chinook.db"
SQL_URI = f"sqlite:///{FILENAME}"
MODEL = "gpt-4o"



class UserExecute:
    """
        UserExectue:
            Handling the custom SQL queries from the user 
    """
    
    def __init__(self, database_name:str, database_location:str, sql_uri:str):
        self.database_name = database_name
        self.database_location = database_location
        self.database = None
        self.sql_uri = sql_uri
        self._load_db()


    def _load_db(self):
        # the database file will be stored to root dir with given file name
        filepath = pathlib.Path(self.database_name)

        if filepath.exists():
            pass
        else:
            try:
                # Downloading the database file to local folder from the given URL
                response = requests.get(self.database_location)
                if response.status_code == 200:
                    filepath.write_bytes(response.content)
                else:
                    print("Unable to save database from the given location")
            except:
                raise RuntimeError("Unable to load database from the given location")
        
        # load the database avalable in the local folder
        self.database = SQLDatabase.from_uri(self.sql_uri)


    def run_query(self, sql_query:str) -> str:
        # Run's the SQL query in the database and return result in string format
        try:
            sql_result = self.database.run(sql_query, include_columns=True)
            return sql_result
        except:
            raise RuntimeError("Unable to run the SQL command")
        
    
    def display_result(self, sql_result:str):
        try:
            # Convert the string to python literal 
            sql_data:list[dict] = ast.literal_eval(sql_result) # "[(1, AC/DC)]" (String) -> [(1, "AC/DC")] (List of Tuple)

            # empty return if no data is available 
            if not sql_data:
                console.print("[yellow]No results found.[/yellow]")
                return
            
            # Rich Table UI for SQL Data
            table = Table(show_header=True, header_style="bold magenta")

            # Extracting column names from the list of SQL result
            for keys in sql_data[0].keys():
                table.add_column(keys, justify="right")
            
            # Extracting each row from the list of SQL result
            for row in sql_data:
                values = list(row.values())
                values = [str(v) for v in values]
                table.add_row(*values, style="green")   # * is to split the elements into individual value from the list
            
            console = Console()
            console.print(table)

        except Exception as E:
            print(E)
            console.print(sql_result)   # if unable to print the Rich Table UI  
    


class AgentExecute:
    """
        AgentExecute:
            Converting the raw text input from user to SQL queries
                - Format the output from the Agent
                - Provide the Data Visualization components - if possible
                - Forecasting result from the data - if possible
    """
    pass


def main():
    # userExecute = UserExecute(FILENAME, DB_LOCATION, SQL_URI)
    # sql_result = userExecute.run_query("select * from artist limit 5")
    # userExecute.display_result(sql_result)
    pass


if __name__ == "__main__":
    main()
