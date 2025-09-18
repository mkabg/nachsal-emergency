import { useContext, useEffect, useState } from "react";
import "../login/login.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { URL } from "../../App";

export default function ChangePassword() {
    const auth = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [statusInput, setStatusInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        setStatusInput("");
        const personalNumber = auth?.soldier?.personalNumber;
        try {
            const res = await fetch(`${URL}/auth/changePassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ personalNumber, newPassword }),
                credentials: "include",
            });

            const data = await res.json();
            console.log(data);

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
                setMessage("סיסמא שגויה");
                setStatusInput("errorLogin");
            }
        } catch (err) {
            setIsLoading(false);
            setMessage("שגיאת רשת. נסה שוב.");
            setStatusInput("errorLogin");
        }
    }

    useEffect(() => {
        if (auth?.soldier?.password) {
            navigate("/");
        }
    }, [auth?.soldier?.password])

    return (
        <div className="login">
            <h1 className="h1">ברוכים הבאים למערכת נכס"ל</h1>
            <form className="form" onSubmit={handleSubmit}>
                {isLoading && <span className="loader-login"></span>}
                <h2 className="h2">שינוי סיסמא</h2>
                <input
                    className="inputLogin"
                    type="password"
                    name="password"
                    placeholder="הכנס סיסמא חדשה"
                    value={newPassword}
                    autoComplete="password"
                    required
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <br />
                <button className="btnLogin" type="submit">
                    שנה סיסמא
                </button>
                <p className={statusInput}>{message}</p>
            </form>
        </div>
    )
}
