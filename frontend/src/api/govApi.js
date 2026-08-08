import axios from "axios";

// 👇 Apne app ke actual mount path ke hisaab se adjust karo
const BASE_URL = "/api/gov";

// Dropdown ke liye saare states ki list layega
export const getStatesList = () => {
  return axios.get(`${BASE_URL}/mandi-states`);
};

// Selected state ki saari commodities ka current rate layega
export const getStateWiseRates = (state) => {
  return axios.get(`${BASE_URL}/mandi-state-rates`, {
    params: { state },
  });
};