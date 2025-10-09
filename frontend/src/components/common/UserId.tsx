export default function updateUserId (searchParams: URLSearchParams, setPayload: (data: any) => void, setProlificId: (id: string) => void, setParticipantId: (id: string) => void, setPassword: (password: string) => void, router: any) : [string, string, string] {
    let prolificId = "";
    let password = "";
    if (searchParams.get("PROLIFIC_ID") === null) {
        if (typeof window === "undefined") {
            throw new Error("window is undefined");
        }
        const raw = sessionStorage.getItem("survey:payload");
        if (raw) {
            try {
                let data = JSON.parse(raw);
                setPayload(data);
                setPassword(data.password);
                password = data.password;
            } catch {
                throw new Error("Error parsing payload from sessionStorage");
            }
        } else {
            window.location.href = `https://app.prolific.com/submissions/complete?cc=${urlCode}`;
        }
    } else {
        prolificId = searchParams.get("PROLIFIC_ID") || "";
        if (prolificId === "") {
            alert("Por favor, forneça um ID de Prolific válido.");
            router.push("/");
        }
        setProlificId(prolificId);
    }

    // const queryParams = new URLSearchParams(window.location.search);
    // const pId = queryParams.get("PROLIFIC_ID") || "";
    let pId = password !== "" ? password : prolificId;
    setParticipantId(pId);
    return [prolificId, password, pId];
}