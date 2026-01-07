"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

// Icons
import { LogOut, User, Settings } from "lucide-react";

// Shadcn Components
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { TenexisText } from "./ui/tenexisText";
import { NAV_ITEMS } from "@/data/nav";

interface UserProfile {
  name: string;
  email: string;
  picture?: string; // Optional because some Google accounts might not have one
  image?: string;   // Handle both 'picture' (DB) or 'image' (Google) keys if they differ
}

// 2. Define the Props for the Component
interface SiteHeaderProps {
  user: UserProfile | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const router = useRouter();
  // const user = null;

 const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center">
        
        {/* 1. Logo (Left) */}
        <Link href="/" className="mr-6 hover:opacity-80 transition-opacity shrink-0">
          <TenexisText />
        </Link>

        {/* 2. Main Navigation (Center-Left) */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            {NAV_ITEMS.map((navItem) => {
              if (navItem.items) {
                return (
                  <NavigationMenuItem key={navItem.title}>
                    <NavigationMenuTrigger>{navItem.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 w-[350px] md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
                        {/* Featured Box */}
                        {navItem.items
                          .filter((item) => item.featured)
                          .map((featuredItem) => (
                            <li className="row-span-3" key={featuredItem.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  className="flex h-full w-full flex-col justify-end items-start rounded-md bg-gradient-to-b from-primary/10 to-primary/20 p-6 no-underline outline-none transition-all select-none hover:shadow-md"
                                  href={featuredItem.href}
                                >
                                  <div className="mb-1 text-lg font-bold text-primary">
                                    {featuredItem.title}
                                  </div>
                                  <p className="text-sm leading-tight text-muted-foreground">
                                    {featuredItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        {/* Standard Items */}
                        {navItem.items
                          .filter((item) => !item.featured)
                          .map((subItem) => (
                            <ListItem
                              key={subItem.title}
                              href={subItem.href}
                              title={subItem.title}
                              icon={subItem.icon}
                              className={subItem.className}
                            >
                              {subItem.description}
                            </ListItem>
                          ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              }
              return (
                <NavigationMenuItem key={navItem.title}>
                  <Link href={navItem.href || "#"} passHref legacyBehavior>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {navItem.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
          {/* Viewport for Nav Animations */}
          <div className="absolute top-full left-0 flex justify-center w-full">
             <NavigationMenuViewport className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out md:w-[var(--radix-navigation-menu-viewport-width)]" />
          </div>
        </NavigationMenu>

        {/* 3. Auth Section (Far Right) */}
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            // LOGGED IN: Show Avatar & Dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                    <AvatarImage src={user.picture} alt="User Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {/* Generates initials "JD" from "John Doe" */}
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // LOGGED OUT: Show Login Button
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/about">About</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

/**
 * ListItem Component Helper
 */
function ListItem({
  className,
  title,
  children,
  href,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  title: string;
  href: string;
  icon?: React.ElementType;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "flex flex-col items-start justify-start gap-1 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 w-full">
            {Icon && (
              <Icon className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
            )}
            <div className="text-sm font-bold leading-none text-foreground group-hover:text-primary transition-colors">
              {title}
            </div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground w-full mt-1">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}