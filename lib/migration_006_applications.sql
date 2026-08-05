-- Ambassador applications table
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name    text        NOT NULL,
  email        text        NOT NULL,
  phone        text        NOT NULL,
  university   text        NOT NULL,
  course       text        NOT NULL,
  year         text        NOT NULL,
  instagram    text,
  why_apply    text        NOT NULL,
  status       text        NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at   timestamptz DEFAULT now()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  subject    text        NOT NULL,
  message    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);
