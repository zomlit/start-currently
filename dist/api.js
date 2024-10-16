import{H3Event as h,getRequestURL as y,getRequestWebStream as P,eventHandler as T}from"h3";import{getContext as S}from"unctx";import{AsyncLocalStorage as g}from"node:async_hooks";function x(t){let o;const e=_(t),r={duplex:"half",method:t.method,headers:t.headers};return t.node.req.body instanceof ArrayBuffer?new Request(e,{...r,body:t.node.req.body}):new Request(e,{...r,get body(){return o||(o=w(t),o)}})}function b(t){return t.web??={request:x(t),url:_(t)},t.web.request}function R(){return E()}const m=Symbol("$HTTPEvent");function L(t){return typeof t=="object"&&(t instanceof h||t?.[m]instanceof h||t?.__is_event__===!0)}function d(t){return function(...o){let e=o[0];if(L(e))o[0]=e instanceof h||e.__is_event__?e:e[m];else{if(!globalThis.app.config.server.experimental?.asyncContext)throw new Error("AsyncLocalStorage was not enabled. Use the `server.experimental.asyncContext: true` option in your app configuration to enable it. Or, pass the instance of HTTPEvent that you have as the first argument to the function.");if(e=R(),!e)throw new Error("No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.");o.unshift(e)}return t(...o)}}const _=d(y),w=d(P);function $(){return S("nitro-app",{asyncContext:!!globalThis.app.config.server.experimental?.asyncContext,AsyncLocalStorage:g})}function E(){return $().use().event}const v=[{path:"/__root",filePath:"/home/tomlit/LST/lst-start/app/routes/__root.tsx"},{path:"/_layout",filePath:"/home/tomlit/LST/lst-start/app/routes/_layout.tsx"},{path:"/_app/-dashboard/widgets",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/-dashboard.widgets.tsx"},{path:"/_app/_authed",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/_authed.tsx"},{path:"/_app/checkout/:$productId?",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/checkout.$productId.tsx"},{path:"/_app/checkout/success",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/checkout.success.tsx"},{path:"/_app",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/index.tsx"},{path:"/_app/posts/:$postId?",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/posts.$postId.tsx"},{path:"/_app/posts",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/posts.tsx"},{path:"/_app/posts_/:$postId?/deep",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/posts_.$postId.deep.tsx"},{path:"/_app/sign-in/*splat",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/sign-in.$.tsx"},{path:"/_app/sign-up/*splat",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/sign-up.$.tsx"},{path:"/_app/test",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/test.tsx"},{path:"/_layout/_layout-2",filePath:"/home/tomlit/LST/lst-start/app/routes/_layout/_layout-2.tsx"},{path:"/_app/_authed/dashboard",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/_authed/dashboard.tsx"},{path:"/_app/pricing",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/pricing/index.tsx"},{path:"/_app/teampicker/:$bracketId?",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/teampicker/$bracketId.tsx"},{path:"/_app/teampicker",filePath:"/home/tomlit/LST/lst-start/app/routes/_app/teampicker/index.tsx"},{path:"/_layout/_layout-2/layout-a",filePath:"/home/tomlit/LST/lst-start/app/routes/_layout/_layout-2/layout-a.tsx"},{path:"/_layout/_layout-2/layout-b",filePath:"/home/tomlit/LST/lst-start/app/routes/_layout/_layout-2/layout-b.tsx"}],I=["GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"];function A(t){return T(async o=>{const e=b(o);return await t({request:e})})}function H(t,o){const e=t.pathname.split("/").filter(Boolean),r=o.sort((s,a)=>{const n=s.routePath.split("/").filter(Boolean);return a.routePath.split("/").filter(Boolean).length-n.length}).filter(s=>{const a=s.routePath.split("/").filter(Boolean);return e.length>=a.length});for(const s of r){const a=s.routePath.split("/").filter(Boolean),n={};let p=!0;for(let l=0;l<a.length;l++){const u=a[l],c=e[l];if(u.startsWith("$"))if(u==="$"){const i=e.slice(l).join("/");if(i!=="")n["*"]=i,n._splat=i;else{p=!1;break}}else{const i=u.slice(1);n[i]=c}else if(u!==c){p=!1;break}}if(p)return{routePath:s.routePath,params:n,payload:s.payload}}}const f=v.filter(t=>t.$APIRoute);function k(t){const o=[];return t.forEach(e=>{const s=e.path.split("/").filter(Boolean).map(a=>a==="*splat"?"$":a.startsWith(":$")&&a.endsWith("?")?a.slice(1,-1):a).join("/");o.push({routePath:`/${s}`,payload:e})}),o}const q=async({request:t})=>{if(!f.length)return new Response("No routes found",{status:404});if(!I.includes(t.method))return new Response("Method not allowed",{status:405});const o=k(f),e=new URL(t.url,"http://localhost:3000"),r=H(e,o);if(!r)return new Response("Not found",{status:404});let s;try{s=await r.payload.$APIRoute.import().then(p=>p.Route)}catch(p){return console.error("Error importing route file:",p),new Response("Internal server error",{status:500})}if(!s)return new Response("Internal server error",{status:500});const a=t.method,n=s.methods[a];return n?await n({request:t,params:r.params}):new Response("Method not allowed",{status:405})},N=A(q);export{N as default};