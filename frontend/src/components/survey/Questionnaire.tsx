import React from "react";

// Props interface defining all the state and handlers for the survey
interface QuestionnaireProps {
  handleAnswerSA: (value: number) => void;
  handleAnswerCBA: (value: number) => void;
  handleAnswerCAA: (value: number) => void;
  handleAnswerDE: (value: number) => void;
  handleAnswerCL: (value: number) => void;
  handleAnswerMatrixPE: (value: number) => void;
  handleAnswerMatrixCO: (value: number) => void;
  handleAnswerMatrixER: (value: number) => void;
  handleAnswerMatrixCS: (value: number) => void;

  answerSA: number;
  answerCBA: number;
  answerCAA: number;
  answerDE: number;
  answerCL: number;
  answerMatrixPE: number;
  answerMatrixCO: number;
  answerMatrixER: number;
  answerMatrixCS: number;

  newsBody: string;
  verdict: string;
  verificationBody: string;
}

// Defines the scales used in the questions (Yes/No and 5-point Likert)
const SCALES: Record<string, { labels: string[]; values: number[]; columns: number }> = {
  "yes-no": {
    labels: ["Sim", "Não"],
    values: [1, 2],
    columns: 2,
  },
  likert: {
    labels: [
      "Discordo<br/>Totalmente",
      "Discordo",
      "Não concordo<br/>nem discordo",
      "Concordo",
      "Concordo<br/>Totalmente",
    ],
    values: [1, 2, 3, 4, 5],
    columns: 5,
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
  type: "yes-no" | "likert" | "likert-qt";
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
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Type definition for a matrix question row
type MatrixQuestionDef = {
  text: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
};

// The main survey component
export default function Questionnaire(props: QuestionnaireProps) {
  // The rest of the survey is visible only after the first two questions are answered
  const isVisible = props.answerSA !== 0 && props.answerCBA !== 0;

  // Definitions for the first set of questions
  const firstQuestions: QuestionDef[] = [
    {
      text: "Você já viu essa notícia antes?",
      name: "question-sa",
      value: props.answerSA,
      onChange: props.handleAnswerSA,
      idx: 1,
      type: "yes-no",
    },
    {
      text: "Qual o seu grau de confiança em relação ao veredito antes de ler a explicação?",
      name: "question-cba",
      value: props.answerCBA,
      onChange: props.handleAnswerCBA,
      idx: 2,
      type: "likert-qt",
    },
  ];

  // Definitions for the questions that appear after the verification text
  const subsequentQuestions: QuestionDef[] = [
    {
      text: "Qual o seu grau de confiança em relação ao veredito depois de ler a explicação?",
      name: "question-caa",
      value: props.answerCAA,
      onChange: props.handleAnswerCAA,
      idx: 3,
      type: "likert-qt",
    },
    {
      text: "A análise é completa e analisa com a profundidade que você esperaria de uma agência de fact checking?",
      name: "question-de",
      value: props.answerDE,
      onChange: props.handleAnswerDE,
      idx: 4,
      type: "likert",
    },
    {
      text: "O texto é coerente, claro, e direto.",
      name: "question-cl",
      value: props.answerCL,
      onChange: props.handleAnswerCL,
      idx: 5,
      type: "likert",
    },
  ];
  
  // Definitions for the matrix-style question
  const matrixQuestions: MatrixQuestionDef[] = [
      {
          text: "Capacidade Persuasiva - A verificação é persuasiva na justificativa da verificação.",
          name: "matrix-pe",
          value: props.answerMatrixPE,
          onChange: props.handleAnswerMatrixPE,
      },
      {
          text: "Consistência Textual - O texto da verificação é fluido e as ideias são consistentes.",
          name: "matrix-co",
          value: props.answerMatrixCO,
          onChange: props.handleAnswerMatrixCO,
      },
      {
          text: "Facilidade de Leitura - A verificação é fácil de ser lida e interpretada.",
          name: "matrix-er",
          value: props.answerMatrixER,
          onChange: props.handleAnswerMatrixER,
      },
      {
          text: "Senso comum - A verificação segue o senso comum",
          name: "matrix-cs",
          value: props.answerMatrixCS,
          onChange: props.handleAnswerMatrixCS,
      },
  ];


  return (
    <div className="questionnaire-wrapper">
      <div className="text-section">
        <label>Notícia:</label>
        <textarea
          readOnly
          value={props.newsBody}
          rows={10}
          className="text-pane"
        />
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

      {isVisible && (
        <>
            <hr className="divider" />
            <div className="text-section">
                <label>Verificação:</label>
                <textarea
                  readOnly
                  value={props.verificationBody}
                  rows={10}
                  className="text-pane"
                />
            </div>
            <div className="questions-section">
                {subsequentQuestions.map((q) => (
                  <div key={q.idx} className="question-block">
                    <p className="question-text">{`${q.idx}. ${q.text}`}</p>
                    <ScaleOptions q={q} />
                  </div>
                ))}
                
                {/* Matrix Question */}
                <div className="question-block">
                    <p className="question-text">6. Em relação à verificação, como você percebe que outras pessoas avaliam a presença das seguintes características:</p>
                    <table className="matrix-table">
                        <thead>
                            <tr>
                                <th></th>
                                {SCALES.likert.labels.map((label, index) => (
                                    <th key={index} dangerouslySetInnerHTML={{ __html: label }} />
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrixQuestions.map((mq, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{mq.text}</td>
                                    {SCALES.likert.values.map((val) => (
                                        <td key={val}>
                                            <input
                                                type="radio"
                                                name={mq.name}
                                                checked={mq.value === val}
                                                onChange={() => mq.onChange(val)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
      )}
    </div>
  );
}