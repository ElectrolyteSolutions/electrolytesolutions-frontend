import { Cross, X } from "lucide-react";
import VercelDropdown from "./dropdown";
const Header = ({placeholder, searchTerm, setSearchTerm, statusFilter, setStatusFilter,statusOptions,loading,extra }) => {
  return (
    <div className="flex flex-wrap flex-row items-stretch items-center justify-start gap-2 w-full">
      <div className="flex-1 relative">
        <svg 
          className="w-4 h-4 text-zinc-400 absolute top-3 left-3"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-vercel-card min-w-48 text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2 rounded-md border-1 border-zinc-800 focus:outline-none focus:border-white txt-sm transition-all hover:border-white"
        />
        <div className="d-flex gap-2 absolute end-3 top-3">
        {loading && <div className="loader"></div>}
        {searchTerm && <X onClick={()=>{setSearchTerm("")}} size={20} color="white"></X>}
        </div>
      </div>

      {statusFilter.map((val,index)=>{

        return <VercelDropdown 
          value={val || val.value} 
          onSelect={setStatusFilter[index]} 
          rightOptions={statusOptions[index]} 
          placeholder="Filter Status"
        />
      })}
      {extra}
        
    </div>
  );
};
export default Header