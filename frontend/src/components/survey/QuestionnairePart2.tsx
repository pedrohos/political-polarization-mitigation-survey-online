import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

// Props interface defining all the state and handlers for the survey
interface QuestionnaireProps {
  handleAnswerCAA: (value: number) => void;
  handleAnswerDE: (value: number) => void;
  handleAnswerMatrixPE: (value: number) => void;
  handleAnswerMatrixCO: (value: number) => void;
  handleAnswerMatrixCS: (value: number) => void;
  handleAnswerMatrixRankSQ: (value: number) => void;
  handleAnswerMatrixRankPC: (value: number) => void;
  handleAnswerMatrixRankTC: (value: number) => void;
  handleAnswerMatrixRankCS: (value: number) => void;
  handleAnswerMatrixRankNE: (value: number) => void;

  answerCAA: number;
  answerDE: number;
  answerMatrixPE: number;
  answerMatrixCO: number;
  answerMatrixCS: number;
  answerMatrixRankSQ: number;
  answerMatrixRankPC: number;
  answerMatrixRankTC: number;
  answerMatrixRankCS: number;
  answerMatrixRankNE: number;

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
  "likert": {
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
  "rank_matrix": {
    labels: [
      "Top 1",
      "Top 2",
    ],
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

  // Definitions for the questions that appear after the verification text
  const subsequentQuestions: QuestionDef[] = [
    {
      text: "Qual o seu grau de confiança em relação ao veredito depois de ler a verificação?",
      name: "question-caa",
      value: props.answerCAA,
      onChange: props.handleAnswerCAA,
      idx: 3,
      type: "likert-qt",
    },
    {
      text: "A análise é completa e analisa com a profundidade que você esperaria de uma agência de fact checking.",
      name: "question-de",
      value: props.answerDE,
      onChange: props.handleAnswerDE,
      idx: 4,
      type: "likert",
    },
  ];
  
  // Definitions for the matrix-style question
  const matrixQuestions: MatrixQuestionDef[] = [
      {
          text: "Capacidade Persuasiva - A verificação é persuasiva.",
          name: "matrix-pe",
          value: props.answerMatrixPE,
          onChange: props.handleAnswerMatrixPE,
      },
      {
          text: "Coerência Textual - As ideias do texto são consistentes e de fácil leitura.",
          name: "matrix-co",
          value: props.answerMatrixCO,
          onChange: props.handleAnswerMatrixCO,
      },
      {
          text: "Plausível - A verificação é plausível e na sua visão de mundo ela é crível.",
          name: "matrix-cs",
          value: props.answerMatrixCS,
          onChange: props.handleAnswerMatrixCS,
      },
  ];

  // Definitions for the matrix-style question
  const matrixQuestionsRank: MatrixQuestionDef[] = [
      {
          text: "Qualidade de fontes e links - As fontes e links são de boa qualidade",
          name: "matrix-rank-sq",
          value: props.answerMatrixRankSQ,
          onChange: props.handleAnswerMatrixRankSQ,
      },
      {
          text: "Capacidade Persuasiva - A verificação é persuasiva.",
          name: "matrix-rank-pc",
          value: props.answerMatrixRankPC,
          onChange: props.handleAnswerMatrixRankPC,
      },
      {
          text: "Coerência Textual - As ideias do texto são consistentes e de fácil leitura",
          name: "matrix-rank-tc",
          value: props.answerMatrixRankTC,
          onChange: props.handleAnswerMatrixRankTC,
      },
      {
          text: "Senso Comum - A verificação é plausível e segue o senso comum",
          name: "matrix-rank-cs",
          value: props.answerMatrixRankCS,
          onChange: props.handleAnswerMatrixRankCS,
      },
      {
          text: "Novidade - A verificação apresenta informações ainda não conhecidas.",
          name: "matrix-rank-ne",
          value: props.answerMatrixRankNE,
          onChange: props.handleAnswerMatrixRankNE,
      },
  ];

  // Handler to enforce only one selection per column (Top1 / Top2).
  // When a value is selected for a row, clear the same value in any other row.
  function handleRankChange(rowIndex: number, value: number) {
    const rankValues = [
      props.answerMatrixRankSQ,
      props.answerMatrixRankPC,
      props.answerMatrixRankTC,
      props.answerMatrixRankCS,
      props.answerMatrixRankNE,
    ];

    const rankHandlers = [
      props.handleAnswerMatrixRankSQ,
      props.handleAnswerMatrixRankPC,
      props.handleAnswerMatrixRankTC,
      props.handleAnswerMatrixRankCS,
      props.handleAnswerMatrixRankNE,
    ];

    // Clear any other row that currently holds this value
    rankValues.forEach((rv, idx) => {
      if (idx !== rowIndex && rv === value) {
        rankHandlers[idx](0);
      }
    });

    // Set the selected row to the chosen value
    rankHandlers[rowIndex](value);
  }


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
        <label>Verificação:</label>
        <div className="text-pane markdown-pane">
          <ReactMarkdown
            children={props.verificationBody}
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
      <>
          <hr className="divider" />
          <div className="questions-section">
              {subsequentQuestions.map((q) => (
                <div key={q.idx} className="question-block">
                  <p className="question-text">{`${q.idx}. ${q.text}`}</p>
                  <ScaleOptions q={q} />
                </div>
              ))}
              
              {/* Matrix Question */}
              <div className="question-block">
                  <p className="question-text">5. Em relação à verificação, avalie a presença das seguintes características de acordo com suas percepções:</p>
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
              {/* Ranking Matrix Question - Only two columns TOP 1 and TOP 2. Only two items at most must be selected */}
              <div className="question-block">
                  <p className="question-text">6. Em relação à verificação, selecione as duas características que você considera mais importantes:</p>
                  <table className="matrix-table">
                      <thead>
                          <tr>
                              <th></th>
                              {SCALES.rank_matrix.labels.map((label, index) => (
                                  <th key={index} dangerouslySetInnerHTML={{ __html: label }} />
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {matrixQuestionsRank.map((mq, rowIndex) => (
                              <tr key={rowIndex}>
                                  <td>{mq.text}</td>
                                  {SCALES.rank_matrix.values.map((val) => (
                                      <td key={val}>
                                          <input
                                              type="radio"
                                              name={mq.name}
                                              checked={mq.value === val}
                        onChange={() => handleRankChange(rowIndex, val)}
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
    </div>
  );
}