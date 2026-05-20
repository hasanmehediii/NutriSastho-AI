from fastmcp import FastMCP


mcp = FastMCP(
    name="99 Bugs in the Code",
    version="0.1.0",
)

@mcp.tool()
def get_db(sql: str) -> str:
    # This is a mock function to simulate database access.
    # In a real application, this would execute the SQL query and return results.
    return f"Executed SQL: {sql}"