import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import updateUserId from '@/components/common/UserId';
import { useSearchParams } from 'next/navigation';
import { SurveyPayload } from '@/components/common/Models';

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

    const [password, setPassword] = useState<string>("");
    const [prolificId, setProlificId] = useState<string>("");
    const [participantId, setParticipantId] = useState<string>("");
    // const [participantGroup, setParticpantGroup] = useState('');
    
    const [payload, setPayload] = useState<SurveyPayload | null>(null);

    const setParticipantStatus = async (pId: string, status: string) => {
        const response = await fetch('/api/set_participant_status/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'pId': pId, 'status': status})
        });
        const data = await response.json();
        return data;
    };

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

    const getParticipantGroup = async (pId: string) => {
        const response = await fetch(`/api/get_participant_group/${pId}`);
        const data = await response.json();
        return data;
    };

    useEffect(() => {
        updateUserId(searchParams, setPayload, setProlificId, setParticipantId, setPassword, router);
        
    }, []);

    return (
        <div id="ending">
            <h1>Muito obrigado pela sua participação!</h1>
            <h3>Para finalizar o survey clique no botão abaixo, caso você seja um usuário do prolific você será redirecionado
                de volta ao Prolific.</h3>
            <button onClick={endClick}>Finalizar</button>
        </div>
    )
}