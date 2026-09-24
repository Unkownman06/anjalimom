import {Link} from "react-router-dom";
import Reveal from "../common/Reveal";
import {Course} from "../../types/course";

export default function CourseCard({c,compact=false}:{c:Course;compact?:boolean}){
  return (
    <Reveal>
      <Link className={`course-card ${compact?"compact-course-card":""}`} to={`/courses/${c.slug}`}>
        <div className="course-img" style={{backgroundImage:`url(${c.image})`}}>
          <span>{c.difficulty}</span>
        </div>
        <div className="course-body">
          <div className="course-meta"><span>{c.category}</span><span>★ {c.rating||"New"} · {c.review_count} reviews</span></div>
          <h3>{c.title}</h3>
          <p>{c.short_description}</p>
          <div className="price">
            <strong>₹{c.pricing.final_price.toLocaleString("en-IN")}</strong>
            {c.pricing.discount_active&&<><del>₹{c.pricing.selling_price.toLocaleString("en-IN")}</del><em>{c.pricing.discount_percent}% OFF</em></>}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
