FROM --platform=linux/amd64 python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1

COPY pyproject.toml .
COPY *.lock . 

RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*
RUN uv sync --frozen --no-dev --no-cache --no-install-project

COPY . .

EXPOSE 8000

RUN uv sync --frozen --no-dev

CMD [ "uv", "run", "src/backend/server.py" ]



