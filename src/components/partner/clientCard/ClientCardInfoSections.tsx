import Icon from "@/components/ui/icon";
import { fmtDate, fmtMoney, type ClientDetail } from "../types";
import { Section, Row } from "./clientCardShared";

interface Props {
  client: ClientDetail;
  ddLoading: boolean;
  ddData: Record<string, unknown> | null;
}

export default function ClientCardInfoSections({ client, ddLoading, ddData }: Props) {
  return (
    <>
      {/* Основная информация */}
      <Section title="Основная информация" icon="User">
        <Row label="ФИО / Наименование" value={client.full_name} />
        <Row label="ИНН" value={client.inn} />
        <Row label="Телефон" value={client.phone} />
        <Row label="Email" value={client.email} />
        <Row label="Контактное лицо" value={client.contact_person} />
        <Row label="Дата добавления" value={fmtDate(client.created_at)} />
        <Row label="Партнёр" value={client.partner_name} />
        {client.notes && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-c)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Примечание</p>
            <p className="text-sm" style={{ color: "var(--text)" }}>{client.notes}</p>
          </div>
        )}
      </Section>

      {/* Источник клиента */}
      {(client.source === 'referral' || client.source === 'self' || client.user_id) && (
        <Section title="Источник" icon="Link">
          {client.source === 'referral' && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.1)" }}>
                <Icon name="Share2" size={15} style={{ color: "#7c3aed" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>Реферальная ссылка</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Клиент зарегистрировался по реферальной ссылке партнёра
                  {client.ref_code && <span> (код: <b>{client.ref_code}</b>)</span>}
                </p>
              </div>
            </div>
          )}
          {(client.source === 'self' || (client.user_id && client.source !== 'referral' && client.source !== 'partner')) && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--blue-dim)" }}>
                <Icon name="UserCheck" size={15} style={{ color: "var(--blue)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>Самостоятельная регистрация</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Клиент зарегистрировался через сайт самостоятельно
                </p>
              </div>
            </div>
          )}
          {client.user_id && (
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-c)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Аккаунт на сайте</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {client.user_login && <Row label="Логин" value={client.user_login} />}
                {client.user_email && <Row label="Email" value={client.user_email} />}
                {client.user_name && <Row label="Имя" value={client.user_name} />}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* DaData: данные юр. лица */}
      {client.inn && (
        <Section title="Данные организации (ФНС)" icon="Building">
          {ddLoading && <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <Icon name="LoaderCircle" size={14} className="animate-spin" /> Загрузка данных ФНС...
          </div>}
          {ddData && !ddLoading && (
            <div>
              <Row label="Полное наименование" value={(ddData.name as Record<string, string>)?.full_with_opf} />
              <Row label="ОГРН" value={ddData.ogrn as string} />
              <Row label="Статус" value={ddData.state && (ddData.state as Record<string, string>).status === "ACTIVE" ? "Действующая" : "Недействующая"} />
              <Row label="Адрес" value={(ddData.address as Record<string, string>)?.value} />
              <Row label="Руководитель" value={(ddData.management as Record<string, string>)?.name} />
              <Row label="Основной ОКВЭД" value={`${ddData.okved || "—"} ${ddData.okved_type || ""}`} />
              {ddData.finance && (
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-c)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Финансы ({(ddData.finance as Record<string, number>).year})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(ddData.finance as Record<string, number>).revenue && (
                      <div className="rounded-lg px-3 py-2" style={{ background: "var(--success-dim)" }}>
                        <p className="text-xs" style={{ color: "var(--success)" }}>Выручка</p>
                        <p className="text-sm font-bold" style={{ color: "var(--success)" }}>{fmtMoney((ddData.finance as Record<string, number>).revenue)}</p>
                      </div>
                    )}
                    {(ddData.finance as Record<string, number>).expense && (
                      <div className="rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.06)" }}>
                        <p className="text-xs" style={{ color: "#ef4444" }}>Расходы</p>
                        <p className="text-sm font-bold" style={{ color: "#ef4444" }}>{fmtMoney((ddData.finance as Record<string, number>).expense)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {!ddData && !ddLoading && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Данные не найдены в ФНС</p>
          )}
        </Section>
      )}
    </>
  );
}
