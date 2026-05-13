// Purpose: Renders account registration for trainers and viewers.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "trainer" });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.toLowerCase().endsWith("@iamneo.ai")) {
      toast.error("Use your @iamneo.ai email");
      return;
    }
    try {
      const user = await register(form);
      toast.success("Account created");
      navigate(user.role === "admin" ? "/admin" : "/trainer/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-md items-center">
      <form onSubmit={submit} className="nexus-card w-full space-y-3 p-5">
        <div>
          <p className="text-sm font-black uppercase text-accent">BytesAndBeyond</p>
          <h1 className="mt-1.5 text-2xl font-black text-light-text dark:text-dark-text">Register</h1>
        </div>
        <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" required />
        <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@iamneo.ai" required pattern="^[^@\s]+@iamneo\.ai$" />
        <input className="field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" required minLength={8} />
        <select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
          <option value="trainer">Trainer</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit" className="primary-button w-full px-4" disabled={loading}>{loading ? "Creating" : "Register"}</button>
        <p className="text-center text-sm font-bold text-light-subtext dark:text-dark-subtext">
          Already registered? <Link to="/login" className="text-accent">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
