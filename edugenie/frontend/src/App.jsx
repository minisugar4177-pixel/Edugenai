import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  askQuestion,
  explainTopic,
  generateQuiz,
  getHealth,
  getLearningPath,
  summarizeText,
} from "./api";

import ModuleCard from "./components/ModuleCard";
import ResultCard from "./components/ResultCard";


const modules = [
  {
    id: "explain",
    icon: "💡",
    title: "Explain",
    description: "Learn a topic simply",
  },

  {
    id: "qa",
    icon: "❓",
    title: "Q&A",
    description: "Ask your tutor",
  },

  {
    id: "quiz",
    icon: "📝",
    title: "Quiz",
    description: "Test your knowledge",
  },

  {
    id: "summarize",
    icon: "📄",
    title: "Summarize",
    description: "Condense study text",
  },

  {
    id: "learn",
    icon: "🧭",
    title: "Learning Path",
    description: "Plan what to learn next",
  },
];


const copy = {
  explain: {
    title: "Explain a topic",
    hint:
      "Enter a concept and EduGenie will explain it in clear, student-friendly language.",
    placeholder:
      "e.g. Explain the Pythagorean theorem",
    button:
      "Explain with Gemini",
  },

  qa: {
    title: "Ask EduGenie",
    hint:
      "Ask a question. You can optionally add study context to make the answer more focused.",
    placeholder:
      "e.g. Why does the sky appear blue?",
    button:
      "Ask EduGenie",
  },

  quiz: {
    title: "Generate a quiz",
    hint:
      "Paste study material. EduGenie will create exactly 3 multiple-choice questions.",
    placeholder:
      "Paste a lesson, notes, or textbook passage here...",
    button:
      "Generate quiz",
  },

  summarize: {
    title: "Summarize study text",
    hint:
      "Paste your notes or lesson text and get a simple study summary.",
    placeholder:
      "Paste your study text here...",
    button:
      "Summarize",
  },

  learn: {
    title: "Build a learning path",
    hint:
      "Tell EduGenie what you want to learn and it will organize the journey by level.",
    placeholder:
      "e.g. SQL database management",
    button:
      "Create learning path",
  },
};


function App() {
  const [module, setModule] =
    useState("explain");

  const [input, setInput] =
    useState("");

  const [context, setContext] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [health, setHealth] =
    useState(null);

  const [quizAnswers, setQuizAnswers] =
    useState({});

  const [checked, setChecked] =
    useState(false);


  useEffect(() => {
    getHealth()
      .then((data) => {
        setHealth(data);
      })
      .catch(() => {
        setHealth(null);
      });
  }, []);


  useEffect(() => {
    setInput("");
    setContext("");
    setResult(null);
    setError("");
    setQuizAnswers({});
    setChecked(false);
  }, [module]);


  const current = useMemo(
    () => copy[module],
    [module]
  );


  async function handleSubmit(event) {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setChecked(false);
    setQuizAnswers({});

    try {
      let data = null;

      if (module === "explain") {
        data = await explainTopic(
          input.trim()
        );
      }

      if (module === "qa") {
        data = await askQuestion(
          input.trim(),
          context.trim()
        );
      }

      if (module === "quiz") {
        data = await generateQuiz(
          input.trim()
        );
      }

      if (module === "summarize") {
        data = await summarizeText(
          input.trim()
        );
      }

      if (module === "learn") {
        data = await getLearningPath(
          input.trim()
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }


  function selectQuizAnswer(
    questionIndex,
    option
  ) {
    setQuizAnswers(
      (previous) => ({
        ...previous,
        [questionIndex]: option,
      })
    );
  }


  const moduleTitle =
    modules.find(
      (item) =>
        item.id === module
    )?.title;


  return (
    <div className="app-shell">

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>
              EduGenie
            </strong>

            <span>
              Gemini-powered learning assistant
            </span>
          </div>

        </div>


        <div
          className={`connection ${
            health?.gemini_configured
              ? "online"
              : ""
          }`}
        >
          <span />

          {health?.gemini_configured
            ? "Gemini connected"
            : "API key not configured"}
        </div>

      </header>


      <main className="container">

        <section className="hero">

          <div className="eyebrow">
            <Sparkles size={15} />

            SmartBridge learning experience
          </div>


          <h1>
            Learn faster.
            <span>
              Understand better.
            </span>
          </h1>


          <p>
            Explain concepts, ask questions,
            generate quizzes, summarize notes,
            and build a personalized learning path.
          </p>

        </section>


        <div className="workspace">

          <aside className="sidebar">

            <div className="sidebar-label">
              Learning modules
            </div>


            {modules.map((item) => (
              <ModuleCard
                key={item.id}
                {...item}
                active={
                  module === item.id
                }
                onClick={() =>
                  setModule(item.id)
                }
              />
            ))}


            <div className="sidebar-note">

              <BookOpen size={18} />

              <div>
                <strong>
                  Study tip
                </strong>

                <span>
                  Use the Quiz module after
                  summarizing a lesson to reinforce
                  recall.
                </span>
              </div>

            </div>

          </aside>


          <section className="content">

            <div className="section-title">

              <span className="eyebrow">
                {moduleTitle}
              </span>

              <h2>
                {current.title}
              </h2>

              <p>
                {current.hint}
              </p>

            </div>


            <form
              className="input-card"
              onSubmit={handleSubmit}
            >

              <label htmlFor="main-input">
                Your input
              </label>


              <textarea
                id="main-input"
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                placeholder={
                  current.placeholder
                }
                rows={
                  module === "quiz" ||
                  module === "summarize"
                    ? 10
                    : 5
                }
              />


              {module === "qa" && (
                <>
                  <label htmlFor="context">
                    Optional study context
                  </label>

                  <textarea
                    id="context"
                    value={context}
                    onChange={(event) =>
                      setContext(
                        event.target.value
                      )
                    }
                    placeholder="Add notes, a lesson excerpt, or other context..."
                    rows={4}
                  />
                </>
              )}


              <div className="form-footer">

                <span>
                  {input.length.toLocaleString()}
                  {" "}
                  characters
                </span>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    loading ||
                    input.trim().length < 2
                  }
                >

                  {loading ? (
                    <>
                      <Loader2
                        className="spin"
                        size={18}
                      />

                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />

                      {current.button}
                    </>
                  )}

                </button>

              </div>

            </form>


            {error && (
              <div className="error-box">

                <strong>
                  Couldn't complete that request.
                </strong>

                <span>
                  {error}
                </span>

              </div>
            )}


            {result &&
              module === "quiz" && (
                <ResultCard title="Your quiz">

                  <div className="quiz-list">

                    {result.questions.map(
                      (question, index) => (
                        <div
                          className="quiz-question"
                          key={`${question.question}-${index}`}
                        >

                          <h3>
                            Q{index + 1}.{" "}
                            {question.question}
                          </h3>


                          <div className="options">

                            {question.options.map(
                              (option) => (
                                <label
                                  key={option}
                                  className={`option ${
                                    quizAnswers[index] ===
                                    option
                                      ? "selected"
                                      : ""
                                  }`}
                                >

                                  <input
                                    type="radio"
                                    name={`q-${index}`}
                                    value={option}
                                    checked={
                                      quizAnswers[index] ===
                                      option
                                    }
                                    onChange={() =>
                                      selectQuizAnswer(
                                        index,
                                        option
                                      )
                                    }
                                  />

                                  <span>
                                    {option}
                                  </span>

                                </label>
                              )
                            )}

                          </div>


                          {checked && (
                            <div
                              className={`answer-feedback ${
                                quizAnswers[index] ===
                                question.answer
                                  ? "correct"
                                  : "wrong"
                              }`}
                            >

                              {quizAnswers[index] ===
                              question.answer
                                ? "✓ Correct!"
                                : `✗ Correct answer: ${question.answer}`}

                            </div>
                          )}

                        </div>
                      )
                    )}

                  </div>


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setChecked(true)
                    }
                  >
                    <CheckCircle2 size={18} />

                    Check answers
                  </button>

                </ResultCard>
              )}


            {result &&
              module !== "quiz" &&
              module !== "learn" && (
                <ResultCard
                  title={
                    module === "summarize"
                      ? "Study summary"
                      : "EduGenie response"
                  }
                >

                  <div className="response-text">
                    {result.result
                      .split("\n")
                      .map(
                        (line, index) => (
                          <p
                            key={index}
                          >
                            {line ||
                              "\u00a0"}
                          </p>
                        )
                      )}
                  </div>

                </ResultCard>
              )}


            {result &&
              module === "learn" && (
                <ResultCard
                  title={`Learning path: ${result.topic}`}
                >

                  <p className="overview">
                    {result.overview}
                  </p>


                  <div className="path-list">

                    {result.stages.map(
                      (stage, index) => (
                        <article
                          className="path-stage"
                          key={`${stage.level}-${index}`}
                        >

                          <div className="stage-badge">
                            {stage.level}
                          </div>


                          <div className="stage-main">

                            <div className="stage-meta">
                              ⏱{" "}
                              {stage.estimated_time}
                            </div>


                            <h3>
                              Key topics
                            </h3>


                            <ul>
                              {stage.key_topics.map(
                                (topic, topicIndex) => (
                                  <li
                                    key={`${topic}-${topicIndex}`}
                                  >
                                    {topic}
                                  </li>
                                )
                              )}
                            </ul>


                            <h3>
                              Resources
                            </h3>


                            <ul>
                              {stage.resources.map(
                                (
                                  resource,
                                  resourceIndex
                                ) => (
                                  <li
                                    key={`${resource}-${resourceIndex}`}
                                  >
                                    {resource}
                                  </li>
                                )
                              )}
                            </ul>

                          </div>

                        </article>
                      )
                    )}

                  </div>

                </ResultCard>
              )}

          </section>

        </div>

      </main>


      <footer>

        <Lightbulb size={15} />

        EduGenie keeps the Gemini API key
        on the backend; it is never sent
        to the browser.

      </footer>

    </div>
  );
}


export default App;