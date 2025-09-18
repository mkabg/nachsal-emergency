import { useContext, useEffect, useState } from "react";
import "./login.css";
import { URL } from "../../App";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function Login() {
  const auth = useContext(AuthContext);
  const [personalNumber, setPersonalNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setStatusInput("");
    try {
      const res = await fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalNumber, password }),
        credentials: "include",
      });

      const data = await res.json();
      setIsLoading(false);
      if (data.personal_number) {
        setStatusInput("goodLogin");
        setMessage("התחברת בהצלחה!");
        auth?.setSoldier({
          personalNumber: data.personal_number,
          name: data.name,
          role: data.role,
          password: data.password == data.personal_number ? false : true
        });
        // auth?.setPassword(data.password == data.personal_number ? false : true)
      } else {
        setMessage("מספר אישי או סיסמה שגויים.");
        setStatusInput("errorLogin");
      }
    } catch (err) {
      setIsLoading(false);
      setMessage("שגיאת רשת. נסה שוב.");
      setStatusInput("errorLogin");
    }
  }

  useEffect(() => {
    if (auth?.soldier?.name) {
      navigate("/");
    }
  }, [auth?.soldier])

  return (
    <div className="login">
      <h1 className="h1">ברוכים הבאים למערכת נכס"ל</h1>
      <form className="form" onSubmit={handleSubmit}>
        {isLoading && <span className="loader-login"></span>}
        <h2 className="h2">התחברות</h2>
        <input
          className="inputLogin"
          type="text"
          name="personalNumber"
          placeholder="מספר אישי"
          value={personalNumber}
          autoComplete="name"
          required
          onChange={(e) => setPersonalNumber(e.target.value)}
        />
        <input
          className="inputLogin"
          type="password"
          name="password"
          placeholder="סיסמא"
          value={password}
          autoComplete="password"
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className="btnLogin" type="submit">
          כניסה
        </button>
        <p className={statusInput}>{message}</p>
      </form>
    </div>
  );
}
