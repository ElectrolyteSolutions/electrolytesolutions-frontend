const GlobalTable = ({ title = "title", filteredList, status, selectedItem, setSelectedItem, tableHead, tableData }) => {
  return (
    <div className="w-full flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="py-3 text-sm font-semibold text-vercel-primary flex justify-between items-center shrink-0">
        <span>{title} List</span>
      </div>

      {/* Card Wrapper: max-h-full + h-fit fits small lists, while min-h-0 prevents overflowing large lists */}
      <div className="bg-vercel-card rounded-md overflow-hidden shadow-xl border-1 border-zinc-800 w-full flex flex-col h-fit max-h-full min-h-0 shrink">
        
        {/* Scrollable Container */}
        <div className=" overflow-x-auto w-full max-h-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-vercel-surface backdrop-blur-sm">
              <tr className="border-b border-zinc-800 text-sm font-semibold text-vercel-secondary text-left">
                {tableHead.map((item, idx) => {
                  return <th key={idx} onClick={item?.onClick} className={`truncate ${item.class}`}>{item.label}</th>;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {status === 'loading' ? (
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((item) => {
                  return (
                    <tr key={item} className="transition-all animate-pulse">
                      {tableData(tableHead)?.map((data, idx) => (
                        <td key={idx} className={data.class}>
                          <div className="h-4 bg-zinc-900 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                    No records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isSelected = selectedItem?._id === item._id;
                  return (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedItem(item)}
                      className={`transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-vercel-selected text-vercel-primary' 
                          : 'hover:bg-vercel-hover hover:text-vercel-primary text-vercel-secondary'
                      }`}
                    >
                      {tableData(item)?.map((data, idx) => (
                        <td key={idx} className={`truncate ${data?.class}`}>
                          {data?.value}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalTable;