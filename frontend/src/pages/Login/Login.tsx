import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {ShieldCheck} from "lucide-react";
import {api} from "../../api";
import {useAuth} from "../../auth";
import Nav from "../../components/navigation/Nav";

export default function Login(){
  const {login,google}=useAuth();
  const nav=useNavigate();

  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [register,setRegister]=useState(false);
  const [mode,setMode]=useState<"user"|"admin">("user");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  async function routeByRole(
    firebaseUser:any,
    selectedMode:"user"|"admin"
  ){
    const token=await firebaseUser.getIdToken(true);

    const me=await api(
      "/api/users/me",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    const role=me?.role;

    if(
      selectedMode==="admin" &&
      role!=="admin"
    ){
      throw new Error(
        "This Google account is not an Admin account. Add its Firebase UID to ADMIN_UIDS or grant the admin custom claim."
      );
    }

    if(
      selectedMode==="user" &&
      role==="admin"
    ){
      throw new Error(
        "This is an Admin account. Select Admin to continue."
      );
    }

    nav(
      role==="admin"
        ? "/admin"
        : "/dashboard"
    );
  }

  async function submit(e:any){
    e.preventDefault();

    setBusy(true);
    setErr("");

    try{
      if(register){
        if(mode==="admin"){
          throw new Error(
            "Admin accounts are created in Firebase Authentication. Select Admin and use an existing admin account."
          );
        }

        const {auth:firebaseAuth}=await import("../../firebase");
        if(!firebaseAuth){
          throw new Error("Firebase is not configured. Please add the VITE_FIREBASE_* values to frontend/.env and restart the app.");
        }

        const {createUserWithEmailAndPassword}=await import("firebase/auth");
        const credential=await createUserWithEmailAndPassword(firebaseAuth,email,pass);

        await routeByRole(
          credential.user,
          "user"
        );
      }else{
        await login(email,pass);

        const {auth:firebaseAuth}=await import("../../firebase");
        const currentUser=firebaseAuth?.currentUser;
        if(!currentUser){
          throw new Error("Login completed but the Firebase session is unavailable. Please try again.");
        }
        await routeByRole(currentUser,mode);
      }
    }catch(x:any){
      setErr(
        x?.message ||
        "Unable to sign in. Please try again."
      );
    }finally{
      setBusy(false);
    }
  }

  async function continueGoogle(){
    setBusy(true);
    setErr("");

    try{
      await google();

      const {auth:firebaseAuth}=await import("../../firebase");
      const currentUser=firebaseAuth?.currentUser;
      if(!currentUser){
        throw new Error("Google login completed but the Firebase session is unavailable. Please try again.");
      }
      await currentUser.getIdToken(true);
      await routeByRole(currentUser,mode);
    }catch(x:any){
      setErr(
        x?.message ||
        "Google sign-in failed. Please try again."
      );
    }finally{
      setBusy(false);
    }
  }

  const isAdmin=mode==="admin";

  return (
    <>
      <Nav/>

      <div
        className={`auth-page ${
          isAdmin
            ? "admin-mode"
            : "user-mode"
        }`}
      >
        <div className="auth-image">
          <div className="auth-image-shade"></div>

          <div className="auth-image-caption">
            <span className="auth-caption-dot"></span>

            {isAdmin
              ? "Aarogyam Space Studio · Administration"
              : "Aarogyam Space Studio · Your practice"}
          </div>
        </div>

        <form
          className="auth-card"
          onSubmit={submit}
        >
          <div className="auth-intro">
            <p className="eyebrow">
              {isAdmin
                ? "PRIVATE ADMIN PORTAL"
                : "YOUR PRACTICE, YOUR SPACE"}
            </p>

            <div className="auth-title-wrap">
              <h1 key={`${mode}-${register}`}>
                {isAdmin
                  ? "Welcome, Admin."
                  : register
                    ? "Begin your journey."
                    : "Welcome back."}
              </h1>
            </div>

            <div className="auth-description">
              <p key={`${mode}-${register}`}>
                {isAdmin
                  ? "Manage courses, members, orders and your Aarogyam Space Studio experience."
                  : "Access your courses, progress and private communities."}
              </p>
            </div>
          </div>

          <div
            className="mode-switch"
            role="tablist"
            aria-label="Login type"
          >
            <button
              type="button"
              className={!isAdmin?"active":""}
              onClick={()=>{
                setMode("user");
                setRegister(false);
                setErr("");
              }}
              aria-selected={!isAdmin}
            >
              <span className="mode-icon">
                ◉
              </span>
              User
            </button>

            <button
              type="button"
              className={isAdmin?"active":""}
              onClick={()=>{
                setMode("admin");
                setRegister(false);
                setErr("");
              }}
              aria-selected={isAdmin}
            >
              <span className="mode-icon">
                ◆
              </span>
              Admin
            </button>
          </div>

          <div className="auth-fields">
            <label>
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder={
                isAdmin
                  ? "Admin email"
                  : "Email address"
              }
              required
              autoComplete="email"
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={pass}
              onChange={e=>setPass(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-error-slot">
            {err&&(
              <div className="error">
                {err}
              </div>
            )}
          </div>

          <button
            className="btn primary full auth-submit"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="button-spinner"></span>
                Signing in…
              </>
            ) : isAdmin ? (
              "Sign in as Admin"
            ) : register ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>

          <div className="or">
            <span/>
            or
            <span/>
          </div>

          <button
            type="button"
            className="btn google full"
            onClick={continueGoogle}
            disabled={busy}
          >
            <span
              style={{
                fontWeight:800,
                fontSize:15
              }}
            >
              G
            </span>

            Continue with Google
          </button>

          {!isAdmin&&(
            <button
              type="button"
              className="switch"
              onClick={()=>{
                setRegister(!register);
                setErr("");
              }}
            >
              {register
                ? "Already a member? Sign in"
                : "New here? Create account"}
            </button>
          )}

          {isAdmin&&(
            <div className="admin-access-note">
              <ShieldCheck size={15}/>

              <span>
                Admin access is verified by Firebase and
                the backend. Selecting Admin does not grant
                admin privileges.
              </span>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
