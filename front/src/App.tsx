import { Route, Routes } from "react-router";
import Home from "./Pages/home/Home";
import Login from "./Pages/login/Login";
import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext, type Soldier } from "./context/AuthContext";
import ReportSoldierPlace from "./comp/ReportSoldierPlace/ReportSoldierPlace";
import TopNav from "./comp/top nav/TopNav";
import Logout from "./Pages/logout/Logout";
import SoldierPage from "./Pages/soldier/SoldierPage";
import { AlertContext } from "./context/AlertOnContext";
import { alertOnApi } from "./api";
import ChangePassword from "./Pages/changePassword/ChangePassword";

export const URL = "https://nachsal-emergency-fdsj.onrender.com";

export default function App() {
  const [soldier, setSoldier] = useState<Soldier | null>(null);
  const [alert, setAlert] = useState<boolean>(false);
  const idInterval = useRef<number | undefined>(undefined);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${URL}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        console.log("Auth data:", data);
        if (data && data.personalNumber) {
          let alertOn = await alertOnApi(data.personalNumber);
          setAlert(alertOn);
          idInterval.current = setInterval(async () => {
            alertOn = await alertOnApi(data.personalNumber);
            setAlert(alertOn);
          }, 10000);
        } else {
          console.error("Auth data or personalNumber is missing:", data);
        }
        setSoldier(data);
      } else {
        setSoldier(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setSoldier(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    return () => clearInterval(idInterval.current);
  }, [checkAuth]);
  return (
    <>
      <AlertContext.Provider value={{ alert, setAlert }}>
        <AuthContext.Provider value={{ soldier, setSoldier }}>
          <TopNav />
          <Routes>
            {soldier ? (
              <>
                <Route path="/" element={<Home />} />
                <Route
                  path={`/soldier_page/:personal_number`}
                  element={<SoldierPage />}
                />
                <Route
                  path="/report_soldier_place"
                  element={<ReportSoldierPlace />}
                />
                <Route path="/logout" element={<Logout />} />{" "}
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
              </>
            )}
            <Route path="*" element={<Home />} />
          </Routes>
        </AuthContext.Provider>
      </AlertContext.Provider>
    </>
  );
}
