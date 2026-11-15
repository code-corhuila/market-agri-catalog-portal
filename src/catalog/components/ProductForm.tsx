import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Field } from 'shell/ui';
import type { ApiError } from 'shell/apiClient';
import { listCategories, listUnits } from '../api/products';
import { useRemote } from '../api/useRemote';
import { parsePriceCents, parseQuantity } from '../model/format';
import type { ProductWrite } from '../model/product';

type Name = keyof ProductWrite;
type Errors = Partial<Record<Name, string>>;
type Texts = Record<Name, string>;

const REQUIRED = 'Es obligatorio.';
const EMPTY: Texts = {
  name: '',
  category: '',
  unit: '',
  quantity: '',
  priceCents: '',
  municipality: '',
};
// E-13 / E-14: the domain errors of the contract belong to one field (422).
const FIELD_OF: Record<string, Name> = {
  PRICE_NOT_POSITIVE: 'priceCents',
  QUANTITY_NEGATIVE: 'quantity',
};

/** What the producer typed, checked as the contract will (ProductWrite, D-C7, ADR-029). */
function read(texts: Texts): { errors: Errors; product?: ProductWrite } {
  const errors: Errors = {};
  for (const name of Object.keys(texts) as Name[]) if (!texts[name].trim()) errors[name] = REQUIRED;
  const quantity = parseQuantity(texts.quantity);
  const priceCents = parsePriceCents(texts.priceCents);
  if (!errors.quantity && quantity === null)
    errors.quantity = 'Use un número con máximo 2 decimales.';
  if (!errors.priceCents && priceCents === null)
    errors.priceCents = 'Escriba el precio en pesos, por ejemplo 85.000 o 85.000,50.';
  else if (priceCents === 0) errors.priceCents = 'El precio debe ser mayor que cero.';
  if (Object.keys(errors).length > 0 || quantity === null || priceCents === null) {
    return { errors };
  }
  const { name, category, unit, municipality } = texts;
  return {
    errors,
    product: {
      name: name.trim(),
      category,
      unit,
      quantity,
      priceCents,
      municipality: municipality.trim(),
    },
  };
}

interface Props {
  initial?: Texts;
  submitLabel: string;
  /** Sends the product with this intention's key; rejects with the container's ApiError. */
  onSubmit: (product: ProductWrite, idempotencyKey: string) => Promise<void>;
}

/** ProductWrite as a form (HU-CAT-001, HU-CAT-002): each error next to its field (Annex H). */
export function ProductForm({ initial = EMPTY, submitLabel, onSubmit }: Props) {
  const [texts, setTexts] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // One key per intention (D-C35): a retry of the same product reuses it, any change renews it.
  const [key, setKey] = useState(() => crypto.randomUUID());
  const categories = useRemote(listCategories, 'categories').remote;
  const units = useRemote(listUnits, 'units').remote;

  const change = (name: Name, value: string) => {
    setTexts((all) => ({ ...all, [name]: value }));
    setKey(crypto.randomUUID());
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const { errors: found, product } = read(texts);
    setErrors(found);
    setFailure(null);
    if (!product) return;
    setPending(true);
    try {
      await onSubmit(product, key);
    } catch (caught) {
      const { error, message, details = [] } = caught as Partial<ApiError>;
      const byField: Errors = {};
      for (const detail of details)
        if (detail.field in EMPTY) byField[detail.field as Name] = detail.message;
      if (error && FIELD_OF[error]) byField[FIELD_OF[error]] = message;
      if (Object.keys(byField).length > 0) setErrors(byField);
      else setFailure(message ?? 'Ocurrió un error inesperado.');
    } finally {
      setPending(false);
    }
  }

  const input = (name: Name, extra: Record<string, unknown> = {}) => ({
    value: texts[name],
    onChange: (event: { target: { value: string } }) => change(name, event.target.value),
    ...extra,
  });
  const options = (remote: typeof categories) =>
    (remote.state === 'data' ? remote.data : []).map(({ code, label }) => (
      <option key={code} value={code}>
        {label}
      </option>
    ));

  return (
    <Card>
      <form className="stack" onSubmit={submit} noValidate>
        {failure && <Alert variant="error">{failure}</Alert>}
        <Field label="Nombre" error={errors.name} required>
          <input {...input('name', { maxLength: 150 })} />
        </Field>
        <Field label="Categoría" error={errors.category} required>
          <select {...input('category')}>
            <option value="">Elija una categoría</option>
            {options(categories)}
          </select>
        </Field>
        <Field label="Unidad" error={errors.unit} required>
          <select {...input('unit')}>
            <option value="">Elija una unidad</option>
            {options(units)}
          </select>
        </Field>
        <Field
          label="Cantidad disponible"
          error={errors.quantity}
          hint="Hasta 2 decimales; 0 lo publica agotado."
          required
        >
          <input {...input('quantity', { inputMode: 'decimal' })} />
        </Field>
        <Field
          label="Precio por unidad"
          error={errors.priceCents}
          hint="En pesos, como se ve en el catálogo: 85.000 o 85.000,50."
          required
        >
          <input {...input('priceCents', { inputMode: 'decimal' })} />
        </Field>
        <Field label="Municipio" error={errors.municipality} required>
          <input {...input('municipality', { maxLength: 100 })} />
        </Field>
        <div>
          <Button type="submit" loading={pending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
