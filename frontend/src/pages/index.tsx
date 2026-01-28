import SeguirButton from "@/components/index/SeguirButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingMessage from "@/components/survey/LoadingMessage";
import Index from "@/components/index/Index";
import { getParticipantStatus } from "@/components/common/API";

function getCurrentTime() {
  return new Date().toISOString().replace("Z", "");
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  
  const [userSessionID, setUserSessionID] = useState<string>("");
  const [prolificId, setProlificId] = useState<string>("");
  const curTime = getCurrentTime();

  const router = useRouter();

  // button handler
  const nextButtonHandler = () => {
    // debugger;
    var localUserSessionID = "";
    if(prolificId === "") {
        if (sessionStorage.getItem('userSessionID') === null) {
          localUserSessionID = crypto.randomUUID();
          setUserSessionID(localUserSessionID);
          sessionStorage.setItem('userSessionID', localUserSessionID);
        } else {
          localUserSessionID = sessionStorage.getItem('userSessionID')!;
        }
    }

    const idToCheck = localUserSessionID !== "" ? localUserSessionID : prolificId;
    const nonProlificUser = idToCheck !== prolificId;

    setIsLoading(true);
    try {
      getParticipantStatus(idToCheck).then((data) => {
        let preSurveyRoute = nonProlificUser ? `/pre_survey` : `/pre_survey/?PROLIFIC_PID=${idToCheck}`;
        let surveyRoute = nonProlificUser ? `/survey` : `/survey/?PROLIFIC_PID=${idToCheck}`;
        let endingRoute = nonProlificUser ? `/ending` : `/ending/?PROLIFIC_PID=${idToCheck}`;
        
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
            router.push(preSurveyRoute);
            break;
        }
      });
    } catch (error) {
      console.log("ERROOOOOORRR")
      console.error(error);
    };
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const pId = queryParams.get("PROLIFIC_PID") || "";
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
        prolificId={prolificId}
        key={prolificId}
      />
      <SeguirButton clickHandler={nextButtonHandler} />
    </main>
  );
}
