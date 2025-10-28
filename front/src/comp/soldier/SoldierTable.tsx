import "./SoldierTable.css";
import { useContext, useEffect, useState } from "react";
import { getDirectSoldier } from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export type Report = {
  personal_number: number;
  name: string;
  location: string;
  status: string;
  done: boolean | null;
  progress?: string;
  created_at: string;
};

export default function SoldierTable({ paramsNumber }: any) {
  const auth = useContext(AuthContext);
  const [data, setData] = useState<Report[]>([]);
  const [progressClass, setProgressClass] = useState("");
  const [progress, setProgress] = useState("");
  const navigate = useNavigate();

  const fetchData = async (personalNumber: string | undefined) => {
    let responseDirectSoldiers;
    if (auth?.soldier) {
      responseDirectSoldiers = await getDirectSoldier(personalNumber!);
    }
    setData(responseDirectSoldiers);
    const updatedSoldiers = await Promise.all(
      responseDirectSoldiers.map(async (soldier: Report) => {
        const children = await getDirectSoldier(String(soldier.personal_number));
        // const children = await getAllSoldiersUnderCommandApi(soldier.personal_number);
        const completed = children.filter((child: Report) => child.done === true).length;
        const total = children.length;
        if (total !== completed) {
          setProgressClass("half-full");
        }
        setProgress(`${total} / ${completed}`);
        return { ...soldier, progress: `${total} / ${completed}` };
      })
    );
    setData(updatedSoldiers);
    navigate(`/soldier_page/${personalNumber}`);
  };

  useEffect(() => {
    fetchData(paramsNumber);
  }, [paramsNumber]);

  return (
    <>
      {data.length > 0 && (
        <div>
          <h2 className="table-header">דו"ח חיילים</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>מ.א</th>
                  <th>שם החייל</th>
                  <th>מיקום</th>
                  <th>מצב החייל</th>
                  {progress !== "0 / 0" && <th>סטטוס</th>}
                  <th>תאריך עדכון</th>
                </tr>
              </thead>
              <tbody>
                {data.filter((report) => String(report.personal_number) !== paramsNumber).map((report) => (
                  <tr
                    key={report.personal_number}
                    onClick={() => fetchData(String(report.personal_number))}
                  >
                    <td>{report.personal_number}</td>
                    <td>{report.name}</td>
                    <td>{report.location}</td>
                    <td>{report.status}</td>
                    {progress !== "0 / 0" && <td className={progressClass}>{report.progress}</td>}
                    <td>{report.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
