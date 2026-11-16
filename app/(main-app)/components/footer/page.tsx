"use client";

import { HiLocationMarker } from "react-icons/hi";
import { FaPhoneFlip } from "react-icons/fa6";
import { GrMailOption } from "react-icons/gr";
import { FaClock } from "react-icons/fa6";
import { FaQuestion } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { FaHandshake } from "react-icons/fa6";
import FooterOptions from "./footerOptions";
import { BsInstagram, BsLinkedin, BsTelegram } from "react-icons/bs";
import Link from "next/link";

export default function Footer() {
  const contactUs = [
    {
      icon: <FaPhoneFlip />,
      text: "۰۷۱-۵۲۳۳۴۴۶۶",
    },
    { icon: <GrMailOption />, text: "rozsupport@gmail.com" },
    {
      icon: <HiLocationMarker />,
      text: "شیراز - بلوار شریعتی",
    },
    {
      icon: <FaClock className="text-4xl" />,
      text: "شنبه تا چهارشنبه از ساعت 8 الی 18؛ پنجشنبه و ایام تعطیل رسمی به‌جز جمعه‌ها از ساعت 8 الی 16",
    },
  ];

  const aboutUs = [
    {
      icon: <FaQuestion />,
      text: "پرسش های متداول",
    },
    { icon: <TbTruckReturn />, text: "شرایط بازگشت کالا" },
    {
      icon: <FaHandshake />,
      text: "همکاری تجاری",
    },
  ];

  const socialMedia = [
    {
      icon: <BsInstagram />,
      text: "@Roz",
    },
    { icon: <BsTelegram />, text: "@Roz" },
    {
      icon: <BsLinkedin />,
      text: "Roz",
    },
  ];

  return (
    <div className="bg-secondary py-20 lg:py-10 px-20 mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-20">
        <FooterOptions details={contactUs} header="تماس با ما" />
        <FooterOptions details={aboutUs} header="درباره ما" />
        <FooterOptions details={socialMedia} header=" شبکه های اجتماعی" />
        <div dir="ltr" className="text-8xl flex justify-center items-start">
          <Link href={"/"}>
            <span className="text-primary-foreground">R</span>OSE
          </Link>
        </div>
      </div>
    </div>
  );
}
