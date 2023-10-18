import axios from "axios";

export async function checkout () {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_HOST}/checkout`, {});

    const { url } = response.data;

    return url;
  } catch (error) {
    console.log(error);
  }
}