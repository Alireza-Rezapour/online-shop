export const metadata = {
  title: {
    default: "محصولات",
    template: "محصولات | %s",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
