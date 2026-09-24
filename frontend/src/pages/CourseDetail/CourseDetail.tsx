import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {ArrowRight,Check,Lock,ShieldCheck,Star} from "lucide-react";
import {api} from "../../api";
import {Course} from "../../types/course";
import {useAuth} from "../../auth";
import Nav from "../../components/navigation/Nav";
import Footer from "../../components/footer/Footer";
import Reviews from "../Reviews/Reviews";

export default function CourseDetail(){
  const {slug}=useParams();
  const [c,setC]=useState<Course|null>(null);
  const [reviews,setReviews]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const {user}=useAuth();
  const nav=useNavigate();

  useEffect(()=>{
    Promise.all([
      api(`/api/courses/${slug}`)
    ])
      .then(([x])=>{
        setC(x);
        return api(`/api/courses/${x.id}/reviews`);
      })
      .then(setReviews)
      .finally(()=>setLoading(false));
  },[slug]);

  if(loading){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your practice…
        </div>
      </>
    );
  }

  if(!c){
    return (
      <>
        <Nav/>
        <div className="loading">
          Course not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Nav/>

      <main>
        <section className="detail-hero">
          <div
            className="detail-image"
            style={{
              backgroundImage:`url(${c.image})`
            }}
          ></div>

          <div className="detail-copy">
            <p className="eyebrow">
              {c.category} · {c.difficulty}
            </p>

            <h1>
              {c.title}
            </h1>

            <p className="lead">
              {c.description}
            </p>

            <div className="rating">
              <Star
                fill="currentColor"
                size={16}
              />
              {c.rating||"New"}
              <span>
                ({c.review_count} reviews)
              </span>
            </div>

            <div className="buy-card">
              <div>
                <del>
                  ₹{c.pricing.selling_price.toLocaleString("en-IN")}
                </del>

                <strong>
                  ₹{c.pricing.final_price.toLocaleString("en-IN")}
                </strong>

                {c.pricing.discount_active&&(
                  <em>
                    {c.pricing.discount_percent}% OFF
                  </em>
                )}
              </div>

              <button
                className="btn primary"
                onClick={()=>
                  user
                    ? nav(`/checkout/${c.id}`)
                    : nav("/login",{
                        state:{
                          from:`/courses/${c.slug}`
                        }
                      })
                }
              >
                Buy this course
                <ArrowRight size={17}/>
              </button>
            </div>

            <div className="detail-facts">
              <span>{c.duration}</span>
              <span>{c.sessions} sessions</span>
              <span>With {c.instructor}</span>
            </div>
          </div>
        </section>

        <section className="section detail-grid">
          <div>
            <h2>
              What's inside
            </h2>

            <div className="benefits">
              {c.benefits.map(x=>(
                <div key={x}>
                  <Check size={17}/>
                  {x}
                </div>
              ))}
            </div>

            <h2 className="mt">
              Curriculum
            </h2>

            <div className="curriculum">
              {c.curriculum
                .sort((a,b)=>a.position-b.position)
                .map((x:any)=>(
                  <div key={x.position}>
                    <b>
                      {String(x.position).padStart(2,"0")}
                    </b>

                    <span>
                      {x.title}
                    </span>

                    <small>
                      {x.duration}
                    </small>
                  </div>
                ))}
            </div>
          </div>

          <aside>
            <div className="sticky-card">
              <h3>
                Included with this course
              </h3>

              {c.services.map(x=>(
                <div
                  className="service-line"
                  key={x.name}
                >
                  <ShieldCheck size={16}/>

                  <span>
                    <b>{x.name}</b>
                    <small>{x.description}</small>
                  </span>
                </div>
              ))}

              {c.whatsapp_included&&(
                <p className="protected-note">
                  <Lock size={15}/>
                  Private community access is included after purchase.
                </p>
              )}
            </div>
          </aside>
        </section>

        <Reviews
          courseId={c.id}
          data={reviews}
        />
      </main>

      <Footer/>
    </>
  );
}
