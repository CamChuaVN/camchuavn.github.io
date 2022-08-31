window.customElements.define("x-include", class Include extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    let fetchInfo = await fetch(this.getAttribute("include"));
    if (!fetchInfo.ok) {
      console.warn("[AutoIncl] Cannot GET " + this.getAttribute("include"));
      return;
    }

    console.log(this.innerHTML = await fetchInfo.text());
  }
});
