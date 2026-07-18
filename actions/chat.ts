"use server";

import { createClient } from "@/lib/supabase/server";
import { chatWithAI } from "@/lib/ai/openai";
import { getSubjectContent } from "./files";

export async function saveChatMessage(subjectId: string, role: 'user' | 'assistant', content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from('chat_messages').insert({
    subject_id: subjectId,
    user_id: user.id,
    role,
    content,
  });

  if (error) {
    console.error('Error saving chat message:', error);
    return { error: 'Failed to save message' };
  }

  return { success: true };
}

export async function getChatHistory(subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }

  return data || [];
}

export async function clearChatHistory(subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('subject_id', subjectId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing chat history:', error);
    return { error: 'Failed to clear chat history' };
  }

  return { success: true };
}

export async function sendMessage(subjectId: string, message: string) {
  // Save user message
  await saveChatMessage(subjectId, 'user', message);

  // Get subject content for context
  const context = await getSubjectContent(subjectId);

  // Get chat history
  const history = await getChatHistory(subjectId);
  const messages = history.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Get AI response
  const result = await chatWithAI(messages, context);

  // Save assistant message
  // Note: This is a simplified version. For streaming, you'd need a different approach
  const response = await result.text;
  await saveChatMessage(subjectId, 'assistant', response);

  return { success: true, response };
}
