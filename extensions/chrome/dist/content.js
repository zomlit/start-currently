const STATE={isMonitoringEnabled:!0,lastGamepadState:null,isReloading:!1,isRegistered:!1,registrationTimeout:null};function handleGamepadState(e,t){if(!STATE.isMonitoringEnabled)return void t({success:!0});const n={buttons:e.state.buttons.map((e=>({pressed:!!e.pressed,value:Number(e.value||0),touched:!!e.touched}))),axes:e.state.axes.map((e=>{const t=Number(e||0);return Math.abs(t)<.1?0:t})),timestamp:e.timestamp||Date.now(),connected:!0};window.postMessage({source:"GAMEPAD_EXTENSION",type:"GAMEPAD_STATE",state:n},window.location.origin),window.postMessage({source:"GAMEPAD_EXTENSION",type:"GAMEPAD_CONNECTION_STATE",connected:!0},window.location.origin),console.log("[Content] Forwarding gamepad state:",{buttons:n.buttons.filter((e=>e.pressed)).length,axes:n.axes.filter((e=>Math.abs(e)>.1))}),STATE.lastGamepadState=n,t({success:!0})}chrome.storage.sync.get(["enabled"],(e=>{STATE.isMonitoringEnabled=!1!==e.enabled,console.log("[Content] Loaded initial state:",STATE.isMonitoringEnabled)})),chrome.runtime.onMessage.addListener(((e,t,n)=>{switch(console.log("[Content] Received message:",e.type),e.type){case"GAMEPAD_STATE":handleGamepadState(e,n);break;case"MONITORING_STATE_CHANGED":STATE.isMonitoringEnabled=e.enabled,console.log("[Content] Monitoring state changed:",STATE.isMonitoringEnabled),window.postMessage({source:"GAMEPAD_EXTENSION",type:"MONITORING_STATE_CHANGED",enabled:STATE.isMonitoringEnabled},window.location.origin),STATE.isMonitoringEnabled||window.postMessage({source:"GAMEPAD_EXTENSION",type:"GAMEPAD_STATE",state:{buttons:Array(16).fill({pressed:!1,value:0,touched:!1}),axes:Array(4).fill(0),timestamp:Date.now(),final:!0,connected:!1}},window.location.origin),n({success:!0});break;case"CONTENT_SCRIPT_READY":STATE.isRegistered?(console.log("[Content] Already registered"),n({success:!1,error:"Already registered"})):(STATE.isRegistered=!0,console.log("[Content] Content script registered"),n({success:!0}));break;default:console.log("[Content] Unknown message type:",e.type),n({success:!1,error:"Unknown message type"})}return!0})),console.log("[Content] Content script initialized with monitoring:",STATE.isMonitoringEnabled),chrome.runtime.sendMessage({type:"CONTENT_SCRIPT_READY",url:window.location.href},(e=>{chrome.runtime.lastError?console.error("[Content] Registration failed:",chrome.runtime.lastError):console.log("[Content] Registration successful:",e)}));