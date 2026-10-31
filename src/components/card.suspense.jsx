import logourl from '../assets/icon.png';

const CardSuspense = () =>{
    return  <div className="flex items-center justify-center flex-col item-center h-full w-full animate-pulse text-zinc-400">
                <img src={logourl} className='h-12 w-12'></img>
                <div className="font-normal text-xs">Loading...</div>
            </div>
}
export default CardSuspense