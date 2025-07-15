import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [input, setInput] = useState("");

  // 1️⃣ Set token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);

  // 2️⃣ React Query: fetch blogs every 5s
  const {
    data: blogsData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await axios.get("/api/blog/all");
      if (!data.success) throw new Error(data.message);
      return data.blogs;
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  // 3️⃣ Sync blogs from query to context state
  useEffect(() => {
    if (blogsData) setBlogs(blogsData);
    if (error) toast.error(error.message);
  }, [blogsData, error]);

  const value = {
    axios,
    navigate,
    token,
    setToken,
    blogs,
    setBlogs,
    input,
    setInput,
    isLoading, // optional: expose loading for UI components
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};