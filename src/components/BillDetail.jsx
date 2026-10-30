import InvoiceWrapper from "./InvoiceViewer";

export default function BillDetail ({handleDeleteBill,handleClose,selectedBill}) {
    
    return <div className="flex flex-col h-full w-full px-3 py-6">
              <div className="d-flex flex-row justify-between align-items-center border-b-1 border-zinc-800 pb-3">
                <h3 className="text-sm font-medium text-vercel-primary">Invoice Details</h3>
                <div className="flex gap-2 border-t pt-6">
                  <button onClick={handleDeleteBill} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs px-3 py-1.5 rounded font-semibold transition-colors">Delete Invoice</button>
                </div>
              </div>
              <InvoiceWrapper handleDeleteBill={handleDeleteBill} billData={selectedBill} onClose={handleClose} />
            </div>
}