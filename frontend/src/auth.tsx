import {createContext,useContext,useEffect,useState,ReactNode} from "react";
import {auth,googleProvider,firebaseConfigured} from "./firebase";
import {onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signInWithPopup,signOut,User} from "firebase/auth";

type Ctx={user:User|null;loading:boolean;login:(e:string,p:string)=>Promise<void>;register:(e:string,p:string)=>Promise<void>;google:()=>Promise<void>;logout:()=>Promise<void>};
const C=createContext<Ctx|null>(null);
const requireAuth=()=>{if(!firebaseConfigured || !auth) throw new Error("Firebase login is not configured. Please contact the studio administrator."); return auth;};

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  const [loading,setLoading]=useState(false);
  useEffect(()=>{
    if(!firebaseConfigured || !auth){setLoading(false);return;}
    setLoading(true);
    return onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)});
  },[]);
  const login=async(e:string,p:string)=>{await signInWithEmailAndPassword(requireAuth(),e.trim(),p)};
  const register=async(e:string,p:string)=>{await createUserWithEmailAndPassword(requireAuth(),e.trim(),p)};
  const google=async()=>{const a=requireAuth(); const credential=await signInWithPopup(a,googleProvider);await credential.user.getIdToken(true)};
  const logout=async()=>{if(auth) await signOut(auth)};
  return <C.Provider value={{user,loading,login,register,google,logout}}>{children}</C.Provider>;
}
export const useAuth=()=>useContext(C)!;
