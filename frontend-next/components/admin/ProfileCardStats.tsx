function ProfileCardStats({
  title,
  stats,
  icon,
}: {
  title: string;
  stats: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="shadow-sm p-4 rounded-lg">
      <div className="flex items-center gap-2">{icon}</div>
      <p className="text-3xl font-bold">{stats}</p>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );
}

export default ProfileCardStats;
