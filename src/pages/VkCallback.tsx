import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const VK_AUTH_URL = "https://functions.poehali.dev/86f3f05d-2e0a-462a-aa06-2c00d428c502";
const AUTH_URL = "https://functions.poehali.dev/cf442b6d-1511-4826-a129-d63da8e9dfa0";

export default function VkCallback() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const device_id = params.get("device_id") || "";

        if (!code) { navigate("/login"); return; }

        const code_verifier = sessionStorage.getItem("vk_auth_code_verifier");
        if (!code_verifier) { navigate("/login"); return; }

        // 1. Обмениваем code на токены VK и получаем user
        const vkRes = await fetch(`${VK_AUTH_URL}?action=callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, code_verifier, device_id }),
        });
        const vkData = await vkRes.json();

        if (!vkRes.ok || !vkData.user) { navigate("/login"); return; }

        sessionStorage.removeItem("vk_auth_code_verifier");
        sessionStorage.removeItem("vk_auth_state");

        // 2. Создаём session_id через основной auth
        const authRes = await fetch(AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "vk_login",
            vk_id: vkData.user.vk_id,
            login: `vk_${vkData.user.vk_id}`,
          }),
        });
        const authData = await authRes.json();

        if (authData.session_id) {
          localStorage.setItem("session_id", authData.session_id);
          localStorage.setItem("user", JSON.stringify(authData.user));
        }

        navigate("/cabinet");
      } catch {
        navigate("/login");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Icon name="LoaderCircle" size={36} className="animate-spin" style={{ color: "var(--blue)" }} />
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Выполняется вход через VK...</p>
    </div>
  );
}
