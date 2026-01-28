import { use } from "react";

export default function updateUserId (searchParams: URLSearchParams, setProlificId: (id: string) => void, setParticipantId: (id: string) => void, setUserSessionID: (password: string) => void, router: any) : [string, string, string] {
    let prolificId = "";
    let userSessionID = "";
    if (searchParams.get("PROLIFIC_PID") === null) {
        if (typeof window === "undefined") {
            throw new Error("window is undefined");
        }
        userSessionID = sessionStorage.getItem('userSessionID')!;
        setUserSessionID(userSessionID);
    } else {
        prolificId = searchParams.get("PROLIFIC_PID") || "";
        if (prolificId === "") {
            alert("Por favor, forneça um ID de Prolific válido.");
            router.push("/");
        }
        setProlificId(prolificId);
    }

    // const queryParams = new URLSearchParams(window.location.search);
    // const pId = queryParams.get("PROLIFIC_PID") || "";
    let pId = userSessionID !== "" ? userSessionID : prolificId;
    setParticipantId(pId);
    return [prolificId, userSessionID, pId];
}