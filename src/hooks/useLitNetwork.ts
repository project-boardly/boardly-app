import { useContext } from "react";
import LitNetworkContext from "../contexts/LitNetworkContext";

export default function useLitNetwork() {
  const { client, encrypt, decrypt } = useContext(LitNetworkContext);

  return { client, encrypt, decrypt };
}