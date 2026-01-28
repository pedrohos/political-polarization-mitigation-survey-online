import PolarizationDef from "@/components/PolarizationDef";
import PoliticalLeaning from "@/components/pre_survey/PoliticalLeaning";
import SeguirButton from "@/components/index/SeguirButton";
import PasswordField from "@/components/index/PasswordField";
import InterestsMatrix from "@/components/pre_survey/InterestsMatrix";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import exampleImg from '../figs/survey-example.jpg';
import LoadingMessage from "@/components/survey/LoadingMessage";
import pushPayload from "@/components/common/Payload";
import UserInfo from "@/components/pre_survey/UserInfo";
import { addParticipant, getParticipantStatus } from "@/components/common/API";

function getCurrentTime() {
  return new Date().toISOString().replace("Z", "");
}

export default function PreSurvey() {
  const [isLoading, setIsLoading] = useState(false);
  // const [sessionId, setSessionId] = useState<string>("");
  const [participantLeaning, setParticipantLeaning] = useState<number>(0);
  const [interestsMatrix, setInterests] = useState<number[]>([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  
  const [userSessionID, setUserSessionID] = useState<string>("");
  const [prolificId, setProlificId] = useState<string>("");
  // const [participantId, setParticipantId] = useState<string>("");
  const curTime = getCurrentTime();

  const router = useRouter();

  const setInterestsMatrixHandler = (rowIdx: number, score: number) => {
    const newInterests = [...interestsMatrix];
    newInterests[rowIdx] = score;
    setInterests(newInterests);
  }

  // button handler
  const nextButtonHandler = () => {
    // debugger;
    if (participantLeaning === 0) {
      alert("Por favor, selecione uma opção válida de posicionamento antes de prosseguir.");
      return;
    }

    for (let i = 0; i < interestsMatrix.length; i++) {
      if (interestsMatrix[i] === 0) {
        alert("Por favor, preencha todas as linhas da matriz de interesses antes de prosseguir.");
        return;
      }
    }

    const idToCheck = userSessionID !== "" ? userSessionID : prolificId;
    const nonProlificUser = idToCheck !== prolificId;

    try {
      getParticipantStatus(idToCheck).then((data) => {
        let surveyRoute = nonProlificUser ? `/survey` : `/survey/?PROLIFIC_PID=${idToCheck}`;
        let endingRoute = nonProlificUser ? `/ending` : `/ending/?PROLIFIC_PID=${idToCheck}`;

        const isProlific = !nonProlificUser;

        if (data.status !== null) {
          if (data.status.startsWith("in_progress")) {
            router.push(surveyRoute);
            return;
          } else if (data.status === "completed") {
            router.push(endingRoute);
            return;
          }
        }
        addParticipant(idToCheck, isProlific, curTime, participantLeaning, interestsMatrix).then((addParticipantData) => {
          if ("completed" in addParticipantData) {
            alert("Você já completou o survey anteriormente. Você será redirecionado para a página final.");
            router.push(endingRoute);
            return;
          } else {
            console.log(addParticipantData.message);
            router.push(surveyRoute);
          }
        });
      });
    } catch (error) {
      console.log("ERROOOOOORRR")
      console.error(error);
    };
    setIsLoading(true);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pId = queryParams.get("PROLIFIC_PID") || "";
    setProlificId(pId || "");

    var localUserSessionID = "";
    if(pId === "") {
        if (sessionStorage.getItem('userSessionID') !== null) {
            localUserSessionID = sessionStorage.getItem('userSessionID')!
            setUserSessionID(localUserSessionID);
        } else {
            alert("Sua sessão expirou ou é inválida. Você será redirecionado para a página inicial.");
            router.push("/");
            return;
        }
    }

    const idToCheck = localUserSessionID !== "" ? localUserSessionID : pId;
    const nonProlificUser = idToCheck !== pId;

    setIsLoading(true);
    getParticipantStatus(idToCheck).then((data) => {
      let surveyRoute = nonProlificUser ? `/survey` : `/survey/?PROLIFIC_PID=${idToCheck}`;
      let endingRoute = nonProlificUser ? `/ending` : `/ending/?PROLIFIC_PID=${idToCheck}`;

      if (data.status !== null) {
        if (data.status.startsWith("in_progress")) {
          router.push(surveyRoute);
          return;
        } else if (data.status === "completed") {
          router.push(endingRoute);
          return;
        }
      }
      
      setIsLoading(false);
    });
  },[]);

  return (
    <main>
      <div>
          {
            isLoading ? <LoadingMessage /> : null
          }
      </div>
      <UserInfo
        handleInterestsMatrix={setInterestsMatrixHandler}
        handlePoliticalLeaning={setParticipantLeaning}
        prolificId={prolificId}
      />
      <SeguirButton clickHandler={nextButtonHandler} />
    </main>
  );
}
