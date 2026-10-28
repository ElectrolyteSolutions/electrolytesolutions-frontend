const Button = ({onClick=null,icon=null,label=null}) =>{
    return  <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-between gap-3 bg-white text-black px-3 py-2 rounded-md text-sm font-semibold hover:opacity-80 transition-all cursor-pointer shadow-sm border-white border text-nowrap"
      >{label}{icon}</button>
}
export default Button