import { Link } from "react-router";
import "./topNav.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import RunNachsal from "../alertOn/AlertOn";
import { AlartContext } from "../../context/AlartOnContext";
import AlertOnTimer from "../AlertOnTimer/AlertOnTimer";

export default function TopNav() {
  const auth = useContext(AuthContext);
  const alart = useContext(AlartContext);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const duration = 30 * 60 * 1000;

  useEffect(() => {
    let interval: number | undefined;
    const update = () => {
      const startTimeLS = localStorage.getItem("alertOnStartTime");
      if (startTimeLS) {
        const elapsed = Date.now() - Number(startTimeLS);
        setElapsedSeconds(Math.min(Math.floor(elapsed / 1000), 30 * 60));
        setProgress(Math.min((elapsed / duration) * 100, 100));
      } else {
        setElapsedSeconds(0);
        setProgress(0);
      }
    };
    update();
    interval = window.setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [auth?.soldier]);

  return (
    <>
      <div
        className="nav-top"
        style={
          alart?.alert
            ? {
                background: "linear-gradient(90deg, #770703ff 0%, #fc0202ff 100%)",
              }
            : {
                background:
                  "linear-gradient(90deg, #2e7d32 0%, #388e3c 100%)",
              }
        }
      >
        <Link to={"/"}>
          <img src="/IDF.png" alt="לוגו של צהל" className="logo-idf" />
        </Link>
        <h2 className="slogen-idf">מערכת נכס"ל צה"ל</h2>
        {auth?.soldier?.name ? (
          <div className="nav-actions">
            <Link to="/report_soldier_place">
              <button className="btnReport">מילוי טופס נכס"ל</button>
            </Link>
            {auth?.soldier?.role === "commander" && <div className="start-nachsal"><RunNachsal /></div>}
            <div className="user-section">
              <Link to="/logout">
                <img
                  className="account-img"
                  title="התנתק"
                  src="account.png"
                  alt="התנתקות"
                />
                <p>{auth.soldier.name}</p>
              </Link>
            </div>
            {auth?.soldier?.role === "commander" &&
              localStorage.getItem("alertOnStartTime") && (
                <>
                  <AlertOnTimer seconds={elapsedSeconds} totalMinutes={30} />
                  <div className="alert-on-progress-bar nav-progress-bar">
                    <div
                      className="alert-on-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}
          </div>
        ) : (
          <div className="logo-idf"></div>
        )}
      </div>
    </>
  );
}
