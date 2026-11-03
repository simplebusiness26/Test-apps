# Engineering model 1.0

All calculations execute server-side from validated numeric inputs and return a model version. UI values are rounded for display; JSON retains precision. No LLM/API subscription is involved.

## Psychrometrics
At temperature T (°C), saturation vapour pressure over water is approximated as:
`es(T) = 6.112 exp(17.62 T / (243.12 + T))` hPa.
For RH in percent, `pv = RH/100 × es(T)`. Inverting gives dew point using `a = ln(RH/100) + 17.62 T/(243.12+T)` and `Td = 243.12 a/(17.62-a)`.
Surface RH estimate is `100 pv/es(Tsurface)`. A negative surface-minus-dew-point margin supports condensation at that measured surface/time. It does not diagnose mould or exclude other damp mechanisms. Values above 100% signal condensation potential; they are not stable equilibrium RH.

Source: [NPL conversion guidance](https://www.npl.co.uk/resources/q-a/dew-point-and-relative-humidity). Assumes air vapour pressure representative at surface. Below freezing, liquid-water approximation differs from frost point. 80% surface RH is only a screening prompt for sustained exposure, not a legal or biological cutoff.

Sensitivity corners use air ±0.5°C, RH ±3 percentage points and surface ±1°C. These are illustrative instrument tolerances, not statistical confidence intervals or validated sensor specifications. Conditions vary in space/time and model discrepancy is not captured by those bounds.

## Heat and moisture
Fabric input is sum(U_i A_i), W/K. Ventilation coefficient is `0.33 n V` W/K from approximate volumetric heat capacity of air in Wh/(m³ K). `H = UA + 0.33 n V`; initial signed sensible loss is `H (Tin - Tout)` W. Negative values mean net gain from outdoors.
With effective thermal capacity C in Wh/K, constant heating Q and elapsed hours t:
`T(t) = Tout + Q/H + (T0 - Tout - Q/H) exp(-H t/C)`.
This solves `C dT/dt = Q - H(T-Tout)` exactly for constant inputs.

Humidity ratio w (g/kg dry air) is `621.98 pv/(1013.25-pv)`. Fixed atmospheric pressure is 1013.25 hPa. Approximate dry-air density is 1.2 kg/m³. With moisture generation G (g/h) and ventilation n (h⁻¹):
`dw/dt = G/(1.2 V) + n(wout-w)`;
`w(t) = weq + (w0-weq) exp(-n t)`;
`weq = wout + G/(1.2 n V)`.
Convert w back to RH at evolving T. The model flags supersaturation rather than silently clipping it. No condensation sink/latent heat, fabric sorption, solar gain, heat recovery, thermal bridging geometry or multizone coupling is solved. Extreme/unrealistic user combinations can produce unrealistic temperatures; treat this as scenario-model breakdown, not physical prediction.

## Independent validation and limits
Tests use a hand-calculated heat-loss fixture, known dew-point reference, exact saturation identities, monotonic cooling and a separately implemented explicit-Euler ODE integration (0.0001 h steps) against the analytic solver. This validates implementation consistency, not field predictive accuracy. Further release requires measured-data calibration, benchmark comparison and expert engineering review.
