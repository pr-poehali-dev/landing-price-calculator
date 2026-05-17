import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import {
  apiPartner, DEAL_STATUS_META, DADATA_TOKEN,
  type ClientDetail, type StatusEntry, type Doc, type Comment, type DealStatus,
} from "./types";
import { type ClientService, type AvailableService } from "./clientCard/clientCardShared";
import ClientCardInfo from "./clientCard/ClientCardInfo";
import ClientCardSidebar from "./clientCard/ClientCardSidebar";
import { StatusModal, DeleteModal } from "./clientCard/ClientCardModals";

const FIND_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";

interface Props {
  sessionId: string;
  clientId: number;
  isAdmin: boolean;
  onBack: () => void;
}

export default function ClientCard({ sessionId, clientId, isAdmin, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [statuses, setStatuses] = useState<StatusEntry[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const [uploadCat, setUploadCat] = useState("other");
  const [uploading, setUploading] = useState(false);

  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<DealStatus>("new");
  const [statusComment, setStatusComment] = useState("");
  const [settingStatus, setSettingStatus] = useState(false);

  const [ddLoading, setDdLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ddData, setDdData] = useState<Record<string, unknown> | null>(null);

  // Услуги
  const [clientServices, setClientServices] = useState<ClientService[]>([]);
  const [allServices, setAllServices] = useState<AvailableService[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [serviceDealAmount, setServiceDealAmount] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);

  const load = async () => {
    const data = await apiPartner(sessionId, { action: "get_client", client_id: clientId });
    if (data.client) {
      setClient(data.client);
      setStatuses(data.statuses || []);
      setDocs(data.docs || []);
      setComments(data.comments || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [clientId]);

  useEffect(() => {
    apiPartner(sessionId, { action: "get_client_services", client_id: clientId })
      .then(d => { if (d.client_services) setClientServices(d.client_services); });
    apiPartner(sessionId, { action: "get_services" })
      .then(d => { if (d.services) setAllServices(d.services); });
  }, [clientId, sessionId]);

  useEffect(() => {
    if (!client?.inn || !DADATA_TOKEN) return;
    setDdLoading(true);
    fetch(FIND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${DADATA_TOKEN}` },
      body: JSON.stringify({ query: client.inn, count: 1 }),
    }).then(r => r.json()).then(d => {
      if (d.suggestions?.[0]) setDdData(d.suggestions[0].data);
    }).finally(() => setDdLoading(false));
  }, [client?.inn]);

  const sendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const data = await apiPartner(sessionId, { action: "add_comment", client_id: clientId, message: commentText });
    if (data.comment) {
      setComments(prev => [...prev, data.comment]);
      setCommentText("");
    }
    setSendingComment(false);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      const data = await apiPartner(sessionId, {
        action: "upload_doc", client_id: clientId,
        file_name: file.name, file_b64: b64, category: uploadCat,
      });
      if (data.doc) setDocs(prev => [data.doc, ...prev]);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const selectedService = allServices.find(s => s.id === selectedServiceId);
  const computedReward = selectedService && selectedService.rate_pct > 0 && serviceDealAmount
    ? parseFloat(serviceDealAmount) * selectedService.rate_pct / 100
    : selectedService && selectedService.base_price && selectedService.rate_pct > 0
      ? selectedService.base_price * selectedService.rate_pct / 100
      : null;

  const handleAddService = async () => {
    if (!selectedServiceId) return;
    setSavingService(true);
    const amount = serviceDealAmount ? parseFloat(serviceDealAmount) : selectedService?.base_price || null;
    await apiPartner(sessionId, {
      action: "add_client_service",
      client_id: clientId,
      service_id: selectedServiceId,
      deal_amount: amount,
      reward_amount: computedReward,
      rate_pct: selectedService?.rate_pct || null,
    });
    const d = await apiPartner(sessionId, { action: "get_client_services", client_id: clientId });
    if (d.client_services) setClientServices(d.client_services);
    await load();
    setAddingService(false);
    setSelectedServiceId(null);
    setServiceDealAmount("");
    setSavingService(false);
  };

  const handleRemoveService = async (itemId: number) => {
    setRemovingServiceId(itemId);
    await apiPartner(sessionId, { action: "remove_client_service", id: itemId, client_id: clientId });
    setClientServices(prev => prev.filter(s => s.id !== itemId));
    await load();
    setRemovingServiceId(null);
  };

  const changeStatus = async () => {
    setSettingStatus(true);
    await apiPartner(sessionId, { action: "set_client_status", client_id: clientId, status: newStatus, comment: statusComment });
    setStatusModal(false);
    setStatusComment("");
    await load();
    setSettingStatus(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const data = await apiPartner(sessionId, { action: "delete_client", client_id: clientId });
    setDeleting(false);
    if (data.ok) { toast.success("Клиент удалён"); onBack(); }
    else toast.error(data.error || "Ошибка удаления");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Icon name="LoaderCircle" size={32} className="animate-spin" style={{ color: "var(--blue)" }} />
    </div>
  );
  if (!client) return <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>Клиент не найден</div>;

  const currentStatusMeta = DEAL_STATUS_META[client.current_status];

  return (
    <div>
      {/* Back button + header */}
      <div className="mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-3 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}>
          <Icon name="ArrowLeft" size={16} /> Назад к списку
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)" }}>
              {client.full_name}
            </h2>
            {client.inn && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>ИНН: {client.inn}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: currentStatusMeta.bg, color: currentStatusMeta.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: currentStatusMeta.color }} />
              {currentStatusMeta.label}
            </span>
            {isAdmin && (
              <button onClick={() => { setNewStatus(client.current_status); setStatusModal(true); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "var(--blue)", color: "#fff" }}>
                Статус
              </button>
            )}
            <button onClick={() => setDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Icon name="Trash2" size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-5">
        <ClientCardInfo
          isAdmin={isAdmin}
          client={client}
          docs={docs}
          comments={comments}
          commentText={commentText}
          sendingComment={sendingComment}
          uploadCat={uploadCat}
          uploading={uploading}
          ddLoading={ddLoading}
          ddData={ddData}
          clientServices={clientServices}
          allServices={allServices}
          addingService={addingService}
          selectedServiceId={selectedServiceId}
          serviceDealAmount={serviceDealAmount}
          savingService={savingService}
          removingServiceId={removingServiceId}
          computedReward={computedReward}
          selectedService={selectedService}
          onCommentChange={setCommentText}
          onSendComment={sendComment}
          onUploadCatChange={setUploadCat}
          onFileSelect={handleFile}
          onAddingService={setAddingService}
          onSelectServiceId={setSelectedServiceId}
          onServiceDealAmountChange={setServiceDealAmount}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
        />

        <ClientCardSidebar statuses={statuses} />
      </div>

      {statusModal && (
        <StatusModal
          newStatus={newStatus}
          statusComment={statusComment}
          settingStatus={settingStatus}
          onStatusChange={setNewStatus}
          onCommentChange={setStatusComment}
          onSave={changeStatus}
          onClose={() => setStatusModal(false)}
        />
      )}

      {deleteConfirm && (
        <DeleteModal
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(false)}
        />
      )}
    </div>
  );
}