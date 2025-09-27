import { Pricing, FAQ, Testimonials } from "@/blocks/landing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("landing");
  const tt = await getTranslations("pricing");

  return (
    <>
      <Pricing
        pricing={tt.raw("default")}
        srOnlyTitle={tt.raw("default.title")}
      />
      <FAQ faq={t.raw("faq")} />
      <Testimonials testimonials={t.raw("testimonials")} />
    </>
  );
}
