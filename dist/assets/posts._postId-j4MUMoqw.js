import{j as t,E as r,A as n,L as p}from"./client-Ddpp9KjH.js";import{u as i,a}from"./posts-EEgmJ0b1.js";import"./useBaseQuery-C_OcHt8X.js";function u({error:e}){return t.jsx(r,{error:e})}const m=function(){const{postId:o}=n.useParams(),s=i(a(o));return t.jsxs("div",{className:"space-y-2",children:[t.jsx("h4",{className:"text-xl font-bold underline",children:s.data.title}),t.jsx("div",{className:"text-sm",children:s.data.body}),t.jsx(p,{to:"/posts/$postId/deep",params:{postId:s.data.id},activeProps:{className:"text-black font-bold"},className:"block py-1 text-blue-800 hover:text-blue-600",children:"Deep View"})]})},x=async({params:{postId:e},context:o})=>({title:(await o.queryClient.ensureQueryData(a(e))).title});export{u as PostErrorComponent,m as component,x as loader};
