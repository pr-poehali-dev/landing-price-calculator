import { type ClientDetail, type Doc, type Comment } from "../types";
import { type ClientService, type AvailableService } from "./clientCardShared";
import ClientCardInfoSections from "./ClientCardInfoSections";
import ClientCardServices from "./ClientCardServices";
import ClientCardPayments from "./ClientCardPayments";
import ClientCardDocsComments from "./ClientCardDocsComments";

export interface ClientPayment {
  id: number;
  amount: number;
  description?: string;
  status: string;
  paid_at?: string | null;
  created_at: string;
}

interface Props {
  isAdmin: boolean;
  client: ClientDetail;
  docs: Doc[];
  comments: Comment[];
  commentText: string;
  sendingComment: boolean;
  uploadCat: string;
  uploading: boolean;
  ddLoading: boolean;
  ddData: Record<string, unknown> | null;
  clientServices: ClientService[];
  allServices: AvailableService[];
  addingService: boolean;
  selectedServiceId: number | null;
  serviceDealAmount: string;
  savingService: boolean;
  removingServiceId: number | null;
  computedReward: number | null;
  selectedService: AvailableService | undefined;
  clientPayments: ClientPayment[];
  onCommentChange: (v: string) => void;
  onSendComment: () => void;
  onUploadCatChange: (v: string) => void;
  onFileSelect: (file: File) => void;
  onAddingService: (v: boolean) => void;
  onSelectServiceId: (id: number | null) => void;
  onServiceDealAmountChange: (v: string) => void;
  onAddService: () => void;
  onRemoveService: (id: number) => void;
  onAddClientPayment: (amount: number, description: string, status: string) => Promise<void>;
  onUpdateClientPayment: (id: number, status: string, paid_at?: string) => Promise<void>;
  onDeleteClientPayment: (id: number) => Promise<void>;
}

export default function ClientCardInfo({
  isAdmin, client, docs, comments, commentText, sendingComment,
  uploadCat, uploading, ddLoading, ddData,
  clientServices, allServices, addingService, selectedServiceId,
  serviceDealAmount, savingService, removingServiceId,
  computedReward, selectedService,
  clientPayments,
  onCommentChange, onSendComment, onUploadCatChange, onFileSelect,
  onAddingService, onSelectServiceId, onServiceDealAmountChange,
  onAddService, onRemoveService,
  onAddClientPayment, onUpdateClientPayment, onDeleteClientPayment,
}: Props) {
  return (
    <div className="lg:col-span-2 space-y-5">
      <ClientCardInfoSections
        client={client}
        ddLoading={ddLoading}
        ddData={ddData}
      />
      <ClientCardServices
        clientServices={clientServices}
        allServices={allServices}
        addingService={addingService}
        selectedServiceId={selectedServiceId}
        serviceDealAmount={serviceDealAmount}
        savingService={savingService}
        removingServiceId={removingServiceId}
        computedReward={computedReward}
        selectedService={selectedService}
        onAddingService={onAddingService}
        onSelectServiceId={onSelectServiceId}
        onServiceDealAmountChange={onServiceDealAmountChange}
        onAddService={onAddService}
        onRemoveService={onRemoveService}
      />
      <ClientCardPayments
        isAdmin={isAdmin}
        client={client}
        clientPayments={clientPayments}
        onAddClientPayment={onAddClientPayment}
        onUpdateClientPayment={onUpdateClientPayment}
        onDeleteClientPayment={onDeleteClientPayment}
      />
      <ClientCardDocsComments
        docs={docs}
        comments={comments}
        commentText={commentText}
        sendingComment={sendingComment}
        uploadCat={uploadCat}
        uploading={uploading}
        onCommentChange={onCommentChange}
        onSendComment={onSendComment}
        onUploadCatChange={onUploadCatChange}
        onFileSelect={onFileSelect}
      />
    </div>
  );
}
