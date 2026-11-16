import Link from "next/link";

export default function SessionNeeded() {
  return (
    <>
      <div>
        <p>ابتدا باید حساب کاربری بسازید یا وارد شوید</p>
        <Link href={"/login"}>ورود یا ساخت حساب</Link>
      </div>
    </>
  );
}
