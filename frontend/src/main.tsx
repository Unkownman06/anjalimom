import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App";
import "./styles.css";

class AppErrorBoundary extends React.Component<{children:React.ReactNode},{error:Error|null}>{
  state={error:null as Error|null};
  static getDerivedStateFromError(error:Error){return {error};}
  render(){
    if(this.state.error){
      return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:32,fontFamily:"Arial,sans-serif",background:"#f5f1e8",color:"#263a32"}}>
        <div style={{maxWidth:700}}>
          <h1>Aarogyam Space Studio</h1>
          <p>The website could not load correctly.</p>
          <p style={{fontSize:13,whiteSpace:"pre-wrap",background:"#fff",padding:16,borderRadius:12}}>{this.state.error.message}</p>
          <button onClick={()=>window.location.reload()} style={{padding:"12px 18px",border:0,borderRadius:20,background:"#385c4d",color:"#fff",cursor:"pointer"}}>Reload</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter><App/></BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);
