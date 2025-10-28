const URL = import.meta.env.VITE_SERVER_URL;

if (!URL) {
  throw new Error("VITE_SERVER_URL is not defined in environment variables.");
}
export async function addSoldierReport({
  personal_number,
  location,
  status,
}: {
  personal_number: number;
  location: string;
  status: string;
}) {
  const result = await fetch(`${URL}/reports/add_report/${personal_number}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ location, status }),
    credentials: "include",
  });
  if (!result.ok) throw new Error("שגיאה בשליחת הדיווח");
  return result.json();
}

export async function getDirectSoldier(personalNumber: string) {
  const result = await fetch(`${URL}/reports/${personalNumber}`, {
    method: "GET",
    credentials: "include",
  });
  if (!result.ok) throw new Error("Failed to fetch direct soldier data.");
  return result.json();
}

export async function getSoldierDetails(personalNumber: string) {
  const result = await fetch(
    `${URL}/reports/soldierDetails/${personalNumber}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!result.ok) throw new Error("Failed to fetch soldier details.");
  return result.json();
}

export async function logout() {
  const result = await fetch(`${URL}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });
  return result;
}

export async function sendNechsal() {
  console.log("nechsal send");

  const result = await fetch(`${URL}/reports/send_nachsal`, {
    method: "GET",
    credentials: "include",
  });
  if (!result.ok) throw new Error("Failed to send Nachsal.");
  return result.json();
}

export async function alertOnApi(personalNumber: number) {
  console.log("nechsal send");
  const res = await fetch(`${URL}/reports/alert_on/${personalNumber}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to toggle alert.");
  const alert = await res.json()
  return alert;
}

export async function activateAlert({
  title,
  body,
  url,
}: {
  title: string;
  body: string;
  url: string;
}) {
  const result = await fetch(`${URL}/alerts/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, url }),
    credentials: "include",
  });
  if (!result.ok) throw new Error("Failed to activate alert.");
  return result.json();
}
