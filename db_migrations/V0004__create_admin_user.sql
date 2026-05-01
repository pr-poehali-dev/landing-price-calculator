-- Создаём аккаунт администратора (пароль: Admin2024!)
-- SHA256 от "Admin2024!" = a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
INSERT INTO t_p60076574_landing_price_calcul.users (login, password_hash, role)
VALUES ('admin', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'admin')
ON CONFLICT (login) DO UPDATE SET role = 'admin';
