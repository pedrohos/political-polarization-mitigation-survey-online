export default function pushPayload (password: string) {
    const payload = {
      password: password,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("survey:payload", JSON.stringify(payload));
    } else {
      throw new Error("No window object");
    }
};