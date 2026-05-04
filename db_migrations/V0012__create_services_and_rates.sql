-- Справочник услуг
CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.services (
  id          serial PRIMARY KEY,
  category    varchar(100) NOT NULL,
  name        varchar(255) NOT NULL,
  description varchar(500) NULL,
  base_price  numeric(12,2) NULL,
  price_note  varchar(255) NULL,
  active      boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0
);

-- Заполняем услугами с сайта
INSERT INTO t_p60076574_landing_price_calcul.services (category, name, description, base_price, price_note, sort_order) VALUES
  ('Интеллектуальная собственность', 'Отзыв в суд (до 500 000 ₽)', 'Анализ · подготовка · подача. Мин. 20 000 ₽', NULL, '10% от суммы иска', 1),
  ('Интеллектуальная собственность', 'Отзыв в суд (свыше 500 000 ₽)', 'Анализ · подготовка · подача. + 2% от суммы превышения', 50000, '50 000 ₽ + 2%', 2),
  ('Взаимодействие с ФНС', 'Правовое заключение', 'Анализ позиции + рекомендации', 25000, '25 000 ₽', 3),
  ('Взаимодействие с ФНС', 'Возражение', 'На акт или решение ФНС', 70000, '70 000 ₽', 4),
  ('Взаимодействие с ФНС', 'Ответ на письмо', 'Запрос, требование, уведомление', 10000, '10 000 ₽', 5),
  ('Судебные документы', 'Исковое заявление', 'Составление и подача', NULL, 'по договорённости', 6),
  ('Судебные документы', 'Ходатайство / жалоба', 'Процессуальные документы', NULL, 'по договорённости', 7);

-- Индивидуальные % вознаграждения партнёра по каждой услуге
CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.partner_service_rates (
  id          serial PRIMARY KEY,
  partner_id  integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.partners(id),
  service_id  integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.services(id),
  rate_pct    numeric(5,2) NOT NULL DEFAULT 0,
  updated_at  timestamp NOT NULL DEFAULT now(),
  UNIQUE (partner_id, service_id)
);

-- Услуги выбранные для конкретного клиента
CREATE TABLE IF NOT EXISTS t_p60076574_landing_price_calcul.partner_client_services (
  id            serial PRIMARY KEY,
  client_id     integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.partner_clients(id),
  service_id    integer NOT NULL REFERENCES t_p60076574_landing_price_calcul.services(id),
  deal_amount   numeric(12,2) NULL,
  reward_amount numeric(12,2) NULL,
  rate_pct      numeric(5,2) NULL,
  note          text NULL,
  created_at    timestamp NOT NULL DEFAULT now()
);