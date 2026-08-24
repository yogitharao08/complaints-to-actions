import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { login, registerLocalAccount, verifyCitizenRegistration } from "../api.js";
import { ThemeToggle } from "../components/common/ThemeToggle.jsx";

export function LoginPage({ setUser, theme, onThemeChange }) {
  const [identifier, setIdentifier] = useState("citizen@cta.test");
  const [password, setPassword] = useState("password");
  const [creating, setCreating] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", email: "", mobile: "", address: "", password: "", role: "citizen" });
  const [registrationOtp, setRegistrationOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const navigate = useNavigate();

  useEffect(() => {
    if (!otpSent) return;
    setTimeLeft(600);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const signedIn = await login(identifier, password);
      setUser(signedIn);
      navigate(`/${signedIn.role}`);
    } catch (_error) {
      alert("Login failed. Start the backend server and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page simple-login">
      <div className="login-theme-action"><ThemeToggle theme={theme} onThemeChange={onThemeChange} /></div>
      {!creating ? <form className="login-form simple-card" onSubmit={submit}>
        <div className="logo-row"><Building2 size={32} /><strong>Complaint to Action</strong></div>
        <h2>Login</h2>
        <label>Email or Mobile<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <div className="prefill-container">
          <span className="prefill-label">Quick Prefill (Demo Accounts)</span>
          <div className="prefill-buttons">
            <button type="button" className="soft small" onClick={() => { setIdentifier("citizen@cta.test"); setPassword("password"); }}>Citizen</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("admin@cta.test"); setPassword("password"); }}>Admin</button>
          </div>
          <span className="prefill-label" style={{ marginTop: "4px" }}>Officers by Department:</span>
          <div className="prefill-buttons">
            <button type="button" className="soft small" onClick={() => { setIdentifier("roads@cta.test"); setPassword("password"); }}>Roads</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("water@cta.test"); setPassword("password"); }}>Water</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("sanitation@cta.test"); setPassword("password"); }}>Sanitation</button>
            <button type="button" className="soft small" onClick={() => { setIdentifier("electricity@cta.test"); setPassword("password"); }}>Electricity</button>
          </div>
        </div>
        <button className="primary full" disabled={busy} type="submit">{busy ? "Logging in..." : "Login"}</button>
        <button className="outline full" type="button" onClick={() => setCreating(true)}>Create Account</button>
        <div className="login-links">
          <button className="link" type="button" onClick={() => navigate("/")}>Home</button>
        </div>
      </form> : <form className="login-form simple-card" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
          if (!otpSent) {
            const registration = await registerLocalAccount(newAccount);
            setOtpSent(true);
            alert(registration.previewUrl ? `OTP sent. Ethereal preview: ${registration.previewUrl}` : "OTP sent to your email.");
          } else {
            const signedIn = await verifyCitizenRegistration(newAccount.email, registrationOtp);
            setUser(signedIn);
            navigate(`/${signedIn.role}`);
          }
        } catch (error) {
          alert(error.response?.data?.message || error.message);
        } finally {
          setBusy(false);
        }
      }}>
        <div className="logo-row"><Building2 size={32} /><strong>Complaint to Action</strong></div>
        <h2>{otpSent ? "Verify Email" : "Create Account"}</h2>
        <p>{otpSent ? `Enter the OTP sent to ${newAccount.email}.` : "Create a citizen account with email verification."}</p>
        {!otpSent && (
          <>
            <label>Name<input required value={newAccount.name} onChange={(event) => setNewAccount({ ...newAccount, name: event.target.value })} /></label>
            <label>Email<input required type="email" value={newAccount.email} onChange={(event) => setNewAccount({ ...newAccount, email: event.target.value })} /></label>
            <label>Mobile Number (Optional)<input type="tel" value={newAccount.mobile} onChange={(event) => setNewAccount({ ...newAccount, mobile: event.target.value })} /></label>
            <label>Address (Optional)<input value={newAccount.address} onChange={(event) => setNewAccount({ ...newAccount, address: event.target.value })} /></label>
            <label>Password<input required type="password" value={newAccount.password} onChange={(event) => setNewAccount({ ...newAccount, password: event.target.value })} /></label>
          </>
        )}
        {otpSent && (
          <label style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Verification OTP</span>
              <span className="otp-expiry-note" style={{ fontSize: "12px", color: timeLeft > 0 ? "var(--muted)" : "var(--danger)", fontWeight: "normal" }}>
                {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "Expired"}
              </span>
            </div>
            <div className="otp-container">
              {[...Array(6)].map((_, i) => {
                const char = registrationOtp[i] || "";
                const isFocused = registrationOtp.length === i;
                return (
                  <div key={i} className={`otp-box ${char ? "filled" : ""} ${isFocused ? "focused" : ""}`}>
                    {char}
                  </div>
                );
              })}
              <input
                type="text"
                pattern="\d*"
                inputMode="numeric"
                maxLength={6}
                value={registrationOtp}
                onChange={(event) => setRegistrationOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="otp-hidden-input"
                autoFocus
                required
              />
            </div>
          </label>
        )}
        <input type="hidden" value="citizen" readOnly />
        <p className="form-note">Public registration is only for citizens. Officer and admin accounts are created by an administrator.</p>
        <button className="primary full" disabled={busy} type="submit">{busy ? "Please wait..." : otpSent ? "Verify & Continue" : "Send OTP"}</button>
        {otpSent && <button className="outline full" disabled={busy} type="button" onClick={async () => {
          setBusy(true);
          try {
            const registration = await registerLocalAccount(newAccount);
            setRegistrationOtp("");
            setTimeLeft(600);
            alert(registration.previewUrl ? `A new OTP has been sent. Ethereal preview: ${registration.previewUrl}` : "A new OTP has been sent.");
          } catch (error) {
            alert(error.response?.data?.message || error.message);
          } finally {
            setBusy(false);
          }
        }}>Resend OTP</button>}
        <button className="outline full" type="button" onClick={() => {
          setCreating(false);
          setOtpSent(false);
          setRegistrationOtp("");
        }}>Back to Login</button>
        <button className="link full" type="button" onClick={() => navigate("/")}>Back to Home</button>
      </form>}
    </main>
  );
}
