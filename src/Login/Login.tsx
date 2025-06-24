import { useState } from "react";
import Logo from "../assets/logo.png"; // replace with your logo path
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  interface HandleChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  function handleChange(e: HandleChangeEvent) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  interface LoginFormData {
    username: string;
    password: string;
  }

  interface ChangeEventType extends React.ChangeEvent<HTMLInputElement> {}

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // You can add logic here
    alert("Login submitted");
  }

  return (
    <div className="login-container">
      {/* Left: Logo */}
      <div className="login-left">
        <img src={Logo} alt="Turf Zone Logo" className="login-logo" />
      </div>

      {/* Right: Form */}
      <div className="login-right">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Login</h2>

          <label>User Name:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="login-button-container">
          <button type="submit" className="login-button">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
