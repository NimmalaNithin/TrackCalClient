import {
  ChartLine,
  LayoutDashboard,
  Utensils,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/layout/NavUser";
import { useBreadCrumb } from "../../hooks/BreadCrumbContext";

import { NavLink } from "react-router-dom";

import AppLogo from "./AppLogo";
import { useAuth } from "@/hooks/AuthContext";

const data = {
  navMain: [
    {
      title: "Menu",
      url: "#",
      items: [
        {
          title: "Overview",
          url: "/",
          icon: LayoutDashboard,
          isActive: false,
        },
        {
          title: "Log Meal",
          url: "/log-meal",
          icon: Utensils,
          isActive: false,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: ChartLine,
          isActive: false,
        },
      ],
    },
  ],
};

const SideBar = () => {
  const { setBreadCrumbTitle } = useBreadCrumb();
  const { setOpenMobile } = useSidebar()
  const { user } = useAuth();
  return (
    <Sidebar>
      <div className="p-2 flex flex-1 flex-col">
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          {/* We create a SidebarGroup for each parent. */}
          {data.navMain.map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-2 py-5">
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <NavLink to={item.url}>
                        {({isActive}) => {
                          const Icon = item.icon;
                          return (
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive}
                            onClick={()=> {
                              setBreadCrumbTitle(item.title)
                              setOpenMobile(false)
                            }
                            }
                          >
                            <span className="flex items-center gap-2">
                              {Icon && <Icon className="size-4" />}
                              {item.title}
                            </span>
                          </SidebarMenuButton>
                        )}}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
        <SidebarRail />
      </div>
    </Sidebar>
  );
};

export default SideBar;
