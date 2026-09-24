import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowRight,ChevronDown} from "lucide-react";
import {api} from "../../api";
import {Course} from "../../types/course";
import Nav from "../../components/navigation/Nav";
import Footer from "../../components/footer/Footer";
import Reveal from "../../components/common/Reveal";
import CourseCard from "../../components/course/CourseCard";

 export default function Home(){
  const [courses,setCourses]=useState<Course[]>([]);
  useEffect(()=>{api("/api/courses").then(setCourses).catch(console.error);},[]);
  return <>
    <Nav/>
    <main>
      <section className="hero"><div className="hero-image"></div><div className="hero-copy">
        <p className="eyebrow">MINDFUL MOVEMENT · MODERN LIVING</p>
        <h1>Come home<br/><i>to yourself.</i></h1>
        <p className="hero-text">Premium yoga journeys designed to make movement feel natural, breath feel spacious, and everyday life feel a little lighter.</p>
        <div className="actions"><Link className="btn primary" to="/courses">Explore courses <ArrowRight size={17}/></Link><Link className="btn ghost" to="/login">Start your journey</Link></div>
      </div><div className="scroll-cue">SCROLL <span></span></div></section>

      <section id="about" className="section home-section split">
        <Reveal><p className="eyebrow">A QUIETER WAY FORWARD</p><h2>Yoga that meets you where you are.</h2></Reveal>
        <Reveal><p className="lead">Aarogyam Space Studio combines guided movement, meditation and practical consistency into beautiful programs you can follow at your own pace.</p>
          <div className="stats"><div><b>30+</b><span>guided sessions</span></div><div><b>1:1</b><span>mindful attention</span></div><div><b>∞</b><span>room to grow</span></div></div>
          <Link className="btn ghost about-more" to="/about">Read about us <ArrowRight size={16}/></Link>
        </Reveal>
      </section>

      <section id="courses" className="section warm home-section">
        <Reveal><p className="eyebrow">THE LIBRARY</p><h2>Find your practice.</h2><p className="lead">A small preview of our programs. Open the full library to explore every available course.</p></Reveal>
        <div className="course-grid course-preview-grid">{courses.slice(0,3).map(c=><CourseCard key={c.id} c={c} compact/>)}</div>
        <div className="section-action"><Link className="btn primary" to="/courses">See all courses <ArrowRight size={17}/></Link></div>
      </section>

      <section id="services" className="section home-section">
        <div className="service-head"><Reveal><p className="eyebrow">WHAT'S INCLUDED</p><h2>More than a class.</h2></Reveal><Reveal><p className="lead">Every program is built as a complete wellness experience, not a collection of videos.</p></Reveal></div>
        <div className="service-grid">{["Live guided classes","Recorded sessions","Meditation & breathwork","Progress tracking","Personal guidance","Private community"].map((x,i)=><Reveal key={x}><div className="service-card"><span>0{i+1}</span><h3>{x}</h3><p>Thoughtfully designed support that helps your practice become a sustainable part of life.</p></div></Reveal>)}</div>
      </section>

      <section className="quote-section home-section"><div><p className="eyebrow">THE AAROGYAM APPROACH</p><h2>Strength without rush.<br/>Stillness without pressure.</h2><p>“The goal isn't to touch your toes. The goal is what you learn on the way down.”</p></div></section>
      <section className="section faq home-section"><Reveal><p className="eyebrow">QUESTIONS</p><h2>Frequently asked.</h2></Reveal>{["Is yoga suitable for beginners?","How long do I keep course access?","Can I practice from home?","How does the private community work?"].map(q=><details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>Yes. Each course explains its level, duration and included services before you purchase. Your protected member area contains the content you have purchased.</p></details>)}</section>
    </main><Footer/>
  </>;
}
