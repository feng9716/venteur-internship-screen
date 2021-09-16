import axios from "axios";

const baseURL = "http://tech-screen.venteur.co";

async function getZipCounty(zip) {
  const targetURL = baseURL + "/ZipCounties?zip=" + zip;
  return await axios.get(targetURL);
}

async function getQuote(form) {
  const targetURL = baseURL + "/Policies/Quote";

  return await axios.post(targetURL, form);
}

async function enroll(product) {
  const targetURL = baseURL + "/Policies/Enroll";

  return await axios.post(targetURL, product);
}

const api = { getZipCounty, getQuote, enroll };

export default api;
