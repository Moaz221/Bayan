const AdminSectionCard = ({ children, className = '' }) => {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.04)] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.25)] ${className}`}>
      {children}
    </div>
  );
};

export default AdminSectionCard;
