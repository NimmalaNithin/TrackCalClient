import React from "react";
import SideBar from "@/components/layout/SideBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { useBreadCrumb } from "../hooks/BreadCrumbContext";

const MainLayout = () => {
  const { breadCrumbTitle } = useBreadCrumb();
  return (
    <SidebarProvider>
      <SideBar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-5 my-auto" />
          <div className="flex flex-1 justify-between items-center">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">
                    { breadCrumbTitle }
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
              </BreadcrumbList>
            </Breadcrumb>
            <div>
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
