# Weapon/armor families (name before the comma) that fit Phantasy Star / Algol AW 2284.
F = {
 'AdvMelee': 'Battleaxe|Blaze Scimitar|Crisis Wrench|Cryopike|Crystal Spear|Curve Blade|Electroflail|Excavation Drill|Flare Axe|Frost Maul|Glass Blade|Hammer|Heat-Amp Gauntlet|Hook Sword|Ice Needle|Longsword|Lumenstaff|Magma Blade|Needler Estoc|Pike|Plasma Sword|Pulse Gauntlet|Seismic Pick|Shock Pad|Shock Truncheon|Spark Knife|Swoop Hammer|Taclash|Talon|Toothblade|Welder|Warfan|Snap Whip',
 'BasicMelee': 'Baton|Battleglove|Chitinblade|Dagger|Dueling Sword|Electric Prod|Garrote|Greataxe|Handaxe|Hook Knife|Knife|Lance|Maul|Sap|Scythe|Sledge|Spear|Switchblade|Sword Cane|Warclub|Retractable Spike',
 'Ammo': 'Arrows (20)|Battery|Darts (25)|Flare (1)|Flechette (25)|Petrol Tank|Rounds|Scattergun Shells (25)',
 'Grenade': 'Antiswarm Grenade|Concussion Grenade|Cryo Grenade|Defoliant Grenade|Dye Grenade|Flash Grenade|Foam Grenade|Frag Grenade|Incendiary Grenade|Riot Grenade|Shock Grenade|Smoke Grenade|Steam Cloud Grenade|Stickybomb Grenade|Web Grenade',
 'Heavy': 'Arc Caster|Coolant Sprayer|Flamethrower|Machine Gun|Plasma Cannon|Rotolaser',
 'Longarms': 'Arc Emitter|Arc Rifle|Autotarget Rifle|Breaching Gun|Combat Rifle|Excavation Laser|Flame Rifle|Frost Projector|Hunting Rifle|Ice Carbine|Laser Rifle|Needler Rifle|Net Gun|Numbing Beam|Plasma Rifle|Scattergun|Sonic Rifle|Storm Coil',
 'SmallArms': 'Arc Pistol|Flame Pistol|Flare Gun|Glove Needler|Hail Pistol|Handcannon|Injector Pistol|Laser Pistol|Lightning Pistol|Needler Pistol|Plasma Pistol|Semi-Auto Pistol|Shellgun|Sonic Pistol|Sting Pistol|Subduer|Zero Pistol',
 'Sniper': 'Assassin Rifle|Coil Rifle|Focus Rifle|Tagtech Rifle',
 'Light': 'Camping Gear|Carbon Skin|Clearweave|D-Suit|EJ Coverall|Estex Suit|Exochitin|Freebooter Armor|Hardened Resin|Polyplate|Regimental Dress|Second Skin|ThermSkin',
 'Heavy armor': 'Ceremonial Plate|Defiance Series|EJ Hardsuit|Enforcer Armor|Hardplate|Mining Jack|Thinplate',
}
FAMILIES = {k: set(v.split('|')) for k, v in F.items()}
