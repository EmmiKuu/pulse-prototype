import { useState, useRef, useEffect, useCallback } from "react";

const TEAL="#1D9E75",TEAL_LIGHT="#E1F5EE",TEAL_MID="#9FE1CB",BG="#F5F3EE",GRAY="#888780",BORDER="#D3D1C7",DARK="#2C2C2A";

const lisaMemory={
  name:"Lisa",age:38,condition:"Hypertension",medication:"Lisinopril 10mg",
  baselineBP:{systolic:142,diastolic:88},
  bpTrend:[142,140,138,136],
  weeklyBPAvg:[142,140,139,137,136,135,134,132],
  breathingSessions:7,checkInStreak:6,
  goals:["Reduce stress","Lower BP to under 130"],
  alexNote:"Alex reviewed your 8-week summary and flagged your BP trend as encouraging. He's available if you want to talk.",
};

const TONES=[{id:"friend",label:"Like a supportive friend",desc:"Warm, casual, encouraging"},{id:"facts",label:"Just the facts",desc:"Clear, direct, no fluff"},{id:"coach",label:"Keep me accountable",desc:"Motivating, honest, energetic"}];
const CHALLENGES=["I don't know what to eat","I'm too busy","I feel constantly stressed","I've tried before and it didn't stick","Something else, just tell me below"];
const TIMES=[{id:"morning",label:"Morning",sub:"Before 10am"},{id:"midday",label:"Midday",sub:"Around lunch"},{id:"evening",label:"Evening",sub:"After 6pm"}];
const WEEK2_STATUS=["On track","Bit harder","Really busy","Need support"];
const SUPPORT_AREAS=["Remind me to take BP readings","Help with diet","Exercise guidance","Stress management","Something else"];
const MEALS=["Salad & protein","Sandwich or wrap","Hot meal","I skipped it"];
const GOALS_12=["Keep my BP under 130 consistently","Build a daily movement habit","Manage stress before it affects my health"];
const REACTIONS=["👍","❤️","👎"];

const challengeResponses={
  "I don't know what to eat":"Food can feel overwhelming, especially with BP in the picture. We'll keep it simple — small swaps, not a whole new diet.",
  "I'm too busy":"Busy I can work with. We'll find the moments that already exist in your day — no extra time needed.",
  "I feel constantly stressed":"Stress and blood pressure are closely linked. We'll make managing that a real focus.",
  "I've tried before and it didn't stick":"That's honest — and more common than you'd think. Let's figure out what got in the way before, and build around that.",
};

const foodComments={
  "Salad & protein":"Solid choice — protein and greens keep your blood sugar steadier, which helps your BP too.",
  "Sandwich or wrap":"That works. Adding protein where you can helps keep energy more even through the afternoon.",
  "Hot meal":"Good. A warm meal in the morning tends to keep hunger at bay longer — less chance of a dip later.",
  "I skipped it":"That's the pattern — skipping meals is when your readings tend to run higher. Even something small makes a difference.",
  "photo":"Looks like a decent start to the day. Eating regularly really does help with your readings.",
  "voice":"Got it logged. Eating something — even light — tends to keep your BP more stable through the day.",
};

function getWeek4Opener(challenge){
  if(!challenge) return "Good evening, Lisa. 👋 I've been looking at your readings — want to take one now so we can see where things are today?";
  const c=challenge.toLowerCase();
  if(c.includes("eat")||c.includes("diet")||c.includes("food"))
    return "Good evening, Lisa. 👋 I've noticed a pattern — your BP tends to run a little higher on days when meals are rushed or skipped. Want to take a reading now so we can see where things are today?";
  if(c.includes("stress")||c.includes("sleep")||c.includes("busy")||c.includes("time"))
    return "Good evening, Lisa. 👋 I've been tracking something — your BP tends to spike on your more stressful days. Want to take a reading now and see how today looks?";
  return "Good evening, Lisa. 👋 I've noticed your BP has been responding to your daily patterns. Want to take a reading now so we can compare?";
}

function Avatar({who,size=30}){
  const cfg={phoenix:{bg:TEAL_LIGHT,color:TEAL,label:"P"},alex:{bg:"#FFF8E1",color:"#B8860B",label:"A"},user:{bg:"#E6F1FB",color:"#185FA5",label:"L"}}[who]||{bg:"#eee",color:"#888",label:"?"};
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:cfg.bg,color:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:600,border:`1.5px solid ${cfg.color}22`}}>{cfg.label}</div>;
}

function TypingDots(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,padding:"10px 14px",background:"#fff",border:`0.5px solid ${BORDER}`,borderRadius:"14px 14px 14px 3px",width:"fit-content"}}>
      {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:TEAL_MID,animation:"tdot 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
      <style>{`@keyframes tdot{0%,80%,100%{transform:scale(0.7);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Bubble({who,children,reaction,onReact}){
  const isUser=who==="user";
  const [pickerOpen,setPickerOpen]=useState(false);
  return(
    <div style={{display:"flex",flexDirection:isUser?"row-reverse":"row",alignItems:"flex-end",gap:7,marginBottom:12,position:"relative"}}>
      {!isUser&&<Avatar who={who} size={26}/>}
      <div style={{maxWidth:"78%",position:"relative"}}>
        {!isUser&&<div style={{fontSize:10,color:GRAY,marginBottom:3,fontWeight:500,paddingLeft:2}}>{who==="alex"?"Alex":"Phoenix"}</div>}
        <div style={{padding:"10px 14px",borderRadius:isUser?"16px 16px 3px 16px":"16px 16px 16px 3px",background:isUser?TEAL:who==="alex"?"#FFFBF0":"#fff",color:isUser?"#fff":DARK,border:isUser?"none":`0.5px solid ${who==="alex"?"#FFD54F":BORDER}`,fontSize:13,lineHeight:1.6,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
          {children}
        </div>
        {reaction&&<div onClick={()=>setPickerOpen(p=>!p)} style={{position:"absolute",bottom:-10,right:isUser?"auto":-6,left:isUser?-6:"auto",background:"#fff",borderRadius:20,border:`0.5px solid ${BORDER}`,padding:"1px 7px",fontSize:14,cursor:"pointer",userSelect:"none"}}>{reaction}</div>}
        {!isUser&&!reaction&&<button onClick={()=>setPickerOpen(p=>!p)} style={{position:"absolute",bottom:-10,right:-6,background:"#fff",borderRadius:20,border:`0.5px solid ${BORDER}`,padding:"1px 7px",fontSize:11,cursor:"pointer",color:GRAY,lineHeight:1.6}}>+</button>}
        {pickerOpen&&(
          <div style={{position:"absolute",bottom:-38,right:isUser?"auto":-6,left:isUser?-6:"auto",background:"#fff",border:`0.5px solid ${BORDER}`,borderRadius:20,padding:"4px 8px",display:"flex",gap:6,zIndex:10,boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
            {REACTIONS.map(r=><button key={r} onClick={()=>{onReact(reaction===r?null:r);setPickerOpen(false);}} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",opacity:reaction===r?1:0.6,transform:reaction===r?"scale(1.2)":"scale(1)",transition:"all 0.15s"}}>{r}</button>)}
            {reaction&&<button onClick={()=>{onReact(null);setPickerOpen(false);}} style={{fontSize:10,color:GRAY,background:"none",border:"none",cursor:"pointer",alignSelf:"center"}}>✕</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function DateSep({label}){
  return(
    <div style={{textAlign:"center",fontSize:11,color:GRAY,margin:"14px 0 10px",display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:0.5,background:BORDER}}/>{label}<div style={{flex:1,height:0.5,background:BORDER}}/>
    </div>
  );
}

function Card({children,accent}){
  return <div style={{background:accent?TEAL_LIGHT:"#fff",border:`0.5px solid ${accent?TEAL_MID:BORDER}`,borderRadius:14,padding:"12px 14px",marginTop:4,marginBottom:8,fontSize:13}}>{children}</div>;
}

function ChipRow({chips,onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8,marginLeft:33}}>
      {chips.map(c=>(
        <button key={c} onClick={()=>{setSel(c);setTimeout(()=>onSelect(c),300);}} style={{padding:"6px 14px",borderRadius:20,fontSize:12.5,border:`0.5px solid ${sel===c?TEAL:TEAL_MID}`,background:sel===c?TEAL:"#fff",color:sel===c?"#fff":TEAL,cursor:"pointer",fontWeight:sel===c?500:400,transition:"all 0.15s"}}>{c}</button>
      ))}
    </div>
  );
}

function ToneCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>How should I talk to you?</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {TONES.map(t=>(
          <button key={t.id} onClick={()=>{setSel(t.id);setTimeout(()=>onSelect(t),350);}} style={{padding:"9px 12px",borderRadius:12,textAlign:"left",border:`0.5px solid ${sel===t.id?TEAL:BORDER}`,background:sel===t.id?TEAL_LIGHT:"#fff",cursor:"pointer"}}>
            <div style={{fontSize:12.5,fontWeight:500,color:sel===t.id?"#0F6E56":DARK}}>{t.label}</div>
            <div style={{fontSize:11,color:GRAY,marginTop:2}}>{t.desc}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function ChallengeCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>What's hardest for you right now?</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {CHALLENGES.map(c=>(
          <button key={c} onClick={()=>{setSel(c);setTimeout(()=>onSelect(c),350);}} style={{padding:"9px 12px",borderRadius:12,border:`0.5px solid ${sel===c?TEAL:BORDER}`,background:sel===c?TEAL_LIGHT:"#fff",color:sel===c?"#0F6E56":DARK,fontSize:12.5,textAlign:"left",cursor:"pointer",fontWeight:sel===c?500:400,fontStyle:c.includes("Something")?"italic":"normal"}}>{c}</button>
        ))}
      </div>
    </Card>
  );
}

function TimeCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>When's the best time for me to check in with you?</div>
      <div style={{display:"flex",gap:7}}>
        {TIMES.map(t=>(
          <button key={t.id} onClick={()=>{setSel(t.id);setTimeout(()=>onSelect(t.label),350);}} style={{flex:1,padding:"11px 6px",borderRadius:12,textAlign:"center",border:`0.5px solid ${sel===t.id?TEAL:BORDER}`,background:sel===t.id?TEAL_LIGHT:"#fff",cursor:"pointer"}}>
            <div style={{fontSize:12.5,fontWeight:500,color:sel===t.id?"#0F6E56":DARK}}>{t.label}</div>
            <div style={{fontSize:10,color:GRAY,marginTop:2}}>{t.sub}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Week1RecapCard({challenge,bp,time,onConfirm}){
  const [confirmed,setConfirmed]=useState(false);
  const displayChallenge=challenge&&challenge.includes("Something else")?"Let me know below":challenge||"Getting started";
  return(
    <Card accent>
      <div style={{fontSize:11,color:"#0F6E56",fontWeight:500,marginBottom:10}}>Here's what I've got from Week 1</div>
      {[{label:"Your biggest challenge",val:displayChallenge},{label:"Baseline BP",val:`${bp?.systolic}/${bp?.diastolic} mmHg`},{label:"Best check-in time",val:time||"Evening"}].map(item=>(
        <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`0.5px solid ${TEAL_MID}`}}>
          <div style={{fontSize:11,color:GRAY}}>{item.label}</div>
          <div style={{fontSize:12,fontWeight:500,color:DARK}}>{item.val}</div>
        </div>
      ))}
      {!confirmed&&(
        <div style={{marginTop:10,display:"flex",gap:6}}>
          <button onClick={()=>{setConfirmed(true);onConfirm("correct");}} style={{flex:1,padding:"7px",borderRadius:20,background:TEAL,color:"#fff",border:"none",fontSize:12,cursor:"pointer",fontWeight:500}}>Yes, that's right</button>
          <button onClick={()=>{setConfirmed(true);onConfirm("correct_some");}} style={{flex:1,padding:"7px",borderRadius:20,background:"#fff",color:TEAL,border:`0.5px solid ${TEAL}`,fontSize:12,cursor:"pointer"}}>Some of this is off</button>
        </div>
      )}
      {confirmed&&<div style={{marginTop:8,fontSize:12,color:"#0F6E56",textAlign:"center"}}>Got it ✓</div>}
    </Card>
  );
}

function StatusCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>How's this week going so far?</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {WEEK2_STATUS.map(s=>(
          <button key={s} onClick={()=>{setSel(s);setTimeout(()=>onSelect(s),350);}} style={{padding:"11px 8px",borderRadius:12,border:`0.5px solid ${sel===s?TEAL:BORDER}`,background:sel===s?TEAL_LIGHT:"#fff",color:sel===s?"#0F6E56":DARK,fontSize:12.5,fontWeight:sel===s?500:400,cursor:"pointer"}}>{s}</button>
        ))}
      </div>
    </Card>
  );
}

function SupportCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>What's the main thing you want support on?</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {SUPPORT_AREAS.map(s=>(
          <button key={s} onClick={()=>{setSel(s);setTimeout(()=>onSelect(s),350);}} style={{padding:"9px 12px",borderRadius:12,border:`0.5px solid ${sel===s?TEAL:BORDER}`,background:sel===s?TEAL_LIGHT:"#fff",color:sel===s?"#0F6E56":DARK,fontSize:12.5,textAlign:"left",cursor:"pointer",fontWeight:sel===s?500:400}}>{s}</button>
        ))}
      </div>
    </Card>
  );
}

function BreathingCard({onComplete}){
  const [phase,setPhase]=useState("ready");
  const [count,setCount]=useState(4);
  const timerRef=useRef(null);
  const phases=["inhale","hold","exhale","done"];
  const dur={inhale:4,hold:4,exhale:6};
  const lbl={inhale:"Breathe in",hold:"Hold",exhale:"Breathe out",ready:"4-4-6 breathing",done:"Done ✓"};
  function start(){setPhase("inhale");setCount(4);run("inhale",4);}
  function run(p,c){
    if(c>0){timerRef.current=setTimeout(()=>{setCount(c-1);run(p,c-1);},1000);}
    else{
      const idx=phases.indexOf(p),next=phases[idx+1];
      if(next&&next!=="done"){setPhase(next);setCount(dur[next]);run(next,dur[next]);}
      else{setPhase("done");setTimeout(()=>onComplete&&onComplete(),600);}
    }
  }
  const sz=phase==="inhale"?60:phase==="hold"?60:42;
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:8}}>Breathing exercise</div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0"}}>
        <div style={{width:sz,height:sz,borderRadius:"50%",background:TEAL_LIGHT,border:`2px solid ${TEAL}`,transition:"all 0.8s ease",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:TEAL,fontWeight:500}}>
          {phase==="ready"?"":phase==="done"?"✓":count}
        </div>
        <div style={{fontSize:13,color:DARK,marginTop:10,fontWeight:500}}>{lbl[phase]}</div>
        {phase==="ready"&&<button onClick={start} style={{marginTop:10,padding:"6px 20px",borderRadius:20,background:TEAL,color:"#fff",border:"none",fontSize:12,cursor:"pointer",fontWeight:500}}>Start</button>}
      </div>
    </Card>
  );
}

function MealCard({onSelect}){
  const [sel,setSel]=useState(null);
  const [mode,setMode]=useState("options");
  const fileRef=useRef();
  if(mode==="photo") return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:8}}>Upload a photo of your meal</div>
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={()=>{setTimeout(()=>onSelect("photo"),300);}}/>
      <button onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"10px",borderRadius:12,border:`0.5px dashed ${TEAL}`,background:TEAL_LIGHT,color:"#0F6E56",fontSize:12,cursor:"pointer"}}>📷 Tap to upload photo</button>
      <button onClick={()=>setMode("options")} style={{marginTop:6,fontSize:11,color:GRAY,background:"none",border:"none",cursor:"pointer"}}>← Back</button>
    </Card>
  );
  if(mode==="voice") return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:8}}>Tell me what you ate</div>
      <div style={{textAlign:"center",padding:"10px 0"}}>
        <div style={{fontSize:28,marginBottom:6}}>🎙️</div>
        <div style={{fontSize:12,color:GRAY,marginBottom:10}}>Tap and speak</div>
        <button onClick={()=>{setTimeout(()=>onSelect("voice"),800);}} style={{padding:"6px 20px",borderRadius:20,background:TEAL,color:"#fff",border:"none",fontSize:12,cursor:"pointer"}}>Record</button>
      </div>
      <button onClick={()=>setMode("options")} style={{fontSize:11,color:GRAY,background:"none",border:"none",cursor:"pointer"}}>← Back</button>
    </Card>
  );
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:8}}>Log your meal</div>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <button onClick={()=>setMode("photo")} style={{flex:1,padding:"8px",borderRadius:12,border:`0.5px solid ${BORDER}`,background:"#fff",fontSize:12,cursor:"pointer"}}>📷 Photo</button>
        <button onClick={()=>setMode("voice")} style={{flex:1,padding:"8px",borderRadius:12,border:`0.5px solid ${BORDER}`,background:"#fff",fontSize:12,cursor:"pointer"}}>🎙️ Voice</button>
      </div>
      <div style={{fontSize:11,color:GRAY,marginBottom:7}}>Or pick quickly:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {MEALS.map(m=>(
          <button key={m} onClick={()=>{setSel(m);setTimeout(()=>onSelect(m),350);}} style={{padding:"8px",borderRadius:12,border:`0.5px solid ${sel===m?TEAL:BORDER}`,background:sel===m?TEAL_LIGHT:"#fff",color:sel===m?"#0F6E56":DARK,fontSize:12,cursor:"pointer"}}>{m}</button>
        ))}
      </div>
    </Card>
  );
}

function StreakCard({label,count,emoji,celebrate}){
  return(
    <Card accent={celebrate}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:26}}>{emoji}</div>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:DARK}}>{label}</div>
          <div style={{fontSize:11,color:"#0F6E56"}}>{count} in a row</div>
        </div>
        {celebrate&&<div style={{marginLeft:"auto",fontSize:20}}>🎉</div>}
      </div>
    </Card>
  );
}

function ProgressCard({title,value,sub,trend}){
  return(
    <Card accent>
      <div style={{fontSize:10,color:"#0F6E56",fontWeight:500,marginBottom:5}}>{title}</div>
      <div style={{fontSize:22,fontWeight:500,color:DARK}}>{value}</div>
      <div style={{fontSize:11,color:GRAY,marginTop:2}}>{sub}</div>
      {trend&&<div style={{display:"flex",alignItems:"flex-end",gap:3,height:22,marginTop:8}}>{trend.map((v,i)=><div key={i} style={{width:9,borderRadius:2,height:Math.max(4,Math.round((v/145)*20)),background:i===trend.length-1?TEAL:TEAL_MID}}/>)}</div>}
    </Card>
  );
}

function BPCard({systolic,diastolic,trend,sub,baseline}){
  const max=148,min=128;
  return(
    <Card accent>
      <div style={{fontSize:10,color:"#0F6E56",fontWeight:500,marginBottom:6}}>BP reading</div>
      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
        <div style={{fontSize:24,fontWeight:500,color:DARK}}>{systolic}/{diastolic}</div>
        <div style={{fontSize:12,color:GRAY}}>mmHg</div>
      </div>
      {baseline&&<div style={{fontSize:11,color:GRAY,marginBottom:4}}>Week 1 baseline: <span style={{color:DARK,fontWeight:500}}>{baseline.systolic}/{baseline.diastolic}</span><span style={{color:TEAL,fontWeight:500,marginLeft:8}}>↓ {baseline.systolic-systolic} pts</span></div>}
      {sub&&<div style={{fontSize:11,color:"#0F6E56",marginBottom:6}}>{sub}</div>}
      {trend&&<div style={{display:"flex",alignItems:"flex-end",gap:3,height:22,marginTop:6}}>{trend.map((v,i)=><div key={i} style={{width:9,borderRadius:2,height:Math.max(4,Math.round(((v-min)/(max-min))*18+4)),background:i===trend.length-1?TEAL:TEAL_MID}}/>)}</div>}
    </Card>
  );
}

function StoryCard(){
  return(
    <Card accent>
      <div style={{fontSize:11,color:"#0F6E56",fontWeight:500,marginBottom:10}}>Your 12-week story</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        {[
          {label:"Avg systolic BP",val:"133 mmHg",sub:"Was 142 at start"},
          {label:"Check-in streak",val:"12 weeks",sub:"Every week"},
          {label:"Breathing sessions",val:"7 completed",sub:"Your reset button"},
          {label:"BP readings logged",val:"28 total",sub:"You showed up"},
        ].map(s=>(
          <div key={s.label} style={{background:"#fff",borderRadius:10,padding:"8px 10px",border:`0.5px solid ${TEAL_MID}`}}>
            <div style={{fontSize:10,color:GRAY}}>{s.label}</div>
            <div style={{fontSize:14,fontWeight:500,color:DARK}}>{s.val}</div>
            <div style={{fontSize:10,color:"#0F6E56"}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:"#0F6E56",textAlign:"center",padding:"6px 0"}}>Tap to share with Alex →</div>
    </Card>
  );
}

function GoalCard({onSelect}){
  const [sel,setSel]=useState(null);
  return(
    <Card>
      <div style={{fontSize:12,fontWeight:500,color:DARK,marginBottom:10}}>What do you want to focus on next?</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {GOALS_12.map(g=>(
          <button key={g} onClick={()=>{setSel(g);setTimeout(()=>onSelect(g),350);}} style={{padding:"10px 12px",borderRadius:12,textAlign:"left",border:`0.5px solid ${sel===g?TEAL:BORDER}`,background:sel===g?TEAL_LIGHT:"#fff",color:sel===g?"#0F6E56":DARK,fontSize:12.5,cursor:"pointer",lineHeight:1.5,fontWeight:sel===g?500:400}}>{g}</button>
        ))}
      </div>
    </Card>
  );
}

function FloatingHearts({active,onDone}){
  useEffect(()=>{if(active){const t=setTimeout(onDone,2500);return()=>clearTimeout(t);}},[active]);
  if(!active) return null;
  return(
    <div style={{position:"absolute",bottom:70,left:0,right:0,pointerEvents:"none",zIndex:20}}>
      {["❤️","💚","❤️","💚","❤️","💚","❤️"].map((e,i)=>(
        <div key={i} style={{position:"absolute",left:`${6+i*13}%`,bottom:0,fontSize:22,animation:"fheart 2.2s ease-out forwards",animationDelay:`${i*0.13}s`,opacity:0}}>{e}</div>
      ))}
      <style>{`@keyframes fheart{0%{opacity:0;transform:translateY(0) scale(0.6)}15%{opacity:1;transform:translateY(-10px) scale(1)}85%{opacity:0.8}100%{opacity:0;transform:translateY(-160px) scale(0.8)}}`}</style>
    </div>
  );
}

function FloatingParty({active,onDone}){
  useEffect(()=>{if(active){const t=setTimeout(onDone,2500);return()=>clearTimeout(t);}},[active]);
  if(!active) return null;
  return(
    <div style={{position:"absolute",bottom:70,left:0,right:0,pointerEvents:"none",zIndex:20}}>
      {["🎉","🎊","🎉","🎊","🎉","🎊","🎉"].map((e,i)=>(
        <div key={i} style={{position:"absolute",left:`${6+i*13}%`,bottom:0,fontSize:22,animation:"fheart 2.2s ease-out forwards",animationDelay:`${i*0.13}s`,opacity:0}}>{e}</div>
      ))}
      <style>{`@keyframes fheart{0%{opacity:0;transform:translateY(0) scale(0.6)}15%{opacity:1;transform:translateY(-10px) scale(1)}85%{opacity:0.8}100%{opacity:0;transform:translateY(-160px) scale(0.8)}}`}</style>
    </div>
  );
}

function MemoryDrawer({week,memory,open,onClose}){
  const challengeLabel=memory.challenge&&!memory.challenge.includes("Something else")?memory.challenge:"Getting started";
  const items={
    1:[
      memory.tone&&{wk:1,label:"Tone preference",val:memory.tone},
      memory.challenge&&{wk:1,label:"Biggest challenge",val:challengeLabel},
      memory.preferredTime&&{wk:1,label:"Check-in time",val:memory.preferredTime},
      {wk:1,label:"Baseline BP",val:"142/88 mmHg — first cuff reading"},
    ].filter(Boolean),
    2:[
      {wk:1,label:"Tone preference",val:memory.tone||"Supportive friend"},
      {wk:1,label:"Biggest challenge",val:challengeLabel},
      {wk:1,label:"Preferred check-in",val:memory.preferredTime||"Evening"},
      {wk:1,label:"Baseline BP",val:"142/88 mmHg"},
      memory.status&&{wk:2,label:"Week 2 check-in",val:memory.status},
      memory.support&&{wk:2,label:"Support focus",val:memory.support},
    ].filter(Boolean),
    4:[
      {wk:1,label:"Tone preference",val:memory.tone||"Supportive friend"},
      {wk:1,label:"Goal",val:"Reduce stress, lower BP"},
      {wk:2,label:"Key pattern",val:challengeLabel},
      {wk:3,label:"BP trend",val:"Readings improving week on week"},
      {wk:4,label:"Avg since Week 1",val:"Systolic down 6pts"},
      {wk:4,label:"Breathing sessions",val:"7 in a row"},
    ],
    8:[
      {wk:1,label:"Goal",val:"Reduce stress, lower BP"},
      {wk:4,label:"Check-in pattern",val:"3+ readings per week consistently"},
      {wk:5,label:"Breathing streak",val:"7 sessions completed"},
      {wk:6,label:"Exercise cue",val:"BP lower on days with movement"},
      {wk:7,label:"Barrier",val:"Stress flagged as main challenge"},
      {wk:8,label:"Alex note",val:"Reviewed — BP trend encouraging"},
    ],
    12:[
      {wk:1,label:"Original challenge",val:challengeLabel},
      {wk:1,label:"Original goal",val:"Reduce stress, lower BP under 130"},
      {wk:4,label:"BP trend",val:"Avg systolic: 142 → 133 mmHg"},
      {wk:8,label:"Breathing habit",val:"7 sessions — used in high-stress moments"},
      {wk:12,label:"Check-in streak",val:"12 consecutive weeks"},
      {wk:12,label:"New goal set",val:"Continue movement habit"},
    ],
  }[week]||[];
  const streakDays={1:0,2:5,4:18,8:42,12:71}[week]||0;
  return(
    <div style={{position:"absolute",top:0,right:open?0:"-105%",width:"100%",height:"100%",background:BG,transition:"right 0.28s ease",zIndex:30,overflowY:"auto",borderRadius:20}}>
      <div style={{padding:"14px 14px 10px",borderBottom:`0.5px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10,background:"#fff"}}>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:GRAY,lineHeight:1}}>←</button>
        <div>
          <div style={{fontSize:13,fontWeight:500,color:DARK}}>Lisa's story so far</div>
          <div style={{fontSize:11,color:GRAY}}>Week {week} · {items.length} things Phoenix knows</div>
        </div>
      </div>
      {streakDays>0&&(
        <div style={{margin:"12px 14px 0",padding:"10px 14px",background:"#fff",border:`0.5px solid ${TEAL_MID}`,borderRadius:14,display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:22}}>🔥</div>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:DARK}}>{streakDays} days active</div>
            <div style={{fontSize:11,color:"#0F6E56"}}>Keep it going</div>
          </div>
        </div>
      )}
      <div style={{padding:14}}>
        <div style={{fontSize:11,color:GRAY,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>What Phoenix remembers</div>
        {items.map((item,i)=>(
          <div key={i} style={{background:"#fff",border:`0.5px solid ${BORDER}`,borderRadius:12,padding:"10px 13px",marginBottom:8}}>
            <div style={{fontSize:10,color:TEAL,fontWeight:500,marginBottom:3}}>{item.label}</div>
            <div style={{fontSize:13,color:DARK,lineHeight:1.4}}>{item.val}</div>
            <div style={{fontSize:10,color:GRAY,marginTop:4}}>Learned Week {item.wk}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App(){
  const [week,setWeek]=useState(1);
  const [memory,setMemory]=useState({tone:null,challenge:null,preferredTime:null,status:null,support:null});
  function updateMemory(k,v){setMemory(prev=>({...prev,[k]:v}));}
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1rem 0",fontFamily:"system-ui,sans-serif",background:"#E8E6E0",minHeight:"100vh"}}>
      <div style={{marginBottom:14,width:340}}>
        <div style={{fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Demo — select a week</div>
        <div style={{display:"flex",gap:6}}>
          {[1,2,4,8,12].map(w=>(
            <button key={w} onClick={()=>setWeek(w)} style={{flex:1,padding:"8px 2px",borderRadius:20,fontSize:12,fontWeight:500,border:`0.5px solid ${week===w?TEAL:BORDER}`,background:week===w?TEAL:"#fff",color:week===w?"#fff":GRAY,cursor:"pointer",transition:"all 0.15s"}}>Wk {w}</button>
          ))}
        </div>
      </div>
      <div style={{width:340,height:680,background:BG,borderRadius:40,border:"8px solid #1a1a1a",overflow:"hidden",position:"relative",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{height:10,background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:60,height:4,background:"#333",borderRadius:4}}/>
        </div>
        <div style={{height:"calc(100% - 10px)",overflow:"hidden",position:"relative"}}>
          <ChatScreen key={week} week={week} memory={memory} onMemoryUpdate={updateMemory}/>
        </div>
      </div>
      <div style={{marginTop:10,fontSize:11,color:"#666",textAlign:"center"}}>Tap <strong>i</strong> in the header · "Lisa's story so far"</div>
    </div>
  );
}

function ChatScreen({week,memory,onMemoryUpdate}){
  const [messages,setMessages]=useState([]);
  const [reactions,setReactions]=useState({});
  const [heartsActive,setHeartsActive]=useState(false);
  const [partyActive,setPartyActive]=useState(false);
  const [memOpen,setMemOpen]=useState(false);
  const [input,setInput]=useState("");
  const [isTyping,setIsTyping]=useState(false);
  const [inputHint,setInputHint]=useState(true);
  const [apiLoading,setApiLoading]=useState(false);
  const [showDoneUpdating,setShowDoneUpdating]=useState(false);
  const [userHasTyped,setUserHasTyped]=useState(false);
  const cs=useRef("idle");
  const w12Goal=useRef("");
  const bottomRef=useRef();
  const queueRef=useRef([]);
  const processingRef=useRef(false);
  const msgsRef=useRef([]);

  useEffect(()=>{msgsRef.current=messages;},[messages]);

  const addMsg=useCallback((msg)=>{
    setMessages(prev=>{
      const next=[...prev,{...msg,id:prev.length}];
      msgsRef.current=next;
      return next;
    });
  },[]);

  const processQueue=useCallback(async()=>{
    if(processingRef.current||queueRef.current.length===0) return;
    processingRef.current=true;
    while(queueRef.current.length>0){
      const item=queueRef.current.shift();
      if(item.type==="delay"){await new Promise(r=>setTimeout(r,item.ms));}
      else if(item.type==="typing"){setIsTyping(true);await new Promise(r=>setTimeout(r,item.ms||1200));setIsTyping(false);}
      else if(item.type==="msg"){addMsg(item.msg);await new Promise(r=>setTimeout(r,320));}
      else if(item.type==="hearts"){setHeartsActive(true);await new Promise(r=>setTimeout(r,2700));setHeartsActive(false);await new Promise(r=>setTimeout(r,200));}
      else if(item.type==="party"){
        setPartyActive(true);
        await new Promise(r=>setTimeout(r,2400));
        setPartyActive(false);
        await new Promise(r=>setTimeout(r,150));
      }
    }
    processingRef.current=false;
  },[addMsg]);

  function q(...items){queueRef.current.push(...items);processQueue();}
  function ps(text,delay=900){return [{type:"delay",ms:delay},{type:"typing",ms:Math.min(400+text.length*16,2000)},{type:"msg",msg:{from:"phoenix",text}}];}
  function pc(card,delay=600){return [{type:"delay",ms:delay},{type:"msg",msg:{from:"phoenix",...card}}];}

  useEffect(()=>{
    setMessages([]);setIsTyping(false);setHeartsActive(false);setPartyActive(false);
    queueRef.current=[];processingRef.current=false;
    setShowDoneUpdating(false);setUserHasTyped(false);
    cs.current="idle";w12Goal.current="";
    setTimeout(()=>startWeek(),200);
  },[week]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,isTyping]);

  function goToCuff(){
    q(...ps("Got it. Now let's take your very first BP reading together. Grab your cuff, wrap it around your upper arm, palm facing up. Take your reading and let me know when you're done."));
    cs.current="w1_awaiting_cuff";
  }

  function showSmallWin(){
    q(...ps("Let's take a quick reading — I want to show you something. Grab your cuff when you're ready and let me know.",800));
    cs.current="w2_awaiting_reading";
  }

  function startWeek(){
    if(week===1){
      q(
        {type:"msg",msg:{from:"phoenix",text:"Hi Lisa! 👋 I'm Phoenix, your health companion in Pulse.\n\nI'm here to support you — not lecture you. You can tap the cards I send, or just type anything you like below."}},
        ...ps("To get started, how should I talk to you?",1000),
        ...pc({card:"tone"},400),
      );
    } else if(week===2){
      q(...ps("Good to see you back, Lisa. Before anything else — here's what I've got from our first week together. Does this look right?",400),...pc({card:"recap"},400));
    } else if(week===4){
      const opener=getWeek4Opener(memory.challenge);
      q(...ps(opener,400),...pc({card:"chips",chips:["Yes, taking it now","Maybe later"],next:"w4_reading"},400));
    } else if(week===8){
      q(...ps("Eight weeks in, Lisa. You've taken at least 3 readings a week the whole time — that's genuinely great. Grab your cuff whenever you're ready and let me know.",400));
      cs.current="w8_awaiting_reading";
    } else if(week===12){
      q(...ps("Lisa. Twelve weeks. I want you to sit with that for a second before we do anything else.",400),...ps("Whenever you're ready — just say the word and I'll show you how far you've come.",1800));
      cs.current="w12_awaiting_start";
    }
  }

  function handleNext(next,value){
    if(next==="w1_tone_done"){
      q(...ps("Perfect. Now — what's been the biggest challenge when it comes to your health?"),...pc({card:"challenge"},400));
    } else if(next==="w1_challenge_done"){
      if(value==="Something else, just tell me below"){
        q(...ps("Of course — what is it?"));
        cs.current="w1_challenge_other";
      } else {
        const resp=challengeResponses[value]||"Got it.";
        q(...ps(resp),...ps("One last thing — when's the best time for me to check in with you?",1000),...pc({card:"time"},400));
      }
    } else if(next==="w1_time_done"){
      onMemoryUpdate("preferredTime",value);
      goToCuff();
    } else if(next==="w2_recap"){
      if(value==="correct_some"){
        q(...ps("No problem — what's off? Just tell me below."));
        setShowDoneUpdating(true);
        cs.current="w2_correction";
      } else {
        q(...ps("Great. How's this week going so far?"),...pc({card:"status"},400));
      }
    } else if(next==="w2_corrections_done"){
      setShowDoneUpdating(false);cs.current="idle";
      q(...ps("Got it — all updated. Thanks for keeping me accurate."));
      showSmallWin();
    } else if(next==="w2_status"){
      onMemoryUpdate("status",value);
      const resp={"On track":"Good to hear — let's keep that momentum.","Bit harder":"That's honest. Let's see where we can make things easier.","Really busy":"Busy weeks happen. We'll keep this short.","Need support":"I'm glad you said that. Let's figure out where to focus."}[value]||"Got it.";
      if(value==="Need support"||value==="Bit harder"){
        q(...ps(resp),...ps("What's the main thing you want support on?",800),...pc({card:"support"},400));
      } else {
        q(...ps(resp));
        showSmallWin();
      }
    } else if(next==="w2_support"){
      onMemoryUpdate("support",value);
      q(...ps(`${value} — noted. I'll shape your check-ins around that.`));
      showSmallWin();
    } else if(next==="w4_reading"){
      if(value==="Maybe later"){
        q(...ps("No problem. How about now — got a minute?"),...pc({card:"chips",chips:["Yes, ready now","Let's skip today"],next:"w4_reading_2"},400));
      } else {
        q(...pc({card:"bp",systolic:136,diastolic:84,trend:lisaMemory.bpTrend,baseline:lisaMemory.baselineBP,sub:"Trending down"},600),...ps("136/84 — it's come down from where you started. Want to do a quick breathing reset?"),...pc({card:"chips",chips:["Yes, let's do it","Skip it"],next:"w4_breath"},400));
      }
    } else if(next==="w4_reading_2"){
      if(value==="Yes, ready now"){
        q(...pc({card:"bp",systolic:136,diastolic:84,trend:lisaMemory.bpTrend,baseline:lisaMemory.baselineBP,sub:"Trending down"},600),...ps("136/84 — trending down. Want to do a quick breathing reset?"),...pc({card:"chips",chips:["Yes, let's do it","Skip it"],next:"w4_breath"},400));
      } else {
        q(...ps("That's fine — we'll pick it up next time. See you soon. 💚"));
      }
    } else if(next==="w4_breath"){
      if(value==="Yes, let's do it"){
        q(...ps("Great. Here we go 🌿"),...pc({card:"breathing"},400));
      } else {
        q(...ps("No worries — what did you have to eat today?"),...pc({card:"meal"},400));
      }
    } else if(next==="w4_afterbreath"){
      q(
        {type:"hearts"},
        ...ps("That's 7 breathing sessions in a row. 🌿 You've made this a habit."),
        ...pc({card:"streak",label:"Breathing sessions",count:7,emoji:"🌿",celebrate:true},400),
        ...ps("How did that feel?",800),
        ...pc({card:"chips",chips:["Calmer","About the same","Didn't really help"],next:"w4_postbreath"},400),
      );
    } else if(next==="w4_postbreath"){
      q(...ps(value==="Calmer"?"That's the one. What did you have to eat today?":"Noted. What did you have to eat today?"),...pc({card:"meal"},400));
    } else if(next==="w4_meallogged"){
      const fc=foodComments[value]||"Good to know — I'll factor that in.";
      const goal=String(memory.challenge||memory.support||"reducing stress and lowering your BP");
      q(
        ...ps(fc),
        ...pc({card:"progress",title:"Your BP progress",value:"↓ 6 pts",sub:"Avg systolic since Week 1",trend:lisaMemory.bpTrend},1000),
        ...pc({card:"streak",label:"Weekly check-ins",count:4,emoji:"📅",celebrate:true},800),
        {type:"hearts"},
        ...ps("4 weeks in a row. A habit forming. 💚",600),
        ...ps(`When we started, your focus was: "${goal}". Does that still feel like the right goal for the next four weeks?`,1400),
        ...pc({card:"chips",chips:["Yes, keep it","I want to adjust it"],next:"w4_goal_check"},400),
      );
    } else if(next==="w4_goal_check"){
      if(value==="Yes, keep it"){
        q(...ps("Good — keeping that locked in. See you next week. 💚"));
      } else {
        q(...ps("What would you change it to? Just type it below — I'll update your profile."));
        cs.current="w4_goal_update";
      }
    } else if(next==="w8_alex"){
      if(value==="I'd like that"){
        q({type:"msg",msg:{from:"alex"}},...ps("Great — he'll follow up with you directly.",800));
      } else {
        q(...ps("No problem — he's there when you're ready."));
      }
      q(
        ...ps("I've noticed something: your BP is lower on days you move. Even a short walk helps — and it's especially good right after eating.",1000),
        ...ps("Should we build a short walk into your weekly check-in?",800),
        ...pc({card:"chips",chips:["Yes, remind me","Maybe later"],next:"w8_walk"},400),
      );
    } else if(next==="w8_walk"){
      if(value==="Yes, remind me"){
        q(...ps("Done — I'll nudge you for a short walk, especially after meals. Small habit, real impact. 💚"));
      } else {
        q(...ps("No problem — it's there whenever you're ready to try it."));
      }
      q(...ps("Eight weeks ago you said you'd tried before and it hadn't stuck. This time looks different, Lisa. 💚",1000));
    } else if(next==="w12_goal_selected"){
      w12Goal.current=value;
      q(...ps(`${value} — good choice. What's one small thing you could do in the first week to get started on that?`));
      cs.current="w12_goal_followup1";
    }
  }

  async function callAPI(userText,systemExtra){
    const memStr=JSON.stringify({...lisaMemory,...memory});
    const toneInstr=memory.tone?.includes("facts")?"Be direct and concise.":memory.tone?.includes("accountable")?"Be energetic and motivating.":"Be warm and conversational like a supportive friend.";
    const extra=systemExtra||"";
    try{
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          system:`You are Phoenix, the AI health assistant inside Pulse. ${toneInstr} Here is what you know about Lisa: ${memStr}. ${extra} Keep responses to 2-3 sentences max. Be warm, specific, human. Never start with "Hey Lisa".`,
          messages:[{role:"user",content:userText}],
        }),
      });
      const data=await res.json();
      return data.content?.[0]?.text||"I'm here. Tell me more.";
    } catch {
      return "I'm here with you, Lisa.";
    }
  }

  async function handleSend(){
    if(!input.trim()) return;
    const text=input.trim();
    setInput("");setUserHasTyped(true);setInputHint(false);
    addMsg({from:"user",text});
    const state=cs.current;

    if(state==="w1_challenge_other"){
      setApiLoading(true);
      const reply=await callAPI(text,"Lisa just told you her main health challenge in her own words. Ask one specific, empathetic follow-up question about what she said. Do not give advice yet.");
      setApiLoading(false);
      q(...ps(reply,300));
      cs.current="w1_challenge_other_followup";
      return;
    }
    if(state==="w1_challenge_other_followup"){
      onMemoryUpdate("challenge",text);
      q(...ps("Thanks for sharing that. I'll keep it in mind."),...ps("One last thing — when's the best time for me to check in with you?",800),...pc({card:"time"},400));
      cs.current="idle";
      return;
    }
    if(state==="w1_awaiting_cuff"){
      q(
        ...pc({card:"bp",systolic:142,diastolic:88,sub:"Your starting point — we track from here"},400),
        ...ps("142/88 — that's your baseline. Not a problem, just a number. We work on it together. 💚"),
        ...ps("Thanks for sharing all this. The more we talk, the more useful I'll get.",1200),
        ...ps("One more thing before we wrap up — how are you feeling about all of this, honestly? Just write it.",1400),
      );
      cs.current="w1_honest_feelings";
      return;
    }
    if(state==="w1_honest_feelings"){
      setApiLoading(true);
      const reply=await callAPI(text,"Lisa just started Week 1 of a health program. She shared how she honestly feels about it. Respond warmly and specifically to what she said. Do NOT mention BP trends, streaks, or any progress data — she has just started. End on a brief encouraging note. This is the last message of Week 1.");
      setApiLoading(false);
      q(...ps(reply,300));
      cs.current="w1_done";
      return;
    }
    if(state==="w1_done"){
      return;
    }
    if(state==="w2_correction"){
      setApiLoading(true);
      const reply=await callAPI(text,"Lisa just told you something in her Week 1 profile is wrong. Ask one specific follow-up question directly related to what she just said. Be conversational, not clinical.");
      setApiLoading(false);
      q(...ps(reply,300));
      cs.current="w2_correction_followup";
      return;
    }
    if(state==="w2_correction_followup"){
      q(...ps("Got it — I've updated that. Thanks for keeping me accurate."));
      cs.current="idle";
      return;
    }
    if(state==="w2_awaiting_reading"){
      cs.current="idle";
      q(
        ...pc({card:"bp",systolic:140,diastolic:86,baseline:{systolic:142,diastolic:88},sub:"2 pts lower than Week 1",trend:[142,140]},400),
        ...ps("2 points lower than last week. That's the direction, Lisa. Small and real.",800),
        {type:"hearts"},
        ...ps("See you tomorrow. 💚",600),
      );
      return;
    }
    if(state==="w4_goal_update"){
      onMemoryUpdate("challenge",text);
      q(...ps(`Updated — "${text}" is your new focus. See you next week. 💚`));
      cs.current="idle";
      return;
    }
    if(state==="w8_awaiting_reading"){
      q(
        ...pc({card:"bp",systolic:132,diastolic:81,trend:lisaMemory.weeklyBPAvg,baseline:lisaMemory.baselineBP,sub:"Your lowest reading yet"},400),
        ...ps("132/81 — your lowest reading yet. 🎉"),
        ...pc({card:"streak",label:"Weekly check-ins",count:8,emoji:"📅",celebrate:true},600),
        {type:"party"},
        ...ps("What's felt hardest this week? Just tell me — no need to pick from a list.",800),
      );
      cs.current="w8_barrier";
      return;
    }
    if(state==="w8_barrier"){
      setApiLoading(true);
      const reply=await callAPI(text,"Lisa just told you what has been hardest for her this week. Ask one specific, empathetic follow-up question directly related to what she said. Do not give advice yet.");
      setApiLoading(false);
      q(...ps(reply,300));
      cs.current="w8_barrier_followup";
      return;
    }
    if(state==="w8_barrier_followup"){
      cs.current="idle";
      q(
        ...ps("That makes sense — I'll keep that in mind."),
        ...ps("Alex also got your 8-week summary and has been following your progress. Do you want to talk to him?",1200),
        ...pc({card:"chips",chips:["I'd like that","Maybe later"],next:"w8_alex"},400),
      );
      return;
    }
    if(state==="w12_awaiting_start"){
      cs.current="idle";
      q(...pc({card:"story"},400),{type:"hearts"},...ps("Twelve weeks. Your numbers tell one story — but the fact that you kept showing up tells another. How does it feel looking back?",800));
      cs.current="w12_reflection";
      return;
    }
    if(state==="w12_reflection"){
      cs.current="idle";
      q(...ps("That means a lot to hear. 💚"),...ps("Now would be a good moment to think about your goals for the next month. What do you want to focus on?",1000),...pc({card:"goal_12"},400));
      return;
    }
    if(state==="w12_goal_followup1"){
      q(
        ...ps(`${text} — I like that. And is there anything that might get in the way of that?`),
        ...pc({card:"chips",chips:["That's enough for now"],next:"w12_close"},400),
      );
      cs.current="w12_goal_followup2";
      return;
    }
    if(state==="w12_goal_followup2"){
      cs.current="w12_done";
      q(...ps("Good to know. I'll factor that in. That's everything — locked in. See you next week, Lisa. 💚"));
      return;
    }
    if(state==="w12_done"){
      return;
    }
    if(week<=1){
      q(...ps("Got it — I'm noting that. Keep going."));
      return;
    }
    setApiLoading(true);
    const reply=await callAPI(text,"Respond naturally to what Lisa just said. Keep it to 1-2 sentences. Do not open new topics.");
    setApiLoading(false);
    q(...ps(reply,300));
  }

  function renderMsg(msg,idx){
    if(!msg) return null;
    if(msg.from==="alex") return(
      <div key={idx} style={{display:"flex",alignItems:"flex-end",gap:7,marginBottom:12}}>
        <Avatar who="alex" size={26}/>
        <div>
          <div style={{fontSize:10,color:GRAY,marginBottom:3,fontWeight:500,paddingLeft:2}}>Alex</div>
          <div style={{padding:"10px 14px",background:"#FFFBF0",border:"0.5px solid #FFD54F",borderRadius:"16px 16px 16px 3px",fontSize:13,color:DARK,maxWidth:"74%",lineHeight:1.6}}>{lisaMemory.alexNote}</div>
        </div>
      </div>
    );
    const cardMap={
      tone:<ToneCard onSelect={t=>{onMemoryUpdate("tone",t.label);addMsg({from:"user",text:t.label});handleNext("w1_tone_done",t.label);}}/>,
      challenge:<ChallengeCard onSelect={c=>{onMemoryUpdate("challenge",c);addMsg({from:"user",text:c});handleNext("w1_challenge_done",c);}}/>,
      time:<TimeCard onSelect={v=>{addMsg({from:"user",text:v});handleNext("w1_time_done",v);}}/>,
      recap:<Week1RecapCard challenge={memory.challenge} bp={lisaMemory.baselineBP} time={memory.preferredTime} onConfirm={v=>{addMsg({from:"user",text:v==="correct"?"Yes, that's right":"Some of this is off"});handleNext("w2_recap",v);}}/>,
      status:<StatusCard onSelect={v=>{addMsg({from:"user",text:v});handleNext("w2_status",v);}}/>,
      support:<SupportCard onSelect={v=>{addMsg({from:"user",text:v});handleNext("w2_support",v);}}/>,
      breathing:<BreathingCard onComplete={()=>{addMsg({from:"user",text:"Done ✓"});handleNext("w4_afterbreath");}}/>,
      meal:<MealCard onSelect={v=>{addMsg({from:"user",text:v==="photo"?"📷 Photo uploaded":v==="voice"?"🎙️ Voice logged":v});handleNext("w4_meallogged",v);}}/>,
      story:<StoryCard/>,
      goal_12:<GoalCard onSelect={v=>{addMsg({from:"user",text:v});handleNext("w12_goal_selected",v);}}/>,
      progress:<ProgressCard title={msg.title} value={msg.value} sub={msg.sub} trend={msg.trend}/>,
      streak:<StreakCard label={msg.label} count={msg.count} emoji={msg.emoji} celebrate={msg.celebrate}/>,
      bp:<BPCard systolic={msg.systolic} diastolic={msg.diastolic} trend={msg.trend} sub={msg.sub} baseline={msg.baseline}/>,
      chips:<ChipRow chips={msg.chips} onSelect={c=>{
        addMsg({from:"user",text:c});
        if(c==="That's enough for now"){
          cs.current="w12_done";
          q(...ps("That's everything — locked in. See you next week, Lisa. 💚"));
          return;
        }
        handleNext(msg.next,c);
      }}/>,
    };
    if(msg.card&&cardMap[msg.card]) return <div key={idx} style={{marginBottom:8,paddingLeft:msg.from==="phoenix"?33:0}}>{cardMap[msg.card]}</div>;
    if(msg.text) return(
      <div key={idx}>
        <Bubble who={msg.from} reaction={reactions[idx]} onReact={r=>setReactions(prev=>({...prev,[idx]:r}))}>
          {msg.text.split("\n").map((l,i)=><span key={i}>{l}{i<msg.text.split("\n").length-1&&<br/>}</span>)}
        </Bubble>
      </div>
    );
    return null;
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>
      <div style={{padding:"10px 14px 8px",background:"#fff",borderBottom:`0.5px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{display:"flex"}}>
          <Avatar who="phoenix" size={28}/>
          <div style={{marginLeft:-8}}><Avatar who="alex" size={28}/></div>
          <div style={{marginLeft:-8}}><Avatar who="user" size={28}/></div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:DARK}}>Your care team</div>
          <div style={{fontSize:11,color:GRAY}}>Phoenix · Alex · You</div>
        </div>
        <button onClick={()=>setMemOpen(true)} style={{width:28,height:28,borderRadius:"50%",border:`0.5px solid ${BORDER}`,background:"#fff",fontSize:12,cursor:"pointer",color:GRAY,display:"flex",alignItems:"center",justifyContent:"center",fontStyle:"italic",fontWeight:600}}>i</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"12px 12px 6px",background:BG}}>
        <DateSep label={`Week ${week}`}/>
        {messages.map((m,i)=>renderMsg(m,i))}
        {showDoneUpdating&&userHasTyped&&(
          <div style={{marginLeft:33,marginTop:4,marginBottom:8}}>
            <button onClick={()=>{addMsg({from:"user",text:"Done updating"});handleNext("w2_corrections_done");}} style={{padding:"6px 16px",borderRadius:20,fontSize:12.5,border:`0.5px solid ${TEAL_MID}`,background:"#fff",color:TEAL,cursor:"pointer"}}>Done updating</button>
          </div>
        )}
        {(isTyping||apiLoading)&&(
          <div style={{display:"flex",alignItems:"flex-end",gap:7,marginBottom:12}}>
            <Avatar who="phoenix" size={26}/>
            <TypingDots/>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <FloatingHearts active={heartsActive} onDone={()=>setHeartsActive(false)}/>
      <FloatingParty active={partyActive} onDone={()=>setPartyActive(false)}/>

      <div style={{padding:"8px 12px",background:"#fff",borderTop:`0.5px solid ${BORDER}`,flexShrink:0}}>
        {inputHint&&week===1&&<div style={{fontSize:11,color:GRAY,marginBottom:5,paddingLeft:2}}>Tap a card above, or type anything here ↓</div>}
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button style={{width:28,height:28,borderRadius:"50%",border:`0.5px solid ${BORDER}`,background:"#fff",fontSize:16,cursor:"pointer",color:GRAY,flexShrink:0}}>+</button>
          <input value={input} onChange={e=>{setInput(e.target.value);if(e.target.value)setUserHasTyped(true);}} onKeyDown={e=>e.key==="Enter"&&handleSend()}
            placeholder="Type anything…"
            style={{flex:1,background:"#F1EFE8",border:"none",borderRadius:20,padding:"9px 14px",fontSize:13,color:DARK,outline:"none"}}/>
          <button onClick={handleSend} style={{width:30,height:30,borderRadius:"50%",background:TEAL,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <MemoryDrawer week={week} memory={memory} open={memOpen} onClose={()=>setMemOpen(false)}/>
    </div>
  );
}
