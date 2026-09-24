import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {LayoutDashboard,LogOut,Menu,ShoppingBag,X} from "lucide-react";
import {useAuth} from "../../auth";
import Brand from "../brand/Brand";

export default function Sidebar({
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

  useEffect(()=>{
    if(!open) return;
    const onKey=(e:KeyboardEvent)=>{ if(e.key==="Escape") setOpen(false); };
    document.addEventListener("keydown",onKey);
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{
      document.removeEventListener("keydown",onKey);
      document.body.style.overflow=previous;
    };
  },[open]);

  return (
    <>
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
          <Brand/>
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
          <Link to="/admin#courses">
            <ShoppingBag size={17}/>
            <span>Manage courses</span>
          </Link>
        )}

        {isAdmin&&(
          <Link to="/admin#orders">
            <ShoppingBag size={17}/>
            <span>Orders</span>
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

      </aside>
      {open && (
        <button
          type="button"
          className="portal-overlay"
          aria-label="Close menu"
          onClick={()=>setOpen(false)}
        />
      )}
      <button
        type="button"
        className="portal-mobile-trigger"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={()=>setOpen(!open)}
      >
        {open ? <X size={20}/> : <Menu size={20}/>}
      </button>
    </>
  );
}
