import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  Github,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const RegistrationInput = ({
  icon: Icon,
  type,
  placeholder,
  label,
  handleChange,
  name,
}) => (
  <div className="space-y-2">
    <div className="relative group">
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        className="w-full bg-black/40 border border-white/10 rounded-lg py-2 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        required
      />
      <label className="absolute -top-2 left-3 bg-gray-950 px-1 text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest">
        {label}
      </label>
    </div>
  </div>
);

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Creating account with:", formData);
    // Call the registration API
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/signup`,
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
      console.log("Registration successful:", data.user);
      //   setUser(data.user);

      toast.success("🎉🥳 Registration successful!");
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      console.error("Registration failed:", response);
      toast.error("❌ Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Grid Pattern - Hidden on mobile for performance */}
      <div
        className="absolute inset-0 z-0 opacity-20 hidden sm:block"
        style={{
          backgroundImage:
            "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-md space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2 sm:mb-2">
            <Fingerprint size={20} className="sm:w-[24px] sm:h-[24px]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create Identity
          </h1>
          <p className="text-[8px] sm:text-xs font-mono text-gray-500 tracking-[0.2em] uppercase">
            New_Node_Registration_v2
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <RegistrationInput
              icon={User}
              type="text"
              label="Full Name"
              placeholder="Arju Paul"
              name="name"
              handleChange={handleChange}
            />
            <RegistrationInput
              icon={Mail}
              type="email"
              label="Email Address"
              placeholder="admin@obsidian.lens"
              name="email"
              handleChange={handleChange}
            />
            <RegistrationInput
              icon={Lock}
              type="password"
              label="Password"
              placeholder="••••••••"
              name="password"
              handleChange={handleChange}
            />

            <div className="flex items-start gap-2 sm:gap-3 px-0 sm:px-1">
              <input
                type="checkbox"
                className="mt-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-white/10 bg-black/40 checked:bg-blue-600 transition-all cursor-pointer flex-shrink-0"
                id="terms"
              />
              <label
                htmlFor="terms"
                className="text-[9px] sm:text-[11px] text-gray-400 leading-tight cursor-pointer"
              >
                I agree to the{" "}
                <span className="text-blue-500 hover:underline">
                  Neural Protocol
                </span>{" "}
                and data processing terms for Obsidian Lens.
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all mt-3 sm:mt-4 text-sm sm:text-base"
            >
              CREATE ACCOUNT <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[7px] sm:text-[10px] uppercase font-bold tracking-[0.3em] text-gray-600 bg-transparent px-4">
              OR CONNECT VIA
            </div>
          </div>

          {/* Social Login */}
          <div className="w-full flex justify-center items-center bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3 hover:bg-white/10 hover:border-white/20 transition-all overflow-hidden">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
                const decoded = jwtDecode(credentialResponse.credential);
                console.log(decoded);
                toast.success("🎉🥳 Google login successful!");
                const timer = setTimeout(() => {
                  navigate("/");
                }, 2000);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
              theme="dark"
              size="large"
              width="100"
            />
          </div>

          {/* Footer Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest">
              Already have an active node?{" "}
              <Link
                to="/login"
                className="text-blue-500 font-bold hover:text-blue-400 transition-colors ml-1"
              >
                SIGN IN
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 text-gray-600">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[10px] uppercase font-bold tracking-tighter">
            <ShieldCheck size={12} className="sm:w-[14px] sm:h-[14px] text-green-500/50" /> End-to-End
            Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
