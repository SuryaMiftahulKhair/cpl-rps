//src/app/rps/[id]/list/[id_matakuliah]/detail/[id_rps]/page.tsx

"use client";

import { useState, useEffect, use, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  Target,
  Loader2,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CheckSquare,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Layers,
  Calendar,
  Award,
  FileText,
  Users,
  Save,
  X,
  PenLine,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  RemoveFormatting,
} from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExt from "@tiptap/extension-underline";

import DashboardLayout from "@/app/components/DashboardLayout";
import CpmkModal from "@/app/components/detail-rps/CpmkModal";
import OtorisasiModal from "@/app/components/detail-rps/OtorisasiModel";

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface PertemuanRow {
  id: string;
  pekan_mulai: number;
  pekan_sampai: number;
  sub_cpmk_id: string;
  indikator: string;
  teknik_kriteria: string;
  luring_bentuk: string;
  luring_metode: string;
  luring_waktu: string;
  daring_bentuk: string;
  daring_metode: string;
  daring_waktu: string;
  materi: string;
  bobot: number;
  db_id?: number;
}

interface SubCPMKLocal {
  id: number;
  kode: string;
  deskripsi: string;
  bobot: number;
  cpmk_id: number;
}
interface CPMK {
  id: number;
  kode_cpmk: string;
  deskripsi: string;
  bobot_to_cpl: number;
  kode_ik?: string;
  ik?: Array<{ kode_ik: string; deskripsi: string }>;
  sub_cpmk?: Array<{ kode: string; deskripsi: string }>;
}
interface CPLItem {
  kode: string;
  deskripsi: string;
}
interface InfoRPSLocal {
  nama_mk: string;
  kode_mk: string;
  sks: string | number;
  semester: string | number;
  rumpun_mk: string;
  tgl_penyusunan: string;
}
interface OtorisasiLocal {
  dosen_pengampu: string;
  koordinator_mk: string;
  ketua_prodi: string;
}
interface DeskripsiLocal {
  deskripsi_mk: string;
  materi_pembelajaran: string;
  daftar_pustaka: string;
}
interface TimDosenItem {
  id: number;
  nama: string;
}
interface MKSyaratItem {
  id: number;
  nama: string;
}
interface RPSData {
  id: number;
  nama_penyusun: string;
  nama_koordinator: string;
  nama_kaprodi: string;
  kurikulum_nama?: string;
  tgl_penyusunan?: string;
  deskripsi_mk?: string;
  materi_pembelajaran?: string;
  referensi_utama?: string;
  referensi_tambahan?: string;
  tim_pengajaran?: string;
  matakuliah_syarat?: string;
  semester?: string | number;
  rumpun_mk?: string;
  cpmk: CPMK[];
  cpl?: CPLItem[];
  pertemuan: any[];
  available_iks: any[];
  matakuliah: { nama: string; kode_mk: string; sks: string };
}

const uid = () => Math.random().toString(36).slice(2, 9);

// ==========================================
// SHARED UI HELPERS
// ==========================================
const inputCls =
  "w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white placeholder-gray-400";
const textareaCls =
  "w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none bg-white placeholder-gray-400";

function clsx(...args: any[]) {
  return args.filter(Boolean).join(" ");
}

function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-800 uppercase mb-1.5 tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ==========================================
// UNIVERSAL MODAL WRAPPER
// ==========================================
function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col overflow-hidden`}
        style={{ maxHeight: "92vh" }}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            {icon} {title}
          </h3>
          <button
            title="Tutup"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-all">
            <X size={18} />
          </button>
        </div>
        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
        {/* Modal Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t-2 border-gray-100 px-6 py-4 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  isSaving,
  confirmLabel = "Simpan",
  formId,
}: {
  onCancel: () => void;
  onConfirm?: () => void;
  isSaving?: boolean;
  confirmLabel?: string;
  formId?: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all">
        <X size={15} /> Batal
      </button>
      <button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={!formId ? onConfirm : undefined}
        disabled={isSaving}
        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-sm">
        {isSaving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Save size={15} />
        )}{" "}
        {confirmLabel}
      </button>
    </div>
  );
}

// ==========================================
// TIPTAP RICH TEXT EDITOR
// ==========================================
function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded-lg transition-all border ${
        active
          ? "bg-indigo-600 text-white border-indigo-600"
          : "text-gray-700 border-transparent hover:bg-gray-200"
      }`}>
      {children}
    </button>
  );
}
function Divider() {
  return <div className="w-px h-5 bg-gray-300 mx-1 self-center" />;
}

function TiptapEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] px-4 py-3 text-sm text-gray-900 leading-relaxed outline-none",
      },
    },
    immediatelyRender: false, // ← ADD THIS LINE
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML())
      editor.commands.setContent(value, {});
  }, [value]);
  if (!editor) return null;
  return (
    <div className="border-2 border-gray-300 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b-2 border-gray-200">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic">
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline">
          <Underline size={15} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered">
          <ListOrdered size={15} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Left">
          <AlignLeft size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Center">
          <AlignCenter size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify">
          <AlignJustify size={15} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          title="Clear">
          <RemoveFormatting size={15} />
        </ToolbarBtn>
      </div>
      <div className="relative">
        {editor.isEmpty && placeholder && (
          <p className="absolute top-3 left-4 text-sm text-gray-400 pointer-events-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ==========================================
// SECTION HEADER + INFO ROW
// ==========================================
function SectionHeader({ title, icon, onEdit, action }: any) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl no-print shadow-sm">
      <h3 className="font-bold text-base flex items-center gap-2 uppercase tracking-wide">
        {icon} {title}
      </h3>
      <div className="flex items-center gap-2">
        {action}
        {onEdit && (
          <button
            title="Edit"
            onClick={onEdit}
            className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <Edit size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex py-3 border-b border-gray-200 last:border-0">
      <div className="w-1/3 font-bold text-gray-800 text-sm uppercase tracking-wide">
        {label}
      </div>
      <div className="w-2/3 text-gray-900 text-sm font-medium">
        {String(value || "-")}
      </div>
    </div>
  );
}

function BobotProgressBar({
  totalBobot,
  sisaBobot,
}: {
  totalBobot: number;
  sisaBobot: number;
}) {
  const pct = Math.min((totalBobot / 100) * 100, 100);
  const isOver = totalBobot > 100,
    isDone = totalBobot === 100;
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-sm no-print">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Award size={18} className="text-indigo-600" /> Total Bobot Penilaian
          (Target 100%)
        </span>
        <div className="flex items-center gap-2">
          {isDone && (
            <CheckCircle2
              size={20}
              className="text-green-600"
              strokeWidth={2.5}
            />
          )}
          {isOver && (
            <AlertTriangle
              size={20}
              className="text-red-600"
              strokeWidth={2.5}
            />
          )}
          <span
            className={`text-2xl font-black ${
              isOver
                ? "text-red-600"
                : isDone
                ? "text-green-600"
                : "text-indigo-600"
            }`}>
            {totalBobot}%
          </span>
        </div>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden border-2 border-gray-200 shadow-inner">
        <div
          className={`h-full transition-all duration-500 ${
            isOver
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isDone
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : "bg-gradient-to-r from-indigo-500 to-blue-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 text-xs flex justify-between font-semibold">
        <span className="text-gray-700">
          SISA ALOKASI:{" "}
          <span className="text-indigo-600 font-bold">{sisaBobot}%</span>
        </span>
        {isOver && (
          <span className="text-red-600 animate-pulse font-bold uppercase flex items-center gap-1">
            <AlertTriangle size={14} /> Melebihi Batas!
          </span>
        )}
        {isDone && (
          <span className="text-green-600 font-bold uppercase flex items-center gap-1">
            <CheckCircle2 size={14} /> Bobot Ideal
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MODAL: INFO RPS
// ==========================================
function InfoRPSModal({
  isOpen,
  onClose,
  data,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: InfoRPSLocal;
  onSave: (d: InfoRPSLocal) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<InfoRPSLocal>(data);
  useEffect(() => {
    if (isOpen) setForm(data);
  }, [isOpen, data]);
  const set = (k: keyof InfoRPSLocal, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Informasi Mata Kuliah"
      icon={<BookOpen size={18} />}
      footer={
        <ModalFooter
          onCancel={onClose}
          formId="info-rps-form"
          isSaving={isSaving}
          confirmLabel="Simpan Info"
        />
      }>
      <form
        id="info-rps-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Mata Kuliah" required>
            <input
              value={form.nama_mk}
              onChange={(e) => set("nama_mk", e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Kode Mata Kuliah" required>
            <input
              value={form.kode_mk}
              onChange={(e) => set("kode_mk", e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Bobot SKS">
            <input
              type="number"
              value={form.sks}
              onChange={(e) => set("sks", e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Semester">
            <input
              type="number"
              value={form.semester}
              onChange={(e) => set("semester", e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Rumpun MK">
            <input
              value={form.rumpun_mk}
              onChange={(e) => set("rumpun_mk", e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Tanggal Penyusunan">
            <input
              type="date"
              value={form.tgl_penyusunan}
              onChange={(e) => set("tgl_penyusunan", e.target.value)}
              className={inputCls}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// MODAL: DESKRIPSI
// ==========================================
function DeskripsiModal({
  isOpen,
  onClose,
  data,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: DeskripsiLocal;
  onSave: (d: DeskripsiLocal) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<DeskripsiLocal>(data);
  useEffect(() => {
    if (isOpen) setForm(data);
  }, [isOpen, data]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Konten Deskriptif"
      icon={<BookOpen size={18} />}
      maxWidth="max-w-3xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          formId="deskripsi-form"
          isSaving={isSaving}
          confirmLabel="Simpan Konten"
        />
      }>
      <form
        id="deskripsi-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}>
        <div className="space-y-5">
          <FormField label="Deskripsi Mata Kuliah">
            <TiptapEditor
              value={form.deskripsi_mk}
              onChange={(v) => setForm((p) => ({ ...p, deskripsi_mk: v }))}
              placeholder="Tulis deskripsi mata kuliah..."
            />
          </FormField>
          <FormField label="Materi Pembelajaran / Pokok Bahasan">
            <TiptapEditor
              value={form.materi_pembelajaran}
              onChange={(v) =>
                setForm((p) => ({ ...p, materi_pembelajaran: v }))
              }
              placeholder="Tulis materi pembelajaran..."
            />
          </FormField>
          <FormField label="Daftar Pustaka / Referensi">
            <TiptapEditor
              value={form.daftar_pustaka}
              onChange={(v) => setForm((p) => ({ ...p, daftar_pustaka: v }))}
              placeholder="Tulis daftar pustaka..."
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// MODAL: TIM PENGAJARAN
// ==========================================
function TimPengajaranModal({
  isOpen,
  onClose,
  timList,
  onAdd,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  timList: TimDosenItem[];
  onAdd: (nama: string) => void;
  onDelete: (id: number) => void;
}) {
  const [nama, setNama] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tim Pengajaran"
      icon={<Users size={18} />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">
            Selesai
          </button>
        </div>
      }>
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nama.trim()) {
              onAdd(nama.trim());
              setNama("");
            }
          }}
          className="flex gap-2">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={`${inputCls} flex-1`}
            placeholder="Nama dosen pengampu..."
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5">
            <Plus size={14} /> Tambah
          </button>
        </form>
        {timList.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {timList.map((d, idx) => (
              <li
                key={d.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {d.nama}
                  </span>
                </div>
                <button
                  title="Hapus"
                  onClick={() => onDelete(d.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-6 text-sm text-gray-500 italic">
            Belum ada anggota tim.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// MODAL: MK SYARAT
// ==========================================
function MKSyaratModal({
  isOpen,
  onClose,
  mkList,
  onAdd,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  mkList: MKSyaratItem[];
  onAdd: (nama: string) => void;
  onDelete: (id: number) => void;
}) {
  const [nama, setNama] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mata Kuliah Syarat"
      icon={<CheckSquare size={18} />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">
            Selesai
          </button>
        </div>
      }>
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nama.trim()) {
              onAdd(nama.trim());
              setNama("");
            }
          }}
          className="flex gap-2">
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={`${inputCls} flex-1`}
            placeholder="Nama mata kuliah syarat..."
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5">
            <Plus size={14} /> Tambah
          </button>
        </form>
        {mkList.length > 0 ? (
          <ul className="space-y-2">
            {mkList.map((mk) => (
              <li
                key={mk.id}
                className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <CheckSquare size={15} className="text-amber-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {mk.nama}
                  </span>
                </div>
                <button
                  title="Edit"
                  onClick={() => onDelete(mk.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center py-6 text-sm text-gray-500 italic">
            Tidak ada mata kuliah syarat.
          </p>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// MODAL: SUB CPMK
// ==========================================
interface SubCpmkFormState {
  cpmk_id: number;
  deskripsi: string;
  bobot: number;
}

function SubCpmkModal({
  isOpen,
  onClose,
  cpmkList,
  subList,
  editingItem,
  onAdd,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  cpmkList: CPMK[];
  subList: SubCPMKLocal[];
  editingItem: SubCPMKLocal | null;
  onAdd: (d: SubCpmkFormState) => void;
  onUpdate: (id: number, d: SubCpmkFormState) => void;
}) {
  const [form, setForm] = useState<SubCpmkFormState>({
    cpmk_id: cpmkList[0]?.id || 0,
    deskripsi: "",
    bobot: 0,
  });
  useEffect(() => {
    if (isOpen) {
      if (editingItem)
        setForm({
          cpmk_id: editingItem.cpmk_id,
          deskripsi: editingItem.deskripsi,
          bobot: editingItem.bobot,
        });
      else setForm({ cpmk_id: cpmkList[0]?.id || 0, deskripsi: "", bobot: 0 });
    }
  }, [isOpen, editingItem, cpmkList]);

  const autoKode = (parentId: number) => {
    const parent = cpmkList.find((c) => c.id === Number(parentId));
    if (!parent) return "Sub-CPMK-?";
    const base = parent.kode_cpmk.replace(/^CPMK[-.]?/i, "");
    const count = subList.filter((s) => s.cpmk_id === Number(parentId)).length;
    return `Sub-CPMK-${base}.${editingItem ? "—" : count + 1}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) onUpdate(editingItem.id, form);
    else onAdd(form);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Sub-CPMK" : "Tambah Sub-CPMK"}
      icon={<Layers size={18} />}
      footer={
        <ModalFooter
          onCancel={onClose}
          formId="sub-cpmk-form"
          confirmLabel={editingItem ? "Update" : "Tambah"}
        />
      }>
      <form id="sub-cpmk-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField label="Parent CPMK" required>
            <select
              value={form.cpmk_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, cpmk_id: Number(e.target.value) }))
              }
              className={inputCls}>
              <option value={0}>-- Pilih CPMK --</option>
              {cpmkList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode_cpmk}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Kode Sub-CPMK (auto)">
            <input
              readOnly
              value={autoKode(form.cpmk_id)}
              className={`${inputCls} bg-gray-100 text-gray-500 cursor-not-allowed`}
            />
          </FormField>
          <FormField label="Bobot (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.bobot}
              onChange={(e) =>
                setForm((p) => ({ ...p, bobot: Number(e.target.value) }))
              }
              className={inputCls}
            />
          </FormField>
        </div>
        <FormField label="Deskripsi Sub-CPMK" required>
          <textarea
            value={form.deskripsi}
            onChange={(e) =>
              setForm((p) => ({ ...p, deskripsi: e.target.value }))
            }
            rows={3}
            className={textareaCls}
            placeholder="Kemampuan akhir yang diharapkan..."
          />
        </FormField>
      </form>
    </Modal>
  );
}

// ==========================================
// MODAL: PERTEMUAN
// ==========================================
const emptyPertemuan = (nextPekan = 1): PertemuanRow => ({
  id: uid(),
  pekan_mulai: nextPekan,
  pekan_sampai: nextPekan,
  sub_cpmk_id: "",
  indikator: "",
  teknik_kriteria: "",
  luring_bentuk: "",
  luring_metode: "",
  luring_waktu: "",
  daring_bentuk: "",
  daring_metode: "",
  daring_waktu: "",
  materi: "",
  bobot: 0,
});

function PertemuanModal({
  isOpen,
  onClose,
  initial,
  subCpmkList,
  onSave,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial: PertemuanRow | null;
  subCpmkList: SubCPMKLocal[];
  onSave: (form: PertemuanRow) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<PertemuanRow>(initial ?? emptyPertemuan());
  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);
  const set = (k: keyof PertemuanRow, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial?.db_id ? "Edit Pertemuan" : "Tambah Pertemuan"}
      icon={<ClipboardList size={18} />}
      maxWidth="max-w-3xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          formId="pertemuan-form"
          isSaving={isSaving}
          confirmLabel="Simpan Pertemuan"
        />
      }>
      <form
        id="pertemuan-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="space-y-5">
        {/* Pekan & Bobot */}
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Pekan Mulai" required>
            <input
              type="number"
              min={1}
              max={16}
              value={form.pekan_mulai}
              onChange={(e) => set("pekan_mulai", +e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Pekan Sampai" required>
            <input
              type="number"
              min={1}
              max={16}
              value={form.pekan_sampai}
              onChange={(e) => set("pekan_sampai", +e.target.value)}
              className={inputCls}
            />
          </FormField>
          <FormField label="Bobot Penilaian (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.bobot}
              onChange={(e) => set("bobot", +e.target.value)}
              className={inputCls}
            />
          </FormField>
        </div>
        {/* Sub CPMK */}
        <FormField label="Sub CPMK (Kemampuan Akhir)" required>
          <select
            value={form.sub_cpmk_id}
            onChange={(e) => set("sub_cpmk_id", e.target.value)}
            className={inputCls}>
            <option value="">-- Pilih Sub CPMK --</option>
            {subCpmkList.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.kode} — {s.deskripsi}
              </option>
            ))}
          </select>
        </FormField>
        {/* Penilaian */}
        <div className="border-2 border-indigo-100 rounded-xl overflow-hidden">
          <div className="bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-800 uppercase tracking-wide border-b border-indigo-100">
            Penilaian (Assessment)
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <FormField label="Indikator">
              <textarea
                rows={3}
                value={form.indikator}
                onChange={(e) => set("indikator", e.target.value)}
                placeholder="Indikator pencapaian..."
                className={textareaCls}
              />
            </FormField>
            <FormField label="Teknik & Kriteria">
              <textarea
                rows={3}
                value={form.teknik_kriteria}
                onChange={(e) => set("teknik_kriteria", e.target.value)}
                placeholder="Teknik & kriteria penilaian..."
                className={textareaCls}
              />
            </FormField>
          </div>
        </div>
        {/* Luring */}
        <div className="border-2 border-sky-100 rounded-xl overflow-hidden">
          <div className="bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 uppercase tracking-wide border-b border-sky-100">
            Luring — Offline System
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <FormField label="Bentuk">
              <input
                value={form.luring_bentuk}
                onChange={(e) => set("luring_bentuk", e.target.value)}
                placeholder="mis. Kuliah, Praktikum"
                className={inputCls}
              />
            </FormField>
            <FormField label="Metode">
              <input
                value={form.luring_metode}
                onChange={(e) => set("luring_metode", e.target.value)}
                placeholder="mis. Ceramah, PBL"
                className={inputCls}
              />
            </FormField>
            <FormField label="Estimasi Waktu">
              <input
                value={form.luring_waktu}
                onChange={(e) => set("luring_waktu", e.target.value)}
                placeholder="mis. 2×50 menit"
                className={inputCls}
              />
            </FormField>
          </div>
        </div>
        {/* Daring */}
        <div className="border-2 border-emerald-100 rounded-xl overflow-hidden">
          <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 uppercase tracking-wide border-b border-emerald-100">
            Daring — Online System
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <FormField label="Bentuk">
              <input
                value={form.daring_bentuk}
                onChange={(e) => set("daring_bentuk", e.target.value)}
                placeholder="mis. E-Learning"
                className={inputCls}
              />
            </FormField>
            <FormField label="Metode">
              <input
                value={form.daring_metode}
                onChange={(e) => set("daring_metode", e.target.value)}
                placeholder="mis. Flipped Classroom"
                className={inputCls}
              />
            </FormField>
            <FormField label="Estimasi Waktu">
              <input
                value={form.daring_waktu}
                onChange={(e) => set("daring_waktu", e.target.value)}
                placeholder="mis. 60 menit"
                className={inputCls}
              />
            </FormField>
          </div>
        </div>
        {/* Materi */}
        <FormField label="Materi Pembelajaran (Content)">
          <textarea
            rows={3}
            value={form.materi}
            onChange={(e) => set("materi", e.target.value)}
            placeholder="Topik dan sub-topik yang dibahas..."
            className={textareaCls}
          />
        </FormField>
      </form>
    </Modal>
  );
}

// ==========================================
// MODAL: DELETE CONFIRM
// ==========================================
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 text-center">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-red-100">
            <AlertTriangle
              className="text-red-600"
              size={32}
              strokeWidth={2.5}
            />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t-2 border-gray-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 border-r-2 border-gray-100 transition-all disabled:opacity-50">
            BATAL
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "YA, HAPUS"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PERTEMUAN TABLE
// ==========================================
function PertemuanTable({
  rows,
  subCpmkList,
  sisaBobot,
  onAdd,
  onUpdate,
  onDelete,
  isSaving,
}: {
  rows: PertemuanRow[];
  subCpmkList: SubCPMKLocal[];
  sisaBobot: number;
  onAdd: (f: PertemuanRow) => Promise<void>;
  onUpdate: (f: PertemuanRow) => Promise<void>;
  onDelete: (r: PertemuanRow) => Promise<void>;
  isSaving: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PertemuanRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PertemuanRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalBobot = rows.reduce((s, r) => s + Number(r.bobot || 0), 0);
  const isOver = totalBobot > 100,
    isDone = totalBobot === 100;
  const findSub = (id: string) => subCpmkList.find((s) => String(s.id) === id);

  const openAdd = () => {
    const next =
      rows.length > 0 ? Math.max(...rows.map((r) => r.pekan_sampai)) + 1 : 1;
    setEditing(emptyPertemuan(next));
    setModalOpen(true);
  };
  const openEdit = (row: PertemuanRow) => {
    setEditing({ ...row });
    setModalOpen(true);
  };

  const handleSave = async (form: PertemuanRow) => {
    const isEdit = rows.some((r) => r.id === form.id);
    if (!isEdit && form.bobot > sisaBobot) {
      alert(`Sisa bobot hanya ${sisaBobot}%.`);
      return;
    }
    if (isEdit) await onUpdate(form);
    else await onAdd(form);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const thCls =
    "border border-gray-400 bg-gray-200 px-2 py-2 text-center text-xs font-bold text-gray-800 uppercase leading-tight";
  const tdCls =
    "border border-gray-300 px-2 py-2 text-xs text-gray-800 align-top";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center no-print">
          <h3 className="font-bold text-base uppercase tracking-wide flex items-center gap-2">
            <ClipboardList size={20} /> Rencana Pembelajaran Mingguan
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "text-xs font-bold px-3 py-1 rounded-full border-2",
                isOver
                  ? "bg-red-100 text-red-700 border-red-300"
                  : isDone
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                  : "bg-white/20 text-white border-white/30",
              )}>
              {totalBobot}%{" "}
              {isOver ? "⚠️" : isDone ? "✓" : `/ sisa ${sisaBobot}%`}
            </span>
            <button
              onClick={openAdd}
              disabled={isOver || sisaBobot === 0}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                isOver || sisaBobot === 0
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}>
              <Plus size={16} /> Tambah Pertemuan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <ClipboardList
                size={40}
                className="mx-auto mb-3 text-indigo-300"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Belum Ada Pertemuan
              </h3>
              <p className="text-sm text-gray-600">
                Klik "Tambah Pertemuan" untuk memulai.
              </p>
            </div>
          ) : (
            <table
              className="w-full border-collapse"
              style={{ minWidth: "960px" }}>
              <thead>
                <tr>
                  <th rowSpan={2} className={clsx(thCls, "w-16")}>
                    Pertemuan Ke-
                  </th>
                  <th rowSpan={2} className={clsx(thCls, "w-44")}>
                    Sub CPMK
                    <br />
                    <span className="font-normal normal-case text-gray-600 text-xs">
                      (Kemampuan akhir)
                    </span>
                  </th>
                  <th colSpan={2} className={thCls}>
                    Penilaian (Assessment)
                  </th>
                  <th colSpan={2} className={thCls}>
                    Bentuk dan Metode Pembelajaran
                    <br />
                    <span className="font-normal normal-case text-gray-600 text-xs">
                      [estimasi waktu]
                    </span>
                  </th>
                  <th rowSpan={2} className={clsx(thCls, "w-44")}>
                    Materi Pembelajaran
                    <br />
                    <span className="font-normal normal-case text-gray-600 text-xs">
                      (Content)
                    </span>
                  </th>
                  <th rowSpan={2} className={clsx(thCls, "w-20")}>
                    Bobot
                    <br />
                    (%)
                  </th>
                  <th rowSpan={2} className={clsx(thCls, "w-20 no-print")}>
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th className={clsx(thCls, "w-32")}>Indikator</th>
                  <th className={clsx(thCls, "w-32")}>Teknik & Kriteria</th>
                  <th className={clsx(thCls, "w-32")}>Luring</th>
                  <th className={clsx(thCls, "w-32")}>Daring</th>
                </tr>
                <tr className="bg-gray-100">
                  {["1", "2", "3", "4", "5", "6", "7", "8", ""].map((n, i) => (
                    <td
                      key={i}
                      className="border border-gray-300 text-center text-xs font-bold text-gray-500 py-1">
                      {n}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const sub = findSub(row.sub_cpmk_id);
                  return (
                    <tr
                      key={row.id}
                      className={clsx(
                        "hover:bg-indigo-50/40 transition-colors",
                        idx % 2 !== 0 && "bg-slate-50/60",
                      )}>
                      <td
                        className={clsx(
                          tdCls,
                          "text-center font-black text-indigo-700 text-sm",
                        )}>
                        {row.pekan_mulai === row.pekan_sampai ? (
                          row.pekan_mulai
                        ) : (
                          <>
                            {row.pekan_mulai}
                            <span className="text-gray-400 font-normal mx-0.5">
                              –
                            </span>
                            {row.pekan_sampai}
                          </>
                        )}
                      </td>
                      <td className={tdCls}>
                        {sub ? (
                          <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                            {sub.kode}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {row.indikator || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {row.teknik_kriteria || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {row.luring_bentuk ||
                        row.luring_metode ||
                        row.luring_waktu ? (
                          <div className="space-y-0.5">
                            {row.luring_bentuk && (
                              <p>
                                <span className="font-bold text-sky-700">
                                  Bentuk:
                                </span>{" "}
                                {row.luring_bentuk}
                              </p>
                            )}
                            {row.luring_metode && (
                              <p>
                                <span className="font-bold text-sky-700">
                                  Metode:
                                </span>{" "}
                                {row.luring_metode}
                              </p>
                            )}
                            {row.luring_waktu && (
                              <span className="inline-block mt-1 bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                                ⏱ {row.luring_waktu}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {row.daring_bentuk ||
                        row.daring_metode ||
                        row.daring_waktu ? (
                          <div className="space-y-0.5">
                            {row.daring_bentuk && (
                              <p>
                                <span className="font-bold text-emerald-700">
                                  Bentuk:
                                </span>{" "}
                                {row.daring_bentuk}
                              </p>
                            )}
                            {row.daring_metode && (
                              <p>
                                <span className="font-bold text-emerald-700">
                                  Metode:
                                </span>{" "}
                                {row.daring_metode}
                              </p>
                            )}
                            {row.daring_waktu && (
                              <span className="inline-block mt-1 bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                                ⏱ {row.daring_waktu}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {row.materi || (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className={clsx(tdCls, "text-center")}>
                        <span
                          className={clsx(
                            "inline-block font-black text-sm px-2 py-0.5 rounded-lg",
                            row.bobot > 0
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-400",
                          )}>
                          {row.bobot}%
                        </span>
                      </td>
                      <td className={clsx(tdCls, "text-center no-print")}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Edit"
                            onClick={() => openEdit(row)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all">
                            <Edit size={14} />
                          </button>
                          <button
                            title="Hapus"
                            onClick={() => setDeleteTarget(row)}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 border-t-2 border-gray-400">
                  <td
                    colSpan={7}
                    className={clsx(
                      tdCls,
                      "text-right font-black text-gray-800 uppercase tracking-wide",
                    )}>
                    Total Bobot Penilaian
                  </td>
                  <td className={clsx(tdCls, "text-center")}>
                    <span
                      className={clsx(
                        "inline-block font-black text-sm px-3 py-0.5 rounded-lg",
                        isOver
                          ? "bg-rose-100 text-rose-700"
                          : isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-indigo-100 text-indigo-700",
                      )}>
                      {totalBobot}%
                    </span>
                  </td>
                  <td className={clsx(tdCls, "no-print")} />
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PertemuanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        subCpmkList={subCpmkList}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Hapus Pertemuan?"
        message={
          deleteTarget ? (
            <>
              Hapus pertemuan{" "}
              <strong>
                Pekan {deleteTarget.pekan_mulai}
                {deleteTarget.pekan_mulai !== deleteTarget.pekan_sampai
                  ? `–${deleteTarget.pekan_sampai}`
                  : ""}
              </strong>
              ?{" "}
              {deleteTarget.bobot > 0 && (
                <>
                  Bobot{" "}
                  <strong className="text-red-600">
                    {deleteTarget.bobot}%
                  </strong>{" "}
                  akan dikembalikan.
                </>
              )}
            </>
          ) : (
            ""
          )
        }
      />
    </>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function DetailRPSPage({
  params,
}: {
  params: Promise<{ id: string; id_matakuliah: string; id_rps: string }>;
}) {
  const { id, id_matakuliah, id_rps } = use(params);
  const searchParams = useSearchParams();
  const prodiId = searchParams.get("prodiId");

  const [rpsData, setRpsData] = useState<RPSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCpmkModal, setShowCpmkModal] = useState(false);
  const [dosenList, setDosenList] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal open states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeskripsiModal, setShowDeskripsiModal] = useState(false);
  const [showTimModal, setShowTimModal] = useState(false);
  const [showMkSyaratModal, setShowMkSyaratModal] = useState(false);
  const [showSubCpmkModal, setShowSubCpmkModal] = useState(false);
  const [editingSubCpmk, setEditingSubCpmk] = useState<SubCPMKLocal | null>(
    null,
  );
  const [deleteCpmkTarget, setDeleteCpmkTarget] = useState<number | null>(null);
  const [isDeletingCpmk, setIsDeletingCpmk] = useState(false);

  // Local state
  const [infoRPS, setInfoRPS] = useState<InfoRPSLocal>({
    nama_mk: "",
    kode_mk: "",
    sks: "",
    semester: "",
    rumpun_mk: "",
    tgl_penyusunan: "",
  });
  const [otorisasiLocal, setOtorisasiLocal] = useState<OtorisasiLocal>({
    dosen_pengampu: "",
    koordinator_mk: "",
    ketua_prodi: "",
  });
  const [localCpmk, setLocalCpmk] = useState<CPMK[]>([]);
  const [localSubCpmk, setLocalSubCpmk] = useState<SubCPMKLocal[]>([]);
  const [deskripsi, setDeskripsi] = useState<DeskripsiLocal>({
    deskripsi_mk: "",
    materi_pembelajaran: "",
    daftar_pustaka: "",
  });
  const [timPengajaran, setTimPengajaran] = useState<TimDosenItem[]>([]);
  const [mkSyarat, setMkSyarat] = useState<MKSyaratItem[]>([]);
  const [pertemuanRows, setPertemuanRows] = useState<PertemuanRow[]>([]);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const fetchRPSData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`);
      const json = await res.json();
      if (json.success) setRpsData(json.data);
      else setError(json.error || "Gagal memuat data");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id_rps, prodiId]);

  useEffect(() => {
    if (!rpsData) return;
    setInfoRPS({
      nama_mk: rpsData.matakuliah.nama,
      kode_mk: rpsData.matakuliah.kode_mk,
      sks: rpsData.matakuliah.sks,
      semester: rpsData.semester || "",
      rumpun_mk: rpsData.rumpun_mk || "",
      tgl_penyusunan: rpsData.tgl_penyusunan
        ? rpsData.tgl_penyusunan.split("T")[0]
        : "",
    });
    const parsePenyusun = (raw: any): string => {
      try {
        if (typeof raw === "string" && raw.startsWith("["))
          return JSON.parse(raw).join(", ");
        return String(raw || "");
      } catch {
        return String(raw || "");
      }
    };
    setOtorisasiLocal({
      dosen_pengampu: parsePenyusun(rpsData.nama_penyusun),
      koordinator_mk: rpsData.nama_koordinator || "",
      ketua_prodi: rpsData.nama_kaprodi || "",
    });
    setLocalCpmk(
      rpsData.cpmk.map((c) => ({ ...c, kode_ik: c.ik?.[0]?.kode_ik || "" })),
    );
    setLocalSubCpmk(
      rpsData.cpmk.flatMap((c) =>
        (c.sub_cpmk || []).map((sc, i) => ({
          id: c.id * 1000 + i,
          cpmk_id: c.id,
          kode: sc.kode,
          deskripsi: sc.deskripsi,
          bobot: 0,
        })),
      ),
    );
    setDeskripsi({
      deskripsi_mk: rpsData.deskripsi_mk || "",
      materi_pembelajaran: rpsData.materi_pembelajaran || "",
      daftar_pustaka: [rpsData.referensi_utama, rpsData.referensi_tambahan]
        .filter(Boolean)
        .join("\n\n"),
    });
    if (rpsData.tim_pengajaran)
      setTimPengajaran(
        rpsData.tim_pengajaran
          .split(",")
          .map((s, i) => ({ id: i + 1, nama: s.trim() }))
          .filter((t) => t.nama),
      );
    if (rpsData.matakuliah_syarat)
      setMkSyarat(
        rpsData.matakuliah_syarat
          .split(",")
          .map((s, i) => ({ id: i + 1, nama: s.trim() }))
          .filter((m) => m.nama),
      );
    if (rpsData.pertemuan) {
      setPertemuanRows(
        rpsData.pertemuan.map((p: any) => ({
          id: uid(),
          db_id: p.id,
          pekan_mulai: p.pekan_ke,
          pekan_sampai: p.pekan_ke,
          sub_cpmk_id: String(p.sub_cpmk_id || ""),
          indikator: p.indikator || "",
          teknik_kriteria: p.teknik_kriteria || "",
          luring_bentuk: p.bahan_kajian || "",
          luring_metode: p.metode_pembelajaran || "",
          luring_waktu: p.waktu || "",
          daring_bentuk: p.daring_bentuk || "",
          daring_metode: p.daring_metode || "",
          daring_waktu: p.daring_waktu || "",
          materi: p.materi_pembelajaran || p.pengalaman_belajar || "",
          bobot: Number(p.bobot_cpmk) || 0,
        })),
      );
    }
  }, [rpsData]);

  useEffect(() => {
    if (prodiId) {
      fetchRPSData();
      fetch(`/api/users/dosen?prodiId=${prodiId}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setDosenList(j.data);
        });
    }
  }, [id_rps, prodiId]);

  const totalBobot = useMemo(
    () => pertemuanRows.reduce((s, r) => s + Number(r.bobot || 0), 0),
    [pertemuanRows],
  );
  const sisaBobot = useMemo(() => Math.max(0, 100 - totalBobot), [totalBobot]);

  // Pertemuan CRUD
  const handleAddPertemuan = useCallback(
    async (form: PertemuanRow) => {
      setIsSaving(true);
      try {
        const res = await fetch(`/api/rps/pertemuan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rps_id: Number(id_rps),
            pekan_ke: form.pekan_mulai,
            bahan_kajian: form.luring_bentuk,
            pengalaman_belajar: form.materi,
            waktu: form.luring_waktu,
            bobot_nilai: form.bobot,
            metode_pembelajaran: form.luring_metode,
            indikator: form.indikator,
            teknik_kriteria: form.teknik_kriteria,
            materi_pembelajaran: form.materi,
            daring_bentuk: form.daring_bentuk,
            daring_metode: form.daring_metode,
            daring_waktu: form.daring_waktu,
            sub_cpmk_id: form.sub_cpmk_id ? Number(form.sub_cpmk_id) : null,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          setPertemuanRows((prev) => [
            ...prev,
            { ...form, id: uid(), db_id: json.data?.id },
          ]);
          showSuccess("Pertemuan berhasil ditambahkan.");
        } else throw new Error("Gagal menyimpan");
      } catch (e: any) {
        alert(e.message);
      } finally {
        setIsSaving(false);
      }
    },
    [id_rps, showSuccess],
  );

  const handleUpdatePertemuan = useCallback(
    async (form: PertemuanRow) => {
      setIsSaving(true);
      try {
        if (form.db_id) {
          const res = await fetch(
            `/api/rps/pertemuan/${form.db_id}?prodiId=${prodiId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pekan_ke: form.pekan_mulai,
                bahan_kajian: form.luring_bentuk,
                pengalaman_belajar: form.materi,
                waktu: form.luring_waktu,
                bobot_nilai: form.bobot,
                metode_pembelajaran: form.luring_metode,
                indikator: form.indikator,
                teknik_kriteria: form.teknik_kriteria,
                materi_pembelajaran: form.materi,
                daring_bentuk: form.daring_bentuk,
                daring_metode: form.daring_metode,
                daring_waktu: form.daring_waktu,
                sub_cpmk_id: form.sub_cpmk_id ? Number(form.sub_cpmk_id) : null,
              }),
            },
          );
        }
        setPertemuanRows((prev) =>
          prev.map((r) => (r.id === form.id ? form : r)),
        );
        showSuccess("Pertemuan berhasil diperbarui.");
      } catch (e: any) {
        alert(e.message);
      } finally {
        setIsSaving(false);
      }
    },
    [prodiId, showSuccess],
  );

  const handleDeletePertemuan = useCallback(
    async (row: PertemuanRow) => {
      if (row.db_id) {
        const res = await fetch(
          `/api/rps/pertemuan/${row.db_id}?prodiId=${prodiId}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Gagal menghapus");
      }
      setPertemuanRows((prev) => prev.filter((r) => r.id !== row.id));
      showSuccess("Pertemuan dihapus.");
    },
    [prodiId, showSuccess],
  );

  const handleSaveOtorisasi = async (formData: any) => {
    setIsSaving(true);
    try {
      const listPenyusun = (formData.penyusun || [])
        .map((p: any) => p.nama)
        .filter((n: string) => n?.trim());
      await fetch(`/api/rps/${id_rps}?prodiId=${prodiId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "otorisasi",
          data: {
            nama_penyusun: JSON.stringify(listPenyusun),
            nama_koordinator: formData.koordinator || "",
            nama_kaprodi: formData.kaprodi || "",
          },
        }),
      });
      await fetchRPSData();
      setEditingSection(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCpmk = async (formData: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/rps/cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rps_id: Number(id_rps),
          kode_cpmk: formData.kode,
          deskripsi: formData.deskripsi,
          // LOGIC BARU: Kirim ik_ids sebagai array ke API
          ik_ids: formData.ik_ids || [],
          bobot: formData.bobot ? Number(formData.bobot) : 0,
          prodiId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan CPMK");
      }

      // Refresh data agar tabel CPMK & IK terupdate
      await fetchRPSData();

      setShowCpmkModal(false);
      showSuccess("CPMK berhasil ditambahkan dengan pemetaan IK.");
    } catch (e: any) {
      console.error("Save CPMK Error:", e);
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen flex-col gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-gray-700 font-semibold text-lg">
            Memuat Data RPS...
          </p>
        </div>
      </DashboardLayout>
    );

  if (!rpsData) return null;
  const matkul = rpsData.matakuliah;

  return (
    <DashboardLayout>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #pdf-area,
          #pdf-area * {
            visibility: visible !important;
          }
          #pdf-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .no-print,
          nav,
          aside,
          button,
          header {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .pdf-page {
            page-break-after: always;
            display: block !important;
          }
        }
        #pdf-area .rps-table {
          width: 100%;
          border-collapse: collapse;
        }
        #pdf-area .rps-table th,
        #pdf-area .rps-table td {
          border: 1px solid #000;
          padding: 7px 8px;
          font-size: 10px;
          line-height: 1.4;
          color: #000;
          vertical-align: top;
        }
        #pdf-area .rps-table th {
          background-color: #d3d3d3;
          font-weight: bold;
          text-align: center;
        }
        #pdf-area .pdf-header-box {
          background: linear-gradient(to bottom, #7fa8d8, #a8c5e6);
          border: 2px solid #000;
          padding: 12px 15px;
        }
        #pdf-area .gray-cell {
          background-color: #d3d3d3;
        }
        #pdf-area .light-gray-cell {
          background-color: #f0f0f0;
        }
        .tiptap-display ul,
        .ProseMirror ul {
          list-style: disc;
          padding-left: 1.5rem;
        }
        .tiptap-display ol,
        .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.5rem;
        }
        .tiptap-display strong {
          font-weight: 700;
        }
        .tiptap-display em {
          font-style: italic;
        }
        .tiptap-display u {
          text-decoration: underline;
        }
        .tiptap-display p,
        .ProseMirror p {
          margin-bottom: 0.4rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>

      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen no-print">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <Link
            href={`/rps?prodiId=${prodiId}`}
            className="hover:text-indigo-600 font-medium">
            RPS
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link
            href={`/rps/${id}/list?prodiId=${prodiId}`}
            className="hover:text-indigo-600 font-medium">
            Daftar Mata Kuliah
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <Link
            href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`}
            className="hover:text-indigo-600 font-medium">
            Riwayat Versi
          </Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="font-bold text-gray-900">Detail RPS</span>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-indigo-50 rounded-xl border-2 border-indigo-100">
                <FileText size={28} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {matkul.nama}
                </h1>
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  Rencana Pembelajaran Semester
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold">
                    <BookOpen size={14} />
                    <span>{matkul.kode_mk}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">
                    <Award size={14} />
                    <span>{matkul.sks} SKS</span>
                  </div>
                  {rpsData.semester && (
                    <div className="inline-flex items-center gap-1.5 bg-purple-50 border-2 border-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">
                      <Calendar size={14} />
                      <span>Semester {rpsData.semester}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/rps/${id}/list/${id_matakuliah}?prodiId=${prodiId}`}>
                <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-xl border-2 border-gray-300 shadow-sm font-bold group">
                  <ChevronLeft
                    size={18}
                    className="group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  Kembali
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white px-5 py-2.5 rounded-xl shadow-md font-bold">
                <Printer size={18} /> Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 bg-green-50 border-2 border-green-300 text-green-900 px-5 py-3 rounded-xl">
            <CheckCircle2 size={18} className="text-green-600" />
            <span className="text-sm font-bold">{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-800 bg-red-50 p-4 rounded-xl border-2 border-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ===== INFO RPS + OTORISASI ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Info RPS */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <SectionHeader
              title="Informasi Mata Kuliah"
              icon={<BookOpen size={20} />}
              onEdit={() => setShowInfoModal(true)}
            />
            <div className="p-6 space-y-1">
              <InfoRow label="MATA KULIAH" value={infoRPS.nama_mk} />
              <InfoRow label="KODE" value={infoRPS.kode_mk} />
              <InfoRow
                label="BOBOT"
                value={infoRPS.sks ? `${infoRPS.sks} SKS` : "-"}
              />
              <InfoRow label="SEMESTER" value={infoRPS.semester || "-"} />
              <InfoRow label="RUMPUN MK" value={infoRPS.rumpun_mk || "-"} />
              <InfoRow
                label="TGL PENYUSUNAN"
                value={infoRPS.tgl_penyusunan || "-"}
              />
            </div>
          </div>

          {/* Otorisasi */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <SectionHeader
              title="Otorisasi"
              icon={<Users size={20} />}
              onEdit={() => setEditingSection("otorisasi")}
            />
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Dosen Pengampu",
                  value: otorisasiLocal.dosen_pengampu,
                  color: "bg-indigo-500",
                },
                {
                  label: "Koordinator MK",
                  value: otorisasiLocal.koordinator_mk,
                  color: "bg-blue-500",
                },
                {
                  label: "Ketua Prodi",
                  value: otorisasiLocal.ketua_prodi,
                  color: "bg-emerald-500",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={idx > 0 ? "pt-3 border-t border-gray-200" : ""}>
                  <strong className="text-gray-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className={`w-2 h-2 ${item.color} rounded-full`} />
                    {item.label}
                  </strong>
                  <p className="text-gray-900 text-sm font-semibold ml-3.5">
                    {item.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== CPL ===== */}
        {rpsData.cpl && rpsData.cpl.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
            <SectionHeader
              title="CPL-PRODI yang Dibebankan pada MK"
              icon={<Target size={20} />}
            />
            <div className="p-6 space-y-3">
              {rpsData.cpl.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <span className="font-bold text-indigo-700 bg-white border-2 border-indigo-300 px-3 py-1 rounded-lg text-sm whitespace-nowrap h-fit">
                    {item.kode}
                  </span>
                  <p className="text-gray-900 text-sm leading-relaxed font-medium">
                    {item.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== CPMK ===== */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
          <SectionHeader
            title="Capaian Pembelajaran (CPMK)"
            icon={<Target size={20} />}
            action={
              <button
                onClick={() => setShowCpmkModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                <Plus size={16} /> Tambah CPMK
              </button>
            }
          />
          <div className="p-6 bg-gray-50/30">
            {localCpmk.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase border border-gray-200 w-28">
                        Kode
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase border border-gray-200">
                        Deskripsi
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase border border-gray-200">
                        IK
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase border border-gray-200 w-24 text-center">
                        Bobot
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-800 uppercase border border-gray-200 w-20 text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {localCpmk.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 border border-gray-200">
                          <span className="font-bold text-white text-xs bg-gradient-to-r from-indigo-600 to-blue-600 px-2 py-1 rounded-lg">
                            {item.kode_cpmk}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-200">
                          {item.deskripsi}
                        </td>
                        <td className="px-4 py-3 border border-gray-200">
                          {item.ik && item.ik.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.ik.map((ik, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200 font-semibold">
                                  {ik.kode_ik}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-200">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200 font-bold text-sm">
                            {item.bobot_to_cpl || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-200">
                          <button
                            title="Hapus"
                            onClick={() => setDeleteCpmkTarget(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target size={40} className="mx-auto mb-3 text-indigo-300" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Belum Ada CPMK
                </h3>
                <p className="text-sm text-gray-600">
                  Klik "Tambah CPMK" untuk memulai.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== SUB CPMK ===== */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
          <SectionHeader
            title="Sub-CPMK"
            icon={<Layers size={20} />}
            action={
              <button
                onClick={() => {
                  setEditingSubCpmk(null);
                  setShowSubCpmkModal(true);
                }}
                disabled={localCpmk.length === 0}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                <Plus size={16} /> Tambah Sub-CPMK
              </button>
            }
          />
          <div className="p-6">
            {localSubCpmk.length > 0 ? (
              <div className="space-y-2">
                {localCpmk.map((parent) => {
                  const children = localSubCpmk.filter(
                    (s) => s.cpmk_id === parent.id,
                  );
                  if (children.length === 0) return null;
                  return (
                    <div
                      key={parent.id}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-indigo-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                        <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-lg">
                          {parent.kode_cpmk}
                        </span>
                        <span className="text-xs text-gray-700 truncate">
                          {parent.deskripsi}
                        </span>
                      </div>
                      {children.map((sc) => (
                        <div
                          key={sc.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg whitespace-nowrap">
                            {sc.kode}
                          </span>
                          <p className="text-sm text-gray-900 flex-1">
                            {sc.deskripsi}
                          </p>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            {sc.bobot}%
                          </span>
                          <div className="flex gap-1">
                            <button
                              title="Edit"
                              onClick={() => {
                                setEditingSubCpmk(sc);
                                setShowSubCpmkModal(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <PenLine size={14} />
                            </button>
                            <button
                              title="Hapus"
                              onClick={() => {
                                setLocalSubCpmk((p) =>
                                  p.filter((s) => s.id !== sc.id),
                                );
                                showSuccess("Sub-CPMK dihapus.");
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Layers size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-600">Belum ada Sub-CPMK.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== DESKRIPSI ===== */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden mb-6">
          <SectionHeader
            title="Konten Deskriptif"
            icon={<BookOpen size={20} />}
            onEdit={() => setShowDeskripsiModal(true)}
          />
          <div className="p-6 space-y-5">
            {[
              { label: "Deskripsi Mata Kuliah", value: deskripsi.deskripsi_mk },
              {
                label: "Materi Pembelajaran",
                value: deskripsi.materi_pembelajaran,
              },
              { label: "Daftar Pustaka", value: deskripsi.daftar_pustaka },
            ].map((item, idx) => (
              <div
                key={idx}
                className={idx > 0 ? "pt-4 border-t border-gray-200" : ""}>
                <strong className="text-xs text-gray-800 uppercase tracking-wider block mb-2 font-bold">
                  {item.label}
                </strong>
                {item.value ? (
                  <div
                    className="text-sm text-gray-900 leading-relaxed tiptap-display"
                    dangerouslySetInnerHTML={{ __html: item.value }}
                  />
                ) : (
                  <p className="text-sm text-gray-500 italic">-</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== TIM + MK SYARAT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tim Pengajaran */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <SectionHeader
              title="Tim Pengajaran"
              icon={<Users size={20} />}
              onEdit={() => setShowTimModal(true)}
            />
            <div className="p-6">
              {timPengajaran.length > 0 ? (
                <ul className="space-y-2">
                  {timPengajaran.map((d, idx) => (
                    <li
                      key={d.id}
                      className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {d.nama}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-6 text-sm text-gray-500 italic">
                  Belum ada anggota tim. Klik ikon edit.
                </p>
              )}
            </div>
          </div>

          {/* MK Syarat */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <SectionHeader
              title="Mata Kuliah Syarat"
              icon={<CheckSquare size={20} />}
              onEdit={() => setShowMkSyaratModal(true)}
            />
            <div className="p-6">
              {mkSyarat.length > 0 ? (
                <ul className="space-y-2">
                  {mkSyarat.map((mk) => (
                    <li
                      key={mk.id}
                      className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <CheckSquare size={15} className="text-amber-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {mk.nama}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-6 text-sm text-gray-500 italic">
                  Tidak ada mata kuliah syarat.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== BOBOT PROGRESS ===== */}
        <BobotProgressBar totalBobot={totalBobot} sisaBobot={sisaBobot} />

        {/* ===== RENCANA MINGGUAN ===== */}
        <div className="mb-6">
          <PertemuanTable
            rows={pertemuanRows}
            subCpmkList={localSubCpmk}
            sisaBobot={sisaBobot}
            onAdd={handleAddPertemuan}
            onUpdate={handleUpdatePertemuan}
            onDelete={handleDeletePertemuan}
            isSaving={isSaving}
          />
        </div>

        {/* INFO NOTE */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1 text-sm">
                Informasi
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Pastikan total bobot penilaian mencapai 100% sebelum mengekspor
                dokumen RPS. Gunakan tombol Edit pada setiap section untuk
                mengubah data melalui popup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          ALL MODALS
      ========================================== */}
      <InfoRPSModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        data={infoRPS}
        isSaving={isSaving}
        onSave={(d) => {
          setInfoRPS(d);
          setShowInfoModal(false);
          showSuccess("Info RPS diperbarui.");
        }}
      />

      <DeskripsiModal
        isOpen={showDeskripsiModal}
        onClose={() => setShowDeskripsiModal(false)}
        data={deskripsi}
        isSaving={isSaving}
        onSave={(d) => {
          setDeskripsi(d);
          setShowDeskripsiModal(false);
          showSuccess("Konten deskriptif disimpan.");
        }}
      />

      <TimPengajaranModal
        isOpen={showTimModal}
        onClose={() => setShowTimModal(false)}
        timList={timPengajaran}
        onAdd={(n) =>
          setTimPengajaran((p) => [...p, { id: Date.now(), nama: n }])
        }
        onDelete={(id) => setTimPengajaran((p) => p.filter((t) => t.id !== id))}
      />

      <MKSyaratModal
        isOpen={showMkSyaratModal}
        onClose={() => setShowMkSyaratModal(false)}
        mkList={mkSyarat}
        onAdd={(n) => setMkSyarat((p) => [...p, { id: Date.now(), nama: n }])}
        onDelete={(id) => setMkSyarat((p) => p.filter((m) => m.id !== id))}
      />

      <SubCpmkModal
        isOpen={showSubCpmkModal}
        onClose={() => {
          setShowSubCpmkModal(false);
          setEditingSubCpmk(null);
        }}
        cpmkList={localCpmk}
        subList={localSubCpmk}
        editingItem={editingSubCpmk}
        onAdd={(d) => {
          const parent = localCpmk.find((c) => c.id === Number(d.cpmk_id));
          if (!parent) return;
          const base = parent.kode_cpmk.replace(/^CPMK[-.]?/i, "");
          const count = localSubCpmk.filter(
            (s) => s.cpmk_id === Number(d.cpmk_id),
          ).length;
          setLocalSubCpmk((p) => [
            ...p,
            {
              id: Date.now(),
              cpmk_id: Number(d.cpmk_id),
              kode: `Sub-CPMK-${base}.${count + 1}`,
              deskripsi: d.deskripsi,
              bobot: d.bobot,
            },
          ]);
          showSuccess("Sub-CPMK ditambahkan.");
        }}
        onUpdate={(id, d) => {
          setLocalSubCpmk((p) =>
            p.map((s) =>
              s.id !== id
                ? s
                : {
                    ...s,
                    deskripsi: d.deskripsi,
                    bobot: d.bobot,
                    cpmk_id: Number(d.cpmk_id),
                  },
            ),
          );
          showSuccess("Sub-CPMK diperbarui.");
        }}
      />

      {editingSection === "otorisasi" && (
        <OtorisasiModal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveOtorisasi}
          isSaving={isSaving}
          dosenList={dosenList}
          initialData={rpsData}
        />
      )}

      <CpmkModal
        isOpen={showCpmkModal}
        onClose={() => setShowCpmkModal(false)}
        onSave={handleSaveCpmk}
        isSaving={isSaving}
        nextNo={rpsData?.cpmk?.length ? rpsData.cpmk.length + 1 : 1}
        // LOGIC SAPU BERSIH: Filter IK yang cpmk_id nya masih kosong (null)
        availableIks={rpsData.available_iks?.filter((ik: any) => !ik.cpmk_id) || []}
      />

      <DeleteConfirmModal
        isOpen={deleteCpmkTarget !== null}
        onClose={() => setDeleteCpmkTarget(null)}
        isDeleting={isDeletingCpmk}
        title="Hapus CPMK?"
        message="CPMK dan semua Sub-CPMK terkait akan dihapus. Tindakan ini tidak dapat dibatalkan."
        onConfirm={async () => {
          if (!deleteCpmkTarget) return;
          setIsDeletingCpmk(true);
          setLocalCpmk((p) => p.filter((c) => c.id !== deleteCpmkTarget));
          setLocalSubCpmk((p) =>
            p.filter((s) => s.cpmk_id !== deleteCpmkTarget),
          );
          setDeleteCpmkTarget(null);
          setIsDeletingCpmk(false);
          showSuccess("CPMK dihapus.");
        }}
      />

      {/* PDF AREA */}
      <div id="pdf-area" className="hidden print:block bg-white text-black">
        <div style={{ padding: "15mm" }}>
          <div className="pdf-header-box" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ width: "75px", height: "75px", flexShrink: 0 }}>
                <img
                  src="/logo-unhas.png"
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                  FAKULTAS TEKNIK
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}>
                  PROGRAM STUDI TEKNIK INFORMATIKA - S1
                </div>
                <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                  RENCANA PEMBELAJARAN SEMESTER
                </div>
                <div style={{ fontSize: "10px", fontStyle: "italic" }}>
                  ( SEMESTER LECTURE PLAN )
                </div>
              </div>
            </div>
          </div>
          <table className="rps-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Mata Kuliah (MK)</th>
                <th style={{ width: "15%" }}>KODE</th>
                <th style={{ width: "15%" }}>Rumpun MK</th>
                <th style={{ width: "10%" }}>BOBOT (SKS)</th>
                <th style={{ width: "10%" }}>SEMESTER</th>
                <th style={{ width: "25%" }}>Tgl Penyusunan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}>
                  {infoRPS.nama_mk}
                </td>
                <td style={{ textAlign: "center", fontSize: "11px" }}>
                  {infoRPS.kode_mk}
                </td>
                <td style={{ textAlign: "center", fontSize: "11px" }}>
                  {infoRPS.rumpun_mk || "-"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}>
                  {infoRPS.sks}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}>
                  {infoRPS.semester || "-"}
                </td>
                <td style={{ textAlign: "center", fontSize: "11px" }}>
                  {infoRPS.tgl_penyusunan || "-"}
                </td>
              </tr>
            </tbody>
          </table>
          <table className="rps-table">
            <tbody>
              <tr>
                <td
                  rowSpan={2}
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    textAlign: "center",
                    verticalAlign: "middle",
                    padding: "10px 8px",
                    fontSize: "11px",
                  }}>
                  OTORITAS
                </td>
                <td
                  style={{
                    width: "28.33%",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    backgroundColor: "#d3d3d3",
                    fontSize: "11px",
                  }}>
                  Dosen Pengembang RPS
                </td>
                <td
                  style={{
                    width: "28.33%",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    backgroundColor: "#d3d3d3",
                    fontSize: "11px",
                  }}>
                  Koordinator MK
                </td>
                <td
                  style={{
                    width: "28.33%",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    backgroundColor: "#d3d3d3",
                    fontSize: "11px",
                  }}>
                  Ketua PRODI
                </td>
              </tr>
              <tr style={{ height: "60px" }}>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "bottom",
                    padding: "8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}>
                  {otorisasiLocal.dosen_pengampu || "-"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "bottom",
                    padding: "8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}>
                  {otorisasiLocal.koordinator_mk || "-"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    verticalAlign: "bottom",
                    padding: "8px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}>
                  {otorisasiLocal.ketua_prodi || "-"}
                </td>
              </tr>
            </tbody>
          </table>
          <table className="rps-table">
            <tbody>
              <tr>
                <td
                  rowSpan={999}
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    textAlign: "center",
                    verticalAlign: "top",
                    padding: "10px 8px",
                    fontSize: "11px",
                    whiteSpace: "pre-line",
                  }}>
                  {"Capaian\nPembelajaran\nMata Kuliah"}
                </td>
                <td
                  colSpan={2}
                  className="gray-cell"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    fontSize: "11px",
                  }}>
                  CPL-PRODI yang dibebankan pada MK
                </td>
              </tr>
              {rpsData.cpl && rpsData.cpl.length > 0 ? (
                rpsData.cpl.map((cpl, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        width: "10%",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "11px",
                      }}
                      className="light-gray-cell">
                      {cpl.kode}:
                    </td>
                    <td style={{ fontSize: "11px" }}>{cpl.deskripsi}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      fontSize: "11px",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}>
                    Belum ada data CPL
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan={2}
                  className="gray-cell"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    fontSize: "11px",
                  }}>
                  IK ⇒ Capaian Pembelajaran Mata Kuliah (CPMK)
                </td>
              </tr>
              {localCpmk.map((cpmk, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                    className="light-gray-cell">
                    {cpmk.ik?.[0]?.kode_ik || `IK-${idx + 1}`}
                  </td>
                  <td style={{ fontSize: "11px" }}>
                    <strong>{cpmk.kode_cpmk}</strong>: {cpmk.deskripsi}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  className="gray-cell"
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "7px 8px",
                    fontSize: "11px",
                  }}>
                  CPMK ⇒ Sub-CPMK
                </td>
              </tr>
              {localCpmk.map((cpmk, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                    className="light-gray-cell">
                    {cpmk.kode_cpmk}
                  </td>
                  <td style={{ fontSize: "11px" }}>
                    <strong>SUB-{cpmk.kode_cpmk}:</strong>{" "}
                    {localSubCpmk
                      .filter((s) => s.cpmk_id === cpmk.id)
                      .map((s) => s.deskripsi)
                      .join("; ") || cpmk.deskripsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="rps-table">
            <tbody>
              <tr>
                <td
                  rowSpan={2}
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    textAlign: "center",
                    verticalAlign: "top",
                    padding: "10px 8px",
                    fontSize: "11px",
                    whiteSpace: "pre-line",
                  }}>
                  {"Deskripsi\nMatakuliah"}
                </td>
                <td
                  style={{
                    fontSize: "11px",
                    padding: "8px",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: deskripsi.deskripsi_mk || "-",
                  }}
                />
              </tr>
              <tr>
                <td style={{ padding: 0 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            border: "none",
                            padding: "6px 8px 2px",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}>
                          Materi Pembelajaran / Pokok Bahasan
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            border: "none",
                            padding: "2px 8px 8px",
                            fontSize: "11px",
                            lineHeight: "1.8",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: deskripsi.materi_pembelajaran || "-",
                          }}
                        />
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="rps-table">
            <tbody>
              <tr>
                <td
                  rowSpan={2}
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    textAlign: "center",
                    verticalAlign: "top",
                    padding: "10px 8px",
                    fontSize: "11px",
                  }}>
                  Referensi
                </td>
                <td
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "6px 8px",
                    backgroundColor: "#f0f0f0",
                  }}>
                  Daftar Pustaka
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontSize: "11px",
                    padding: "6px 8px",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: deskripsi.daftar_pustaka || "-",
                  }}
                />
              </tr>
            </tbody>
          </table>
          <table className="rps-table">
            <tbody>
              <tr>
                <td
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Tim Pengajaran
                </td>
                <td style={{ fontSize: "11px", padding: "8px" }}>
                  {timPengajaran.map((t) => t.nama).join(", ") || "-"}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Mata kuliah syarat
                </td>
                <td style={{ fontSize: "11px", padding: "8px" }}>
                  {mkSyarat.map((m) => m.nama).join(", ") || "-"}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="pdf-page" style={{ pageBreakBefore: "always" }}>
            <table className="rps-table">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: "6%" }}>
                    Pertemuan Ke-
                  </th>
                  <th rowSpan={2} style={{ width: "16%" }}>
                    Sub CPMK
                  </th>
                  <th colSpan={2}>Penilaian (Assessment)</th>
                  <th colSpan={2}>Bentuk dan Metode Pembelajaran</th>
                  <th rowSpan={2} style={{ width: "18%" }}>
                    Materi Pembelajaran
                  </th>
                  <th rowSpan={2} style={{ width: "7%" }}>
                    Bobot (%)
                  </th>
                </tr>
                <tr>
                  <th style={{ width: "12%" }}>Indikator</th>
                  <th style={{ width: "13%" }}>Teknik & Kriteria</th>
                  <th style={{ width: "14%" }}>Luring (Offline)</th>
                  <th style={{ width: "14%" }}>Daring (Online)</th>
                </tr>
              </thead>
              <tbody>
                {pertemuanRows.map((p) => {
                  const sub = localSubCpmk.find(
                    (s) => String(s.id) === p.sub_cpmk_id,
                  );
                  return (
                    <tr key={p.id}>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "10px",
                        }}>
                        {p.pekan_mulai === p.pekan_sampai
                          ? p.pekan_mulai
                          : `${p.pekan_mulai}–${p.pekan_sampai}`}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {sub?.kode || "-"}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {p.indikator || "-"}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {p.teknik_kriteria || "-"}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {p.luring_bentuk && (
                          <div>
                            <strong>Bentuk:</strong> {p.luring_bentuk}
                          </div>
                        )}
                        {p.luring_metode && (
                          <div>
                            <strong>Metode:</strong> {p.luring_metode}
                          </div>
                        )}
                        {p.luring_waktu && (
                          <div>
                            <strong>Waktu:</strong> {p.luring_waktu}
                          </div>
                        )}
                        {!p.luring_bentuk &&
                          !p.luring_metode &&
                          !p.luring_waktu &&
                          "-"}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {p.daring_bentuk && (
                          <div>
                            <strong>Bentuk:</strong> {p.daring_bentuk}
                          </div>
                        )}
                        {p.daring_metode && (
                          <div>
                            <strong>Metode:</strong> {p.daring_metode}
                          </div>
                        )}
                        {p.daring_waktu && (
                          <div>
                            <strong>Waktu:</strong> {p.daring_waktu}
                          </div>
                        )}
                        {!p.daring_bentuk &&
                          !p.daring_metode &&
                          !p.daring_waktu &&
                          "-"}
                      </td>
                      <td style={{ fontSize: "10px", padding: "6px 8px" }}>
                        {p.materi || "-"}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "10px",
                        }}>
                        {totalBobot}%
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "right",
                      fontWeight: "bold",
                      fontSize: "10px",
                      padding: "6px 8px",
                    }}>
                    Total Bobot Penilaian
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}>
                    {totalBobot}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
