// Purpose: Renders role-aware login for admin and trainer users.
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("admin");
  const [form, setForm] = useState({ email: "ayush@iamneo.ai", password: "Admin@123" });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.toLowerCase().endsWith("@iamneo.ai")) {
      toast.error("Use your @iamneo.ai email");
      return;
    }
    try {
      const user = await login(form);
      if (role && user.role !== role) {
        toast.error(`This account is ${user.role}, not ${role}`);
        return;
      }
      toast.success("Welcome back");
      navigate(location.state?.from || (user.role === "admin" ? "/admin" : "/trainer/dashboard"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md items-center">
      <form onSubmit={submit} className="nexus-card w-full space-y-3 p-5">
        <div>
          <p className="text-sm font-black uppercase text-accent">BytesAndBeyond</p>
          <h1 className="mt-1.5 text-2xl font-black text-light-text dark:text-dark-text">Login</h1>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {["admin", "trainer"].map((item) => (
            <button key={item} type="button" className={`rounded-button px-3 py-2 text-sm font-black ${role === item ? "bg-accent text-white" : "bg-light-secondary text-light-subtext dark:bg-dark-secondary dark:text-dark-subtext"}`} onClick={() => setRole(item)}>
              {item === "admin" ? "Admin" : "Trainer"}
            </button>
          ))}
        </div>
        <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@iamneo.ai" required pattern="^[^@\s]+@iamneo\.ai$" />
        <input className="field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required />
        <button type="submit" className="primary-button w-full px-4" disabled={loading}>{loading ? "Signing in" : "Login"}</button>
        <p className="text-center text-sm font-bold text-light-subtext dark:text-dark-subtext">
          New here? <Link to="/register" className="text-accent">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
