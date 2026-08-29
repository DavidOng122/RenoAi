create table if not exists public.reno_price_knowledge (
  job_code text primary key,
  sort_order integer not null default 0,
  affected_item text[] not null default '{}',
  keywords text[] not null default '{}',
  estimated_min_price integer not null check (estimated_min_price >= 0),
  estimated_max_price integer not null check (estimated_max_price >= estimated_min_price),
  currency text not null default 'SGD',
  updated_at timestamptz not null default now()
);

alter table public.reno_price_knowledge
add column if not exists sort_order integer not null default 0;

alter table public.reno_price_knowledge enable row level security;

grant select on public.reno_price_knowledge to anon;

drop policy if exists "Public read access to RenoAI price knowledge" on public.reno_price_knowledge;
create policy "Public read access to RenoAI price knowledge"
on public.reno_price_knowledge for select to anon
using (true);

insert into public.reno_price_knowledge (
  job_code,
  sort_order,
  affected_item,
  keywords,
  estimated_min_price,
  estimated_max_price,
  currency
)
values
(
  'DOOR_ALIGNMENT',
  0,
  array['door']::text[],
  array['door does not close', 'door cannot close', 'door rubbing floor', 'bottom edge rubbing', 'door misaligned', 'door sagging', 'door sticking']::text[],
  50,
  120,
  'SGD'
),
(
  'DOOR_HINGE_REPAIR',
  1,
  array['door', 'door hinge', 'hinge']::text[],
  array['loose door hinge', 'door hinge loose', 'squeaky door hinge', 'door sagging from hinge', 'hinge needs tightening', 'door hinge repair']::text[],
  45,
  70,
  'SGD'
),
(
  'DOOR_HINGE_REPLACEMENT',
  2,
  array['door', 'door hinge', 'hinge']::text[],
  array['broken door hinge', 'damaged door hinge', 'replace door hinge', 'hinge cracked', 'hinge cannot hold door', 'door hinge replacement']::text[],
  50,
  80,
  'SGD'
),
(
  'DOOR_HANDLE_REPLACEMENT',
  3,
  array['door', 'door handle', 'door knob']::text[],
  array['door handle broken', 'door knob broken', 'door handle loose', 'replace door handle', 'door handle damaged', 'door knob replacement']::text[],
  80,
  150,
  'SGD'
),
(
  'SLIDING_DOOR_ROLLER_REPAIR',
  4,
  array['sliding door', 'door roller']::text[],
  array['sliding door hard to move', 'sliding door stuck', 'sliding door roller broken', 'sliding door not sliding smoothly', 'sliding door difficult to open', 'sliding door roller repair']::text[],
  120,
  250,
  'SGD'
),
(
  'EXPOSED_PIPE_LEAK_REPAIR',
  5,
  array['pipe', 'exposed pipe', 'water pipe']::text[],
  array['exposed pipe leaking', 'pipe leak', 'pipe leaking water', 'water leaking from pipe', 'dripping pipe', 'visible pipe leak']::text[],
  120,
  220,
  'SGD'
),
(
  'TAP_LEAK_REPAIR',
  6,
  array['tap', 'faucet']::text[],
  array['tap leaking', 'faucet leaking', 'dripping tap', 'tap keeps dripping', 'water leaking from tap', 'leaking faucet']::text[],
  60,
  120,
  'SGD'
),
(
  'TAP_REPLACEMENT',
  7,
  array['tap', 'faucet']::text[],
  array['replace tap', 'replace faucet', 'tap broken', 'faucet broken', 'new tap replacement', 'tap cannot be repaired']::text[],
  80,
  150,
  'SGD'
),
(
  'SINK_BLOCKAGE_CLEARING',
  8,
  array['sink', 'kitchen sink', 'sink drain']::text[],
  array['sink blocked', 'sink clogged', 'kitchen sink clogged', 'sink draining slowly', 'water not draining from sink', 'sink choke']::text[],
  80,
  150,
  'SGD'
),
(
  'FLOOR_TRAP_BLOCKAGE_CLEARING',
  9,
  array['floor trap', 'drain', 'floor drain']::text[],
  array['floor trap blocked', 'floor drain clogged', 'floor trap choke', 'water not draining', 'bathroom drain blocked', 'slow floor drain']::text[],
  80,
  150,
  'SGD'
),
(
  'TOILET_CLOG_CLEARING',
  10,
  array['toilet', 'toilet bowl', 'wc']::text[],
  array['toilet clogged', 'toilet bowl choke', 'toilet blocked', 'toilet not flushing down', 'water rising in toilet', 'toilet choke']::text[],
  120,
  180,
  'SGD'
),
(
  'TOILET_FLUSH_REPAIR',
  11,
  array['toilet', 'toilet flush', 'flush system']::text[],
  array['toilet flush not working', 'flush system broken', 'toilet cannot flush', 'weak toilet flush', 'flush button not working', 'toilet keeps running']::text[],
  130,
  180,
  'SGD'
),
(
  'SHOWER_SET_REPLACEMENT',
  12,
  array['shower', 'shower set', 'shower head']::text[],
  array['replace shower set', 'shower set broken', 'shower head replacement', 'shower hose broken', 'new shower set', 'shower fitting damaged']::text[],
  120,
  150,
  'SGD'
),
(
  'POWER_SOCKET_REPLACEMENT',
  13,
  array['power socket', 'socket', 'electrical outlet', 'power point']::text[],
  array['power socket not working', 'socket faulty', 'socket loose', 'power point broken', 'burnt socket', 'replace power socket', 'outlet damaged']::text[],
  50,
  90,
  'SGD'
),
(
  'LIGHT_SWITCH_REPLACEMENT',
  14,
  array['light switch', 'switch', 'wall switch']::text[],
  array['light switch not working', 'switch faulty', 'switch broken', 'light switch loose', 'switch stuck', 'replace light switch']::text[],
  50,
  80,
  'SGD'
),
(
  'LIGHT_BASIC_INSTALLATION',
  15,
  array['light', 'light fitting', 'lighting']::text[],
  array['install light', 'replace light fitting', 'change ceiling light', 'install basic light', 'light fitting replacement', 'replace existing light']::text[],
  40,
  60,
  'SGD'
),
(
  'DOWNLIGHT_REPLACEMENT',
  16,
  array['downlight', 'ceiling light']::text[],
  array['downlight not working', 'replace downlight', 'downlight broken', 'change downlight', 'install downlight', 'ceiling downlight replacement']::text[],
  70,
  105,
  'SGD'
),
(
  'CEILING_LIGHT_REPLACEMENT',
  17,
  array['ceiling light', 'light fitting', 'light']::text[],
  array['ceiling light not working', 'replace ceiling light', 'change ceiling light fitting', 'ceiling light broken', 'install ceiling light', 'light fitting replacement']::text[],
  90,
  120,
  'SGD'
),
(
  'HANGING_LIGHT_INSTALLATION',
  18,
  array['hanging light', 'pendant light', 'decorative light']::text[],
  array['install hanging light', 'install pendant light', 'replace hanging light', 'install decorative light', 'pendant light installation']::text[],
  80,
  90,
  'SGD'
),
(
  'WALL_FAN_INSTALLATION',
  19,
  array['wall fan', 'fan']::text[],
  array['install wall fan', 'replace wall fan', 'wall fan installation', 'mount wall fan', 'change wall fan']::text[],
  65,
  70,
  'SGD'
),
(
  'CEILING_FAN_INSTALLATION',
  20,
  array['ceiling fan', 'fan']::text[],
  array['install ceiling fan', 'replace ceiling fan', 'ceiling fan installation', 'mount ceiling fan', 'change ceiling fan']::text[],
  80,
  150,
  'SGD'
),
(
  'POWER_TRIP_TROUBLESHOOTING',
  21,
  array['electrical system', 'power supply', 'circuit breaker', 'mcb']::text[],
  array['power keeps tripping', 'electricity keeps tripping', 'mcb keeps tripping', 'power trip', 'circuit breaker trips', 'house power trip']::text[],
  60,
  120,
  'SGD'
),
(
  'HEATER_SWITCH_REPLACEMENT',
  22,
  array['heater switch', 'water heater switch', 'switch']::text[],
  array['heater switch not working', 'water heater switch faulty', 'heater switch broken', 'replace heater switch', 'heater switch burnt']::text[],
  45,
  100,
  'SGD'
),
(
  'ELECTRICAL_TROUBLESHOOTING_VISIT',
  23,
  array['electrical system', 'power supply', 'wiring']::text[],
  array['electrical problem unknown', 'electrical fault', 'no power unknown cause', 'electrician troubleshooting', 'electrical inspection', 'need electrician to check']::text[],
  50,
  80,
  'SGD'
),
(
  'NEW_POWER_POINT_INSTALLATION',
  24,
  array['power point', 'power socket', 'electrical outlet']::text[],
  array['install new power point', 'add power socket', 'new electrical outlet', 'add new socket', 'install new socket point', 'new power outlet']::text[],
  80,
  180,
  'SGD'
),
(
  'DIMMER_SWITCH_INSTALLATION',
  25,
  array['dimmer switch', 'light switch']::text[],
  array['install dimmer switch', 'replace dimmer switch', 'add dimmer', 'dimmer switch installation']::text[],
  90,
  90,
  'SGD'
),
(
  'DOORBELL_INSTALLATION',
  26,
  array['doorbell']::text[],
  array['install doorbell', 'replace doorbell', 'doorbell installation', 'new doorbell', 'doorbell not working replace']::text[],
  90,
  90,
  'SGD'
),
(
  'WALL_CRACK_PATCH',
  27,
  array['wall', 'interior wall']::text[],
  array['wall crack', 'hairline crack', 'small crack in wall', 'patch wall crack', 'cracked wall surface', 'repair wall crack']::text[],
  80,
  150,
  'SGD'
),
(
  'WALL_HOLE_PATCH',
  28,
  array['wall', 'interior wall']::text[],
  array['hole in wall', 'small wall hole', 'patch wall hole', 'drill hole in wall', 'wall damaged by screw', 'repair small wall hole']::text[],
  60,
  120,
  'SGD'
),
(
  'AIRCON_GENERAL_SERVICING',
  29,
  array['aircon', 'air conditioner', 'fan coil']::text[],
  array['aircon servicing', 'air conditioner servicing', 'general aircon service', 'clean aircon', 'routine aircon maintenance', 'aircon normal servicing']::text[],
  50,
  80,
  'SGD'
),
(
  'AIRCON_DIAGNOSTIC',
  30,
  array['aircon', 'air conditioner']::text[],
  array['aircon problem unknown', 'aircon troubleshooting', 'aircon diagnostic', 'aircon fault', 'aircon not working unknown cause', 'check aircon problem']::text[],
  50,
  80,
  'SGD'
),
(
  'AIRCON_DRAIN_LINE_CLEARING',
  31,
  array['aircon', 'air conditioner', 'drain pipe']::text[],
  array['aircon drain blocked', 'aircon drain pipe clogged', 'aircon dripping water', 'blocked aircon drainage', 'aircon drain line clearing', 'aircon drain choke']::text[],
  80,
  150,
  'SGD'
),
(
  'AIRCON_NOT_COLD_TROUBLESHOOTING',
  32,
  array['aircon', 'air conditioner', 'fan coil']::text[],
  array['aircon not cold', 'air conditioner not cooling', 'aircon weak cooling', 'aircon not cooling enough', 'aircon blowing warm air', 'poor aircon cooling']::text[],
  80,
  180,
  'SGD'
),
(
  'AIRCON_WATER_LEAK_TROUBLESHOOTING',
  33,
  array['aircon', 'air conditioner', 'fan coil']::text[],
  array['aircon leaking water', 'water dripping from aircon', 'air conditioner leaking', 'aircon water leak', 'fan coil dripping water', 'indoor aircon leaking']::text[],
  80,
  180,
  'SGD'
),
(
  'AIRCON_CHEMICAL_WASH',
  34,
  array['aircon', 'air conditioner', 'fan coil']::text[],
  array['aircon chemical wash', 'chemical clean aircon', 'aircon deep cleaning', 'fan coil chemical wash', 'air conditioner chemical cleaning']::text[],
  80,
  120,
  'SGD'
),
(
  'AIRCON_CHEMICAL_OVERHAUL',
  35,
  array['aircon', 'air conditioner', 'fan coil']::text[],
  array['aircon chemical overhaul', 'aircon full chemical cleaning', 'fan coil chemical overhaul', 'air conditioner chemical overhaul']::text[],
  150,
  240,
  'SGD'
),
(
  'AIRCON_GAS_TOPUP_R22',
  36,
  array['aircon', 'air conditioner', 'refrigerant']::text[],
  array['aircon gas top up r22', 'r22 refrigerant top up', 'aircon low gas r22', 'top up r22 gas', 'r22 aircon gas']::text[],
  90,
  130,
  'SGD'
),
(
  'AIRCON_GAS_TOPUP_R410A',
  37,
  array['aircon', 'air conditioner', 'refrigerant']::text[],
  array['aircon gas top up r410a', 'r410a refrigerant top up', 'aircon low gas r410a', 'top up r410a gas', 'r410a aircon gas']::text[],
  120,
  165,
  'SGD'
),
(
  'AIRCON_GAS_TOPUP_R32',
  38,
  array['aircon', 'air conditioner', 'refrigerant']::text[],
  array['aircon gas top up r32', 'r32 refrigerant top up', 'aircon low gas r32', 'top up r32 gas', 'r32 aircon gas']::text[],
  130,
  180,
  'SGD'
),
(
  'AIRCON_CONDENSER_NORMAL_CLEANING',
  39,
  array['aircon condenser', 'condenser']::text[],
  array['clean aircon condenser', 'condenser normal cleaning', 'outdoor aircon unit cleaning', 'clean aircon outdoor unit']::text[],
  50,
  80,
  'SGD'
),
(
  'AIRCON_CONDENSER_CHEMICAL_CLEANING',
  40,
  array['aircon condenser', 'condenser']::text[],
  array['condenser chemical cleaning', 'chemical clean aircon condenser', 'aircon outdoor unit chemical cleaning']::text[],
  100,
  150,
  'SGD'
),
(
  'AIRCON_CONDENSER_DRY_CLEANING',
  41,
  array['aircon condenser', 'condenser']::text[],
  array['condenser dry cleaning', 'dry clean aircon condenser', 'aircon outdoor unit dry cleaning']::text[],
  60,
  120,
  'SGD'
),
(
  'AIRCON_CONDENSER_STEAM_CLEANING',
  42,
  array['aircon condenser', 'condenser']::text[],
  array['condenser steam cleaning', 'steam clean aircon condenser', 'aircon outdoor unit steam cleaning']::text[],
  80,
  150,
  'SGD'
),
(
  'CABINET_HINGE_REPAIR',
  43,
  array['cabinet', 'cupboard', 'cabinet hinge']::text[],
  array['cabinet hinge loose', 'cupboard hinge broken', 'cabinet door sagging', 'cabinet hinge repair', 'cabinet door not closing', 'cupboard hinge loose']::text[],
  60,
  120,
  'SGD'
),
(
  'DRAWER_TRACK_REPAIR',
  44,
  array['drawer', 'drawer track', 'drawer runner']::text[],
  array['drawer stuck', 'drawer not sliding', 'drawer track broken', 'drawer runner damaged', 'drawer hard to open', 'drawer track repair']::text[],
  80,
  160,
  'SGD'
),
(
  'WINDOW_HANDLE_LATCH_REPAIR',
  45,
  array['window', 'window handle', 'window latch']::text[],
  array['window handle broken', 'window latch broken', 'window cannot lock', 'window handle loose', 'window latch repair', 'window handle repair']::text[],
  80,
  160,
  'SGD'
),
(
  'WINDOW_ROLLER_HINGE_REPAIR',
  46,
  array['window', 'window roller', 'window hinge']::text[],
  array['window hard to open', 'window roller broken', 'window hinge damaged', 'window not sliding smoothly', 'window roller repair', 'window hinge repair']::text[],
  120,
  250,
  'SGD'
),
(
  'WALL_SHELF_INSTALLATION',
  47,
  array['wall shelf', 'shelf']::text[],
  array['install wall shelf', 'mount shelf on wall', 'wall shelf installation', 'hang shelf', 'fix shelf to wall']::text[],
  50,
  100,
  'SGD'
),
(
  'TV_BRACKET_INSTALLATION',
  48,
  array['tv bracket', 'tv mount']::text[],
  array['install tv bracket', 'mount tv on wall', 'tv wall mount installation', 'install tv mount', 'hang tv on wall']::text[],
  80,
  150,
  'SGD'
),
(
  'CURTAIN_ROD_INSTALLATION',
  49,
  array['curtain rod', 'curtain pole']::text[],
  array['install curtain rod', 'mount curtain rod', 'curtain pole installation', 'replace curtain rod', 'fix curtain rod to wall']::text[],
  80,
  180,
  'SGD'
),
(
  'SILICONE_SEALANT_TOUCHUP',
  50,
  array['silicone sealant', 'bathroom sealant', 'sealant']::text[],
  array['silicone sealant damaged', 'bathroom silicone mouldy', 'replace silicone sealant', 'reseal bathroom', 'sealant peeling', 'bathroom sealant touch up']::text[],
  80,
  180,
  'SGD'
)
on conflict (job_code) do update set
  sort_order = excluded.sort_order,
  affected_item = excluded.affected_item,
  keywords = excluded.keywords,
  estimated_min_price = excluded.estimated_min_price,
  estimated_max_price = excluded.estimated_max_price,
  currency = excluded.currency,
  updated_at = now();
