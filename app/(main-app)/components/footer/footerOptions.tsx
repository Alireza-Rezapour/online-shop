export default function FooterOptions({
  details,
  header,
}: {
  details: { icon: React.JSX.Element; text: string }[];
  header: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-bold">{header}</h1>
      <div className="h-1 bg-primary-foreground w-full" />
      <div className="flex flex-col gap-8">
        {details.map((cu) => (
          <div className="flex items-center gap-3 text-2xl text-primary-foreground">
            {cu.icon}
            <p className="text-[15px] text-primary">{cu.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
