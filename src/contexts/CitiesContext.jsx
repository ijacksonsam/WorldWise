import { createContext, useContext, useReducer } from "react";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

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

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const citiesSnapshot = await getDocs(collection(db, "cities"));
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
  }, []);

  async function getCity(id) {
    dispatch({ type: "loading" });
    try {
      const docSnap = await getDoc(doc(db, "cities", id));
      const city = { id: docSnap.id, ...docSnap.data() };
      dispatch({ type: "city/loaded", payload: city });
    } catch (e) {
      dispatch({ type: "rejected", payload: "error in fetching city..." });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const refId = await addDoc(collection(db, "cities"), newCity);
      dispatch({ type: "city/created", payload: { ...newCity, id: refId.id } });
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
