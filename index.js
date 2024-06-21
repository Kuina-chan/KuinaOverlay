import WebSocketManager from './deps/socket.js';

const socket = new WebSocketManager('127.0.0.1:24050');

const cache = {};

let Key1Cont = document.getElementById('Key1Cont');
let Key2Cont = document.getElementById('Key2Cont');
let Mouse1Cont = document.getElementById('Mouse1Cont');
let Mouse2Cont = document.getElementById('Mouse2Cont');
let playingPPSS;
let pp_text;

let k1 = new KeyOverlay('k1', 'k1Tiles', { speed: 0.2, keyTextId: "k1Text", keyNameId: "key1"}),
    k2 = new KeyOverlay('k2', 'k2Tiles', { speed: 0.2, keyTextId: "k2Text", keyNameId: "key2"}),
    m1 = new KeyOverlay('m1', 'm1Tiles', { speed: 0.2, keyTextId: "m1Text", keyNameId: "key3"}),
    m2 = new KeyOverlay('m2', 'm2Tiles', { speed: 0.2, keyTextId: "m2Text", keyNameId: "key4"});

socket.api_v2(({ play, beatmap, state, performace, files, folders }) => {
    try {

    //playing PP
    //accuracy calculation
    // const c300 = play.hits[300];
    // const c100 = play.hits[100];
    // const c50 = play.hits[50];
    // const miss = play.hits[0];

    let replay_acc = null;
    let replayAccuracyCalc = resultsScreen.accuracy;
    const replayAccuracyData = axios.get(`http://127.0.0.1:24050/api/calculate/pp?acc=${replayAccuracyCalc}&mods=${play.mods.number}`).then((response) => {
        replay_acc = response.replayAccuracyData;
    });

    

    //PP ingame

 
        
    //simulate(objecthit, play.mods.number)

    //map info
    title.innerHTML = beatmap.artist + " - " + beatmap.title;
    diff.innerHTML = beatmap.version;

    folders.beatmap = folders.beatmap.replace(/#/g, "%23").replace(/%/g, "%25").replace(/\\/g, "/").replace(/'/g, "%27").replace(/ /g, "%20");
    mapCont.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('http://127.0.0.1:24050/files/beatmap/${folders.beatmap}/${files.background}')`;

    OD.innerHTML = `OD: ${beatmap.stats.od.converted}`;
    AR.innerHTML = `AR: ${beatmap.stats.ar.converted}`;
    HP.innerHTML = `HP: ${beatmap.stats.hp.converted}`;
    CS.innerHTML = `CS: ${beatmap.stats.cs.converted}`;
    SR.innerHTML = `★ ${beatmap.stats.stars.total}`;




    //hit info
    h100.innerHTML = play.hits[100];
    h50.innerHTML = play.hits[50];
    h0.innerHTML = play.hits[0];
    hSB.innerHTML = play.hits.sliderBreaks;

    if (state.number === 2){

        accInfo.style.transform = `translateX(0)`
        if (play.hits[100] > 0){
            h100Cont.style.transform = `translateX(0)`

        } else {h100Cont.style.transform = `translateX(-200px)`};

        if (play.hits[50] > 0){
            h50Cont.style.transform = `translateX(0)`
        } else {h50Cont.style.transform = `translateX(-200px)`};

        if (play.hits[0] > 0){
            h0Cont.style.transform = `translateX(0)`
        } else {h0Cont.style.transform = `translateX(-200px)`};

        if (play.hits.sliderBreaks > 0){
            hSBCont.style.transform = `translateX(0)`
        } else {hSBCont.style.transform = `translateX(-200px)`};
    } else {accInfo.style.transform = `translateX(-200px)`};
    
    let totalobject = play.hits[300] + play.hits[100] + play.hits[50] + play.hits[0];
    simulate(totalobject, play.mods.number);

    pp.innerHTML = play.pp.current.toFixed(0);
    pp100.innerHTML = performace.accuracy[100];
    modsUsed.innerHTML = `Mods: ${play.mods.name}`

    if (state.number == 2) {
        ppM.style.display = `none`
        ppG.style.display = `initial`
        pp_text = play.pp.current.toFixed(0) + " / " + playingPPSS + "pp";
        ppCont.style.width = 20 + (pp_text.length * 16) + 'px'
    }
    else if (state.number == 7 || state.number == 14) {
        pp_text = play.pp.current.toFixed(0);
        ppFC.innerHTML = playingPPSS;
    } else if (state.number == 5){

    }
    else {
        ppM.style.display = `initial`;
        ppG.style.display = `none`;
        ppCont.style.width = 20 + (pp_text.length * 20) + 'px';
    };

    //mod combination
    if (play.mods.name === "") {
        modsUsed.style.opacity = 0;
    }
    else {
        modsUsed.style.opacity = 1;
    }

    //Reading BPM from map file
    const cache_beatmap = ' ';

    if (cache_beatmap !== beatmap.checksum) {
        cache_beatmap == beatmap.checksum;

        MapReader(
            `http://127.0.0.1:24050/files/beatmap/${folders.beatmap}/${files.beatmap}`,
            beatmap.time.live
        );
        async function MapReader(path, currentTime) {
            const reader = await fetch(path, { cache: "no-store" });
            const text = await reader.text();
            const matchTimingPoints = text
                .match(/\[TimingPoints\](\r?)\n(-?[0-9]+,-?[0-9]+(\.[0-9]+)?,[0-9]+,[0-9]+,[0-9]+,[0-9]+,(0|1),[0-9]+(\r)?\n)*/gm)
                .shift();

            const timingPointsList = matchTimingPoints.match(/(-?[0-9]+,-?[0-9]+(\.[0-9]+)?,[0-9]+,[0-9]+,[0-9]+,[0-9]+,1,[0-9]+)/g).map((point) => {
                const params = point.split(",");
                return {
                    time: parseInt(params[0]),
                    BPM: 60000 / parseFloat(params[1]),
                }; 
            });

            if (play.mods.name.search("DT") !== -1 || play.mods.name.search("NC") !== -1) {
                bpm.innerText = timingPointsList.findLast((point) => point.time <= currentTime)?.BPM * 1.5 ?? 0.0;
            }
            else if (play.mods.name.search("HT") !== -1) {
                bpm.innerText = timingPointsList.findLast((point) => point.time <= currentTime)?.BPM * 0.75 ?? 0.0;
            }
            else {
                bpm.innerText = timingPointsList.findLast((point) => point.time <= currentTime)?.BPM ?? 0.0;
            };

            if (state.number == 2) {
                bpmCont.style.translate = `translateX(0px)`
            } else {
                bpmCont.style.translate = `translateX(200px)`
            };

        };

    };

    async function simulate(currentobject, modsnumber) {
    try {
        let simulate = null
        const data = await axios.get(`http://127.0.0.1:24050/api/calculate/pp?passedObjects=${currentobject}&mods=${modsnumber}`).then((response) => {
            simulate = response.data
        });
        playingPPSS = simulate.performance.pp.toFixed(0);
    } catch (error) {
        console.error(error);
    }
}

    } catch (error) {
        console.log(error);
    };
});
//key overlay
socket.api_v2_precise((data) => {
    try {

    k1.update(data.keys.k1, "var(--keyColor)", "var(--keyTap)");
    k2.update(data.keys.k2, "var(--keyColor)", "var(--keyTap)");
    m1.update(data.keys.m1, "var(--keyColor)", "var(--keyTap)");
    m2.update(data.keys.m2, "var(--keyColor)", "var(--keyTap)");

    } catch (err) {
    console.log(err);
  };
});
