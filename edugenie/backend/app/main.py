from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .schemas import (
    LearningPathResponse,
    QARequest,
    QuizResponse,
    TextRequest,
    TextResponse,
    TopicRequest,
)
from .services import GeminiService


settings = get_settings()
service = GeminiService()


app = FastAPI(
    title="EduGenie API",
    version="1.0.0",
    description=(
        "Google Gemini powered learning assistant API."
    ),
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def handle_error(exc: Exception) -> HTTPException:
    message = str(exc)

    if "GEMINI_API_KEY" in message:
        status_code = 503
    else:
        status_code = 502

    return HTTPException(
        status_code=status_code,
        detail=message,
    )


@app.get("/")
def root() -> dict:
    return {
        "name": "EduGenie API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "gemini_configured": service.configured,
        "model": settings.gemini_model,
    }


@app.post(
    "/api/explain",
    response_model=TextResponse,
)
def explain(payload: TopicRequest) -> TextResponse:
    try:
        result = service.explain(payload.topic)

        return TextResponse(
            result=result
        )

    except Exception as exc:
        raise handle_error(exc)


@app.post(
    "/api/qa",
    response_model=TextResponse,
)
def qa(payload: QARequest) -> TextResponse:
    try:
        result = service.answer_question(
            payload.question,
            payload.context,
        )

        return TextResponse(
            result=result
        )

    except Exception as exc:
        raise handle_error(exc)


@app.post(
    "/api/quiz",
    response_model=QuizResponse,
)
def quiz(payload: TextRequest) -> QuizResponse:
    try:
        return service.quiz(
            payload.text
        )

    except Exception as exc:
        raise handle_error(exc)


@app.post(
    "/api/summarize",
    response_model=TextResponse,
)
def summarize(payload: TextRequest) -> TextResponse:
    try:
        result = service.summarize(
            payload.text
        )

        return TextResponse(
            result=result
        )

    except Exception as exc:
        raise handle_error(exc)


@app.post(
    "/api/learn/recommendations",
    response_model=LearningPathResponse,
)
def learning_recommendations(
    payload: TopicRequest,
) -> LearningPathResponse:
    try:
        return service.learning_path(
            payload.topic
        )

    except Exception as exc:
        raise handle_error(exc)


# ---------------------------------------------------------
# Compatibility aliases
# ---------------------------------------------------------

@app.post(
    "/explain",
    response_model=TextResponse,
    include_in_schema=False,
)
def explain_legacy(
    payload: TopicRequest,
) -> TextResponse:
    return explain(payload)


@app.post(
    "/qa",
    response_model=TextResponse,
    include_in_schema=False,
)
def qa_legacy(
    payload: QARequest,
) -> TextResponse:
    return qa(payload)


@app.post(
    "/quiz",
    response_model=QuizResponse,
    include_in_schema=False,
)
def quiz_legacy(
    payload: TextRequest,
) -> QuizResponse:
    return quiz(payload)


@app.post(
    "/summarize",
    response_model=TextResponse,
    include_in_schema=False,
)
def summarize_legacy(
    payload: TextRequest,
) -> TextResponse:
    return summarize(payload)


@app.post(
    "/learn/recommendations",
    response_model=LearningPathResponse,
    include_in_schema=False,
)
def learning_legacy(
    payload: TopicRequest,
) -> LearningPathResponse:
    return learning_recommendations(payload)