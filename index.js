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

setTimeout(() => {
  let id = null;
  const elem = document.getElementById("loader");
  const load1 = document.getElementById("loader_elem")
  let pos = 0;
  clearInterval(id);
  id = setInterval(frame, 0.5);
  function frame() {
    if (pos === 800) {
      clearInterval(id);
      elem.parentNode.removeChild(elem)
    } else {
      pos += 8;
      elem.style.top = pos + "px";
    }
  }
}, 1200);
