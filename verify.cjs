const fs = require('fs'), vm = require('vm'), assert = require('assert');
const script = fs.readFileSync(require('path').join(__dirname, 'game.js'), 'utf8');
const key = 'kevins-cookie-shop-v1';
function setup(saved, reduced=false) {
  const elements={}, storage=saved?{[key]:JSON.stringify(saved)}:{}, words=[];
  let next;
  const ctx=new Proxy({fillText(text){words.push(text)}},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const el=id=>elements[id]??={value:({quantity:'60',price:'2',advertising:'5','cookie-type':'classic'})[id]??'',style:{},open:false,addEventListener(t,fn){this[t]=fn},setAttribute(){},focus(){},getContext(){return ctx},showModal(){this.open=true},close(){this.open=false}};
  vm.runInNewContext(script,{document:{getElementById:el},window:{matchMedia:()=>({matches:reduced})},Intl,Number,String,JSON,Math:Object.assign(Object.create(Math),{random:()=>.5}),localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},requestAnimationFrame:fn=>(next=fn,1),cancelAnimationFrame(){next=null},confirm:()=>true});
  return {el,storage,words,state:()=>JSON.parse(storage[key]),tick(t){const fn=next;next=null;fn(t)},submit(){el('plan-form').submit({preventDefault(){}})},select(type){el('cookie-type').value=type;el('cookie-type').change()}};
}
for(const [type,cost,price] of [['classic',.5,2],['double',.75,2.75],['oatmeal',.4,1.75],['velvet',1,3.5]]){
  const g=setup();g.select(type);assert.equal(+g.el('price').value,price);assert.equal(g.el('ingredient-cost').textContent,`$${(cost*60).toFixed(2)}`);
  g.submit();const r=g.state().history[0];assert.equal(r.unitCost,cost);assert.equal(r.cookieType,type);assert.equal(r.expenses,cost*60+10);assert.equal(r.revenue,r.sold*price);assert.equal(g.state().cash,100+r.profit);
  assert(g.el('bake').disabled);g.tick(0);assert(g.words.includes('BRUNO'));g.tick(Math.max(1000,r.sold*100));assert(!g.el('shop-show').open);assert.equal(+g.el('customer-count').textContent,r.sold);assert(g.el('ledger-body').innerHTML.includes(cost===1?'Red velvet':type==='double'?'Double chocolate':type==='oatmeal'?'Oatmeal & honey':'Classic chocolate chip'));
}
const old={cash:120,history:[{day:1,quantity:20,price:2,ads:5,sold:20,revenue:40,expenses:20,profit:20,cash:120}]};
let g=setup(old);assert(g.el('ledger-body').innerHTML.includes('Classic chocolate chip'));assert(g.el('daily-results').innerHTML.includes('Ingredients $10.00'));g.select('velvet');g.submit();assert.equal(g.state().history[0].unitCost,.5);assert.equal(g.state().history[0].cookieType,'classic');assert.equal(g.state().history[1].cookieType,'velvet');
g=setup();g.select('velvet');g.el('quantity').value='100';g.el('quantity').input();assert(g.el('bake').disabled);
g=setup(undefined,true);g.submit();g.tick(0);assert(g.words.includes('BRUNO'));assert(g.words.includes('Happy customers are collecting their cookies!'));g.el('skip-show').click();assert(!g.el('shop-show').open);assert.equal(g.state().history.length,1);g.el('restart').click();assert.equal(g.el('cash').textContent,'$100.00');assert.equal(g.el('cookie-type').value,'classic');assert(!g.storage[key]);
console.log('PASS: four recipes, accounting, budget guards, Bruno rendering, animation counts/timing, old save migration, reduced motion, skip and restart.');
