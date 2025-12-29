import React from "react";

interface IndexProps {
    prolificId: string;
}

export default function Index(props: IndexProps) {
    const isProlificUser = props.prolificId !== "";
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
                <li>Qual o seu grau de confiança em relação ao veredito?</li>
            </ol>
            <p>Após responder às duas primeiras questões, você verá o texto de verificação da notícia. Leia-o atentamente e siga para as próximas afirmações/questões:</p>
            <ol>
                <li>Qual o seu grau de confiança em relação ao veredito depois de ler a verificação?</li>
                <li>A análise é completa e analisa com a profundidade que você esperaria de uma agência de fact checking.</li>
                <li>O texto é coerente, claro, e direto.</li>
                <li>
                    <ul>
                        <li>Em relação à verificação, como você percebe que outras pessoas avaliam as seguintes características:</li>
                        <ol>
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

            {/* TODO: UNCOMMENT BELOW AND SET THE CORRECT TIME AFTER PILOT TEST */}
            {/* {isProlificUser && 
                <p className="notice">
                    O tempo estimado para o preenchimento deste formulário é de até 1 hora, podendo ser mais rápido.
                </p>
            }
            {!isProlificUser &&
                <p className="notice">
                    O tempo estimado para o preenchimento deste formulário é de até 1 hora, podendo ser mais rápido. <strong>A sua sessão será expirada em 30 minutos e seu preenchimento descartado, então por favor, finalize a pesquisa de uma só vez.</strong> Caso sua conexão caia, você pode recarregar a página sem perder seu progresso salvo.
                </p>
            } */}

            <h3 className="section-title">Consentimento</h3>
            {!isProlificUser && 
                <div className="consent-card">
                    <p>
                        <strong>Você poderá ser exposto a textos que apresentem conteúdos e temas sensíveis.</strong> Antes de prosseguir, acesse o Formulário de Consentimento presente neste link: <a href="https://docs.google.com/document/d/125TVkjjsrpSmVI89ar46UZYTP7Rk3V3uc-zo6Ryqblw/edit?usp=sharing" target="_blank">Formulário de Consentimento</a>.
                    </p>
                    <p>
                        <strong>Prossiga para a próxima etapa apenas se concordar em participar do survey e se concordar com os termos apresentados no formulário de consentimento.</strong>
                    </p>
                    <p className="muted">
                        Caso você prossiga, estará atestando que consente em participar deste estudo e que leu e concorda com os termos apresentados no formulário de consentimento. Você ainda poderá se remover do estudo a qualquer momento que desejar. Para iniciar a survey clique em seguir.
                    </p>
                </div>
            }
            {isProlificUser && 
                <div className="consent-card">
                    <p>
                        <strong>Você poderá ser exposto a textos que apresentem conteúdos e temas sensíveis.</strong> Antes de prosseguir, acesse o Formulário de Consentimento presente neste link: <a href="https://docs.google.com/document/d/1regcA1jpDz0DMQ1MFquwy3w7NnxwJRhj-m_oFTp-pj4/edit?usp=sharing" target="_blank">Formulário de Consentimento</a>.
                    </p>
                    <p>
                        <strong>Prossiga para a próxima etapa apenas se concordar em participar do survey e se concordar com os termos apresentados no formulário de consentimento.</strong>
                    </p>
                    <p className="muted">
                        Caso você prossiga, estará atestando que consente em participar deste estudo e que leu e concorda com os termos apresentados no formulário de consentimento. Você ainda poderá se remover do estudo a qualquer momento que desejar. Para iniciar a survey clique em seguir.
                    </p>
                </div>
            }
        </div>
    );
}