import { useQuery } from "@tanstack/react-query";
import useUniversalProfile from "../hooks/useUniversalProfile";

export const useProfileQuery = (address: string) => {
  const profile = useUniversalProfile(address);
  const query = useQuery({
    queryKey: ["profile", address],
    queryFn: async () => {
      const isValid = await profile.isUniversalProfile();

      if (!isValid) {
        console.log(`${address} is not a universal profile`);

        return null;
      }

      return profile.getProfileData();
    },
  });

  return { profile, query };
}