import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {Lock,Play} from "lucide-react";
import {api} from "../../api";
import {useAuth} from "../../auth";
import {Course} from "../../types/course";
import Nav from "../../components/navigation/Nav";
import PortalLayout from "../../components/portal/PortalLayout";

export default function Learn(){
  const {courseId}=useParams();
  const [course,setCourse]=useState<Course|null>(null);
  const [access,setAccess]=useState<any>();
  const {user}=useAuth();
  const nav=useNavigate();
  const [me,setMe]=useState<any>();

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    Promise.all([
      api("/api/users/me"),
      api(`/api/users/courses/${courseId}/access`),
      api("/api/courses")
    ])
      .then(([m,a,cs])=>{
        if(m.role!=="member"){
          nav("/admin");
          return;
        }

        setMe(m);
        setAccess(a);

        setCourse(
          (cs as Course[]).find(
            c=>c.id===Number(courseId)
          )||null
        );
      })
      .catch(()=>{
        nav("/dashboard");
      });
  },[user,courseId,nav]);

  if(!course||!me){
    return (
      <>
        <Nav/>
        <div className="loading">
          Loading your course…
        </div>
      </>
    );
  }

  return (
    <PortalLayout
      role="member"
      name={me.name}
      email={me.email}
    >
      <div className="learn member-portal">
        <div className="portal-topbar">
          <div>
            <p className="eyebrow">
              YOU'RE ENROLLED
            </p>

            <h1>
              {course.title}
            </h1>

            <p>
              Continue your practice at your own pace.
            </p>
          </div>
        </div>

        <div className="learn-hero">
          <img src={course.image}/>

          <div>
            <p className="eyebrow">
              YOUR PRACTICE
            </p>

            <h2>
              {course.title}
            </h2>

            <p>
              {course.description}
            </p>
          </div>
        </div>

        <div className="learn-grid">
          <section>
            <h2>
              Your curriculum
            </h2>

            {course.curriculum.map((x:any)=>(
              <div
                className="lesson"
                key={x.position}
              >
                <button>
                  <Play size={15}/>
                </button>

                <span>
                  {x.title}
                </span>

                <small>
                  {x.duration}
                </small>
              </div>
            ))}
          </section>

          <aside className="sticky-card">
            <h3>
              Private Community
            </h3>

            <p>
              Connect with other students and receive
              course updates.
            </p>

            {access?.whatsapp_available ? (
              <a
                className="btn whatsapp"
                href={access.whatsapp_url}
                target="_blank"
                rel="noreferrer"
              >
                Join WhatsApp Community
              </a>
            ) : (
              <p className="protected-note">
                <Lock size={15}/>
                Community access is not configured for this course.
              </p>
            )}
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
}

