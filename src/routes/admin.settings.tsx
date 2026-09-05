import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { fetchSettings, updateSettings, uploadStreamImage } from "@/lib/api";
import type { SiteSettings } from "@/types";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — PLive Admin" },
      { name: "description", content: "Configure PLive branding, account and footer settings." },
      { property: "og:title", content: "Platform Settings — PLive Admin" },
      { property: "og:description", content: "Configure branding, account and footer settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettings,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function AdminSettings() {
  const queryClient = useQueryClient();
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const [form, setForm] = useState<SiteSettings | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  if (isLoading || !form) {
    return (
      <AdminLayout title="Settings">
        <div className="max-w-3xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" description="Configure your platform settings.">
      <form
        className="max-w-3xl space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate(form);
        }}
      >
        <Section title="General">
          <div className="space-y-1.5">
            <Label htmlFor="site-name">Site name</Label>
            <Input
              id="site-name"
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site-desc">Site description</Label>
            <Textarea
              id="site-desc"
              rows={3}
              value={form.siteDescription}
              onChange={(e) => set("siteDescription", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={form.timezone}
              onChange={(e) => set("timezone", e.target.value)}
            />
          </div>
        </Section>

        <Section title="Branding">
          <p className="text-xs text-muted-foreground">
            Upload a logo to replace the default icon + text in the header and footer. Upload a favicon for the browser tab.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Logo (header &amp; footer)</Label>
              {form.logoUrl ? (
                <div className="relative rounded-md border border-border bg-surface-2/50 p-3">
                  <img src={form.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => set("logoUrl", null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface-2/50 px-4 py-8 text-xs text-muted-foreground hover:border-primary/50">
                  <ImageUp className="size-5" aria-hidden />
                  {logoUploading ? "Uploading..." : "Upload logo image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoUploading(true);
                      try {
                        const url = await uploadStreamImage(file);
                        set("logoUrl", url);
                      } catch (err) {
                        toast.error((err as Error).message);
                      } finally {
                        setLogoUploading(false);
                      }
                    }}
                  />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                When uploaded, this replaces the icon and site name text in the header and footer.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Favicon (browser tab)</Label>
              {form.faviconUrl ? (
                <div className="relative rounded-md border border-border bg-surface-2/50 p-3">
                  <img src={form.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => set("faviconUrl", null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface-2/50 px-4 py-8 text-xs text-muted-foreground hover:border-primary/50">
                  <ImageUp className="size-5" aria-hidden />
                  {faviconUploading ? "Uploading..." : "Upload favicon"}
                  <input
                    type="file"
                    accept="image/*,.ico,.png,.svg"
                    className="hidden"
                    disabled={faviconUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setFaviconUploading(true);
                      try {
                        const url = await uploadStreamImage(file);
                        set("faviconUrl", url);
                      } catch (err) {
                        toast.error((err as Error).message);
                      } finally {
                        setFaviconUploading(false);
                      }
                    }}
                  />
                </label>
              )}
              <p className="text-[11px] text-muted-foreground">
                Shown in the browser tab. Default PLive icon used if empty.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Account">
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/50 px-4 py-3 text-sm">
            Registration enabled
            <Switch
              checked={form.registrationEnabled}
              onCheckedChange={(checked) => set("registrationEnabled", checked)}
            />
          </label>
        </Section>

        <Section title="Footer">
          <div className="space-y-1.5">
            <Label htmlFor="copyright">Copyright text</Label>
            <Input
              id="copyright"
              value={form.copyrightText}
              onChange={(e) => set("copyrightText", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cta-text">Footer CTA text</Label>
              <Input
                id="cta-text"
                value={form.footerCtaText}
                onChange={(e) => set("footerCtaText", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cta-label">Footer CTA label</Label>
              <Input
                id="cta-label"
                value={form.footerCtaLabel}
                onChange={(e) => set("footerCtaLabel", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="telegram">Telegram username</Label>
            <Input
              id="telegram"
              placeholder="@EjadTech1"
              value={form.telegramUsername}
              onChange={(e) => set("telegramUsername", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Shown on the watch page and footer. Include the @ prefix.</p>
          </div>
        </Section>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </AdminLayout>
  );
}
