import { useCallback } from "react";
import Icon from "@/components/ui/icon";
import { InnInfo, FieldError, INPUT_BASE, DADATA_TOKEN } from "./types";

interface InnFieldProps {
  inn: string;
  innInfo: InnInfo | null;
  innChecking: boolean;
  touched: Record<string, boolean>;
  errors: FieldError;
  loading: boolean;
  setInn: (v: string) => void;
  setInnInfo: (v: InnInfo | null) => void;
  setInnChecking: (v: boolean) => void;
  setErrors: (fn: (e: FieldError) => FieldError) => void;
  onBlur: () => void;
}

export default function InnField({
  inn, innInfo, innChecking, touched, errors, loading,
  setInn, setInnInfo, setInnChecking, setErrors, onBlur,
}: InnFieldProps) {
  const hasError = touched.inn && errors.inn && !innChecking;

  const checkInn = useCallback(async (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!DADATA_TOKEN || (digits.length !== 10 && digits.length !== 12)) {
      setInnInfo(null);
      return;
    }
    setInnChecking(true);
    setInnInfo(null);
    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify({ query: digits, count: 1 }),
      });
      const data = await res.json();
      const s = data.suggestions?.[0];
      if (s) {
        setInnInfo({
          name: s.value,
          type: s.data?.type === "INDIVIDUAL" ? "ИП" : "Организация",
          kpp: s.data?.kpp || undefined,
          ogrn: s.data?.ogrn || undefined,
          address: (s.data?.address as { value?: string })?.value || undefined,
        });
        setErrors((e) => ({ ...e, inn: undefined }));
      } else {
        setInnInfo(null);
        setErrors((e) => ({ ...e, inn: "ИНН не найден в реестре" }));
      }
    } catch {
      setInnInfo(null);
    } finally {
      setInnChecking(false);
    }
  }, [setInnInfo, setInnChecking, setErrors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    setInn(digits);
    setInnInfo(null);
    setErrors((er) => ({ ...er, inn: undefined }));
  };

  const handleBlur = () => {
    onBlur();
    checkInn(inn);
  };

  const borderColor = touched.inn && errors.inn ? "#ef4444" : "var(--border-c)";

  return (
    <div>
      <div className="relative">
        <input
          className={INPUT_BASE}
          style={{ background: "var(--bg)", border: `1px solid ${borderColor}`, color: "var(--text)", paddingRight: "2.5rem" }}
          placeholder="ИНН (необязательно)"
          value={inn}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          inputMode="numeric"
          maxLength={12}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {innChecking && (
            <Icon name="LoaderCircle" size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          )}
          {!innChecking && innInfo && (
            <Icon name="CircleCheck" size={16} style={{ color: "var(--success)" }} />
          )}
          {!innChecking && touched.inn && errors.inn && (
            <Icon name="CircleAlert" size={16} style={{ color: "#ef4444" }} />
          )}
        </div>
      </div>

      {hasError && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
          <Icon name="CircleAlert" size={12} />{errors.inn}
        </p>
      )}

      {innInfo && (
        <div
          className="mt-2 rounded-lg px-4 py-3 text-xs space-y-1"
          style={{ background: "var(--success-dim)", border: "1px solid rgba(21,128,61,0.15)" }}
        >
          <p className="font-semibold flex items-center gap-1.5" style={{ color: "var(--success)" }}>
            <Icon name="Building2" size={13} />
            {innInfo.name}
          </p>
          <p style={{ color: "var(--success)" }}>
            {innInfo.type}
            {innInfo.kpp && ` · КПП: ${innInfo.kpp}`}
            {innInfo.ogrn && ` · ОГРН: ${innInfo.ogrn}`}
          </p>
          {innInfo.address && (
            <p style={{ color: "var(--success)", opacity: 0.8 }}>{innInfo.address}</p>
          )}
        </div>
      )}
    </div>
  );
}
