(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'}).format(value);
  const round = value => Math.round(value * 100) / 100;
  const recipes = {
    classic: {name:'Classic chocolate chip',cost:.5,price:2,demand:1,appetite:'Balanced',description:'The neighborhood favorite. Balanced costs and broad appeal.',color:'#b88556'},
    double: {name:'Double chocolate',cost:.75,price:2.75,demand:.95,appetite:'A little selective',description:'Rich cocoa dough with chocolate chunks. Higher costs, higher price potential.',color:'#6e4335'},
    oatmeal: {name:'Oatmeal & honey',cost:.4,price:1.75,demand:1.1,appetite:'Extra popular',description:'A wholesome everyday treat. Lower costs and 10% more demand at its suggested price.',color:'#d3ad62'},
    velvet: {name:'Red velvet',cost:1,price:3.5,demand:.8,appetite:'Premium niche',description:'A luxurious red velvet cookie. Premium pricing, but 20% fewer buyers at its suggested price.',color:'#ae5056'}
  };
  const recipe = () => recipes[$('cookie-type').value] || recipes.classic;
  function updateRecipe() {
    const r=recipe();
    $('recipe-description').textContent=r.description;
    $('recipe-cost').textContent=money(r.cost)+' each';
    $('unit-cost').textContent=money(r.cost)+' each';
    $('recipe-price').textContent=money(r.price);
    $('recipe-demand').textContent=r.appetite;
  }
  const events = [
    {title:'A fresh start',copy:'The neighborhood is ready to meet its new cookie shop.',factor:1},
    {title:'A sunny stroll',copy:'Beautiful weather brings extra visitors past your window.',factor:1.15},
    {title:'Rain on the windows',copy:'A rainy day means fewer people out and about.',factor:.78},
    {title:'Office treat day',copy:'Nearby offices are looking for an afternoon pick-me-up.',factor:1.25},
    {title:'A quiet neighborhood',copy:'Foot traffic is a little slower today. Plan your batch wisely.',factor:.9},
    {title:'Weekend wanderers',copy:'Shoppers are out exploring, with room for a sweet treat.',factor:1.3},
    {title:'Sunday comforts',copy:'A cozy cookie is on everyone’s wish list.',factor:1.1}
  ];
  let state = {cash:100,history:[]};
  try { const saved=JSON.parse(localStorage.getItem('kevins-cookie-shop-v1')); if(saved && Number.isFinite(saved.cash) && Array.isArray(saved.history) && saved.history.length<=30) state=saved; } catch {}
  // Older main-game saves used only classic cookies; retain their original economics.
  state.history = state.history.map(r => ({...r,cookieType: recipes[r.cookieType] ? r.cookieType : 'classic',unitCost: Number.isFinite(r.unitCost) ? r.unitCost : .5}));
  const inputs = ['quantity','price','advertising','cookie-type'];
  if(state.history.length) $('cookie-type').value=state.history[state.history.length-1].cookieType || 'classic';
  updateRecipe();
  let shopIsOpen = false;
  let stopShow = null;
  function drawBouncer(ctx, elapsed, reduced) {
    const sway = reduced ? 0 : Math.sin(elapsed / 450) * 1.8;
    ctx.save(); ctx.translate(650, 255 + sway);
    // Bruno: a mountain of a doorman, with crossed arms and one tiny cookie badge.
    ctx.fillStyle='#18332f'; ctx.beginPath();ctx.ellipse(0,90,58,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#242c35';ctx.fillRect(-34,48,27,40);ctx.fillRect(7,48,27,40);
    ctx.fillStyle='#131d25';ctx.fillRect(-44,80,38,13);ctx.fillRect(6,80,38,13);
    ctx.fillStyle='#36434d';ctx.beginPath();ctx.roundRect(-60,-32,120,94,24);ctx.fill();
    ctx.fillStyle='#e5b183';ctx.beginPath();ctx.roundRect(-31,-99,62,70,23);ctx.fill();
    ctx.fillStyle='#292f36';ctx.beginPath();ctx.roundRect(-32,-103,64,24,12);ctx.fill();
    ctx.fillStyle='#101a21';ctx.fillRect(-29,-76,26,16);ctx.fillRect(3,-76,26,16);ctx.fillRect(-5,-72,10,4);
    ctx.strokeStyle='#f2cf9f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-25,-74);ctx.lineTo(-18,-71);ctx.moveTo(8,-74);ctx.lineTo(15,-71);ctx.stroke();
    ctx.strokeStyle='#653d30';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-44);ctx.lineTo(12,-47);ctx.stroke();
    ctx.strokeStyle='#242f38';ctx.lineWidth=26;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-44,-8);ctx.lineTo(29,26);ctx.moveTo(44,-8);ctx.lineTo(-29,26);ctx.stroke();
    ctx.fillStyle='#e5b183';ctx.beginPath();ctx.ellipse(27,25,13,10,.3,0,Math.PI*2);ctx.ellipse(-27,25,13,10,-.3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8be73';ctx.beginPath();ctx.arc(37,-19,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#74492d';ctx.beginPath();ctx.arc(34,-21,2,0,Math.PI*2);ctx.arc(41,-17,2,0,Math.PI*2);ctx.arc(35,-14,2,0,Math.PI*2);ctx.fill();
    ctx.textAlign='center';ctx.fillStyle='#fff5dc';ctx.font='bold 10px sans-serif';ctx.fillText('BRUNO',0,52);
    ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.roundRect(-91,-157,182,35,10);ctx.fill();
    ctx.fillStyle='#304b3b';ctx.font='bold 12px sans-serif';
    ctx.fillText(Math.floor(elapsed/2200)%2 ? 'PAY. THEN NOM NOM.' : 'NO COOKIE CRIMES.',0,-135);
    ctx.restore();
  }
  function animateShop(r) {
    shopIsOpen = true;
    const dialog = $('shop-show'), canvas = $('shop-canvas'), ctx = canvas.getContext('2d');
    const duration = Math.max(1000, r.sold * 100);
    const lifetime = Math.min(1000, duration);
    const spacing = r.sold > 1 ? (duration - lifetime) / (r.sold - 1) : 0;
    const faces = ['😎','🤠','🥸','🤓','👽','🤖','😺','🥳','🦄','🐸'];
    const colors = ['#db845d','#7e9bba','#c0a057','#957bb2','#71a18d'];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame, started, finished = false;
    $('show-title').textContent = `Day ${r.day}: ${recipes[r.cookieType].name} time!`;
    $('show-caption').textContent = r.sold ? 'One cookie per customer. Bruno is watching. Nobody dares steal a crumb.' : 'No customers today. Tomorrow is a fresh batch of possibilities.';
    $('customer-target').textContent = `/ ${r.sold.toLocaleString()} customers served`;
    $('customer-count').textContent = '0'; $('show-revenue').textContent = money(0);
    $('show-progress').style.width = '0%';
    function finish() {
      if (finished) return;
      finished = true; cancelAnimationFrame(frame); shopIsOpen = false; stopShow = null;
      if (dialog.open) dialog.close();
      render(); $('results-title').setAttribute('tabindex','-1'); $('results-title').focus({preventScroll:true});
    }
    stopShow = finish;
    function draw(now) {
      if (finished) return;
      if (started === undefined) started = now;
      const elapsed = Math.min(now - started, duration);
      ctx.clearRect(0,0,900,420);
      ctx.fillStyle='#e9f0e0';ctx.fillRect(0,0,900,420);
      ctx.fillStyle='#d5e0c7';ctx.beginPath();ctx.ellipse(160,260,300,95,0,0,Math.PI*2);ctx.ellipse(790,250,300,90,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f8efd9';ctx.fillRect(0,305,900,115);
      ctx.fillStyle='#e6d3a8';ctx.fillRect(300,105,300,205);
      ctx.fillStyle='#254e41';ctx.fillRect(282,58,336,53);
      ctx.textAlign='center';ctx.fillStyle='#fff5d8';ctx.font='bold 23px Georgia';ctx.fillText("KEVIN’S COOKIE SHOP",450,92);
      for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#f7efd7':'#72987b';ctx.fillRect(280+i*34,111,34,40);ctx.beginPath();ctx.arc(297+i*34,151,17,0,Math.PI);ctx.fill();}
      ctx.fillStyle='#fff8e5';ctx.fillRect(325,181,250,81);ctx.fillStyle='#6e9380';ctx.fillRect(334,190,232,61);
      ctx.font='30px sans-serif';ctx.fillText('👨‍🍳',450,227);
      ctx.fillStyle=recipes[r.cookieType].color;ctx.fillRect(317,250,266,15);
      ctx.font='17px sans-serif';ctx.fillText('🍪  🍪  🍪  🍪  🍪',450,251);
      ctx.fillStyle='#254e41';ctx.fillRect(390,279,120,27);ctx.fillStyle='#fff5d8';ctx.font='bold 12px sans-serif';ctx.fillText('FRESH & HAPPY',450,297);
      drawBouncer(ctx, reduced ? 0 : elapsed, reduced);
      let served=0;
      // Every sold cookie gets exactly one visitor, staggered over the sales duration.
      const first = Math.max(0, Math.floor((elapsed-lifetime)/Math.max(spacing,1)));
      const last = Math.min(r.sold-1, Math.floor(elapsed/Math.max(spacing,1)));
      if (r.sold) served = spacing ? Math.min(r.sold,Math.max(0,Math.floor((elapsed-lifetime*.48)/spacing)+1)) : (elapsed>=lifetime*.48?r.sold:0);
      if (!reduced) for(let i=first;i<=last;i++){
        const age=(elapsed-i*spacing)/lifetime;if(age<0||age>1)continue;
        const purchased=age>=.48;
        const x=age<.48?-65+(age/.48)*515:450+((age-.48)/.52)*515;
        const lane=i%3, y=327+lane*22;
        const bounce=Math.sin(age*Math.PI*12)*6;
        ctx.save();ctx.translate(x,y+bounce);ctx.rotate(Math.sin(age*24)*.07);
        ctx.fillStyle='#00000012';ctx.beginPath();ctx.ellipse(0,43-bounce,22,5,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#354a42';ctx.lineWidth=6;ctx.lineCap='round';
        const kick=Math.sin(age*32)*10;
        ctx.beginPath();ctx.moveTo(-7,23);ctx.lineTo(-10+kick,39);ctx.moveTo(7,23);ctx.lineTo(10-kick,39);ctx.stroke();
        ctx.fillStyle=colors[i%colors.length];ctx.fillRect(-16,-8,32,34);
        ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(-27,12);ctx.moveTo(15,0);ctx.lineTo(29,purchased?-9:12);ctx.stroke();
        ctx.font='37px sans-serif';ctx.fillText(faces[i%faces.length],0,-9);
        if(purchased){ctx.font='25px sans-serif';ctx.fillText('🍪',33,-10);if(i%5===0){ctx.font='bold 13px sans-serif';ctx.fillStyle='#254e41';ctx.fillText(['YUM!','NOM NOM!','COOKIE TIME!'][i%3],0,-59);}}
        ctx.restore();
      }
      if(reduced){ctx.fillStyle='#254e41';ctx.font='24px Georgia';ctx.fillText(r.sold?'Happy customers are collecting their cookies!':'The neighborhood is quiet today.',450,365);}
      $('customer-count').textContent=served.toLocaleString();$('show-revenue').textContent=money(served*r.price);
      $('show-progress').style.width=`${elapsed/duration*100}%`;
      if(elapsed>=duration)finish();else frame=requestAnimationFrame(draw);
    }
    dialog.showModal(); frame=requestAnimationFrame(draw);
  }
  $('skip-show').addEventListener('click',()=>stopShow?.());
  $('shop-show').addEventListener('cancel',e=>{e.preventDefault();stopShow?.();});
  function costs(){return {quantity:Number($('quantity').value),price:Number($('price').value),ads:Number($('advertising').value)};}
  function validate(){
    const {quantity,price,ads}=costs(); const total=round(quantity*recipe().cost+ads+5);
    $('ingredient-cost').textContent=money(quantity*recipe().cost); $('ad-cost').textContent=money(ads); $('investment').textContent=money(total);
    const valid=Number.isInteger(quantity)&&quantity>=0&&quantity<=10000&&price>=.25&&price<=20&&Number.isFinite(price)&&Number.isInteger(ads)&&ads>=0&&ads<=1000000;
    const ended=state.history.length>=30||state.cash<5;
    $('validation').textContent=ended?'':!valid?'Enter a whole cookie count and ad budget, and a price from $0.25 to $20.':total>state.cash?'This plan costs more than your available cash. Try a smaller batch or ad budget.':'';
    $('bake').disabled=shopIsOpen||ended||!valid||total>state.cash;
  }
  function result(r){
    $('empty-results').hidden=true; $('daily-results').hidden=false; $('results-title').textContent=`Day ${r.day}, fresh from the oven.`;
    const done=state.history.length>=30, broke=state.cash<5;
    $('daily-results').innerHTML=`<div class="result-banner"><span>TODAY'S PROFIT</span><strong class="${r.profit>=0?'positive':'negative'}">${r.profit>=0?'+':''}${money(r.profit)}</strong></div><div class="result-grid"><div><span>Cookies sold</span><strong>${r.sold} / ${r.quantity}</strong></div><div><span>Revenue</span><strong>${money(r.revenue)}</strong></div><div><span>Total expenses</span><strong>${money(r.expenses)}</strong></div><div><span>Remaining cash</span><strong>${money(r.cash)}</strong></div></div><p class="result-note">${recipes[r.cookieType].name} · ${r.quantity-r.sold} unsold cookies · ${r.sold===r.quantity&&r.quantity>0?'Sold out! There may be room for a bigger batch tomorrow.':r.quantity===0?'The oven took a break today. Shop costs still apply.':'Adjust your next batch, price, or ads to find your sweet spot.'}</p><div class="tip"><strong>Where the money went</strong><p>Ingredients ${money(r.quantity*r.unitCost)} + advertising ${money(r.ads)} + shop costs $5.00. You charged ${money(r.price)} per cookie.</p></div>${done||broke?`<div class="finish"><h3>${done?'That’s a wrap, boss.':'The shop has closed.'}</h3><p>${done?`30 days complete. You finished with ${money(state.cash)} and a net ${state.cash>=100?'profit':'loss'} of ${money(Math.abs(state.cash-100))}.`:'You need at least $5 for daily shop costs. Start fresh to try a new strategy.'}</p></div>`:''}`;
  }
  function render(){
    const n=state.history.length, ended=n>=30||state.cash<5;
    $('cash').textContent=money(state.cash); $('total-profit').textContent=money(round(state.cash-100)); $('total-profit').className=state.cash>=100?'positive':'negative';
    $('total-sold').textContent=state.history.reduce((s,r)=>s+r.sold,0).toLocaleString();
    $('day-label').textContent=n>=30?'30 DAYS COMPLETE':`DAY ${n+1} OF 30`; $('progress').style.width=`${n/30*100}%`; $('days-left').textContent=ended?'Your shop’s story is complete':`${30-n} ${30-n===1?'opportunity':'opportunities'} to rise`;
    $('weekday').textContent=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][n%7];
    const event=events[n%7]; $('event-title').textContent=ended?'Thanks for baking with us':event.title; $('event-copy').textContent=ended?'Start fresh to build your next cookie empire.':event.copy;
    $('plan-title').textContent=ended?'What a sweet journey.':n?'Plan your next batch.':"Let's open the shop.";
    inputs.forEach(id=>$(id).disabled=ended);
    $('ledger-empty').hidden=n>0; $('ledger').hidden=n===0;
    $('ledger-body').innerHTML=state.history.slice().reverse().map(r=>`<tr><td>${String(r.day).padStart(2,'0')}</td><td>${recipes[r.cookieType].name}</td><td>${r.quantity} / ${r.sold}</td><td>${money(r.revenue)}</td><td>${money(r.expenses)}</td><td class="${r.profit>=0?'positive':'negative'}">${r.profit>=0?'+':''}${money(r.profit)}</td><td>${money(r.cash)}</td></tr>`).join('');
    if(n)result(state.history[n-1]); validate();
  }
  $('plan-form').addEventListener('submit',e=>{
    e.preventDefault();validate();if($('bake').disabled)return;
    const {quantity,price,ads}=costs(), day=state.history.length+1;
    // Price sensitivity, diminishing advertising returns, day conditions, and a small demand variation.
    const demand=Math.max(0,Math.round((46+Math.sqrt(ads)*13+Math.min(day-1,15)*1.3)*recipe().demand*Math.pow(recipe().price/price,1.55)*events[(day-1)%7].factor*(.88+Math.random()*.24)));
    const sold=Math.min(quantity,demand), revenue=round(sold*price),expenses=round(quantity*recipe().cost+ads+5),profit=round(revenue-expenses);
    state.cash=round(state.cash+profit);state.history.push({day,quantity,price,ads,sold,revenue,expenses,profit,cash:state.cash,cookieType:$('cookie-type').value,unitCost:recipe().cost});
    try{localStorage.setItem('kevins-cookie-shop-v1',JSON.stringify(state));}catch{}
    animateShop(state.history[state.history.length-1]); validate();
  });
  inputs.filter(id=>id!=='cookie-type').forEach(id=>$(id).addEventListener('input',validate));
  $('cookie-type').addEventListener('change',()=>{updateRecipe();$('price').value=recipe().price;validate();});
  $('restart').addEventListener('click',()=>{if(state.history.length&&!confirm('Start a new 30-day game? Your current shop progress will be cleared.'))return;state={cash:100,history:[]};try{localStorage.removeItem('kevins-cookie-shop-v1');}catch{}$('cookie-type').value='classic';updateRecipe();$('quantity').value=60;$('price').value=2;$('advertising').value=5;$('empty-results').hidden=false;$('daily-results').hidden=true;$('results-title').textContent='Small batches. Big possibilities.';render();});
  render();
})();
