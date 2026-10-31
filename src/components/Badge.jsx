const Badge = ({type="dark",title="title here"}) => {
    const cc = type === "light" ? "bg-yellow-500 text-vercel-black" : "bg-vercel-blue text-vercel-primary"

    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${cc} `}>
            {title}
            </span>
}
export default Badge
// bjbca