import{a as n,r,j as o}from"./client-Cohd0s-V.js";import{C as a}from"./Container-CTHYkkhn.js";import{A as i}from"./animated-link-DMhY6SY2.js";import{S as l}from"./spinner--VOBpjIs.js";import"./utils-DvkvUfV5.js";import"./index-4PomGbPO.js";function c(){const{isLoaded:s,isSignedIn:e,user:t}=n();return r.useEffect(()=>{console.log("Clerk state updated:",{isLoaded:s,isSignedIn:e})},[s,e]),o.jsx("section",{className:"",children:o.jsx("div",{className:"mx-auto h-screen content-center align-middle",children:o.jsxs("div",{className:"relative z-30 mx-auto max-w-4xl space-y-5 text-center",children:[o.jsxs("h2",{className:"mx-auto text-6xl font-extrabold tracking-tight lg:text-8xl",children:["Take control ",o.jsx("span",{className:"font-extralight",children:"of your stream"})]}),o.jsx("p",{className:"mx-auto max-w-2xl dark:text-gray-400",children:"Modern tools for the modern streamer."}),o.jsx("div",{className:"!my-16 flex justify-center",children:s?e?o.jsx(i,{to:"/dashboard",text:`HEY ${t?.username||"USER"} GO TO DASHBOARD`,glowColors:"bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]",focusRingColor:"ring-0",focusRingWidth:"ring-0",focusRingOffsetWidth:"ring-offset-0",focusVisibleRingColor:"ring-0",focusVisibleRingWidth:"ring-0",focusVisibleRingOffsetWidth:"ring-offset-0",focusBoxShadow:"shadow-none",focusVisibleBoxShadow:"shadow-none",className:"uppercase focus:outline-none",glowOpacity:.5}):o.jsx(i,{to:"/dashboard",text:"DASHBOARD",glowColors:"bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E]",focusRingColor:"ring-0",focusRingWidth:"ring-0",focusRingOffsetWidth:"ring-offset-0",focusVisibleRingColor:"ring-0",focusVisibleRingWidth:"ring-0",focusVisibleRingOffsetWidth:"ring-offset-0",focusBoxShadow:"shadow-none",focusVisibleBoxShadow:"shadow-none",glowOpacity:.5,className:"uppercase focus:outline-none"}):o.jsx(l,{className:"w-8 fill-violet-300 text-white"})})]})})})}const h=function(){return o.jsx(a,{isDashboard:!1,maxWidth:"full",padded:!1,children:o.jsx(c,{})})};export{h as component};