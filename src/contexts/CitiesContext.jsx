import { createContext, useCallback, useContext, useReducer } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { useAuth } from "./AuthContext";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error("undefined action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const { user } = useAuth();

  useEffect(
    function () {
      async function fetchCities() {
        dispatch({ type: "loading" });
        try {
          const q = query(
            collection(db, "cities"),
            where("uid", "==", user.uid)
          );
          const citiesSnapshot = await getDocs(q);
          const cities = citiesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          dispatch({ type: "cities/loaded", payload: cities });
        } catch (e) {
          dispatch({ type: "rejected", payload: "error in fetching cities" });
        }
      }
      fetchCities();
    },
    [user.uid]
  );

  const getCity = useCallback(async function getCity(id) {
    dispatch({ type: "loading" });
    try {
      const docSnap = await getDoc(doc(db, "cities", id));
      const city = { id: docSnap.id, ...docSnap.data() };
      dispatch({ type: "city/loaded", payload: city });
    } catch (e) {
      dispatch({ type: "rejected", payload: "error in fetching city..." });
    }
  }, []);

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const refId = await addDoc(collection(db, "cities"), {
        ...newCity,
        uid: user.uid,
      });
      dispatch({
        type: "city/created",
        payload: { ...newCity, id: refId.id, uid: user.uid },
      });
    } catch (e) {
      dispatch({ type: "rejected", payload: "error in creating city..." });
    }
  }
  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await deleteDoc(doc(db, "cities", id));
      dispatch({ type: "city/deleted", payload: id });
    } catch (e) {
      dispatch({ type: "rejected", payload: "error in deleting city..." });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        currentCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  return context;
}

export { CitiesProvider, useCities };
