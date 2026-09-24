import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ArrowRight,ShieldCheck} from "lucide-react";
import {api} from "../../api";
import {useAuth} from "../../auth";
import Nav from "../../components/navigation/Nav";
import PortalLayout from "../../components/portal/PortalLayout";

export default function Dashboard(){
  const {user}=useAuth();
  const nav=useNavigate();

  const [data,setData]=useState<any>();
  const [roleChecked,setRoleChecked]=useState(false);

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    api("/api/users/me")
      .then((m:any)=>{
        if(m.role==="admin"){
          nav("/admin");
          return;
        }

        setRoleChecked(true);

        return api(
          "/api/users/dashboard"
        );
      })
      .then((d:any)=>{
        if(d){
          setData(d);
        }
      })
      .catch(e=>{
        console.error(e);
        nav("/login");
      });
  },[user,nav]);

  if(
    !user ||
    !roleChecked ||
    !data
  ){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your space…
        </div>
      </>
    );
  }

  return (
    <PortalLayout
      role="member"
      name={data.user.name}
      email={data.user.email}
    >
      <div className="member member-portal">
        <div className="portal-topbar">
          <div>
            <p className="eyebrow">
              MEMBER SPACE
            </p>

            <h1>
              Welcome,{" "}
              {data.user.name ||
                data.user.email.split("@")[0]}.
            </h1>

            <p>
              Keep your practice moving gently forward.
            </p>
          </div>

          <div className="portal-secure">
            <ShieldCheck size={17}/>
            <span>
              Protected account
            </span>
          </div>
        </div>

        <section className="member-grid">
          <div className="member-panel wide">
            <h2>
              My courses
            </h2>

            {data.courses.length ? (
              <div className="mini-courses">
                {data.courses.map((c:any)=>(
                  <Link
                    to={`/learn/${c.id}`}
                    key={c.id}
                  >
                    <img src={c.image}/>

                    <div>
                      <h3>
                        {c.title}
                      </h3>

                      <p>
                        {c.progress}% complete
                      </p>

                      <div className="progress">
                        <span
                          style={{
                            width:`${c.progress}%`
                          }}
                        />
                      </div>
                    </div>

                    <ArrowRight/>
                  </Link>
                ))}
              </div>
            ) : (
              <p>
                No purchased courses yet.{" "}
                <Link to="/#courses">
                  Explore the library.
                </Link>
              </p>
            )}
          </div>

          <div className="member-panel">
            <h2>
              Profile
            </h2>

            <p>
              {data.user.name}
            </p>

            <p>
              {data.user.email}
            </p>

            <p className="muted">
              Member since{" "}
              {new Date(
                data.user.created_at
              ).toLocaleDateString()}
            </p>
          </div>

          <div className="member-panel wide">
            <h2>
              Payment history
            </h2>

            {data.payments.length ? (
              data.payments.map((p:any)=>(
                <div
                  className="payment-row"
                  key={p.id}
                >
                  <span>
                    Order #{p.order_id||p.id}
                  </span>

                  <b>
                    ₹{p.amount.toLocaleString("en-IN")}
                  </b>

                  <small>
                    {p.status}
                  </small>
                </div>
              ))
            ) : (
              <p className="muted">
                No payments yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
