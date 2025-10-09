import React from "react";
import PasswordField from "./PasswordField";
import InterestsMatrix from "./InterestsMatrix";
import PoliticalLeaning from "./PoliticalLeaning";

interface IndexProps {
    handlePassword: (password: string) => void;
    handleInterestsMatrix: (rowIdx: number, score: number) => void;
    handlePoliticalLeaning: (score: number) => void;

    prolificId: string;
}

export default function Index(props: IndexProps) {
    const isDisabled = props.prolificId !== "";
    return (
        <div className="intro-wrapper">
            <h3 className="section-title">Introdução</h3>
            <p className="lead-paragraph">
                Olá! Você está participando de um experimento que tem como objetivo avaliar a percepção de usuários sobre análises textuais de notícias veiculadas na internet. Será apresentado 4 vezes: o corpo de uma notícia, seu veredito (indicando se ela é falsa, por exemplo) e uma análise da notícia.
                Sua tarefa consiste em responder a algumas questões sobre o veredito e a verificação passadas, escolhendo, dentre as alternativas fornecidas, a opção que melhor se adequar às suas percepções.
            </p>

            <h3 className="section-title">Instruções</h3>
            <p>
                Após ler atenciosamente ao corpo da notícia e o seu veredito, siga para as afirmações/questões abaixo dos textos. Leia cuidadosamente cada uma delas e marque a opção que você considera a mais correta. Todas as quatro telas nas quais você navegará terão as mesmas afirmações/questões e opções de respostas. As afirmações/questões são as seguintes:
            </p>
            <ol>
                <li>Você já viu essa notícia antes?</li>
                <li>Qual o seu grau de confiança em relação ao veredito antes de ler a explicação?</li>
            </ol>
            <p>Após responder às duas primeiras questões, você verá o texto de verificação da notícia. Leia-o atentamente e siga para as próximas afirmações/questões:</p>
            <ol>
                <li>Qual o seu grau de confiança em relação ao veredito depois de ler a explicação?</li>
                <li>A análise é completa e analisa com a profundidade que você esperaria de uma agência de fact checking?</li>
                <li>O texto é coerente, claro, e direto.</li>
                <li>
                    <ul>
                        <li>Em relação à verificação, como você percebe que outras pessoas avaliam as seguintes características:</li>
                        <ol>
                            <li>Persuasão - A verificação é persuasiva na justificativa da verificação</li>
                            <li>Persuasão - A verificação é persuasiva na justificativa da verificação</li>
                            <li>Consistência - O texto da verificação é fluido e as ideias são consistentes.</li>
                            <li>Facilidade de Leitura - A verificação é fácil de ser lida e interpretada.</li>
                            <li>Senso comum - A verificação segue o senso comum</li>
                        </ol>
                    </ul>
                </li>
            </ol>
            <p>
                Você navegará entre as páginas utilizando os botões de navegação presentes na parte de baixo de cada uma das quatro páginas. Você só poderá prosseguir para os próximos textos após marcar sua opção de resposta para cada afirmação/questão.
            </p>
            <p className="notice">
                O tempo estimado para o preenchimento deste formulário é de até 15 minutos, podendo ser mais rápido. <strong>Caso você não tenha acessado essa página pelo Prolific, a sessão será expirada em 30 minutos e seu preenchimento descartado, então por favor, finalize a pesquisa de uma só vez.</strong>
            </p>

            <h3 className="section-title">Consentimento</h3>
            <div className="consent-card">
                <p>
                    <strong>Você poderá ser exposto a textos que apresentem conteúdos e temas sensíveis.</strong> Antes de prosseguir, acesse o Formulário de Consentimento presente neste link:{" "}
                    <a className="consent-link" href="https://drive.google.com/file/d/13diSzU6gRZoAIctVAU07k3F0TGrhMPH4/view?usp=sharing" target="_blank" rel="noreferrer">
                        Formulário de Consentimento
                    </a>.
                </p>
                <p>
                    <strong>Prossiga para a próxima etapa apenas se concordar em participar do survey.</strong>
                </p>
                <p className="muted">
                    Caso você prossiga, estará atestando que leu o Formulário de Consentimento e consente em participar deste estudo. Você ainda poderá se remover do estudo a qualquer momento que desejar. Para iniciar o survey responda à questão abaixo e clique em seguir.
                </p>
            </div>

            <hr className="divider" />

            <div className="questions-section">
                <h3 className="section-title">{`Campo de senha`}</h3>
                <div className="question-block-new" style={{ marginTop: '-1rem' }}>
                    <PasswordField changeHandler={props.handlePassword} disabled={isDisabled} />
                </div>
                <div className="question-block-new">
                    <PoliticalLeaning changeHandler={props.handlePoliticalLeaning} />
                </div>
                <div className="question-block-new">
                    <InterestsMatrix changeHandler={props.handleInterestsMatrix} />
                </div>
            </div>
        </div>
    );
}