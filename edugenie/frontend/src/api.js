async function request(path, body) {
  const response = await fetch(path, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "The server could not complete the request."
    );
  }

  return data;
}


export async function explainTopic(topic) {
  return request(
    "/api/explain",
    {
      topic,
    }
  );
}


export async function askQuestion(
  question,
  context = ""
) {
  return request(
    "/api/qa",
    {
      question,
      context,
    }
  );
}


export async function generateQuiz(text) {
  return request(
    "/api/quiz",
    {
      text,
    }
  );
}


export async function summarizeText(text) {
  return request(
    "/api/summarize",
    {
      text,
    }
  );
}


export async function getLearningPath(topic) {
  return request(
    "/api/learn/recommendations",
    {
      topic,
    }
  );
}


export async function getHealth() {
  const response = await fetch("/health");

  if (!response.ok) {
    throw new Error(
      "Backend is unavailable."
    );
  }

  return response.json();
}