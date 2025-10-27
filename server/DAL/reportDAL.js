import supabase from "../db/connect.js";

export const createReportDB = async (obj, personalNumber) => {
  const { data, error } = await supabase
    .from("report")
    .update(obj)
    .eq("personal_number", Number(personalNumber));
  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    err.code = "DB_UPDATE_FAILED";
    throw err;
  }
  return true;
};

export const setAlertOnTrueDB = async (personalNumber) => {
  const { data, error } = await supabase
    .from("report")
    .update({ alert_on: true })
    .eq("personal_number", Number(personalNumber));
  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    err.code = "DB_UPDATE_FAILED";
    throw err;
  }
  return true;
};

export const isAlertOnTrueDB = async (personalNumber) => {
  const { data, error } = await supabase
    .from("report")
    .select("alert_on")
    .eq("personal_number", Number(personalNumber))
    .single();
  if (error) {
    const err = new Error(error.message);
    err.status = 500;
    err.code = "DB_SELECT_FAILED";
    throw err;
  }
  return data;
};
