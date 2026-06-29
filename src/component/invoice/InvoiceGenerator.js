import React, { useState, useRef } from "react";

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState({
    invoiceNumber: "INV-2026-001",
    date: new Date().toISOString().split("T"),
    dueDate: "",
    currency: "₹",
    taxRate: 18,
    discountRate: 0,
    sender: { name: "", address: "" },
    client: { name: "", email: "", address: "" },
    items: [
      {
        id: 1,
        description: "",
        qty: 1,
        price: "",
      },
    ],
    notes: "Thank you for your business. Payment is due within 15 days.",
  });

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharePhone, setSharePhone] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const invoiceRef = useRef(null);

  const handleMetaChange = (e) => {
    const value = e.target.type === "number" ? (e.target.value === "" ? "" : parseFloat(e.target.value) || 0) : e.target.value;
    setInvoice({ ...invoice, [e.target.name]: value });
  };

  const handleSenderChange = (e) =>
    setInvoice({
      ...invoice,
      sender: { ...invoice.sender, [e.target.name]: e.target.value },
    });
  const handleClientChange = (e) =>
    setInvoice({
      ...invoice,
      client: { ...invoice.client, [e.target.name]: e.target.value },
    });

  const handleItemChange = (id, field, value) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const cleanValue = field === "description" ? value : value === "" ? "" : parseFloat(value) || 0;
        return { ...item, [field]: cleanValue };
      }
      return item;
    });
    setInvoice({ ...invoice, items: updatedItems });
  };

  const addItem = () =>
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { id: Date.now(), description: "", qty: 1, price: "" },
      ],
    });

  const removeItem = (id) =>
    setInvoice({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== id),
    });

  // Math Calculations
  const subtotal = invoice.items.reduce(
    (acc, item) => acc + (Number(item.qty) || 0) * (Number(item.price) || 0),
    0,
  );
  
  const discountAmount = (subtotal * (Number(invoice.discountRate) || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (Number(invoice.taxRate) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Helper boolean checks to keep JSX clean
  const hasDiscount = Number(invoice.discountRate) > 0;
  const hasTax = Number(invoice.taxRate) > 0;

  // --- THE SILENT LOCAL PDF GENERATOR ---
  const triggerLocalPdfDownload = async () => {
    setIsGenerating(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const element = invoiceRef.current;
      const opt = {
        margin: 0.5,
        filename: `${invoice.invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF. Please try the native Print button.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- COST-FREE SHARE HANDLERS ---
  const handleEmailDispatch = async () => {
    const targetEmail = shareEmail || invoice.client.email;
    if (!targetEmail) return alert("Please enter a destination email.");

    await triggerLocalPdfDownload();

    const discountText = hasDiscount ? `Discount (${invoice.discountRate}%): -${invoice.currency}${discountAmount.toLocaleString()}\n` : '';
    const taxText = hasTax ? `Tax (${invoice.taxRate}%): +${invoice.currency}${taxAmount.toLocaleString()}\n` : '';

    const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.sender.name || "Us"}`;
    const body = `Hello ${invoice.client.name || "there"},\n\nPlease find your invoice (${invoice.invoiceNumber}) attached to this email.\n\nSubtotal: ${invoice.currency}${subtotal.toLocaleString()}\n${discountText}${taxText}Total Amount Due: ${invoice.currency}${grandTotal.toLocaleString()}\n\n(Note: Please drag and drop the downloaded PDF file into this draft before sending!)\n\nBest regards,\n${invoice.sender.name}`;

    window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsShareOpen(false);
  };

  const handleWhatsAppDispatch = async () => {
    if (!sharePhone) return alert("Please enter a WhatsApp number.");

    await triggerLocalPdfDownload();

    const cleanNumber = sharePhone.replace(/\D/g, "");
    const message = `Hello ${invoice.client.name || "there"},\n\nHere is your official invoice (${invoice.invoiceNumber}) for ${invoice.currency}${grandTotal.toLocaleString()}.\n\n*(Please see attached PDF file)*`;

    window.open(
      `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
    setIsShareOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto my-4 sm:my-10 relative print:shadow-none print:m-0 print:p-10 print:w-full">
      
      {/* Top Action Bar */}
      <div 
        data-html2canvas-ignore="true" 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-8 border-b print:hidden px-4 sm:px-0"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-slate-700">
          Invoice Editor
        </h1>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setShareEmail(invoice.client.email || "");
              setIsShareOpen(true);
            }}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-150 flex items-center justify-center gap-2"
          >
            <span>Share / Send</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-150"
          >
            Quick Print
          </button>
        </div>
      </div>

      {/* Share Dialog Modal */}
      {isShareOpen && (
        <div 
          data-html2canvas-ignore="true" 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-bold text-slate-800">Dispatch Invoice</h3>
              <button onClick={() => setIsShareOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Send via Email Client</label>
              <div className="flex gap-2">
                <input type="email" placeholder="client@company.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="border rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-blue-500" />
                <button onClick={handleEmailDispatch} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">{isGenerating ? "..." : "Generate Draft"}</button>
              </div>
            </div>

            <div className="relative flex py-1 items-center mb-6">
              <div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink mx-4 text-slate-300 text-xs uppercase">or</span><div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Open WhatsApp Chat</label>
              <div className="flex gap-2">
                <input type="tel" placeholder="919876543210" value={sharePhone} onChange={(e) => setSharePhone(e.target.value)} className="border rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-emerald-500 font-mono" />
                <button onClick={handleWhatsAppDispatch} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">{isGenerating ? "..." : "Open Chat"}</button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-left">
              <p className="text-[11px] text-amber-800 leading-relaxed">⚡ <b>How this works:</b> Clicking send will automatically trigger a secure PDF download to your device <i>and</i> open your email/chat app. Just drop the downloaded file into the chat!</p>
            </div>
          </div>
        </div>
      )}

      {/* --- INVOICE BODY --- */}
      <div
        ref={invoiceRef}
        className="p-4 sm:p-6 md:p-8 bg-white shadow-xl rounded-lg text-slate-800 print:shadow-none print:m-0 print:p-0 print:w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 md:gap-4">
          <div className="w-full md:w-1/2">
            <input type="text" name="name" placeholder="Your Company Name" value={invoice.sender.name} onChange={handleSenderChange} className="text-xl sm:text-2xl font-bold block w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none pb-1" />
            <textarea name="address" placeholder="Your Address, Phone & Tax ID" value={invoice.sender.address} onChange={handleSenderChange} rows="2" className="text-sm text-slate-500 mt-1 block w-full resize-none border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none" />
          </div>
          <div className="w-full md:w-auto md:text-right grid grid-cols-[100px_1fr] sm:grid-cols-2 gap-y-2 gap-x-3 text-sm items-center">
            <span className="font-semibold text-slate-500 md:text-right">Invoice #:</span>
            <input type="text" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleMetaChange} className="border rounded px-2 py-1 text-left md:text-right font-mono w-full" />
            <span className="font-semibold text-slate-500 md:text-right">Issued Date:</span>
            <input type="date" name="date" value={invoice.date} onChange={handleMetaChange} className="border rounded px-2 py-1 text-left md:text-right w-full" />
            <span className="font-semibold text-slate-500 md:text-right">Due Date:</span>
            <input type="date" name="dueDate" value={invoice.dueDate} onChange={handleMetaChange} className="border rounded px-2 py-1 text-left md:text-right w-full" />
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-8 p-4 bg-slate-50 rounded-lg print:bg-transparent print:p-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To:</h3>
          <input type="text" name="name" placeholder="Client Business Name" value={invoice.client.name} onChange={handleClientChange} className="font-semibold text-base sm:text-lg bg-transparent block w-full outline-none" />
          <input type="text" name="email" placeholder="client@company.com" value={invoice.client.email} onChange={handleClientChange} className="text-sm text-slate-500 bg-transparent block w-full outline-none" />
          <textarea name="address" placeholder="Client Billing Address" value={invoice.client.address} onChange={handleClientChange} rows="1" className="text-sm text-slate-500 bg-transparent block w-full resize-none outline-none mt-1" />
        </div>

        {/* Line Items */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-400 font-semibold">
                <th className="py-2 w-1/2">Description</th>
                <th className="py-2 w-16 text-center">Qty</th>
                <th className="py-2 w-28 text-right">Unit Price</th>
                <th className="py-2 w-28 text-right">Total</th>
                <th className="py-2 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id} className="text-sm">
                  <td className="py-3 pr-2"><input type="text" placeholder="Item description..." value={item.description} onChange={(e) => handleItemChange(item.id, "description", e.target.value)} className="w-full outline-none focus:bg-slate-50 p-1 rounded" /></td>
                  <td className="py-3 px-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, "qty", e.target.value)} className="w-full text-center outline-none border rounded p-1" /></td>
                  <td className="py-3 px-2"><div className="flex items-center justify-end"><span className="mr-1 text-slate-400">{invoice.currency}</span><input type="number" placeholder="0.00" value={item.price} onChange={(e) => handleItemChange(item.id, "price", e.target.value)} className="w-20 text-right outline-none border rounded p-1" /></div></td>
                  <td className="py-3 pl-2 text-right font-mono">{invoice.currency} {((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}</td>
                  <td className="py-3 text-right print:hidden">{invoice.items.length > 1 && (<button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 font-bold px-2">✕</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          data-html2canvas-ignore="true"
          onClick={addItem}
          className="text-sm text-blue-600 font-semibold hover:underline print:hidden mb-8 block"
        >
          + Add Line Item
        </button>

        {/* Footer Breakdown */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-start pt-6 border-t gap-8 md:gap-0">
          <div className="w-full md:w-1/2 md:pr-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Terms / Notes</label>
            <textarea name="notes" value={invoice.notes} onChange={handleMetaChange} rows="3" className="w-full text-sm text-slate-500 border rounded p-2 outline-none resize-none" />
          </div>
          
          <div className="w-full md:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">{invoice.currency} {subtotal.toLocaleString()}</span>
            </div>

            {/* --- CONDITIONALLY IGNORED IN PDF IF 0 --- */}
            <div 
              data-html2canvas-ignore={!hasDiscount ? "true" : undefined}
              className={`flex justify-between items-center text-slate-600 ${!hasDiscount ? 'print:hidden' : ''}`}
            >
              <span className="flex items-center">
                Discount (%)
                <input
                  type="number"
                  name="discountRate"
                  placeholder="0"
                  value={invoice.discountRate === 0 ? "" : invoice.discountRate}
                  onChange={handleMetaChange}
                  className="w-12 ml-2 border rounded text-center print:border-none print:p-0 print:w-auto font-mono"
                />
              </span>
              <span className="font-mono text-emerald-600">
                -{invoice.currency} {discountAmount.toLocaleString()}
              </span>
            </div>

            {/* --- CONDITIONALLY IGNORED IN PDF IF 0 --- */}
            <div 
              data-html2canvas-ignore={!hasTax ? "true" : undefined}
              className={`flex justify-between items-center text-slate-600 ${!hasTax ? 'print:hidden' : ''}`}
            >
              <span className="flex items-center">
                Tax Rate (%)
                <input
                  type="number"
                  name="taxRate"
                  placeholder="0"
                  value={invoice.taxRate === 0 ? "" : invoice.taxRate}
                  onChange={handleMetaChange}
                  className="w-12 ml-2 border rounded text-center print:border-none print:p-0 print:w-auto font-mono"
                />
              </span>
              <span className="font-mono">
                +{invoice.currency} {taxAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Total Due</span>
              <span className="font-mono text-blue-600 print:text-slate-800">
                {invoice.currency} {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* --- END INVOICE BODY --- */}

    </div>
  );
}