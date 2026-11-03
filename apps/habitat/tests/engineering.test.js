import test from 'node:test';import assert from 'node:assert/strict';import {analyse,dewPoint,simulate,humidityRatio,relativeHumidity} from '../src/engineering.js';
const fixture={temperature:20,humidity:65,outdoor:5,outdoorHumidity:80,volume:100,ach:.5,fabric:80,capacity:3000,heating:1500,moisture:150};
test('Independent reference: 20°C 50% RH dew point approximately 9.3°C',()=>assert.ok(Math.abs(dewPoint(20,50)-9.3)<.1));
test('Saturation dew point equals temperature across domain',()=>{for(let t=-10;t<=40;t+=5)assert.ok(Math.abs(dewPoint(t,100)-t)<1e-10);});
test('Condensation and sensitivity bounds',()=>{const a=analyse({temperature:20,humidity:70,surface:12});assert.ok(a.margin<0);assert.ok(a.surfaceRH>100);assert.ok(a.dewPointRange[0]<a.dewPoint&&a.dewPointRange[1]>a.dewPoint);});
test('Reject missing, nonfinite and out-of-range values',()=>{for(const humidity of [undefined,NaN,Infinity,0,101,'70'])assert.throws(()=>analyse({temperature:20,humidity,surface:12}));assert.throws(()=>simulate({...fixture,ach:0}));});
test('Heat balance independently by hand: 80 + .33 × .5 × 100 = 96.5 W/K',()=>{const r=simulate(fixture);assert.equal(r.heatTransfer,96.5);assert.equal(r.heatLoss,1447.5);assert.equal(r.series[0].temperature,20);});
test('Numerical Euler integration independently validates analytic thermal and moisture ODE',()=>{const r=simulate(fixture);let t=fixture.temperature,w=humidityRatio(t,fixture.humidity);const dt=.0001,H=96.5,wo=humidityRatio(5,80);for(let hour=0;hour<24-dt/2;hour+=dt){t+=(1500-H*(t-5))/3000*dt;w+=(150/(1.2*100)+.5*(wo-w))*dt;}assert.ok(Math.abs(t-r.series.at(-1).temperature)<.0001);assert.ok(Math.abs(relativeHumidity(t,w)-r.series.at(-1).humidity)<.001);});
test('No heating cooling remains between initial and outside temperature',()=>{const r=simulate({...fixture,heating:0});assert.ok(r.series.every(p=>p.temperature>=5&&p.temperature<=20));});
test('Supersaturation explicitly warns model breakdown',()=>assert.ok(simulate({...fixture,moisture:5000}).warnings[0].includes('Supersaturation')));
test('Independent NPL higher-accuracy saturation equation and bisection validate dew point',()=>{
 // NPL Equation 4 (Sonntag/Wexler): separate equation and numerical inverse.
 const pressure=t=>{const K=t+273.15;return Math.exp(-6096.9385/K+21.2409642-.02711193*K+.00001673952*K*K+2.433502*Math.log(K));};
 for(const t of [0,10,20,30,40])for(const rh of [30,60,90]){const target=pressure(t)*rh/100;let low=-60,high=t;for(let n=0;n<80;n++){const mid=(low+high)/2;if(pressure(mid)>target)high=mid;else low=mid;}assert.ok(Math.abs(dewPoint(t,rh)-(low+high)/2)<.1,`T=${t}, RH=${rh}`);}
});
