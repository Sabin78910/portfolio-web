export type CopyResult = "ok" | "error" | "unavailable";

export async function copyText(
  text: string,
  clipboard: Pick<Clipboard, "writeText"> | undefined = typeof navigator === "undefined" ? undefined : navigator.clipboard,
): Promise<CopyResult> {
  if (!clipboard) return "unavailable";
  try {
    await clipboard.writeText(text);
    return "ok";
  } catch {
    return "error";
  }
}
