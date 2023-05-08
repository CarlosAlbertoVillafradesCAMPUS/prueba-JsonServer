const pathName = new URL(import.meta.url).pathname;
const name = pathName.split("/").pop().replace(".js", "");
export default class myFilter extends HTMLElement{
    static async component(){
        return await( await fetch(pathName.replace(".js", ".html"))).text()
    }
    constructor(){
        super();
        this.attachShadow({mode: "open"});
       
    } 
    handleEvent(e){
        (e.type === "click")
        ?this.filtrarMeses(e) 
        :undefined
    }

    filtrarMeses(e){
        const wsReclutas = new Worker("storage/wsReclutas.js", {type:"module"})
        wsReclutas.postMessage({function:"FilterMeses"})

        wsReclutas.addEventListener("message", (e) => {
            const wsShow = new Worker("storage/wsShow.js", {type:"module"});
            wsShow.postMessage({function:"showRegistroReclutas", data: e.data})
            wsShow.addEventListener("message", (event) => {
                this.resgistro = this.shadowRoot.querySelector(".registro");
                this.resgistro.innerHTML = event.data
                wsShow.terminate();
                this.eliminar = this.shadowRoot.querySelectorAll(".eliminar");
                this.eliminar.forEach((val,id) => {
                
                    val.addEventListener("click", this.handleEliminar.bind(this))
                })
                
            })
            wsReclutas.terminate()
        })
    }
   
    agregarTeam(e){
        e.preventDefault()
        const dataForm = Object.fromEntries(new FormData(e.target))
        console.log(dataForm);
        const wsTeam = new Worker("storage/wsTeam.js", {type:"module"})
        wsTeam.postMessage({function:"PostTeam", data: dataForm})

        wsTeam.addEventListener("message", (e) => {
            wsTeam.terminate()
        })
    }
    connectedCallback(){
        Promise.resolve(myFilter.component()).then(html => {
            this.shadowRoot.innerHTML = html;
            this.btnMayorMeses = this.shadowRoot.querySelector("#mayorMeses");
            this.btnMayorMeses.addEventListener("click", this.handleEvent.bind(this))
            
        })
    }
}
customElements.define(name, myFilter)