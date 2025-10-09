import PolarizationPopUp from '@/components/survey/PolarizationPopUp';
import Questionnaire from '@/components/survey/Questionnaire';
import { useEffect, useState } from 'react';
import { RedirectType, useRouter, useSearchParams } from 'next/navigation';
import LoadingMessage from '@/components/survey/LoadingMessage';
import pushPayload from '@/components/common/Payload';
import updateUserId from '@/components/common/UserId';
import { SurveyPayload } from '@/components/common/Models';


export default function Survey() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    // const [maxProgresTweet, setMaxProgress] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);

    // News related info
    const [newsBody, setNews] = useState("");
    const [verdict, setVerdict] = useState("");
    const [verificationBody, setVerification] = useState("");

    // User responses
    const [answerSA, setAnswerSA] = useState(0);
    const [answerCBA, setAnswerCBA] = useState(0);
    const [answerCAA, setAnswerCAA] = useState(0);
    const [answerDE, setAnswerDE] = useState(0);
    const [answerCL, setAnswerCL] = useState(0);
    const [answerMatrixPE, setAnswerMatrixPE] = useState(0);
    const [answerMatrixCO, setAnswerMatrixCO] = useState(0);
    const [answerMatrixER, setAnswerMatrixER] = useState(0);
    const [answerMatrixCS, setAnswerMatrixCS] = useState(0);

    const [password, setPassword] = useState<string>("");
    const [prolificId, setProlificId] = useState<string>("");
    const [participantId, setParticipantId] = useState<string>("");

    const [payload, setPayload] = useState<SurveyPayload | null>(null);

    // backend functions
    const getParticipantStatus = async (pId: string) => {
        const response = await fetch('/api/participant/retrieve_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId })
        });
        const data = await response.json();
        return data;
    };

    const checkAnswers = async (pId: string, pageNumber: number) => {
        const response = await fetch(`/api/answer/retrieve_answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, "pageNumber": pageNumber })
        });
        const data = await response.json();
        return data;
    };

    const createAnswer = async (pId: string, pageNumber: number) => {
        const response = await fetch(`/api/answer/create_answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, "pageNumber": pageNumber })
        });
        const data = await response.json();
        return data;
    };

    const getTexts = async (pId: string, pageNumber: number) => {
        const response = await fetch(`/api/verification/retrieve_data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, "pageNumber": pageNumber })
        });

        const data = await response.json();
        return data;
    };

    const updateParticipantLastUpdateTime = async (pId: string) => {
        const response = await fetch('/api/participant/update_last_update_time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId })
        });
        const data = await response.json();
        return data;
    }

    const setAnswers = async (
        participantId: string,
        pageNumber: number,
    ) => {
        const bodyObj = {
            pId: participantId,
            pageNumber: pageNumber,
            answers: {
                question_sa: answerSA,
                question_cba: answerCBA,
                question_caa: answerCAA,
                question_de: answerDE,
                question_cl: answerCL,
                matrix_pe: answerMatrixPE,
                matrix_co: answerMatrixCO,
                matrix_er: answerMatrixER,
                matrix_cs: answerMatrixCS
            }
        }
        const response = await fetch(`/api/answer/update_answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });
        const data = await response.json();
        return data;
    };

    const setParticipantStatus = async (pId: string, status: string) => {
        const response = await fetch('/api/participant/set_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, 'status': status })
        });
        const data = await response.json();
        return data;
    };

    // utils
    const getPageNumber = (status: string) => {
        switch (status) {
            case 'in_progress_a1':
                return 1;
            case 'in_progress_a2':
                return 2;
            case 'in_progress_a3':
                return 3;
            case 'in_progress_a4':
                return 4;
            default:
                return -1;
        }
    };

    const getNextStatus = (ttNumber: number) => {
        switch (ttNumber) {
            case 1:
                return 'in_progress_a2';
            case 2:
                return 'in_progress_a3';
            case 3:
                return 'in_progress_a4';
            case 4:
                return 'completed';
            default:
                return "ERROR";
        }
    };

    const resetAnswers = () => {
        setAnswerSA(0);
        setAnswerCBA(0);
        setAnswerCAA(0);
        setAnswerDE(0);
        setAnswerCL(0);
        setAnswerMatrixPE(0);
        setAnswerMatrixCO(0);
        setAnswerMatrixER(0);
        setAnswerMatrixCS(0);
        setTimeSpent(0);
    };

    const goToPreviousVerification = async () => {
        setIsLoading(true);
        const redirect = await tryUpdateLastUpdateTime(participantId);
        if (redirect) {
            return;
        }
        const previousPage = pageNumber - 1;
        getTexts(participantId, previousPage).then((data) => {
            setTextsState(data);
        });
        checkAnswers(participantId, previousPage).then((data) => {
            setPageNumber(previousPage);
            if (data) {
                // setAnswerExists(true);
                setAnswersState(data);
                // setTimeSpent(data.time);
            } else {
                // setAnswerExists(false);
                resetAnswers();
            }
            setIsLoading(false);
        });
    };

    const setTextsState = (data: any) => {
        setVerdict(data.verdict);
        setNews(data.news_text);
        setVerification(data.verification_text);
    };

    const setAnswersState = (data: any) => {
        setAnswerSA(data.question_sa || 0);
        setAnswerCBA(data.question_cba || 0);
        setAnswerCAA(data.question_caa || 0);
        setAnswerDE(data.question_de || 0);
        setAnswerCL(data.question_cl || 0);
        setAnswerMatrixPE(data.matrix_pe || 0);
        setAnswerMatrixCO(data.matrix_co || 0);
        setAnswerMatrixER(data.matrix_er || 0);
        setAnswerMatrixCS(data.matrix_cs || 0);
    };

    const tryUpdateLastUpdateTime = async (participantId: string) => {
        const data = await updateParticipantLastUpdateTime(participantId);
        let redirect = false;
        if ("validity_res" in data) {
            alert("Sua sessão expirou ou é inválida. Você será redirecionado para a página inicial.");
            router.push("/");
            redirect = true;
        }
        return redirect;
    }

    const checkSucessAnswerUpdate = async (data: object) => {
        return ("validity_res" in data);
    }

    const checkAnswersExists = async (participantId: string, pagNumber: number) => {
        const answerData = await checkAnswers(participantId, pageNumber);
        return answerData !== null;
    }


    // button handlers
    const handleNextButton = async () => {
        if (!hasAllAnswers()) {
            alert("Por favor, responda todas as perguntas antes de prosseguir.");
        } else {
            setIsLoading(true);

            const answerExists = await checkAnswersExists(participantId, pageNumber);
            if (!answerExists) {
                const answerCreationData = await createAnswer(participantId, pageNumber);
                if ("validity_res" in answerCreationData) {
                    console.log(answerCreationData);
                    alert("Sua sessão expirou ou é inválida. Você será redirecionado para a página inicial.");
                    router.push("/");
                    return;
                }
            }

            const redirect = await tryUpdateLastUpdateTime(participantId);
            if (redirect) {
                return;
            }
            
            setAnswers(participantId, pageNumber).then((setAnswerData) => {
                if(!checkSucessAnswerUpdate(setAnswerData)) {
                    alert("Houve um erro ao salvar suas respostas. Por favor, tente novamente.");
                    setIsLoading(false);
                    console.log(setAnswerData);
                    return;
                }
                var nextState = getNextStatus(pageNumber);

                setParticipantStatus(participantId, nextState).then(() => {
                    if (nextState === "completed") {
                        const endingRoute = password !== "" ? `/ending` : `/ending/?PROLIFIC_ID=${prolificId}`;
                        pushPayloadAndPushRoute(password, endingRoute);
                        return;
                    } else {
                        const newPageNumber = pageNumber + 1;
                        setPageNumber(newPageNumber);
                        // setAnswerExists(false);
                        getTexts(participantId, newPageNumber).then((data) => {
                            setTextsState(data);
                        });
                        checkAnswers(participantId, newPageNumber).then((data) => {
                            if (data) {
                                // setAnswerExists(true);
                                setAnswersState(data);
                                // setTimeSpent(data.time);
                            } else {
                                // setAnswerExists(false);
                                resetAnswers();
                            }
                            setIsLoading(false);
                        });
                    }
                });
            });
        }
    };

    function hasSomeAnswer() {
        return (answerCAA != 0 || answerCBA != 0 || answerSA != 0 || answerDE != 0 || answerCL != 0 || answerMatrixPE != 0 || answerMatrixCO != 0 || answerMatrixER != 0 || answerMatrixCS != 0);
    }

    function hasAllAnswers() {
        return (answerCAA != 0 && answerCBA != 0 && answerSA != 0 && answerDE != 0 && answerCL != 0 && answerMatrixPE != 0 && answerMatrixCO != 0 && answerMatrixER != 0 && answerMatrixCS != 0);
    }

    function pushPayloadAndPushRoute(password: string, route: string) {
        pushPayload(password);
        setIsLoading(false);
        router.push(route);
    }

    const handlePreviousButton = () => {
        if (hasAllAnswers()) {
            setAnswers(participantId, pageNumber).then((setAnswerData) => {
                if(!checkSucessAnswerUpdate(setAnswerData)) {
                    alert("Houve um erro ao salvar suas respostas. Por favor, tente novamente.");
                    setIsLoading(false);
                    console.log(setAnswerData);
                    return;
                }
                goToPreviousVerification();
            });
        } else if (hasSomeAnswer()) {
            const confimation = confirm("Tem certeza que quer voltar? Suas respostas não finalizadas serão perdidas. Você pode terminar de preencher esta página antes de voltar.");
            if (confimation) {
                goToPreviousVerification();
            }
        // Has not selected any answers
        } else {
            goToPreviousVerification();
        }
    };

    useEffect(() => {
        // pId will be equal to prolificId (exclusive) or password
        const [prolificId, password, pId] = updateUserId(searchParams, setPayload, setProlificId, setParticipantId, setPassword, router);
        if (prolificId === "" && password === "") {
            alert("Parece que você não acessou o survey pelo Prolific ou não preencheu o campo de senha. Por favor, acesse a pesquisa novamente pelo link provido.");
            router.push("/");
            return;
        }

        setIsLoading(true);
        try {
            getParticipantStatus(pId).then((data) => {
                switch (data.status) {
                    case 'new':
                        tryUpdateLastUpdateTime(pId).then((redirect) => {
                            if (redirect) {
                                return;
                            }
                            setParticipantStatus(pId, 'in_progress_a1');
                            setPageNumber(1);
                            // setMaxProgress(1);
                            getTexts(pId, 1).then((data) => {
                                setTextsState(data);
                            });
                        });
                        break;
                    case 'completed':
                        const endingRoute = password !== "" ? `/ending` : `/ending/?PROLIFIC_ID=${prolificId}`;
                        pushPayloadAndPushRoute(password, endingRoute);
                        return;
                    default:
                        const pageNumber = getPageNumber(data.status);
                        // const getTextsPageNumber = pageNumber === -1 ? 1 : pageNumber;
                        setPageNumber(pageNumber);
                        // setMaxProgress(pageNumber);

                        tryUpdateLastUpdateTime(pId).then((redirect) => {
                            if (redirect) {
                                return;
                            }
                            getTexts(pId, pageNumber).then((data) => {
                                setTextsState(data);
                            });
                            checkAnswers(pId, pageNumber).then((data) => {
                                if (data !== null) {
                                    // setAnswerExists(true);
                                    setAnswerSA(data.question_sa);
                                    setAnswerCBA(data.question_cba);
                                    setAnswerCAA(data.question_caa);
                                    setAnswerDE(data.question_de);
                                    setAnswerCL(data.question_cl);
                                    setAnswerMatrixPE(data.matrix_pe);
                                    setAnswerMatrixCO(data.matrix_co);
                                    setAnswerMatrixER(data.matrix_er);
                                    setAnswerMatrixCS(data.matrix_cs);
                                    // setTimeSpent(data.time_spent);
                                }
                            });
                        });
                        break;
                } 
                setIsLoading(false);
            });
        } catch (error) {
            console.error(error);
        }
        const interval = setInterval(() => {
            setTimeSpent(timeSpent => timeSpent + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main>
            <header>
                <h4>Notícia {pageNumber} de 4</h4>
                <button id="inter-button" onClick={() => setShowPopup(!showPopup)}> ? </button>
            </header>
            <div>
                {
                    showPopup ? <PolarizationPopUp closePopUp={() => setShowPopup(false)} /> : null
                }
            </div>
            <div>
                {
                    isLoading ? <LoadingMessage /> : null
                }
            </div>
            <Questionnaire
                newsBody={newsBody}
                verdict={verdict}
                verificationBody={verificationBody}
                answerSA={answerSA}
                answerCBA={answerCBA}
                answerCAA={answerCAA}
                answerDE={answerDE}
                answerCL={answerCL}
                answerMatrixPE={answerMatrixPE}
                answerMatrixCO={answerMatrixCO}
                answerMatrixER={answerMatrixER}
                answerMatrixCS={answerMatrixCS}
                handleAnswerSA={(value: number) => setAnswerSA(value)}
                handleAnswerCBA={(value: number) => setAnswerCBA(value)}
                handleAnswerCAA={(value: number) => setAnswerCAA(value)}
                handleAnswerDE={(value: number) => setAnswerDE(value)}
                handleAnswerCL={(value: number) => setAnswerCL(value)}
                handleAnswerMatrixPE={(value: number) => setAnswerMatrixPE(value)}
                handleAnswerMatrixCO={(value: number) => setAnswerMatrixCO(value)}
                handleAnswerMatrixER={(value: number) => setAnswerMatrixER(value)}
                handleAnswerMatrixCS={(value: number) => setAnswerMatrixCS(value)}
            />
            <br
            />
            <div className="nav-buttons">
                {
                    pageNumber > 1 ?
                        <div className="previous-button">
                            <button onClick={handlePreviousButton}>&lt; Verificação Anterior</button>
                        </div>
                        : null
                }
                <div className="next-button">
                    <button onClick={handleNextButton}>Próxima Verificação &gt;</button>
                </div>
            </div>
        </main>
    )
}