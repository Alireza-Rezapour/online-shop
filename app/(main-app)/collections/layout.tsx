export const metadata = {
  title: {
    default: "فروشگاه رز",
    template: "فروشگاه رز | %s",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
