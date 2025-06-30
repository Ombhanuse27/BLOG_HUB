import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserById } from "../api/api"; // Make sure this path is correct

function GoogleAuthHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId");

      if (token && userId) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);

        try {
          const user = await getUserById(userId, token);
          console.log("User data:", user);

          if (user.data.followedTopics?.length > 0) {
            navigate("/HomePage");
          } else {
            navigate("/CategoryPage");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          navigate("/signin");
        }
      } else {
        navigate("/signin");
      }
    };

    handleGoogleAuth();
  }, [navigate, searchParams]);

  return <p>Logging you in with Google...</p>;
}

export default GoogleAuthHandler;
