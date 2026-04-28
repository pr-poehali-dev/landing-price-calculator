import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-white)" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm font-body transition-opacity hover:opacity-70"
          style={{ color: "var(--blue)" }}
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <h1
          className="font-display text-3xl mb-2"
          style={{ color: "var(--navy)" }}
        >
          Политика конфиденциальности
        </h1>
        <p className="font-body text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          Редакция от 28 апреля 2026 г.
        </p>

        <div className="space-y-8 font-body text-sm leading-relaxed" style={{ color: "var(--text)" }}>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки
              персональных данных пользователей сайта <strong>legis24.ru</strong> (далее — «Сайт»),
              осуществляемой Адвокатским бюро «Legis24» (далее — «Оператор»), в соответствии с
              Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>2. Оператор персональных данных</h2>
            <ul className="space-y-1 list-none">
              <li><span style={{ color: "var(--text-muted)" }}>Полное наименование:</span> Непубличное акционерное общество «ИВА ПЛЮС»</li>
              <li><span style={{ color: "var(--text-muted)" }}>ИНН / КПП:</span> 6678116490 / 667901001</li>
              <li><span style={{ color: "var(--text-muted)" }}>ОГРН:</span> 1216600075251 (выдан 16.12.2021)</li>
              <li><span style={{ color: "var(--text-muted)" }}>Юридический адрес:</span> 620024, Свердловская область, г. Екатеринбург, ул. Бисертская, д. 29, офис 14/6</li>
              <li><span style={{ color: "var(--text-muted)" }}>Генеральный директор:</span> Тихомирова Екатерина Викторовна</li>
              <li><span style={{ color: "var(--text-muted)" }}>Сайт:</span> advokat-vsem.ru</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>3. Состав персональных данных</h2>
            <p>Оператор обрабатывает следующие персональные данные, предоставляемые пользователем добровольно при заполнении формы обратной связи:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Фамилия, имя, отчество</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Содержание обращения (описание ситуации)</li>
              <li>Прикреплённые файлы (при наличии)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>4. Цели обработки персональных данных</h2>
            <p>Персональные данные обрабатываются в целях:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Рассмотрения обращений и предоставления консультаций</li>
              <li>Связи с пользователем по указанным контактным данным</li>
              <li>Исполнения договорных обязательств</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>5. Правовое основание обработки</h2>
            <p>
              Обработка персональных данных осуществляется на основании согласия субъекта персональных
              данных (ст. 6, ч. 1, п. 1 Федерального закона № 152-ФЗ), выражаемого при отправке формы
              на Сайте путём установки соответствующего флага.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>6. Порядок обработки и хранения</h2>
            <p>
              Оператор принимает необходимые организационные и технические меры для защиты персональных
              данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования,
              распространения и иных неправомерных действий третьих лиц.
            </p>
            <p className="mt-2">
              Передача персональных данных третьим лицам без согласия пользователя не осуществляется,
              за исключением случаев, предусмотренных законодательством Российской Федерации.
            </p>
            <p className="mt-2">
              Срок хранения персональных данных — до момента отзыва согласия либо истечения срока,
              установленного законодательством РФ об архивном деле.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>7. Права субъекта персональных данных</h2>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Получить информацию об обработке своих персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Обжаловать действия Оператора в уполномоченном органе (Роскомнадзор)</li>
            </ul>
            <p className="mt-2">
              Для реализации указанных прав необходимо направить письменный запрос на адрес:{" "}
              <a href="mailto:info@legis24.ru" style={{ color: "var(--blue)" }}>info@legis24.ru</a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>8. Cookies и аналитика</h2>
            <p>
              Сайт может использовать файлы cookie исключительно в технических целях для обеспечения
              корректной работы. Данные cookie не содержат персональных сведений и не передаются
              третьим лицам.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-3" style={{ color: "var(--navy)" }}>9. Изменения Политики</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу
              с момента её размещения на Сайте. Продолжение использования Сайта после публикации
              изменений означает согласие пользователя с новой редакцией.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}