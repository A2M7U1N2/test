-- Table for storing subject files (PDFs, images, etc.)
CREATE TABLE subject_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'image', etc.
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_subject_file UNIQUE (subject_id, file_url)
);

-- Enable RLS
ALTER TABLE subject_files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subject files"
  ON subject_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subject files"
  ON subject_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subject files"
  ON subject_files FOR DELETE
  USING (auth.uid() = user_id);

-- Table for storing extracted text from files
CREATE TABLE file_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES subject_files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE file_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content of their files"
  ON file_content FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM subject_files WHERE id = file_id
    )
  );

-- Table for storing chat messages
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_subject_files_subject_id ON subject_files(subject_id);
CREATE INDEX idx_subject_files_user_id ON subject_files(user_id);
CREATE INDEX idx_chat_messages_subject_id ON chat_messages(subject_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
