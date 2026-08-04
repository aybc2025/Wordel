// Builds public/words-en.json. Mirrors the validation discipline CLAUDE.md
// requires for the Hebrew bank: every candidate is checked for exact 5-letter
// length and A-Z membership, duplicates are dropped, and anything rejected is
// reported rather than silently discarded.

const fs = require("fs");

// Very common words -> common: true tier (used by the "common words only" draw).
const COMMON = `
about above abuse actor acute admit adopt adult after again agent agree ahead
alarm album alert alike alive allow alone along alter among anger angle angry
apart apple apply arena argue arise armed array arrow aside asset audio avoid
awake award aware badly beach began begin begun being below bench birth black
blame blank blind block blood board boost bound brain brand brave bread break
breed brief bring broad broke brown brush build built buyer cabin cable candy
cargo carry catch cause chain chair chaos charm chart chase cheap check cheek
cheer chess chest chief child china chose civil claim class clean clear clerk
click cliff climb clock close cloth cloud coach coast could count court cover
crack craft crash crazy cream crime cross crowd crown curve cycle daily dance
death debut delay dense depth doing doubt dozen draft drama drawn dream dress
drink drive drove eager early earth eight elite empty enemy enjoy enter entry
equal error event every exact exist extra faced faith false fault favor fence
fever field fifth fifty fight final first flame flash fleet float flood floor
fluid focus force forth forty forum found frame fresh front fruit fully funny
giant given glass globe glory glove going grace grade grain grand grant grape
graph grass grave great green greet grief group grown guard guess guest guide
guilt happy harsh heart heavy hello hence hobby honey honor horse hotel house
human humor hurry ideal image imply index inner input issue joint judge juice
knife knock known label labor large laser later laugh learn lease least leave
legal lemon level light limit local logic loose lower loyal lucky lunch magic
major maker march match maybe mayor meant medal media mercy merit metal meter
might minor minus mixed model money month moral motor mount mouse mouth movie
music naked nasty nerve never newly night noble noise north noted novel nurse
occur ocean offer often onion order organ other ought outer owner paint panel
panic paper party pasta patch pause peace peach pearl penny phase phone photo
piano piece pilot pitch pixel place plain plane plant plate plaza point pound
power press price pride prime print prior prize proof proud prove pulse punch
pupil puppy queen query quest quick quiet quite radar radio raise rally range
rapid ratio reach react ready realm rebel refer relax reply rider ridge rifle
right rigid rival river robot rocky rough round route royal ruler rural saint
salad sales sauce scale scene scope score scrap screw sense serve seven shade
shake shall shame shape share sharp sheep sheet shelf shell shift shine shirt
shock shoot shore short shown sight silly since sixth sixty skill sleep slice
slide slope small smart smile smoke snake solar solid solve sorry sound south
space spare spark speak speed spend spent spice spine split spoke sport squad
staff stage stain stair stake stamp stand stare start state steam steel steep
stick still stock stone stood store storm story strip study stuff style sugar
suite sunny super sweet swift swing sword table taken taste teach teeth thank
theft their theme there these thick thief thing think third those three threw
throw tiger tight tired title toast today token tooth topic total touch tough
tower toxic trace track trade trail train treat trend trial tribe trick tried
truck truly trust truth twice twist uncle under union unite unity until upper
upset urban usage usual valid value video views virus visit vital vocal voice
waste watch water wheat wheel where which while white whole whose woman world
worry worse worth would wound write wrong wrote young youth
`;

// Less-frequent but entirely ordinary words -> common: false tier.
const UNCOMMON = `
abbey abide acorn adapt agile aisle alibi alley aloft amber amend ample amuse
angel ankle apron ardor arena arose  ashen atlas attic  aurora
banjo barge baron basil baton bayou beard beast beech beret berry bicep bison
blade bland blaze bleak bleed blend bliss bloom blunt blush boast bogus bonus
booth borne bough bounce brace braid brake brawl  briar bribe brick bride
brine brink  brisk broth brute bugle bulge bulky bunch burnt burst cadet
cameo canal canoe caper carol carve caste cedar chant chard charm chasm cheat
chime choir chord chunk churn cider cigar cinch clamp clang clash clasp cleat
cleft clone cloak clove clump clung coral corny couch cough covet cower crane
crank crate crave crawl creak cream creed creek creep crept crest cried crisp
croak crock crumb crush crust cubic cumin curly curse cyber dairy dandy dashed
debit decal decoy defer deity delta demon depot derby detox devil diary dimly
diner dingy ditch diver dodge donor dough  downy dowry draft drape drawl
dread drier drift drill droll drone drool droop  drown dryly dusty dwarf
dwell eagle easel eaten ebony edict eerie egret elbow elder elope elude embed
ember emcee endow epoch equip erode essay ester ether ethic evade evoke exalt
excel exert exile expel fable facet faded famed fancy farce fatal feign feral
ferry fetch  fiber fiend filly filth finch finer flair flake flank flare
fleck flick flier fling flint flirt flock flora floss flung flush flute foamy
foggy foray forge forte  found foyer frail frank fresh friar frill frisk
frock frond frost froth frown froze fudge fungi furry gauge gaunt gavel gecko
genre germ ghost ghoul giddy girth glade gland glare glaze gleam glean glide
glint gloat gloom glossy gnome gorge gouge gourd grail grasp grate graze grill
grime grimy grind gripe groan groin groom grope grout grove growl grunt guava
guild guise gulch gully gusto gusty hardy harem harpy haste hasty hatch haunt
haven havoc hazel heady heard hedge hefty heist helix herbs heron hilly hinge
hippo hoard hobby hoist hound hovel hover howdy husky hutch hydro hyena ideal
idiom idyll igloo imbue inept inert infer ingot inlet inept irate irony islet
ivory jaunt jetty jewel jiffy jolly joust judge junta juror karma kayak kebab
kneel knelt knack knead knoll koala  ladle lance lanky lapel lapse larva
latch lathe latte layer leaky leapt ledge leech leery lefty legit lemur
lilac limbo lined linen lingo lithe livid llama loamy loath lobby locus lodge
lofty loner lotus lousy lucid  lumpy lunar lurch lurid lusty lyric
madam magma maize maker mango manor maple marsh mason matte mauve meadow
medic melon mercy merge merry mesh metro midst mimic mince miner minty mirth
miser mocha modal moist molar moldy moose moped moral morph mossy motel motif
 mound mourn mucus muddy mulch mummy mural murky mushy musky musty muted
nacho  nanny nappy natal navel neigh neon nerdy newer nexus niche niece
nifty ninja ninth noise nomad noose north notch nudge nylon oaken oasis
occur ocher offal olive omega onset  opium optic orbit organ ounce ovary
overt  owing oxide ozone paced padre pagan  palsy pansy papal parch
parka parry patio payer  pecan pedal penal perch peril pesky petal petty
phony picky piety pilaf pinch piney pinto piper pique pivot plaid plait plank
pleat pluck plumb plume plump plush poach  poise polar polio poppy porch
pored posse pouch pound prank prawn preen prime primp prism privy probe prong
prose proxy prude prune psalm pudgy puffy pulpy punch pupal purge purse pushy
putty pygmy quail quake qualm quark quart quash quasi queue quill quilt quirk
quota quote rabid radii rainy rajah rally ramen ranch rangy raspy raven ravel
rayon rebus recap reedy regal rehab reign relic remit renal renew repay repel
resin retch retro reuse rhino rhyme rider ridge rifle rinse risen risky rivet
roach roast robin rodeo rogue roomy roost rotor rouge rouse rowdy rugby ruddy
rumor runny runic rusty saber sable salsa salty salve sandy sappy sassy satin
 sauna savor savvy scald scalp scant scarf scary scoff scold scone scoop
scoot scorn scour scowl scrub scuba sedan seedy seize sepia serum shack shaft
shale shard shawl shear sheen sheer shied shine shiny shire shoal shone shrew
shrub shrug shuck shunt shush siege sieve sight silky sinew singe siren sixty
skate skewer skiff skimp skirt skulk skull skunk slack slain slang slant slash
slate sleek sleet slept slick slime slimy sling slink sloop slosh sloth slump
slung slurp slush smack smash smear smelt smirk smite smith smock smoky snack
snail snare snarl sneer snide sniff snipe snoop snore snort snout snowy snuck
soapy sober soggy solace solve sonar sonic sooty sorry sound spade spasm spawn
spear speck spied spiel spike spiky spill spilt spiny spire spite splat spool
spoon spore spout sprig spurn spurt squat squid stack stalk stall stash stave
stead steed stein stent stiff stilt sting stink stint stoic stoke stole stomp
stony stool stoop stork stout stove strap straw stray strut stump stung stunt
suave sugar sulky sully  surge surly sushi swami swamp swarm  swath
swear sweat swell swept swirl swish swoon swoop syrup tabby taboo tacit tacky
taffy taint tally talon tango tangy taper tapir tardy tarot tasty  taunt
tawny tempo tenet tenor  tepid terse testy thaw theta thigh thong thorn
thump thyme tiara tibia tidal tiddly tilde timid tinge tipsy tithe toady toffee
 tonal tonic torch torso  totem tract trawl tread tress triad tripe
trite troll troop trope trout trove truce trump tryst tulip tummy tumor tunic
turbo tutor tweak tweed tweet twine twirl udder ulcer ultra umbra unfit
unify unlit unwed usher usurp utter vague valet valor vapid vapor vault veiny
 venom venue verge verse  vertex vexed vicar vigil vigor villa vinyl
viola viper  virus visor vixen vodka vogue  vouch vowel vying wafer
wager wagon waist waltz wares warty washy  waver waxen weary weave wedge
weedy weigh weird welsh whack whale wharf wheat wheel whelp whiff whine whirl
whisk whoop widen widow wield wince winch windy wiser wispy witty  woozy
wordy worst wrath wreck wrest wring wrist yacht yearn yeast yield yodel yokel
yolk young yucca yummy zebra zesty zonal
`;

const AZ = new Set("abcdefghijklmnopqrstuvwxyz".split(""));

function parse(block) {
  return block.trim().split(/\s+/).filter(Boolean);
}

const rejected = [];
const seen = new Set();
const out = [];

function ingest(list, common) {
  for (const raw of list) {
    const w = raw.toLowerCase();
    if ([...w].length !== 5) {
      rejected.push([w, `length ${[...w].length}`]);
      continue;
    }
    if (![...w].every((c) => AZ.has(c))) {
      rejected.push([w, "non a-z character"]);
      continue;
    }
    if (seen.has(w)) continue; // silent dedupe; cross-tier overlap is expected
    seen.add(w);
    out.push({ word: w, common });
  }
}

// Common tier first so a word appearing in both tiers keeps common: true.
ingest(parse(COMMON), true);
ingest(parse(UNCOMMON), false);

out.sort((a, b) => a.word.localeCompare(b.word, "en"));

const body = out
  .map((o) => `{\n"word": "${o.word}",\n"common": ${o.common}\n}`)
  .join(",\n");

const target = process.argv[2];
fs.writeFileSync(target, `[\n${body}\n]\n`, "utf8");

console.log(`accepted: ${out.length} (common: ${out.filter((o) => o.common).length})`);
console.log(`rejected: ${rejected.length}`);
for (const [w, why] of rejected) console.log(`  ${w} — ${why}`);
