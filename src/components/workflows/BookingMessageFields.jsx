const VARIABLE_HINT =
  'Use {{business_name}}, {{contact_name}}, {{service_type}}, {{preferred_date}}, {{resource_name}}, {{booking_time}} where needed.';

function Hint({ children }) {
  return (
    <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
      {children}
    </p>
  );
}

function MessageField({ label, value, onChange, rows = 3, placeholder, hint }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-800">{label}</label>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
      <textarea
        className="mt-1.5 w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-900"
        rows={rows}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/** Message-only settings for pick_options (services or date step). */
export function PickOptionsMessagePanel({ data, onUpdate }) {
  const isDateStep = data.mode === 'date_quick_pick';

  return (
    <div className="space-y-3">
      <Hint>
        {isDateStep
          ? 'Today and Tomorrow buttons are added automatically. Edit the message text only.'
          : 'Service options come from Settings → Booking & business. Edit the welcome message here.'}
      </Hint>
      <MessageField
        label="Header (optional)"
        value={data.header}
        onChange={(header) => onUpdate({ header })}
        rows={2}
        placeholder="{{business_name}} 🏥"
      />
      <MessageField
        label="Message body"
        value={data.body}
        onChange={(body) => onUpdate({ body })}
        rows={5}
        placeholder={
          isDateStep
            ? 'When would you like to visit *{{business_name}}*?'
            : 'Hi {{contact_name}}! Welcome to *{{business_name}}*.'
        }
      />
      {!isDateStep && (
        <MessageField
          label="Footer (optional)"
          value={data.footer}
          onChange={(footer) => onUpdate({ footer })}
          rows={2}
          placeholder="Tap a button to book"
        />
      )}
      <p className="text-[10px] text-slate-400">{VARIABLE_HINT}</p>
    </div>
  );
}

/** Message-only settings for list_resources. */
export function ListResourcesMessagePanel({ data, onUpdate }) {
  return (
    <div className="space-y-3">
      <Hint>
        Doctors, stylists, and agents are loaded automatically from Scheduling. Customers tap{' '}
        <strong>View options</strong> to pick one.
      </Hint>
      <MessageField
        label="Header"
        value={data.header}
        onChange={(header) => onUpdate({ header })}
        rows={2}
        placeholder="{{business_name}} — pick stylist"
      />
      <MessageField
        label="Message body"
        value={data.body}
        onChange={(body) => onUpdate({ body })}
        rows={4}
        placeholder="Choose who you want on *{{preferred_date}}*"
      />
      <MessageField
        label="No staff available (optional)"
        value={data.empty_message}
        onChange={(empty_message) => onUpdate({ empty_message })}
        rows={3}
        hint="Sent when no active resources are set up."
      />
      <p className="text-[10px] text-slate-400">{VARIABLE_HINT}</p>
    </div>
  );
}

/** Message-only settings for list_slots. */
export function ListSlotsMessagePanel({ data, onUpdate }) {
  return (
    <div className="space-y-3">
      <Hint>
        Available times are loaded live from your schedule. Past times on Today are hidden
        automatically.
      </Hint>
      <MessageField
        label="Header"
        value={data.header}
        onChange={(header) => onUpdate({ header })}
        rows={2}
        placeholder="Pick a time"
      />
      <MessageField
        label="Message body"
        value={data.body}
        onChange={(body) => onUpdate({ body })}
        rows={4}
        placeholder="Available times with *{{resource_name}}* on *{{preferred_date}}*"
      />
      <MessageField
        label="No slots message (optional)"
        value={data.no_slots_message}
        onChange={(no_slots_message) => onUpdate({ no_slots_message })}
        rows={3}
      />
      <p className="text-[10px] text-slate-400">{VARIABLE_HINT}</p>
    </div>
  );
}

/** Message-only settings for book_slot (pending request + owner-confirmed reply). */
export function BookSlotMessagePanel({ data, onUpdate }) {
  return (
    <div className="space-y-3">
      <Hint>
        After the customer picks a slot, a <strong>pending</strong> booking is created. You confirm
        it from Scheduling → Bookings. The confirmation message below is sent to the customer when
        you tap <strong>Confirm booking</strong>.
      </Hint>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        After customer picks a slot
      </p>
      <MessageField
        label="Header line"
        value={data.pending_header}
        onChange={(pending_header) => onUpdate({ pending_header })}
        rows={2}
        placeholder="{{business_name}}"
      />
      <MessageField
        label="Pending request message"
        value={data.pending_message}
        onChange={(pending_message) => onUpdate({ pending_message })}
        rows={5}
        placeholder="We will check availability and confirm your booking shortly."
      />
      <MessageField
        label="Slot taken message (optional)"
        value={data.conflict_message}
        onChange={(conflict_message) => onUpdate({ conflict_message })}
        rows={3}
        hint="Sent if someone else booked the same slot first."
      />

      <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        After you confirm in Bookings
      </p>
      <MessageField
        label="Confirmation header (optional)"
        value={data.confirmed_header}
        onChange={(confirmed_header) => onUpdate({ confirmed_header })}
        rows={2}
        placeholder="{{business_name}}"
        hint="Shown above the confirmation body. Leave blank to send body only."
      />
      <MessageField
        label="Confirmation message"
        value={data.confirmed_message}
        onChange={(confirmed_message) => onUpdate({ confirmed_message })}
        rows={6}
        placeholder="✅ Appointment confirmed! … See you then!"
      />
      <MessageField
        label="Confirmation button label"
        value={data.confirmed_button}
        onChange={(confirmed_button) => onUpdate({ confirmed_button })}
        rows={1}
        placeholder="Thank you!"
        hint="Max 20 characters (WhatsApp limit)."
      />

      <p className="text-[10px] text-slate-400">{VARIABLE_HINT}</p>
    </div>
  );
}
