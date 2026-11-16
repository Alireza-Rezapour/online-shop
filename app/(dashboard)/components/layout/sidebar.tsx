"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X, Shirt } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "../../data/nav";
import { authClient } from "@/lib/auth-client";
import { removeAll } from "@/redux/slices/cartSlice";
import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "@/redux/services/profileApi";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const dispatch = useDispatch();

  const { data } = authClient.useSession();

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery(
    data?.user.id,
  );

  let name;

  if (profileLoading) {
    name = data?.user.name;
  } else {
    if (profile?.firstName && profile?.lastName && profile) {
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
          router.push("/");
          dispatch(removeAll());
          return;
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground text-white">
          <Shirt className="h-5 w-5" />
        </div>
        <span className="text-xl font-medium tracking-tight text-foreground">
          Rose
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = `/${pathname.split("/")[1]}` === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary-foreground text-white shadow-soft"
                  : "text-foreground/70 hover:bg-primary-50 hover:text-primary-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-foreground/50 group-hover:text-primary-foreground",
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border_soft p-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <p className="truncate text-sm font-medium text-foreground">
              {name}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="cursor-pointer mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-danger-bg hover:text-red-700"
        >
          <LogOut className="h-4.5 w-4.5" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 border-r border-border_soft bg-white lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-[#2B2438]/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-70 bg-white shadow-hover transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={onClose}
          className="absolute left-4 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary-50 hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}
