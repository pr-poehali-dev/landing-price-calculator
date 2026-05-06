-- Добавляем поле lawyer_type в таблицу partners
-- Возможные значения: NULL (обычный), 'lawyer' (юрист), 'advocate' (адвокат)
ALTER TABLE t_p60076574_landing_price_calcul.partners
  ADD COLUMN IF NOT EXISTS lawyer_type varchar(20) NULL;

-- Добавляем поле lawyer_type_requested — что указал партнёр при регистрации
ALTER TABLE t_p60076574_landing_price_calcul.partners
  ADD COLUMN IF NOT EXISTS lawyer_type_requested varchar(20) NULL;

-- Новые услуги для юристов и адвокатов (категория 'Для юристов')
INSERT INTO t_p60076574_landing_price_calcul.services (category, name, description, base_price, price_note, active, sort_order)
VALUES
  ('Для юристов', 'Анализ дела', 'Профессиональная оценка позиции и перспектив дела', 10000.00, NULL, true, 100),
  ('Для юристов', 'Отзыв / процессуальный документ', 'Подготовка правовой позиции по делу', 10000.00, NULL, true, 101),
  ('Для юристов', 'Иск по налоговому спору', 'Полноценный иск с правовым обоснованием для ФНС', 19900.00, NULL, true, 102);
