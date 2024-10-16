import{r as a,j as e,a as N,D as y,F as w,H as k,I as C}from"./client-Ddpp9KjH.js";import{t as m,D}from"./toast-03JOhH12.js";import{b as A,C as S}from"./Container-yaDMO35r.js";import{A as U}from"./index-Bm61uuZp.js";import{c as x}from"./createLucideIcon-BAFfFtTL.js";import"./utils-DRte1m1i.js";/**
 * @license lucide-react v0.452.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=x("CircleUser",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}],["path",{d:"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662",key:"154egf"}]]);/**
 * @license lucide-react v0.452.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=x("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]),l=({children:s,initialHeight:r=0,className:i="",animationDuration:t=.5,animationEase:c="easeInOut",springStiffness:u=500,springDamping:h=25,animateOnMount:p=!0,animateOnUpdate:g=!0,onAnimationComplete:j})=>{const[b,f]=a.useState(r),n=a.useRef(null);return a.useEffect(()=>{if(n.current){const o=new ResizeObserver(v=>{for(const d of v)d.target===n.current&&f(d.contentRect.height)});return o.observe(n.current),()=>{o.disconnect()}}},[]),e.jsx(U,{children:e.jsx(A.div,{className:`min-h-[100px] rounded-lg bg-white/10 p-4 shadow-lg backdrop-blur-lg ${i}`,initial:p?{opacity:0,height:r}:!1,animate:{opacity:1,height:g?`calc(${b}px + 2.2rem)`:"auto"},exit:{opacity:0,height:0},transition:{duration:t,ease:c,height:{type:"spring",stiffness:u,damping:h}},onAnimationComplete:j,children:e.jsx("div",{ref:n,children:s})})})},T=()=>{const{user:s}=N(),{userId:r}=y();if(!s||!r)return null;const i=c=>c.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),t=c=>{navigator.clipboard.writeText(c),m.success({title:"Copied to clipboard"})};return e.jsxs("div",{className:"",children:[e.jsxs("h2",{className:"relative mb-4 flex items-center gap-2 text-lg font-medium text-purple-400",children:[e.jsx(z,{})," User Details"]}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("img",{src:s.imageUrl,alt:"User",className:"h-16 w-16 rounded-full border-2 border-blue-400"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xl font-bold text-blue-300",children:`${s.username}`}),e.jsxs("div",{className:"flex items-center",children:[e.jsx("div",{className:"mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"}),e.jsx("p",{className:"text-sm text-green-400",children:"Active"})]})]})]}),e.jsxs("div",{className:"mt-4 grid grid-cols-2 gap-2 text-sm",children:[e.jsx("p",{className:"text-gray-800 dark:text-gray-200",children:"Last Sign In:"}),e.jsx("p",{className:"text-purple-200",children:i(s.lastSignInAt)}),e.jsx("p",{className:"text-gray-800 dark:text-gray-200",children:"Joined On:"}),e.jsx("p",{className:"text-purple-200",children:i(s.createdAt)}),e.jsx("p",{className:"text-gray-800 dark:text-gray-200",children:"User ID:"}),e.jsxs("div",{className:"flex items-center justify-between rounded bg-gray-700 px-2 py-1",children:[e.jsx("p",{className:"line-clamp-1 font-mono text-xs text-gray-300 blur-[1.8px]",children:s.id}),e.jsx("button",{onClick:()=>{t(s.id),m.success({title:"User ID copied to clipboard"})},className:"ml-2 text-blue-400 hover:text-blue-300",children:e.jsx(I,{className:"h-4 w-4"})})]})]})]})},L=()=>{const{session:s}=C(),r=s?.user.externalAccounts||[],i=t=>{switch(t.toLowerCase()){case"google":return e.jsx("img",{src:"/app/icons/filled/brand-youtube.svg",className:"h-5 w-5 invert",alt:"Google"});case"spotify":return e.jsx("img",{src:"/app/icons/filled/brand-spotify.svg",className:"h-5 w-5 invert",alt:"Spotify"});case"youtube":return e.jsx("img",{src:"/app/icons/filled/brand-youtube.svg",className:"h-5 w-5 invert",alt:"YouTube"});case"discord":return e.jsx("img",{src:"/app/icons/filled/brand-discord.svg",className:"h-5 w-5 invert",alt:"Discord"});case"tiktok":return e.jsx("img",{src:"/app/icons/filled/brand-tiktok.svg",className:"h-5 w-5 invert",alt:"TikTok"});case"twitch":return e.jsx("img",{src:"/app/icons/outline/brand-twitch.svg",className:"h-5 w-5 invert",alt:"Twitch"});case"facebook":return e.jsx("img",{src:"/app/icons/filled/brand-facebook.svg",className:"h-5 w-5 invert",alt:"Facebook"});case"twitter":return e.jsx("img",{src:"/app/icons/filled/brand-twitter.svg",className:"h-5 w-5 invert",alt:"Twitter"});default:return null}};return e.jsxs("div",{className:"",children:[e.jsx("div",{children:"test"}),e.jsxs("h2",{className:"mb-2 flex items-center text-lg font-bold text-purple-400",children:[e.jsx("svg",{className:"mr-2 h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 10V3L4 14h7v7l9-11h-7z"})}),"Connected Accounts"]}),r.length>0?e.jsx("div",{className:"space-y-2",children:r.map(t=>e.jsx("div",{className:"flex items-center justify-between rounded-md bg-white/5 p-2",children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-gray-600",children:i(t.provider)}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold text-blue-300",children:t.provider.replace("oauth_","")}),e.jsx("p",{className:"text-sm text-purple-200",children:t.username})]})]})},t.id))}):e.jsx("p",{className:"text-gray-300",children:"No connected accounts"})]})};function O(){const{organization:s}=w();return a.useState(null),a.useState(!1),a.useState(!1),a.useState(""),e.jsx(e.Fragment,{children:e.jsxs(S,{isDashboard:!0,maxWidth:"7xl",children:[e.jsx(D,{category:"Widgets",title:"Dashboard",description:"",keyModalText:"",buttonUrl:"",buttonText:"",backText:""}),e.jsxs("div",{className:"my-6",children:[e.jsx("div",{className:"my-2 text-right",children:e.jsx(k,{appearance:{elements:{organizationPreviewAvatarBox:"size-6"}}})}),e.jsxs("div",{className:"columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3",children:[e.jsx(l,{className:"mb-4 break-inside-avoid",children:e.jsx(T,{})}),s&&e.jsx(l,{className:"mb-4 break-inside-avoid",children:e.jsxs("div",{className:"break-inside-avoid",children:[e.jsx("h2",{className:"text-md mb-2 font-semibold text-purple-400",children:"Organization"}),e.jsx("p",{className:"text-sm text-blue-300",children:s.name}),e.jsx("p",{className:"text-xs text-purple-200",children:`${s.membersCount} members`})]})}),e.jsx(l,{className:"break-inside-avoid",children:e.jsx(L,{})})]})]})]})})}const V=O;export{V as component};