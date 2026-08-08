import { supabase } from "@/integrations/supabase/client";

export interface WhatsappInstance {
  id: string;
  rasvio_instance_id: string;
  label: string;
  phone_number: string;
  is_active: boolean;
  connection_status: "unknown" | "connected" | "disconnected" | "auth_failed";
  created_at: string;
  updated_at: string;
}

export interface WhatsappSettings {
  rate_limit_min_seconds: number;
  rate_limit_max_seconds: number;
}

export interface WhatsappSecrets {
  api_key: string;
  webhook_secret: string;
}

export interface NotificationTypeChannel {
  notification_type: string;
  whatsapp_enabled: boolean;
  updated_at: string;
}

export interface WhatsappMessageTemplate {
  id: string;
  notification_type: string;
  variant_index: number;
  template_text: string;
}

export interface WhatsappQueueItem {
  id: string;
  notification_id: string | null;
  user_id: string;
  phone_number: string;
  notification_type: string;
  rendered_body: string;
  status: "queued" | "sent" | "failed" | "cancelled";
  instance_id_used: string | null;
  rasvio_message_uuid: string | null;
  scheduled_for: string;
  sent_at: string | null;
  failed_reason: string | null;
  created_at: string;
  instance_label?: string;
  student_name?: string;
}

// Phone Normalizer helper
export function normalizePhoneE164(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d]/g, "");
  if (/^20\d{10}$/.test(cleaned)) return `+${cleaned}`;
  if (/^0\d{10}$/.test(cleaned)) return `+20${cleaned.slice(1)}`;
  if (/^\d{10}$/.test(cleaned)) return `+20${cleaned}`;
  if (/^\d+$/.test(cleaned)) return `+${cleaned}`;
  return null;
}

// 1. Secrets & Settings
export async function fetchWhatsappSettings(): Promise<{
  settings: WhatsappSettings;
  secrets: WhatsappSecrets;
}> {
  const [settingsRes, secretsRes] = await Promise.all([
    supabase.from("whatsapp_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("whatsapp_secrets").select("*").eq("id", 1).maybeSingle(),
  ]);

  return {
    settings: {
      rate_limit_min_seconds: settingsRes.data?.rate_limit_min_seconds ?? 240,
      rate_limit_max_seconds: settingsRes.data?.rate_limit_max_seconds ?? 360,
    },
    secrets: {
      api_key: secretsRes.data?.api_key ?? "",
      webhook_secret: secretsRes.data?.webhook_secret ?? "",
    },
  };
}

export async function saveWhatsappSettings(
  settings: WhatsappSettings,
  secrets: WhatsappSecrets
) {
  await Promise.all([
    supabase
      .from("whatsapp_settings")
      .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() }),
    supabase
      .from("whatsapp_secrets")
      .upsert({ id: 1, ...secrets, updated_at: new Date().toISOString() }),
  ]);
}

// 2. Instances Manager
export async function fetchWhatsappInstances(): Promise<WhatsappInstance[]> {
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WhatsappInstance[];
}

export async function addWhatsappInstance(payload: {
  rasvio_instance_id: string;
  label: string;
  phone_number: string;
}): Promise<WhatsappInstance> {
  const normalizedPhone = normalizePhoneE164(payload.phone_number) || payload.phone_number;

  const { data, error } = await supabase
    .from("whatsapp_instances")
    .insert({
      rasvio_instance_id: payload.rasvio_instance_id.trim(),
      label: payload.label.trim(),
      phone_number: normalizedPhone,
      is_active: true,
      connection_status: "unknown",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WhatsappInstance;
}

export async function toggleWhatsappInstanceActive(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("whatsapp_instances")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteWhatsappInstance(id: string) {
  const { error } = await supabase.from("whatsapp_instances").delete().eq("id", id);
  if (error) throw error;
}

// 3. Channels Toggles
export async function fetchNotificationChannels(): Promise<NotificationTypeChannel[]> {
  const { data, error } = await supabase
    .from("notification_type_channels")
    .select("*")
    .order("notification_type", { ascending: true });
  if (error) throw error;
  return (data || []) as NotificationTypeChannel[];
}

export async function toggleChannelWhatsapp(notification_type: string, enabled: boolean) {
  const { error } = await supabase
    .from("notification_type_channels")
    .upsert({
      notification_type,
      whatsapp_enabled: enabled,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

// 4. Message Templates
export async function fetchMessageTemplates(): Promise<WhatsappMessageTemplate[]> {
  const { data, error } = await supabase
    .from("whatsapp_message_templates")
    .select("*")
    .order("notification_type", { ascending: true })
    .order("variant_index", { ascending: true });
  if (error) throw error;
  return (data || []) as WhatsappMessageTemplate[];
}

export async function updateMessageTemplate(
  notification_type: string,
  variant_index: number,
  template_text: string
) {
  const { error } = await supabase
    .from("whatsapp_message_templates")
    .upsert({
      notification_type,
      variant_index,
      template_text: template_text.trim(),
    });
  if (error) throw error;
}

// 5. Message Queue Log
export async function fetchWhatsappQueueLog(params: {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: WhatsappQueueItem[]; totalCount: number }> {
  let query = supabase
    .from("whatsapp_message_queue")
    .select(
      "*, whatsapp_instances(label), profiles!whatsapp_message_queue_user_id_fkey(full_name)",
      { count: "exact" }
    );

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.type && params.type !== "all") {
    query = query.eq("notification_type", params.type);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const items: WhatsappQueueItem[] = (data || []).map((row: any) => ({
    id: row.id,
    notification_id: row.notification_id,
    user_id: row.user_id,
    phone_number: row.phone_number,
    notification_type: row.notification_type,
    rendered_body: row.rendered_body,
    status: row.status,
    instance_id_used: row.instance_id_used,
    rasvio_message_uuid: row.rasvio_message_uuid,
    scheduled_for: row.scheduled_for,
    sent_at: row.sent_at,
    failed_reason: row.failed_reason,
    created_at: row.created_at,
    instance_label: row.whatsapp_instances?.label || undefined,
    student_name: row.profiles?.full_name || undefined,
  }));

  return { items, totalCount: count || 0 };
}

// 6. Bulk Cancel Queue by Phone Number List
export async function bulkCancelWhatsappQueueByNumbers(rawNumbersText: string): Promise<number> {
  if (!rawNumbersText.trim()) return 0;

  // Split by line or comma
  const rawList = rawNumbersText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  const normalizedSet = new Set<string>();

  for (const raw of rawList) {
    const norm = normalizePhoneE164(raw);
    if (norm) normalizedSet.add(norm);
  }

  if (normalizedSet.size === 0) return 0;

  const numbersArray = Array.from(normalizedSet);

  const { data, error } = await supabase
    .from("whatsapp_message_queue")
    .update({ status: "cancelled" })
    .in("phone_number", numbersArray)
    .eq("status", "queued")
    .select("id");

  if (error) throw error;
  return data?.length || 0;
}

// 7. Manual Dispatcher Trigger
export async function triggerWhatsappDispatcher(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}> {
  const { data, error } = await supabase.rpc("admin_trigger_whatsapp_dispatcher");
  if (error) throw error;
  return data as any;
}

// 8. Send Test WhatsApp Message via Rasvio (Edge Function)
export async function sendWhatsappTestMessage(params: {
  instance_id: string;   // Rasvio 8-char instance ID (rasvio_instance_id field)
  recipient: string;     // E.164 phone number
  message_body: string;  // Plain text message body
}): Promise<{
  uuid: string;
  status: string;
  credit_cost: number;
  recipient_number: string;
}> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("غير مصرح: يجب تسجيل الدخول أولاً");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ||
    (supabase as any).supabaseUrl ||
    "https://scevazmwmcranvftgcpx.supabase.co";

  const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `خطأ في الإرسال (${res.status})`);
  }
  return json.data;
}
