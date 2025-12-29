export const addParticipant = async (pId: string, isProlific: boolean, curTime: string, politicalLean: number, interestsMatrix: number[]) => {
    const response = await fetch('/api/addParticipant', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'pId': pId, 'isProlific': isProlific, 'curTime': curTime, 'politicalLean': politicalLean, 'interestsMatrix': interestsMatrix})
    });
    const data = await response.json();
    return data;
};

export const getParticipantStatus = async (pId: string) => {
    const response = await fetch('/api/getParticipantStatus', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'pId': pId})
    });
    const data = await response.json();
    return data;
};