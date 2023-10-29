import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function useUser () {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}