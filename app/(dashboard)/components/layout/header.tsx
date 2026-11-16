"use client";

import {
  Menu,
  ShoppingBag,
  ChevronDown,
  User,
  LogOut,
  Home,
} from "lucide-react";

import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { removeAll } from "@/redux/slices/cartSlice";
import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "@/redux/services/profileApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsPerson } from "react-icons/bs";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { data } = authClient.useSession();

  const dispatch = useDispatch();

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(
    data?.user.id,
  );

  let name;

  if (profileLoading) {
    name = data?.user.name;
  } else {
    if (profile?.firstName && profile?.lastName) {
      name = profile.firstName + " " + profile.lastName;
    } else {
      name = data?.user.name;
    }
  }

  const router = useRouter();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          dispatch(removeAll());
          router.push("/");
          return;
        },
        onError: () => {
          router.push("/");
          return;
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-border_soft bg-white/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground/70 hover:bg-primary-50 hover:text-primary lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link
          href={"/"}
          className="flex gap-2 h-10 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-primary-50 hover:text-primary"
        >
          <Home className="h-4.5 w-4.5" />
          <p className="text-sm"> صفحه اصلی</p>
        </Link>

        <Link
          href={"/cart"}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-primary-50 hover:text-primary"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
            3
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-primary-50 focus:outline-none">
            <BsPerson />
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-3 py-2 flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">{name}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="h-4 w-4" /> پروفایل
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-700 hover:bg-red-900! hover:text-white!"
            >
              <LogOut className="h-4 w-4 " /> خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
