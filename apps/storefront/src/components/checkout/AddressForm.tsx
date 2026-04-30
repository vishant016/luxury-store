"use client";

export interface AddressData {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
}

interface AddressFormProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  errors: Partial<Record<keyof AddressData, string>>;
}

const fields: {
  key: keyof AddressData;
  label: string;
  type: string;
  half?: boolean;
}[] = [
  { key: "fullName", label: "Full Name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "addressLine", label: "Address", type: "text" },
  { key: "city", label: "City", type: "text", half: true },
  { key: "state", label: "State", type: "text", half: true },
  { key: "postalCode", label: "Postal Code", type: "text", half: true },
];

export default function AddressForm({
  data,
  onChange,
  errors,
}: AddressFormProps) {
  function handleChange(key: keyof AddressData, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div>
      <h2 className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium text-charcoal mb-6">
        Shipping Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.half ? "" : "sm:col-span-2"}
          >
            <label className="block text-[10px] tracking-[0.15em] uppercase text-muted mb-1.5 font-sans">
              {field.label}
            </label>
            <input
              type={field.type}
              value={data[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={`w-full px-4 py-3 text-sm bg-transparent border outline-none transition-colors duration-300 font-sans ${
                errors[field.key]
                  ? "border-red-400 focus:border-red-500"
                  : "border-stone focus:border-gold"
              }`}
            />
            {errors[field.key] && (
              <p className="text-xs text-red-500 mt-1 font-sans">
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
