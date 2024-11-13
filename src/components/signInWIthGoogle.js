import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";

function SignInwithGoogle() {
  async function googleLogin() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Check if followedTopics already exist, otherwise initialize
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "",
          followedTopics: [], // Initialize followedTopics as empty
        });
      }
      
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
      
      // Redirect to CategoryPage for topic selection
      window.location.href = "/categorypage";
    }
  }

  return (
    <div>
      <p className="continue-p ml-20">--Or continue with--</p>
      <div
        style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
        onClick={googleLogin}
      >
        <img
          src={require("../google.png")}
          width={"60%"}
          alt="Sign in with Google"
        />
      </div>
    </div>
  );
}

export default SignInwithGoogle;
