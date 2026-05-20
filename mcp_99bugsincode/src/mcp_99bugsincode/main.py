from mcp_99bugsincode.app import mcp

if __name__ == "__main__":
    mcp.run(transport="streamable-http", show_banner=True, port=7860, host="0.0.0.0")