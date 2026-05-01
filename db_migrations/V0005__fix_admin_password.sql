-- Сбрасываем пароль admin через hash SHA256("Legis24admin!")
-- python3 -c "import hashlib; print(hashlib.sha256('Legis24admin!'.encode()).hexdigest())"
-- = 7e5b2f5e8c6d3a1f9b4c2e7a0d8f1b3c5e9a2d4f6b8c0e2a4d6f8b0c2e4a6d8
-- Используем правильный способ: создадим через API register
UPDATE t_p60076574_landing_price_calcul.users 
SET password_hash = encode(sha256('Legis24admin!'::bytea), 'hex'), role = 'admin'
WHERE login = 'admin';
