const CustomList = ({title,items=[]}) =>{
    return <div>
            <h3 className="text-vercel-primary text-sm pb-2">{title}</h3>
            <div className="bg-vercel-hover rounded-md border-1 border-zinc-800 p-1 px-3">
            {items?.map((item,idx) => <div className={`d-flex flex-row justify-between p-2 px-0 ${(idx + 1 !== items?.length) && "border-b-1"} border-vercel-card`}>
                <p className="text-vercel-secondary text-xs">{item?.key}</p>
                <p className="text-vercel-secondary text-xs">{item?.value}</p>
            </div>)}
            </div>
    </div>
}
export default CustomList