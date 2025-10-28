import { useContext, useEffect, useState } from "react";
import { activateAlert } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import AlertOnButton from "./AlertOnButton";
import "./AlertOn.css";

export default function AlertOn() {
  const [isRunning, setIsRunning] = useState(() => {
    // אם יש זמן התחלה בלוקאל אז הטיימר רץ
    return !!localStorage.getItem("alertOnStartTime");
  });
  const auth = useContext(AuthContext);
  const duration = 30 * 60 * 1000; // משך הזמן הרצוי בדקות

  const activateNachsalAlert = async () => {
    if (!auth?.soldier?.personalNumber) return;
    try {
      const title = "Nachsal Alert";
      const body = `Soldier ${auth.soldier.personalNumber} has activated a Nachsal alert.`;
      const url = window.location.origin; // Or a specific alert page URL
      const res = await activateAlert({ title, body, url });
      console.log("Nachsal Alert sent:", res);
    } catch (err) {
      console.error("Error sending Nachsal Alert:", err);
    }
  };

  useEffect(() => {
    let interval: number;
    let startTime: number;

    if (isRunning && auth?.soldier) {
      // אם אין זמן התחלה שמור בלוקאל אז שומר אותו
      if (!localStorage.getItem("alertOnStartTime")) {
        localStorage.setItem("alertOnStartTime", String(Date.now()));
      }
      activateNachsalAlert();
      startTime = Number(localStorage.getItem("alertOnStartTime"));

      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min((elapsed / duration) * 100, 100);

        if (percent >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          localStorage.removeItem("alertOnStartTime");
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, auth?.soldier]);

  return (
    <div className="alert-on-container">
      <AlertOnButton
        onClick={() => {
          setIsRunning(true);
          localStorage.setItem("alertOnStartTime", String(Date.now()));
        }}
        disabled={isRunning}
      />
    </div>
  );
}
