import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {ShieldCheck} from "lucide-react";
import {api} from "../../api";
import {useAuth} from "../../auth";
import Nav from "../../components/navigation/Nav";
import PortalLayout from "../../components/portal/PortalLayout";

export default function Admin(){
  const {user}=useAuth();
  const nav=useNavigate();

  const [me,setMe]=useState<any>();
  const [summary,setSummary]=useState<any>();
  const [courses,setCourses]=useState<any[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [reviews,setReviews]=useState<any[]>([]);
  const [editingId,setEditingId]=useState<number|null>(null);

  const emptyForm={
    title:"",
    slug:"",
    image:"",
    short_description:"",
    description:"",
    category:"Yoga",
    difficulty:"Beginner",
    duration:"30 days",
    sessions:30,
    instructor:"",
    original_price:5000,
    selling_price:3999,
    status:"draft",
    whatsapp_invite_link:"",
    whatsapp_enabled:false,
    services:[] as string[],
    benefits:[] as string[],
    curriculum:[] as string[]
  };

  const [form,setForm]=useState<any>({...emptyForm});

  async function load(){
    const [s,c,o,r]=await Promise.all([
      api("/api/admin/summary"),
      api("/api/admin/courses"),
      api("/api/admin/orders"),
      api("/api/admin/reviews")
    ]);
    setSummary(s);
    setCourses(c);
    setOrders(o);
    setReviews(r);
  }

  useEffect(()=>{
    if(!user){
      nav("/login");
      return;
    }

    api("/api/users/me")
      .then((m:any)=>{
        if(m.role!=="admin"){
          nav("/dashboard");
          return;
        }
        setMe(m);
        return load();
      })
      .catch(e=>{
        console.error(e);
        nav("/login");
      });
  },[user,nav]);

  function startEdit(course:any){
    setEditingId(course.id);
    setForm({
      title:course.title || "",
      slug:course.slug || "",
      image:course.image || "",
      short_description:course.short_description || "",
      description:course.description || "",
      category:course.category || "Yoga",
      difficulty:course.difficulty || "Beginner",
      duration:course.duration || "30 days",
      sessions:course.sessions || 30,
      instructor:course.instructor || "",
      original_price:course.original_price ?? 0,
      selling_price:course.selling_price ?? 0,
      status:course.status || "draft",
      whatsapp_invite_link:course.whatsapp_invite_link || "",
      whatsapp_enabled:Boolean(course.whatsapp_enabled),
      services:(course.services||[]).map((x:any)=>x.name),
      benefits:course.benefits||[],
      curriculum:(course.curriculum||[]).map((x:any)=>x.title)
    });
    document.getElementById("course-editor")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function resetForm(){
    setEditingId(null);
    setForm({...emptyForm});
  }

  async function handleCourseImage(e:any){
    const file=e.target.files?.[0];
    if(!file) return;
    if(!file.type.startsWith("image/")){
      alert("Please select an image file.");
      e.target.value="";
      return;
    }
    if(file.size>8*1024*1024){
      alert("Please choose an image smaller than 8 MB.");
      e.target.value="";
      return;
    }

    const dataUrl=await new Promise<string>((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result));
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });

    const img=new Image();
    img.onload=()=>{
      const max=1400;
      const scale=Math.min(1,max/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(img.width*scale));
      canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext("2d");
      if(!ctx){
        setForm({...form,image:dataUrl});
        return;
      }
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      setForm({...form,image:canvas.toDataURL("image/jpeg",0.82)});
    };
    img.src=dataUrl;
  }

  async function saveCourse(e:any){
    e.preventDefault();

    const payload={
      ...form,
      services:form.services
        .map((name:string)=>name.trim())
        .filter(Boolean)
        .map((name:string)=>({name,description:""})),
      benefits:form.benefits
        .map((x:string)=>x.trim())
        .filter(Boolean),
      curriculum:form.curriculum
        .map((title:string,i:number)=>({
          title:title.trim(),
          position:i+1,
          duration:"20 min"
        }))
        .filter((x:any)=>x.title)
    };

    try{
      if(editingId){
        await api(`/api/admin/courses/${editingId}`,{
          method:"PUT",
          body:JSON.stringify(payload)
        });
        alert("Course updated successfully.");
      }else{
        await api("/api/admin/courses",{
          method:"POST",
          body:JSON.stringify(payload)
        });
        alert("Course created successfully.");
      }
      resetForm();
      await load();
    }catch(e:any){
      alert(e.message || "Unable to save course.");
    }
  }

  async function deleteCourse(course:any){
    if(!window.confirm(`Delete "${course.title}"?`)) return;

    try{
      await api(`/api/admin/courses/${course.id}`,{method:"DELETE"});
      if(editingId===course.id) resetForm();
      await load();
      alert("Course deleted successfully.");
    }catch(e:any){
      alert(e.message || "Unable to delete course.");
    }
  }

  if(!me||!summary){
    return (
      <>
        <Nav/>
        <div className="loading">Verifying admin access…</div>
      </>
    );
  }

  return (
    <PortalLayout role="admin" name={me.name} email={me.email}>
      <div className="admin admin-portal">
        <div className="portal-topbar">
          <div>
            <p className="eyebrow">PRIVATE ADMIN CONSOLE</p>
            <h1>Calm control center.</h1>
            <p>Manage courses, customers, purchases and reviews.</p>
          </div>
          <div className="portal-secure">
            <ShieldCheck size={17}/>
            <span>Admin verified</span>
          </div>
        </div>

        <div className="admin-stats">
          <div><span>Members</span><b>{summary.members}</b></div>
          <div><span>Courses</span><b>{summary.courses}</b></div>
          <div><span>Revenue</span><b>₹{summary.revenue.toLocaleString("en-IN")}</b></div>
          <div><span>Purchases</span><b>{summary.purchases}</b></div>
          <div><span>Rating</span><b>{summary.average_rating.toFixed(1)}</b></div>
        </div>

        <section className="admin-grid">
          <div className="admin-panel" id="course-editor">
            <div className="admin-panel-heading">
              <div>
                <h2>{editingId ? "Edit course" : "Add course"}</h2>
                <p className="muted">
                  {editingId
                    ? "Change any course detail, including price, and save it."
                    : "Create a new course for your students."}
                </p>
              </div>
              {editingId&&(
                <button type="button" className="btn ghost" onClick={resetForm}>Cancel edit</button>
              )}
            </div>

            <form onSubmit={saveCourse} className="admin-form">
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Course name" required/>
              <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug" required/>
              <div className="course-image-upload">
                <label className="upload-label">Course photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCourseImage}
                />
                <small className="muted">Choose a course photo from your phone or computer. The image is resized automatically.</small>
                {form.image && (
                  <div className="course-image-preview">
                    <img src={form.image} alt="Course preview"/>
                    <button type="button" className="btn ghost danger" onClick={()=>setForm({...form,image:""})}>Remove photo</button>
                  </div>
                )}
              </div>
              <input value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} placeholder="Short description"/>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Full course description" rows={5}/>

              <div className="two">
                <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category"/>
                <input value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})} placeholder="Difficulty"/>
              </div>

              <div className="two">
                <input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="Duration"/>
                <input type="number" value={form.sessions} onChange={e=>setForm({...form,sessions:Number(e.target.value)})} placeholder="Sessions"/>
              </div>

              <input value={form.instructor} onChange={e=>setForm({...form,instructor:e.target.value})} placeholder="Instructor"/>

              <div className="two">
                <input type="number" min="0" value={form.original_price} onChange={e=>setForm({...form,original_price:Number(e.target.value)})} placeholder="Original price"/>
                <input type="number" min="0" value={form.selling_price} onChange={e=>setForm({...form,selling_price:Number(e.target.value)})} placeholder="Selling price"/>
              </div>

              <input value={form.whatsapp_invite_link} onChange={e=>setForm({...form,whatsapp_invite_link:e.target.value})} placeholder="Private WhatsApp invite link"/>

              <label>
                <input type="checkbox" checked={form.whatsapp_enabled} onChange={e=>setForm({...form,whatsapp_enabled:e.target.checked})}/>
                Enable WhatsApp access after purchase
              </label>

              <textarea placeholder="Services, one per line" value={form.services.join("\n")} onChange={e=>setForm({...form,services:e.target.value.split("\n")})} rows={5}/>
              <textarea placeholder="Benefits, one per line" value={form.benefits.join("\n")} onChange={e=>setForm({...form,benefits:e.target.value.split("\n")})} rows={5}/>
              <textarea placeholder="Curriculum lessons, one per line" value={form.curriculum.join("\n")} onChange={e=>setForm({...form,curriculum:e.target.value.split("\n")})} rows={5}/>

              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <button className="btn primary" type="submit">
                {editingId ? "Save changes" : "Create course"}
              </button>
            </form>
          </div>

          <div className="admin-panel" id="manage-courses">
            <h2>Manage courses</h2>
            <p className="muted">Every created course appears here. Edit any detail or delete courses that have never been purchased.</p>

            {courses.length ? courses.map(course=>(
              <div className="admin-row" key={course.id}>
                <span>
                  <b>{course.title}</b>
                  <small>
                    {course.status} · ₹{course.selling_price.toLocaleString("en-IN")} · WhatsApp {course.whatsapp_enabled ? "on" : "off"}
                  </small>
                </span>
                <div className="admin-row-actions">
                  <button className="btn ghost" type="button" onClick={()=>startEdit(course)}>Edit</button>
                  <button className="btn ghost danger" type="button" onClick={()=>deleteCourse(course)}>Delete</button>
                </div>
              </div>
            )) : (
              <p className="muted">No courses yet. Create the first course.</p>
            )}
          </div>

          <div className="admin-panel admin-panel-wide" id="orders">
            <h2>Orders</h2>
            <p className="muted">Buyer name, phone number, email, course, amount and payment status.</p>

            {orders.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Buyer</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o.id}>
                        <td>{o.buyer_name}</td>
                        <td>{o.phone_number || "—"}</td>
                        <td>{o.buyer_email}</td>
                        <td>{o.course_name}</td>
                        <td>₹{o.amount.toLocaleString("en-IN")}</td>
                        <td>{o.status}</td>
                        <td>{o.date ? new Date(o.date).toLocaleDateString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No purchases yet.</p>
            )}
          </div>

          <div className="admin-panel admin-panel-wide">
            <h2>Reviews</h2>
            {reviews.slice(0,10).map(r=>(
              <div className="admin-row" key={r.id}>
                <span>
                  <b>{"★".repeat(r.rating)}</b>
                  <small>{r.comment}</small>
                </span>
                <select value={r.status} onChange={async e=>{
                  await api(`/api/admin/reviews/${r.id}`,{
                    method:"PATCH",
                    body:JSON.stringify({status:e.target.value})
                  });
                  load();
                }}>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="hidden">hidden</option>
                </select>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalLayout>
  );
}
