const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

export default EmptyState;
