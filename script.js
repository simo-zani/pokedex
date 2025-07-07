const pkmInput = document.querySelector('.pkm-input');
const searchBtn = document.querySelector('.search-btn');
const mainBtn = document.querySelector('.btn-main');

const pkmInfoSection = document.querySelector('.pkm-info-container');
const pkmEvoInfoSection = document.querySelector('.pkm-evo-forms-container');
const pkmEvoContainer = document.querySelector('.pkm-evo-container');
const pkmFormContainer = document.querySelector('.pkm-form-container');
const errorSection = document.querySelector('.error');
const searchPkmSection = document.querySelector('.search-pkm');

const shinyButton = document.querySelector('.shiny-icon');
const legendaryIcon = document.querySelector('.legendary-icon');

const pkmTxt = document.querySelector('.pkm-name');
const pkmId = document.querySelector('.pkm-id');
const pkmGen = document.querySelector('.pkm-gen');
const pkmDescr = document.querySelector('.pkm-descr');

const pkmPrecTxt = document.querySelector('.pkm-prec-name');
const pkmPrecId = document.querySelector('.pkm-prec-id');
const pkmSpritePrec = document.querySelector('.pkm-prec-img');

const pkmNextTxt = document.querySelector('.pkm-next-name');
const pkmNextId = document.querySelector('.pkm-next-id');
const pkmSpriteNext = document.querySelector('.pkm-next-img');

const pkmTypeContainer = document.querySelector('.pkm-type-container');

const pkmSpriteFront = document.querySelector('.pkm-front');
const pkmSpriteBack = document.querySelector('.pkm-back');

let sprites = {};
let isShiny = false; //globale
let nomePrecPkm = ''; //mi salvo ogni volta il pkm precedente e quello successivo così che quando ci clicco sopra passo il nome all'updatePokemonInfo
let nomeNextPkm = '';

const suggestionBox = document.querySelector('.suggestion-box');
let allPokemonNames = [];
let activeIndex = -1; //per evidenziare il suggerimento indicato con la tastiera

async function loadAllPokemonNames() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
  const data = await res.json();
  allPokemonNames = data.results.map(p => p.name);
}

loadAllPokemonNames();

shinyButton.addEventListener('click', function() {
  this.classList.toggle('active');
  isShiny = !isShiny; //ogni volta che clicco aggiorno
  updateSprites(sprites, isShiny);
});

searchBtn.addEventListener('click', () => {
    //trim() serve per rimuovere gli spazi all'inizio e alla fine nella stringa
    if(pkmInput.value.trim() != ''){
        updatePokemonInfo(pkmInput);
        shinyButton.classList.remove('active'); //tolgo lo stato attivo alle stelline dello shiny
        isShiny = false;                        //riporto lo stato iniziale a non shiny
        pkmInput.value = '';
        pkmInput.blur(); //togliamo il focus sull'elemento
        suggestionBox.innerHTML = ''; //nascone il box suggerimento
    }
});

mainBtn.addEventListener('click', () => {
  suggestionBox.innerHTML = ''; //nascone il box suggerimento
});

//-----------------------------------------------------------------
//Poiché updatePokemonInfo() si aspetta un oggetto input, creo un input HTML "finto" in memoria con il valore del Pokémon che voglio caricare (prev o next):
document.querySelector('.btn-prec').addEventListener('click', () => {
  const fakeInput = document.createElement('input');
  fakeInput.value = nomePrecPkm;
  pkmEvoContainer.innerHTML = ''; //contenitore evoluzioni svuotato
  updatePokemonInfo(fakeInput);
  shinyButton.classList.remove('active');
  isShiny = false;
  pkmInput.value = '';
  pkmInput.blur();  //toglie il focus dal campo input
  suggestionBox.innerHTML = ''; //nascone il box suggerimento
});

document.querySelector('.btn-next').addEventListener('click', () => {
  const fakeInput = document.createElement('input');
  fakeInput.value = nomeNextPkm;
  pkmEvoContainer.innerHTML = ''; //contenitore evoluzioni svuotato
  updatePokemonInfo(fakeInput);
  shinyButton.classList.remove('active');
  isShiny = false;
  pkmInput.value = '';
  pkmInput.blur();  //toglie il focus dal campo input
  suggestionBox.innerHTML = ''; //nascone il box suggerimento
});
//-----------------------------------------------------------------

//keydown esegue l'azione quando viene cliccato un tasto
pkmInput.addEventListener('keydown', (event) => {
    //console.log(event);  //ogni volta che si clicca un pulsante si crea un evento
    const items = document.querySelectorAll('.suggestion-box li'); // o '.suggestion-item' se hai classi
    
    //Esegui l'azione quando l’utente preme Invio
    if (event.key === 'Enter' && pkmInput.value.trim() != '') {
        const selected = items[activeIndex];
        if (selected) {
            const selectedName = selected.textContent;
            pkmInput.value = selectedName;
            // Aggiorna input, svuota suggerimenti, chiama funzione
            updatePokemonInfo(pkmInput);
            shinyButton.classList.remove('active');
            isShiny = false;
            pkmInput.value = '';
            pkmInput.blur();  //toglie il focus dal campo input
            suggestionBox.innerHTML = ''; //nascone il box suggerimento
        }
        updatePokemonInfo(pkmInput);
        shinyButton.classList.remove('active');
        isShiny = false;
        pkmInput.value = '';
        pkmInput.blur();  //toglie il focus dal campo input
        suggestionBox.innerHTML = ''; //nascone il box suggerimento
    } else if (event.key === 'ArrowDown'){
        //serve a bloccare il comportamento predefinito del browser per quell’evento (in questo caso scorrerebbe la pagina in su)
        event.preventDefault();
        if (activeIndex < items.length - 1) {
            activeIndex++;
            updateActiveSuggestion(items);
        }
    } else if (event.key === 'ArrowUp') {
        //serve a bloccare il comportamento predefinito del browser per quell’evento (in questo caso scorrerebbe la pagina in su)
        event.preventDefault();
        if (activeIndex > 0) {
            activeIndex--;
            updateActiveSuggestion(items);
        }
    }  else if (event.key === 'Escape'){ //Esc
      pkmInput.blur();  //toglie il focus dal campo input
      suggestionBox.innerHTML = ''; //nascone il box suggerimento
    };
});

function updateActiveSuggestion(items) {
    items.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
    });
}

pkmInput.addEventListener('input', () => {
    const value = pkmInput.value.toLowerCase().trim();
    suggestionBox.innerHTML = '';
    activeIndex = -1; //riporto a -1 l'indice

    if (value === '') return;

    const suggestions = allPokemonNames
        .filter(name => name.startsWith(value)) //mostra i pkm che iniziano con la stringa inserita
        //mostra 5 elementi
        .slice(0, 5);

    suggestions.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        suggestionBox.appendChild(li);

        li.addEventListener('click', () => {
            pkmInput.value = name;
            suggestionBox.innerHTML = '';
            updatePokemonInfo(pkmInput);
            shinyButton.classList.remove('active');
            isShiny = false;
            pkmInput.value = '';
            pkmInput.blur();  //toglie il focus dal campo input
            suggestionBox.innerHTML = ''; //nascone il box suggerimento
        });
    });
});

async function getFetchData(endPoint){
  try{
    const apiURL = `https://pokeapi.co/api/v2/pokemon-species/${endPoint}`;
    const response = await fetch(apiURL);

    if (response.status === 404) {
      // Pokémon non trovato
      showDisplaySection(errorSection);
      return { error: true, status: 404 };
    }

    return response.json();

  } catch (error) {
    // Errore di rete o altro
    return { error: true, status: null, message: error.message };
  }
}

async function getFetchDataSprites(endPoint) {
    const apiURL = `https://pokeapi.co/api/v2/pokemon/${endPoint}`;
    const response = await fetch(apiURL);

    return response.json();
}

// Funzione per prendere i dati del pokemon
async function updatePokemonInfo(pokemon){
    
    let inputPkm = pokemon.value; //mi salvo il valore dell'input, perché una volta passato alla prima getFecth si svuota e alla seconda passerebbe ''
    let inputPkmSprite = pokemon.value;
    
    //pokemon con più fprme base
    const formAliases = {
      deoxys: ["deoxys-normal", "deoxys-attack", "deoxys-defense", "deoxys-speed"],
      shaymin: ["shaymin-land", "shaymin-sky"],
      kyogre: ["kyogre-primal"],
      groudon: ["groudon-primal"],
      dialga: ["dialga-origin"],
      palkia: ["palkia-origin"],
      giratina: ["giratina-altered", "giratina-origin"],
      rotom: ["rotom-heat", "rotom-wash", "rotom-frost", "rotom-fan", "rotom-mow"],
      darmanitan: ["darmanitan-standard", "darmanitan-zen", "darmanitan-galar-standard", "darmanitan-galar-zen"],
      basculin: ["basculin-red-striped", "basculin-blue-striped", "basculin-white-striped"],
      lycanroc: ["lycanroc", "lycanroc-midday", "lycanroc-midnight", "lycanroc-dusk"],
      necrozma: ["necrozma-dusk", "necrozma-dawn", "necrozma-ultra"],
      urshifu: ["urshifu-single-strike", "urshifu-rapid-strike"],
      toxtricity: ["toxtricity-amped", "toxtricity-low-key"],
      calyrex: ["calyrex-ice", "calyrex-shadow"],
      indeedee: ["indeedee-male", "indeedee-female"],
      zygarde: ["zygarde-10", "zygarde-10-power-construct", "zygarde-50", "zygarde-50-power-construct","zygarde-complete"],
      zarude: ["zarude-dada"],
      meowstic: ["meowstic-male", "meowstic-female"],
      morpeko: ["morpeko-full-belly", "morpeko-hangry"],
      oinkologne: ["oinkologne-male", "oinkologne-female"],
      keldeo: ["keldeo-ordinary", "keldeo-resolute"],
      meloetta: ["meloetta-aria", "meloetta-pirouette"],
      kyurem: ["kyurem-black", "kyurem-white"],

      //Forme di Alola
      rattata: ["rattata-alola"],
      raticate: ["raticate-alola"],
      raichu: ["raichu-alola"],
      sandshrew: ["sandshrew-alola"],
      sandslash: ["sandslash-alola"],
      vulpix: ["vulpix-alola"],
      ninetales: ["ninetales-alola"],
      diglett: ["diglett-alola"],
      dugtrio: ["dugtrio-alola"],
      meowth: ["meowth-alola"],
      persian: ["persian-alola"],
      geodude: ["geodude-alola"],
      graveler: ["graveler-alola"],
      golem: ["golem-alola"],
      grimer: ["grimer-alola"],
      muk: ["muk-alola"],
      exeggutor: ["exeggutor-alola"],
      marowak: ["marowak-alola"],

      //Forme di Galar
      meowth: ["meowth-galar"],
      ponyta: ["ponyta-galar"],
      rapidash: ["rapidash-galar"],
      slowpoke: ["slowpoke-galar"],
      slowbro: ["slowbro-galar"],
      farfetchd: ["farfetchd-galar"],
      weezing: ["weezing-galar"],
      "mr-mime": ["mr-mime-galar"],
      corsola: ["corsola-galar"],
      zigzagoon: ["zigzagoon-galar"],
      linoone: ["linoone-galar"],
      darumaka: ["darumaka-galar"],
      yamask: ["yamask-galar"],
      articuno: ["articuno-galar"],
      zapdos: ["zapdos-galar"],
      moltres: ["moltres-galar"],
      slowking: ["slowking-galar"],

      //Forme di Hisui
      growlithe: ["growlithe-hisui"],
      arcanine: ["arcanine-hisui"],
      voltorb: ["voltorb-hisui"],
      electrode: ["electrode-hisui"],
      typhlosion: ["typhlosion-hisui"],
      qwilfish: ["qwilfish-hisui"],
      sneasel: ["sneasel-hisui"],
      samurott: ["samurott-hisui"],
      lilligant: ["lilligant-hisui"],
      zorua: ["zorua-hisui"],
      zoroark: ["zoroark-hisui"],
      braviary: ["braviary-hisui"],
      sliggoo: ["sliggoo-hisui"],
      goodra: ["goodra-hisui"],
      avalugg: ["avalugg-hisui"],
      decidueye: ["decidueye-hisui"],

      //Forme di Paldea
      tauros: ["tauros-paldea-combat-breed", "tauros-paldea-blaze-breed", "tauros-paldea-aqua-breed"],
      wooper: ["wooper-paldea"],

      // 💥 Mega Evoluzioni
      charizard: ["charizard-mega-x", "charizard-mega-y"],
      venusaur: ["venusaur-mega", "venusaur-gmax"],
      blastoise: ["blastoise-mega", "blastoise-gmax"],
      alakazam: ["alakazam-mega"],
      gengar: ["gengar-mega", "gengar-gmax"],
      kangaskhan: ["kangaskhan-mega"],
      pinsir: ["pinsir-mega"],
      gyarados: ["gyarados-mega"],
      aerodactyl: ["aerodactyl-mega"],
      mewtwo: ["mewtwo-mega-x", "mewtwo-mega-y"],
      ampharos: ["ampharos-mega"],
      scizor: ["scizor-mega"],
      heracross: ["heracross-mega"],
      houndoom: ["houndoom-mega"],
      tyranitar: ["tyranitar-mega"],
      blaziken: ["blaziken-mega"],
      gardevoir: ["gardevoir-mega"],
      mawile: ["mawile-mega"],
      aggron: ["aggron-mega"],
      medicham: ["medicham-mega"],
      manectric: ["manectric-mega"],
      banette: ["banette-mega"],
      absol: ["absol-mega"],
      garchomp: ["garchomp-mega"],
      lucario: ["lucario-mega"],
      abomasnow: ["abomasnow-mega"],
      beedrill: ["beedrill-mega"],
      pidgeot: ["pidgeot-mega"],
      steelix: ["steelix-mega"],
      sceptile: ["sceptile-mega"],
      swampert: ["swampert-mega"],
      sableye: ["sableye-mega"],
      sharpedo: ["sharpedo-mega"],
      altaria: ["altaria-mega"],
      glalie: ["glalie-mega"],
      salamence: ["salamence-mega"],
      metagross: ["metagross-mega"],
      lopunny: ["lopunny-mega"],
      gallade: ["gallade-mega"],
      audino: ["audino-mega"],
      diancie: ["diancie-mega"],

      // 🌟 Forme Gigamax
      charizard: ["charizard-gmax"],
      butterfree: ["butterfree-gmax"],
      pikachu: ["pikachu-gmax"],
      machamp: ["machamp-gmax"],
      kingler: ["kingler-gmax"],
      lapras: ["lapras-gmax"],
      eevee: ["eevee-gmax"],
      snorlax: ["snorlax-gmax"],
      garbodor: ["garbodor-gmax"],
      melmetal: ["melmetal-gmax"],
      rillaboom: ["rillaboom-gmax"],
      cinderace: ["cinderace-gmax"],
      inteleon: ["inteleon-gmax"],
      corviknight: ["corviknight-gmax"],
      orbeetle: ["orbeetle-gmax"],
      drednaw: ["drednaw-gmax"],
      coalossal: ["coalossal-gmax"],
      flapple: ["flapple-gmax"],
      appletun: ["appletun-gmax"],
      sandaconda: ["sandaconda-gmax"],
      toxtricity: ["toxtricity-amped-gmax", "toxtricity-low-key-gmax"],
      centiskorch: ["centiskorch-gmax"],
      hatterene: ["hatterene-gmax"],
      grimmsnarl: ["grimmsnarl-gmax"],
      alcremie: ["alcremie-gmax"],
      copperajah: ["copperajah-gmax"],
      duraludon: ["duraludon-gmax"],
      urshifu: ["urshifu-single-strike-gmax", "urshifu-rapid-strike-gmax"],

      terapagos: ["terapagos-terastal", "terapagos-stellar"]
    };

    //************************
    //input per la get pokemon-species (deve avere il nome senza aggiunte di forme)
    
    //CHARIZARD
    if(inputPkm.toLowerCase() === "charizard-mega-x" || inputPkm.toLowerCase() === "charizard-mega-y"){
      inputPkm = "charizard";
    }
    //DEOXYS
    if(inputPkm.toLowerCase() === "deoxys"){
      inputPkmSprite = "deoxys-normal";
    }
    //SHAYMIN
    if(inputPkm.toLowerCase() === "shaymin" || inputPkm.toLowerCase() === "shaymin-land"){
      inputPkmSprite = "shaymin-land";
    }
    //GIRATINA
    if(inputPkm.toLowerCase() === "giratina"){
      inputPkmSprite = "giratina-altered";
    }
    //DARMANITAN
    if(inputPkm.toLowerCase() === "darmanitan"){
      inputPkmSprite = "darmanitan-standard";
    }
    //BASCULIN
    if(inputPkm.toLowerCase() === "basculin"){
      inputPkmSprite = "basculin-red-striped";
    }
    //LYCANROC
    if(inputPkm.toLowerCase() === "lycanroc"){
      inputPkmSprite = "lycanroc-midday";
    }
    //URSHIFU
    if(inputPkm.toLowerCase() === "urshifu"){
      inputPkmSprite = "urshifu-single-strike";
    }
    //TOXTRICITY
    if(inputPkm.toLowerCase() === "toxtricity"){
      inputPkmSprite = "toxtricity-amped";
    }
    //INDEEDEED
    if(inputPkm.toLowerCase() === "indeedee"){
      inputPkmSprite = "indeedee-male";
    }
    //ZYGARDE
    if(inputPkm.toLowerCase() === "zygarde"){
      inputPkmSprite = "zygarde-50";
    }
    //MEOWSTIC
    if(inputPkm.toLowerCase() === "meowstic"){
      inputPkmSprite = "meowstic-male";
    }
    //MORPEKO
    if(inputPkm.toLowerCase() === "morpeko"){
      inputPkmSprite = "morpeko-full-belly";
    }
    //OINKOLOGNE
    if(inputPkm.toLowerCase() === "oinkologne"){
      inputPkmSprite = "oinkologne-male";
    }
    //KELDEO
    if(inputPkm.toLowerCase() === "keldeo"){
      inputPkmSprite = "keldeo-ordinary";
    }
    //MELOETTA
    if(inputPkm.toLowerCase() === "meloetta"){
      inputPkmSprite = "meloetta-aria";
    }

    //input per la get pokemon (deve avere il nome della forma precisa)
    for (const base in formAliases) {
      if (formAliases[base].includes(inputPkm.toLowerCase())) {
        inputPkm = base;
      }
    }
    //************************

    const pkmData = await getFetchData(inputPkm); //pokemon-species
    const pkmSpritesData = await getFetchDataSprites(inputPkmSprite); //pokemon

    let numPrec = (pkmData.id)-1;
    let numNext = (pkmData.id)+1;
    if(pkmData.id == 1){
      numPrec = 1025;
    }
    if(pkmData.id == 1025){
      numNext = 1;
    }

    const pkmPrecData = await getFetchData(numPrec);
    const pkmNextData = await getFetchData(numNext);
    const pkmSpritePrecData = await getFetchDataSprites(numPrec);
    const pkmSpriteNextData = await getFetchDataSprites(numNext);

    //prendo l'url per la linea evolutiva del pokemon e faccio la chiamata
    const evoPkmRes = await fetch(pkmData.evolution_chain.url);
    const evoPkmData = await evoPkmRes.json();

    //scansiono l'albero evolutivo
    let evolutionLine = []; //mi salvo in questo array tutta la linea evolutiva del pokemon inserito
    function traverse(chain) {
        evolutionLine.push(chain.species.name); //aggiunge il nome corrente all'array
        chain.evolves_to.forEach(evo => traverse(evo)); //ricorsione sulle evoluzioni
    }
    traverse(evoPkmData.chain);
    //rimuovo il Pokémon richiesto dall'array)
    evolutionLine = evolutionLine.filter(name => name !== inputPkm.toLowerCase()); //la catena evolutiva ha i nomi sempre in minuscolo mentre a me possono arrivare anche nomi in maiuscolo da input
    
    let formsList = []; //mi salvo qui tutte le forme (mega, gmax, tera e regionali)
    pkmData.varieties.forEach(form => {
      const name = form.pokemon.name;
      //Salta la forma base
      if (form.is_default) return;
      //Tengo solo le forme speciali che mi interessano
      const isValid = /(alola|galar|hisui|paldea|mega|gmax|tera|primal|origin|sky|zygarde|complete|zen)/.test(name);
      const isCapForm = name.includes('cap');
      if (isValid && !isCapForm) {
        formsList.push({
          name: name,
          url: form.pokemon.url //da usare per prendere lo sprite
        });
      }
    });

    getEvolutionDetails(evolutionLine);
    getFormsDetails(formsList);

    //prendo i valori che mi servono per il pkm corrente
    const {
        names, //è un array che contiene all'interno tutti i nomi in base alla lingua
        is_legendary: leggendario,
        is_mythical: mitico,
        id: numero,
        generation,
        flavor_text_entries, //descrizione pokemon
    } = pkmData;

    //prendo i valori che mi servono per il pkm precedente
    const {
        id: numPrecId,
    } = pkmPrecData;
    
    //prendo i valori che mi servono per il pkm successivo
    const {
        id: numNextId,
    } = pkmNextData;

    //Cerco dentro l’array names il primo elemento n che ha la proprietà language.name uguale a 'it' (cioè italiano)
    //?.name è l’optional chaining, cioè: Se l’oggetto trovato non è undefined, accede alla sua proprietà name. Se invece è undefined (non trovato), non genera errore e restituisce undefined
    const nomePrec = pkmPrecData.names.find(p => p.language.name === 'it')?.name || pkmPrecData.name;
    const nomeNext = pkmNextData.names.find(s => s.language.name === 'it')?.name || pkmNextData.name;

    const itaDescription = flavor_text_entries.find(entry => entry.language.name === "it");
    const engDescription = flavor_text_entries.find(entry => entry.language.name === "en");
    const descrizione = itaDescription?.flavor_text || engDescription?.flavor_text; //se quella ITA non è disponibile prende quella ENG
    descrizione.replace(/[\f\n\r]/g, ' ').trim();
  
    //salvo i nomi prec e next nelle variabili globali
    nomePrecPkm = nomePrec;
    nomeNextPkm = nomeNext;

    const generazione = formatGeneration(generation.name);

    //setto nomi pkm
    pkmTxt.textContent = inputPkmSprite.toUpperCase();
    pkmPrecTxt.textContent = nomePrec.toUpperCase();
    pkmNextTxt.textContent = nomeNext.toUpperCase();

    //setto id pkm
    if(numero<10){
      pkmId.textContent = '#000'+numero;
    } else if(numero<100){
      pkmId.textContent = '#00'+numero;
    } else if(numero<1000){
      pkmId.textContent = '#0'+numero;
    } else{
      pkmId.textContent = '#'+numero;
    }

    //setto id pkm precedente
    if(numPrecId<10){
      pkmPrecId.textContent = '#000'+numPrecId;
    } else if(numPrecId<100){
      pkmPrecId.textContent = '#00'+numPrecId;
    } else if(numPrecId<1000){
      pkmPrecId.textContent = '#0'+numPrecId;
    } else{
      pkmPrecId.textContent = '#'+numPrecId;
    }

    //setto id pkm successivo
    if(numNextId<10){
      pkmNextId.textContent = '#000'+numNextId;
    } else if(numNextId<100){
      pkmNextId.textContent = '#00'+numNextId;
    } else if(numNextId<1000){
      pkmNextId.textContent = '#0'+numNextId;
    } else{
      pkmNextId.textContent = '#'+numNextId;
    }

    pkmGen.textContent = generazione;
    pkmDescr.textContent = descrizione;

    if (leggendario || mitico) {
      legendaryIcon.style.display = 'inline-block'; // o 'block' a seconda del layout
    } else {
      legendaryIcon.style.display = 'none';
    }

    // Estraggo tipi
    const tipi = pkmSpritesData.types.map(t => t.type.name);
    //svuoto il contenitore ogni volta prima di caricare quelli nuovi
    pkmTypeContainer.innerHTML = '';
    //itero l'array dei tipi e aggiungo al container le immagini
    tipi.forEach(tipo => {
      const typeImg = `
        <img class="pkm-type-img" src="/pokedex/assets/type/${tipo}.png">
      </img>
      `;
      pkmTypeContainer.insertAdjacentHTML('beforeend', typeImg);
    });

    // Estraggo sprites pkm corrente (sprites è un array globale)
    sprites = {
      front: pkmSpritesData.sprites.front_default,
      back: pkmSpritesData.sprites.back_default,
      frontShiny: pkmSpritesData.sprites.front_shiny,
      backShiny: pkmSpritesData.sprites.back_shiny,
    };

    // Estraggo sprite pkm precedente
    const spritePrec = pkmSpritePrecData.sprites.front_default;
    
    // Estraggo sprite pkm successivo
    const spriteNext = pkmSpriteNextData.sprites.front_default;
    
    pkmSpriteBack.style.display = ""; //riattivo sempre
    pkmSpriteBack.style.display = "";
    pkmSpriteFront.src = sprites.front;
    pkmSpriteBack.src = sprites.back;
    pkmSpritePrec.src = spritePrec;
    pkmSpriteNext.src = spriteNext;

    pkmSpriteFront.onerror = () => {
      pkmSpriteBack.style.display = "none";
    };

    pkmSpriteBack.onerror = () => {
      pkmSpriteBack.style.display = "none";
    };

    showDisplaySection(pkmInfoSection);
}

// formatto il nome della generazione
function formatGeneration(genApiName) {
  const generationMap = {
    "generation-i": "Prima generazione",
    "generation-ii": "Seconda generazione",
    "generation-iii": "Terza generazione",
    "generation-iv": "Quarta generazione",
    "generation-v": "Quinta generazione",
    "generation-vi": "Sesta generazione",
    "generation-vii": "Settima generazione",
    "generation-viii": "Ottava generazione",
    "generation-ix": "Nona generazione",
  };

  return generationMap[genApiName] || genApiName;
}

function updateSprites(sprites, isShiny){
  pkmSpriteFront.style.display = "";
  pkmSpriteBack.style.display = "";

  if(isShiny){
    pkmSpriteFront.src = sprites.frontShiny;
    pkmSpriteBack.src = sprites.backShiny;
  } else{
    pkmSpriteFront.src = sprites.front;
    pkmSpriteBack.src = sprites.back;
  }

  pkmSpriteFront.onerror = () => {
    pkmSpriteFront.style.display = "none";
  };

  pkmSpriteBack.onerror = () => {
    pkmSpriteBack.style.display = "none";
  };

}

//riceve un array con all'interno i nomi della linea evolutiva del pkm selezionato senza il pkm corrente
async function getEvolutionDetails(evolutions){
  const evoDetails = [];
  pkmEvoContainer.innerHTML = ''; //svuoto contenitore esterno
  
  for (const name of evolutions){ //itero gli elementi dell'array che sono i nomi della catena evolutiva
    try{
      //Info base del Pokémon
      const pkmnData = await getFetchDataSprites(name);
      const id = pkmnData.id;
      const types = pkmnData.types.map(t => t.type.name); // ["fire", "flying", ...]
      const sprite = pkmnData.sprites.front_default;
      
      //Species per nome ITA e link evoluzioni
      const pkmSpecies = await getFetchData(name);
      const italianNameObj = pkmSpecies.names.find(n => n.language.name === "it");
      const italianName = italianNameObj ? italianNameObj.name : name;

      const evoChainUrl = pkmSpecies.evolution_chain.url;

      //Trova metodo evolutivo (chi lo fa evolvere e come)
      const evoRes = await fetch(evoChainUrl);
      const evoData = await evoRes.json();

      let evolutionMethod = "Base form";

      function findEvolutionDetails(chain, childName, methodSoFar = null) {
          for (const evo of chain.evolves_to) {
              if (evo.species.name === childName) {
                  const details = evo.evolution_details[0];
                  if (details) {
                      let method = details.trigger.name;
                      if (details.min_level !== null)
                          method += ` at lv. ${details.min_level}`;
                      else if (details.item)
                          method += ` ${details.item.name}`;
                      return method;
                  }
                  return "Unknown method";
              } else {
                  const deeper = findEvolutionDetails(evo, childName);
                  if (deeper) return deeper;
              }
          }
          return null;
      }
      const evoMethod = findEvolutionDetails(evoData.chain, name);
      if (evoMethod) evolutionMethod = evoMethod;

      //salvo tutto
      evoDetails.push({
          name: italianName,
          pokedexId: id,
          types: types,
          sprite: sprite,
          evolutionMethod: evolutionMethod
      });

    } catch (err) {
        console.error(`Errore su ${name}:`, err);
    }
  }

  //svuoto i contenitori ogni volta prima di caricare quelli nuovi
  pkmEvoContainer.innerHTML = ''; //contenitore esterno

  evoDetails.forEach(evo => {
    //Creo un nuovo contenitore interno
    const pkmEvolutionsInfo = document.createElement('div');
    pkmEvolutionsInfo.classList.add('pkm-evolutions', 'btn-evo');

    pkmEvolutionsInfo.addEventListener('click', () => {
      const fakeInput = document.createElement('input');
      fakeInput.value = evo.name;
      shinyButton.classList.remove('active');
      isShiny = false;
      pkmInput.value = '';
      pkmInput.blur();  //toglie il focus dal campo input
      suggestionBox.innerHTML = ''; //nascone il box suggerimento
      updatePokemonInfo(fakeInput);
    });

    const datiElem = `
      <h4 class="pkm-evo-name">${evo.name.toUpperCase()}</h4>
      <h5 class="pkm-evo-id">#${evo.pokedexId.toString().padStart(4, '0')}</h5> 
      <img class="pkm-evo-img" src="${evo.sprite}">
      <h5 class="pkm-evo-metod">(${evo.evolutionMethod})</h5>
    `
    pkmEvolutionsInfo.insertAdjacentHTML('beforeend', datiElem);  //insert... aggiunge una stringa come elemento DOM
    
    evo.types.forEach(tipo => {
      const typeElem = `<img class="pkm-evo-type-img" src="/pokedex/assets/type/${tipo}.png">`;
      pkmEvolutionsInfo.insertAdjacentHTML('beforeend', typeElem);
    });
    
    pkmEvoContainer.appendChild(pkmEvolutionsInfo); //appendChild aggiunge un elemento DOM
  });
}

//riceve un array con all'interno i nomi delle forme regionali, mega, gigamax e teracristal
async function getFormsDetails(forms) {
  
  const formDetails = [];
  for (const name of forms) {
    
    try {
      //Info base del Pokémon
      const formData = await getFetchDataSprites(name.name);
      
      ////salvo le informazioni che mi servono
      formDetails.push({
        name: formData.name,
        sprite: formData.sprites.front_default,
        types: formData.types.map(t => t.type.name)
      });

    } catch (err) {
      console.warn(`Errore nel recuperare dati per ${name.name}`, err);
    }
  }

  //svuoto i contenitori ogni volta prima di caricare quelli nuovi
  pkmFormContainer.innerHTML = ''; //contenitore esterno

  formDetails.forEach(form => {
    //Creo un nuovo contenitore interno
    const pkmFormInfo = document.createElement('div');
    pkmFormInfo.classList.add('pkm-form', 'btn-form');

    pkmFormInfo.addEventListener('click', () => {
      const fakeInput = document.createElement('input');
      fakeInput.value = form.name;
      shinyButton.classList.remove('active');
      isShiny = false;
      pkmInput.value = '';
      pkmInput.blur();  //toglie il focus dal campo input
      suggestionBox.innerHTML = ''; //nascone il box suggerimento
      updatePokemonInfo(fakeInput);
    });
    
    const datiElem = `
      <h4 class="pkm-form-name">${form.name.toUpperCase()}</h4>
      <img class="pkm-form-img" src="${form.sprite}">
    `
    pkmFormInfo.insertAdjacentHTML('beforeend', datiElem);  //insert... aggiunge una stringa come elemento DOM
    
    form.types.forEach(tipo => {
      const typeElem = `<img class="pkm-form-type-img" src="/pokedex/assets/type/${tipo}.png">`;
      pkmFormInfo.insertAdjacentHTML('beforeend', typeElem);
    });
    
    pkmFormContainer.appendChild(pkmFormInfo); //appendChild aggiunge un elemento DOM
  });

}

function showDisplaySection(section){
    // Nasconde tutte le sezioni
    [pkmInfoSection, pkmEvoInfoSection, searchPkmSection, errorSection]
        .forEach (section => section.style.display = 'none')
    
    // Mostra la sezione desiderata
    section.style.display = 'flex';

    // Se la sezione è pkmInfoSection, mostra anche pkmEvoInfoSection
    if (section === pkmInfoSection) {
        pkmEvoInfoSection.style.display = 'flex';
    }
}