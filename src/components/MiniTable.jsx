const MiniTable = ({ tableData, tableHeadData }) => {
  return (<div>
    <h3 className='text-vercel-primary text-sm font-medium pb-2'>Product/Service List</h3>
    <div className='border-1 border-zinc-800 rounded-md bg-vercel-hover'>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-400 bg-vercel-hover">
          {tableHeadData.map((head, idx) => (
            <th key={idx} className="px-3 py-2">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/80">
        {tableData?.map((rowCells, rowIdx) => (
          <tr key={rowIdx} className="text-xs text-zinc-200 hover:bg-zinc-900/40 transition-colors">
            {rowCells.map((cell, cellIdx) => (
              <td 
                key={cellIdx} 
                className={`px-3 py-2.5 ${
                  cell.align === 'center' ? 'text-center' : cell.align === 'right' ? 'text-right' : 'text-left font-medium'
                } ${cell.bold ? 'font-bold text-vercel-primary' : 'text-zinc-400'}`}
              >
                <div>{cell.text}</div>
                {cell.subtext && <div className="text-[10px] text-zinc-500">{cell.subtext}</div>}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table></div></div>
  );
};
export default MiniTable