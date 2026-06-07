"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
function Login() {
  const [showPassoword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const onShowPassword = () => {
    setShowPassword((v) => !v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn submit fomr mặc định khi tấn enter tránh reload lại trang
      passwordRef.current?.focus();
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
        />

        <div className="login-model">
          <div className="login-form">
            <div className="left">
              <Image
                src={"/loginimg.jpg"}
                fill
                alt="login img"
                className="img"
              />
              <div className="description">
                <div className="content">
                  <span className="title">Emlovy</span>
                  <span className="info">&copy;copyright - emlovy - 2026</span>
                </div>
              </div>
            </div>

            <form className="form-container">
              <div className="box">
                <div className="title-box">
                  <span className="title">Welcome back</span>
                  <span className="signin">
                    Dont not have any account? <Link href={"/register"}>Sign in</Link>
                  </span>
                </div>
                <div className="input-container">
                  <div className="item">
                    <label htmlFor="">Username</label>
                    <input type="text" onKeyDown={handleKeyDown} />
                  </div>
                  <div className="item">
                    <div className="password-box">
                      <label htmlFor="">Password</label>
                      <input
                        type={showPassoword === true ? "text" : "password"}
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
