import {useEffect,useState} from "react";
import {Link,Route,Routes,useNavigate,useParams} from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Instagram,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Play,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
  Zap
} from "lucide-react";
import {api} from "./api";
import {AuthProvider,useAuth} from "./auth";

type Course={
  id:number;
  title:string;
  slug:string;
  image:string;
  short_description:string;
  description:string;
  category:string;
  difficulty:string;
  duration:string;
  sessions:number;
  instructor:string;
  pricing:any;
  services:any[];
  benefits:string[];
  curriculum:any[];
  whatsapp_included:boolean;
  rating:number;
  review_count:number;
};

function Reveal({
  children,
  className=""
}:{
  children:any;
  className?:string
}){
  return <div className={`reveal ${className}`}>{children}</div>;
}

function Nav(){
  const {user,logout}=useAuth();
  const [open,setOpen]=useState(false);

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <Zap size={17}/>
        </span>
        <span>
          ANANDA<span className="brand-dot">.</span>
        </span>
      </Link>

      <nav className={open?"nav-links open":"nav-links"}>
        <a href="/#about" onClick={()=>setOpen(false)}>About</a>
        <a href="/#courses" onClick={()=>setOpen(false)}>Courses</a>
        <a href="/#services" onClick={()=>setOpen(false)}>Services</a>
        <a href="/#contact" onClick={()=>setOpen(false)}>Contact</a>

        {user ? (
          <>
            <Link
              to="/dashboard"
              onClick={()=>setOpen(false)}
            >
              My space
            </Link>

            <button
              className="link-btn"
              onClick={async()=>{
                await logout();
                window.location.assign("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={()=>setOpen(false)}
          >
            Login
          </Link>
        )}
      </nav>

      <button
        className="menu-btn"
        onClick={()=>setOpen(!open)}
      >
        {open?<X/>:<Menu/>}
      </button>
    </header>
  );
}

function Home(){
  const [courses,setCourses]=useState<Course[]>([]);

  useEffect(()=>{
    api("/api/courses")
      .then(setCourses)
      .catch(console.error);
  },[]);

  return (
    <>
      <Nav/>

      <main>
        <section className="hero">
          <div className="hero-image"></div>

          <div className="hero-copy">
            <p className="eyebrow">
              MINDFUL MOVEMENT · MODERN LIVING
            </p>

            <h1>
              Come home
              <br/>
              <i>to yourself.</i>
            </h1>

            <p className="hero-text">
              Premium yoga journeys designed to make movement feel natural,
              breath feel spacious, and everyday life feel a little lighter.
            </p>

            <div className="actions">
              <a
                className="btn primary"
                href="#courses"
              >
                Explore courses
                <ArrowRight size={17}/>
              </a>

              <Link
                className="btn ghost"
                to="/login"
              >
                Start your journey
              </Link>
            </div>
          </div>

          <div className="scroll-cue">
            SCROLL <span></span>
          </div>
        </section>

        <section
          id="about"
          className="section split"
        >
          <Reveal>
            <p className="eyebrow">
              A QUIETER WAY FORWARD
            </p>

            <h2>
              Yoga that meets you where you are.
            </h2>
          </Reveal>

          <Reveal>
            <p className="lead">
              Ananda combines guided movement, meditation and practical
              consistency into beautiful programs you can follow at your
              own pace.
            </p>

            <div className="stats">
              <div>
                <b>30+</b>
                <span>guided sessions</span>
              </div>

              <div>
                <b>1:1</b>
                <span>mindful attention</span>
              </div>

              <div>
                <b>∞</b>
                <span>room to grow</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section
          id="courses"
          className="section warm"
        >
          <Reveal>
            <p className="eyebrow">
              THE LIBRARY
            </p>

            <h2>
              Find your practice.
            </h2>
          </Reveal>

          <div className="course-grid">
            {courses.map(c=>(
              <CourseCard
                key={c.id}
                c={c}
              />
            ))}
          </div>
        </section>

        <section
          id="services"
          className="section"
        >
          <div className="service-head">
            <Reveal>
              <p className="eyebrow">
                WHAT'S INCLUDED
              </p>

              <h2>
                More than a class.
              </h2>
            </Reveal>

            <Reveal>
              <p className="lead">
                Every program is built as a complete wellness experience,
                not a collection of videos.
              </p>
            </Reveal>
          </div>

          <div className="service-grid">
            {[
              "Live guided classes",
              "Recorded sessions",
              "Meditation & breathwork",
              "Progress tracking",
              "Personal guidance",
              "Private community"
            ].map((x,i)=>(
              <Reveal key={x}>
                <div className="service-card">
                  <span>
                    0{i+1}
                  </span>

                  <h3>{x}</h3>

                  <p>
                    Thoughtfully designed support that helps your practice
                    become a sustainable part of life.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="quote-section">
          <div>
            <p className="eyebrow">
              THE ANANDA APPROACH
            </p>

            <h2>
              Strength without rush.
              <br/>
              Stillness without pressure.
            </h2>

            <p>
              “The goal isn't to touch your toes. The goal is what you learn
              on the way down.”
            </p>
          </div>
        </section>

        <section className="section faq">
          <Reveal>
            <p className="eyebrow">
              QUESTIONS
            </p>

            <h2>
              Frequently asked.
            </h2>
          </Reveal>

          {[
            "Is yoga suitable for beginners?",
            "How long do I keep course access?",
            "Can I practice from home?",
            "How does the private community work?"
          ].map(q=>(
            <details key={q}>
              <summary>
                {q}
                <ChevronDown size={18}/>
              </summary>

              <p>
                Yes. Each course explains its level, duration and included
                services before you purchase. Your protected member area
                contains the content you have purchased.
              </p>
            </details>
          ))}
        </section>
      </main>

      <Footer/>
    </>
  );
}

function CourseCard({c}:{c:Course}){
  return (
    <Reveal>
      <Link
        className="course-card"
        to={`/courses/${c.slug}`}
      >
        <div
          className="course-img"
          style={{
            backgroundImage:`url(${c.image})`
          }}
        >
          <span>
            {c.difficulty}
          </span>
        </div>

        <div className="course-body">
          <div className="course-meta">
            <span>{c.category}</span>

            <span>
              ★ {c.rating||"New"} · {c.review_count} reviews
            </span>
          </div>

          <h3>{c.title}</h3>

          <p>
            {c.short_description}
          </p>

          <div className="price">
            <strong>
              ₹{c.pricing.final_price.toLocaleString("en-IN")}
            </strong>

            {c.pricing.discount_active&&(
              <>
                <del>
                  ₹{c.pricing.selling_price.toLocaleString("en-IN")}
                </del>

                <em>
                  {c.pricing.discount_percent}% OFF
                </em>
              </>
            )}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function Footer(){
  return (
    <footer id="contact">
      <div className="footer-main">
        <div>
          <Link
            to="/"
            className="brand"
          >
            <span className="brand-mark">
              <Zap size={17}/>
            </span>

            <span>
              ANANDA<span className="brand-dot">.</span>
            </span>
          </Link>

          <p>
            Premium yoga for a more present life.
          </p>
        </div>

        <div className="footer-links">
          <a href="/#courses">Courses</a>
          <a href="/#services">Services</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Refund policy</a>
        </div>

        <div className="social">
          <Instagram size={18}/>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Ananda Yoga. All rights reserved.
      </div>
    </footer>
  );
}

function CourseDetail(){
  const {slug}=useParams();
  const [c,setC]=useState<Course|null>(null);
  const [reviews,setReviews]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const {user}=useAuth();
  const nav=useNavigate();

  useEffect(()=>{
    Promise.all([
      api(`/api/courses/${slug}`)
    ])
      .then(([x])=>{
        setC(x);
        return api(`/api/courses/${x.id}/reviews`);
      })
      .then(setReviews)
      .finally(()=>setLoading(false));
  },[slug]);

  if(loading){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your practice…
        </div>
      </>
    );
  }

  if(!c){
    return (
      <>
        <Nav/>
        <div className="loading">
          Course not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Nav/>

      <main>
        <section className="detail-hero">
          <div
            className="detail-image"
            style={{
              backgroundImage:`url(${c.image})`
            }}
          ></div>

          <div className="detail-copy">
            <p className="eyebrow">
              {c.category} · {c.difficulty}
            </p>

            <h1>
              {c.title}
            </h1>

            <p className="lead">
              {c.description}
            </p>

            <div className="rating">
              <Star
                fill="currentColor"
                size={16}
              />
              {c.rating||"New"}
              <span>
                ({c.review_count} reviews)
              </span>
            </div>

            <div className="buy-card">
              <div>
                <del>
                  ₹{c.pricing.selling_price.toLocaleString("en-IN")}
                </del>

                <strong>
                  ₹{c.pricing.final_price.toLocaleString("en-IN")}
                </strong>

                {c.pricing.discount_active&&(
                  <em>
                    {c.pricing.discount_percent}% OFF
                  </em>
                )}
              </div>

              <button
                className="btn primary"
                onClick={()=>
                  user
                    ? nav(`/checkout/${c.id}`)
                    : nav("/login",{
                        state:{
                          from:`/courses/${c.slug}`
                        }
                      })
                }
              >
                Buy this course
                <ArrowRight size={17}/>
              </button>
            </div>

            <div className="detail-facts">
              <span>{c.duration}</span>
              <span>{c.sessions} sessions</span>
              <span>With {c.instructor}</span>
            </div>
          </div>
        </section>

        <section className="section detail-grid">
          <div>
            <h2>
              What's inside
            </h2>

            <div className="benefits">
              {c.benefits.map(x=>(
                <div key={x}>
                  <Check size={17}/>
                  {x}
                </div>
              ))}
            </div>

            <h2 className="mt">
              Curriculum
            </h2>

            <div className="curriculum">
              {c.curriculum
                .sort((a,b)=>a.position-b.position)
                .map((x:any)=>(
                  <div key={x.position}>
                    <b>
                      {String(x.position).padStart(2,"0")}
                    </b>

                    <span>
                      {x.title}
                    </span>

                    <small>
                      {x.duration}
                    </small>
                  </div>
                ))}
            </div>
          </div>

          <aside>
            <div className="sticky-card">
              <h3>
                Included with this course
              </h3>

              {c.services.map(x=>(
                <div
                  className="service-line"
                  key={x.name}
                >
                  <ShieldCheck size={16}/>

                  <span>
                    <b>{x.name}</b>
                    <small>{x.description}</small>
                  </span>
                </div>
              ))}

              {c.whatsapp_included&&(
                <p className="protected-note">
                  <Lock size={15}/>
                  Private community access is included after purchase.
                </p>
              )}
            </div>
          </aside>
        </section>

        <Reviews
          courseId={c.id}
          data={reviews}
        />
      </main>

      <Footer/>
    </>
  );
}

function Reviews({
  courseId,
  data
}:{
  courseId:number;
  data:any
}){
  const {user}=useAuth();
  const [rating,setRating]=useState(5);
  const [comment,setComment]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(){
    try{
      await api(
        `/api/courses/${courseId}/reviews`,
        {
          method:"POST",
          body:JSON.stringify({
            rating,
            comment
          })
        }
      );

      setMsg("Review submitted.");
      setComment("");
    }catch(e:any){
      setMsg(e.message);
    }
  }

  return (
    <section className="section reviews">
      <div className="review-head">
        <div>
          <p className="eyebrow">
            VERIFIED STUDENTS
          </p>

          <h2>
            What students say.
          </h2>
        </div>

        <div className="big-rating">
          <b>
            {data?.average||0}
          </b>

          <span>
            ★★★★★
          </span>

          <small>
            {data?.reviews?.length||0} reviews
          </small>
        </div>
      </div>

      <div className="review-grid">
        {(data?.reviews||[]).map((r:any)=>(
          <article key={r.id}>
            <div className="stars">
              {"★".repeat(r.rating)}
              {"☆".repeat(5-r.rating)}
            </div>

            <p>
              “{r.comment}”
            </p>

            <small>
              Verified Purchase ·{" "}
              {new Date(r.created_at).toLocaleDateString()}
            </small>
          </article>
        ))}
      </div>

      {user&&(
        <div className="review-form">
          <h3>
            Rate this course
          </h3>

          <div className="star-select">
            {[1,2,3,4,5].map(x=>(
              <button
                key={x}
                onClick={()=>setRating(x)}
                className={x<=rating?"selected":""}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={e=>setComment(e.target.value)}
            placeholder="Share an honest experience…"
            rows={4}
          />

          <button
            className="btn primary"
            onClick={submit}
          >
            Submit review
          </button>

          {msg&&<p>{msg}</p>}
        </div>
      )}
    </section>
  );
}

function Login(){
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

        const {auth}=await import("./firebase");

        const {
          createUserWithEmailAndPassword
        }=await import("firebase/auth");

        const credential=
          await createUserWithEmailAndPassword(
            auth,
            email,
            pass
          );

        await routeByRole(
          credential.user,
          "user"
        );
      }else{
        await login(email,pass);

        const {auth}=await import("./firebase");

        if(!auth.currentUser){
          throw new Error(
            "Login completed but the Firebase session is unavailable. Please try again."
          );
        }

        await routeByRole(
          auth.currentUser,
          mode
        );
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

      const {auth}=await import("./firebase");

      if(!auth.currentUser){
        throw new Error(
          "Google login completed but the Firebase session is unavailable. Please try again."
        );
      }

      await auth.currentUser.getIdToken(true);

      await routeByRole(
        auth.currentUser,
        mode
      );
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
              ? "Ananda · Administration"
              : "Ananda · Your practice"}
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
                  ? "Manage courses, members, orders and your Ananda experience."
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

function Sidebar({
  role,
  name,
  email
}:{
  role:"member"|"admin";
  name:string;
  email:string;
}){
  const {logout}=useAuth();

  const [open,setOpen]=useState(false);

  const displayName=
    name ||
    email.split("@")[0] ||
    "Account";

  const isAdmin=role==="admin";

  return (
    <aside
      className={`portal-sidebar ${
        open ? "open" : ""
      }`}
    >
      <div className="portal-brand">
        <Link
          to="/"
          className="brand"
        >
          <span className="brand-mark">
            <Zap size={17}/>
          </span>

          <span>
            ANANDA<span className="brand-dot">.</span>
          </span>
        </Link>

        <button
          className="portal-close"
          onClick={()=>setOpen(false)}
        >
          <X size={19}/>
        </button>
      </div>

      <div className="portal-role">
        <span className="portal-role-dot"></span>

        <div>
          <b>
            {isAdmin
              ? "Admin workspace"
              : "Member workspace"}
          </b>

          <small>
            {isAdmin
              ? "Private administration"
              : "Your personal space"}
          </small>
        </div>
      </div>

      <nav className="portal-nav">
        <Link
          to={isAdmin?"/admin":"/dashboard"}
          className="portal-nav-primary"
        >
          <LayoutDashboard size={17}/>
          <span>{isAdmin ? "Overview" : "My space"}</span>
        </Link>

        {!isAdmin&&(
          <Link to="/#courses">
            <ShoppingBag size={17}/>
            <span>Courses</span>
          </Link>
        )}

        {isAdmin&&(
          <Link to="/admin#manage-courses">
            <ShoppingBag size={17}/>
            <span>Manage courses</span>
          </Link>
        )}

        {isAdmin&&(
          <Link to="/admin#orders">
            <ShoppingBag size={17}/>
            <span>Orders & reviews</span>
          </Link>
        )}
      </nav>

      <div className="portal-account">
        <div className="portal-avatar">
          {displayName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="portal-account-copy">
          <b>
            {displayName}
          </b>

          <span>
            {isAdmin
              ? "Administrator"
              : "Member"}
          </span>
        </div>

        <button
          className="portal-logout"
          title="Log out"
          onClick={async()=>{
            await logout();
            window.location.assign("/login");
          }}
        >
          <LogOut size={17}/>
        </button>
      </div>

      <button
        className="portal-mobile-trigger"
        onClick={()=>setOpen(!open)}
      >
        <Menu size={20}/>
      </button>
    </aside>
  );
}

function PortalLayout({
  role,
  name,
  email,
  children
}:{
  role:"member"|"admin";
  name:string;
  email:string;
  children:any;
}){
  return (
    <div
      className={`portal-layout ${
        role==="admin"
          ? "portal-admin"
          : "portal-member"
      }`}
    >
      <Sidebar
        role={role}
        name={name}
        email={email}
      />

      <main className="portal-content">
        {children}
      </main>
    </div>
  );
}

function Dashboard(){
  const {user}=useAuth();
  const nav=useNavigate();

  const [data,setData]=useState<any>();
  const [roleChecked,setRoleChecked]=useState(false);

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    api("/api/users/me")
      .then((m:any)=>{
        if(m.role==="admin"){
          nav("/admin");
          return;
        }

        setRoleChecked(true);

        return api(
          "/api/users/dashboard"
        );
      })
      .then((d:any)=>{
        if(d){
          setData(d);
        }
      })
      .catch(e=>{
        console.error(e);
        nav("/login");
      });
  },[user,nav]);

  if(
    !user ||
    !roleChecked ||
    !data
  ){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your space…
        </div>
      </>
    );
  }

  return (
    <PortalLayout
      role="member"
      name={data.user.name}
      email={data.user.email}
    >
      <div className="member member-portal">
        <div className="portal-topbar">
          <div>
            <p className="eyebrow">
              MEMBER SPACE
            </p>

            <h1>
              Welcome,{" "}
              {data.user.name ||
                data.user.email.split("@")[0]}.
            </h1>

            <p>
              Keep your practice moving gently forward.
            </p>
          </div>

          <div className="portal-secure">
            <ShieldCheck size={17}/>
            <span>
              Protected account
            </span>
          </div>
        </div>

        <section className="member-grid">
          <div className="member-panel wide">
            <h2>
              My courses
            </h2>

            {data.courses.length ? (
              <div className="mini-courses">
                {data.courses.map((c:any)=>(
                  <Link
                    to={`/learn/${c.id}`}
                    key={c.id}
                  >
                    <img src={c.image}/>

                    <div>
                      <h3>
                        {c.title}
                      </h3>

                      <p>
                        {c.progress}% complete
                      </p>

                      <div className="progress">
                        <span
                          style={{
                            width:`${c.progress}%`
                          }}
                        />
                      </div>
                    </div>

                    <ArrowRight/>
                  </Link>
                ))}
              </div>
            ) : (
              <p>
                No purchased courses yet.{" "}
                <Link to="/#courses">
                  Explore the library.
                </Link>
              </p>
            )}
          </div>

          <div className="member-panel">
            <h2>
              Profile
            </h2>

            <p>
              {data.user.name}
            </p>

            <p>
              {data.user.email}
            </p>

            <p className="muted">
              Member since{" "}
              {new Date(
                data.user.created_at
              ).toLocaleDateString()}
            </p>
          </div>

          <div className="member-panel wide">
            <h2>
              Payment history
            </h2>

            {data.payments.length ? (
              data.payments.map((p:any)=>(
                <div
                  className="payment-row"
                  key={p.id}
                >
                  <span>
                    Order #{p.order_id||p.id}
                  </span>

                  <b>
                    ₹{p.amount.toLocaleString("en-IN")}
                  </b>

                  <small>
                    {p.status}
                  </small>
                </div>
              ))
            ) : (
              <p className="muted">
                No payments yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}

function Learn(){
  const {courseId}=useParams();
  const [course,setCourse]=useState<Course|null>(null);
  const [access,setAccess]=useState<any>();
  const {user}=useAuth();
  const nav=useNavigate();
  const [me,setMe]=useState<any>();

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    Promise.all([
      api("/api/users/me"),
      api(`/api/users/courses/${courseId}/access`),
      api("/api/courses")
    ])
      .then(([m,a,cs])=>{
        if(m.role!=="member"){
          nav("/admin");
          return;
        }

        setMe(m);
        setAccess(a);

        setCourse(
          (cs as Course[]).find(
            c=>c.id===Number(courseId)
          )||null
        );
      })
      .catch(()=>{
        nav("/dashboard");
      });
  },[user,courseId,nav]);

  if(!course||!me){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your course…
        </div>
      </>
    );
  }

  return (
    <PortalLayout
      role="member"
      name={me.name}
      email={me.email}
    >
      <div className="learn member-portal">
        <div className="portal-topbar">
          <div>
            <p className="eyebrow">
              YOU'RE ENROLLED
            </p>

            <h1>
              {course.title}
            </h1>

            <p>
              Continue your practice at your own pace.
            </p>
          </div>
        </div>

        <div className="learn-hero">
          <img src={course.image}/>

          <div>
            <p className="eyebrow">
              YOUR PRACTICE
            </p>

            <h2>
              {course.title}
            </h2>

            <p>
              {course.description}
            </p>
          </div>
        </div>

        <div className="learn-grid">
          <section>
            <h2>
              Your curriculum
            </h2>

            {course.curriculum.map((x:any)=>(
              <div
                className="lesson"
                key={x.position}
              >
                <button>
                  <Play size={15}/>
                </button>

                <span>
                  {x.title}
                </span>

                <small>
                  {x.duration}
                </small>
              </div>
            ))}
          </section>

          <aside className="sticky-card">
            <h3>
              Private Community
            </h3>

            <p>
              Connect with other students and receive
              course updates.
            </p>

            {access?.whatsapp_available ? (
              <a
                className="btn whatsapp"
                href={access.whatsapp_url}
                target="_blank"
                rel="noreferrer"
              >
                Join WhatsApp Community
              </a>
            ) : (
              <p className="protected-note">
                <Lock size={15}/>
                Community access is not configured for this course.
              </p>
            )}
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
}

function Checkout(){
  const {courseId}=useParams();
  const [course,setCourse]=useState<Course|null>(null);
  const [busy,setBusy]=useState(false);
  const nav=useNavigate();

  useEffect(()=>{
    api("/api/courses")
      .then((cs:Course[])=>{
        setCourse(
          cs.find(
            c=>c.id===Number(courseId)
          )||null
        );
      });
  },[courseId]);

  async function buy(){
    setBusy(true);

    try{
      const order=await api(
        `/api/payments/create-order/${courseId}`,
        {
          method:"POST"
        }
      );

      const Razorpay=(window as any).Razorpay;

      if(!Razorpay){
        throw new Error(
          "Razorpay Checkout script is missing"
        );
      }

      const r=new Razorpay({
        key:order.key_id,
        amount:order.amount,
        currency:order.currency,
        name:"Ananda Yoga",
        description:course?.title,
        order_id:order.order_id,

        handler:async(response:any)=>{
          await api(
            "/api/payments/verify",
            {
              method:"POST",
              body:JSON.stringify(response)
            }
          );

          nav(`/learn/${courseId}`);
        }
      });

      r.open();
    }catch(e:any){
      alert(e.message);
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Nav/>

      <div className="checkout">
        <div>
          <p className="eyebrow">
            SECURE CHECKOUT
          </p>

          <h1>
            Begin your practice.
          </h1>

          <p>
            You'll be redirected to Razorpay's secure
            checkout. Access is granted only after
            server-side payment verification.
          </p>
        </div>

        {course&&(
          <div className="buy-card checkout-card">
            <img src={course.image}/>

            <div>
              <h2>
                {course.title}
              </h2>

              <p>
                {course.short_description}
              </p>

              <strong>
                ₹{course.pricing.final_price.toLocaleString("en-IN")}
              </strong>

              {course.pricing.discount_active&&(
                <em>
                  {course.pricing.discount_percent}% OFF
                </em>
              )}

              <button
                className="btn primary full"
                disabled={busy}
                onClick={buy}
              >
                {busy
                  ? "Creating secure order…"
                  : "Continue to Razorpay"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Admin(){
  const {user}=useAuth();
  const nav=useNavigate();

  const [me,setMe]=useState<any>();
  const [summary,setSummary]=useState<any>();
  const [courses,setCourses]=useState<any[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [reviews,setReviews]=useState<any[]>([]);
  const [editCourse,setEditCourse]=useState<any|null>(null);
  const [buyers,setBuyers]=useState<Record<number,any[]>>({});
  const [loadingBuyers,setLoadingBuyers]=useState<number|null>(null);
  const [manageOnly,setManageOnly]=useState(window.location.hash==="#manage-courses");

  const emptyForm={
    title:"",
    slug:"",
    image:"",
    short_description:"",
    description:"",
    category:"Yoga",
    difficulty:"Beginner",
    duration:"30 days",
    sessions:30,
    instructor:"",
    original_price:5000,
    selling_price:3999,
    status:"draft",
    whatsapp_invite_link:"",
    whatsapp_enabled:false,
    services:[],
    benefits:[],
    curriculum:[]
  };

  const [form,setForm]=useState<any>(emptyForm);

  useEffect(()=>{
    const onHash=()=>setManageOnly(window.location.hash==="#manage-courses");
    window.addEventListener("hashchange",onHash);
    return ()=>window.removeEventListener("hashchange",onHash);
  },[]);

  const load=()=>
    Promise.all([
      api("/api/admin/summary"),
      api("/api/admin/courses"),
      api("/api/admin/orders"),
      api("/api/admin/reviews")
    ])
      .then(([s,c,o,r])=>{
        setSummary(s);
        setCourses(c);
        setOrders(o);
        setReviews(r);
      })
      .catch(e=>{
        console.error(e);
        nav("/dashboard");
      });

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    api("/api/users/me")
      .then((m:any)=>{
        if(m.role!=="admin"){
          nav("/dashboard");
          return;
        }
        setMe(m);
        return load();
      })
      .catch(e=>{
        console.error(e);
        nav("/login");
      });
  },[user,nav]);

  async function create(e:any){
    e.preventDefault();
    try{
      await api("/api/admin/courses",{
        method:"POST",
        body:JSON.stringify({
          ...form,
          services:form.services.filter(Boolean).map((name:string)=>({name})),
          benefits:form.benefits.filter(Boolean),
          curriculum:form.curriculum.filter(Boolean).map((title:string,i:number)=>({
            title,
            position:i+1,
            duration:"20 min"
          }))
        })
      });
      setForm({...emptyForm});
      await load();
      alert("Course created successfully.");
    }catch(x:any){
      alert(x.message);
    }
  }

  function startEdit(c:any){
    setEditCourse({
      ...c,
      services:(c.services||[]).map((x:any)=>typeof x==="string"?x:x.name),
      benefits:[...(c.benefits||[])],
      curriculum:(c.curriculum||[]).map((x:any)=>typeof x==="string"?x:x.title)
    });
  }

  async function saveEdit(e:any){
    e.preventDefault();
    if(!editCourse) return;
    try{
      await api(`/api/admin/courses/${editCourse.id}`,{
        method:"PUT",
        body:JSON.stringify({
          title:editCourse.title,
          slug:editCourse.slug,
          image:editCourse.image||null,
          short_description:editCourse.short_description||"",
          description:editCourse.description||"",
          category:editCourse.category||"Yoga",
          difficulty:editCourse.difficulty||"Beginner",
          duration:editCourse.duration||"30 days",
          sessions:Number(editCourse.sessions)||0,
          instructor:editCourse.instructor||"",
          original_price:Number(editCourse.original_price)||0,
          selling_price:Number(editCourse.selling_price)||0,
          status:editCourse.status||"draft",
          whatsapp_invite_link:editCourse.whatsapp_invite_link||null,
          whatsapp_enabled:Boolean(editCourse.whatsapp_enabled),
          services:(editCourse.services||[]).filter(Boolean).map((name:string)=>({name})),
          benefits:(editCourse.benefits||[]).filter(Boolean),
          curriculum:(editCourse.curriculum||[]).filter(Boolean).map((title:string,i:number)=>({
            title,
            position:i+1,
            duration:"20 min"
          }))
        })
      });
      setEditCourse(null);
      await load();
      alert("Course updated successfully.");
    }catch(x:any){
      alert(x.message);
    }
  }

  async function removeCourse(c:any){
    const ok=window.confirm(
      `Delete "${c.title}"?\n\nIf this course already has paid purchases, it will be archived instead so buyer/payment history is preserved.`
    );
    if(!ok) return;
    try{
      const result=await api(`/api/admin/courses/${c.id}`,{method:"DELETE"});
      await load();
      alert(result.message);
    }catch(x:any){
      alert(x.message);
    }
  }

  async function loadBuyers(courseId:number){
    if(buyers[courseId]){
      setBuyers(prev=>({...prev,[courseId]:[]}));
      return;
    }
    setLoadingBuyers(courseId);
    try{
      const data=await api(`/api/admin/courses/${courseId}/buyers`);
      setBuyers(prev=>({...prev,[courseId]:data}));
    }catch(x:any){
      alert(x.message);
    }finally{
      setLoadingBuyers(null);
    }
  }

  if(!me||!summary){
    return (
      <>
        <Nav/>
        <div className="loading">Verifying admin access…</div>
      </>
    );
  }

  return (
    <PortalLayout role="admin" name={me.name} email={me.email}>
      <div className="admin admin-portal">
        {manageOnly ? (
          <section className="admin-manage-page" id="manage-courses">
            <div className="portal-topbar admin-manage-heading">
              <div>
                <p className="eyebrow">COURSE MANAGEMENT</p>
                <h1>Manage your courses.</h1>
                <p>Only courses created in your admin console appear here. Edit pricing, settings, services and visibility, or remove a course.</p>
              </div>
              <Link className="btn primary" to="/admin">+ Add course</Link>
            </div>

            <div className="admin-course-list">
              {courses.length ? courses.map(c=>(
                <article className="admin-course-card" key={c.id}>
                  <div className="admin-course-card-main">
                    {c.image ? <img src={c.image} alt="" className="admin-course-thumb"/> : <div className="admin-course-thumb admin-course-thumb-empty">ANANDA.</div>}
                    <div className="admin-course-copy">
                      <div className="admin-course-title-row">
                        <h2>{c.title}</h2>
                        <span className={`course-status ${c.status}`}>{c.status}</span>
                      </div>
                      <p>{c.short_description || "No short description added."}</p>
                      <div className="admin-course-meta">
                        <span>₹{c.selling_price.toLocaleString("en-IN")}</span>
                        <span>Original ₹{c.original_price.toLocaleString("en-IN")}</span>
                        <span>{c.duration}</span>
                        <span>{c.services?.length||0} services</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-course-actions">
                    <button className="btn secondary" onClick={()=>startEdit(c)}>Edit course</button>
                    <button className="btn danger" onClick={()=>removeCourse(c)}>Delete</button>
                    <button className="btn ghost" onClick={()=>loadBuyers(c.id)}>
                      {loadingBuyers===c.id ? "Loading…" : buyers[c.id] ? "Hide buyers" : "View buyers"}
                    </button>
                  </div>

                  {buyers[c.id] && (
                    <div className="course-buyers">
                      <div className="course-buyers-heading">
                        <div>
                          <strong>People who purchased this course</strong>
                          <span>{buyers[c.id].length} buyer{buyers[c.id].length===1?"":"s"}</span>
                        </div>
                      </div>
                      {buyers[c.id].length ? buyers[c.id].map((b:any)=>(
                        <div className="buyer-row" key={b.user_id}>
                          <div className="buyer-avatar">{(b.name||"M").charAt(0).toUpperCase()}</div>
                          <div>
                            <b>{b.name || "Member"}</b>
                            <small>{b.email}</small>
                          </div>
                          <span>₹{Number(b.amount).toLocaleString("en-IN")} · {b.status}</span>
                        </div>
                      )) : <p className="muted">No paid purchases yet.</p>}
                    </div>
                  )}
                </article>
              )) : (
                <div className="admin-panel empty-state">
                  <h2>No courses created yet</h2>
                  <p className="muted">Create your first course from the Add course page.</p>
                  <Link className="btn primary" to="/admin">Add your first course</Link>
                </div>
              )}
            </div>

            <div className="admin-panel admin-purchases-panel">
              <div className="section-heading-row">
                <div>
                  <p className="eyebrow">PURCHASE HISTORY</p>
                  <h2>All course buyers</h2>
                </div>
                <span className="muted">Paid orders only</span>
              </div>
              {orders.filter(o=>o.status==="paid").length ? (
                <div className="purchase-table-wrap">
                  <table className="purchase-table">
                    <thead><tr><th>Member</th><th>Course</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead>
                    <tbody>
                      {orders.filter(o=>o.status==="paid").map(o=>(
                        <tr key={o.id}>
                          <td><b>{o.member_name}</b><small>{o.member_email}</small></td>
                          <td>{o.course_title}</td>
                          <td>₹{Number(o.amount).toLocaleString("en-IN")}</td>
                          <td><span className="status-pill paid">Paid</span></td>
                          <td>{new Date(o.date).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="muted">No purchases yet.</p>}
            </div>
          </section>
        ) : (
          <>
            <div className="portal-topbar">
              <div>
                <p className="eyebrow">PRIVATE ADMIN CONSOLE</p>
                <h1>Calm control center.</h1>
                <p>Only your Firebase-authorized admin identity can access this workspace.</p>
              </div>
              <div className="portal-secure"><ShieldCheck size={17}/><span>Admin verified</span></div>
            </div>

            <div className="admin-stats">
              <div><span>Members</span><b>{summary.members}</b></div>
              <div><span>Courses</span><b>{summary.courses}</b></div>
              <div><span>Revenue</span><b>₹{summary.revenue.toLocaleString("en-IN")}</b></div>
              <div><span>Purchases</span><b>{summary.purchases}</b></div>
              <div><span>Rating</span><b>{summary.average_rating.toFixed(1)}</b></div>
            </div>

            <section className="admin-grid">
              <div className="admin-panel" id="courses">
                <div className="section-heading-row">
                  <div>
                    <h2>Add course</h2>
                    <p className="muted">Create a new course. Existing courses are managed from Manage courses.</p>
                  </div>
                  <Link className="btn secondary" to="/admin#manage-courses">Manage courses</Link>
                </div>

                <form onSubmit={create} className="admin-form">
                  {["title","slug","short_description","description","instructor"].map(k=>(
                    <input key={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k.replaceAll("_"," ")} required={k==="title"||k==="slug"}/>
                  ))}

                  <div className="two">
                    <input type="number" value={form.original_price} onChange={e=>setForm({...form,original_price:Number(e.target.value)})} placeholder="Original price"/>
                    <input type="number" value={form.selling_price} onChange={e=>setForm({...form,selling_price:Number(e.target.value)})} placeholder="Selling price"/>
                  </div>

                  <div className="two">
                    <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category"/>
                    <input value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} placeholder="Difficulty"/>
                  </div>

                  <div className="two">
                    <input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="Duration"/>
                    <input type="number" value={form.sessions} onChange={e=>setForm({...form,sessions:Number(e.target.value)})} placeholder="Sessions"/>
                  </div>

                  <input value={form.whatsapp_invite_link} onChange={e=>setForm({...form,whatsapp_invite_link:e.target.value})} placeholder="Private WhatsApp invite link"/>
                  <label><input type="checkbox" checked={form.whatsapp_enabled} onChange={e=>setForm({...form,whatsapp_enabled:e.target.checked})}/> Enable WhatsApp access after purchase</label>

                  <textarea placeholder="Services, one per line" value={form.services.join("\n")} onChange={e=>setForm({...form,services:e.target.value.split("\n")})}/>
                  <textarea placeholder="Benefits, one per line" value={form.benefits.join("\n")} onChange={e=>setForm({...form,benefits:e.target.value.split("\n")})}/>
                  <textarea placeholder="Curriculum lessons, one per line" value={form.curriculum.join("\n")} onChange={e=>setForm({...form,curriculum:e.target.value.split("\n")})}/>

                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>

                  <button className="btn primary">Create course</button>
                </form>
              </div>

              <div className="admin-panel">
                <div className="section-heading-row">
                  <div><h2>Courses</h2><p className="muted">{courses.length} course{courses.length===1?"":"s"} created.</p></div>
                  <Link className="btn ghost" to="/admin#manage-courses">Manage all</Link>
                </div>
                {courses.length ? courses.slice(0,5).map(c=>(
                  <div className="admin-row" key={c.id}>
                    <span><b>{c.title}</b><small>{c.status} · {c.services?.length||0} services</small></span>
                    <b>₹{c.selling_price.toLocaleString("en-IN")}</b>
                  </div>
                )) : <p className="muted">No courses yet.</p>}
              </div>

              <div className="admin-panel" id="orders">
                <h2>Recent purchases</h2>
                {orders.slice(0,10).map(o=>(
                  <div className="admin-row" key={o.id}>
                    <span><b>{o.member_name || `User ${o.user_id}`}</b><small>{o.member_email} · {o.course_title}</small></span>
                    <b>₹{o.amount.toLocaleString("en-IN")}</b>
                  </div>
                ))}
                {!orders.length && <p className="muted">No purchases yet.</p>}
              </div>

              <div className="admin-panel">
                <h2>Reviews</h2>
                {reviews.slice(0,10).map(r=>(
                  <div className="admin-row" key={r.id}>
                    <span><b>{"★".repeat(r.rating)}</b><small>{r.comment}</small></span>
                    <select value={r.status} onChange={async e=>{await api(`/api/admin/reviews/${r.id}`,{method:"PATCH",body:JSON.stringify({status:e.target.value})});load();}}>
                      <option>pending</option><option>approved</option><option>hidden</option>
                    </select>
                  </div>
                ))}
                {!reviews.length && <p className="muted">No reviews yet.</p>}
              </div>
            </section>
          </>
        )}

        {editCourse && (
          <div className="admin-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditCourse(null)}}>
            <div className="admin-modal">
              <div className="admin-modal-header">
                <div><p className="eyebrow">EDIT COURSE</p><h2>{editCourse.title}</h2></div>
                <button className="icon-button" onClick={()=>setEditCourse(null)} aria-label="Close"><X size={20}/></button>
              </div>
              <form onSubmit={saveEdit} className="admin-form">
                <input value={editCourse.title} onChange={e=>setEditCourse({...editCourse,title:e.target.value})} placeholder="Course title" required/>
                <input value={editCourse.slug} onChange={e=>setEditCourse({...editCourse,slug:e.target.value})} placeholder="Slug" required/>
                <input value={editCourse.image||""} onChange={e=>setEditCourse({...editCourse,image:e.target.value})} placeholder="Course image URL"/>
                <textarea value={editCourse.short_description||""} onChange={e=>setEditCourse({...editCourse,short_description:e.target.value})} placeholder="Short description"/>
                <textarea value={editCourse.description||""} onChange={e=>setEditCourse({...editCourse,description:e.target.value})} placeholder="Full description"/>
                <div className="two">
                  <input value={editCourse.category||""} onChange={e=>setEditCourse({...editCourse,category:e.target.value})} placeholder="Category"/>
                  <input value={editCourse.difficulty||""} onChange={e=>setEditCourse({...editCourse,difficulty:e.target.value})} placeholder="Difficulty"/>
                </div>
                <div className="two">
                  <input value={editCourse.duration||""} onChange={e=>setEditCourse({...editCourse,duration:e.target.value})} placeholder="Duration"/>
                  <input type="number" value={editCourse.sessions||0} onChange={e=>setEditCourse({...editCourse,sessions:Number(e.target.value)})} placeholder="Sessions"/>
                </div>
                <input value={editCourse.instructor||""} onChange={e=>setEditCourse({...editCourse,instructor:e.target.value})} placeholder="Instructor"/>
                <div className="two">
                  <input type="number" value={editCourse.original_price} onChange={e=>setEditCourse({...editCourse,original_price:Number(e.target.value)})} placeholder="Original price"/>
                  <input type="number" value={editCourse.selling_price} onChange={e=>setEditCourse({...editCourse,selling_price:Number(e.target.value)})} placeholder="Selling price"/>
                </div>
                <select value={editCourse.status} onChange={e=>setEditCourse({...editCourse,status:e.target.value})}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
                <input value={editCourse.whatsapp_invite_link||""} onChange={e=>setEditCourse({...editCourse,whatsapp_invite_link:e.target.value})} placeholder="Private WhatsApp invite link"/>
                <label><input type="checkbox" checked={Boolean(editCourse.whatsapp_enabled)} onChange={e=>setEditCourse({...editCourse,whatsapp_enabled:e.target.checked})}/> Enable WhatsApp access after purchase</label>
                <textarea placeholder="Services, one per line" value={(editCourse.services||[]).join("\n")} onChange={e=>setEditCourse({...editCourse,services:e.target.value.split("\n")})}/>
                <textarea placeholder="Benefits, one per line" value={(editCourse.benefits||[]).join("\n")} onChange={e=>setEditCourse({...editCourse,benefits:e.target.value.split("\n")})}/>
                <textarea placeholder="Curriculum lessons, one per line" value={(editCourse.curriculum||[]).join("\n")} onChange={e=>setEditCourse({...editCourse,curriculum:e.target.value.split("\n")})}/>
                <div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setEditCourse(null)}>Cancel</button><button className="btn primary">Save changes</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

function App(){
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={<Home/>}
        />

        <Route
          path="/courses/:slug"
          element={<CourseDetail/>}
        />

        <Route
          path="/login"
          element={<Login/>}
        />

        <Route
          path="/dashboard"
          element={<Dashboard/>}
        />

        <Route
          path="/learn/:courseId"
          element={<Learn/>}
        />

        <Route
          path="/checkout/:courseId"
          element={<Checkout/>}
        />

        <Route
          path="/admin"
          element={<Admin/>}
        />

        <Route
          path="*"
          element={<Home/>}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;