import {Routes,Route} from "react-router-dom";
import {AuthProvider} from "./auth";
import Home from "./pages/Home/Home";
import AboutPage from "./pages/About/About";
import CoursesPage from "./pages/Courses/Courses";
import ContactPage from "./pages/Contact/Contact";
import PrivacyPage from "./pages/Privacy/Privacy";
import TermsPage from "./pages/Terms/Terms";
import CourseDetail from "./pages/CourseDetail/CourseDetail";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Learn from "./pages/Learn/Learn";
import Checkout from "./pages/Checkout/Checkout";
import Admin from "./pages/Admin/Admin";

export default function App(){return <AuthProvider><Routes>
  <Route path="/" element={<Home/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/courses" element={<CoursesPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/privacy" element={<PrivacyPage/>}/><Route path="/terms" element={<TermsPage/>}/><Route path="/courses/:slug" element={<CourseDetail/>}/><Route path="/login" element={<Login/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/learn/:courseId" element={<Learn/>}/><Route path="/checkout/:courseId" element={<Checkout/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<Home/>}/>
</Routes></AuthProvider>}
