import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { adminGetSettings, adminUpdateSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContactForm = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
};

type ShopForm = {
  announcement: string;
  freeDeliveryThreshold: string;
  currency: string;
};

type ClinicForm = {
  name: string;
  tagline: string;
  hours: string;
  phone: string;
  services: string;
};

const emptyContact: ContactForm = { phone: "", whatsapp: "", email: "", address: "", hours: "" };
const emptyShop: ShopForm = { announcement: "", freeDeliveryThreshold: "5000", currency: "KSh" };
const emptyClinic: ClinicForm = { name: "", tagline: "", hours: "", phone: "", services: "" };

export function AdminSettings() {
  const qc = useQueryClient();
  const [contact, setContact] = useState<ContactForm>(emptyContact);
  const [shop, setShop] = useState<ShopForm>(emptyShop);
  const [clinic, setClinic] = useState<ClinicForm>(emptyClinic);

  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminGetSettings(),
  });

  useEffect(() => {
    if (!settings.data) return;
    const d = settings.data;
    setContact({ ...d.contact });
    setShop({
      announcement: d.shop.announcement,
      freeDeliveryThreshold: String(d.shop.free_delivery_threshold),
      currency: d.shop.currency,
    });
    setClinic({
      name: d.clinic.name,
      tagline: d.clinic.tagline,
      hours: d.clinic.hours,
      phone: d.clinic.phone,
      services: (d.clinic.services ?? []).join("\n"),
    });
  }, [settings.data]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    void qc.invalidateQueries({ queryKey: ["site-content"] });
  };

  const saveContact = useMutation({
    mutationFn: () =>
      adminUpdateSettings({
        data: {
          key: "contact",
          value: {
            phone: contact.phone.trim(),
            whatsapp: contact.whatsapp.trim(),
            email: contact.email.trim(),
            address: contact.address.trim(),
            hours: contact.hours.trim(),
          },
        },
      }),
    onSuccess: () => {
      toast.success("Contact details saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveShop = useMutation({
    mutationFn: () =>
      adminUpdateSettings({
        data: {
          key: "shop",
          value: {
            announcement: shop.announcement.trim(),
            free_delivery_threshold: Number(shop.freeDeliveryThreshold) || 0,
            currency: shop.currency.trim(),
          },
        },
      }),
    onSuccess: () => {
      toast.success("Shop settings saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveClinic = useMutation({
    mutationFn: () =>
      adminUpdateSettings({
        data: {
          key: "clinic",
          value: {
            name: clinic.name.trim(),
            tagline: clinic.tagline.trim(),
            hours: clinic.hours.trim(),
            phone: clinic.phone.trim(),
            services: clinic.services
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        },
      }),
    onSuccess: () => {
      toast.success("Clinic settings saved");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (settings.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary">Site settings</h2>
        <p className="text-sm text-muted-foreground">
          Contact details, shop and clinic information shown across the website.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Phone, WhatsApp, email and address shown in the header, footer and contact page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveContact.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="+254 7XX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-whatsapp">WhatsApp number</Label>
                <Input
                  id="s-whatsapp"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  placeholder="2547XXXXXXXX (no +)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="hello@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-address">Address</Label>
                <Input
                  id="s-address"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="Your shop address, Nairobi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-hours">Opening hours</Label>
                <Input
                  id="s-hours"
                  value={contact.hours}
                  onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                  placeholder="Mon–Sat, 9:00am – 6:00pm"
                />
              </div>
              <Button type="submit" disabled={saveContact.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveContact.isPending ? "Saving…" : "Save contact"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shop</CardTitle>
            <CardDescription>Announcement bar and the free-delivery threshold used at checkout.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveShop.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="s-announcement">Announcement</Label>
                <Textarea
                  id="s-announcement"
                  value={shop.announcement}
                  onChange={(e) => setShop({ ...shop, announcement: e.target.value })}
                  placeholder="Free delivery on orders over KSh 5,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-threshold">Free delivery threshold (KES)</Label>
                <Input
                  id="s-threshold"
                  type="number"
                  min="0"
                  step="1"
                  value={shop.freeDeliveryThreshold}
                  onChange={(e) => setShop({ ...shop, freeDeliveryThreshold: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-currency">Currency label</Label>
                <Input
                  id="s-currency"
                  value={shop.currency}
                  onChange={(e) => setShop({ ...shop, currency: e.target.value })}
                  placeholder="KSh"
                />
              </div>
              <Button type="submit" disabled={saveShop.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveShop.isPending ? "Saving…" : "Save shop"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clinic</CardTitle>
            <CardDescription>Njau Children's Clinic details and services shown on the clinic page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                saveClinic.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="c-name">Clinic name</Label>
                <Input
                  id="c-name"
                  value={clinic.name}
                  onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-phone">Phone</Label>
                <Input
                  id="c-phone"
                  value={clinic.phone}
                  onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-tagline">Tagline</Label>
                <Input
                  id="c-tagline"
                  value={clinic.tagline}
                  onChange={(e) => setClinic({ ...clinic, tagline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-hours">Opening hours</Label>
                <Input
                  id="c-hours"
                  value={clinic.hours}
                  onChange={(e) => setClinic({ ...clinic, hours: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="c-services">Services (one per line)</Label>
                <Textarea
                  id="c-services"
                  rows={6}
                  value={clinic.services}
                  onChange={(e) => setClinic({ ...clinic, services: e.target.value })}
                  placeholder={"Well-baby checkups & growth monitoring\nVaccinations & immunization"}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={saveClinic.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveClinic.isPending ? "Saving…" : "Save clinic"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
