import {useState} from "react";
import {Mail} from "lucide-react";
import {sendContactMessage} from "../../services/contactService";

export default function ContactForm(){
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [query,setQuery]=useState("");
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:any){
    e.preventDefault(); setBusy(true); setMessage(""); setError("");
    try{
      await sendContactMessage({name,email,query});
      setMessage("Your query has been sent. We will get back to you soon."); setName(""); setEmail(""); setQuery("");
    }catch(err:any){setError(err?.message||"Unable to send your query.");} finally{setBusy(false);}
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="contact-form-title"><span>MESSAGE US</span><h3>Tell us what you need.</h3></div>
    <label>Your name<input value={name} onChange={e=>setName(e.target.value)} required placeholder="Enter your name" /></label>
    <label>Your email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" /></label>
    <label>Your query<textarea value={query} onChange={e=>setQuery(e.target.value)} required rows={6} placeholder="How can we help you?" /></label>
    {error&&<div className="error">{error}</div>}
    {message&&<div className="success-message">{message}</div>}
    <button className="btn primary full" disabled={busy}>{busy?"Sending…":"Send query"}<Mail size={16}/></button>
  </form>;
}
