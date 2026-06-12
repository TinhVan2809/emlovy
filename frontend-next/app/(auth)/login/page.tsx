"use client";
import port from "@/api/api";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/useUserContext";

function Login() {
  const { refreshUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const onShowPassword = () => {
    setShowPassword((v) => !v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  // Handle Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      alert("Thieu username hoac password");
      return;
    }
    try {
      const response = await fetch(`${port}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        if (data.data?.user?.role === "customer") {
          await refreshUser();
          await router.push("/");
        } else {
          await refreshUser();
          await router.push("/admin/dashboard")
        }
        console.log("Login success", data);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (_err) {
      console.error("Error submit form", _err);
    }
  };

  return (
    <>
      <section className="section-container">
        <Image
          src={"/loginbg.jpg"}
          alt="login background"
          fill
          className="img"
          loading="eager"
        />

        <div className="login-model">
          <div className="login-form">
            <div className="left">
              <Image
                src={"/loginimg.jpg"}
                fill
                alt="login img"
                className="img"
                loading="eager"
              />
              <div className="description">
                <div className="content">
                  <span className="title">Emlovy</span>
                  <span className="info">&copy;copyright - emlovy - 2026</span>
                </div>
              </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
              <div className="box">
                <div className="title-box">
                  <span className="title">Welcome back</span>
                  <span className="signin">
                    Dont not have any account?{" "}
                    <Link href={"/register"}>Sign in</Link>
                  </span>
                </div>
                <div className="input-container">
                  <div className="item">
                    <label htmlFor="">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="item">
                    <div className="password-box">
                      <label htmlFor="">Password</label>
                      <input
                        type={showPassword === true ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        ref={passwordRef}
                      />
                    </div>
                    <div className="forget">
                      <div className="show-password">
                        <input
                          type="checkbox"
                          className="checkbox"
                          onClick={onShowPassword}
                        />
                        <span>Show password</span>
                      </div>
                      <Link href={"#"}>Fotget password?</Link>
                    </div>
                  </div>
                </div>
                <div className="btn">
                  <button>Log in</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
