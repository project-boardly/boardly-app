import { useContext } from "react";
import LitNetworkContext from "../contexts/LitNetworkContext";

export default function useLitNetwork() {
  const litCtx = useContext(LitNetworkContext);

  return litCtx;
}