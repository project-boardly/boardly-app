import axios from "axios";

import { generateNonce, SiweMessage } from 'siwe';
import { getAuth, signInWithCustomToken } from "firebase/auth";

function createSiweMessage (address: string) {
  const domain = window.location.host;
  const origin = window.location.origin;

  const message = new SiweMessage({
    domain,
    address,
    statement: 'Login to Family',
    uri: origin + '/',
    nonce: generateNonce(),
    version: '1',
    chainId: 4201
  });

  return message.prepareMessage();
}

export async function authenticate (account: string, provider: any) {
  const message = createSiweMessage(account);
  const signature = await provider.send('eth_sign', [account, message])

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_HOST}/siwe/verify`, { signature, message });

    const { token } = response.data;

    return signInWithCustomToken(getAuth(), token);
  } catch (error) {
    console.log(error);
  }
}