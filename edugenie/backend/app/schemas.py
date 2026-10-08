from typing import List

from pydantic import BaseModel, Field, field_validator


class TopicRequest(BaseModel):
    topic: str = Field(
        min_length=2,
        max_length=500,
        description="The educational topic.",
    )

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError("Topic must contain at least 2 characters.")

        return value


class QARequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=4000,
    )

    context: str = Field(
        default="",
        max_length=12000,
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 2:
            raise ValueError("Question must contain at least 2 characters.")

        return value

    @field_validator("context")
    @classmethod
    def normalize_context(cls, value: str) -> str:
        return value.strip()


class TextRequest(BaseModel):
    text: str = Field(
        min_length=20,
        max_length=30000,
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()

        if len(value) < 20:
            raise ValueError(
                "Text must contain at least 20 characters."
            )

        return value


class TextResponse(BaseModel):
    result: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(
        min_length=4,
        max_length=4,
    )
    answer: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Quiz question cannot be empty.")

        return value

    @field_validator("options")
    @classmethod
    def validate_options(cls, value: List[str]) -> List[str]:
        cleaned = [item.strip() for item in value]

        if len(cleaned) != 4:
            raise ValueError(
                "Every quiz question must contain exactly 4 options."
            )

        if len(set(cleaned)) != 4:
            raise ValueError(
                "Quiz options must be unique."
            )

        return cleaned

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Quiz answer cannot be empty.")

        return value


class QuizResponse(BaseModel):
    questions: List[QuizQuestion] = Field(
        min_length=3,
        max_length=3,
    )

    @field_validator("questions")
    @classmethod
    def validate_question_count(
        cls,
        value: List[QuizQuestion],
    ) -> List[QuizQuestion]:
        if len(value) != 3:
            raise ValueError(
                "The quiz must contain exactly 3 questions."
            )

        for question in value:
            if question.answer not in question.options:
                raise ValueError(
                    "Every quiz answer must match one of its options."
                )

        return value


class LearningStage(BaseModel):
    level: str
    estimated_time: str
    key_topics: List[str]
    resources: List[str]

    @field_validator("level")
    @classmethod
    def validate_level(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Learning stage level cannot be empty.")

        return value


class LearningPathResponse(BaseModel):
    topic: str
    overview: str
    stages: List[LearningStage]

    @field_validator("stages")
    @classmethod
    def validate_stages(
        cls,
        value: List[LearningStage],
    ) -> List[LearningStage]:
        if not value:
            raise ValueError(
                "Learning path must contain at least one stage."
            )

        return value