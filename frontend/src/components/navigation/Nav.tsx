import {useState} from "react";
import {Link} from "react-router-dom";
import {Menu,X} from "lucide-react";
import {useAuth} from "../../auth";
import Brand from "../brand/Brand";

export default function Nav(){
  const {user,logout}=useAuth();
  const [open,setOpen]=useState(false);
  return (
    <header className="nav">
      <Link to="/" className="brand"><Brand/></Link>
      <nav className={open?"nav-links open":"nav-links"}>
        <Link to="/" onClick={()=>setOpen(false)}>Home</Link>
        <Link to="/about" onClick={()=>setOpen(false)}>About</Link>
        <Link to="/courses" onClick={()=>setOpen(false)}>Courses</Link>
        <Link to="/#services" onClick={()=>setOpen(false)}>Services</Link>
        <Link to="/contact" onClick={()=>setOpen(false)}>Contact</Link>
        {user ? <>
          <Link to="/dashboard" onClick={()=>setOpen(false)}>My space</Link>
          <button className="link-btn" onClick={async()=>{await logout();window.location.assign("/login")}}>Logout</button>
        </> : <Link to="/login" onClick={()=>setOpen(false)}>Login</Link>}
      </nav>
      <button className="menu-btn" aria-label={open?"Close menu":"Open menu"} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </header>
  );
}
