import { Link, useNavigate } from "react-router";
import { logout } from "../../api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Logout() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await logout();
            if (response.ok) {
                auth?.setSoldier(null);
                setTimeout(() => {
                    navigate('/');
                }, 1200);
            }
        }
        catch (err) {

        }
    }
    return (
        <div className="login">
            {auth?.soldier?.name &&
            <div>
                <form className="form" onSubmit={handleSubmit}>
                    <h2 className="h2">חשבון משתמש</h2>
                    <p>אתה מחובר בתור {auth?.soldier?.name}</p>

                    <Link to={"/change_password"}>לחץ לשינוי סיסמא</Link><br />
                    <button className="btnLogin" type="submit">התנתקות</button>
                </form>
            </div>}
            {!auth?.soldier?.name &&
            <div>
                <h2>התנתקת בהצלחה!</h2>
            </div>
            }
        </div>
    )
}
