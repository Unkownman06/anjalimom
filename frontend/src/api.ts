import {auth} from "./firebase";
export const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function api(path:string, options:RequestInit={}) {
  const makeRequest = async (forceRefresh=false) => {
    const user=auth.currentUser;
    const token=user ? await user.getIdToken(forceRefresh) : "";
    const headers=new Headers(options.headers);
    if(token) headers.set("Authorization",`Bearer ${token}`);
    if(options.body && !headers.has("Content-Type")) headers.set("Content-Type","application/json");
    headers.set("Cache-Control","no-cache");
    return fetch(`${API}${path}`,{...options,headers,cache:"no-store"});
  };
  let res=await makeRequest(false);
  if(res.status===401 && auth.currentUser) res=await makeRequest(true);
  const data=await res.json().catch(()=>null);
  if(!res.ok){
    if(res.status===401) throw new Error("Firebase authentication was rejected by the backend. Sign out and sign in again.");
    throw new Error(data?.detail || "Request failed");
  }
  return data;
}
