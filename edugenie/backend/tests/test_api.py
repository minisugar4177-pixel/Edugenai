from fastapi.testclient import TestClient

from app.main import app, service
from app.schemas import QuizQuestion, QuizResponse


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "EduGenie API"
    assert data["docs"] == "/docs"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"
    assert "gemini_configured" in data
    assert "model" in data


def test_explain_endpoint(monkeypatch):
    monkeypatch.setattr(
        service,
        "explain",
        lambda topic: f"Explanation for {topic}",
    )

    response = client.post(
        "/api/explain",
        json={
            "topic": "photosynthesis"
        },
    )

    assert response.status_code == 200

    assert response.json() == {
        "result": "Explanation for photosynthesis"
    }


def test_qa_endpoint(monkeypatch):
    monkeypatch.setattr(
        service,
        "answer_question",
        lambda question, context: (
            f"Answer for: {question}"
        ),
    )

    response = client.post(
        "/api/qa",
        json={
            "question": "Why is the sky blue?",
            "context": "",
        },
    )

    assert response.status_code == 200

    assert "result" in response.json()


def test_quiz_endpoint(monkeypatch):
    result = QuizResponse(
        questions=[
            QuizQuestion(
                question="What is 2 + 2?",
                options=[
                    "3",
                    "4",
                    "5",
                    "6",
                ],
                answer="4",
            ),
            QuizQuestion(
                question="Which is a mammal?",
                options=[
                    "Shark",
                    "Dolphin",
                    "Trout",
                    "Octopus",
                ],
                answer="Dolphin",
            ),
            QuizQuestion(
                question="Which planet is known as the Red Planet?",
                options=[
                    "Earth",
                    "Mars",
                    "Venus",
                    "Jupiter",
                ],
                answer="Mars",
            ),
        ]
    )

    monkeypatch.setattr(
        service,
        "quiz",
        lambda text: result,
    )

    response = client.post(
        "/api/quiz",
        json={
            "text": (
                "This is a sufficiently long study passage "
                "that can be used for quiz generation tests."
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["questions"]) == 3

    for question in data["questions"]:
        assert len(question["options"]) == 4
        assert question["answer"] in question["options"]


def test_summarize_endpoint(monkeypatch):
    monkeypatch.setattr(
        service,
        "summarize",
        lambda text: "This is a summary.",
    )

    response = client.post(
        "/api/summarize",
        json={
            "text": (
                "This is sufficiently long educational "
                "content that should be summarized."
            )
        },
    )

    assert response.status_code == 200

    assert response.json() == {
        "result": "This is a summary."
    }


def test_learning_path_endpoint(monkeypatch):
    from app.schemas import (
        LearningPathResponse,
        LearningStage,
    )

    result = LearningPathResponse(
        topic="Python",
        overview="Learn Python step by step.",
        stages=[
            LearningStage(
                level="Beginner",
                estimated_time="2 weeks",
                key_topics=[
                    "Variables",
                    "Data types",
                    "Control flow",
                ],
                resources=[
                    "Beginner tutorials",
                    "Practice exercises",
                ],
            ),
            LearningStage(
                level="Intermediate",
                estimated_time="3 weeks",
                key_topics=[
                    "Functions",
                    "Modules",
                    "Object-oriented programming",
                ],
                resources=[
                    "Documentation",
                    "Small projects",
                ],
            ),
            LearningStage(
                level="Advanced",
                estimated_time="4 weeks",
                key_topics=[
                    "Async programming",
                    "Testing",
                    "Architecture",
                ],
                resources=[
                    "Advanced documentation",
                    "Projects",
                ],
            ),
        ],
    )

    monkeypatch.setattr(
        service,
        "learning_path",
        lambda topic: result,
    )

    response = client.post(
        "/api/learn/recommendations",
        json={
            "topic": "Python"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["topic"] == "Python"
    assert len(data["stages"]) == 3


def test_validation_rejects_short_topic():
    response = client.post(
        "/api/explain",
        json={
            "topic": "x"
        },
    )

    assert response.status_code == 422


def test_validation_rejects_short_text():
    response = client.post(
        "/api/summarize",
        json={
            "text": "too short"
        },
    )

    assert response.status_code == 422