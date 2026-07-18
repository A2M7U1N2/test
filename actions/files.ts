"use server";

import { createClient } from "@/lib/supabase/server";
import { extractTextFromPDF, chunkText } from "@/lib/ai/pdfExtractor";
import { generateEmbedding } from "@/lib/ai/openai";

export async function uploadSubjectFile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file") as File;
  const subjectId = formData.get("subjectId") as string;

  if (!file || !subjectId) {
    return { error: "File and subject ID are required" };
  }

  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${subjectId}/${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('subject-files')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('subject-files')
      .getPublicUrl(fileName);

    // Save file metadata to database
    const { error: dbError } = await supabase.from('subject_files').insert({
      subject_id: subjectId,
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl,
      file_type: fileExt,
      file_size: file.size,
    });

    if (dbError) {
      throw dbError;
    }

    // Extract text if it's a PDF
    if (fileExt === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { text, pageCount } = await extractTextFromPDF(buffer);

      // Save extracted content
      const { data: fileData } = await supabase
        .from('subject_files')
        .select('id')
        .eq('file_url', publicUrl)
        .single();

      if (fileData) {
        await supabase.from('file_content').insert({
          file_id: fileData.id,
          content: text,
        });

        // Generate embeddings for chunks (simplified version)
        const chunks = chunkText(text);
        for (const chunk of chunks) {
          try {
            const embedding = await generateEmbedding(chunk);
            // Store embedding (you'd need a vector table for this)
            // For now, we'll just store the text
          } catch (error) {
            console.error('Error generating embedding:', error);
          }
        }
      }
    }

    return { success: true, fileUrl: publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error: 'Failed to upload file' };
  }
}

export async function getSubjectFiles(subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('subject_files')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return data || [];
}

export async function deleteSubjectFile(fileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Get file info
    const { data: fileData } = await supabase
      .from('subject_files')
      .select('file_url')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (!fileData) {
      return { error: "File not found" };
    }

    // Delete from storage
    const fileName = fileData.file_url.split('/').pop();
    await supabase.storage
      .from('subject-files')
      .remove([`${user.id}/${fileName}`]);

    // Delete from database
    const { error } = await supabase
      .from('subject_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { error: 'Failed to delete file' };
  }
}

export async function getSubjectContent(subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return '';
  }

  const { data: files } = await supabase
    .from('subject_files')
    .select('id')
    .eq('subject_id', subjectId)
    .eq('user_id', user.id);

  if (!files || files.length === 0) {
    return '';
  }

  const fileIds = files.map(f => f.id);
  const { data: contents } = await supabase
    .from('file_content')
    .select('content')
    .in('file_id', fileIds);

  if (!contents) {
    return '';
  }

  return contents.map(c => c.content).join('\n\n');
}
