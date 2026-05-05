import { useEffect } from 'react';

export default function ZohoChat() {
  useEffect(() => {
    // 1. Definiamo la variabile globale di Zoho
    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode: "siqa49ea5b0d5197175fefec8336b1cb83bb595b3c99202361d96a0bc308ae83775d72f811bfc2c5b0f65d802081e1545ea",
      values: {},
      ready: function() {}
    };

    // 2. Creiamo lo script e assegniamogli un ID univoco
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "zsiqscript";
    script.defer = true;
    script.src = "https://salesiq.zohopublic.eu/widget";
    
    // 3. Lo aggiungiamo al body solo se non esiste già (evita duplicati se React si ricarica velocemente)
    if (!document.getElementById("zsiqscript")) {
      document.body.appendChild(script);
    }

    // 4. FUNZIONE DI PULIZIA BLINDATA
    return () => {
      // Metodo sicuro: cerchiamo l'elemento per ID prima di provare a rimuoverlo
      const zScript = document.getElementById("zsiqscript");
      if (zScript && zScript.parentNode) {
        zScript.parentNode.removeChild(zScript);
      }

      // Zoho spesso aggiunge dei div nascosti nel body (es. il bottone della chat fluttuante).
      // Per una pulizia totale, nascondiamo forzatamente il widget se React smonta il componente.
      const zohoWidget = document.getElementById("zsiq_float");
      if (zohoWidget) {
         zohoWidget.style.display = "none";
      }
    };
  }, []);

  // Il componente in sé non renderizza nulla nella UI (ci pensa lo script iniettato)
  return null;
}

// Aggiungiamo il tipo per evitare errori TypeScript sull'oggetto 'window'
declare global {
  interface Window {
    $zoho: any;
  }
}