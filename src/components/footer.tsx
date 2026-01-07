"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function SiteFooter() {
  const { setTheme } = useTheme();

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Tenexis</h3>
            <p className="text-zinc-500 text-sm">Empowering digital experiences across the web.</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-400">Products</h4>
            <Link href="https://thrift.tenexis.in" className="text-sm hover:underline">Thrift</Link>
            <Link href="https://store.tenexis.in" className="text-sm hover:underline">Store</Link>
            <Link href="https://notes.tenexis.in" className="text-sm hover:underline">Notes</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-400">Company</h4>
            <Link href="/about" className="text-sm hover:underline">About Us</Link>
            <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                  <Sun className="h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                  <Moon className="h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                  <Monitor className="h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} Tenexis. Designed with passion and creativity by the Tenexis Team.
        </div>
      </div>
    </footer>
  );
}