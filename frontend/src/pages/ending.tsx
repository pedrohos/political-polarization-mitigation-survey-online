import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import updateUserId from '@/components/common/UserId';
import { useSearchParams } from 'next/navigation';
import { getParticipantStatus } from  '@/components/common/API';

export default function EndingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // type URLCodes = {
    //     [dict_key: string]: string;
    // };
    // const urlCodes: URLCodes = {
    //     'machine' : 'C1B3VICO',
    //     'human' : 'CWRVAUTB',
    //     'placebo' : 'C2Q0LH1X',
    //     'default' : 'CKGSLL86'
    // }

    const [userSessionID, setUserSessionID] = useState<string>("");
    const [prolificId, setProlificId] = useState<string>("");
    const [participantId, setParticipantId] = useState<string>("");


    const endClick = () => {
        // TODO: Get participant id from payload or password and only set redirection if participant id equals prolific id
        let redirectToProlific = false;
        if (prolificId !== "") {
            redirectToProlific = true;
            if (redirectToProlific) {
                const urlCode = "INSERT_HERE_COMPLETE_CODE";
                window.location.href = `https://app.prolific.com/submissions/complete?cc=${urlCode}`;
            }
        } else {
            alert("Parece que você não acessou o survey pelo Prolific. Se isso estiver certo, pode fechar a página, obrigado pela participação! Caso você seja um usuário do Prolific, por favor acesse novamente o link da pesquisa.");
        }
    }

    useEffect(() => {
        let [localProlificId, localUserSessionID, localPId] = updateUserId(searchParams, setProlificId, setParticipantId, setUserSessionID, router);

        if (localPId === "" || localPId === null) {
            alert("Sua sessão está inválida. Por favor, acesse o link recebido da survey novamente.");
            router.push("/");
            return;
        }

        try {
            getParticipantStatus(localPId).then((participantStatusData) => {
                switch (participantStatusData.status) {
                    case 'completed':
                        break
                    default:
                        // If the participant reached the ending page without completing the survey, redirect to the survey page
                        let surveyRoute = localUserSessionID !== "" ? `/survey` : `/survey/?PROLIFIC_ID=${localProlificId}`;
                        router.push(surveyRoute);
                        return;
                }
            });
        } catch (error) {
            console.error(error);
        }
    }, []);

    return (
        <div id="ending">
            <h1>Muito obrigado pela sua participação!</h1>
            {prolificId !== "" &&
                <div>
                    <h3>Para finalizar o survey clique no botão abaixo e você será redirecionado de volta ao Prolific para completar sua participação.</h3>
                    <button onClick={endClick}>Finalizar</button>
                </div>
            }
        </div>
    )
}