// ReportSoldierPlace.tsx
import { useState, useContext } from "react";
import { addSoldierReport, getDirectSoldier } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { Loader } from "@googlemaps/js-api-loader";
import "./reportSoldierPlace.css";
import type { Report } from "../soldier/SoldierTable";
import { AlartContext } from "../../context/AlartOnContext";

const API = "AIzaSyAt8qf1gUfAzXPOvKASVGfDM8gWnDF74dc"; // מפתח גוגל בלבד

type DataForm = { status: string; location: string };

export default function ReportSoldierPlace() {
  const auth = useContext(AuthContext);
  const {alert} = useContext(AlartContext)!;

  const soldierName = auth?.soldier?.name || "soldier";
  const [dataForm, setDataForm] = useState<DataForm>({
    status: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [waitingMsg, setWaitingMsg] = useState("");

  // reverse geocoding באמצעות Maps JavaScript API
  const geocodeLatLng = async (lat: number, lng: number) => {
    const loader = new Loader({
      apiKey: API,
      libraries: [],
      language: "he",
      region: "IL",
    });

    const google = await loader.load();
    const geocoder = new google.maps.Geocoder();

    return new Promise<string>((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (
          results: Array<typeof google.maps.GeocoderResult> | null,
          status: string
        ) => {
          if (status === "OK" && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(status);
          }
        }
      );
    });
  };
  const getLocation = () => {
    setMsg("");
    if (!("geolocation" in navigator)) {
      setMsg("הדפדפן לא תומך ב-Geolocation");
      return;
    }
    setLoading(true);
    setWaitingMsg("מאתר מיקום...");
    setTimeout(() => {
      setWaitingMsg("");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const addr = await geocodeLatLng(latitude, longitude);
            setDataForm((prev) => ({
              ...prev,
              location: addr || "לא נמצאה כתובת",
            }));
          } catch (e: any) {
            setMsg("שגיאה מה-Geocoder: " + String(e));
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          const map: Record<number, string> = {
            1: "הרשאת מיקום נדחתה",
            2: " אין קליטת GPS נסה שוב",
            3: "תם הזמן לאיתור מיקום",
          };
          setMsg(map[err.code] || "שגיאה בקבלת מיקום");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth?.soldier) {
      setMsg("לא נמצאו פרטי חייל");
      return;
    }

    const children = await getDirectSoldier(String(auth.soldier?.personalNumber));
    const completed = children.filter((child: Report) => child.done === true).length;
    if(completed !== children.length) return setMsg('נא וודא שכל הפקודים שלחו טופס נכס"ל')
    
    addSoldierReport({
      personal_number: auth.soldier.personalNumber,
      location: dataForm.location,
      status: dataForm.status,
    })
    .then(async () => {
        setMsg("הדיווח נשלח בהצלחה");
        setDataForm({ status: "", location: "" });
      })
      .catch((err) => {
        setMsg("שגיאה בשליחת הדיווח: " + err.message);
      });
  };
console.log(alert)
  return ( alert ?
    <div className="Report_soldier_place">
      <form className="form-nachsal" onSubmit={handleSubmit}>
        <div className="tile">
          <h1>שלום {soldierName}</h1>
          <p>עדכן את מיקומך ומצבך</p>
        </div>
        <div className="status-radio">
          <label>
            <input
              type="radio"
              name="status"
              value="תקין"
              checked={dataForm.status === "תקין"}
              onChange={() => setDataForm({ ...dataForm, status: "תקין" })}
              required
            />
            תקין
          </label>
          <label>
            <input
              type="radio"
              name="status"
              value="במצוקה"
              checked={dataForm.status === "במצוקה"}
              onChange={() => setDataForm({ ...dataForm, status: "במצוקה" })}
              required
            />
            במצוקה
          </label>
        </div>

        {/* <input
          className="input-local"
          type="text"
          placeholder="מיקום"
          value={dataForm.location}
          onChange={(e) =>
            setDataForm({ ...dataForm, location: e.target.value })
          }
          required
        /> */}

        <div className="input-location-container">
          <input
            className="input-local"
            type="text"
            placeholder="מיקום"
            value={dataForm.location}
            onChange={(e) =>
              setDataForm({ ...dataForm, location: e.target.value })
            }
            required
          />
          <button
            className="btn-local"
            type="button"
            onClick={getLocation}
            disabled={loading}
          >
            {loading ? waitingMsg || "מאתר מיקום..." : "מיקום נוכחי"}
          </button>
        </div>

        <button className="btn-report" type="submit">דיווח</button>

        {msg && <div className="error">{msg}</div>}
      </form>
    </div> : <h1>אין עכשיו התראת נכס"ל</h1>
  );
}
