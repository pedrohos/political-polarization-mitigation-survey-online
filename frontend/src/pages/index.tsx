import PolarizationDef from "@/components/PolarizationDef";
import PoliticalLeaning from "@/components/index/PoliticalLeaning";
import SeguirButton from "@/components/index/SeguirButton";
import PasswordField from "@/components/index/PasswordField";
import InterestsMatrix from "@/components/index/InterestsMatrix";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import exampleImg from '../figs/survey-example.jpg';
import LoadingMessage from "@/components/survey/LoadingMessage";
import pushPayload from "@/components/common/Payload";
import Index from "@/components/index/Index";

function getCurrentTime() {
  return new Date().toISOString().replace("Z", "");
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // const [sessionId, setSessionId] = useState<string>("");
  const [participantLeaning, setParticipantLeaning] = useState<number>(0);
  const [interestsMatrix, setInterests] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  
  const [password, setPassword] = useState<string>("");
  const [prolificId, setProlificId] = useState<string>("");
  // const [participantId, setParticipantId] = useState<string>("");
  const curTime = getCurrentTime();

  const router = useRouter();

  const setInterestsMatrixHandler = (rowIdx: number, score: number) => {
    const newInterests = [...interestsMatrix];
    newInterests[rowIdx] = score;
    setInterests(newInterests);
  }
  
  // backend functions
  const checkParticipant = async (pId: string) => {
    console.log("Requesting to");
    const response = await fetch('/api/participant/retrieve_status', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({'pId': pId})
    });
    const data = await response.json();
    console.log(data);
    return data;
  };

  const addParticipant = async (pId: string, isProlific: boolean, curTime: string, politicalLean: number, interestsMatrix: number[]) => {
    const response = await fetch('/api/participant/create_participant', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({'pId': pId, 'isProlific': isProlific, 'curTime': curTime, 'politicalLean': politicalLean, 'interestsMatrix': interestsMatrix})
    });
    const data = await response.json();
    console.log(data);
    return data;
  };

  // button handler
  const nextButtonHandler = () => {
    if (participantLeaning === 0) {
      alert("Por favor, selecione uma opção válida de posicionamento antes de prosseguir.");
      return;
    }
    if(password === "" && prolificId === "") {
        alert("Por favor, preencha uma senha única antes de prosseguir.");
        return;
    }
    for (var i = 0; i < interestsMatrix.length; i++) {
      if (interestsMatrix[i] === 0) {
        alert("Por favor, preencha todos os campos da matriz de consumo de notícias antes de prosseguir.");
        return;
      }
    }

    if (password !== "" && prolificId !== "") {
      alert("Por favor, preencha apenas UM dos campos: senha ou Prolific ID.");
      return;
    }

    // let localProlificId = "";
    // let isPassword = null;
    // if (password !== "") {
    //   id = password;
    //   isPassword = true;
    // } else {
    //   id = prolificId;
    //   isPassword = false;
    // }
    const idToCheck = password !== "" ? password : prolificId;
    const isPassword = password === idToCheck;

    try {
      checkParticipant(idToCheck).then((data) => {
        let surveyRoute = isPassword ? `/survey` : `/survey/?PROLIFIC_ID=${idToCheck}`;
        let endingRoute = isPassword ? `/ending` : `/ending/?PROLIFIC_ID=${idToCheck}`;
        if (isPassword) {
          pushPayload(password);
        }
        const isProlific = !isPassword;
        
        switch (data.status) {
          case 'in_progress_a1':
          case 'in_progress_a2':
          case 'in_progress_a3':
          case 'in_progress_a4':
            router.push(surveyRoute);
            break;
          case 'completed':
            router.push(endingRoute);
            break;
          case 'new':
          default:
            addParticipant(idToCheck, isProlific, curTime, participantLeaning, interestsMatrix).then((addParticipantData) => {
              if ("completed" in addParticipantData) {
                alert("Você já completou o survey anteriormente. Você será redirecionado para a página final.");
                router.push(endingRoute);
                return;
              } else {
                console.log("Added participant");
                router.push(surveyRoute);
              }
            });
            break;
        }
      });
    } catch (error) {
      console.log("ERROOOOOORRR")
      console.error(error);
    };
    setIsLoading(true);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pId = queryParams.get("PROLIFIC_ID") || "";
    setProlificId(pId || "");
  },[]);

  return (
    <main>
      <div>
          {
            isLoading ? <LoadingMessage /> : null
          }
      </div>
      <Index
        handlePassword={setPassword}
        handleInterestsMatrix={setInterestsMatrixHandler}
        handlePoliticalLeaning={setParticipantLeaning}
        prolificId={prolificId}
      />
      <SeguirButton clickHandler={nextButtonHandler} />
    </main>
  );
}
