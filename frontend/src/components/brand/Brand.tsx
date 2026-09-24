export default function Brand({className=""}:{className?:string}){
  return (
    <span className={`brand-inner ${className}`}>
      <img className="brand-full-image" src="/aarogyam-header-logo.png" alt="Aarogyam Space Studio" />
    </span>
  );
}
