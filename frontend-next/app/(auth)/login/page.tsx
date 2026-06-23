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

  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
          await router.push("/admin/dashboard");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (_err) {
      console.error("Error submit form", _err);
    } finally {
      setIsLoading(false);
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
                  <button>
                    {isLoading ? (
                      <div role="status">
                        <svg 
                          aria-hidden="true"
                          className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                          viewBox="0 0 100 101" 
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      </div>
                    ) : (
                      "Log in"
                    )}
                  </button>
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
