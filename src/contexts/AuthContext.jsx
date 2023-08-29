/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useReducer } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "signedIn":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "signup":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "logout":
      return { ...initialState };
    default:
      throw new Error("used outside of auth provider ...");
  }
}

function AuthProvider({ children }) {
  const [{ user, isAuthenticated }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    const unsubscribe = onAuthStateChanged(auth, (userDetails) => {
      if (userDetails) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const user = {
          uid: userDetails.uid,
          email: userDetails.email,
          name: userDetails.displayName,
          avatar: userDetails.photoURL,
        };
        dispatch({ type: "signedIn", payload: user });
        // ...
      } else {
        // User is signed out
        // ...
        dispatch({ type: "logout" });
      }
    });
    return () => unsubscribe();
  }, []);

  async function signup(email, password, name, avatar) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL:
          avatar || `https://i.pravatar.cc/100?u=${userCredential.user.uid}`,
      });
      const newUser = {
        uid: userCredential.user.uid,
        email,
        name,
        avatar,
      };
      dispatch({ type: "signup", payload: newUser });
    } catch (e) {
      console.log(e.message);
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = {
        email,
        uid: userCredential.user.uid,
        name: userCredential.user.displayName,
        avatar: userCredential.user.photoURL,
      };
      dispatch({ type: "signedIn", payload: user });
    } catch (e) {
      console.log(e.message);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      dispatch({ type: "logout" });
    } catch (e) {
      console.log(e.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{ signup, user, login, isAuthenticated, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("context used outside of provider");
  return context;
}

export { AuthProvider, useAuth };
