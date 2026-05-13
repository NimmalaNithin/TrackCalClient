import { UserPen, ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getHexCode } from "@/lib/utils";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";

const CustomAvatar = ({ avatar, name, bgColor, initials }) => {
  return (
    <Avatar className="h-8 w-8 rounded-full">
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback
        className="rounded-full text-black"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const safeUser = user || { firstName: "Track", lastName: "Cal", email: "user@example.com" };
  const avatar = safeUser.avatar;
  const name = safeUser.firstName + " " + safeUser.lastName;
  const initials =
    safeUser.firstName.charAt(0).toUpperCase() +
    safeUser.lastName.charAt(0).toUpperCase();
  const bgColor = getHexCode(name);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <CustomAvatar
                avatar={avatar}
                name={name}
                bgColor={bgColor}
                initials={initials}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{safeUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-50 min-w-40 rounded-lg px-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <CustomAvatar
                  avatar={avatar}
                  name={name}
                  bgColor={bgColor}
                  initials={initials}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs">{safeUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col gap-2 my-2">
              <DropdownMenuItem onSelect={() => navigate("/profile")}>
                <UserPen />
                Profile
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
