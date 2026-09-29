"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Signing up ends in a redirect to the login page, so the browser only learns
 * it worked when it lands here. Mounted once, behind the welcome flag.
 */
export function SignupTracker() {
  useEffect(() => {
    track("sign_up_completed", { platform: "web" });
  }, []);

  return null;
}
