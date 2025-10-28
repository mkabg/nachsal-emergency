import { useContext, useState } from "react";
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

            setIsLoading(false);
            if (data.personal_number) {
                setStatusInput("goodLogin");
                setMessage("הסיסמא שונתה בהצלחה!");
                setTimeout(() => {
                    navigate("/")
                }, 1000)
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

    return (
        <div className="login">
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
