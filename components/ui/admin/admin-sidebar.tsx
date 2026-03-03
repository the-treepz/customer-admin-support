"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  LogOut,
} from "lucide-react"
import { clearAdminToken } from "@/lib/auth"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAdminToken()
    router.replace('/')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-bold flex items-center gap-2 m-2">
            <Image
              className="object-contain cursor-pointer"
              unoptimized
              src="/treepz.png" 
              alt="Treepz Logo"
              width={100}
              height={100}
              priority
            />
          </SidebarGroupLabel>

          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}