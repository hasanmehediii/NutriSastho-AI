# Build Phases
FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:0.11.7 /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1

COPY pyproject.toml  .
COPY *.lock .

RUN uv sync --frozen --no-dev --no-cache --no-install-project

COPY . .

EXPOSE 7860

RUN uv sync --frozen --no-dev

CMD [ "uv", "run", "src/mcp_99bugsincode/main.py" ]

