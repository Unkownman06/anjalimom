import {ReactNode} from "react";
import Sidebar from "../portal/Sidebar";

export default function PortalLayout({
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
