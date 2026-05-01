-- Устанавливаем пароль "Legis24admin!" через pgcrypto sha256
-- Python hashlib.sha256("Legis24admin!".encode()).hexdigest()
UPDATE t_p60076574_landing_price_calcul.users
SET password_hash = encode(sha256(convert_to('Legis24admin!', 'UTF8')), 'hex')
WHERE login = 'admin';
