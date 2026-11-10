import { DEFAULT_BRAND_COLORS } from "@shared/brand";
import {
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Globe2,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Megaphone,
  PackageCheck,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Store,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import {
  businessTypeOptions,
  createEmptyPartnerForm,
  domainOptions,
  dropshipModeOptions,
  ecommerceOptions,
  fulfillmentServiceOptions,
  initialSizeOptions,
  monthlyVolumeOptions,
  needsBrandCustomization,
  needsDropship,
  needsFulfillment,
  needsStorefront,
  needsWholesale,
  ownInventoryOptions,
  partnershipOptions,
  platformOptions,
  productOptions,
  purchaseModeOptions,
  storefrontFeatureOptions,
  storefrontTypeOptions,
  toPartnerSubmissionData,
  type PartnerFormData,
} from "@shared/partner";
import { VialMockup } from "./VialMockup";
import "./partner.css";

type FieldErrors = Record<string, string>;
type UploadStatus = "uploading" | "done" | "error";

interface LocalLogo {
  name: string;
  size: number;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  id?: string;
  error?: string;
}

interface LocalAsset {
  localId: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  id?: string;
  error?: string;
}

interface UploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
}

interface DirectUploadResponse extends UploadResponse {
  uploadUrl: string;
}

const steps = [
  { number: 1, label: "About Your Business" },
  { number: 2, label: "Partnership Preferences" },
  { number: 3, label: "Brand Customization" },
  { number: 4, label: "Review & Submit" },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?[-()\d\s.]{7,}$/;
const acceptedAssetExtensions = /\.(png|jpe?g|webp|gif|pdf|doc|docx)$/i;
const acceptedLogoExtensions = /\.(png|jpe?g)$/i;
const acceptedAssetTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function discardUpload(id?: string) {
  if (id)
    void fetch(`/api/partner/upload/${encodeURIComponent(id)}`, {
      method: "DELETE",
      keepalive: true,
    }).catch(() => {});
}

function createRequestId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `partner-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this file."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const encoded = result.includes(",") ? result.split(",", 2)[1] : result;
      if (!encoded) reject(new Error("Unable to prepare this file."));
      else resolve(encoded);
    };
    reader.readAsDataURL(file);
  });
}

async function uploadFile(
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResponse> {
  const directRequest = await fetch("/api/partner/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    }),
  });

  if (directRequest.status !== 404) {
    const body = (await directRequest.json().catch(() => null)) as
      | ({ error?: string } & Partial<DirectUploadResponse>)
      | null;
    if (!directRequest.ok || !body?.id || !body.uploadUrl) {
      throw new Error(
        body?.error ||
          "We could not prepare this file upload. Please try again."
      );
    }
    const direct: DirectUploadResponse = {
      id: body.id,
      uploadUrl: body.uploadUrl,
      name: body.name || file.name,
      type: body.type || file.type || "application/octet-stream",
      size: body.size || file.size,
    };
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", direct.uploadUrl);
      request.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );
      request.upload.onprogress = event => {
        if (event.lengthComputable)
          onProgress(
            Math.max(1, Math.round((event.loaded / event.total) * 100))
          );
      };
      request.onerror = () => {
        discardUpload(direct.id);
        reject(
          new Error(
            "Upload failed. Please check your connection and try again."
          )
        );
      };
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          onProgress(100);
          resolve(direct);
        } else {
          discardUpload(direct.id);
          reject(new Error("We could not upload this file. Please try again."));
        }
      };
      request.send(file);
    });
  }

  const data = await readFileAsBase64(file);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/partner/upload");
    request.setRequestHeader("Content-Type", "application/json");
    request.upload.onprogress = event => {
      if (event.lengthComputable)
        onProgress(Math.max(1, Math.round((event.loaded / event.total) * 100)));
    };
    request.onerror = () =>
      reject(
        new Error("Upload failed. Please check your connection and try again.")
      );
    request.onload = () => {
      let body: { error?: string } & Partial<UploadResponse> = {};
      try {
        body = JSON.parse(request.responseText) as {
          error?: string;
        } & Partial<UploadResponse>;
      } catch {
        // The generic message below is more helpful than a parsing error.
      }
      if (
        request.status >= 200 &&
        request.status < 300 &&
        body.id &&
        body.name &&
        body.type
      ) {
        onProgress(100);
        resolve(body as UploadResponse);
      } else {
        reject(
          new Error(
            body.error || "We could not upload this file. Please try again."
          )
        );
      }
    };
    request.send(
      JSON.stringify({
        name: file.name,
        type: file.type || "application/octet-stream",
        data,
      })
    );
  });
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return phonePattern.test(value) && digits.length >= 7 && digits.length <= 15;
}

function isValidDomain(value: string) {
  if (!value || value.length > 253 || /[/:?#\s]/.test(value)) return false;
  const labels = value.split(".");
  return (
    labels.length >= 2 &&
    labels.every(label =>
      /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)
    )
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function optionIcon(value: string) {
  if (value === "Turnkey Business") return <Store aria-hidden="true" />;
  if (value === "Product Supply and 3PL Fulfilment Only")
    return <Truck aria-hidden="true" />;
  if (value === "Wholesale and Contract Manufacturing")
    return <PackageCheck aria-hidden="true" />;
  if (value === "503a FDA Approved Products and Medical Supplies")
    return <ShieldCheck aria-hidden="true" />;
  if (value === "Education and Training")
    return <GraduationCap aria-hidden="true" />;
  if (value === "Payment Processing")
    return <CircleDollarSign aria-hidden="true" />;
  if (value === "Marketing and Compliance Resources")
    return <Megaphone aria-hidden="true" />;
  return <Plus aria-hidden="true" />;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  inputRef?: (element: HTMLInputElement | null) => void;
}

function TextField({
  label,
  hint,
  error,
  id,
  required,
  inputRef,
  ...props
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="partner-field">
      <label htmlFor={id}>
        {label} {required && <span className="partner-required">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="partner-field__hint">
          {hint}
        </p>
      )}
      <input
        id={id}
        ref={inputRef}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        {...props}
      />
      {error && (
        <p className="partner-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  inputRef?: (element: HTMLTextAreaElement | null) => void;
}

function TextAreaField({
  label,
  hint,
  error,
  id,
  required,
  inputRef,
  ...props
}: TextAreaFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="partner-field">
      <label htmlFor={id}>
        {label} {required && <span className="partner-required">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="partner-field__hint">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        ref={inputRef}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        {...props}
      />
      {error && (
        <p className="partner-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface ChoiceGroupProps {
  legend: string;
  hint?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  name: string;
  fieldRef?: (element: HTMLElement | null) => void;
  required?: boolean;
}

function ChoiceGroup({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  name,
  fieldRef,
  required,
}: ChoiceGroupProps) {
  const errorId = `${name}-error`;
  return (
    <fieldset
      className="partner-choice-group"
      ref={fieldRef}
      tabIndex={-1}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>
        {legend} {required && <span className="partner-required">*</span>}
      </legend>
      {hint && <p className="partner-field__hint">{hint}</p>}
      <div className="partner-choice-grid">
        {options.map(option => (
          <label
            key={option}
            className={`partner-choice ${value === option ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className="partner-choice__control" aria-hidden="true" />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="partner-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

interface MultiChoiceProps {
  legend: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  name: string;
  fieldRef?: (element: HTMLElement | null) => void;
  hint?: string;
  required?: boolean;
}

function MultiChoice({
  legend,
  options,
  values,
  onChange,
  error,
  name,
  fieldRef,
  hint,
  required,
}: MultiChoiceProps) {
  const errorId = `${name}-error`;
  return (
    <fieldset
      className="partner-choice-group"
      ref={fieldRef}
      tabIndex={-1}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>
        {legend} {required && <span className="partner-required">*</span>}
      </legend>
      {hint && <p className="partner-field__hint">{hint}</p>}
      <div className="partner-choice-grid partner-choice-grid--multi">
        {options.map(option => {
          const checked = values.includes(option);
          return (
            <label
              key={option}
              className={`partner-choice ${checked ? "is-selected" : ""}`}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(toggleValue(values, option))}
              />
              <span className="partner-choice__control" aria-hidden="true">
                <Check />
              </span>
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className="partner-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="partner-summary__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SummaryCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="partner-summary-card">
      <div className="partner-summary-card__header">
        <h3>{title}</h3>
        <button type="button" className="partner-edit-link" onClick={onEdit}>
          <Pencil aria-hidden="true" /> Edit
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

export default function PartnerInquiry() {
  const [data, setData] = useState<PartnerFormData>(() =>
    createEmptyPartnerForm()
  );
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [logo, setLogo] = useState<LocalLogo | null>(null);
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [assetError, setAssetError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [requestId] = useState(createRequestId);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const activeUploads = useRef(new Set<string>());
  const uploadIds = useRef(new Map<string, string>());
  const finished = useRef(false);
  const submissionInFlight = useRef(false);

  const brandRequired = needsBrandCustomization(data);
  const storefrontRequired = needsStorefront(data);
  const dropshipRequired = needsDropship(data);
  const fulfillmentRequired = needsFulfillment(data);
  const wholesaleRequired = needsWholesale(data);
  const filteredProducts = productOptions.filter(product =>
    product.toLowerCase().includes(productSearch.trim().toLowerCase())
  );

  useEffect(() => {
    return () => {
      if (logo?.previewUrl) URL.revokeObjectURL(logo.previewUrl);
    };
  }, [logo?.previewUrl]);

  useEffect(() => {
    const abandon = () => {
      if (finished.current || submissionInFlight.current) return;
      for (const id of uploadIds.current.values()) discardUpload(id);
      activeUploads.current.clear();
      uploadIds.current.clear();
    };
    window.addEventListener("pagehide", abandon);
    return () => {
      window.removeEventListener("pagehide", abandon);
      abandon();
    };
  }, []);

  const registerField = (name: string) => (element: HTMLElement | null) => {
    fieldRefs.current[name] = element;
  };

  const setField = <K extends keyof PartnerFormData>(
    field: K,
    value: PartnerFormData[K]
  ) => {
    setData(current => ({ ...current, [field]: value }));
    setErrors(current => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const focusField = (field: string) => {
    requestAnimationFrame(() => fieldRefs.current[field]?.focus());
  };

  const validateStep = (step: 1 | 2 | 3 | 4): FieldErrors => {
    const next: FieldErrors = {};
    if (step === 1) {
      if (!data.company.trim())
        next.company = "Enter your business or company name.";
      if (!data.firstName.trim()) next.firstName = "Enter your first name.";
      if (!data.lastName.trim()) next.lastName = "Enter your last name.";
      if (!emailPattern.test(data.email.trim()))
        next.email = "Enter a valid business email address.";
      if (!isValidPhone(data.phone.trim()))
        next.phone = "Enter a valid phone number.";
      if (!data.hasWebsite)
        next.hasWebsite = "Select the option that best describes your website.";
      if (data.hasWebsite === "Yes" && !isValidUrl(data.website.trim())) {
        next.website =
          "Enter a complete website address beginning with http:// or https://.";
      }
      if (!data.businessTypes.length)
        next.businessTypes = "Select at least one business type.";
      if (data.businessTypes.includes("Other") && !data.businessOther.trim()) {
        next.businessOther = "Tell us what type of business you operate.";
      }
    }

    if (step === 2) {
      if (!data.partnerships.length)
        next.partnerships = "Select at least one partnership opportunity.";
      if (
        data.partnerships.includes("Other Partnership Opportunity") &&
        !data.partnershipOther.trim()
      ) {
        next.partnershipOther = "Tell us more about your partnership idea.";
      }

      if (storefrontRequired) {
        if (!data.storefrontType)
          next.storefrontType = "Choose the storefront direction you need.";
        if (!data.ownsDomain)
          next.ownsDomain = "Tell us whether you already own a domain.";
        if (data.ownsDomain === "Yes" && !isValidDomain(data.domain.trim())) {
          next.domain = "Enter a valid domain without http:// or https://.";
        }
        if (!data.migration)
          next.migration = "Choose whether an existing site needs migration.";
        if (data.migration === "Yes" && !isValidUrl(data.migrationUrl.trim())) {
          next.migrationUrl =
            "Enter a complete website address beginning with http:// or https://.";
        }
        if (data.features.includes("Other") && !data.featuresOther.trim()) {
          next.featuresOther = "Describe the additional storefront feature.";
        }
      }

      if (dropshipRequired) {
        if (!data.dropshipMode)
          next.dropshipMode = "Choose how you would like orders fulfilled.";
        if (!data.ecommerce)
          next.ecommerce =
            "Choose the option that best describes your ecommerce site.";
        if (data.ecommerce === "Yes" && !data.platform)
          next.platform = "Select your ecommerce platform.";
      }

      if (fulfillmentRequired) {
        if (!data.fulfillmentServices.length)
          next.fulfillmentServices = "Select at least one fulfillment service.";
        if (
          data.fulfillmentServices.includes("Other") &&
          !data.fulfillmentOther.trim()
        ) {
          next.fulfillmentOther =
            "Describe the additional fulfillment service.";
        }
        if (!data.ownInventory)
          next.ownInventory =
            "Tell us whether you will supply your own inventory.";
      }

      if (wholesaleRequired) {
        if (!data.purchaseMode)
          next.purchaseMode = "Select how you plan to purchase products.";
        if (!data.initialSize)
          next.initialSize = "Select an estimated initial order size.";
      }
    }

    if (step === 3 && brandRequired) {
      if (logo?.status === "uploading")
        next.logo = "Wait for your logo upload to finish before continuing.";
      if (logo?.status === "error")
        next.logo = "Remove or replace the logo that could not be uploaded.";
      if (assets.some(asset => asset.status === "uploading")) {
        next.assets =
          "Wait for your additional asset uploads to finish before continuing.";
      }
      if (assets.some(asset => asset.status === "error")) {
        next.assets =
          "Remove or replace any additional asset that could not be uploaded.";
      }
    }

    if (step === 4 && !confirmed) {
      next.confirmed =
        "Please confirm that the information is accurate before submitting.";
    }
    return next;
  };

  const moveToStep = (step: 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
    setErrors({});
    setSubmitError("");
    window.setTimeout(() => {
      document
        .getElementById("partner-form-title")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (Object.keys(validation).length) {
      setErrors(validation);
      focusField(Object.keys(validation)[0]);
      return;
    }
    if (currentStep === 1) moveToStep(2);
    else if (currentStep === 2) moveToStep(brandRequired ? 3 : 4);
    else if (currentStep === 3) moveToStep(4);
  };

  const handleBack = () => {
    if (currentStep === 2) moveToStep(1);
    if (currentStep === 3) moveToStep(2);
    if (currentStep === 4) moveToStep(brandRequired ? 3 : 2);
  };

  const setPartnerships = (partnerships: string[]) =>
    setField("partnerships", partnerships);

  const chooseLogo = (file?: File) => {
    if (!file) return;
    if (assets.length >= 10) {
      setErrors(current => ({
        ...current,
        logo: "A logo plus additional assets may not exceed 10 files in total.",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(current => ({
        ...current,
        logo: "Logo files must be 5 MB or smaller.",
      }));
      return;
    }
    if (
      !(
        ["image/png", "image/jpeg"].includes(file.type) ||
        acceptedLogoExtensions.test(file.name)
      )
    ) {
      setErrors(current => ({
        ...current,
        logo: "Upload a PNG, JPG, or JPEG logo only.",
      }));
      return;
    }
    if (
      file.size + assets.reduce((total, asset) => total + asset.size, 0) >
      25 * 1024 * 1024
    ) {
      setErrors(current => ({
        ...current,
        logo: "Your logo and additional assets may not exceed 25 MB combined.",
      }));
      return;
    }
    if (logo) {
      activeUploads.current.delete(logo.previewUrl);
      discardUpload(logo.id || uploadIds.current.get(logo.previewUrl));
      uploadIds.current.delete(logo.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    activeUploads.current.add(previewUrl);
    setErrors(current => {
      const next = { ...current };
      delete next.logo;
      return next;
    });
    setLogo({
      name: file.name,
      size: file.size,
      previewUrl,
      progress: 1,
      status: "uploading",
    });
    void uploadFile(file, progress => {
      setLogo(current =>
        current?.previewUrl === previewUrl ? { ...current, progress } : current
      );
    })
      .then(result => {
        if (!activeUploads.current.has(previewUrl)) {
          discardUpload(result.id);
          return;
        }
        uploadIds.current.set(previewUrl, result.id);
        setLogo(current =>
          current?.previewUrl === previewUrl
            ? { ...current, progress: 100, status: "done", id: result.id }
            : current
        );
      })
      .catch((error: Error) => {
        setLogo(current =>
          current?.previewUrl === previewUrl
            ? { ...current, progress: 0, status: "error", error: error.message }
            : current
        );
      });
  };

  const onLogoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    chooseLogo(event.dataTransfer.files[0]);
  };

  const removeLogo = () => {
    if (logo) {
      activeUploads.current.delete(logo.previewUrl);
      discardUpload(logo.id || uploadIds.current.get(logo.previewUrl));
      uploadIds.current.delete(logo.previewUrl);
    }
    setLogo(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const resetMockup = () => {
    removeLogo();
    setData(current => ({
      ...current,
      ...DEFAULT_BRAND_COLORS,
      colorsNotFinal: false,
    }));
  };

  const addAssets = (files: FileList | File[]) => {
    const allFiles = Array.from(files);
    const currentTotal =
      (logo?.size || 0) +
      assets.reduce((total, asset) => total + asset.size, 0);
    let runningTotal = currentTotal;
    let room = (logo ? 9 : 10) - assets.length;
    const accepted: File[] = [];
    const rejected: string[] = [];

    allFiles.forEach(file => {
      const validType =
        acceptedAssetTypes.includes(file.type) ||
        (!file.type && acceptedAssetExtensions.test(file.name));
      if (!validType)
        rejected.push(`${file.name}: use an image, PDF, DOC, or DOCX file.`);
      else if (file.size > 5 * 1024 * 1024)
        rejected.push(`${file.name}: files must be 5 MB or smaller.`);
      else if (room <= 0)
        rejected.push(
          "A logo plus additional assets may not exceed 10 files in total."
        );
      else if (runningTotal + file.size > 25 * 1024 * 1024)
        rejected.push(
          "Your logo and additional assets may not exceed 25 MB combined."
        );
      else {
        accepted.push(file);
        runningTotal += file.size;
        room -= 1;
      }
    });

    setAssetError(rejected.join(" "));
    if (!accepted.length) return;

    const queued = accepted.map(file => ({
      localId: createRequestId(),
      name: file.name,
      size: file.size,
      progress: 1,
      status: "uploading" as const,
    }));
    setAssets(current => [...current, ...queued]);

    queued.forEach((queuedAsset, index) => {
      activeUploads.current.add(queuedAsset.localId);
      const file = accepted[index];
      void uploadFile(file, progress => {
        setAssets(current =>
          current.map(asset =>
            asset.localId === queuedAsset.localId
              ? { ...asset, progress }
              : asset
          )
        );
      })
        .then(result => {
          if (!activeUploads.current.has(queuedAsset.localId)) {
            discardUpload(result.id);
            return;
          }
          uploadIds.current.set(queuedAsset.localId, result.id);
          setAssets(current =>
            current.map(asset =>
              asset.localId === queuedAsset.localId
                ? { ...asset, progress: 100, status: "done", id: result.id }
                : asset
            )
          );
        })
        .catch((error: Error) => {
          setAssets(current =>
            current.map(asset =>
              asset.localId === queuedAsset.localId
                ? {
                    ...asset,
                    status: "error",
                    progress: 0,
                    error: error.message,
                  }
                : asset
            )
          );
        });
    });
  };

  const handleAssetInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addAssets(event.target.files);
    event.target.value = "";
  };

  const removeAsset = (localId: string) => {
    activeUploads.current.delete(localId);
    discardUpload(
      assets.find(asset => asset.localId === localId)?.id ||
        uploadIds.current.get(localId)
    );
    uploadIds.current.delete(localId);
    setAssets(current => current.filter(asset => asset.localId !== localId));
  };

  const handleSubmit = async () => {
    if (submissionInFlight.current || finished.current) return;
    const validation = validateStep(4);
    if (Object.keys(validation).length) {
      setErrors(validation);
      focusField(Object.keys(validation)[0]);
      return;
    }
    if (
      brandRequired &&
      (logo?.status === "uploading" ||
        assets.some(asset => asset.status === "uploading"))
    ) {
      setSubmitError(
        "Please wait for all selected uploads to finish before submitting."
      );
      return;
    }
    if (
      brandRequired &&
      (logo?.status === "error" ||
        assets.some(asset => asset.status === "error"))
    ) {
      setSubmitError(
        "Remove or replace any file that could not be uploaded before submitting."
      );
      return;
    }

    submissionInFlight.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/partner/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          data: toPartnerSubmissionData(data),
          logoId: brandRequired ? (logo?.id ?? null) : null,
          assetIds: brandRequired
            ? assets.flatMap(asset => (asset.id ? [asset.id] : []))
            : [],
          confirmed: true,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        id?: string;
        submittedAt?: string;
        error?: string;
      };
      if (!response.ok || !body.id)
        throw new Error(
          body.error || "We could not submit your inquiry. Please try again."
        );
      if (!brandRequired)
        for (const id of uploadIds.current.values()) discardUpload(id);
      finished.current = true;
      setSubmittedAt(body.submittedAt || new Date().toISOString());
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not submit your inquiry. Please try again."
      );
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <>
      <div className="partner-form__heading">
        <span className="partner-eyebrow">Step 01</span>
        <h2 id="partner-form-title">Tell Us About Your Business</h2>
        <p>
          Let&apos;s start with a few details so our team can better understand
          your business.
        </p>
      </div>
      <div className="partner-form__grid partner-form__grid--two">
        <TextField
          id="company"
          label="Business / Company Name"
          value={data.company}
          onChange={event => setField("company", event.target.value)}
          error={errors.company}
          inputRef={registerField("company")}
          autoComplete="organization"
          required
        />
        <div className="partner-form__empty" aria-hidden="true" />
        <TextField
          id="firstName"
          label="First Name"
          value={data.firstName}
          onChange={event => setField("firstName", event.target.value)}
          error={errors.firstName}
          inputRef={registerField("firstName")}
          autoComplete="given-name"
          required
        />
        <TextField
          id="lastName"
          label="Last Name"
          value={data.lastName}
          onChange={event => setField("lastName", event.target.value)}
          error={errors.lastName}
          inputRef={registerField("lastName")}
          autoComplete="family-name"
          required
        />
        <TextField
          id="email"
          label="Business Email Address"
          type="email"
          value={data.email}
          onChange={event => setField("email", event.target.value)}
          error={errors.email}
          inputRef={registerField("email")}
          autoComplete="email"
          required
        />
        <TextField
          id="phone"
          label="Phone Number"
          type="tel"
          value={data.phone}
          onChange={event => setField("phone", event.target.value)}
          error={errors.phone}
          inputRef={registerField("phone")}
          autoComplete="tel"
          required
        />
      </div>
      <ChoiceGroup
        legend="Do You Currently Have a Website?"
        options={["Yes", "No"]}
        value={data.hasWebsite}
        onChange={value =>
          setField("hasWebsite", value as PartnerFormData["hasWebsite"])
        }
        error={errors.hasWebsite}
        name="hasWebsite"
        fieldRef={registerField("hasWebsite")}
        required
      />
      {data.hasWebsite === "Yes" && (
        <TextField
          id="website"
          label="Current Website URL"
          type="url"
          placeholder="https://yourbusiness.com"
          value={data.website}
          onChange={event => setField("website", event.target.value)}
          error={errors.website}
          inputRef={registerField("website")}
          required
        />
      )}
      <MultiChoice
        legend="What type of business do you operate?"
        options={businessTypeOptions}
        values={data.businessTypes}
        onChange={value => setField("businessTypes", value)}
        error={errors.businessTypes}
        name="businessTypes"
        fieldRef={registerField("businessTypes")}
        required
      />
      {data.businessTypes.includes("Other") && (
        <TextField
          id="businessOther"
          label="Tell us about your business type"
          value={data.businessOther}
          onChange={event => setField("businessOther", event.target.value)}
          error={errors.businessOther}
          inputRef={registerField("businessOther")}
          required
        />
      )}
    </>
  );

  const renderPartnershipCards = () => (
    <fieldset
      className="partner-partnerships"
      ref={registerField("partnerships")}
      tabIndex={-1}
      aria-describedby={errors.partnerships ? "partnerships-error" : undefined}
    >
      <legend>
        Which partnership opportunities are you interested in?{" "}
        <span className="partner-required">*</span>
      </legend>
      <p className="partner-field__hint">
        Select every option you would like our team to explore with you.
      </p>
      <div className="partner-option-grid">
        {partnershipOptions.map(option => {
          const selected = data.partnerships.includes(option.value);
          return (
            <label
              key={option.value}
              className={`partner-option-card ${selected ? "is-selected" : ""}`}
            >
              <input
                type="checkbox"
                name="partnerships"
                value={option.value}
                aria-label={option.value}
                checked={selected}
                onChange={() =>
                  setPartnerships(toggleValue(data.partnerships, option.value))
                }
              />
              <span className="partner-option-card__check" aria-hidden="true">
                <Check />
              </span>
              <span className="partner-option-card__icon">
                {optionIcon(option.value)}
              </span>
              <span className="partner-option-card__content">
                <strong>{option.value}</strong>
                <span>{option.description}</span>
                {"clarification" in option && (
                  <span className="partner-option-card__clarification">
                    {option.clarification}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {errors.partnerships && (
        <p className="partner-error" id="partnerships-error" role="alert">
          {errors.partnerships}
        </p>
      )}
    </fieldset>
  );

  const renderProductPicker = () => (
    <fieldset
      className="partner-product-picker"
      ref={registerField("products")}
      tabIndex={-1}
      aria-describedby={errors.products ? "products-error" : undefined}
    >
      <legend>
        What products or product categories are you interested in?{" "}
        <span className="partner-field__optional">Optional</span>
      </legend>
      <p className="partner-field__hint">
        Search and select all that apply from the current catalog.
      </p>
      <div className="partner-product-picker__selected" aria-live="polite">
        {data.products.length ? (
          data.products.map(product => (
            <button
              type="button"
              className="partner-product-chip"
              key={product}
              onClick={() =>
                setField("products", toggleValue(data.products, product))
              }
            >
              {product} <X aria-hidden="true" />
              <span className="sr-only">Remove {product}</span>
            </button>
          ))
        ) : (
          <span className="partner-product-picker__placeholder">
            No products selected yet
          </span>
        )}
      </div>
      <label className="partner-search" htmlFor="productSearch">
        <span className="sr-only">Search products or categories</span>
        <input
          id="productSearch"
          type="search"
          placeholder="Search products or categories"
          value={productSearch}
          onChange={event => setProductSearch(event.target.value)}
        />
      </label>
      <div
        className="partner-product-picker__options"
        aria-label="Product catalog options"
      >
        {filteredProducts.length ? (
          filteredProducts.map(product => {
            const checked = data.products.includes(product);
            return (
              <label
                key={product}
                className={`partner-product-option ${checked ? "is-selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setField("products", toggleValue(data.products, product))
                  }
                />
                <span
                  className="partner-product-option__check"
                  aria-hidden="true"
                >
                  <Check />
                </span>
                <span>{product}</span>
              </label>
            );
          })
        ) : (
          <p className="partner-product-picker__empty">
            No catalog matches. Try a different search.
          </p>
        )}
      </div>
      {errors.products && (
        <p className="partner-error" id="products-error" role="alert">
          {errors.products}
        </p>
      )}
    </fieldset>
  );

  const renderStorefrontFields = () =>
    storefrontRequired && (
      <div className="partner-conditional" aria-label="Storefront requirements">
        <div className="partner-conditional__heading">
          <Globe2 aria-hidden="true" />
          <div>
            <span>Storefront requirements</span>
            <p>
              Help us understand the platform and capabilities your brand needs.
            </p>
          </div>
        </div>
        <ChoiceGroup
          legend="What type of storefront are you looking for?"
          options={storefrontTypeOptions}
          value={data.storefrontType}
          onChange={value => setField("storefrontType", value)}
          error={errors.storefrontType}
          name="storefrontType"
          fieldRef={registerField("storefrontType")}
          required
        />
        <ChoiceGroup
          legend="Do you already own a domain?"
          options={domainOptions}
          value={data.ownsDomain}
          onChange={value => setField("ownsDomain", value)}
          error={errors.ownsDomain}
          name="ownsDomain"
          fieldRef={registerField("ownsDomain")}
          required
        />
        {data.ownsDomain === "Yes" && (
          <TextField
            id="domain"
            label="Domain name"
            placeholder="yourbusiness.com"
            value={data.domain}
            onChange={event => setField("domain", event.target.value)}
            error={errors.domain}
            inputRef={registerField("domain")}
            required
          />
        )}
        <ChoiceGroup
          legend="Do you have an existing website that needs to be redesigned or migrated?"
          options={["Yes", "No", "Not Sure"]}
          value={data.migration}
          onChange={value => setField("migration", value)}
          error={errors.migration}
          name="migration"
          fieldRef={registerField("migration")}
          required
        />
        {data.migration === "Yes" && (
          <TextField
            id="migrationUrl"
            label="Existing website URL"
            type="url"
            placeholder="https://yourbusiness.com"
            value={data.migrationUrl}
            onChange={event => setField("migrationUrl", event.target.value)}
            error={errors.migrationUrl}
            inputRef={registerField("migrationUrl")}
            required
          />
        )}
        <MultiChoice
          legend="What features would you like your storefront to include?"
          options={storefrontFeatureOptions}
          values={data.features}
          onChange={value => setField("features", value)}
          error={errors.features}
          name="features"
          fieldRef={registerField("features")}
        />
        {data.features.includes("Other") && (
          <TextField
            id="featuresOther"
            label="Other storefront feature"
            value={data.featuresOther}
            onChange={event => setField("featuresOther", event.target.value)}
            error={errors.featuresOther}
            inputRef={registerField("featuresOther")}
            required
          />
        )}
      </div>
    );

  const renderDropshipFields = () =>
    dropshipRequired && (
      <div
        className="partner-conditional"
        aria-label="Dropshipping requirements"
      >
        <div className="partner-conditional__heading">
          <Truck aria-hidden="true" />
          <div>
            <span>Dropshipping fulfillment</span>
            <p>Choose how orders should reach your customers.</p>
          </div>
        </div>
        <ChoiceGroup
          legend="How would you like orders to be fulfilled?"
          options={dropshipModeOptions}
          value={data.dropshipMode}
          onChange={value => setField("dropshipMode", value)}
          error={errors.dropshipMode}
          name="dropshipMode"
          fieldRef={registerField("dropshipMode")}
          required
        />
        <ChoiceGroup
          legend="Do you currently have an ecommerce website?"
          options={ecommerceOptions}
          value={data.ecommerce}
          onChange={value => setField("ecommerce", value)}
          error={errors.ecommerce}
          name="ecommerce"
          fieldRef={registerField("ecommerce")}
          required
        />
        {data.ecommerce === "Yes" && (
          <ChoiceGroup
            legend="Which platform do you use?"
            options={platformOptions}
            value={data.platform}
            onChange={value => setField("platform", value)}
            error={errors.platform}
            name="platform"
            fieldRef={registerField("platform")}
            required
          />
        )}
      </div>
    );

  const renderFulfillmentFields = () =>
    fulfillmentRequired && (
      <div
        className="partner-conditional"
        aria-label="3PL fulfillment requirements"
      >
        <div className="partner-conditional__heading">
          <Layers3 aria-hidden="true" />
          <div>
            <span>3PL requirements</span>
            <p>
              Tell us which operational services could support your business.
            </p>
          </div>
        </div>
        <MultiChoice
          legend="What fulfillment services are you interested in?"
          options={fulfillmentServiceOptions}
          values={data.fulfillmentServices}
          onChange={value => setField("fulfillmentServices", value)}
          error={errors.fulfillmentServices}
          name="fulfillmentServices"
          fieldRef={registerField("fulfillmentServices")}
          required
        />
        {data.fulfillmentServices.includes("Other") && (
          <TextField
            id="fulfillmentOther"
            label="Other fulfillment service"
            value={data.fulfillmentOther}
            onChange={event => setField("fulfillmentOther", event.target.value)}
            error={errors.fulfillmentOther}
            inputRef={registerField("fulfillmentOther")}
            required
          />
        )}
        <ChoiceGroup
          legend="Will you be supplying your own inventory?"
          options={ownInventoryOptions}
          value={data.ownInventory}
          onChange={value => setField("ownInventory", value)}
          error={errors.ownInventory}
          name="ownInventory"
          fieldRef={registerField("ownInventory")}
          required
        />
      </div>
    );

  const renderWholesaleFields = () =>
    wholesaleRequired && (
      <div className="partner-conditional" aria-label="Wholesale requirements">
        <div className="partner-conditional__heading">
          <CircleDollarSign aria-hidden="true" />
          <div>
            <span>Wholesale requirements</span>
            <p>
              We&apos;ll use these details to understand the fit for your supply
              needs.
            </p>
          </div>
        </div>
        <ChoiceGroup
          legend="How are you planning to purchase products?"
          options={purchaseModeOptions}
          value={data.purchaseMode}
          onChange={value => setField("purchaseMode", value)}
          error={errors.purchaseMode}
          name="purchaseMode"
          fieldRef={registerField("purchaseMode")}
          required
        />
        <ChoiceGroup
          legend="Estimated Initial Order Size"
          options={initialSizeOptions}
          value={data.initialSize}
          onChange={value => setField("initialSize", value)}
          error={errors.initialSize}
          name="initialSize"
          fieldRef={registerField("initialSize")}
          required
        />
      </div>
    );

  const renderStepTwo = () => (
    <>
      <div className="partner-form__heading">
        <span className="partner-eyebrow">Step 02</span>
        <h2 id="partner-form-title">
          How Would You Like to Partner With Peplogix?
        </h2>
        <p>
          Tell us what you&apos;re looking for. We&apos;ll explore the right
          solution for your business.
        </p>
      </div>
      {renderPartnershipCards()}
      {data.partnerships.includes("Other Partnership Opportunity") && (
        <TextAreaField
          id="partnershipOther"
          label="Tell us more about your partnership idea"
          value={data.partnershipOther}
          onChange={event => setField("partnershipOther", event.target.value)}
          error={errors.partnershipOther}
          inputRef={registerField("partnershipOther")}
          rows={4}
          required
        />
      )}
      <div className="partner-divider" />
      {renderProductPicker()}
      <div className="partner-form__grid partner-form__grid--two">
        <div className="partner-field">
          <label htmlFor="monthlyVolume">
            Estimated Monthly Order Volume{" "}
            <span className="partner-field__optional">Optional</span>
          </label>
          <div className="partner-select-wrap">
            <select
              id="monthlyVolume"
              value={data.monthlyVolume}
              onChange={event => setField("monthlyVolume", event.target.value)}
            >
              <option value="">Select an estimate</option>
              {monthlyVolumeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </div>
        </div>
        <TextAreaField
          id="needs"
          label="Tell Us More About Your Business Needs"
          value={data.needs}
          onChange={event => setField("needs", event.target.value)}
          placeholder="Share any additional details about your business, goals, or the partnership you're envisioning."
          rows={3}
        />
      </div>
      {(storefrontRequired ||
        dropshipRequired ||
        fulfillmentRequired ||
        wholesaleRequired) && <div className="partner-divider" />}
      {renderStorefrontFields()}
      {renderDropshipFields()}
      {renderFulfillmentFields()}
      {renderWholesaleFields()}
    </>
  );

  const renderStepThree = () => (
    <>
      <div className="partner-form__heading">
        <span className="partner-eyebrow">Step 03</span>
        <h2 id="partner-form-title">Make It Your Brand.</h2>
        <p>
          Upload your logo, select your brand colors, and explore how your
          products could look with your own identity.
        </p>
      </div>
      <div className="partner-brand-layout">
        <div className="partner-brand-form">
          <section
            className="partner-brand-section"
            aria-labelledby="logo-title"
          >
            <div className="partner-brand-section__title">
              <span className="partner-brand-section__number">A</span>
              <div>
                <h3 id="logo-title">Upload Your Logo</h3>
                <p>PNG, JPG, or JPEG, up to 5 MB.</p>
              </div>
            </div>
            {!logo ? (
              <div
                className="partner-logo-dropzone"
                onDragOver={event => event.preventDefault()}
                onDrop={onLogoDrop}
              >
                <UploadCloud aria-hidden="true" />
                <strong>Drag and drop your logo here</strong>
                <span>or</span>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Choose a file
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  onChange={event => chooseLogo(event.target.files?.[0])}
                  aria-label="Upload a logo"
                />
              </div>
            ) : (
              <div className="partner-logo-upload">
                <img src={logo.previewUrl} alt="Uploaded logo preview" />
                <div className="partner-logo-upload__details">
                  <strong>{logo.name}</strong>
                  {logo.status === "uploading" && (
                    <span>Uploading {logo.progress}%</span>
                  )}
                  {logo.status === "done" && (
                    <span className="partner-upload-success">
                      <CheckCircle2 aria-hidden="true" /> Uploaded securely
                    </span>
                  )}
                  {logo.status === "error" && (
                    <span className="partner-error">{logo.error}</span>
                  )}
                  {logo.status === "uploading" && (
                    <span className="partner-upload-progress">
                      <i style={{ width: `${logo.progress}%` }} />
                    </span>
                  )}
                </div>
                <div className="partner-logo-upload__actions">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Replace
                  </button>
                  <button type="button" onClick={removeLogo}>
                    Remove
                  </button>
                </div>
                <input
                  ref={logoInputRef}
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  onChange={event => chooseLogo(event.target.files?.[0])}
                  aria-label="Replace logo"
                />
              </div>
            )}
            {errors.logo && (
              <p className="partner-error" role="alert">
                {errors.logo}
              </p>
            )}
          </section>
          <section
            className="partner-brand-section"
            aria-labelledby="colors-title"
          >
            <div className="partner-brand-section__title">
              <span className="partner-brand-section__number">B</span>
              <div>
                <h3 id="colors-title">What are your brand colors?</h3>
                <p>These colors update your live concept instantly.</p>
              </div>
            </div>
            <label className="partner-toggle">
              <input
                type="checkbox"
                checked={data.colorsNotFinal}
                onChange={event =>
                  setField("colorsNotFinal", event.target.checked)
                }
              />
              <span className="partner-toggle__track" aria-hidden="true">
                <span />
              </span>
              <span>My brand colors are not finalized yet.</span>
            </label>
            <div
              className={`partner-colors ${data.colorsNotFinal ? "is-muted" : ""}`}
              aria-disabled={data.colorsNotFinal}
            >
              {(
                [
                  ["primaryColor", "Primary Brand Color"],
                  ["secondaryColor", "Secondary Brand Color"],
                  ["accentColor", "Accent Color"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="partner-color-field">
                  <span>{label}</span>
                  <span className="partner-color-field__input">
                    <input
                      type="color"
                      value={data[field]}
                      disabled={data.colorsNotFinal}
                      onChange={event => setField(field, event.target.value)}
                      aria-label={label}
                    />
                    <code>{data[field].toUpperCase()}</code>
                  </span>
                </label>
              ))}
            </div>
          </section>
          <section
            className="partner-brand-section"
            aria-labelledby="assets-title"
          >
            <div className="partner-brand-section__title">
              <span className="partner-brand-section__number">D</span>
              <div>
                <h3 id="assets-title">Additional Brand Assets</h3>
                <p>
                  Optional: PNG, JPG, WebP, GIF, PDF, DOC, or DOCX. 5 MB each;
                  up to 10 files and 25 MB combined, including your logo.
                </p>
              </div>
            </div>
            <input
              ref={assetInputRef}
              type="file"
              multiple
              className="sr-only"
              accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleAssetInput}
              aria-label="Upload additional brand assets"
            />
            <button
              type="button"
              className="partner-asset-picker"
              onClick={() => assetInputRef.current?.click()}
            >
              <UploadCloud aria-hidden="true" /> Add files
            </button>
            {assetError && (
              <p className="partner-error" role="alert">
                {assetError}
              </p>
            )}
            {assets.length > 0 && (
              <ul
                className="partner-asset-list"
                aria-label="Additional asset uploads"
              >
                {assets.map(asset => (
                  <li key={asset.localId}>
                    <div className="partner-asset-list__main">
                      <span className="partner-asset-list__icon">
                        <Building2 aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{asset.name}</strong>
                        <small>
                          {formatBytes(asset.size)} ·{" "}
                          {asset.status === "done"
                            ? "Uploaded"
                            : asset.status === "error"
                              ? "Needs attention"
                              : `Uploading ${asset.progress}%`}
                        </small>
                      </span>
                    </div>
                    {asset.status === "uploading" && (
                      <span className="partner-upload-progress">
                        <i style={{ width: `${asset.progress}%` }} />
                      </span>
                    )}
                    {asset.status === "error" && (
                      <p className="partner-error">{asset.error}</p>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${asset.name}`}
                      onClick={() => removeAsset(asset.localId)}
                    >
                      <X aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.assets && (
              <p className="partner-error" role="alert">
                {errors.assets}
              </p>
            )}
          </section>
          <TextAreaField
            id="brandingInstructions"
            label="Additional Branding Instructions"
            value={data.brandingInstructions}
            onChange={event =>
              setField("brandingInstructions", event.target.value)
            }
            placeholder="Tell us more about your brand, design preferences, or any specific requirements for your custom products or storefront."
            rows={4}
          />
        </div>
        <aside className="partner-mockup-card">
          <div className="partner-mockup-card__heading">
            <span className="partner-eyebrow">C · Live Preview</span>
            <button type="button" onClick={resetMockup}>
              Reset mockup
            </button>
          </div>
          <VialMockup
            logoUrl={logo?.previewUrl}
            primaryColor={data.primaryColor}
            secondaryColor={data.secondaryColor}
            accentColor={data.accentColor}
            colorsNotFinal={data.colorsNotFinal}
          />
          <p>
            This is a visual branding mockup only. It is not a finalized product
            label, approved packaging, or an actual product specification.
          </p>
        </aside>
      </div>
    </>
  );

  const renderStepFour = () => (
    <>
      <div className="partner-form__heading">
        <span className="partner-eyebrow">Step 04</span>
        <h2 id="partner-form-title">You&apos;re One Step Closer.</h2>
        <p>
          Review your information below and submit your partnership inquiry. Our
          team will review your business and reach out to discuss the next
          steps.
        </p>
      </div>
      <div className="partner-summary-grid">
        <SummaryCard title="Business Information" onEdit={() => moveToStep(1)}>
          <SummaryRow label="Company" value={data.company} />
          <SummaryRow
            label="Contact"
            value={`${data.firstName} ${data.lastName}`}
          />
          <SummaryRow label="Business email" value={data.email} />
          <SummaryRow label="Phone" value={data.phone} />
          <SummaryRow
            label="Business type"
            value={[
              ...data.businessTypes.filter(type => type !== "Other"),
              data.businessTypes.includes("Other") ? data.businessOther : "",
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </SummaryCard>
        <SummaryCard title="Website Information" onEdit={() => moveToStep(1)}>
          <SummaryRow label="Has website" value={data.hasWebsite} />
          <SummaryRow
            label="Website"
            value={
              data.hasWebsite === "Yes" ? data.website : "Looking to build one"
            }
          />
        </SummaryCard>
        <SummaryCard
          title="Partnership Preferences"
          onEdit={() => moveToStep(2)}
        >
          <SummaryRow
            label="Opportunities"
            value={data.partnerships.join(", ")}
          />
          <SummaryRow
            label="Partnership idea"
            value={
              data.partnerships.includes("Other Partnership Opportunity")
                ? data.partnershipOther
                : undefined
            }
          />
          <SummaryRow label="Monthly volume" value={data.monthlyVolume} />
        </SummaryCard>
        <SummaryCard title="Product Interests" onEdit={() => moveToStep(2)}>
          <SummaryRow
            label="Products / categories"
            value={data.products.join(", ")}
          />
        </SummaryCard>
        <SummaryCard
          title="Brand Customization"
          onEdit={() => moveToStep(brandRequired ? 3 : 2)}
        >
          {brandRequired ? (
            <>
              <SummaryRow
                label="Logo"
                value={logo?.status === "done" ? logo.name : undefined}
              />
              <SummaryRow
                label="Brand colors"
                value={
                  data.colorsNotFinal
                    ? "Not finalized yet"
                    : `${data.primaryColor.toUpperCase()} · ${data.secondaryColor.toUpperCase()} · ${data.accentColor.toUpperCase()}`
                }
              />
              <SummaryRow
                label="Additional assets"
                value={assets
                  .filter(asset => asset.status === "done")
                  .map(asset => asset.name)
                  .join(", ")}
              />
              <SummaryRow
                label="Instructions"
                value={data.brandingInstructions}
              />
            </>
          ) : (
            <p className="partner-summary-card__skip">
              Brand customization was skipped because the selected services do
              not require it. You can add a white-label or branded service to
              update this.
            </p>
          )}
        </SummaryCard>
        {(storefrontRequired ||
          dropshipRequired ||
          fulfillmentRequired ||
          wholesaleRequired) && (
          <SummaryCard
            title="Fulfillment Requirements"
            onEdit={() => moveToStep(2)}
          >
            {storefrontRequired && (
              <>
                <SummaryRow label="Storefront" value={data.storefrontType} />
                <SummaryRow
                  label="Domain"
                  value={
                    data.ownsDomain === "Yes" ? data.domain : data.ownsDomain
                  }
                />
                <SummaryRow
                  label="Migration"
                  value={
                    data.migration === "Yes"
                      ? data.migrationUrl
                      : data.migration
                  }
                />
                <SummaryRow
                  label="Storefront features"
                  value={[
                    ...data.features.filter(feature => feature !== "Other"),
                    data.features.includes("Other") ? data.featuresOther : "",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </>
            )}
            {dropshipRequired && (
              <>
                <SummaryRow
                  label="Dropshipping mode"
                  value={data.dropshipMode}
                />
                <SummaryRow label="Ecommerce" value={data.ecommerce} />
                <SummaryRow
                  label="Platform"
                  value={data.ecommerce === "Yes" ? data.platform : undefined}
                />
              </>
            )}
            {fulfillmentRequired && (
              <>
                <SummaryRow
                  label="3PL services"
                  value={[
                    ...data.fulfillmentServices.filter(
                      service => service !== "Other"
                    ),
                    data.fulfillmentServices.includes("Other")
                      ? data.fulfillmentOther
                      : "",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
                <SummaryRow label="Own inventory" value={data.ownInventory} />
              </>
            )}
            {wholesaleRequired && (
              <>
                <SummaryRow label="Purchase plan" value={data.purchaseMode} />
                <SummaryRow label="Initial size" value={data.initialSize} />
              </>
            )}
          </SummaryCard>
        )}
        {data.needs && (
          <SummaryCard title="Additional Notes" onEdit={() => moveToStep(2)}>
            <SummaryRow label="Business needs" value={data.needs} />
          </SummaryCard>
        )}
      </div>
      <label
        className={`partner-confirm ${errors.confirmed ? "has-error" : ""}`}
        ref={registerField("confirmed")}
        tabIndex={-1}
      >
        <input
          type="checkbox"
          checked={confirmed}
          onChange={event => {
            setConfirmed(event.target.checked);
            setErrors(current => {
              const next = { ...current };
              delete next.confirmed;
              return next;
            });
          }}
        />
        <span className="partner-confirm__box" aria-hidden="true">
          <Check />
        </span>
        <span>
          I confirm that the information provided is accurate and that I am
          submitting this inquiry on behalf of my business.
        </span>
      </label>
      {errors.confirmed && (
        <p className="partner-error" role="alert">
          {errors.confirmed}
        </p>
      )}
      {submitError && (
        <p className="partner-submit-error" role="alert">
          {submitError}
        </p>
      )}
    </>
  );

  if (submittedAt) {
    return (
      <div
        className="partner-inquiry partner-inquiry--success"
        aria-live="polite"
      >
        <div className="partner-success">
          <span className="partner-success__mark">
            <CheckCircle2 aria-hidden="true" />
          </span>
          <span className="partner-eyebrow">Inquiry received</span>
          <h2>Thank You for Your Interest in Peplogix.</h2>
          <p>Your partnership inquiry has been successfully submitted.</p>
          <p>
            Our team will review your information and get back to you to discuss
            the best way to partner with Peplogix.
          </p>
          <p>We look forward to learning more about your business.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-inquiry">
      <div className="partner-workflow">
        <nav className="partner-steps" aria-label="Inquiry progress">
          {steps.map(step => {
            const skipped = step.number === 3 && !brandRequired;
            const complete =
              step.number < currentStep && !(step.number === 3 && skipped);
            const active = step.number === currentStep;
            return (
              <div
                key={step.number}
                className={`partner-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""} ${skipped ? "is-skipped" : ""}`}
                aria-current={active ? "step" : undefined}
              >
                <span className="partner-step__number">
                  {complete ? <Check aria-hidden="true" /> : step.number}
                </span>
                <span className="partner-step__text">
                  <strong>{step.label}</strong>
                  {skipped && <small>Not needed for your selections</small>}
                </span>
              </div>
            );
          })}
        </nav>
        <form
          className="partner-form"
          onSubmit={event => {
            event.preventDefault();
            currentStep === 4 ? void handleSubmit() : handleNext();
          }}
          noValidate
        >
          <p className="sr-only" aria-live="polite">
            {logo?.status === "uploading"
              ? `Logo upload ${logo.progress}% complete.`
              : ""}
            {assets.some(asset => asset.status === "uploading")
              ? ` ${assets.filter(asset => asset.status === "uploading").length} additional asset upload${assets.filter(asset => asset.status === "uploading").length === 1 ? " is" : "s are"} in progress.`
              : ""}
          </p>
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
          {currentStep === 4 && renderStepFour()}
          <div className="partner-form__actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="partner-button partner-button--secondary"
                onClick={handleBack}
              >
                <ArrowLeft aria-hidden="true" /> Back
              </button>
            )}
            <button
              type="submit"
              className="partner-button partner-button--primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="partner-spinner"
                    aria-hidden="true"
                  />{" "}
                  Submitting inquiry
                </>
              ) : currentStep === 4 ? (
                <>
                  <Send aria-hidden="true" /> Submit Partnership Inquiry
                </>
              ) : (
                <>
                  Continue <ArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
