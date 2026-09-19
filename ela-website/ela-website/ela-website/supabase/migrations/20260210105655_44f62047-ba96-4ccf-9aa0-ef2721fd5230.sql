
-- Block direct inserts to profiles (creation via trigger only)
CREATE POLICY "Profiles created via trigger only"
  ON public.profiles FOR INSERT
  WITH CHECK (false);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);
