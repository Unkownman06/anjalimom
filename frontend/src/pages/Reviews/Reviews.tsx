import {useState} from "react";
import {api} from "../../api";
import {useAuth} from "../../auth";

export default function Reviews({
  courseId,
  data
}:{
  courseId:number;
  data:any
}){
  const {user}=useAuth();
  const [rating,setRating]=useState(5);
  const [comment,setComment]=useState("");
  const [msg,setMsg]=useState("");

  async function submit(){
    try{
      await api(
        `/api/courses/${courseId}/reviews`,
        {
          method:"POST",
          body:JSON.stringify({
            rating,
            comment
          })
        }
      );

      setMsg("Review submitted.");
      setComment("");
    }catch(e:any){
      setMsg(e.message);
    }
  }

  return (
    <section className="section reviews">
      <div className="review-head">
        <div>
          <p className="eyebrow">
            VERIFIED STUDENTS
          </p>

          <h2>
            What students say.
          </h2>
        </div>

        <div className="big-rating">
          <b>
            {data?.average||0}
          </b>

          <span>
            ★★★★★
          </span>

          <small>
            {data?.reviews?.length||0} reviews
          </small>
        </div>
      </div>

      <div className="review-grid">
        {(data?.reviews||[]).map((r:any)=>(
          <article key={r.id}>
            <div className="stars">
              {"★".repeat(r.rating)}
              {"☆".repeat(5-r.rating)}
            </div>

            <p>
              “{r.comment}”
            </p>

            <small>
              Verified Purchase ·{" "}
              {new Date(r.created_at).toLocaleDateString()}
            </small>
          </article>
        ))}
      </div>

      {user&&(
        <div className="review-form">
          <h3>
            Rate this course
          </h3>

          <div className="star-select">
            {[1,2,3,4,5].map(x=>(
              <button
                key={x}
                onClick={()=>setRating(x)}
                className={x<=rating?"selected":""}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={e=>setComment(e.target.value)}
            placeholder="Share an honest experience…"
            rows={4}
          />

          <button
            className="btn primary"
            onClick={submit}
          >
            Submit review
          </button>

          {msg&&<p>{msg}</p>}
        </div>
      )}
    </section>
  );
}
