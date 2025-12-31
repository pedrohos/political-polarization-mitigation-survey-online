import PolarizationPopUp from '@/components/survey/PolarizationPopUp';
import QuestionnairePart1 from '@/components/survey/QuestionnairePart1';
import QuestionnairePart2 from '@/components/survey/QuestionnairePart2';
import { useEffect, useState } from 'react';
import { RedirectType, useRouter, useSearchParams } from 'next/navigation';
import LoadingMessage from '@/components/survey/LoadingMessage';
import pushPayload from '@/components/common/Payload';
import updateUserId from '@/components/common/UserId';
import { getParticipantStatus } from  "@/components/common/API";

export default function Survey() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // In the range 1-4
    const [pageNumber, setPageNumber] = useState(1);
    const [inFirstSection, setInFirstSection] = useState(true);
    
    // const [timeSpent, setTimeSpent] = useState(0);
    const [disableFirstSection, setDisableFirstSection] = useState(false);

    // News related info
    const [newsBody, setNews] = useState("");
    const [verdict, setVerdict] = useState("");
    const [verificationBody, setVerification] = useState("");

    // Section button text
    const [previousButtonText, setPreviousButtonText] = useState("Verificação anterior");
    const [nextButtonText, setNextButtonText] = useState("Próxima verificação");

    // User responses
    const [answerSA, setAnswerSA] = useState(0);
    const [answerCBA, setAnswerCBA] = useState(0);
    const [answerCAA, setAnswerCAA] = useState(0);
    const [answerDE, setAnswerDE] = useState(0);
    const [answerMatrixPE, setAnswerMatrixPE] = useState(0);
    const [answerMatrixCO, setAnswerMatrixCO] = useState(0);
    const [answerMatrixCS, setAnswerMatrixCS] = useState(0);
    const [answerMatrixRankSQ, setAnswerMatrixRankSQ] = useState(0);
    const [answerMatrixRankPC, setAnswerMatrixRankPC] = useState(0);
    const [answerMatrixRankTC, setAnswerMatrixRankTC] = useState(0);
    const [answerMatrixRankCS, setAnswerMatrixRankCS] = useState(0);
    const [answerMatrixRankNE, setAnswerMatrixRankNE] = useState(0);

    const [userSessionID, setUserSessionID] = useState<string>("");
    const [prolificId, setProlificId] = useState<string>("");
    const [participantId, setParticipantId] = useState<string>("");

    // backend functions
    const checkAnswers = async (pId: string, pageNumber: number) => {
        const response = await fetch('/api/checkAnswers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pId, pageNumber }),
        });
        const data = await response.json();
        return data;
    };

    const createAnswer = async (pId: string, pageNumber: number) => {
        const response = await fetch(`/api/createAnswer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, "pageNumber": pageNumber })
        });
        const data = await response.json();
        return data;
    };

    const getTexts = async (pId: string, pageNumber: number) => {
        const response = await fetch(`/api/getTexts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, "pageNumber": pageNumber })
        });

        const data = await response.json();
        return data;
    };

    const updateParticipantLastUpdateTime = async (pId: string) => {
        const response = await fetch(`/api/updateParticipantLastUpdateTime`, {
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
        inFirstSection: boolean
    ) => {
        const bodyObj = {
            pId: participantId,
            pageNumber: pageNumber,
            answers: {
                question_sa: answerSA,
                question_cba: answerCBA,
                question_caa: answerCAA,
                question_de: answerDE,
                matrix_pe: answerMatrixPE,
                matrix_co: answerMatrixCO,
                matrix_cs: answerMatrixCS,
                matrix_rank_sq: answerMatrixRankSQ,
                matrix_rank_pc: answerMatrixRankPC,
                matrix_rank_tc: answerMatrixRankTC,
                matrix_rank_cs: answerMatrixRankCS,
                matrix_rank_ne: answerMatrixRankNE,
            },
            inFirstSection: inFirstSection
        }
        const response = await fetch(`/api/setAnswers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });
        const data = await response.json();
        return data;
    };

    const setParticipantStatus = async (pId: string, status: string) => {
        const response = await fetch(`/api/setParticipantStatus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'pId': pId, 'status': status })
        });
        const data = await response.json();
        return data;
    };

    const completionStatus = ["in_progress_a1_1", "in_progress_a1_2", "in_progress_a2_1", "in_progress_a2_2", "in_progress_a3_1", "in_progress_a3_2", "in_progress_a4_1", "in_progress_a4_2", "completed"];

    // utils
    const getPageNumber = (status: string) => {
        const index = completionStatus.findIndex((s) => s === status);
        // Maps 0,1 -> 1; 2,3 -> 2; 4,5 ->3; 6,7 ->4
        return Math.ceil((index + 1) / 2)
    };

    const getNextStatus = (curIndex: number, inFirstSection: boolean) => {
        const maxIndex = curIndex % 2 === 0 ? (completionStatus.length/2 + 1) : Math.ceil(completionStatus.length/2);
        if (curIndex > 0 && curIndex < maxIndex) {
            // Maps ttNumber to the range 1-8
            const newIndex = (curIndex * 2 - 1) + (inFirstSection ? 0 : 1);
            // ttNumber is 1-indexed, so there is no need to get ttNumber + 1
            return completionStatus[newIndex];
        } else {
            return "ERROR";
        }
    };

    const resetAnswers = () => {
        setAnswerSA(0);
        setAnswerCBA(0);
        setAnswerCAA(0);
        setAnswerDE(0);
        setAnswerMatrixPE(0);
        setAnswerMatrixCO(0);
        setAnswerMatrixCS(0);
        setAnswerMatrixRankSQ(0);
        setAnswerMatrixRankPC(0);
        setAnswerMatrixRankTC(0);
        setAnswerMatrixRankCS(0);
        setAnswerMatrixRankNE(0);
    };

    const goToPreviousVerification = async () => {
        setIsLoading(true);
        const redirect = await tryUpdateLastUpdateTime(participantId);
        if (redirect) {
            return;
        }
        // Only decrement page number when going back from section 2 to section 1
        const previousPage = inFirstSection ? pageNumber - 1 : pageNumber;
        
        let localDisableFirstSection = false;
        if (inFirstSection) {
            checkAnswersExists(participantId, previousPage).then(async (exists) => {
                if (exists) {
                    localDisableFirstSection = true;
                }
                setDisableFirstSection(localDisableFirstSection);
            });
        }

        getTexts(participantId, previousPage).then((data) => {
            setTextsState(data);
        });
        checkAnswers(participantId, previousPage).then((data) => {
            setPageNumber(previousPage);
            setInFirstSection(!inFirstSection);
            updateSectionTexts(previousPage, !inFirstSection);
            if (data) {
                setAnswersState(data);
                // setTimeSpent(data.time);
            } else {
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
        setAnswerMatrixPE(data.matrix_pe || 0);
        setAnswerMatrixCO(data.matrix_co || 0);
        setAnswerMatrixCS(data.matrix_cs || 0);
        setAnswerMatrixRankSQ(data.matrix_rank_sq || 0);
        setAnswerMatrixRankPC(data.matrix_rank_pc || 0);
        setAnswerMatrixRankTC(data.matrix_rank_tc || 0);
        setAnswerMatrixRankCS(data.matrix_rank_cs || 0);
        setAnswerMatrixRankNE(data.matrix_rank_ne || 0);
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

    const checkAnswersExists = async (participantId: string, pageNumber: number) => {
        const answerData = await checkAnswers(participantId, pageNumber);
        return answerData !== null;
    }


    // button handlers
    const handleNextButton = async () => {
        // debugger;
        if ((!hasAllAnswersFirstSection() && inFirstSection && !disableFirstSection) || (!hasAllAnswersSecondSection() && !inFirstSection)) {
            alert("Por favor, responda todas as perguntas antes de prosseguir.");
        } else {
            setIsLoading(true);

            // Create answer entry if it does not exist yet (it will be initialized with all sections as 0)
            const answerExists = await checkAnswersExists(participantId, pageNumber);
            if (inFirstSection && !answerExists) {
                const confimation = confirm("Tem certeza que deseja avançar esta seção? Não será possível alterar suas escolhas.");
                if (!confimation) {
                    setIsLoading(false);
                    return;
                }
                const answerCreationData = await createAnswer(participantId, pageNumber);
                if ("validity_res" in answerCreationData) {
                    console.log(answerCreationData);
                    alert("Sua sessão expirou ou é inválida. Você será redirecionado para a página inicial.");
                    router.push("/");
                    return;
                }
            }

            // If the session is still valid, update last update time, else redirect to home
            const redirect = await tryUpdateLastUpdateTime(participantId);
            if (redirect) {
                return;
            }
            
            // Only allow answer updates if they are mode on the second section or if the first did not exist before
            // This is done to avoid the user to change answers on the first section after having seen the second one
            if (!inFirstSection || (!answerExists && inFirstSection)) {
                // Updates answers with the current state of the answers
                const setAnswerData = await setAnswers(participantId, pageNumber, inFirstSection);
                if(!checkSucessAnswerUpdate(setAnswerData)) {
                    alert("Houve um erro ao salvar suas respostas. Por favor, tente novamente.");
                    setIsLoading(false);
                    console.log(setAnswerData);
                    return;
                }
            }

            var nextState = getNextStatus(pageNumber, inFirstSection);

            setParticipantStatus(participantId, nextState).then(() => {
                if (nextState === "completed") {
                    const endingRoute = userSessionID !== "" ? `/ending` : `/ending/?PROLIFIC_ID=${prolificId}`;
                    pushPayloadAndPushRoute(userSessionID, endingRoute);
                    return;
                } else {
                    // Only increment page number on switching from question 1 to question 2
                    let newPageNumber = null;
                    let changedQuestion = false;
                    if (inFirstSection) {
                        newPageNumber = pageNumber;
                    } else {
                        newPageNumber = pageNumber + 1;
                        changedQuestion = true;
                    }
                    setInFirstSection(!inFirstSection);
                    setPageNumber(newPageNumber);
                    updateSectionTexts(newPageNumber, !inFirstSection);

                     // If the user is altering the second session for the second time, update the disable first section. To avoid blocking the first section on the next question.
                    let localDisableFirstSection = false;
                    checkAnswersExists(participantId, newPageNumber).then(async (exists) => {
                        if (exists) {
                            localDisableFirstSection = true;
                        }
                        setDisableFirstSection(localDisableFirstSection);
                    });

                    // Fill in texts and answers for the new page for the use case of the user filled in those before
                    checkAnswers(participantId, newPageNumber).then((answersData) => {
                        if (answersData) {
                            setAnswersState(answersData);
                        } else {
                            resetAnswers();
                        }
                        
                        // Only fetch texts again if changing question (but not when changing section)
                        if (changedQuestion) {
                            getTexts(participantId, newPageNumber).then((textsData) => {
                                setTextsState(textsData);
                                setIsLoading(false);
                            });
                        } else {
                            setIsLoading(false);
                        }
                    });
                }
            });
        }
    };

    function hasSomeAnswerFirstSection() {
        return (answerSA != 0 || answerCBA != 0);
    }

    function hasSomeAnswerSecondSection() {
        return (answerCAA != 0 || answerDE != 0 || answerMatrixPE != 0 || answerMatrixCO != 0 || answerMatrixCS != 0) || (answerMatrixRankSQ + answerMatrixRankPC + answerMatrixRankTC + answerMatrixRankCS + answerMatrixRankNE) != 0;
    }

    function hasAllAnswersFirstSection() {
        return (answerSA != 0 && answerCBA != 0);
    }

    function hasAllAnswersSecondSection() {
        return (answerCAA != 0 && answerDE != 0 && answerMatrixPE != 0 && answerMatrixCO != 0 && answerMatrixCS != 0) && (answerMatrixRankSQ + answerMatrixRankPC + answerMatrixRankTC + answerMatrixRankCS + answerMatrixRankNE) == 3;
    }

    function pushPayloadAndPushRoute(userSessionID: string, route: string) {
        pushPayload(userSessionID);
        setIsLoading(false);
        router.push(route);
    }

    function updateSectionTexts(pageNumber: number, localInFirstSection: boolean) {
        if (localInFirstSection) {
            // Change the sections texts
            setPreviousButtonText("Verificação anterior");
            setNextButtonText("Próxima seção");
        } else {
            // Change the sections texts
            setPreviousButtonText("Seção anterior");
            if (pageNumber === 4 && !localInFirstSection) {
                setNextButtonText("Finalizar survey");
            } else {
                setNextButtonText("Próxima verificação");
            }
        }
    }

    const handlePreviousButton = () => {
        setIsLoading(true);
        let someAnswersFilledIn = ((hasSomeAnswerFirstSection() && inFirstSection) || (hasSomeAnswerSecondSection() && !inFirstSection));
        
        // If user is in the second section and has filled all answers, must save answers
        let mustSaveAnswers = !inFirstSection && hasAllAnswersSecondSection();
        // If not, must warn only if some answers are filled in. The warning should not appear if the first section is disabled while in the first section
        let mustWarn = !mustSaveAnswers && someAnswersFilledIn && (!disableFirstSection || !inFirstSection)

        if (mustSaveAnswers) {
            setAnswers(participantId, pageNumber, inFirstSection).then((setAnswerData) => {
                if(!checkSucessAnswerUpdate(setAnswerData)) {
                    alert("Houve um erro ao salvar suas respostas. Por favor, tente novamente.");
                    setIsLoading(false);
                    console.log(setAnswerData);
                    return;
                }
                goToPreviousVerification();
                setIsLoading(false);
                return;
            });
        } else if (mustWarn) {
            const confimation = confirm("Tem certeza que quer voltar? Suas respostas não finalizadas serão perdidas. Você pode terminar de preencher esta página antes de voltar.");
            if (confimation) {
                goToPreviousVerification();
                return;
            }
            setIsLoading(false);
            return;
        } else {
            goToPreviousVerification();
            setIsLoading(false);
            return;
        }        
    };

    useEffect(() => {
        // pId will be equal to prolificId (exclusive) or userSessionID
        setIsLoading(true);
        const [localProlificId, localUserSessionID, pId] = updateUserId(searchParams, setProlificId, setParticipantId, setUserSessionID, router);

        if (pId === "" || pId === null) {
            alert("Sua sessão está inválida. Por favor, acesse o link recebido da survey novamente.");
            router.push("/");
            return;
        }

        try {
            getParticipantStatus(pId).then((participantStatusData) => {
                switch (participantStatusData.status) {
                    case 'new':
                        tryUpdateLastUpdateTime(pId).then((redirect) => {
                            if (redirect) {
                                return;
                            }
                            setParticipantStatus(pId, 'in_progress_a1_1');
                            setPageNumber(1);
                            setInFirstSection(true);
                            // setMaxProgress(1);
                            getTexts(pId, 1).then((textsData) => {
                                setTextsState(textsData);
                                setIsLoading(false);
                            });

                            updateSectionTexts(pageNumber, true);
                        });
                        break;
                    case 'completed':
                        const endingRoute = localUserSessionID !== "" ? `/ending` : `/ending/?PROLIFIC_ID=${localProlificId}`;
                        pushPayloadAndPushRoute(localUserSessionID, endingRoute);
                        return;
                    default:
                        const pageNumber = getPageNumber(participantStatusData.status);
                        // const getTextsPageNumber = pageNumber === -1 ? 1 : pageNumber;
                        setPageNumber(pageNumber);
                        
                        // If the user already filled answers for the first section, disable altering them
                        let localDisableFirstSection = false;
                        if (inFirstSection) {
                            checkAnswersExists(pId, pageNumber).then(async (exists) => {
                                if (exists) {
                                    localDisableFirstSection = true;
                                }
                                setDisableFirstSection(localDisableFirstSection);
                            });
                        }
                            
                        // setMaxProgress(pageNumber);

                        tryUpdateLastUpdateTime(pId).then((willRedirect) => {
                            if (willRedirect) {
                                return;
                            }

                            let localInFirstSection = participantStatusData.status.endsWith("_1");
                            setInFirstSection(localInFirstSection);

                            updateSectionTexts(pageNumber, localInFirstSection);

                            getTexts(pId, pageNumber).then((textsData) => {
                                setTextsState(textsData);
                                checkAnswers(pId, pageNumber).then((answersData) => {
                                    if (answersData !== null) {
                                        resetAnswers();
                                        if (localInFirstSection) {
                                            setAnswerSA(answersData.question_sa);
                                            setAnswerCBA(answersData.question_cba);
                                        } else {
                                            setAnswerCAA(answersData.question_caa);
                                            setAnswerDE(answersData.question_de);
                                            setAnswerMatrixPE(answersData.matrix_pe);
                                            setAnswerMatrixCO(answersData.matrix_co);
                                            setAnswerMatrixCS(answersData.matrix_cs);
                                            setAnswerMatrixRankCS(answersData.matrix_rank_sq);
                                            setAnswerMatrixRankSQ(answersData.matrix_rank_pc);
                                            setAnswerMatrixRankPC(answersData.matrix_rank_tc);
                                            setAnswerMatrixRankTC(answersData.matrix_rank_cs);
                                            setAnswerMatrixRankNE(answersData.matrix_rank_ne);
                                        }
                                        // setTimeSpent(data.time_spent);
                                    }
                                    setIsLoading(false);
                                });
                            });
                        });
                        break;
                }
            });
        } catch (error) {
            console.error(error);
        }
        
        // const interval = setInterval(() => {
        //     setTimeSpent(timeSpent => timeSpent + 1);
        // }, 1000);
        // return {};() => clearInterval(interval);
    }, []);

    return (
        <main>
            <header>
                <h4 id="news-indicator-header">Notícia {pageNumber} de 4</h4>
                {/* <button id="inter-button" onClick={() => setShowPopup(!showPopup)}> ? </button> */}
            </header>
            <div>
                {
                    isLoading ? <LoadingMessage /> : null
                }
            </div>
            {
            inFirstSection ? 
                <QuestionnairePart1
                    newsBody={newsBody}
                    verdict={verdict}
                    answerSA={answerSA}
                    answerCBA={answerCBA}
                    disableFirstSection={disableFirstSection}
                    handleAnswerSA={(value: number) => setAnswerSA(value)}
                    handleAnswerCBA={(value: number) => setAnswerCBA(value)}
                /> :
                <QuestionnairePart2
                    newsBody={newsBody}
                    verdict={verdict}
                    verificationBody={verificationBody}
                    answerCAA={answerCAA}
                    answerDE={answerDE}
                    answerMatrixPE={answerMatrixPE}
                    answerMatrixCO={answerMatrixCO}
                    answerMatrixCS={answerMatrixCS}
                    answerMatrixRankSQ={answerMatrixRankSQ}
                    answerMatrixRankPC={answerMatrixRankPC}
                    answerMatrixRankTC={answerMatrixRankTC}
                    answerMatrixRankCS={answerMatrixRankCS}
                    answerMatrixRankNE={answerMatrixRankNE}
                    handleAnswerCAA={(value: number) => setAnswerCAA(value)}
                    handleAnswerDE={(value: number) => setAnswerDE(value)}
                    handleAnswerMatrixPE={(value: number) => setAnswerMatrixPE(value)}
                    handleAnswerMatrixCO={(value: number) => setAnswerMatrixCO(value)}
                    handleAnswerMatrixCS={(value: number) => setAnswerMatrixCS(value)}
                    handleAnswerMatrixRankSQ={(value: number) => setAnswerMatrixRankSQ(value)}
                    handleAnswerMatrixRankPC={(value: number) => setAnswerMatrixRankPC(value)}
                    handleAnswerMatrixRankTC={(value: number) => setAnswerMatrixRankTC(value)}
                    handleAnswerMatrixRankCS={(value: number) => setAnswerMatrixRankCS(value)}
                    handleAnswerMatrixRankNE={(value: number) => setAnswerMatrixRankNE(value)}
                />
            }
            <br
            />
            <div className="nav-buttons">
                {
                    (pageNumber > 1 || (pageNumber == 1 && !inFirstSection)) ?
                        <div className="previous-button">
                            <button onClick={handlePreviousButton}>&lt; {previousButtonText}</button>
                        </div>
                        : null
                }
                <div className="next-button">
                    <button onClick={handleNextButton}>{nextButtonText} &gt;</button>
                </div>
            </div>
        </main>
    )
}