import { useContext, useEffect, useState } from "react";
import { sendNechsal } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import AlertOnButton from "./AlertOnButton";
import "./alertOn.css";

export default function AlertOn() {
  const [isRunning, setIsRunning] = useState(() => {
    // אם יש זמן התחלה בלוקאל אז הטיימר רץ
    return !!localStorage.getItem("alertOnStartTime");
  });
  const auth = useContext(AuthContext);
  const duration = 30 * 60 * 1000; // משך הזמן הרצוי בדקות

  const nechsal = async () => {
    if (!auth?.soldier?.personalNumber) return;
    try {
      const res = await sendNechsal();
      console.log("Nachsal sent:", res);
    } catch (err) {
      console.error("Error sending nechsal:", err);
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
      nechsal();
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
