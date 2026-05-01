import { useState, useEffect } from "react";
import { DadataSuggestion, DADATA_TOKEN } from "./types";

export function useDadata(type: "fio" | "email", query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<DadataSuggestion[]>([]);

  useEffect(() => {
    if (!enabled || !DADATA_TOKEN || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const url =
      type === "fio"
        ? "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio"
        : "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email";

    const timer = setTimeout(() => {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
        body: JSON.stringify({ query, count: 5 }),
      })
        .then((r) => r.json())
        .then((data) => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, type, enabled]);

  return { suggestions, clear: () => setSuggestions([]) };
}
