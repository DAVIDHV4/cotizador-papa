import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DB_CLIENTES = [
  { local: "LA LEÑA TUPAC", ruc: "20486441713", razon: "LA LEÑA S.A.C." },
  { local: "LA LEÑA HABICH", ruc: "20486441713", razon: "LA LEÑA S.A.C." },
  { local: "LA LEÑA LA MOLINA", ruc: "20486441713", razon: "LA LEÑA S.A.C." },
  { local: "LA LEÑA COMAS", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA BOLIVAR", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA COLONIAL", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA JR UNION", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA LOS OLIVOS", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA MALL STA ANITA", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA SAN BORJA", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA BELLAVISTA", ruc: "20486765454", razon: "AC INVERSIONES INTERNACIONALES S.A.C." },
  { local: "LA LEÑA SAN MIGUEL", ruc: "20544782755", razon: "CASA HUERTA CLUB S.A.C." },
  { local: "LA LEÑA LA MARINA", ruc: "20544782755", razon: "CASA HUERTA CLUB S.A.C." },
  { local: "LA LEÑA SJL PROCERES", ruc: "20547487011", razon: "NEGOCIOS HEFZIBA S.A.C." },
  { local: "LA LEÑA MALL SJL", ruc: "20547487011", razon: "NEGOCIOS HEFZIBA S.A.C." },
  { local: "LA LEÑA CAVENECIA", ruc: "20547487011", razon: "NEGOCIOS HEFZIBA S.A.C." },
  { local: "LA LEÑA LAMPA", ruc: "10471747691", razon: "VICTOR ENRIQUE ADVINCULA CANCHAN" },
  { local: "LA LEÑA TAMBO HUANCAYO", ruc: "10471747691", razon: "VICTOR ENRIQUE ADVINCULA CANCHAN" },
  { local: "LA LEÑA ROYAL HUANCAYO", ruc: "20486014645", razon: "A&C INVERSIONES S.A.C." },
  { local: "LA LEÑA BREÑA HUANCAYO", ruc: "20486014645", razon: "A&C INVERSIONES S.A.C." },
  { local: "LA LEÑA SAN CARLOS HUANCAYO", ruc: "20486014645", razon: "A&C INVERSIONES S.A.C." },
  { local: "LA LEÑA PARQUE HUANCAYO", ruc: "20486014645", razon: "A&C INVERSIONES S.A.C." },
  { local: "PAN ATELIER MIRAFLORES", ruc: "20601598001", razon: "ARTISAN BREAD S.A.C." },
  { local: "PAN ATELIER BOLIVAR", ruc: "20601598001", razon: "ARTISAN BREAD S.A.C." },
  { local: "PAN ATELIER BOCATTA", ruc: "20601598001", razon: "ARTISAN BREAD S.A.C." }
];

const PALABRAS_RAPIDAS = ["PINTADO", "LIJADO", "SUMINISTRO", "INSTALACIÓN", "DESMONTAJE", "RESANE", "MANTENIMIENTO", "LIMPIEZA"];

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [cliente, setCliente] = useStickyState({ local: '', ruc: '', razonSocial: '' }, 'clienteData');
  const [modoManual, setModoManual] = useState(false);
  const [numeroCotizacion, setNumeroCotizacion] = useStickyState(92, 'numCotizacion'); 
  const [fecha, setFecha] = useStickyState('', 'fechaCot');
  
  const [diasEjecucion, setDiasEjecucion] = useStickyState('02', 'diasEjec');
  const [numTrabajadores, setNumTrabajadores] = useStickyState('03', 'numTrab');

  const [items, setItems] = useStickyState([], 'itemsLista');
  const [nuevoItem, setNuevoItem] = useState({ desc: '', costo: '' });

  const [baseImponible, setBaseImponible] = useStickyState('', 'baseImpManual'); 
  const [igvManual, setIgvManual] = useStickyState('', 'igvManual'); 
  const [totalManoObra, setTotalManoObra] = useStickyState('', 'totalManoObraManual');

  const [materiales, setMateriales] = useStickyState([], 'matLista');
  const [inputMaterial, setInputMaterial] = useState({ cant: '', desc: '', costo: '' });
  const [totalMateriales, setTotalMateriales] = useStickyState('', 'totalMat');

  const [herramientas, setHerramientas] = useStickyState([], 'herramientasLista');
  const [inputHerramienta, setInputHerramienta] = useState({ nombre: '', uso: '' });

  useEffect(() => {
    if (!fecha) {
      const hoy = new Date();
      setFecha(hoy.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    }
  }, []);

  const handleSelectLocal = (e) => {
    const seleccion = e.target.value;
    if (seleccion === "MANUAL") {
      setModoManual(true);
      setCliente({ local: '', ruc: '', razonSocial: '' });
    } else {
      setModoManual(false);
      const datos = DB_CLIENTES.find(c => c.local === seleccion);
      if (datos) {
        setCliente({ local: datos.local, ruc: datos.ruc, razonSocial: datos.razon });
      }
    }
  };

  const handleInput = (setter, field, value, isObject = false, obj = {}) => {
    const valUpper = value.toUpperCase();
    if (isObject) setter({ ...obj, [field]: valUpper });
    else setter(valUpper);
  };

  const agregarTextoRapido = (palabra) => {
    const espacio = nuevoItem.desc.length > 0 ? " " : "";
    const nuevaDescripcion = nuevoItem.desc + espacio + palabra + " DE ";
    handleInput(setNuevoItem, 'desc', nuevaDescripcion, true, nuevoItem);
  };

  const agregarItem = () => {
    if (nuevoItem.desc.trim() === '') return;
    setItems([...items, nuevoItem]);
    setNuevoItem({ desc: '', costo: '' });
  };
  const eliminarItem = (index) => {
    if (window.confirm("¿Eliminar este trabajo?")) setItems(items.filter((_, i) => i !== index));
  };
  const editarItem = (index) => {
    if ((nuevoItem.desc !== '' || nuevoItem.costo !== '') && !window.confirm("Se perderá lo escrito abajo. ¿Editar?")) return;
    setNuevoItem(items[index]);
    setItems(items.filter((_, i) => i !== index));
    window.scrollTo(0, document.body.scrollHeight);
  };

  const agregarMaterial = () => {
    if (inputMaterial.desc.trim() === '') return;
    setMateriales([...materiales, inputMaterial]);
    setInputMaterial({ cant: '', desc: '', costo: '' });
  };
  const eliminarMaterial = (index) => {
    if (window.confirm("¿Eliminar este material?")) setMateriales(materiales.filter((_, i) => i !== index));
  };
  const editarMaterial = (index) => {
    if ((inputMaterial.desc !== '' || inputMaterial.cant !== '') && !window.confirm("Se perderá lo escrito abajo. ¿Editar?")) return;
    setInputMaterial(materiales[index]);
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const agregarHerramienta = () => {
    if (inputHerramienta.nombre.trim() === '') return;
    setHerramientas([...herramientas, inputHerramienta]);
    setInputHerramienta({ nombre: '', uso: '' });
  };
  const eliminarHerramienta = (index) => {
    if (window.confirm("¿Eliminar esta herramienta?")) setHerramientas(herramientas.filter((_, i) => i !== index));
  };
  const editarHerramienta = (index) => {
    if ((inputHerramienta.nombre !== '' || inputHerramienta.uso !== '') && !window.confirm("Se perderá lo escrito abajo. ¿Editar?")) return;
    setInputHerramienta(herramientas[index]);
    setHerramientas(herramientas.filter((_, i) => i !== index));
  };

  const totalMat = parseFloat(totalMateriales) || 0;

  const generarPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const margenIzq = 14;
      let yPos = 20;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('HUARCAYA JANJE EDUARDO EMILIO', 105, yPos, null, null, 'center');
      yPos += 6;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text('RUC 10081587677', 105, yPos, null, null, 'center');
      yPos += 10;
      doc.setFont(undefined, 'bold');
      doc.text(`COTIZACION 00${numeroCotizacion}`, margenIzq, yPos);
      doc.text(`FECHA: ${fecha}`, 140, yPos);
      yPos += 8;
      doc.text('CONTACTO', margenIzq, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('NOMBRE:  EDUARDO HUARCAYA', margenIzq, yPos);
      yPos += 5;
      doc.text('N° DE CELULAR:  985956450', margenIzq, yPos);
      yPos += 5;
      doc.text('CORREO:  LALO_DAVID12@HOTMAIL.COM', margenIzq, yPos);
      yPos += 5;
      const localLines = doc.splitTextToSize(`LOCAL: ${cliente.local}`, 180);
      doc.text(localLines, margenIzq, yPos);
      yPos += (localLines.length * 5);
      doc.text(`RUC:  ${cliente.ruc}`, margenIzq, yPos);
      yPos += 5;
      const razonSocialLines = doc.splitTextToSize(`RAZON SOCIAL: ${cliente.razonSocial}`, 180);
      doc.text(razonSocialLines, margenIzq, yPos);
      yPos += (razonSocialLines.length * 5);

      yPos += 2; 
      autoTable(doc, {
        startY: yPos,
        head: [['ITEM', 'DESCRIPCION DEL TRABAJO', 'COSTO']],
        body: items.map((item, index) => [index + 1, item.desc, item.costo ? `S/ ${item.costo}` : '']),
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 1, lineColor: [0,0,0], lineWidth: 0.1, overflow: 'linebreak' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30, halign: 'right' } },
        margin: { bottom: 20 }
      });

      let finalY = doc.lastAutoTable.finalY;
      if (finalY + 25 > pageHeight - 20) { doc.addPage(); finalY = 20; }
      
      yPos = finalY + 5;
      doc.setFontSize(10);
      doc.text(`BASE IMPONIBLE`, 120, yPos);
      doc.text(`S/ ${parseFloat(baseImponible || 0).toFixed(2)}`, 190, yPos, null, null, 'right');
      yPos += 5;
      doc.text(`IGV (18%)`, 120, yPos); 
      doc.text(`S/ ${parseFloat(igvManual || 0).toFixed(2)}`, 190, yPos, null, null, 'right');
      yPos += 5;
      doc.setFont(undefined, 'bold');
      doc.text(`TOTAL MANO DE OBRA`, 120, yPos);
      doc.text(`S/ ${parseFloat(totalManoObra || 0).toFixed(2)}`, 190, yPos, null, null, 'right');

      yPos += 10;
      if (yPos + 30 > pageHeight - 20) { doc.addPage(); yPos = 20; }

      if (materiales.length > 0 || totalMat > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['ITEM', 'CANT.', 'DESCRIPCION MATERIALES', 'COSTO']],
          body: materiales.map((m, i) => [i + 1, m.cant, m.desc, m.costo ? `S/ ${m.costo}` : '']),
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 1, lineColor: [0,0,0], lineWidth: 0.1, overflow: 'linebreak' },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 15, halign: 'center' }, 3: { cellWidth: 30, halign: 'right' } },
          margin: { bottom: 20 }
        });
        finalY = doc.lastAutoTable.finalY;
        if (finalY + 15 > pageHeight - 20) { doc.addPage(); finalY = 20; }
        yPos = finalY + 5;
        doc.setFont(undefined, 'bold');
        doc.text(`COSTO TOTAL INCLUIDO IGV`, 120, yPos);
        doc.text(`S/ ${totalMat.toFixed(2)}`, 190, yPos, null, null, 'right');
      }

      yPos += 10;
      if (herramientas.length > 0) {
          if (yPos + 30 > pageHeight - 20) { doc.addPage(); yPos = 20; }
          autoTable(doc, {
            startY: yPos,
            head: [['ITEM', 'HERRAMIENTAS Y EQUIPOS', 'PARA QUE SERA USADO']],
            body: herramientas.map((h, i) => [i + 1, h.nombre, h.uso]),
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1, lineColor: [0,0,0], lineWidth: 0.1, overflow: 'linebreak' },
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
            columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 80 }, 2: { cellWidth: 'auto' } },
            margin: { bottom: 20 }
          });
          finalY = doc.lastAutoTable.finalY;
          yPos = finalY + 5;
      }

      const espacioNecesarioFooter = 60;
      yPos += 5;
      if (yPos + espacioNecesarioFooter > pageHeight - 10) { doc.addPage(); yPos = 20; }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('CONDICIONES COMERCIALES', margenIzq, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`PLAZO DE EJECUCION:  ${diasEjecucion} DIAS HABILES DESPUES DE LA APROBACION`, margenIzq, yPos);
      yPos += 5;
      doc.text(`N° DE TRABAJADORES:  ${numTrabajadores} PERSONAS`, margenIzq, yPos);
      yPos += 5;
      doc.text(`FORMA DE PAGO:  EL 70 % DE ADELANTO Y 30% AL TERMINO DEL SERVICIO`, margenIzq, yPos);
      yPos += 5;
      doc.text(`ABONAR EN:`, margenIzq, yPos);
      yPos += 5;
      doc.text(`BANCO: CONTINENTAL`, margenIzq, yPos);
      yPos += 5;
      doc.text(`N° DE CUENTA: 001103190200249873`, margenIzq, yPos);
      yPos += 5;
      doc.text(`CCI: 01131900020024987317`, margenIzq, yPos);

      const fileName = `Cotizacion_${numeroCotizacion}.pdf`;
      let compartidoExitoso = false;
      if (navigator.canShare && navigator.share) {
        try {
          const blob = doc.output('blob');
          const file = new File([blob], fileName, { type: "application/pdf" });
          if (navigator.canShare({ files: [file] })) {
             await navigator.share({
               files: [file],
               title: 'Cotización',
               text: `Cotización N° ${numeroCotizacion}`
             });
             compartidoExitoso = true;
          }
        } catch (e) {
          console.log("Compartir cancelado o no soportado, descargando...");
        }
      }
      if (!compartidoExitoso) {
        doc.save(fileName);
      }
      setNumeroCotizacion(parseInt(numeroCotizacion) + 1);

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const limpiarTodo = () => {
    if(confirm("¿Borrar todo?")) { localStorage.clear(); window.location.reload(); }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10 font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <div className="bg-orange-600 p-4 text-white text-center shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">COTIZADOR V18</h1>
            <p className="text-xs">Todo Manual (Base, IGV, Total)</p>
          </div>
          <button onClick={limpiarTodo} className="text-xs bg-red-500 p-1 rounded">Borrar</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
             <div className="w-1/3">
               <label className="text-[10px] font-bold text-gray-500">N° COTIZACIÓN</label>
               <input type="number" className="w-full p-2 border rounded font-bold text-orange-600 text-center"
                value={numeroCotizacion} onChange={(e) => setNumeroCotizacion(e.target.value)} />
             </div>
             <div className="w-2/3">
               <label className="text-[10px] font-bold text-gray-500">FECHA</label>
               <input type="text" className="w-full p-2 border rounded text-center"
                value={fecha} onChange={(e) => setFecha(e.target.value)} />
             </div>
          </div>

          <section className="bg-gray-50 p-3 rounded border">
            <h3 className="text-xs font-bold text-gray-500 mb-2 border-b">DATOS DEL CLIENTE</h3>
            <label className="text-[10px] font-bold block text-blue-800">SELECCIONAR LOCAL:</label>
            <select className="w-full p-2 border-2 border-blue-200 rounded mb-3 text-sm font-bold text-blue-900 bg-white"
              onChange={handleSelectLocal} value={modoManual ? "MANUAL" : cliente.local}>
              <option value="">-- SELECCIONAR LOCAL --</option>
              {DB_CLIENTES.map((c, i) => <option key={i} value={c.local}>{c.local}</option>)}
              <option value="MANUAL" className="font-bold text-red-600">-- OTRO (MANUAL) --</option>
            </select>
            <label className="text-[10px] font-bold block">LOCAL:</label>
            <textarea rows="1" className={`w-full p-2 border rounded mb-2 text-sm uppercase resize-none ${!modoManual ? 'bg-gray-100' : 'bg-white'}`}
              value={cliente.local} readOnly={!modoManual} onChange={(e) => handleInput(setCliente, 'local', e.target.value, true, cliente)} />
            <label className="text-[10px] font-bold block">RUC:</label>
            <input type="number" className={`w-full p-2 border rounded mb-2 text-sm ${!modoManual ? 'bg-gray-100' : 'bg-white'}`}
              value={cliente.ruc} readOnly={!modoManual} onChange={(e) => setCliente({...cliente, ruc: e.target.value})} />
            <label className="text-[10px] font-bold block">RAZÓN SOCIAL:</label>
            <textarea rows="1" className={`w-full p-2 border rounded text-sm uppercase resize-none ${!modoManual ? 'bg-gray-100' : 'bg-white'}`}
              value={cliente.razonSocial} readOnly={!modoManual} onChange={(e) => handleInput(setCliente, 'razonSocial', e.target.value, true, cliente)} />
          </section>

          <section>
            <h2 className="text-sm font-bold text-white bg-gray-700 p-2 rounded-t">1. DESCRIPCIÓN DEL TRABAJO</h2>
            <div className="border p-2 rounded-b bg-white">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between bg-gray-50 p-2 mb-1 rounded border text-xs items-center">
                  <span className="font-bold mr-2">{i+1}.</span>
                  <div className="flex-1 mr-2"><div className="uppercase font-bold break-all">{item.desc}</div>{item.costo && <div className="text-gray-500">S/ {item.costo}</div>}</div>
                  <div className="flex gap-1"><button onClick={() => editarItem(i)} className="bg-yellow-400 text-white font-bold p-2 rounded">✏️</button><button onClick={() => eliminarItem(i)} className="bg-red-500 text-white font-bold p-2 rounded">X</button></div>
                </div>
              ))}
              <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded border">
                <div className="flex flex-wrap gap-2 mb-1">{PALABRAS_RAPIDAS.map((palabra, i) => <button key={i} onClick={() => agregarTextoRapido(palabra)} className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200">+ {palabra}</button>)}</div>
                <div className="relative">
                   <textarea rows="3" placeholder="DESCRIBIR TRABAJO..." className="w-full p-2 border rounded text-sm uppercase" value={nuevoItem.desc} onChange={e => handleInput(setNuevoItem, 'desc', e.target.value, true, nuevoItem)} />
                   {nuevoItem.desc && <button onClick={() => setNuevoItem({...nuevoItem, desc: ''})} className="absolute top-2 right-2 bg-gray-300 text-gray-600 rounded-full w-5 h-5 text-xs font-bold">X</button>}
                </div>
                <div className="flex gap-2"><input type="number" placeholder="COSTO (OPCIONAL)" className="w-1/2 p-2 border rounded text-sm" value={nuevoItem.costo} onChange={e => setNuevoItem({...nuevoItem, costo: e.target.value})} /><button onClick={agregarItem} className="flex-1 bg-gray-700 text-white rounded font-bold">AGREGAR +</button></div>
              </div>
              
              <div className="mt-4 pt-2 border-t">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-600">BASE IMPONIBLE:</span>
                    <input type="number" placeholder="0" className="w-24 p-2 border border-gray-400 rounded text-right font-bold" 
                      value={baseImponible} 
                      onChange={e => setBaseImponible(e.target.value)} 
                    />
                 </div>
                 <div className="flex justify-between items-center text-xs text-gray-500 mb-2 px-1">
                    <span className="font-bold">IGV (18%):</span>
                    <input type="number" placeholder="0" className="w-24 p-1 border border-gray-300 rounded text-right text-xs" 
                      value={igvManual} 
                      onChange={e => setIgvManual(e.target.value)} 
                    />
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold bg-gray-100 p-1 rounded">
                    <span>TOTAL MANO OBRA:</span>
                    <input 
                      type="number" 
                      className="w-28 p-1 ml-2 border border-gray-300 rounded text-right font-bold text-gray-800 bg-white"
                      placeholder="0"
                      value={totalManoObra}
                      onChange={e => setTotalManoObra(e.target.value)}
                    />
                 </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-white bg-blue-800 p-2 rounded-t">2. MATERIALES</h2>
            <div className="border p-2 rounded-b bg-white">
              {materiales.map((mat, i) => (
                <div key={i} className="flex items-center bg-blue-50 p-2 mb-1 rounded border text-xs">
                  <span className="font-bold w-4">{i+1}.</span>{mat.cant && <span className="font-bold w-8 text-center bg-white border rounded mr-2">{mat.cant}</span>}
                  <span className="uppercase flex-1 break-all">{mat.desc} {mat.costo ? `(S/ ${mat.costo})` : ''}</span>
                  <div className="flex gap-1 ml-1"><button onClick={() => editarMaterial(i)} className="bg-yellow-400 text-white font-bold p-1 px-2 rounded">✏️</button><button onClick={() => eliminarMaterial(i)} className="bg-red-500 text-white font-bold p-1 px-2 rounded">X</button></div>
                </div>
              ))}
              <div className="mt-2 space-y-2">
                <div className="flex gap-2"><input placeholder="CANT." className="w-16 p-2 border rounded text-center text-sm uppercase" value={inputMaterial.cant} onChange={e => handleInput(setInputMaterial, 'cant', e.target.value, true, inputMaterial)} /><input placeholder="MATERIAL..." className="flex-1 p-2 border rounded text-sm uppercase" value={inputMaterial.desc} onChange={e => handleInput(setInputMaterial, 'desc', e.target.value, true, inputMaterial)} /></div>
                <div className="flex gap-2"><input type="number" placeholder="COSTO (OPCIONAL)" className="w-1/2 p-2 border rounded text-sm" value={inputMaterial.costo} onChange={e => setInputMaterial({...inputMaterial, costo: e.target.value})} /><button onClick={agregarMaterial} className="flex-1 bg-blue-800 text-white rounded font-bold">AGREGAR +</button></div>
              </div>
              <div className="mt-2 text-right"><label className="text-xs font-bold mr-2">TOTAL MATERIALES (S/):</label><input type="number" className="w-24 p-2 border border-blue-800 rounded text-right font-bold" value={totalMateriales} onChange={e => setTotalMateriales(e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-white bg-teal-600 p-2 rounded-t">3. HERRAMIENTAS Y EQUIPOS</h2>
            <div className="border p-2 rounded-b bg-white">
              {herramientas.map((herr, i) => (
                <div key={i} className="flex items-center bg-teal-50 p-2 mb-1 rounded border text-xs">
                  <span className="font-bold w-4">{i+1}.</span>
                  <div className="flex-1">
                    <div className="uppercase font-bold">{herr.nombre}</div>
                    <div className="text-[10px] text-gray-500 uppercase">USO: {herr.uso}</div>
                  </div>
                  <div className="flex gap-1 ml-1">
                    <button onClick={() => editarHerramienta(i)} className="bg-yellow-400 text-white font-bold p-1 px-2 rounded">✏️</button>
                    <button onClick={() => eliminarHerramienta(i)} className="bg-red-500 text-white font-bold p-1 px-2 rounded">X</button>
                  </div>
                </div>
              ))}
              <div className="mt-2 space-y-2">
                <input placeholder="NOMBRE DE HERRAMIENTA..." className="w-full p-2 border rounded text-sm uppercase" value={inputHerramienta.nombre} onChange={e => handleInput(setInputHerramienta, 'nombre', e.target.value, true, inputHerramienta)} />
                <div className="flex gap-2">
                    <input placeholder="¿PARA QUÉ SERÁ USADO?" className="flex-1 p-2 border rounded text-sm uppercase" value={inputHerramienta.uso} onChange={e => handleInput(setInputHerramienta, 'uso', e.target.value, true, inputHerramienta)} />
                    <button onClick={agregarHerramienta} className="bg-teal-600 text-white px-4 rounded font-bold">AGREGAR +</button>
                </div>
              </div>
            </div>
          </section>
        
          <section className="bg-yellow-50 p-3 rounded border border-yellow-200">
             <h3 className="text-xs font-bold text-yellow-800 mb-2">DATOS PARA CONDICIONES COMERCIALES</h3>
             <div className="flex gap-4">
               <div className="w-1/2"><label className="text-[10px] font-bold block text-gray-600">DÍAS HÁBILES:</label><input type="number" className="w-full p-2 border rounded text-center font-bold" value={diasEjecucion} onChange={e => setDiasEjecucion(e.target.value)} /></div>
               <div className="w-1/2"><label className="text-[10px] font-bold block text-gray-600">N° TRABAJADORES:</label><input type="number" className="w-full p-2 border rounded text-center font-bold" value={numTrabajadores} onChange={e => setNumTrabajadores(e.target.value)} /></div>
             </div>
          </section>

          <div className="pt-4 pb-8"><button onClick={generarPDF} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg text-lg hover:bg-green-700">CONFIRMAR Y GENERAR PDF 📄</button></div>
        </div>
      </div>
    </div>
  );
}

export default App;