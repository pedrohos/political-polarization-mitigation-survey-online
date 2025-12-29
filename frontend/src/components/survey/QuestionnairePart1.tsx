import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

// Props interface defining all the state and handlers for the survey
interface QuestionnaireProps {
  handleAnswerSA: (value: number) => void;
  handleAnswerCBA: (value: number) => void;

  answerSA: number;
  answerCBA: number;
  disableFirstSection: boolean;

  newsBody: string;
  verdict: string;
}

// Defines the scales used in the questions (Yes/No and 5-point Likert)
const SCALES: Record<string, { labels: string[]; values: number[]; columns: number }> = {
  "yes-no": {
    labels: ["Sim", "Não"],
    values: [1, 2],
    columns: 2,
  },
  "likert-qt": {
    labels: [
      "Muito<br/>Baixa",
      "Baixa",
      "Razoável",
      "Alta",
      "Muito<br/>Alta",
    ],
    values: [1, 2, 3, 4, 5],
    columns: 5,
  },
};

// Type definition for a single question
type QuestionDef = {
  text: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  idx: number;
  type: "yes-no" | "likert-qt";
  disableFirstSection: boolean;
};

// A reusable component to render the radio button scale for a question
function ScaleOptions({ q }: { q: QuestionDef }) {
  const scale = SCALES[q.type];
  return (
    <div
      className={`scale-grid-new`}
      style={{ ["--cols" as any]: scale.columns }}
    >
      {scale.values.map((opt, i) => {
        const labelHtml = scale.labels[i];
        return (
          <div key={opt} className={`scale-col `}>
            <div
              className={`scale-label-new`}
              dangerouslySetInnerHTML={{ __html: labelHtml }}
            />
            <div
              className={`scale-opt-new ${opt % 2 === 0 ? "tone-alt" : ""}`}
            >
              <input
                type="radio"
                name={q.name}
                onChange={() => q.onChange(opt)}
                checked={q.value === opt}
                disabled={q.disableFirstSection}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// The main survey component
export default function Questionnaire(props: QuestionnaireProps) {

  // Definitions for the first set of questions
  const firstQuestions: QuestionDef[] = [
    {
      text: "Você já viu essa notícia antes?",
      name: "question-sa",
      value: props.answerSA,
      onChange: props.handleAnswerSA,
      idx: 1,
      type: "yes-no",
      disableFirstSection: props.disableFirstSection,
    },
    {
      text: "Qual o seu grau de confiança em relação ao veredito?",
      name: "question-cba",
      value: props.answerCBA,
      onChange: props.handleAnswerCBA,
      idx: 2,
      type: "likert-qt",
      disableFirstSection: props.disableFirstSection,
    },
  ];


  return (
    <div className="questionnaire-wrapper">
      <div className="text-section">
        <label>Notícia:</label>
        <div className="text-pane markdown-pane">
          <ReactMarkdown
            children={props.newsBody}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            components={{
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer"/>,
              img: ({node, ...props}) => <img style={{ maxWidth: "100%" }} {...props}/>
            }}
          />
        </div>
        <div className="verdict-wrapper">
            <label>Veredito:</label>
            <span className="verdict-text">{props.verdict}</span>
        </div>
      </div>
      
      <div className="questions-section">
        {firstQuestions.map((q) => (
          <div key={q.idx} className="question-block">
            <p className="question-text">{`${q.idx}. ${q.text}`}</p>
            <ScaleOptions q={q} />
          </div>
        ))}
      </div>
    </div>
  );
}