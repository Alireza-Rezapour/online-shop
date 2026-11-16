export default function Title({ title }: { title: string }) {
  return (
    <div className="w-[80%] mx-auto pt-5 sm:p-5 sm:my-5 flex flex-col gap-2">
      <p className="text-center sm:text-2xl lg:text-4xl text-primary-foreground font-bold">
        {title}
      </p>
      <div className="h-1 bg-linear-to-l from-transparent via-primary-foreground to-transparent" />
    </div>
  );
}
