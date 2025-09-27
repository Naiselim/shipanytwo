"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/core/i18n/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { useMedia } from "@/hooks/use-media";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  SmartIcon,
  BrandLogo,
  ThemeToggler,
  LocaleSelector,
  SignUser,
} from "@/blocks/common";
import { Header as HeaderType } from "@/types/blocks/landing";
import { NavItem } from "@/types/blocks/common";

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLarge = useMedia("(min-width: 64rem)");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavMenu = () => {
    const menuRef = useRef<React.ElementRef<typeof NavigationMenu>>(null);

    const handleViewportHeight = () => {
      requestAnimationFrame(() => {
        const menuNode = menuRef.current;
        if (!menuNode) return;

        const openContent = document.querySelector<HTMLElement>(
          '[data-slot="navigation-menu-viewport"][data-state="open"]'
        );

        if (openContent) {
          const height = openContent.scrollHeight;
          document.documentElement.style.setProperty(
            "--navigation-menu-viewport-height",
            `${height}px`
          );
        } else {
          document.documentElement.style.removeProperty(
            "--navigation-menu-viewport-height"
          );
        }
      });
    };

    return (
      <NavigationMenu
        ref={menuRef}
        onValueChange={handleViewportHeight}
        className="**:data-[slot=navigation-menu-viewport]:bg-transparent **:data-[slot=navigation-menu-viewport]:rounded-none **:data-[slot=navigation-menu-viewport]:ring-0 **:data-[slot=navigation-menu-viewport]:border-0 **:data-[slot=navigation-menu-viewport]:shadow-none [--color-muted:color-mix(in_oklch,var(--color-foreground)_5%,transparent)] [--viewport-outer-px:2rem] max-lg:hidden"
      >
        <NavigationMenuList className="gap-3">
          {header.nav?.items?.map((item, idx) => (
            <NavigationMenuItem key={idx} value={item.title || ""}>
              {item.children && item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                  <NavigationMenuContent className="mt-4.5 origin-top pb-14 pt-5 shadow-none ring-0">
                    <div className="min-w-6xl pr-22 divide-foreground/10 grid w-full grid-cols-4 gap-4 divide-x">
                      <div className="col-span-2 row-span-2 grid grid-rows-subgrid gap-1 border-r-0">
                        <span className="text-muted-foreground ml-2 text-xs">
                          {item.title}
                        </span>
                        <ul className="mt-1 grid grid-cols-2 gap-2">
                          {item.children?.map((subItem: NavItem, iidx) => (
                            <ListItem
                              key={iidx}
                              href={subItem.url || ""}
                              title={subItem.title || ""}
                              description={subItem.description || ""}
                            >
                              {subItem.icon && (
                                <SmartIcon name={subItem.icon as string} />
                              )}
                            </ListItem>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link href={item.url || ""} target={item.target || "_self"}>
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav
        role="navigation"
        className="w-full [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="**:hover:no-underline -mx-4 mt-0.5 space-y-0.5"
        >
          {header.nav?.items?.map((item, idx) => {
            return (
              <AccordionItem
                key={idx}
                value={item.title || ""}
                className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <AccordionTrigger className="**:!font-normal data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <ul>
                        {item.children?.map((subItem: NavItem, iidx) => (
                          <li key={iidx}>
                            <Link
                              href={subItem.url || ""}
                              onClick={closeMenu}
                              className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2"
                            >
                              <div
                                aria-hidden
                                className="flex items-center justify-center *:size-4"
                              >
                                {subItem.icon && (
                                  <SmartIcon name={subItem.icon as string} />
                                )}
                              </div>
                              <div className="text-base">{subItem.title}</div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </>
                ) : (
                  <Link
                    href={item.url || ""}
                    onClick={closeMenu}
                    className="**:!font-normal data-[state=open]:bg-muted flex items-center justify-between px-4 py-3 text-lg"
                  >
                    {item.title}
                  </Link>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>
    );
  };

  function ListItem({
    title,
    description,
    children,
    href,
    ...props
  }: React.ComponentPropsWithoutRef<"li"> & {
    href: string;
    title: string;
    description?: string;
  }) {
    return (
      <li {...props}>
        <NavigationMenuLink asChild>
          <Link href={href} className="grid grid-cols-[auto_1fr] gap-3.5">
            <div className="bg-background ring-foreground/10 relative flex size-9 items-center justify-center rounded border border-transparent shadow shadow-sm ring-1">
              {children}
            </div>
            <div className="space-y-0.5">
              <div className="text-foreground text-sm font-medium">{title}</div>
              <p className="text-muted-foreground line-clamp-1 text-xs">
                {description}
              </p>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? "active" : "inactive"}
        {...(isScrolled && { "data-scrolled": true })}
        className="has-data-[state=open]:h-screen has-data-[state=open]:backdrop-blur has-data-[state=open]:bg-background/50 fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "h-18 absolute inset-x-0 top-0 z-50 border-transparent ring-1 ring-transparent transition-all duration-300",
            "in-data-scrolled:border-foreground/5 in-data-scrolled:border-b in-data-scrolled:bg-background/75 in-data-scrolled:backdrop-blur",
            "has-data-[state=open]:ring-foreground/5 has-data-[state=open]:bg-card/75 has-data-[state=open]:shadow-lg has-data-[state=open]:backdrop-blur has-data-[state=open]:border-b has-data-[state=open]:shadow-black/10 has-data-[state=open]:h-[calc(var(--navigation-menu-viewport-height)+3.4rem)]",
            "max-lg:in-data-[state=active]:h-screen max-lg:in-data-[state=active]:bg-background/75 max-lg:in-data-[state=active]:backdrop-blur max-lg:h-14 max-lg:overflow-hidden max-lg:border-b"
          )}
        >
          <div className="container">
            <div className="relative flex flex-wrap items-center justify-between lg:py-5">
              <div className="flex justify-between gap-8 max-lg:h-14 max-lg:w-full max-lg:border-b">
                {header.brand && <BrandLogo brand={header.brand} />}

                {isLarge && <NavMenu />}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={
                    isMobileMenuOpen == true ? "Close Menu" : "Open Menu"
                  }
                  className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-5 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-5 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              {!isLarge && isMobileMenuOpen && (
                <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
              )}

              <div className="max-lg:in-data-[state=active]:mt-6 in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                <div className="flex items-center w-full flex-col space-y-3 sm:flex-row sm:gap-6 sm:space-y-0 md:w-fit">
                  {header.show_theme ? <ThemeToggler /> : null}
                  {header.show_locale ? <LocaleSelector /> : null}
                  {header.show_sign ? <SignUser /> : null}

                  {header.buttons &&
                    header.buttons.map((button, idx) => (
                      <Link
                        key={idx}
                        href={button.url || ""}
                        target={button.target || "_self"}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                          "h-7 ring-0 px-3",
                          button.variant === "outline"
                            ? "shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50"
                            : "shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-(--ring-color) [--ring-color:color-mix(in_oklab,var(--color-foreground)15%,var(--color-primary))] text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {button.icon && (
                          <SmartIcon name={button.icon as string} />
                        )}
                        <span>{button.title}</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
