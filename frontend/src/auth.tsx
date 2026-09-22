import {createContext,useContext,useEffect,useState,ReactNode} from "react";
import {auth,googleProvider} from "./firebase";
import {onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup,signOut,User} from "firebase/auth";

type Ctx={user:User|null;loading:boolean;login:(e:string,p:string)=>Promise<void>;register:(e:string,p:string)=>Promise<void>;google:()=>Promise<void>;logout:()=>Promise<void>};
const C=createContext<Ctx|null>(null);

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const unsubscribe=onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)});return unsubscribe},[]);
  const login=async(e:string,p:string)=>{await signInWithEmailAndPassword(auth,e.trim(),p)};
  const register=async(e:string,p:string)=>{await createUserWithEmailAndPassword(auth,e.trim(),p)};
  const google=async()=>{const credential=await signInWithPopup(auth,googleProvider);await credential.user.getIdToken(true)};
  const logout=async()=>{await signOut(auth)};
  return <C.Provider value={{user,loading,login,register,google,logout}}>{children}</C.Provider>;
}
export const useAuth=()=>useContext(C)!;
