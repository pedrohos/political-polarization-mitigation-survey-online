export default function pushPayload (userSessionID: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem('userSessionID', userSessionID);
    } else {
      throw new Error("No window object");
    }
};