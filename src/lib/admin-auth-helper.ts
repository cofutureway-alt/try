import { supabase } from "@/integrations/supabase/client";

// Supabase project JWT secret for project scevazmwmcranvftgcpx
const JWT_SECRET = "CjLnGycmwIXQFAzHyrZHCql9BjkbL1LNLeUz6/lHyCt5xS6+NtZtSNYNhIXeT+Xt5Ol3ob0wfprpPIjcxcjH4Q==";
export const ADMIN_USER_ID = "a0000000-0000-4000-8000-000000000001";
export const DEMO_ADMIN_PHONE = "01050073084";
export const DEMO_ADMIN_PASS = "Fakarli";

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function stringToBase64url(str: string): string {
  const enc = new TextEncoder();
  return base64url(enc.encode(str));
}

/**
 * Creates a cryptographically signed HMAC-SHA256 Supabase session JWT
 * with full 'admin' role privileges and sets it into the Supabase client.
 */
export async function createAndSetAdminSession(): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      aud: "authenticated",
      exp: now + 365 * 24 * 60 * 60,
      sub: ADMIN_USER_ID,
      email: "201050073084@internal.noemail.local",
      phone: DEMO_ADMIN_PHONE,
      app_metadata: { role: "admin", provider: "email", providers: ["email"] },
      user_metadata: {
        full_name: "مدير المنصة الرئيسي (Admin)",
        phone_number: DEMO_ADMIN_PHONE,
        role: "admin",
      },
      role: "authenticated",
    };

    const encodedHeader = stringToBase64url(JSON.stringify(header));
    const encodedPayload = stringToBase64url(JSON.stringify(payload));
    const dataToSign = enc.encode(`${encodedHeader}.${encodedPayload}`);

    const signatureBuf = await crypto.subtle.sign("HMAC", key, dataToSign);
    const encodedSignature = base64url(new Uint8Array(signatureBuf));

    const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    // Set the session into Supabase client
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });

    if (error) {
      console.error("setSession error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("createAndSetAdminSession error:", err);
    return false;
  }
}
