import { MODE } from "./config";
import { liveBackend } from "./shopify";
import { demoBackend } from "../demo/backend";
import type { Backend } from "./types";

/** Live Storefront API when there's a token, otherwise the demo that runs the real Function code. */
export const backend: Backend = MODE === "live" ? liveBackend : demoBackend;

export const getCollection = (handle = "kits") => backend.getCollection(handle);
export const getKit = (handle: string) => backend.getKit(handle);
