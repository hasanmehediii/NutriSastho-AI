import os

from mcp_99bugsincode.app import mcp

if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("MCP_SERVER_PORT", "7860")))
    mcp.run(
        transport="streamable-http",
        show_banner=True,
        port=port,
        host="0.0.0.0",
        path="/mcp",
    )
