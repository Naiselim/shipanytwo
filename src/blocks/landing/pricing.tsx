"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { Pricing as PricingType, PricingItem } from "@/types/blocks/pricing";
import { useLocale } from "next-intl";
import { useAppContext } from "@/contexts/app";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Pricing({
  pricing,
  srOnlyTitle,
  className,
}: {
  pricing: PricingType;
  srOnlyTitle?: string;
  className?: string;
}) {
  const locale = useLocale();

  const { user, setIsShowSignModal } = useAppContext();

  const [group, setGroup] = useState(() => {
    // First look for a group with is_featured set to true
    const featuredGroup = pricing.groups?.find((g) => g.is_featured);
    // If no featured group exists, fall back to the first group
    return featuredGroup?.name || pricing.groups?.[0]?.name;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const handleCheckout = async (item: PricingItem, cn_pay: boolean = false) => {
    try {
      if (!user) {
        setIsShowSignModal(true);
        return;
      }

      const params = {
        product_id: item.product_id,
        currency: cn_pay ? "cny" : item.currency,
        locale: locale || "en",
      };

      setIsLoading(true);
      setProductId(item.product_id);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);

        setIsShowSignModal(true);
        return;
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return;
      }

      const { checkoutUrl } = data;
      if (!checkoutUrl) {
        toast.error("checkout failed");
        return;
      }

      window.location.href = checkoutUrl;
    } catch (e) {
      console.log("checkout failed: ", e);

      toast.error("checkout failed");
    } finally {
      setIsLoading(false);
      setProductId(null);
    }
  };

  useEffect(() => {
    if (pricing.items) {
      const featuredItem = pricing.items.find((i) => i.is_featured);
      setProductId(featuredItem?.product_id || pricing.items[0]?.product_id);
      setIsLoading(false);
    }
  }, [pricing.items]);

  return (
    <section
      id={pricing.id}
      className={cn("py-16 md:py-36", pricing.className, className)}
    >
      <div className="mx-auto mb-12 text-center">
        {srOnlyTitle && <h1 className="sr-only">{srOnlyTitle}</h1>}
        <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">
          {pricing.title}
        </h2>
        <p className="mb-4 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg">
          {pricing.description}
        </p>
      </div>

      <div className="container">
        {pricing.groups && pricing.groups.length > 0 && (
          <div className="mb-16 mt-8 flex justify-center w-full md:max-w-lg mx-auto">
            <Tabs value={group} onValueChange={setGroup} className="">
              <TabsList>
                {pricing.groups.map((item, i) => {
                  return (
                    <TabsTrigger key={i} value={item.name || ""}>
                      {item.title}
                      {item.label && (
                        <Badge className="ml-2">{item.label}</Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div
          className={`w-full mt-0 grid gap-6 md:grid-cols-${
            pricing.items?.filter((item) => !item.group || item.group === group)
              ?.length
          }`}
        >
          {pricing.items?.map((item: PricingItem, idx) => {
            if (item.group && item.group !== group) {
              return null;
            }

            return (
              <Card key={idx} className="relative">
                {item.label && (
                  <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
                    {item.label}
                  </span>
                )}

                <CardHeader>
                  <CardTitle className="font-medium">{item.title}</CardTitle>

                  <span className="my-3 block text-2xl font-semibold">
                    {item.price} {item.unit ? `${item.unit}` : ""}
                  </span>

                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                  {item.tip && (
                    <span className="text-sm text-muted-foreground">
                      {item.tip}
                    </span>
                  )}

                  <Button
                    onClick={() => handleCheckout(item)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                      "mt-4 w-full h-9 px-4 py-2",
                      "shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {item.button?.title}
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <hr className="border-dashed" />

                  {item.features_title && (
                    <h3 className="text-sm font-medium">
                      {item.features_title}
                    </h3>
                  )}
                  <ul className="list-outside space-y-3 text-sm">
                    {item.features?.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="size-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
