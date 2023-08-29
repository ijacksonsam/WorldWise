import styles from "./Signup.module.css";
import { useState, useEffect } from "react";
import PageNav from "../components/PageNav";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Signup() {
  // PRE-FILL FOR DEV PURPOSES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  async function handleSubmit(e) {
    if (!email || !password || !name) return;
    e.preventDefault();
    await signup(email, password, name, avatar);
  }
  useEffect(
    function () {
      if (isAuthenticated) navigate("/app", { replace: true });
    },
    [isAuthenticated, navigate]
  );
  return (
    <main className={styles.login} onSubmit={handleSubmit}>
      <PageNav />
      <form className={styles.form}>
        <div className={styles.row}>
          <label htmlFor="name">Username</label>
          <input
            type="name"
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="avatar">Avatar</label>
          <input
            type="avatar"
            id="avatar"
            onChange={(e) => setAvatar(e.target.value)}
            value={avatar}
            placeholder="leave empty to get a default..."
          />
        </div>

        <div>
          <Button type={"primary"}>Sign Up</Button>
        </div>
      </form>
    </main>
  );
}
