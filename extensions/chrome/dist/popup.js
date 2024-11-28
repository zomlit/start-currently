const toggleInput=document.getElementById("toggleExtension"),connectionStatus=document.getElementById("connectionStatus"),currentInput=document.getElementById("currentInput"),root=document.getElementById("root");function updateStatus(t){connectionStatus.className=t?"inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-yellow-500/20 text-yellow-500":"inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-500",connectionStatus.textContent=t?"Waiting...":"Disabled",currentInput.className=t?"text-sm text-white/80 font-medium text-center py-1 rounded bg-white/5 min-h-[28px]":"text-sm text-white/40 font-medium text-center py-1 rounded bg-white/5 min-h-[28px]",currentInput.textContent=t?"Waiting for input...":"Monitoring paused"}function updateGamepadDisplay(t){if(!t)return connectionStatus.className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-red-500/20 text-red-500",connectionStatus.textContent="Disconnected",void(currentInput.textContent="No controller detected");connectionStatus.className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-xs font-semibold bg-green-500/20 text-green-500",connectionStatus.textContent="Connected";const e=t.buttons.map(((t,e)=>t.pressed?BUTTON_LABELS[e]:null)).filter(Boolean),n=t.axes.map(((t,e)=>Math.abs(t)>.1?`${["LX","LY","RX","RY"][e]}: ${t.toFixed(2)}`:null)).filter(Boolean);e.length>0||n.length>0?currentInput.textContent=[...e,...n].join(" + ")||"Waiting for input...":currentInput.textContent="Waiting for input..."}root&&root.classList.contains("loading")&&root.classList.remove("loading"),chrome.storage.sync.get(["enabled"],(t=>{toggleInput.checked=!1!==t.enabled,updateStatus(!1!==t.enabled)})),toggleInput.addEventListener("change",(t=>{const e=t.target.checked;chrome.storage.sync.set({enabled:e},(()=>{updateStatus(e),chrome.runtime.sendMessage({type:"TOGGLE_MONITORING",enabled:e})}))})),chrome.runtime.onMessage.addListener((t=>{"GAMEPAD_STATE"===t.type&&updateGamepadDisplay(t.state)})),chrome.runtime.sendMessage({type:"GET_GAMEPAD_STATE"});const BUTTON_LABELS=["A","B","X","Y","LB","RB","LT","RT","Back","Start","LS","RS","↑","↓","←","→"];