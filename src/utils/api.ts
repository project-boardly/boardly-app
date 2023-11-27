import axios from "axios";

export async function search(query: string) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_HOST}/search?q=${query}`, {});

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
