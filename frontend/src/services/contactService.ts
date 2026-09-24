import {api} from "../api";
export async function sendContactMessage(payload:{name:string;email:string;query:string}){
  return api("/api/contact",{method:"POST",body:JSON.stringify(payload)});
}
