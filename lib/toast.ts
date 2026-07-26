import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ToastType = "success" | "error";

function buildToastUrl(type: ToastType, message: string, fallback: string): string {
  const referer = headers().get("referer") ?? fallback;
  const url = new URL(referer);
  url.searchParams.set("toast", message.slice(0, 160));
  url.searchParams.set("toastType", type);
  return url.toString();
}

export function toastSuccess(message: string, fallback = "/"): never {
  redirect(buildToastUrl("success", message, fallback));
}

export function toastError(message: string, fallback = "/"): never {
  redirect(buildToastUrl("error", message, fallback));
}
