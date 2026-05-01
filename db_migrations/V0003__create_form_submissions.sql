CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.form_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  inn VARCHAR(20),
  inn_company VARCHAR(500),
  message TEXT,
  files_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
