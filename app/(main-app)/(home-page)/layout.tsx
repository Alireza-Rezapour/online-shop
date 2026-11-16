export const metadata = {
  title: {
    default: "صفحه اصلی",
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
