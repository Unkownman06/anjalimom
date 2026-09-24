import {ReactNode} from "react";

export default function Reveal({children,className=""}:{children:ReactNode;className?:string}){
  return <div className={`reveal ${className}`}>{children}</div>;
}
