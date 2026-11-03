/** HABITAT model 1.0. SI units except vapour pressure hPa and humidity ratio g/kg. */
export const VERSION = 'habitat-physics-1.0';
export function range(value, name, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`${name} must be a finite number between ${min} and ${max}`);
  return value;
}
export const saturation = t => 6.112 * Math.exp(17.62*t/(243.12+t));
export function dewPoint(t, rh) {
  range(t,'Air temperature (°C)',-20,50); range(rh,'Relative humidity (%)',1,100);
  const a = Math.log(rh/100)+17.62*t/(243.12+t);
  return 243.12*a/(17.62-a);
}
export function humidityRatio(t, rh) { const p=saturation(t)*rh/100; return 621.98*p/(1013.25-p); }
export function relativeHumidity(t,w) { return 100*(1013.25*w/(621.98+w))/saturation(t); }
export function analyse(input) {
  const t=range(input.temperature,'Air temperature (°C)',-10,40), rh=range(input.humidity,'RH (%)',1,100);
  const s=range(input.surface,'Surface temperature (°C)',-10,50);
  const dew=dewPoint(t,rh), surfaceRH=100*saturation(t)*rh/100/saturation(s);
  const low=dewPoint(Math.max(-20,t-.5),Math.max(1,rh-3)), high=dewPoint(t+.5,Math.min(100,rh+3));
  const margin=s-dew;
  return {version:VERSION,dewPoint:dew,surfaceRH,margin,dewPointRange:[low,high],marginRange:[s-1-high,s+1-low],
    condensation: margin<0 ? 'Condensation supported by these readings' : (s-1-high<=0 ? 'Uncertainty overlaps condensation conditions' : 'No condensation predicted at this measured surface and time'),
    explanations:[...(surfaceRH>=80?['Surface humidity is elevated; sustained exposure can support mould growth, but this is not a mould diagnosis.']:[]),'One reading cannot exclude intermittent condensation, leaks, penetrating damp or thermal bridges.','Inspect fabric, water ingress, heating and ventilation together; these results do not establish responsibility.'],
    assumptions:['Magnus approximation over liquid water; below 0°C frost behaviour differs.','Illustrative instrument tolerances: air ±0.5°C, RH ±3 percentage points, surface ±1°C. These are sensitivity bounds, not confidence intervals.','Indoor air vapour pressure assumed representative at the measured surface.']};
}
export function simulate(i) {
  const t=range(i.temperature,'Initial temperature',0,35), rh=range(i.humidity,'Initial RH',1,100), out=range(i.outdoor,'Outdoor temperature',-10,35), outRH=range(i.outdoorHumidity,'Outdoor RH',1,100);
  const volume=range(i.volume,'Volume m³',10,5000), ach=range(i.ach,'Air changes per hour',.05,10);
  const ua=range(i.fabric,'Fabric heat transfer W/K',1,5000), capacity=range(i.capacity,'Effective heat capacity Wh/K',10,100000);
  const heat=range(i.heating,'Heating power W',0,50000), moisture=range(i.moisture,'Moisture generation g/h',0,5000);
  const h=ua+.33*ach*volume, equilibrium=out+heat/h, w0=humidityRatio(t,rh), wo=humidityRatio(out,outRH), we=wo+moisture/(1.2*ach*volume);
  const series=Array.from({length:49},(_,k)=>{const hour=k/2,temperature=equilibrium+(t-equilibrium)*Math.exp(-h*hour/capacity),w=we+(w0-we)*Math.exp(-ach*hour);return {hour,temperature,humidity:relativeHumidity(temperature,w)};});
  return {version:VERSION,heatTransfer:h,heatLoss:h*(t-out),ventilationHeatTransfer:.33*ach*volume,equilibriumTemperature:equilibrium,moistureRemovalAtInitial:1.2*ach*volume*(w0-wo),series,
    warnings:[...(series.some(p=>p.humidity>100)?['Supersaturation predicted: condensation would remove vapour. Humidity values beyond saturation are an unmet moisture-load indicator, not physically realised RH.']:[]),'Single well-mixed zone with constant weather, heating, ventilation and moisture. No solar gain, sorption, latent heat, room coupling or occupancy schedule.','ACH, U×A and effective thermal capacity are uncertain inputs, not inferred from photographs. This is a scenario, not a calibrated digital twin.']};
}
