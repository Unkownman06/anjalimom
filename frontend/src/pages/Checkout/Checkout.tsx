import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {api} from "../../api";
import {auth} from "../../firebase";
import {Course} from "../../types/course";
import Nav from "../../components/navigation/Nav";

export default function Checkout(){
  const {courseId}=useParams();
  const [course,setCourse]=useState<Course|null>(null);
  const [phone,setPhone]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const nav=useNavigate();

  useEffect(()=>{
    api("/api/courses")
      .then((cs:Course[])=>{
        setCourse(
          cs.find(c=>c.id===Number(courseId))||null
        );
      })
      .catch(e=>setError(e.message));
  },[courseId]);

  async function buy(){
    setError("");
    const cleanPhone=phone.replace(/\D/g,"");

    if(!/^[6-9]\d{9}$/.test(cleanPhone)){
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setBusy(true);

    try{
      const order=await api(
        `/api/payments/create-order/${courseId}`,
        {
          method:"POST",
          body:JSON.stringify({phone_number:cleanPhone})
        }
      );

      const Razorpay=(window as any).Razorpay;
      if(!Razorpay){
        throw new Error("Razorpay Checkout script is missing");
      }

      const r=new Razorpay({
        key:order.key_id,
        amount:order.amount,
        currency:order.currency,
        name:"Aarogyam Space Studio",
        description:course?.title,
        order_id:order.order_id,
        prefill:{
          name:auth?.currentUser?.displayName || "",
          email:auth?.currentUser?.email || "",
          contact:cleanPhone
        },
        handler:async(response:any)=>{
          try{
            await api("/api/payments/verify",{
              method:"POST",
              body:JSON.stringify(response)
            });
            nav(`/learn/${courseId}`);
          }catch(e:any){
            setError(e.message || "Payment verification failed.");
          }
        }
      });

      r.open();
    }catch(e:any){
      setError(e.message || "Unable to create payment.");
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Nav/>

      <div className="checkout">
        <div>
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h1>Begin your practice.</h1>
          <p>
            Enter your phone number before continuing to secure payment.
            Your number is stored with the purchase for admin order records.
          </p>
        </div>

        {course&&(
          <div className="buy-card checkout-card">
            <img src={course.image} alt={course.title}/>

            <div>
              <h2>{course.title}</h2>
              <p>{course.short_description}</p>

              <strong>
                ₹{course.pricing.final_price.toLocaleString("en-IN")}
              </strong>

              {course.pricing.discount_active&&(
                <em>
                  {course.pricing.discount_percent}% OFF
                </em>
              )}

              <label
                style={{display:"block",marginTop:24,marginBottom:8}}
              >
                Mobile number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e=>{
                  setPhone(
                    e.target.value.replace(/\D/g,"").slice(0,10)
                  );
                }}
                placeholder="Enter 10-digit mobile number"
                required
              />

              <small style={{display:"block",marginTop:8}}>
                Required for your purchase record and customer contact.
              </small>

              {error&&(
                <div className="error" style={{marginTop:12}}>
                  {error}
                </div>
              )}

              <button
                className="btn primary full"
                disabled={busy || !/^[6-9]\d{9}$/.test(phone)}
                onClick={buy}
              >
                {busy ? "Creating secure order…" : "Continue to Razorpay"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
