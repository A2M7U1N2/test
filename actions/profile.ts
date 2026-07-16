"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

// بتتأكد هل المستخدم كمّل بياناته الأساسية ولا لسه
export async function isProfileComplete() {
  const profile = await getProfile();
  if (!profile) return false;

  return !!(
    profile.full_name &&
    profile.university &&
    profile.faculty &&
    profile.department &&
    profile.academic_year
  );
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates = {
    id: user.id,
    full_name: formData.get("fullName") as string,
    university: formData.get("university") as string,
    faculty: formData.get("faculty") as string,
    department: formData.get("department") as string,
    academic_year: formData.get("academicYear") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return { success: true };
}