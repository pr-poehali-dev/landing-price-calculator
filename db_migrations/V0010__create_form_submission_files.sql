CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.form_submission_files (
  id          serial PRIMARY KEY,
  submission_id integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.form_submissions(id),
  file_name   varchar(500) NOT NULL,
  file_url    text NOT NULL,
  file_size   integer NULL,
  mime_type   varchar(200) NULL,
  created_at  timestamp NOT NULL DEFAULT now()
);