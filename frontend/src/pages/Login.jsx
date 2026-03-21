import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, Github, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const InputField = ({
  icon: Icon,
  type,
  placeholder,
  label,
  onChange,
  name,
}) => (
  <div className="space-y-2">
    <div className="relative group">
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        name={name}
        className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        required
      />
      <label className="absolute -top-2 left-3 bg-gray-950 px-1 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
        {label}
      </label>
    </div>
  </div>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Logging in with:", formData);
    // Call the registration API
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/login`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // check if registration is successful
    if (response.status === 200) {
      const data = response.data;
      console.log("Login successful:", data);
      //   setUser(data.user);

      toast.success("🎉🥳 Login successful!");
      localStorage.setItem("token", data.access_token);
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      console.error("Login failed:", response);
      toast.error("❌ Login failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      localStorage.setItem("token", tokenResponse.access_token);
      // tokenResponse.access_token
      toast.success("🎉 Google login successful!");
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: () => {
      toast.error("❌ Google Login Failed");
    },
  });
  return (
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-6 font-sans">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-4">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs font-mono text-gray-500 tracking-[0.2em] uppercase">
            Secure_Access_Node_01
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              icon={Mail}
              type="email"
              label="Email Address"
              placeholder="admin@obsidian.lens"
              name="email"
              onChange={handleChange}
            />
            <InputField
              icon={Lock}
              type="password"
              label="Password"
              placeholder="••••••••"
              name="password"
              onChange={handleChange}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-black/40 checked:bg-blue-600 transition-all"
                />
                <span className="group-hover:text-gray-300">REMEMBER NODE</span>
              </label>
              <a
                href="#"
                className="text-blue-500 font-bold hover:text-blue-400 transition-colors uppercase tracking-tighter"
              >
                Forgot Key?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
            >
              INITIALIZE SESSION <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em] text-gray-600 bg-transparent px-4">
              OR CONNECT VIA
            </div>
          </div>

          {/* Social Login */}
          <button
            onClick={() => googleLogin()}
            className="w-full rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          {/* Signup Link */}
          <div className="text-center mt-6 text-xs text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 font-bold hover:text-blue-400 transition-colors uppercase tracking-tighter"
            >
              Sign Up Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
