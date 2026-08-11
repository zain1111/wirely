export async function uploadProductImage(
  file: File,
  folder = "products",
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload failed");
  }
  return data.url;
}
