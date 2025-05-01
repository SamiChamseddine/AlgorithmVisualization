import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-200 p-1">
      <div className=" top-20 left-0 right-0 mx-auto w-full max-w-3xl px-4 z-20">
        <blockquote className="text-center italic text-gray-300 text-sm md:text-base p-1 rounded-xl">
          "The purpose of computing is insight, not numbers. But to gain
          insight, we need visualization."
          <footer className="mt-1 text-purple-400/80 not-italic text-xs md:text-sm">
            — Richard Hamming
          </footer>
        </blockquote>
      </div>
            <form onSubmit={handleSubmit} className="bg-black p-6 rounded-xl shadow-xl w-full max-w-sm border border-gray-800">
                <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_#CA00B6]">
                    {name}
                </h1>
                
                <div className="mb-4">
                    <input
                        className="w-full p-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                </div>
                
                <div className="mb-6">
                    <input
                        className="w-full p-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                </div>

                {loading && (
                    <div className="flex justify-center mb-4">
                        <LoadingIndicator />
                    </div>
                )}

                <button
                    className={`w-full py-3 px-6 rounded-lg shadow-lg transition-all ${
                        loading
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_0_15px_#CA00B6]"
                    } text-white font-medium`}
                    type="submit"
                    disabled={loading}
                >
                    {name}
                </button>

                <div className="mt-4 text-center text-gray-400">
                    {method === "login" ? (
                        <p>
                            Don't have an account?{" "}
                            <a 
                                href="#/register" 
                                className="text-purple-400 hover:text-purple-300 hover:underline"
                            >
                                Register
                            </a>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <a 
                                href="#/login" 
                                className="text-purple-400 hover:text-purple-300 hover:underline"
                            >
                                Login
                            </a>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Form;
