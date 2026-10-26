const GlobalTable = ({title="title", filteredList, status, selectedItem, setSelectedItem,tableHead, tableData }) => {
  return (
    <div className="w-full bg-transparent ">
      <div className="py-3 text-sm font-semibold text-vercel-primary flex justify-between items-center">
        <span>{title} List </span>
        {/* <span>Total - {filteredOrders.length}</span> */}
      </div>

        <div className="bg-vercel-card rounded-md overflow-hidden shadow-xl border-1 border-zinc-800 w-full">
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className=''>
                <tr className="border-b border-zinc-800 text-sm font-semibold text-vercel-secondary text-left">
                  {tableHead.map((item) => {return <th className={`px-3 py-2 ${item.class}`}>{item.label}</th>})}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {status === 'loading' ?(
                  [0,1,2].map((item) => {
                    return (
                      <tr
                        key={item} 
                        className="transition-all animate-pulse"
                      >
                        {tableData(tableHead)?.map((data)=><td className={`px-3 py-2 ${data.class}`}><div className="h-4 bg-zinc-900 rounded w-full"></div></td>)}
                      </tr>
                    );
                  })
                
                  // <SkeletonLoader type='table'/>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                      No orders found matching your criteria.
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
                            : 'hover:bg-vercel-hover text-vercel-secondary'
                        }`}
                      >
                        {tableData(item)?.map((data)=><td className={`px-3 py-2 text-xs ${data?.class}`}>{data?.value}</td>)}
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
export default GlobalTable