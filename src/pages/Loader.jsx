export default function Loader() {
    const showLoader = ()=> {
        const loader = document.querySelector('#loader')
        loader.style.display = 'none'
    }
    return(
     
    <div id="loader">
        <div className="logo"><img src="/logo.webp" style={{width:70,}} alt="benkiz logo" /></div>
        <div class="loader-logo">Benkiz <span>Bakers.</span></div>
        <div class="loader-bar"><div class="loader-fill"></div></div>
        <div style={{display:"none"}}>
            {setTimeout(showLoader,2500)}
        </div>
    </div>

    )
}

