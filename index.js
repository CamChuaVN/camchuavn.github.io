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

    var scripts = this.getElementsByTagName('script');
    for(var i = 0; i < scripts.length; i++) {
        var script = document.createElement('script');
        script.innerHTML = scripts[i].innerHTML;
        scripts[i].parentNode.replaceChild(script, scripts[i]);
    }
  }
});

setTimeout(() => {
  const elem = document.getElementById("preloader");
  var seconds = 1500 / 1000;
  elem.style.transition = "opacity " + seconds + "s ease";

  elem.style.opacity = 0;
  setTimeout(function() {
    elem.parentNode.removeChild(elem);
  }, 1500);
}, 900);
