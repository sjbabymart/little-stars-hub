import { queryOptions } from "@tanstack/react-query";
import {
  getCatalog,
  getDeliveryZones,
  getProductBySlug,
  getSiteContent,
  getApprovedRedCarpet,
} from "./site.functions";

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 5 * 60 * 1000,
});

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 60 * 1000,
});

export const deliveryZonesQuery = queryOptions({
  queryKey: ["delivery-zones"],
  queryFn: () => getDeliveryZones(),
  staleTime: 5 * 60 * 1000,
});

export const redCarpetQuery = queryOptions({
  queryKey: ["red-carpet"],
  queryFn: () => getApprovedRedCarpet(),
  staleTime: 60 * 1000,
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
    staleTime: 60 * 1000,
  });
