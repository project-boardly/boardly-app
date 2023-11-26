import { createContext } from "react";
import useUser from "../hooks/useUser";
import { User } from "firebase/auth";

const UserContext = createContext<User|null>(null);

export function UserProvider ({ children }: any) {
  const { user } = useUser();

  return <UserContext.Provider value={user}>
    {children}
  </UserContext.Provider>
}

export default UserContext;